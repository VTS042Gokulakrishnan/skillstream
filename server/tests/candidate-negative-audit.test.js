const { test } = require("node:test");
const assert = require("node:assert/strict");
const { findNegativeValues, auditCollection } = require("../scripts/audit-negative-candidate-counts");

test("finds negative counters, nested allowances, legacy strings and BSON values", () => {
  const findings = findNegativeValues({
    practiceInterviewCount: -14, codingPracticeInterviewCount: 0,
    practiceDemoAccess: { remainingInterviews: -1 },
    practiceSessions: [{ questionsRemaining: -2 }, { questionsRemaining: 3 }],
    legacyCount: "-4", bsonCount: { _bsontype: "Long", toString: () => "-5" },
    ignored: [null, new Date(-1000), "not-a-number", 10, -0],
  });
  assert.deepEqual(findings.map(({ path, value }) => [path, value]), [
    ["practiceInterviewCount", "-14"], ["practiceDemoAccess.remainingInterviews", "-1"],
    ["practiceSessions[0].questionsRemaining", "-2"], ["legacyCount", "-4"], ["bsonCount", "-5"],
  ]);
  assert.equal(findings[3].storedAs, "string");
});

test("scans every document and emits only affected identifiers and fields", async () => {
  let closed = false;
  const documents = [{ _id: "a", practiceInterviewCount: 2 },
    { _id: "b", userId: "C2", password: "secret", practiceInterviewCount: -14 },
    { _id: "c", practiceSessions: [{ questionsRemaining: -1 }, { questionsRemaining: -2 }] }];
  const cursor = { batchSize() { return this; }, async close() { closed = true; },
    async *[Symbol.asyncIterator]() { yield* documents; } };
  const emitted = [];
  const summary = await auditCollection({ collectionName: "candidates", find(filter) {
    assert.deepEqual(filter, {}); return cursor;
  } }, (row) => emitted.push(row));
  assert.equal(summary.scanned, 3);
  assert.equal(summary.affected, 2);
  assert.equal(summary.negativeValues, 3);
  assert.equal(summary.fields["practiceSessions[].questionsRemaining"], 2);
  assert.equal(emitted[0]._id, "b");
  assert.ok(!JSON.stringify(emitted).includes("secret"));
  assert.equal(closed, true);
  assert.equal(documents[1].practiceInterviewCount, -14);
});
