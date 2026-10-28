// Integration tests: use a disposable database, never the deployed MONGODB_URI.
const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
const express = require("express");
const Candidate = require("../models/candidateModel");
const { nextMonth, access } = require("../services/practicePlans");
const sessions = require("../services/practiceSessions");
const billing = require("../services/practiceBilling");
const payments = require("../controller/practicePayments");
let server, origin, candidate, startCalls;

before(async () => {
  if (!process.env.PRACTICE_TEST_MONGODB_URI) throw new Error("Set PRACTICE_TEST_MONGODB_URI to a disposable test database");
  await mongoose.connect(process.env.PRACTICE_TEST_MONGODB_URI);
  const app = express();
  app.post("/webhook", express.raw({ type: "application/json" }), billing.webhook);
  app.use(express.json());
  app.use((req, res, next) => { req.user = candidate; next(); });
  app.get("/access", payments.status);
  app.post("/checkout", payments.checkout);
  app.post("/verify", payments.verify);
  app.post("/start", sessions.requireSession("video", "start"), (req, res) => {
    startCalls++;
    if (req.body.fail) return res.status(502).json({ status: false });
    res.json({ status: true, initial_intro: "Welcome" });
  });
  app.post("/coding-start", sessions.requireSession("coding", "start"), (req, res) => res.json({ data: { questions: ["Q"] } }));
  app.post("/question", sessions.requireSession("video", "questions"), (req, res) => res.json({ status: true }));
  app.post("/submit", sessions.requireSession("video", "submit"), async (req, res, next) => {
    try {
      if (req.body.fail) return res.status(500).json({ status: false });
      await sessions.complete(candidate._id, req.practiceSession, req.practiceLockId, { videoId: req.practiceSession.id });
      res.json({ status: true });
    } catch (error) { next(error); }
  });
  app.get("/owned/:userId", payments.ownerOnly, (req, res) => res.json({ status: true }));
  server = await new Promise((resolve) => { const handle = app.listen(0, "127.0.0.1", () => resolve(handle)); });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise((resolve) => server.close(resolve)); await mongoose.disconnect(); });
beforeEach(async () => {
  // Only this suite's unique candidate is removed; no database-wide deletion.
  if (candidate) await Candidate.deleteOne({ _id: candidate._id });
  candidate = await Candidate.create({ userId: randomUUID(), role: "Candidate", email: "practice-test@example.test" });
  startCalls = 0;
});
const post = (url, id, body = {}) => fetch(`${origin}${url}`, { method: "POST", headers: {
  "Content-Type": "application/json", ...(id ? { "X-Practice-Session": id } : {}),
}, body: JSON.stringify(body) });
const read = () => Candidate.findById(candidate._id).lean();
const paidSession = (plan = "pack3", id = randomUUID()) => ({ id: `cs_test_${id}`, mode: "payment", payment_status: "paid",
  currency: "usd", amount_total: plan === "pack3" ? 1999 : plan === "pack5" ? 2949 : 9900,
  metadata: { purpose: "candidate-practice-v1", candidateId: String(candidate._id), practicePlan: plan } });

test("login repairs legacy balances and preserves credits added after the candidate was read", async () => {
  await Candidate.collection.updateOne({ _id: candidate._id }, {
    $set: { practiceInterviewCount: -14, codingPracticeInterviewCount: -2 },
  });
  const stale = await Candidate.findById(candidate._id);
  await assert.rejects(stale.validate(), /less than minimum allowed value/);
  await Candidate.recordLogin(stale._id);
  let stored = await read();
  assert.equal(stored.practiceInterviewCount, 0);
  assert.equal(stored.codingPracticeInterviewCount, 0);
  assert.ok(stored.lastLoggedIn instanceof Date);
  assert.equal(stored.practicePurchased, false);

  await Candidate.updateOne({ _id: candidate._id }, {
    $inc: { practiceInterviewCount: 3, codingPracticeInterviewCount: 5 },
  });
  await Candidate.recordLogin(stale._id);
  stored = await read();
  assert.equal(stored.practiceInterviewCount, 3);
  assert.equal(stored.codingPracticeInterviewCount, 5);
});

