import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Modal } from 'antd';
import { EditOutlined, CopyOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import ResumeDates from './ResumeDates';
import { Link } from 'react-router-dom';
import { Server } from '../../App';
import useUnsavedResume from './useUnsavedResume';
import { templates, sectionNames, defaults, blankContent, sampleContent, renderResume, hydrateResume, normalize } from './resumeTemplate';
import './ResumeBuilder.css';
import logo from '../../assets/logo-twos.png';

const base = `${Server}/api/v1/resume-builder`;
const snapshot = doc => JSON.stringify({ title: doc.title, template: doc.template, content: doc.content, settings: doc.settings });
const fresh = (template = 'modern', sample = false) => ({ title: 'Untitled resume', template, content: sample ? sampleContent() : blankContent(), settings: { ...defaults, order: [...defaults.order], hidden: [], headings: {} } });
const previewHtml = doc => { try { return renderResume({ ...doc, title: doc.title.trim() || 'Untitled resume' }); } catch (_) { return '<p>Preview unavailable. Please check your date ranges and resume fields, then try again.</p>'; } };
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function templateOrder(id) {
  const first = id === 'technical' ? ['summary', 'skills', 'experience', 'projects'] : id === 'graduate' ? ['summary', 'education', 'projects', 'experience'] : [];
  return [...first, ...defaults.order.filter(k => !first.includes(k))];
}
function Miniature({ doc }) {
  const html = useMemo(() => previewHtml(doc), [doc]);
  return <div className="rb-mini" aria-hidden="true"><iframe tabIndex={-1} title="Resume thumbnail" sandbox="" srcDoc={html} /></div>;
}
function RichInput({ value, onChange, label }) {
  const ref = useRef();
  function format(kind) {
    const el = ref.current, start = el.selectionStart, end = el.selectionEnd, text = value.slice(start, end);
    const replacement = kind === 'bullet' ? (text || 'Achievement').split('\n').map(line => `- ${line}`).join('\n') : `${kind}${text || 'text'}${kind}`;
    onChange(value.slice(0, start) + replacement + value.slice(end));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start, start + replacement.length); });
  }
  return <label className="rb-field">{label}<div className="rb-rich"><div className="rb-format"><button type="button" onClick={() => format('**')} aria-label="Bold selection"><b>B</b></button><button type="button" onClick={() => format('*')} aria-label="Italic selection"><i>I</i></button><button type="button" onClick={() => format('bullet')}>• List</button><span>Bold, italic and bullet formatting</span></div><textarea ref={ref} maxLength={12000} value={value} onChange={e => onChange(e.target.value)} rows={6} /></div></label>;
}
export default function ResumeBuilder() {
  const [resumes, setResumes] = useState([]), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState(null), [saved, setSaved] = useState('');
  const [tab, setTab] = useState('content'), [mobileTab, setMobileTab] = useState('edit'), [section, setSection] = useState('personal');
  const [templateModal, setTemplateModal] = useState(false), [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [preview, setPreview] = useState(null), [useDoc, setUseDoc] = useState(null), [deleteDoc, setDeleteDoc] = useState(null);
  const [leaveAction, setLeaveAction] = useState(null), [notice, setNotice] = useState(null), [zoom, setZoom] = useState('fit');
  const dirty = !!doc && snapshot(doc) !== saved;
  const requestLeave = action => { if (!busy) setLeaveAction(() => action); };
  useUnsavedResume(dirty || busy, requestLeave);
  const config = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  async function call(method, path = '', data, options = {}) {
    try { return (await axios({ method, url: base + path, data, ...config(), ...options })).data; }
    catch (error) {
      let message = error.response?.data?.message;
      if (error.response?.data instanceof Blob) { try { message = JSON.parse(await error.response.data.text()).message; } catch (_) {} }
      throw new Error(message || 'Unable to connect. Your edits are still here. Please try again.');
    }
  }
  async function load() {
    setLoading(true);
    try { const data = await call('get'); setResumes(data.resumes.map(hydrateResume)); }
    catch (e) { setNotice({ error: true, text: e.message }); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* initial candidate-owned list */ }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!preview) return undefined; return () => URL.revokeObjectURL(preview.url); }, [preview]);
  const html = useMemo(() => doc ? previewHtml(doc) : '', [doc]);
  const upsert = updated => setResumes(items => [hydrateResume(updated), ...items.filter(r => r._id !== updated._id)]);
  const notifyError = e => setNotice({ error: true, text: e.message });
  async function perform(action) {
    setBusy(true); setNotice(null);
    try { return await action(); } catch (e) { notifyError(e); return null; } finally { setBusy(false); }
  }
  async function persist() {
    if (!doc.title.trim()) throw new Error('Give your resume a name.');
    normalize(doc);
    if (!dirty && doc._id) return doc;
    const result = await call(doc._id ? 'patch' : 'post', doc._id ? `/${doc._id}` : '', doc);
    const restored = hydrateResume(result.resume);
    setDoc(restored); setSaved(snapshot(restored)); upsert(restored);
    return restored;
  }
  const save = () => perform(async () => { const result = await persist(); setNotice({ text: 'Resume saved.' }); return result; });
  function updateContent(key, value) { setDoc(d => ({ ...d, content: { ...d.content, [key]: value } })); }
  function updateSettings(key, value) { setDoc(d => ({ ...d, settings: { ...d.settings, [key]: value } })); }
  async function open(item) {
    await perform(async () => {
      const result = await call('get', `/${item._id}`);
      const restored = hydrateResume(result.resume);
      setDoc(restored); setSaved(snapshot(restored)); setSection('personal'); setTab('content');
    });
  }
  const exit = () => { setDoc(null); setSaved(''); setNotice(null); };
  function back() { if (dirty) requestLeave(exit); else exit(); }
  async function pdf(item, download) {
    return perform(async () => {
      const target = item || await persist();
      const blob = await call('post', `/${target._id}/pdf`, { revision: target.revision }, { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement('a'); a.href = url; a.download = `${target.title.replace(/[^a-z0-9 _-]/gi, '') || 'Resume'}.pdf`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
        setUseDoc({ doc: target, afterDownload: true });
      } else setPreview({ url, doc: target });
    });
  }
  async function useResume() {
    const target = useDoc.doc;
    const result = await perform(async () => {
      const data = await call('post', `/${target._id}/use`, { revision: target.revision });
      setUseDoc(null); setNotice({ text: data.message }); return true;
    });
    return result;
  }
  function applyTemplate() {
    if (doc) setDoc(d => ({ ...d, template: selectedTemplate }));
    else {
      const next = fresh(selectedTemplate); next.settings.order = templateOrder(selectedTemplate);
      setDoc(next); setSaved(''); setSection('personal'); setTab('content');
    }
    setTemplateModal(false);
  }
  function reorder(key, delta) {
    const order = [...doc.settings.order], index = order.indexOf(key), next = index + delta;
    if (next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]]; updateSettings('order', order);
  }
  function entry(key, id, field, value) { updateContent(key, doc.content[key].map(e => e.id === id ? { ...e, [field]: value } : e)); }
  function renderSection(key) {
    if (key === 'personal') return <div className="rb-grid">{Object.entries({ name: 'Full name', headline: 'Professional title', email: 'Email', phone: 'Phone', location: 'Location', website: 'Website', linkedin: 'LinkedIn' }).map(([field, label]) => <label className="rb-field" key={field}>{label}<input maxLength={300} value={doc.content.personal[field]} onChange={e => updateContent('personal', { ...doc.content.personal, [field]: e.target.value })} /></label>)}</div>;
    if (['summary', 'skills', 'languages'].includes(key)) return <RichInput label={sectionNames[key]} value={doc.content[key]} onChange={value => updateContent(key, value)} />;
    return <div>{doc.content[key].map((item, index) => <details className="rb-entry" key={item.id} open={undefined}>
      <summary>{item.title || `New ${sectionNames[key].toLowerCase()} entry`} {item.hidden && <small>Hidden</small>}</summary>
      <div className="rb-entry-body"><div className="rb-grid">{Object.entries({ title: key === 'education' ? 'Degree / qualification' : 'Title', organization: key === 'education' ? 'Institution' : 'Organization', location: 'Location', ...(['experience', 'projects'].includes(key) ? {} : { start: 'Start date', end: 'End date / Present' }) }).map(([field, label]) => <label className="rb-field" key={field}>{label}<input maxLength={300} value={item[field]} onChange={e => entry(key, item.id, field, e.target.value)} /></label>)}</div>
      {['experience', 'projects'].includes(key) && <ResumeDates entry={item} section={key} onChange={changes => updateContent(key, doc.content[key].map(e => e.id === item.id ? { ...e, ...changes } : e))} />}
      <RichInput label="Description" value={item.description} onChange={value => entry(key, item.id, 'description', value)} />
      <div className="rb-entry-actions"><label><input type="checkbox" checked={!item.hidden} onChange={e => entry(key, item.id, 'hidden', !e.target.checked)} /> Show on resume</label><button type="button" disabled={index === 0} onClick={() => { const entries = [...doc.content[key]]; [entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]; updateContent(key, entries); }}>Move up</button><button type="button" className="rb-danger" onClick={() => updateContent(key, doc.content[key].filter(e => e.id !== item.id))}>Remove entry</button></div></div>
    </details>)}<button type="button" disabled={doc.content[key].length >= 40} onClick={() => updateContent(key, [...doc.content[key], { id: uid(), title: '', organization: '', location: '', start: '', end: '', description: '', hidden: false }])}>+ Add entry</button></div>;
  }
  return <div className="rb-app">
    <header className="rb-brand"><Link to="/candidate-dashboard" aria-label="SkillStream dashboard"><img src={logo} alt="SkillStream" /></Link><span>Create Resume</span><Link className="rb-small-link" to="/cv-manager">CV Manager ↗</Link></header>
    {notice && <div role={notice.error ? 'alert' : 'status'} className={`rb-notice ${notice.error ? 'rb-error' : ''}`}>{notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}
    {!doc ? <main className="rb-library"><div className="rb-page-heading"><div><span className="rb-eyebrow">YOUR CAREER TOOLKIT</span><h1>My resumes</h1><p>Create, refine and choose a resume for your next opportunity.</p></div><button disabled={busy} className="rb-primary" onClick={() => { setSelectedTemplate('modern'); setTemplateModal(true); }}>+ Create resume</button></div>
      <div className="rb-library-note">Saved drafts stay here. Choose <strong>Use this resume</strong> to make a PDF your primary resume for future job applications.</div>
      {loading ? <p role="status">Loading your resumes…</p> : resumes.length === 0 ? <div className="rb-empty"><div className="rb-empty-icon">▤</div><h2>Your next opportunity starts here</h2><p>Choose from five templates and build your first resume.</p><button className="rb-primary" onClick={() => setTemplateModal(true)}>Create your first resume</button><button onClick={load}>Refresh</button></div> : <div className="rb-cards">{resumes.map(item => <article className="rb-card" key={item._id}><button className="rb-thumbnail-button" disabled={busy} onClick={() => open(item)} aria-label={`Edit ${item.title}`}><Miniature doc={item} /></button><div className="rb-card-content"><h2>{item.title}</h2><p>{templates.find(t => t.id === item.template)?.name} · Updated {new Date(item.updatedAt).toLocaleDateString()}</p><div className="rb-card-actions"><button disabled={busy} onClick={() => pdf(item, false)}>Preview</button><button className="rb-primary" disabled={busy} onClick={() => setUseDoc({ doc: item })}>Use this resume</button></div><div className="rb-card-tools"><button disabled={busy} title="Edit resume" onClick={() => open(item)}><EditOutlined aria-hidden="true" /><span>Edit</span></button><button disabled={busy} onClick={() => perform(async () => { const result = await call('post', `/${item._id}/duplicate`); upsert(result.resume); })} title="Duplicate resume"><CopyOutlined aria-hidden="true" /><span>Duplicate</span></button><button disabled={busy} title="Download PDF" onClick={() => pdf(item, true)}><DownloadOutlined aria-hidden="true" /><span>Download PDF</span></button><button className="rb-danger" disabled={busy} title="Delete saved resume" onClick={() => setDeleteDoc(item)}><DeleteOutlined aria-hidden="true" /><span>Delete</span></button></div></div></article>)}</div>}
    </main> : <>
      <div className="rb-toolbar"><button disabled={busy} onClick={back}>← My resumes</button><input aria-label="Resume name" maxLength={100} disabled={busy} value={doc.title} onChange={e => setDoc({ ...doc, title: e.target.value })} /><span className={dirty ? 'rb-unsaved' : 'rb-saved'}>{busy ? 'Working…' : dirty ? '● Unsaved changes' : '✓ Saved'}</span><button disabled={busy} onClick={save}>Save</button><button disabled={busy} onClick={() => pdf(null, false)}>PDF preview</button><button className="rb-primary" disabled={busy} onClick={() => pdf(null, true)}>↓ Download PDF</button></div>
      <div className="rb-mobile-tabs"><button className={mobileTab === 'edit' ? 'active' : ''} onClick={() => setMobileTab('edit')}>Edit content</button><button className={mobileTab === 'preview' ? 'active' : ''} onClick={() => setMobileTab('preview')}>Live preview</button></div>
      <main className={`rb-workspace rb-mobile-${mobileTab}`}><aside className="rb-editor"><fieldset disabled={busy}><div className="rb-tabs"><button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>Content</button><button className={tab === 'customize' ? 'active' : ''} onClick={() => setTab('customize')}>Customize</button></div>
        {tab === 'content' ? ['personal', ...doc.settings.order].map(key => <section className="rb-section" key={key}><button className="rb-section-heading" aria-expanded={section === key} onClick={() => setSection(section === key ? '' : key)}><span>{key === 'personal' ? 'Personal details' : doc.settings.headings?.[key] || sectionNames[key]}</span><span>{section === key ? '−' : '+'}</span></button>{section === key && <div className="rb-section-body">{renderSection(key)}</div>}</section>) : <div className="rb-customize"><h2>Make it yours</h2><button onClick={() => { setSelectedTemplate(doc.template); setTemplateModal(true); }}>Change template</button><div className="rb-grid"><label className="rb-field">Paper size<select value={doc.settings.paper} onChange={e => updateSettings('paper', e.target.value)}><option>A4</option><option>Letter</option></select></label><label className="rb-field">Font<select value={doc.settings.font} onChange={e => updateSettings('font', e.target.value)}><option value="template">Template default</option><option value="sans">Sans serif</option><option value="serif">Serif</option></select></label><label className="rb-field">Font size<select value={doc.settings.fontSize} onChange={e => updateSettings('fontSize', Number(e.target.value))}>{[10,11,12,13].map(n => <option key={n} value={n}>{n} pt</option>)}</select></label><label className="rb-field">Line spacing<select value={doc.settings.spacing} onChange={e => updateSettings('spacing', Number(e.target.value))}>{[1.2,1.4,1.6,1.8].map(n => <option key={n}>{n}</option>)}</select></label><label className="rb-field">Margins<select value={doc.settings.margin} onChange={e => updateSettings('margin', Number(e.target.value))}>{[12,16,20,24].map(n => <option value={n} key={n}>{n} mm</option>)}</select></label><label className="rb-field">Accent<input type="color" value={doc.settings.accent} onChange={e => updateSettings('accent', e.target.value)} /></label></div><h3>Sections & visibility</h3>{doc.settings.order.map((key, index) => <div className="rb-order" key={key}><input aria-label={`Show ${sectionNames[key]}`} type="checkbox" checked={!doc.settings.hidden.includes(key)} onChange={e => updateSettings('hidden', e.target.checked ? doc.settings.hidden.filter(k => k !== key) : [...doc.settings.hidden, key])} /><input aria-label={`${sectionNames[key]} heading`} maxLength={60} value={doc.settings.headings?.[key] || sectionNames[key]} onChange={e => updateSettings('headings', { ...doc.settings.headings, [key]: e.target.value })} /><button disabled={index === 0} aria-label={`Move ${sectionNames[key]} up`} onClick={() => reorder(key, -1)}>↑</button><button disabled={index === doc.settings.order.length - 1} aria-label={`Move ${sectionNames[key]} down`} onClick={() => reorder(key, 1)}>↓</button></div>)}</div>}
      </fieldset><p className="rb-edit-help">Save stores your edits. PDF preview and download save the current draft first.</p></aside><section className="rb-live"><div className="rb-preview-toolbar"><span>{templates.find(t => t.id === doc.template)?.name}</span><button disabled={busy} onClick={() => { setSelectedTemplate(doc.template); setTemplateModal(true); }}>Change template</button><select aria-label="Preview zoom" value={zoom} onChange={e => setZoom(e.target.value)}><option value="fit">Fit width</option><option value="100">100%</option></select></div><p className="rb-preview-note">Live content preview · Open PDF preview to check final page breaks.</p><iframe title="Live resume preview" sandbox="" srcDoc={html} className={zoom === '100' ? 'rb-full-size' : ''} /></section></main>
    </>}
    <Modal open={templateModal} onCancel={() => setTemplateModal(false)} footer={null} width={1400} className="rb-modal"><h2>Choose your resume template</h2><p>Your content stays the same when you switch templates.</p><div className="rb-template-grid">{templates.map(t => <button className={`rb-template ${selectedTemplate === t.id ? 'selected' : ''}`} key={t.id} onClick={() => setSelectedTemplate(t.id)} aria-pressed={selectedTemplate === t.id}><Miniature doc={{ ...fresh(t.id, true), settings: { ...defaults, order: templateOrder(t.id) } }} /><strong>{t.name}</strong><span>{t.description}</span></button>)}</div><div className="rb-modal-footer"><span>5 templates · A4 or US Letter</span><button onClick={() => setTemplateModal(false)}>Cancel</button><button className="rb-primary" onClick={applyTemplate}>Use this template</button></div></Modal>
    <Modal open={!!preview} onCancel={() => setPreview(null)} footer={null} width={1000} className="rb-modal" destroyOnClose><h2>{preview?.doc.title}</h2><iframe className="rb-pdf" title="PDF resume preview" src={preview?.url} /><div className="rb-modal-footer"><button disabled={busy} className="rb-primary" onClick={() => setUseDoc({ doc: preview.doc })}>Use this resume</button></div></Modal>
    <Modal open={!!useDoc} title={useDoc?.afterDownload ? 'Use this resume for job applications?' : 'Make this your primary resume?'} onCancel={() => !busy && setUseDoc(null)} closable={!busy} maskClosable={!busy} footer={null} className="rb-modal"><p>{useDoc?.afterDownload ? 'Your PDF download has started. Would you also like to use this resume on your profile?' : `Use “${useDoc?.doc.title || ''}” for your profile and future job applications.`}</p><p>We’ll upload this saved PDF to your resume library and make it primary in CV Manager. Your previous resumes will remain available.</p><div className="rb-modal-footer"><button disabled={busy} onClick={() => setUseDoc(null)}>{useDoc?.afterDownload ? 'Not now' : 'Cancel'}</button><button disabled={busy} className="rb-primary" onClick={useResume}>{busy ? 'Uploading…' : 'Use this resume'}</button></div></Modal>
    <Modal open={!!leaveAction} title="Save your changes before leaving?" onCancel={() => !busy && setLeaveAction(null)} footer={null} closable={!busy} className="rb-modal"><p>You have unsaved edits to this resume.</p><div className="rb-modal-footer"><button disabled={busy} onClick={() => setLeaveAction(null)}>Continue editing</button><button disabled={busy} onClick={() => { const action = leaveAction; setLeaveAction(null); action(); }}>Discard</button><button disabled={busy} className="rb-primary" onClick={async () => { const result = await save(); if (result) { const action = leaveAction; setLeaveAction(null); action(); } }}>Save and leave</button></div></Modal>
    <Modal open={!!deleteDoc} title="Delete this saved resume?" onCancel={() => !busy && setDeleteDoc(null)} footer={null} className="rb-modal"><p>This removes the editable draft. Any PDF already used in CV Manager or applications stays available.</p><div className="rb-modal-footer"><button disabled={busy} onClick={() => setDeleteDoc(null)}>Cancel</button><button disabled={busy} className="rb-danger" onClick={() => perform(async () => { await call('delete', `/${deleteDoc._id}`, { revision: deleteDoc.revision }); setResumes(items => items.filter(r => r._id !== deleteDoc._id)); setDeleteDoc(null); })}>Delete draft</button></div></Modal>
  </div>;
}
