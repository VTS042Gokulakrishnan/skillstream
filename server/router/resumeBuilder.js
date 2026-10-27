const express = require('express');
const mongoose = require('mongoose');
const Aws = require('aws-sdk');
const Resume = require('../models/resumeDocument');
const Candidate = require('../models/candidateModel');
const { Authorization } = require('../middleware/auth');
const { normalize, hydrateResume } = require('../services/resumeBuilder/template');
const { generatePdf } = require('../services/resumeBuilder/pdf');
const { primaryPipeline } = require('../services/resumeBuilder/primary');
const router = express.Router();
router.use(Authorization, (req, res, next) => {
  if (req.user?.role !== 'Candidate') return res.status(403).json({ message: 'Candidate access required.' });
  res.set('Cache-Control', 'no-store'); next();
});
const run = fn => async (req, res) => {
  try { await fn(req, res); }
  catch (e) { if (!e.status) console.error('Resume builder:', e.message); res.status(e.status || 500).json({ message: e.status ? e.message : 'Unable to complete this resume action. Please try again.' }); }
};
const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
async function owned(req) {
  if (!mongoose.isValidObjectId(req.params.id)) fail(404, 'Resume not found.');
  const doc = await Resume.findOne({ _id: req.params.id, owner: req.user._id }).lean();
  if (!doc) fail(404, 'Resume not found.');
  return hydrateResume(doc);
}
function revision(req, doc) {
  if (!Number.isInteger(req.body.revision) || req.body.revision !== doc.revision) fail(409, 'This resume changed in another tab. Reopen the saved version before continuing.');
}
router.get('/', run(async (req, res) => {
  const resumes = await Resume.find({ owner: req.user._id }).sort({ updatedAt: -1 }).lean();
  res.json({ resumes: resumes.map(hydrateResume) });
}));
router.post('/', run(async (req, res) => {
  const data = normalize(req.body);
  const doc = await Resume.create({ ...data, owner: req.user._id });
  res.status(201).json({ resume: doc });
}));
router.get('/:id', run(async (req, res) => res.json({ resume: await owned(req) })));
router.patch('/:id', run(async (req, res) => {
  const old = await owned(req); revision(req, old);
  const data = normalize(req.body);
  const doc = await Resume.findOneAndUpdate({ _id: old._id, owner: req.user._id, revision: old.revision }, { $set: data, $inc: { revision: 1 } }, { new: true });
  if (!doc) fail(409, 'This resume changed in another tab. Reopen it before saving.');
  res.json({ resume: doc });
}));
router.delete('/:id', run(async (req, res) => {
  const doc = await owned(req); revision(req, doc);
  const result = await Resume.deleteOne({ _id: doc._id, owner: req.user._id, revision: doc.revision });
  if (!result.deletedCount) fail(409, 'This resume changed. Refresh before deleting.');
  // Deleting a builder draft never deletes an already published application/CV PDF.
  res.json({ success: true });
}));
router.post('/:id/duplicate', run(async (req, res) => {
  const doc = await owned(req);
  const data = normalize({ ...doc, title: `${doc.title.slice(0, 90)} (copy)` });
  res.status(201).json({ resume: await Resume.create({ ...data, owner: req.user._id }) });
}));
router.post('/:id/pdf', run(async (req, res) => {
  const doc = await owned(req); revision(req, doc);
  const pdf = await generatePdf(doc);
  const name = doc.title.replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 80) || 'Resume';
  res.set('Content-Type', 'application/pdf').set('Content-Disposition', `attachment; filename="${name}.pdf"`).send(pdf);
}));
router.post('/:id/use', run(async (req, res) => {
  const doc = await owned(req); revision(req, doc);
  if (!doc.content.personal.name.trim()) fail(400, 'Add your name before using this resume.');
  if (!process.env.AWS_BUCKET_NAME_IMAGE) fail(503, 'Resume storage is not configured.');
  const pdf = await generatePdf(doc);
  // Revision-specific key: retries do not create duplicate CV Manager entries.
  const s3 = new Aws.S3({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET });
  const uploaded = await s3.upload({ Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
    Key: `resume-builder/${req.user._id}/${doc._id}/v${doc.revision}.pdf`, Body: pdf,
    ContentType: 'application/pdf', ContentDisposition: 'inline', ACL: 'public-read' }).promise();
  const current = await owned(req); revision(req, current);
  // Uses the existing CV URL convention. Never accept a user-supplied URL or candidate ID.
  const result = await Candidate.updateOne({ _id: req.user._id }, primaryPipeline(uploaded.Location));
  if (!result.matchedCount) fail(404, 'Candidate profile not found.');
  res.json({ success: true, resumeUrl: uploaded.Location, message: 'Primary resume updated. Future applications will use this resume.' });
}));
module.exports = router;
