const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { normalize, renderResume, defaults, sampleContent } = require('../services/resumeBuilder/template');
const { primaryPipeline } = require('../services/resumeBuilder/primary');
const data = () => ({ title: 'My resume', content: sampleContent(), settings: structuredClone(defaults), template: 'modern' });
const owners = { a: { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', role: 'Candidate', userId: 'a', email: 'a@example.test' }, b: { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', role: 'Candidate', userId: 'b', email: 'b@example.test' } };
let records = [], seq = 0, promotion = null, uploadError = false;
const match = (r, q) => Object.entries(q).every(([k, v]) => String(r[k]) === String(v));
const resumes = {
 find(q) { return { sort() { return { lean: async () => records.filter(r => match(r, q)) }; } }; },
 findOne(q) { return { lean: async () => records.find(r => match(r, q)) || null }; },
 async create(d) { const r = { ...d, _id: (++seq).toString(16).padStart(24, '0'), revision: 1 }; records.push(r); return r; },
 async findOneAndUpdate(q, u) { const r = records.find(r => match(r, q)); if (!r) return null; Object.assign(r, u.$set); r.revision++; return { ...r }; },
 async deleteOne(q) { const r = records.find(r => match(r, q)); records = records.filter(e => e !== r); return { deletedCount: r ? 1 : 0 }; }
};
const candidate = {
 async findOne(q) { return Object.values(owners).find(u => q.email.test(u.email)); },
 async updateOne(q, pipeline) { promotion = { q, pipeline }; return { matchedCount: 1 }; }
};
const original = Module._load;
Module._load = function(id, ...args) {
 if (id === '../models/resumeDocument') return resumes;
 if (id === '../models/candidateModel') return candidate;
 if (id === '../models/employerModel') return { findOne: async () => ({ _id: 'e', role: 'Employer' }) };
 if (id === '../services/resumeBuilder/pdf') return { generatePdf: async () => Buffer.from('%PDF-1.7 test') };
 if (id === 'aws-sdk') return { S3: class { upload() { return { promise: async () => { if (uploadError) throw new Error('Simulated S3 failure'); return { Location: 'https://bucket.example.test/resume.pdf' }; } }; } } };
 return original.call(this, id, ...args);
};
const router = require('../router/resumeBuilder');
Module._load = original;
let server, base;
before(async () => {
 process.env.REFRESH_KEY = 'resume-test-key-only'; process.env.AWS_BUCKET_NAME_IMAGE = 'test-bucket';
 const app = express(); app.use(express.json()); app.use('/resume', router);
 server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r)); base = `http://127.0.0.1:${server.address().port}/resume`;
});
after(() => new Promise(r => server.close(r)));
async function request(method, path = '', body, user = 'a') {
 const token = user ? jwt.sign({ email: `${user}@example.test`, role: user === 'employer' ? 'Employer' : 'Candidate' }, process.env.REFRESH_KEY, { expiresIn: 60 }) : '';
 return fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body) });
}
test('template validation rejects unknown styling and oversized content; escapes HTML', () => {
 const d = data(); d.content.personal.name = '<img src=x onerror=alert(1)>'; d.content.summary = '**Bold**\n- Safe bullet';
 const html = renderResume(d); assert.ok(html.includes('&lt;img')); assert.ok(!html.includes('<img')); assert.ok(html.includes('<strong>Bold</strong>'));
 assert.throws(() => normalize({ ...d, template: 'evil' }));
 assert.throws(() => normalize({ ...d, settings: { ...defaults, accent: 'red; } script' } }));
 assert.throws(() => normalize({ ...d, content: { ...d.content, summary: 'x'.repeat(12001) } }));
 assert.throws(() => normalize({ ...d, settings: { ...defaults, order: ['summary'] } }));
});
test('hidden sections and entries do not appear in exported HTML', () => {
 const d = data(); d.settings.hidden = ['skills']; d.content.experience[0].hidden = true;
 const html = renderResume(d); assert.ok(!html.includes('Northstar Labs')); assert.ok(!html.includes('<h2>Skills</h2>'));
});
test('frontend and backend use exactly the same renderer', () => {
 assert.equal(fs.readFileSync(require('path').join(__dirname, '../../client/src/Pages/ResumeBuilder/resumeTemplate.js'), 'utf8').replace('export {', 'module.exports = {'), fs.readFileSync(require('path').join(__dirname, '../services/resumeBuilder/template.js'), 'utf8'));
});
test('primary pipeline supplies CV Manager subdocument IDs and updates all primary fields atomically', () => {
 const p = primaryPipeline('https://example.test/a.pdf'); const s = p[0].$set;
 assert.equal(s.resume.$literal, 'https://example.test/a.pdf'); assert.equal(s.isResumeUploaded, true);
 assert.ok(s.allResumes.$concatArrays[0][0]._id); assert.equal(s.allResumes.$concatArrays[0][0].type, 'Primary');
 assert.equal(s.allResumes.$concatArrays[1].$map.in.$mergeObjects[1].type, 'Secondary');
});
test('auth, ownership, revisions, download and explicit primary promotion', async () => {
 assert.equal((await request('GET', '', undefined, null)).status, 401);
 assert.equal((await request('GET', '', undefined, 'employer')).status, 403);
 const created = await request('POST', '', { ...data(), owner: owners.b._id }); assert.equal(created.status, 201);
 const d = (await created.json()).resume; assert.equal(d.owner, owners.a._id);
 assert.equal((await request('GET', `/${d._id}`, undefined, 'b')).status, 404);
 assert.equal((await request('PATCH', `/${d._id}`, { ...data(), revision: 1 }, 'b')).status, 404);
 assert.equal((await request('POST', `/${d._id}/pdf`, { revision: 1 }, 'b')).status, 404);
 assert.equal((await request('POST', `/${d._id}/use`, { revision: 1 }, 'b')).status, 404);
 assert.equal((await request('DELETE', `/${d._id}`, { revision: 1 }, 'b')).status, 404);
 assert.equal((await request('PATCH', `/${d._id}`, { ...data(), revision: 0 })).status, 409);
 assert.equal((await request('PATCH', `/${d._id}`, { ...data(), revision: 1 })).status, 200);
 assert.equal((await request('POST', `/${d._id}/pdf`, { revision: 1 })).status, 409);
 const pdf = await request('POST', `/${d._id}/pdf`, { revision: 2 }); assert.equal(pdf.status, 200); assert.match(pdf.headers.get('content-type'), /application\/pdf/); assert.equal(promotion, null);
 uploadError = true; assert.equal((await request('POST', `/${d._id}/use`, { revision: 2 })).status, 500); assert.equal(promotion, null);
 uploadError = false; assert.equal((await request('POST', `/${d._id}/use`, { revision: 2 })).status, 200); assert.equal(promotion.q._id, owners.a._id);
 assert.equal((await request('POST', `/${d._id}/duplicate`)).status, 201);
 assert.equal((await request('DELETE', `/${d._id}`, { revision: 1 })).status, 409);
 assert.equal((await request('DELETE', `/${d._id}`, { revision: 2 })).status, 200);
});
