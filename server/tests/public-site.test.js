const test = require("node:test");
const assert = require("node:assert/strict");
const {
  VERSION,
  validAcceptance,
  requireAcceptance,
  acceptanceRecord,
} = require("../services/policyAcceptance");
const { cleanArticle } = require("../services/blogContent");
const { billingRestricted } = require("../services/employerBilling");
const { editorAllowed } = require("../services/blogPermissions");

test("blog publishing is denied by default and requires an explicit editor", () => {
  assert.equal(editorAllowed({ email: "editor@example.com" }, ""), false);
  assert.equal(editorAllowed({ email: "reader@example.com" }, "editor@example.com"), false);
  assert.equal(editorAllowed({ email: "EDITOR@example.com" }, " editor@example.com "), true);
  assert.equal(editorAllowed(null, "editor@example.com"), false);
});
const consent = {
  accepted: true,
  termsVersion: VERSION,
  privacyVersion: VERSION,
};
test("signup requires matching policy versions and explicit acceptance", () => {
  assert.equal(validAcceptance(undefined, "Candidate"), false);
  assert.equal(
    validAcceptance({ ...consent, accepted: false }, "Candidate"),
    false
  );
  assert.equal(
    validAcceptance({ ...consent, privacyVersion: "old" }, "Candidate"),
    false
  );
  assert.equal(validAcceptance(consent, "Candidate"), true);
});
test("employer signup also requires employer terms", () => {
  assert.equal(validAcceptance(consent, "Employer"), false);
  assert.equal(
    validAcceptance({ ...consent, employerTerms: true }, "Employer"),
    true
  );
});
test("missing agreement is rejected before account creation", () => {
  let status, body;
  const res = {
    status(v) {
      status = v;
      return this;
    },
    json(v) {
      body = v;
    },
  };
  assert.equal(requireAcceptance({ body: { role: "Candidate" } }, res), false);
  assert.equal(status, 400);
  assert.equal(body.code, "POLICY_ACCEPTANCE_REQUIRED");
});
test("acceptance timestamp is assigned by the server", () => {
  const before = Date.now();
  const value = acceptanceRecord({
    body: { role: "Employer", policyAcceptance: { acceptedAt: "2000-01-01" } },
  });
  assert.ok(value.acceptedAt.getTime() >= before);
  assert.equal(value.role, "Employer");
  assert.equal(value.employerTerms, true);
});
test("article sanitizer removes executable content and event handlers", () => {
  const clean = cleanArticle(
    '<h2 onclick="evil()">Title</h2><script>alert(1)</script><p>Hello <strong>world</strong></p><a href="javascript:alert(1)">bad</a><img src=x onerror=evil()>'
  );
  assert.ok(clean.includes("<h2>Title</h2>"));
  assert.ok(clean.includes("<strong>world</strong>"));
  assert.doesNotMatch(clean, /script|onclick|onerror|javascript|<img/i);
});
test("article sanitizer preserves safe links and plain text", () => {
  assert.match(
    cleanArticle('<a href="https://example.com" style="display:none">Read</a>'),
    /href="https:\/\/example.com"/
  );
  assert.equal(cleanArticle("A clear article"), "A clear article");
});
test("organization-managed billing cannot initiate duplicate purchases", () => {
  assert.equal(billingRestricted({ access: "User" }), true);
  assert.equal(billingRestricted({ email: "person@hrpundits.com" }), true);
  assert.equal(
    billingRestricted({ access: "Admin", email: "owner@example.com" }),
    false
  );
});
