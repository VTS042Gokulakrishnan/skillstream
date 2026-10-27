const { Types } = require('mongoose');
// One atomic candidate update: preserve older resumes, demote them, and promote this PDF.
function primaryPipeline(url) {
  return [{ $set: {
    resume: { $literal: url }, isResumeUploaded: true,
    allResumes: { $concatArrays: [
      [{ _id: new Types.ObjectId(), type: 'Primary', resumeUrl: url, dateAdded: new Date() }],
      { $map: {
        input: { $filter: {
          input: { $cond: [ { $gt: [{ $size: { $ifNull: ['$allResumes', []] } }, 0] },
            '$allResumes', { $cond: [{ $and: [{ $ne: [{ $ifNull: ['$resume', ''] }, ''] }, { $ne: ['$resume', { $literal: url }] }] }, [{ _id: new Types.ObjectId(), resumeUrl: '$resume', type: 'Secondary', dateAdded: new Date() }], []] }] },
          as: 'r', cond: { $ne: ['$$r.resumeUrl', { $literal: url }] }
        } }, as: 'r', in: { $mergeObjects: ['$$r', { type: 'Secondary' }] }
      } }
    ] }
  } }];
}
module.exports = { primaryPipeline };
