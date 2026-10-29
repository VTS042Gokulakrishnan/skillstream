const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { templates, defaults, sampleContent, normalize, renderResume } = require('../services/resumeBuilder/template');
const doc = template => ({ title: 'Resume', template, settings: structuredClone(defaults), content: sampleContent() });
test('eight templates preserve content and omit unprovided portraits', () => {
  assert.deepEqual(templates.map(t => t.id), ['classic','modern','graduate','atlantic-blue','mercury-flow','amethyst-edge','accentuated-red','atlantic-standard']);
  for (const { id } of templates) {
    const html = renderResume(doc(id));
    assert.ok(html.includes('Northstar Labs'));
    assert.ok(html.includes('Lakeview University'));
    assert.ok(!html.includes('<img'));
  }
});
test('uploaded portraits round-trip only into photo layouts and reject remote or active content', () => {
  for (const { id } of templates) {
    const d = doc(id); d.content.personal.photo = 'data:image/png;base64,aGVsbG8=';
    assert.equal(normalize(d).content.personal.photo, d.content.personal.photo);
    assert.equal(renderResume(d).includes('<img'), ['atlantic-blue','mercury-flow','accentuated-red'].includes(id));
  }
  for (const photo of ['https://example.com/photo.png', 'data:image/svg+xml;base64,aGVsbG8=', 'x'.repeat(60001)]) {
    const d = doc('atlantic-blue'); d.content.personal.photo = photo;
    assert.throws(() => normalize(d));
  }
});
test('column layouts respect hidden sections and entries; retired drafts remain readable', () => {
  for (const id of ['atlantic-blue','accentuated-red','executive','technical']) {
    const d = doc(id); d.settings.hidden = ['education']; d.content.experience[0].hidden = true;
    const html = renderResume(d);
    assert.ok(!html.includes('Lakeview University')); assert.ok(!html.includes('Northstar Labs'));
  }
});
test('client and PDF renderer stay identical', () => {
  const client = fs.readFileSync(path.join(__dirname, '../../client/src/Pages/ResumeBuilder/resumeTemplate.js'), 'utf8');
  assert.equal(client.replace('export {', 'module.exports = {'), fs.readFileSync(path.join(__dirname, '../services/resumeBuilder/template.js'), 'utf8'));
});
