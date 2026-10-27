import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ResumeBuilder from './ResumeBuilder';
import { defaults, sampleContent } from './resumeTemplate';
jest.mock('../../App', () => ({ Server: 'https://api.example.test' }));
jest.mock('axios', () => jest.fn());
jest.mock('antd', () => ({ Modal: ({ open, title, children }) => open ? <div role="dialog"><h2>{title}</h2>{children}</div> : null }));
const resume = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', title: 'Frontend Resume', revision: 1, updatedAt: '2026-10-27', template: 'modern', content: sampleContent(), settings: defaults };
function mount() { return render(<MemoryRouter><ResumeBuilder /></MemoryRouter>); }
beforeEach(() => {
 jest.clearAllMocks(); localStorage.setItem('token', 'test'); URL.createObjectURL = jest.fn(() => 'blob:test'); URL.revokeObjectURL = jest.fn();
 axios.mockImplementation(async request => {
  if (request.method === 'get') return { data: request.url.endsWith('/resume-builder') ? { resumes: [resume] } : { resume } };
  if (request.url.endsWith('/pdf')) return { data: new Blob(['pdf'], { type: 'application/pdf' }) };
  if (request.url.endsWith('/use')) return { data: { message: 'Primary resume updated.' } };
  return { data: { resume: { ...request.data, _id: resume._id, revision: 2 } } };
 });
});
afterEach(cleanup);
test('landing lists saved resume cards and uses only after explicit confirmation', async () => {
 mount(); await screen.findByText('Frontend Resume');
 expect(screen.queryByLabelText('Resume name')).toBeNull();
 fireEvent.click(screen.getByRole('button', { name: 'Use this resume' }));
 expect(axios.mock.calls.some(([r]) => r.url.endsWith('/use'))).toBe(false);
 fireEvent.click(screen.getAllByRole('button', { name: 'Use this resume' }).at(-1));
 await screen.findByText('Primary resume updated.');
 expect(axios.mock.calls.find(([r]) => r.url.endsWith('/use'))[0].data).toEqual({ revision: 1 });
});
test('download offers profile use, but Not now does not upload', async () => {
 const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
 mount(); await screen.findByText('Frontend Resume'); fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
 await screen.findByText('Use this resume for job applications?'); fireEvent.click(screen.getByText('Not now'));
 expect(click).toHaveBeenCalled(); expect(axios.mock.calls.some(([r]) => r.url.endsWith('/use'))).toBe(false); click.mockRestore();
});
test('failed Save and leave preserves the editor and draft', async () => {
 mount(); await screen.findByText('Frontend Resume'); fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
 await screen.findByLabelText('Resume name'); fireEvent.change(screen.getByLabelText('Resume name'), { target: { value: 'My unsaved title' } });
 fireEvent.click(screen.getByRole('button', { name: /My resumes/ }));
 await screen.findByText('Save your changes before leaving?');
 axios.mockImplementationOnce(async () => { throw new Error('offline'); });
 fireEvent.click(screen.getByText('Save and leave')); await screen.findByRole('alert');
 expect(screen.getByLabelText('Resume name').value).toBe('My unsaved title'); expect(screen.getByText('Save your changes before leaving?')).toBeTruthy();
 fireEvent.click(screen.getByText('Discard')); await waitFor(() => expect(screen.queryByLabelText('Resume name')).toBeNull());
});
test('download saves edited content first and offers the newly saved revision', async () => {
 jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
 mount(); await screen.findByText('Frontend Resume'); fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
 await screen.findByLabelText('Resume name'); fireEvent.change(screen.getByLabelText('Resume name'), { target: { value: 'Updated resume' } });
 fireEvent.click(screen.getByRole('button', { name: /Download PDF/ })); await screen.findByText('Use this resume for job applications?');
 const patch = axios.mock.calls.findIndex(([r]) => r.method === 'patch'); const pdf = axios.mock.calls.findIndex(([r]) => r.url.endsWith('/pdf'));
 expect(patch).toBeLessThan(pdf); expect(axios.mock.calls[pdf][0].data.revision).toBe(2);
 fireEvent.click(screen.getByRole('button', { name: 'Use this resume' })); await screen.findByText('Primary resume updated.');
 expect(axios.mock.calls.find(([r]) => r.url.endsWith('/use'))[0].data.revision).toBe(2);
 HTMLAnchorElement.prototype.click.mockRestore();
});
test('template switching preserves content and settings', async () => {
 mount(); await screen.findByText('Frontend Resume'); fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
 await screen.findByLabelText('Resume name'); fireEvent.click(screen.getByRole('button', { name: 'Change template' }));
 fireEvent.click(screen.getByRole('button', { name: /Classic Serif/ })); fireEvent.click(screen.getByText('Use this template'));
 fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true })); await screen.findByText('Resume saved.');
 const body = axios.mock.calls.find(([r]) => r.method === 'patch')[0].data;
 expect(body.template).toBe('classic'); expect(body.content).toEqual(resume.content);
});

test('clearing resume title does not crash the live preview', async () => {
 mount(); await screen.findByText('Frontend Resume'); fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
 await screen.findByLabelText('Resume name'); fireEvent.change(screen.getByLabelText('Resume name'), { target: { value: '' } });
 expect(screen.getByTitle('Live resume preview')).toBeTruthy();
 fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true })); await screen.findByText('Give your resume a name.');
});
test('failed primary upload leaves the confirmation open for retry', async () => {
 mount(); await screen.findByText('Frontend Resume'); fireEvent.click(screen.getByRole('button', { name: 'Use this resume' }));
 axios.mockImplementationOnce(async () => { throw { response: { data: { message: 'Upload failed' } } }; });
 fireEvent.click(screen.getAllByRole('button', { name: 'Use this resume' }).at(-1));
 await screen.findByText('Upload failed'); expect(screen.getByText('Make this your primary resume?')).toBeTruthy();
});
