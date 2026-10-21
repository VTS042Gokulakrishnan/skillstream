const mongoose = require("mongoose");
const Employer = require("../models/employerModel");
const Job = require("../models/jobsModel");

async function atomicWhenSupported(work) {
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!topology.setName && topology.msg !== "isdbgrid") {
    // Standalone MongoDB: hide the listing first. The availability join also
    // hides partial failures; repeating this operation completes the cleanup.
    return work(null);
  }
  const session = await mongoose.startSession();
  try { return await session.withTransaction(() => work(session)); }
  finally { await session.endSession(); }
}

async function deleteJob(userId, jobId) {
  return atomicWhenSupported(async (session) => {
    const options = session ? { session } : {};
    await Job.updateMany({ userId, jobId, status: { $ne: "Deleted" } }, {
      $set: { status: "Deleted", deletedAt: new Date(), deletionReason: "employer_deleted" },
    }, options);
    // Recalculate from the array: repeated deletes cannot decrement twice.
    return Employer.updateOne({ userId, "jobs.jobId": jobId }, [
      { $set: { jobs: { $filter: { input: { $ifNull: ["$jobs", []] }, as: "job", cond: { $ne: ["$$job.jobId", { $literal: jobId }] } } } } },
      { $set: { jobCount: { $size: "$jobs" } } },
    ], options);
  });
}

async function deleteEmployer(email) {
  return atomicWhenSupported(async (session) => {
    const options = session ? { session } : {};
    const employer = await Employer.findOne({ email }, null, options);
    if (!employer) return null;
    await Job.updateMany({ userId: employer.userId, status: { $ne: "Deleted" } }, {
      $set: { status: "Deleted", deletedAt: new Date(), deletionReason: "employer_account_deleted" },
    }, options);
    return Employer.findOneAndDelete({ _id: employer._id }, options);
  });
}
module.exports = { deleteJob, deleteEmployer };
