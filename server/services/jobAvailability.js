const Employer = require("../models/employerModel");
const Job = require("../models/jobsModel");

// A standalone listing is public only when its owner still has the same active job.
function availableJobStages() {
  return [
    { $match: { status: "Active", userId: { $type: "string", $ne: "" }, jobId: { $type: "string", $ne: "" } } },
    { $lookup: {
      from: Employer.collection.name,
      let: { owner: "$userId", targetJobId: "$jobId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$userId", "$$owner"] } } },
        { $project: { matches: { $filter: { input: { $ifNull: ["$jobs", []] }, as: "job",
          cond: { $and: [{ $eq: ["$$job.jobId", "$$targetJobId"] }, { $eq: ["$$job.status", "Active"] }] } } } } },
        { $match: { "matches.0": { $exists: true } } },
        { $limit: 1 }, { $project: { _id: 1 } },
      ],
      as: "_availableOwner",
    } },
    { $match: { "_availableOwner.0": { $exists: true } } },
    { $unset: "_availableOwner" },
  ];
}

async function isAvailable(userId, jobId) {
  return (await Job.aggregate([{ $match: { userId, jobId } }, ...availableJobStages(), { $limit: 1 }])).length > 0;
}

module.exports = { availableJobStages, isAvailable };
