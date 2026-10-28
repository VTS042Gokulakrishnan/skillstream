const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const { booleanSearch } = require("../services/booleanSearch");

function evaluate(node, skills) {
  if (node.text) return skills.some(s => s.toLowerCase() === node.text.query.toLowerCase());
  if (node.phrase) return skills.some(s => s.toLowerCase() === node.phrase.query.toLowerCase());
  const { must = [], should = [], mustNot = [] } = node.compound;
  return must.every(n => evaluate(n, skills)) && (!should.length || should.some(n => evaluate(n, skills))) && !mustNot.some(n => evaluate(n, skills));
}
test("Boolean search preserves quoted phrases, grouping and exclusions", () => {
  const query = booleanSearch('React AND (TypeScript OR "Java Script") NOT PHP');
  assert.equal(evaluate(query, ["React", "TypeScript"]), true);
  assert.equal(evaluate(query, ["React", "Java Script"]), true);
  assert.equal(evaluate(query, ["TypeScript"]), false);
  assert.equal(evaluate(query, ["React", "TypeScript", "PHP"]), false);
  assert.equal(evaluate(booleanSearch('"React" AND NOT "PHP"'), ["React", "PHP"]), false);
});
test("AND has higher precedence than OR; unary NOT and legacy parenthesized skills work", () => {
  const query = booleanSearch("React OR Vue AND TypeScript");
  assert.equal(evaluate(query, ["React"]), true);
  assert.equal(evaluate(query, ["Vue"]), false);
  assert.equal(evaluate(query, ["Vue", "TypeScript"]), true);
  assert.equal(evaluate(booleanSearch("(React) AND (Node.js)"), ["React", "Node.js"]), true);
  assert.equal(evaluate(booleanSearch("NOT PHP"), ["React"]), true);
});
test("Invalid or excessive expressions fail before querying the database", () => {
  for (const query of ['React AND', 'React OR )', '(React OR Vue', 'React)', '"React', '""', 'x'.repeat(2001), '('.repeat(50) + 'React' + ')'.repeat(50)]) assert.throws(() => booleanSearch(query), SyntaxError);
  assert.equal(booleanSearch(""), null);
});
function load(file, dependencies) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, file), "utf8"), { module, exports: module.exports, require: id => dependencies[id] || {}, console, process: { env: { REFRESH_KEY: "test" } } });
  return module.exports;
}
const response = () => ({ code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
test("Incomplete employer API access is denied while setup and location lookups remain available", async () => {
  const gate = load("../middleware/employerSetupGate.js", { jsonwebtoken: { verify: () => ({ email: "employer@example.test", role: "Employer" }) }, "../models/employerModel": { findOne: async () => ({ userId: "employer", profileCompleted: false }) } });
  for (const [method, url, permitted] of [["GET", "/employer/profile-status", true], ["GET", "/data/states/United States", true], ["POST", "/employer/update/employer", true], ["POST", "/employer/update/another", false], ["GET", "/employer/jobs/all", false], ["POST", "/search/keyword/candidate", false], ["POST", "/data/addSkills", false]]) {
    const res = response(); let called = false;
    await gate.employerSetupGate({ method, path: url, headers: { authorization: "Bearer test" } }, res, () => { called = true; });
    assert.equal(called, permitted, `${method} ${url}`);
    if (!permitted) { assert.equal(res.code, 403); assert.equal(res.body.code, "PROFILE_INCOMPLETE"); }
  }
});
test("Profile checks fail closed on database errors", async () => {
  const gate = load("../middleware/employerSetupGate.js", { jsonwebtoken: { verify: () => ({ email: "employer@example.test", role: "Employer" }) }, "../models/employerModel": { findOne: async () => { throw new Error("offline"); } } });
  const res = response(); let called = false;
  await gate.employerSetupGate({ method: "GET", path: "/employer/profile-status", headers: { authorization: "Bearer test" } }, res, () => { called = true; });
  assert.equal(called, false); assert.equal(res.code, 503);
});
test("Profile save rejects another account and missing required fields; confirms valid completion", async () => {
  const user = { role: "Employer", userId: "e", profileCompleted: false };
  let updated = false;
  let savedChanges;
  const controller = load("../controller/employer/Employer.js", { "../../models/employerModel": { findOne: async () => user, updateOne: async (_, changes) => { updated = true; savedChanges = changes.$set; return { acknowledged: true }; } } });
  const forbidden = response();
  await controller.updateProfile({ user, params: { userId: "other" }, body: { profileCompleted: true } }, forbidden);
  assert.equal(forbidden.code, 403); assert.equal(updated, false);
  const missing = response();
  await controller.updateProfile({ user, params: { userId: "e" }, body: { profileCompleted: true } }, missing);
  assert.equal(missing.code, 400); assert.equal(updated, false);
  const saved = response();
  await controller.updateProfile({ user, params: { userId: "e" }, body: { profileCompleted: true, companyName: "Example", primaryIndustry: "Software", phone: "5555555555", country: "US", state: "CA", city: "San Francisco" } }, saved);
  assert.equal(saved.code, 201); assert.equal(saved.body.profileCompleted, true); assert.equal(updated, true);
  const protectedFields = response();
  await controller.updateProfile({ user: { ...user, profileCompleted: true }, params: { userId: "e" }, body: { role: "Admin", access: "Admin", subscribed: true, profileCompleted: false, companyName: "Updated" } }, protectedFields);
  assert.equal(savedChanges.companyName, "Updated");
  for (const field of ["role", "access", "subscribed", "profileCompleted"]) assert.equal(savedChanges[field], undefined);
});