async function grantDemo(count = 10) {
  await Candidate.updateOne({ _id: candidate._id }, { $set: { practiceDemoAccess: {
    enabled: true, grantId: randomUUID(), grantedAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000), allowedTypes: ["video", "coding"], remainingInterviews: count,
  } } });
}

test("interactive email script grants, cancels and revokes only the matching candidate", async () => {
  candidate.email = `demo-${randomUUID()}@example.test`;
  await candidate.save();
  const { spawn } = require("node:child_process");
  const path = require("node:path");
  const run = (answers) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve(__dirname, "../scripts/manage-practice-demo.js")], {
      cwd: path.resolve(__dirname, ".."), env: { ...process.env, MONGODB_URI: process.env.PRACTICE_TEST_MONGODB_URI },
    });
    let output = "", index = 0;
    const timeout = setTimeout(() => { child.kill(); reject(new Error("Demo prompt script timed out")); }, 15000);
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (index < answers.length && output.includes(answers[index][0])) {
        child.stdin.write(answers[index++][1] + "\n");
      }
    });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("error", reject);
    child.on("close", (code) => { clearTimeout(timeout); code ? reject(new Error(output)) : resolve(output); });
  });
  const prompts = [["Candidate email:", candidate.email.toUpperCase()], ["Action [grant/revoke]", "grant"],
    ["allowance (10):", ""], ["days (7):", ""], ["Type UPDATE", "UPDATE"]];
  await run(prompts);
  assert.equal((await read()).practiceDemoAccess.remainingInterviews, 10);
  assert.equal((await read()).practicePurchased, false);
  const oldGrant = (await read()).practiceDemoAccess.grantId;
  await run(prompts.map((entry, i) => i === 4 ? [entry[0], "cancel"] : entry));
  assert.equal((await read()).practiceDemoAccess.grantId, oldGrant);
  await run([["Candidate email:", candidate.email], ["Action [grant/revoke]", "revoke"], ["Type UPDATE", "UPDATE"]]);
  assert.equal((await read()).practiceDemoAccess.enabled, false);
});

test("demo grants both types without a purchase, sharing a concurrency-safe allowance", async () => {
  await grantDemo(1);
  assert.equal(access(await read()).canVideo, true);
  assert.equal(access(await read()).canCoding, true);
  const results = await Promise.all(Array.from({ length: 10 }, (_, i) => sessions.begin(candidate._id, i % 2 ? "video" : "coding", randomUUID())));
  assert.equal(results.filter((r) => r.sessionId).length, 1);
  assert.equal((await read()).practiceDemoAccess.remainingInterviews, 0);
  assert.equal((await read()).practicePurchased, false);
  const session = (await read()).practiceSessions[0];
  assert.equal((await post(session.type === "video" ? "/start" : "/coding-start", session.id)).status, 200);
});

test("demo setup refunds once and cannot inflate a replacement grant", async () => {
  await grantDemo(2);
  const id = randomUUID();
  await sessions.begin(candidate._id, "video", id);
  assert.equal((await post("/start", id, { fail: true })).status, 502);
  await Promise.all([sessions.cancelPending(candidate._id, id), sessions.cancelPending(candidate._id, id)]);
  assert.equal((await read()).practiceDemoAccess.remainingInterviews, 2);
  const old = randomUUID();
  await sessions.begin(candidate._id, "video", old);
  await grantDemo(5);
  await sessions.cancelPending(candidate._id, old);
  assert.equal((await read()).practiceDemoAccess.remainingInterviews, 5);
});

test("expired or revoked demo is denied and new sessions fall back to paid credits", async () => {
  await grantDemo();
  const id = randomUUID();
  await sessions.begin(candidate._id, "video", id);
  await Candidate.updateOne({ _id: candidate._id }, { $set: { "practiceDemoAccess.enabled": false } });
  assert.equal((await post("/start", id)).status, 402);
  assert.equal((await sessions.begin(candidate._id, "coding", randomUUID())).status, 402);
  await grantDemo();
  await Candidate.updateOne({ _id: candidate._id }, { $set: { "practiceDemoAccess.expiresAt": new Date(0) } });
  assert.equal(access(await read()).canVideo, false);
  await billing.fulfill(paidSession());
  assert.ok((await sessions.begin(candidate._id, "video", randomUUID())).sessionId);
  assert.equal((await read()).practiceInterviewCount, 2);
});

