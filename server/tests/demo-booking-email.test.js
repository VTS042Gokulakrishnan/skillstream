const test = require("node:test");
const assert = require("node:assert/strict");
const { demoBookingEmail } = require("../services/demoBookingEmail");
test("HTML escapes visitor content and retains a complete plain text alternative", () => {
  const data = { name: '<img src=x onerror="alert(1)">', email: "visitor@example.com", month: "Nov", day: "3", time: "03:00 PM", timezone_label: "Central Time (US & Canada)", page: "Landing page", page_url: "javascript:alert(1)", submittedAt: "2026-10-29T13:35:09.756Z", user_agent: "Test browser" };
  const mail = demoBookingEmail(data, "2026-10-29T13:35:11.009Z");
  assert.ok(mail.html.includes("&lt;img"));
  assert.ok(!mail.html.includes("<img"));
  assert.ok(!mail.html.includes('href="javascript:'));
  assert.ok(mail.html.includes("Central Time (US &amp; Canada)"));
  assert.ok(mail.html.includes("mailto:visitor%40example.com"));
  for (const value of Object.values(data)) assert.ok(mail.text.includes(value));
  assert.ok(mail.text.includes("2026-10-29T13:35:11.009Z"));
});
