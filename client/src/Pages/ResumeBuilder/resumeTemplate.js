const templates = [
  { id: 'classic', name: 'Classic Serif', description: 'Timeless typography and crisp section rules.' },
  { id: 'modern', name: 'Modern Professional', description: 'Clean headings and a subtle blue accent.' },
  { id: 'executive', name: 'Executive', description: 'Refined typography with generous spacing.' },
  { id: 'technical', name: 'Technical', description: 'Skills and projects take priority.' },
  { id: 'graduate', name: 'Graduate', description: 'Lead with education and project experience.' },
];
const sectionNames = { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', languages: 'Languages', awards: 'Awards', volunteering: 'Volunteering' };
const order = Object.keys(sectionNames);
const defaults = { paper: 'A4', font: 'template', fontSize: 11, spacing: 1.4, margin: 16, accent: '#1769d3', order, hidden: [], headings: {} };
const blankContent = () => ({ personal: { name: '', headline: '', email: '', phone: '', location: '', website: '', linkedin: '' }, summary: '', skills: '', languages: '', experience: [], education: [], projects: [], certifications: [], awards: [], volunteering: [] });
const sampleContent = () => ({ ...blankContent(), personal: { name: 'Alex Morgan', headline: 'Frontend Developer', email: 'alex@example.com', phone: '', location: 'Chicago, IL', website: '', linkedin: '' }, summary: 'Frontend developer building accessible, responsive web applications with React and TypeScript.', skills: 'React, TypeScript, JavaScript, HTML, CSS, Git, REST APIs', experience: [{ id: 'sample1', title: 'Frontend Developer', organization: 'Northstar Labs', location: 'Chicago, IL', start: 'Jan 2023', end: 'Present', description: '- Built responsive interfaces with React and TypeScript.\n- Improved page performance through reusable components.\n- Collaborated with designers to deliver accessible experiences.', hidden: false }], education: [{ id: 'sample2', title: 'B.S. in Computer Science', organization: 'Lakeview University', start: '2016', end: '2020', description: '' }], projects: [{ id: 'sample3', title: 'Portfolio Website', organization: '', description: 'Designed and built a responsive personal portfolio.' }] });
const escape = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function inline(s) {
  return escape(s).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}
function rich(s) {
  let html = '', inList = false;
  String(s || '').split('\n').forEach(line => {
    if (/^\s*[-•]\s/.test(line)) {
      if (!inList) html += '<ul>';
      inList = true; html += `<li>${inline(line.replace(/^\s*[-•]\s/, ''))}</li>`;
    } else {
      if (inList) html += '</ul>';
      inList = false;
      if (line.trim()) html += `<p>${inline(line)}</p>`;
    }
  });
  return html + (inList ? '</ul>' : '');
}
function normalize(input) {
  const fail = (msg) => { const error = new Error(msg); error.status = 400; throw error; };
  if (!input || typeof input !== 'object') fail('Invalid resume.');
  const str = (v, max = 300) => { if (typeof v !== 'string' || v.length > max) fail('A resume field is invalid or too long.'); return v.trim(); };
  const title = str(input.title, 100);
  if (!title) fail('Give your resume a name.');
  if (!templates.some(t => t.id === input.template)) fail('Choose a valid template.');
  const raw = input.content;
  if (!raw || typeof raw !== 'object') fail('Resume content is required.');
  const content = blankContent();
  Object.keys(content.personal).forEach(k => { content.personal[k] = str(raw.personal?.[k] ?? ''); });
  ['summary', 'skills', 'languages'].forEach(k => { content[k] = str(raw[k] ?? '', 12000); });
  order.filter(k => Array.isArray(content[k])).forEach(k => {
    if (!Array.isArray(raw[k]) || raw[k].length > 40) fail('Use at most 40 entries per section.');
    content[k] = raw[k].map(e => {
      if (!e || typeof e !== 'object') fail('Invalid entry.');
      const entry = { hidden: e.hidden === true };
      ['id', 'title', 'organization', 'location', 'start', 'end', 'description'].forEach(f => { entry[f] = str(e[f] ?? '', f === 'description' ? 12000 : 300); });
      return entry;
    });
  });
  const s = input.settings || {};
  const settings = { ...defaults, headings: {} };
  if (!['A4', 'Letter'].includes(s.paper)) fail('Choose A4 or Letter.');
  settings.paper = s.paper;
  if (!['template', 'serif', 'sans'].includes(s.font)) fail('Invalid font.');
  settings.font = s.font;
  for (const [key, min, max] of [['fontSize', 10, 13], ['spacing', 1.2, 1.8], ['margin', 12, 24]]) {
    if (typeof s[key] !== 'number' || !Number.isFinite(s[key]) || s[key] < min || s[key] > max) fail('Invalid page settings.');
    settings[key] = s[key];
  }
  if (!/^#[0-9a-f]{6}$/i.test(s.accent || '')) fail('Invalid accent color.');
  settings.accent = s.accent;
  if (!Array.isArray(s.order) || s.order.length !== order.length || new Set(s.order).size !== order.length || s.order.some(k => !order.includes(k))) fail('Invalid section order.');
  settings.order = s.order;
  if (!Array.isArray(s.hidden) || s.hidden.some(k => !order.includes(k))) fail('Invalid hidden sections.');
  settings.hidden = [...new Set(s.hidden)];
  order.forEach(k => { if (s.headings?.[k]) settings.headings[k] = str(s.headings[k], 60); });
  if (JSON.stringify(content).length > 150000) fail('Resume is too large.');
  return { title, content, template: input.template, settings };
}
function renderResume(doc) {
  const { content: c, template: t, settings: s } = normalize(doc);
  const p = c.personal;
  let sections = s.order.filter(k => !s.hidden.includes(k));
  const sectionHtml = sections.map(k => {
    const value = c[k];
    let body;
    if (typeof value === 'string') body = rich(value);
    else body = value.filter(e => !e.hidden).map(e => `<article><div class="entry-title"><strong>${escape(e.title)}</strong><span>${escape([e.start, e.end].filter(Boolean).join(' - '))}</span></div><div class="organization">${escape([e.organization, e.location].filter(Boolean).join(' | '))}</div>${rich(e.description)}</article>`).join('');
    return body ? `<section><h2>${escape(s.headings[k] || sectionNames[k])}</h2>${body}</section>` : '';
  }).join('');
  const font = s.font === 'serif' || (s.font === 'template' && ['classic', 'executive'].includes(t)) ? 'Georgia, "Times New Roman", serif' : 'Arial, Helvetica, sans-serif';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><style>
    @page { size: ${s.paper}; margin: ${s.margin}mm; }
    *{box-sizing:border-box} html{background:#e9eef4}body{margin:0;color:#18212c;font:${s.fontSize}pt/${s.spacing} ${font};overflow-wrap:anywhere}
    .paper{background:white;max-width:${s.paper === 'A4' ? 210 : 215.9}mm;min-height:${s.paper === 'A4' ? 297 : 279.4}mm;margin:0 auto;padding:${s.margin}mm;}
    h1{font-size:26pt;line-height:1.15;margin:0 0 5pt;color:${t === 'classic' ? '#111' : s.accent};font-weight:700} .headline{font-size:13pt;margin:0 0 7pt}.contact{font-size:9pt;color:#364252;line-height:1.6}header{border-bottom:2px solid ${s.accent};padding-bottom:12pt;margin-bottom:15pt}h2{font-size:11pt;text-transform:uppercase;letter-spacing:.6pt;border-bottom:1px solid #bac4cf;padding-bottom:3pt;margin:15pt 0 7pt;color:${s.accent};break-after:avoid}p{margin:3pt 0 7pt}ul{padding-left:15pt;margin:4pt 0 8pt}li{margin-bottom:3pt}article{margin-bottom:11pt}.entry-title{display:flex;justify-content:space-between;gap:15pt;break-after:avoid}.entry-title strong{min-width:0}.entry-title span{font-size:9pt;flex-shrink:0;max-width:35%;text-align:right}.organization{font-size:10pt;color:#3e4a59;break-after:avoid}p,li{orphans:3;widows:3}
    .classic header,.graduate header{text-align:center}.classic header{border:0}.classic h1{color:#111}.classic h2{color:#111;border-color:#111}.classic .headline{font-style:italic}.executive h2{letter-spacing:1.3pt;margin-top:21pt}.executive header{border-bottom:1px solid #89929d}.graduate h2{background:#eef1f4;padding:5pt 7pt;border:0}.technical h2{border-bottom:1px solid ${s.accent}}@media print{html{background:white}.paper{max-width:none;min-height:0;padding:0;margin:0}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><main class="paper ${t}"><header><h1>${escape(p.name || 'Your name')}</h1>${p.headline ? `<div class="headline">${escape(p.headline)}</div>` : ''}<div class="contact">${[p.email,p.phone,p.location,p.website,p.linkedin].filter(Boolean).map(escape).join(' &nbsp; | &nbsp; ')}</div></header>${sectionHtml}</main></body></html>`;
}
export { templates, sectionNames, defaults, blankContent, sampleContent, normalize, renderResume };