test("demo submission preserves paid credits and records grant on the session", async () => {
  await billing.fulfill(paidSession());
  await grantDemo(1);
  const id = randomUUID();
  await sessions.begin(candidate._id, "video", id);
  assert.equal((await post("/start", id)).status, 200);
  assert.equal((await post("/submit", id)).status, 200);
  assert.equal((await read()).practiceInterviewCount, 3);
  assert.equal((await read()).practiceInterview.length, 1);
  assert.ok((await read()).practiceSessions[0].demoGrantId);
  assert.equal((await read()).practiceInterview[0].accessSource, "demo");
});

test("new and legacy free balances do not grant access", async () => {
  assert.equal(candidate.practiceInterviewCount, 0);
  assert.equal(access(candidate).purchased, false);
  await Candidate.updateOne({ _id: candidate._id }, { $set: { practiceInterviewCount: 3, codingPracticeInterviewCount: 3 } });
  assert.equal(access(await read()).canVideo, false);
  assert.equal((await sessions.begin(candidate._id, "video", randomUUID())).status, 402);
  assert.equal((await post("/start")).status, 402);
  assert.equal((await fetch(`${origin}/owned/another-candidate`)).status, 403);
});

test("duplicate and concurrent payments add both allowances exactly once", async () => {
  const payment = paidSession();
  await Promise.all(Array.from({ length: 8 }, () => billing.fulfill(payment)));
  assert.equal((await read()).practiceInterviewCount, 3);
  assert.equal((await read()).codingPracticeInterviewCount, 3);
  await billing.fulfill(paidSession("pack5"));
  assert.equal((await read()).practiceInterviewCount, 8);
  assert.equal((await read()).codingPracticeInterviewCount, 8);
  assert.equal((await read()).practicePayments.length, 2);
});

test("unpaid, wrong amount and wrong currency cannot grant credits", async () => {
  for (const change of [{ payment_status: "unpaid" }, { amount_total: 1 }, { currency: "eur" }, { mode: "subscription" }]) {
    await assert.rejects(billing.fulfill({ ...paidSession(), ...change }));
  }
  assert.equal((await read()).practiceInterviewCount, 0);
});

test("unlimited is calendar-month access; preserves credits and rejects expired pass", async () => {
  assert.equal(nextMonth(new Date("2028-01-31T12:00:00Z")).toISOString(), "2028-02-29T12:00:00.000Z");
  assert.equal(nextMonth(new Date("2026-12-31T12:00:00Z")).toISOString(), "2027-01-31T12:00:00.000Z");
  await billing.fulfill(paidSession());
  const payment = paidSession("unlimited");
  await Promise.all([billing.fulfill(payment), billing.fulfill(payment)]);
  const expiry = (await read()).practiceUnlimitedUntil;
  assert.ok(expiry > new Date());
  await billing.fulfill(paidSession("unlimited"));
  assert.equal((await read()).practiceUnlimitedUntil.toISOString(), nextMonth(expiry).toISOString());
  const id = randomUUID();
  await sessions.begin(candidate._id, "video", id);
  assert.equal((await read()).practiceInterviewCount, 3);
  await Candidate.updateOne({ _id: candidate._id }, { $set: { practiceUnlimitedUntil: new Date(0) } });
  assert.equal((await post("/start", id)).status, 402);
  assert.equal((await read()).practiceInterviewCount, 3);
});

test("simultaneous interview starts never overspend the final credit", async () => {
  await Candidate.updateOne({ _id: candidate._id }, { $set: { practicePurchased: true, practiceInterviewCount: 1 } });
  const results = await Promise.all(Array.from({ length: 10 }, () => sessions.begin(candidate._id, "video", randomUUID())));
  assert.equal(results.filter((r) => r.sessionId).length, 1);
  assert.equal((await read()).practiceInterviewCount, 0);
});

