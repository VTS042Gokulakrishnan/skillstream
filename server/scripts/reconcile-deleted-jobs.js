/* Preview: node scripts/reconcile-deleted-jobs.js
 * Apply:   node scripts/reconcile-deleted-jobs.js --apply
 * Rollback: node scripts/reconcile-deleted-jobs.js --rollback RUN_ID [--apply]
 * Pause employer posting/editing/deletion while applying or rolling back.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const fs = require("fs");
const path = require("path");
const apply = process.argv.includes("--apply");
const rollbackIndex = process.argv.indexOf("--rollback");
const reportIndex = process.argv.indexOf("--report");
const fields = ["status", "deletedAt", "deletionReason", "reconciliationId"];

async function classify(db, job) {
  if (typeof job.userId !== "string" || !job.userId.trim() || typeof job.jobId !== "string" || !job.jobId.trim()) return "review_missing_identifiers";
  if (await db.collection("jobs").countDocuments({ userId: job.userId, jobId: job.jobId }) > 1) return "review_duplicate_listing";
  const owners = await db.collection("employers").find({ userId: job.userId }, { projection: { jobs: 1 } }).toArray();
  if (owners.length > 1) return "review_duplicate_owner";
  const matches = (owners[0]?.jobs || []).filter((entry) => entry.jobId === job.jobId);
  if (matches.length > 1) return "review_duplicate_embedded_job";
  if (matches.length === 1) return matches[0].status === job.status ? "consistent" : "review_status_mismatch";
  if (await db.collection("employers").findOne({ userId: { $ne: job.userId }, "jobs.jobId": job.jobId }, { projection: { _id: 1 } })) return "review_different_owner";
  return owners.length ? "missing_employer_job" : "missing_employer";
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI for the intended database.");
  const runId = randomUUID();
  const output = reportIndex >= 0 ? process.argv[reportIndex + 1] : `job-reconciliation-${runId}.json`;
  if (rollbackIndex < 0) {
    if (!output || output.startsWith("--")) throw new Error("Provide a filename after --report.");
    if (fs.existsSync(path.resolve(output))) throw new Error("Report already exists; choose a new filename.");
    fs.accessSync(path.dirname(path.resolve(output)), fs.constants.W_OK);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const jobs = db.collection("jobs");
  const backups = db.collection("job_reconciliation_backups");
  const runs = db.collection("job_reconciliation_runs");
  console.log(`Database: ${db.databaseName}; ${apply ? "APPLY" : "DRY RUN"}`);
  if (rollbackIndex >= 0) {
    const runId = process.argv[rollbackIndex + 1];
    if (!runId || runId.startsWith("--")) throw new Error("Provide the run ID after --rollback.");
    const run = await runs.findOne({ _id: runId });
    if (!run) throw new Error("Unknown reconciliation run.");
    let eligible = 0, restored = 0, skipped = 0;
    for await (const backup of backups.find({ runId })) {
      const filter = { _id: backup.job._id, userId: backup.job.userId, jobId: backup.job.jobId,
        status: "Deleted", reconciliationId: runId, deletionReason: backup.reason, deletedAt: backup.deletedAt };
      if (!await jobs.findOne(filter)) { skipped++; continue; }
      eligible++;
      if (apply) {
        const $set = {}, $unset = {};
        for (const field of fields) {
          if (Object.prototype.hasOwnProperty.call(backup.job, field)) $set[field] = backup.job[field];
          else $unset[field] = "";
        }
        const result = await jobs.updateOne(filter, {
          ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}),
        });
        restored += result.modifiedCount;
      }
    }
    if (apply) await runs.updateOne({ _id: runId }, { $set: { rollbackAt: new Date(), restored } });
    console.log(JSON.stringify({ runId, eligible, restored, skipped }));
    return;
  }
  const report = { runId, database: db.databaseName, apply, counts: {}, records: [] };
  if (apply) await runs.insertOne({ _id: runId, startedAt: new Date(), state: "running" });
  for await (const job of jobs.find({ status: { $ne: "Deleted" } })) {
    const reason = await classify(db, job);
    report.counts[reason] = (report.counts[reason] || 0) + 1;
    if (reason === "consistent") continue;
    const entry = { id: String(job._id), userId: job.userId, jobId: job.jobId, title: job.JobTitle, reason, updated: false };
    report.records.push(entry);
    if (!apply || !["missing_employer", "missing_employer_job"].includes(reason)) continue;
    // Recheck immediately before writing; run in the documented maintenance window.
    if (await classify(db, job) !== reason) { entry.reason = "changed_during_scan"; continue; }
    const deletedAt = new Date();
    await backups.insertOne({ runId, job, reason, deletedAt });
    const result = await jobs.updateOne({ _id: job._id, userId: job.userId, jobId: job.jobId,
      ...Object.fromEntries(fields.map((field) => [field, Object.prototype.hasOwnProperty.call(job, field) ? job[field] : { $exists: false }])) },
    { $set: { status: "Deleted", deletedAt, deletionReason: reason, reconciliationId: runId } });
    entry.updated = result.modifiedCount === 1;
  }
  if (apply) await runs.updateOne({ _id: runId }, { $set: { state: "completed", completedAt: new Date(), counts: report.counts } });
  fs.writeFileSync(path.resolve(output), JSON.stringify(report, null, 2), { flag: "wx" });
  console.log(JSON.stringify({ runId, counts: report.counts, updated: report.records.filter((r) => r.updated).length, report: path.resolve(output) }, null, 2));
}
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
module.exports = { classify };
