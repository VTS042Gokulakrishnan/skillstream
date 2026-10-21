const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");
const Job = require("../models/jobsModel");
const Employer = require("../models/employerModel");
const Candidate = require("../models/candidateModel");
const { availableJobStages, isAvailable } = require("../services/jobAvailability");
const { deleteJob, deleteEmployer } = require("../services/jobDeletion");
const { classify } = require("../scripts/reconcile-deleted-jobs");
const preferences = require("../controller/candidate/jobPreferences");
let owner;
before(async () => {
  if (!process.env.JOBS_TEST_MONGODB_URI) throw new Error("Set JOBS_TEST_MONGODB_URI to a disposable database");
  await mongoose.connect(process.env.JOBS_TEST_MONGODB_URI);
});
after(() => mongoose.disconnect());
beforeEach(async () => { owner = `test-${randomUUID()}`; });
const embedded = (jobId, status = "Active") => ({ jobId, status, JobTitle: "Developer" });
async function setup(listings, jobs = listings.map((entry) => embedded(entry.jobId))) {
  await Employer.create({ userId: owner, email: `${owner}@example.test`, jobs, jobCount: jobs.length });
  return Job.insertMany(listings.map((entry) => ({ userId: owner, Country: "United States", status: "Active", ...entry })));
}
async function visible() { return Job.aggregate([{ $match: { userId: owner } }, ...availableJobStages()]); }

test("only exact owner/job matches active in both collections are visible", async () => {
  await setup([{ jobId: "active" }, { jobId: "orphan" }, { jobId: "closed" }, { jobId: "deleted", status: "Deleted" }],
    [embedded("active"), embedded("closed", "Closed"), embedded("deleted")]);
  assert.deepEqual((await visible()).map((job) => job.jobId), ["active"]);
  await Employer.updateOne({ userId: owner }, { $pull: { jobs: { jobId: "active" } } });
  assert.equal((await visible()).length, 0);
  assert.equal(await isAvailable(owner, "active"), false);
});

test("other employers cannot make a stale listing visible", async () => {
  await setup([{ jobId: "shared" }], []);
  await Employer.create({ userId: `${owner}-other`, jobs: [embedded("shared")] });
  assert.equal((await visible()).length, 0);
  assert.equal(await classify(mongoose.connection.db, (await Job.findOne({ userId: owner }).lean())), "review_different_owner");
});

test("keyword results use the same availability gate after the search stage", async () => {
  await setup([{ jobId: "match", JobTitle: "React Developer" }, { jobId: "stale", JobTitle: "React Developer" }],
    [embedded("match")]);
  // Atlas Search is external; exercise the exact shared stages after a simulated search match.
  const results = await Job.aggregate([{ $match: { userId: owner, JobTitle: /React/ } }, ...availableJobStages()]);
  assert.deepEqual(results.map((job) => job.jobId), ["match"]);
});

test("repeated deletion soft-deletes only the owner's listing and keeps counts/history", async () => {
  await setup([{ jobId: "remove" }, { jobId: "keep" }]);
  await Job.create({ userId: `${owner}-other`, jobId: "remove", status: "Active" });
  await Employer.updateOne({ userId: owner }, { $set: { allApplicants: [{ jobId: "remove", userId: "candidate" }] } });
  await deleteJob(owner, "remove");
  await deleteJob(owner, "remove");
  const employer = await Employer.findOne({ userId: owner }).lean();
  assert.equal(employer.jobCount, 1);
  assert.deepEqual(employer.jobs.map((job) => job.jobId), ["keep"]);
  assert.equal(employer.allApplicants.length, 1);
  assert.equal((await Job.findOne({ userId: owner, jobId: "remove" })).status, "Deleted");
  assert.equal((await Job.findOne({ userId: `${owner}-other`, jobId: "remove" })).status, "Active");
});

test("employer-account deletion hides all its jobs", async () => {
  await setup([{ jobId: "one" }, { jobId: "two" }]);
  await deleteEmployer(`${owner}@example.test`);
  assert.equal(await Employer.countDocuments({ userId: owner }), 0);
  assert.equal(await Job.countDocuments({ userId: owner, status: "Deleted" }), 2);
  assert.equal((await visible()).length, 0);
});