test("repeated reservation and failed setup refund only once", async () => {
  await billing.fulfill(paidSession());
  const id = randomUUID();
  await Promise.all(Array.from({ length: 5 }, () => sessions.begin(candidate._id, "video", id)));
  assert.equal((await read()).practiceInterviewCount, 2);
  await Promise.all(Array.from({ length: 5 }, () => sessions.cancelPending(candidate._id, id)));
  assert.equal((await read()).practiceInterviewCount, 3);
  const failed = randomUUID();
  await sessions.begin(candidate._id, "video", failed);
  assert.equal((await post("/start", failed, { fail: true })).status, 502);
  assert.equal((await read()).practiceInterviewCount, 3);
});

test("start retries return same interview; duplicate submissions save once", async () => {
  await billing.fulfill(paidSession());
  const id = randomUUID();
  await sessions.begin(candidate._id, "video", id);
  assert.equal((await post("/coding-start", id)).status, 402);
  assert.equal((await post("/start", id)).status, 200);
  assert.equal((await post("/start", id)).status, 200);
  assert.equal(startCalls, 1);
  assert.equal((await post("/question", id)).status, 200);
  const results = await Promise.all([post("/submit", id), post("/submit", id)]);
  assert.ok(results.some((r) => r.status === 200));
  assert.equal((await post("/submit", id)).status, 200);
  assert.equal((await read()).practiceInterview.length, 1);
  assert.equal((await read()).practiceInterviewCount, 2);
  assert.equal((await read()).codingPracticeInterviewCount, 3);
  assert.equal((await post("/question", id)).status, 409);
});

test("webhook rejects unsigned bodies and safely handles signed duplicates", async () => {
  process.env.STRIPE_API_KEY = "sk_test_placeholder";
  process.env.STRIPE_PRACTICE_WEBHOOK_SECRET = "whsec_test";
  const payload = JSON.stringify({ type: "checkout.session.completed", data: { object: paidSession() } });
  const signature = billing.stripeClient().webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_PRACTICE_WEBHOOK_SECRET });
  assert.equal((await post("/webhook", null, JSON.parse(payload))).status, 400);
  for (let i = 0; i < 2; i++) {
    const response = await fetch(`${origin}/webhook`, { method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": signature }, body: payload });
    assert.equal(response.status, 200);
  }
  assert.equal((await read()).practiceInterviewCount, 3);
});

test("checkout uses server pricing and returns directly to practices", async () => {
  process.env.STRIPE_PRACTICE_3_PRICE_ID = "price_test_pack3";
  process.env.STRIPE_PRACTICE_WEBHOOK_SECRET = "whsec_test";
  process.env.client = "https://example.test";
  const original = billing.stripeClient;
  let created;
  billing.stripeClient = () => ({ prices: { retrieve: async () => ({ active: true, type: "one_time", currency: "usd", unit_amount: 1999 }) },
    checkout: { sessions: { create: async (args) => { created = args; return { url: "https://checkout.stripe.com/test" }; } } } });
  try {
    assert.equal((await post("/checkout", null, { planId: "pack3", priceId: "tampered", userId: "other" })).status, 200);
    assert.equal(created.line_items[0].price, "price_test_pack3");
    assert.equal(created.mode, "payment");
    assert.equal(created.metadata.candidateId, String(candidate._id));
    assert.match(created.success_url, /\/practiceInterview\?payment=success/);
    assert.match(created.cancel_url, /\/practiceInterview\?payment=cancelled/);
    assert.equal((await post("/checkout", null, { planId: "invalid" })).status, 400);
  } finally { billing.stripeClient = original; }
});

