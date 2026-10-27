// Run from server/: node scripts/manage-practice-demo.js
require("dotenv").config();
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const readline = require("readline/promises");
const Candidate = require("../models/candidateModel");

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI for the intended database.");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const email = (await rl.question("Candidate email: ")).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
    await mongoose.connect(process.env.MONGODB_URI);
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = await Candidate.find({ email: new RegExp(`^${escaped}$`, "i"), role: "Candidate" })
      .select("name email practiceDemoAccess").limit(2).lean();
    if (matches.length !== 1) throw new Error(matches.length ? "Multiple candidates match. Resolve duplicate emails before continuing." : "Candidate not found. No document changed.");
    const candidate = matches[0];
    console.log(`Database: ${mongoose.connection.name}\nCandidate: ${candidate.name || "(no name)"} <${candidate.email}>\nID: ${candidate._id}`);
    console.log("Current demo:", candidate.practiceDemoAccess || "Not enabled");
    const action = (await rl.question("Action [grant/revoke] (grant): ")).trim().toLowerCase() || "grant";
    if (!["grant", "revoke"].includes(action)) throw new Error("Choose grant or revoke.");
    let demo;
    if (action === "grant") {
      const count = Number((await rl.question("Shared video + coding interview allowance (10): ")).trim() || "10");
      const days = Number((await rl.question("Valid for how many days (7): ")).trim() || "7");
      if (!Number.isSafeInteger(count) || count < 1 || count > 1000 || !Number.isSafeInteger(days) || days < 1 || days > 365) {
        throw new Error("Allowance must be 1–1000; days must be 1–365, using whole numbers.");
      }
      demo = { enabled: true, grantId: randomUUID(), grantedAt: new Date(),
        expiresAt: new Date(Date.now() + days * 86400000), allowedTypes: ["video", "coding"], remainingInterviews: count };
      console.log("New demo access:", demo);
      console.log("This replaces the previous demo allowance, not adds to it. Existing demo sessions will stop working. Paid credits and history are preserved.");
    } else console.log("This disables demo access, including existing demo sessions. Paid access is preserved.");
    if ((await rl.question("Type UPDATE to apply: ")).trim() !== "UPDATE") {
      console.log("Cancelled. No document changed."); return;
    }
    const filter = { _id: candidate._id, email: candidate.email,
      "practiceDemoAccess.grantId": candidate.practiceDemoAccess?.grantId ?? { $exists: false } };
    const result = await Candidate.updateOne(filter, { $set: demo ? { practiceDemoAccess: demo } : { "practiceDemoAccess.enabled": false } }, { runValidators: true });
    if (!result.matchedCount) throw new Error("Candidate or grant changed while prompting. Run the script again.");
    console.log(`Demo access ${action === "grant" ? "granted" : "revoked"}. Refresh Practice Assessment to see the change.`);
  } finally { rl.close(); await mongoose.disconnect(); }
}
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
