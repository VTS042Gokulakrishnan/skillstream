/* Run from server/. Preview by default. No database is changed without --apply.
 * Pause practice traffic and Stripe fulfillment during apply/rollback.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const VERSION = "paid-practice-v1";
const FIELDS = ["practiceInterviewCount", "codingPracticeInterviewCount", "practicePurchased",
  "practiceUnlimitedUntil", "practiceSessions", "practiceResetVersion"];
const apply = process.argv.includes("--apply");
const rollback = process.argv.includes("--rollback");

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI for the intended database first.");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const candidates = db.collection("candidates");
  const backups = db.collection("practice_balance_backup_v1");
  const migrations = db.collection("practice_migrations");
  const migration = await migrations.findOne({ _id: VERSION });
  console.log(`Database: ${db.databaseName}; mode: ${rollback ? "rollback" : "reset"}; ${apply ? "APPLY" : "DRY RUN"}`);

  if (rollback) {
    let restored = 0, skipped = 0;
    for await (const backup of backups.find({})) {
      const filter = { _id: backup._id, practiceResetVersion: VERSION, practicePurchased: false,
        practiceInterviewCount: 0, codingPracticeInterviewCount: 0, practiceUnlimitedUntil: null,
        practiceSessions: { $size: 0 }, practicePayments: backup.payments ?? { $exists: false } };
      if (!await candidates.findOne(filter)) { skipped++; continue; }
      if (apply) {
        const $set = {}, $unset = {};
        for (const field of FIELDS) {
          if (Object.prototype.hasOwnProperty.call(backup.values, field)) $set[field] = backup.values[field];
          else $unset[field] = "";
        }
        const result = await candidates.updateOne(filter, {
          ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}),
        });
        restored += result.modifiedCount;
      } else restored++;
    }
    console.log({ eligibleOrRestored: restored, skippedChangedOrNotReset: skipped });
    if (apply) await migrations.updateOne({ _id: VERSION }, { $set: { state: "rolled-back", rolledBackAt: new Date() } });
    return;
  }
  if (migration?.state === "completed" || migration?.state === "rolled-back") {
    console.log(`Migration already ${migration.state}; refusing to reset balances again.`);
    return;
  }
  if (!apply) {
    console.log({ candidatesToReset: await candidates.countDocuments({ practiceResetVersion: { $ne: VERSION } }),
      historyPreserved: true, message: "Use --apply during the deployment maintenance window." });
    return;
  }
  await migrations.updateOne({ _id: VERSION }, { $setOnInsert: { state: "preparing", createdAt: new Date() } }, { upsert: true });
  if (!migration || migration.state === "preparing") {
    for await (const candidate of candidates.find({ practiceResetVersion: { $ne: VERSION } })) {
      const values = {};
      for (const field of FIELDS) if (Object.prototype.hasOwnProperty.call(candidate, field)) values[field] = candidate[field];
      await backups.updateOne({ _id: candidate._id }, { $setOnInsert: { values,
        ...(candidate.practicePayments !== undefined ? { payments: candidate.practicePayments } : {}),
        backedUpAt: new Date() } }, { upsert: true });
    }
    await migrations.updateOne({ _id: VERSION }, { $set: { state: "prepared" } });
  }
  let reset = 0;
  for await (const backup of backups.find({})) {
    const filter = { _id: backup._id, practiceResetVersion: { $ne: VERSION } };
    const current = await candidates.findOne(filter);
    if (!current) continue;
    // An interrupted migration must not erase activity after its snapshot.
    const unchanged = FIELDS.every((field) => JSON.stringify(current[field]) === JSON.stringify(backup.values[field])) &&
      JSON.stringify(current.practicePayments) === JSON.stringify(backup.payments);
    if (!unchanged) throw new Error(`Candidate ${backup._id} changed after backup. Pause traffic and reconcile before retrying.`);
    const result = await candidates.updateOne({ ...filter,
      ...Object.fromEntries(FIELDS.filter((f) => f !== "practiceResetVersion").map((f) => [f,
        current[f] === undefined ? { $exists: false } : current[f]])),
      practicePayments: current.practicePayments === undefined ? { $exists: false } : current.practicePayments,
    }, { $set: { practiceInterviewCount: 0, codingPracticeInterviewCount: 0, practicePurchased: false,
      practiceUnlimitedUntil: null, practiceSessions: [], practiceResetVersion: VERSION } });
    if (!result.modifiedCount) throw new Error(`Candidate ${backup._id} changed during reset. Retry after reconciliation.`);
    reset++;
  }
  await migrations.updateOne({ _id: VERSION }, { $set: { state: "completed", completedAt: new Date() } });
  console.log({ reset, backupCollection: backups.collectionName, historyPreserved: true });
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