test("return verification refuses another candidate and fulfills only paid sessions", async () => {
  const original = billing.stripeClient;
  const session = paidSession();
  let returned = { ...session, metadata: { ...session.metadata, candidateId: String(new mongoose.Types.ObjectId()) } };
  billing.stripeClient = () => ({ checkout: { sessions: { retrieve: async () => returned } } });
  try {
    assert.equal((await post("/verify", null, { sessionId: "cs_test_return" })).status, 403);
    returned = { ...session, payment_status: "unpaid" };
    assert.equal((await post("/verify", null, { sessionId: "cs_test_return" })).status, 202);
    assert.equal((await read()).practiceInterviewCount, 0);
    returned = session;
    assert.equal((await post("/verify", null, { sessionId: "cs_test_return" })).status, 200);
    assert.equal((await post("/verify", null, { sessionId: "cs_test_return" })).status, 200);
    assert.equal((await read()).practiceInterviewCount, 3);
  } finally { billing.stripeClient = original; }
});

test("expired setup refunds; failed submission retries without another debit", async () => {
  await billing.fulfill(paidSession());
  const expired = randomUUID();
  await sessions.begin(candidate._id, "video", expired);
  await Candidate.updateOne({ _id: candidate._id, "practiceSessions.id": expired }, { $set: { "practiceSessions.$.expiresAt": new Date(0) } });
  await sessions.expirePending(candidate._id);
  assert.equal((await read()).practiceInterviewCount, 3);
  const id = randomUUID();
  await sessions.begin(candidate._id, "video", id);
  await post("/start", id);
  assert.equal((await post("/submit", id, { fail: true })).status, 500);
  // Wait for the response-finish listener's database write, not a fixed delay.
  for (let i = 0; i < 100; i++) {
    if ((await read()).practiceSessions.find((s) => s.id === id).state === "active") break;
  }
  assert.equal((await post("/submit", id)).status, 200);
  assert.equal((await read()).practiceInterviewCount, 2);
  assert.equal((await read()).practiceInterview.length, 1);
});

test("migration preview, reset, rerun protection and rollback preserve history and new purchases", async () => {
  const { promisify } = require("node:util");
  const execFile = promisify(require("node:child_process").execFile);
  const path = require("node:path");
  const dbName = `practice_migration_${randomUUID().replaceAll("-", "")}`;
  const db = mongoose.connection.client.db(dbName);
  const collection = db.collection("candidates");
  const first = { _id: new mongoose.Types.ObjectId(), practiceInterviewCount: 3, codingPracticeInterviewCount: 2, practiceInterview: [{ videoId: "keep" }] };
  const second = { _id: new mongoose.Types.ObjectId(), practiceInterviewCount: 5, codingPracticeInterviewCount: 4 };
  await collection.insertMany([first, second]);
  const uri = new URL(process.env.PRACTICE_TEST_MONGODB_URI);
  uri.pathname = `/${dbName}`;
  const run = (...args) => execFile(process.execPath, [path.resolve(__dirname, "../scripts/reset-practice-balances.js"), ...args],
    { env: { ...process.env, MONGODB_URI: uri.toString() }, cwd: path.resolve(__dirname, "..") });
  await run();
  assert.equal((await collection.findOne({ _id: first._id })).practiceInterviewCount, 3);
  assert.equal(await db.collection("practice_balance_backup_v1").countDocuments(), 0);
  await run("--apply");
  assert.equal((await collection.findOne({ _id: first._id })).practiceInterviewCount, 0);
  assert.deepEqual((await collection.findOne({ _id: first._id })).practiceInterview, first.practiceInterview);
  assert.equal(await db.collection("practice_balance_backup_v1").countDocuments(), 2);
  await collection.updateOne({ _id: first._id }, { $set: { practiceInterviewCount: 5, practicePurchased: true, practicePayments: ["new-payment"] } });
  await run("--apply");
  assert.equal((await collection.findOne({ _id: first._id })).practiceInterviewCount, 5);
  await run("--rollback");
  assert.equal((await collection.findOne({ _id: second._id })).practiceInterviewCount, 0);
  await run("--rollback", "--apply");
  assert.equal((await collection.findOne({ _id: first._id })).practiceInterviewCount, 5);
  assert.equal((await collection.findOne({ _id: second._id })).practiceInterviewCount, 5);
  assert.equal((await collection.findOne({ _id: second._id })).codingPracticeInterviewCount, 4);
  assert.equal((await collection.findOne({ _id: second._id })).practicePurchased, undefined);
});
