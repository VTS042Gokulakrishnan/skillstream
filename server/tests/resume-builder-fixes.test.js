const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hydrateResume, normalize, renderResume, parseResumeDate, formatResumeDate, dateRangeError, defaults, sampleContent } = require('../services/resumeBuilder/template');
const { resolveChrome } = require('../services/resumeBuilder/browser');
const doc = () => ({ title:'Test', template:'modern', content:sampleContent(), settings:structuredClone(defaults) });
test('omitted Mongo objects and arrays reopen and render safely', () => {
 const d=doc(); delete d.settings.headings; delete d.content.projects; delete d.content.personal.phone;
 const restored=hydrateResume(d); assert.deepEqual(restored.settings.headings,{}); assert.deepEqual(restored.content.projects,[]); assert.equal(restored.content.personal.phone,''); assert.ok(renderResume(d).includes('<h2>Summary</h2>'));
 const Model=require('../models/resumeDocument'); assert.equal(Model.schema.options.minimize,false);
});
test('calendar validation and precision preserve legacy dates', () => {
 assert.equal(parseResumeDate('2024-02-29').canonical,'2024-02-29'); assert.equal(parseResumeDate('2023-02-29'),null);
 assert.equal(parseResumeDate('Jan 2023').canonical,'2023-01'); assert.equal(parseResumeDate('2016').precision,'year'); assert.equal(parseResumeDate('01/02/23'),null);
 assert.equal(formatResumeDate('2026-10-27'),'10/26'); assert.equal(formatResumeDate('2016'),'2016');
 assert.ok(dateRangeError({start:'2026-10-27',end:'2026-10-26'})); assert.equal(dateRangeError({start:'2026-10-27',end:'2026-10',current:false}),'');
 const d=doc(); d.content.experience[0]={...d.content.experience[0],start:'2026-10-27',end:'2025-01-01',current:true};
 assert.ok(renderResume(d).includes('10/26 - Present')); assert.equal(normalize(d).content.experience[0].current,true);
 d.content.experience[0].current=false; assert.throws(()=>normalize(d),/End date/);
});
test('browser lookup honors explicit path and finds system browsers without cache', () => {
 assert.equal(resolveChrome({env:{RESUME_CHROME_PATH:'custom'},exists:p=>p==='custom'}),'custom');
 assert.throws(()=>resolveChrome({env:{RESUME_CHROME_PATH:'missing'},exists:()=>false}),/configured PDF browser/);
 assert.equal(resolveChrome({env:{},platform:'linux',bundled:()=>'/missing',exists:p=>p==='/usr/bin/chromium'}),'/usr/bin/chromium');
 assert.throws(()=>resolveChrome({env:{},platform:'linux',bundled:()=>'/missing',exists:()=>false}),/PDF export is unavailable/);
});

