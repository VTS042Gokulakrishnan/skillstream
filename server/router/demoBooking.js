const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { timingSafeEqual } = require("crypto");
const { demoBookingEmail } = require("../services/demoBookingEmail");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

module.exports = function createDemoBookingRouter({ env = process.env, createTransport = nodemailer.createTransport } = {}) {
  const router = express.Router();
  const origins = (env.DEMO_BOOKING_ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const attempts = new Map();
  let transporter;
  router.use((req, res, next) => {
    if (req.headers.origin && !origins.includes(req.headers.origin)) {
      return res.status(403).json({ success: false, message: "Origin not allowed." });
    }
    next();
  });
  router.use(cors({ origin: origins, methods: ["POST", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
  router.post("/", (req, res, next) => {
    if (env.DEMO_BOOKING_API_KEY) {
      const supplied = Buffer.from(req.headers.authorization || "");
      const expected = Buffer.from(`Bearer ${env.DEMO_BOOKING_API_KEY}`);
      if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }
    }
    const now = Date.now();
    for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key);
    const key = req.ip;
    const entry = attempts.get(key) || { count: 0, reset: now + 600000 };
    if (entry.count >= 5 || (!attempts.has(key) && attempts.size >= 10000)) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((entry.reset - now) / 1000))));
      return res.status(429).json({ success: false, message: "Too many requests. Try again later." });
    }
    entry.count += 1;
    attempts.set(key, entry);
    if (!req.is(["application/json", "text/plain"])) return res.status(415).json({ success: false, message: "Send a JSON body with Content-Type: application/json." });
    next();
  }, express.json({ limit: "8kb", type: ["application/json", "text/plain"] }), async (req, res) => {
    const data = {};
    const body = req.body || {};
    const input = {
      ...body,
      day: Number.isInteger(body.day) ? String(body.day) : body.day,
      page: body.page ?? body.source,
      submittedAt: body.submittedAt ?? body.booked_at,
    };
    const limits = { name: 120, email: 254, month: 3, day: 2, time: 8, page: 200, submittedAt: 35 };
    for (const [key, limit] of Object.entries(limits)) {
      const value = input[key];
      if (typeof value !== "string" || !value.trim() || value.length > limit || /[\r\n\x00-\x1f\x7f]/.test(value)) {
        return res.status(400).json({ success: false, message: `Invalid ${key}.` });
      }
      data[key] = value.trim();
    }
    const optionalLimits = { event: 80, type: 80, phone: 40, ref: 120, date_label: 80, page_url: 2048, source: 200, timezone_label: 120, user_agent: 1024 };
    for (const [key, limit] of Object.entries(optionalLimits)) {
      if (body[key] === undefined) continue;
      const value = body[key];
      if (typeof value !== "string" || !value.trim() || value.length > limit || /[\r\n\x00-\x1f\x7f]/.test(value)) {
        return res.status(400).json({ success: false, message: `Invalid ${key}.` });
      }
      data[key] = value.trim();
    }
    const monthIndex = months.indexOf(data.month);
    if (!/^[^\s@<> ,;]+@[^\s@<> ,;]+\.[^\s@<> ,;]+$/.test(data.email) ||
        monthIndex < 0 || !/^\d{1,2}$/.test(data.day) || Number(data.day) < 1 || Number(data.day) > days[monthIndex] ||
        !/^(0?[1-9]|1[0-2]):[0-5]\d (AM|PM)$/.test(data.time) ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(data.submittedAt) || !Number.isFinite(Date.parse(data.submittedAt))) {
      return res.status(400).json({ success: false, message: "Invalid email, date, time, or submittedAt." });
    }
    if (!["DEMO_SMTP_HOST", "DEMO_SMTP_USER", "DEMO_SMTP_PASS", "DEMO_BOOKING_FROM", "DEMO_BOOKING_TO"].every(key => env[key])) {
      return res.status(503).json({ success: false, message: "Demo booking email is not configured." });
    }
    try {
      const port = Number(env.DEMO_SMTP_PORT || 587);
      transporter ||= createTransport({ host: env.DEMO_SMTP_HOST, port, secure: port === 465,
        requireTLS: port !== 465, auth: { user: env.DEMO_SMTP_USER, pass: env.DEMO_SMTP_PASS },
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000 });
      const result = await transporter.sendMail({
        from: env.DEMO_BOOKING_FROM, to: env.DEMO_BOOKING_TO,
        replyTo: { name: data.name, address: data.email },
        subject: "New Skill Stream demo request",
        ...demoBookingEmail(data),
      });
      if (!result.accepted || result.accepted.length === 0) throw new Error("No recipient accepted");
      return res.status(200).json({ success: true, message: "Demo request sent successfully." });
    } catch {
      return res.status(502).json({ success: false, message: "Unable to send demo request. Please try again later." });
    }
  });
  router.use((err, req, res, next) => {
    if (err.type === "entity.too.large") return res.status(413).json({ success: false, message: "Request too large." });
    if (err.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Invalid JSON." });
    next(err);
  });
  return router;
};
