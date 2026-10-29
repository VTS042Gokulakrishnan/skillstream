const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

async function submit({ coding = false, failReport = false } = {}) {
  const events = [], updates = [], attachments = [];
  const fields = { questions: '["Original coding question"]', answers: '["answer"]', outputs: '["output"]',
    question: '["Original video question"]', answer: '["answer"]', jobTitle: "Developer" };
  const files = { [coding ? "video" : "file"]: { filepath: "video.webm" }, pdf: { filepath: "qa.pdf" } };
  const context = {
    formidable: () => ({ parse: (_req, cb) => cb(null, fields, files) }),
    axios: { post: async () => { events.push("analysis"); return { data: {} }; } },
    compressVideo: async () => events.push("compress"),
    s3: { upload: (options) => ({ promise: async () => {
      events.push(options.Key.startsWith("feedback/") ? "report upload" : "media upload");
      if (failReport && options.Key.startsWith("feedback/")) throw new Error("storage failure");
      return { Location: `https://storage.invalid/${options.Key}` };
    } }) },
    candidateModel: { updateOne: async (...args) => updates.push(args) },
    createPdf: async () => Buffer.from("video feedback"),
    createCodingPdf: async (_summary, questions) => { assert.equal(questions[0], "Original coding question"); return Buffer.from("coding feedback"); },
    candidateSendEmail: async (_email, _title, _region, bytes) => attachments.push(bytes),
    fs: { createReadStream: (file) => file, promises: { unlink: async () => {} } },
    require: () => ({ complete: async () => events.push("saved") }),
    process: { env: {} }, Buffer, console: { error() {} },
  };
  const source = fs.readFileSync(path.join(__dirname, "../controller/PracticalInterview.js"), "utf8");
  const body = source.slice(source.indexOf("async function submitPaidPractice"), source.indexOf("const controller ="));
  vm.createContext(context); vm.runInContext(body, context);
  const res = { status(code) { this.code = code; return this; }, json(value) { this.body = value; this.headersSent = true; events.push("response"); } };
  await context.submitPaidPractice({ user: { _id: "owner", email: "candidate@example.test" }, practiceSession: { id: "session" }, practiceLockId: "lock" }, res, coding);
  return { events, updates, attachments, res };
}

test("practice waits for media and save, then publishes a distinct feedback report", async () => {
  const result = await submit();
  assert.equal(result.res.code, 201);
  assert.deepEqual(result.events, ["analysis", "compress", "media upload", "media upload", "saved", "response", "report upload"]);
  assert.match(result.updates[0][1].$set["practiceInterview.$.feedbackReport"], /feedback\/practice/);
  assert.equal(result.attachments[0].toString(), "video feedback");
});

test("coding report receives original questions and updates the coding record", async () => {
  const result = await submit({ coding: true });
  assert.equal(result.updates[0][1].$set["codingPracticeInterview.$.reportStatus"], "ready");
  assert.equal(result.attachments[0].toString(), "coding feedback");
});

test("report storage failure preserves successful submission and feedback email", async () => {
  const result = await submit({ failReport: true });
  assert.equal(result.res.code, 201);
  assert.equal(result.updates[0][1].$set["practiceInterview.$.reportStatus"], "failed");
  assert.equal(result.attachments.length, 1);
});
