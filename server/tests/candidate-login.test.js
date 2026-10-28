const { test } = require("node:test");
const assert = require("node:assert/strict");
const Candidate = require("../models/candidateModel");

test("login bypasses legacy document validation using a targeted atomic repair", async (t) => {
  const candidate = Candidate.hydrate({
    _id: new (require("mongoose").Types.ObjectId)(),
    practiceInterviewCount: -14,
    codingPracticeInterviewCount: -2,
  });
  await assert.rejects(candidate.validate(), /less than minimum allowed value/);

  let writes = 0;
  t.mock.method(Candidate.collection, "updateOne", async (filter, update) => {
    writes++;
    assert.equal(String(filter._id), String(candidate._id));
    assert.ok(update.$set.lastLoggedIn instanceof Date);
    assert.deepEqual(update.$max, { practiceInterviewCount: 0, codingPracticeInterviewCount: 0 });
    // No stale balances or unrelated candidate data are written back.
    assert.deepEqual(Object.keys(update.$set).sort(), ["lastLoggedIn", "updatedAt"]);
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  });
  await Candidate.recordLogin(candidate._id);
  assert.equal(writes, 1);
});
