const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const createRouter = require("../router/demoBooking");
const payload = { name: "John Doe", email: "john@company.com", month: "Jan", day: "12", time: "2:30 PM", page: "Skill Stream AI demo", submittedAt: "2026-10-28T12:34:56.000Z" };
const config = { DEMO_SMTP_HOST: "smtp.example.com", DEMO_SMTP_USER: "user", DEMO_SMTP_PASS: "secret", DEMO_BOOKING_FROM: "demo@example.com", DEMO_BOOKING_TO: "sales@example.com", DEMO_BOOKING_ALLOWED_ORIGINS: "https://example.com" };
async function fixture(t, overrides = {}, send = async () => ({ accepted: [config.DEMO_BOOKING_TO] })) {
  const sent = [];
  const app = express();
  app.use("/api/demo-booking", createRouter({ env: { ...config, ...overrides }, createTransport: () => ({ sendMail: async mail => { sent.push(mail); return send(mail); } }) }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/api/demo-booking`;
  return { sent, request: (body = payload, headers = {}, method = "POST") => fetch(url, { method, headers: { "Content-Type": "application/json", ...headers }, ...(method === "OPTIONS" ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }) }) };
}
test("sends exact fields to configured recipient with visitor reply-to", async t => {
  const f = await fixture(t);
  const response = await f.request();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(f.sent[0].to, config.DEMO_BOOKING_TO);
  assert.equal(f.sent[0].replyTo.address, payload.email);
  for (const value of Object.values(payload)) assert.ok(f.sent[0].text.includes(value));
});
test("rejects malformed fields and JSON without sending", async t => {
  const f = await fixture(t);
  for (const body of [{ ...payload, email: "bad\r\nBcc: attacker@example.com" }, { ...payload, month: "Feb", day: "30" }, { ...payload, time: "25:00 PM" }, "{"]) assert.equal((await f.request(body)).status, 400);
  assert.equal(f.sent.length, 0);
});
test("allows configured preflight and rejects unknown origins", async t => {
  const f = await fixture(t);
  const response = await f.request(null, { Origin: "https://example.com", "Access-Control-Request-Method": "POST" }, "OPTIONS");
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://example.com");
  assert.equal((await f.request(payload, { Origin: "https://evil.example" })).status, 403);
});
test("optional webhook key is enforced", async t => {
  const f = await fixture(t, { DEMO_BOOKING_API_KEY: "private-key" });
  assert.equal((await f.request()).status, 401);
  assert.equal((await f.request(payload, { Authorization: "Bearer private-key" })).status, 200);
});
test("missing configuration and SMTP failures do not report success", async t => {
  const missing = await fixture(t, { DEMO_SMTP_PASS: "" });
  assert.equal((await missing.request()).status, 503);
  const failing = await fixture(t, {}, async () => { throw new Error("secret SMTP diagnostic"); });
  const response = await failing.request();
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes("secret SMTP"));
  const rejected = await fixture(t, {}, async () => ({ accepted: [] }));
  assert.equal((await rejected.request()).status, 502);
});
test("limits repeated requests and oversized bodies", async t => {
  const f = await fixture(t);
  for (let i = 0; i < 5; i++) assert.equal((await f.request()).status, 200);
  assert.equal((await f.request()).status, 429);
  const large = await fixture(t);
  assert.equal((await large.request({ ...payload, name: "x".repeat(9000) })).status, 413);
});