test("preferences persist to authenticated candidate, deduplicate and allow clearing", async () => {
  const candidate = await Candidate.create({ userId: owner, role: "Candidate" });
  const call = async (values, role = "Candidate") => {
    let status = 200, body;
    const response = { status(code) { status = code; return this; }, sendStatus(code) { status = code; }, json(value) { body = value; } };
    await preferences.save({ user: { _id: candidate._id, role }, body: { preferred_locations: values, userId: "other" } }, response, (error) => { throw error; });
    return { status, body };
  };
  assert.deepEqual((await call([" Dallas ", "dallas", "Austin"])).body.preferred_locations, ["dallas", "Austin"]);
  assert.deepEqual((await Candidate.findById(candidate._id)).preferred_locations.toObject(), ["dallas", "Austin"]);
  assert.equal((await call(["City"], "Employer")).status, 403);
  assert.equal((await call([{}])).status, 400);
  assert.equal((await call(Array(21).fill("City"))).status, 400);
  await call([]);
  assert.equal((await Candidate.findById(candidate._id)).preferred_locations.length, 0);
});

test("cleanup preview, apply, rerun and rollback preserve history and skip ambiguous jobs", async () => {
  const { promisify } = require("node:util");
  const execFile = promisify(require("node:child_process").execFile);
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  const name = `job_cleanup_${randomUUID().replaceAll("-", "")}`;
  const db = mongoose.connection.client.db(name);
  await db.collection("employers").insertMany([
    { userId: "owner", jobs: [embedded("active"), embedded("closed", "Closed")], allApplicants: [{ jobId: "missing" }] },
    { userId: "other", jobs: [embedded("wrong-owner")] },
  ]);
  await db.collection("jobs").insertMany([
    { userId: "owner", jobId: "active", status: "Active" },
    { userId: "owner", jobId: "missing", status: "Active" },
    { userId: "gone", jobId: "no-employer", status: "Active" },
    { userId: "owner", jobId: "wrong-owner", status: "Active" },
    { userId: "owner", jobId: "closed", status: "Active" },
    { userId: "owner", jobId: "duplicate", status: "Active" },
    { userId: "owner", jobId: "duplicate", status: "Active" },
  ]);
  const uri = new URL(process.env.JOBS_TEST_MONGODB_URI); uri.pathname = `/${name}`;
  const reports = fs.mkdtempSync(path.join(os.tmpdir(), "job-report-"));
  const run = async (...args) => {
    const report = path.join(reports, `${randomUUID()}.json`);
    await execFile(process.execPath, [path.resolve(__dirname, "../scripts/reconcile-deleted-jobs.js"), ...args, "--report", report],
      { cwd: reports, env: { ...process.env, MONGODB_URI: uri.toString() } });
    return fs.existsSync(report) ? JSON.parse(fs.readFileSync(report)) : null;
  };
  const preview = await run();
  assert.equal(preview.counts.missing_employer, 1);
  assert.equal(preview.counts.missing_employer_job, 1);
  assert.equal(preview.counts.review_duplicate_listing, 2);
  assert.equal(await db.collection("jobs").countDocuments({ status: "Deleted" }), 0);
  const applied = await run("--apply");
  assert.equal(await db.collection("jobs").countDocuments({ status: "Deleted" }), 2);
  assert.equal(await db.collection("job_reconciliation_backups").countDocuments({ runId: applied.runId }), 2);
  await run("--apply");
  assert.equal(await db.collection("jobs").countDocuments({ status: "Deleted" }), 2);
  assert.equal((await db.collection("employers").findOne({ userId: "owner" })).allApplicants.length, 1);
  await run("--rollback", applied.runId);
  assert.equal(await db.collection("jobs").countDocuments({ status: "Deleted" }), 2);
  await run("--rollback", applied.runId, "--apply");
  assert.equal(await db.collection("jobs").countDocuments({ status: "Deleted" }), 0);
  assert.equal(await db.collection("jobs").countDocuments({ reconciliationId: applied.runId }), 0);
});
