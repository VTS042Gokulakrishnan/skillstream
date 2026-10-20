const cron = require("node-cron");
const EmployerModel = require("../models/employerModel");
const nodemailer = require("nodemailer");

/* =====================================================
   MAILERS
===================================================== */

const canadaMailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "support@skillstreamjobs.ca",
    pass: "yzsz ockc eiql oyqj",
  },
});

const usMailer = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "info@skillstreamjobs.us",
    pass: "rsgdtwzstknlblcn",
  },
});

function getMailer(region) {
  if (region === "United States") return usMailer;
  return canadaMailer;
}

function getDashboardUrl(role, region) {
  const base =
    region === "United States"
      ? "https://skillstreamjobs.us"
      : region === "Canada"
      ? "https://skillstreamjobs.ca"
      : "https://skillstreamlabs.com";

  if (role === "Employer") return `${base}/employers`;
  if (role === "Vendor") return `${base}/vendor-dashboard`;
  return `${base}/dashboard`;
}

/* =====================================================
   HELPERS
===================================================== */

const BLOCKED_DOMAINS = ["hrpundits.com", "vivatechsolutions.io"];

function normalizeToStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calcDaysLeft(endDate, nowDate) {
  const end = normalizeToStartOfDay(endDate);
  const now = normalizeToStartOfDay(nowDate);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

async function sendEmail({ to, region, subject, html }) {
  const mailer = getMailer(region);
  return mailer.sendMail({
    from:
      region === "United States"
        ? "SkillStream <info@skillstreamjobs.us>"
        : "SkillStream <support@skillstreamjobs.ca>",
    to,
    subject,
    html,
    replyTo: "akbarm@skillstreamjobs.us",
  });
}

/* =====================================================
   EMAIL TEMPLATES
===================================================== */

function subscriptionReminderTemplate({ daysLeft, dashboardUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin:0 0 10px;">Your Subscription Ends Soon</h2>
      <p>Your <b>SkillStream subscription</b> will expire in <b>${daysLeft} day(s)</b>.</p>

      <p>To avoid interruption to:</p>
      <ul>
        <li>AI Resume Search</li>
        <li>AI Fitment Analysis</li>
        <li>AI Video Assessments</li>
        <li>Premium Job Posting</li>
      </ul>

      <p>Please renew your subscription before it expires.</p>

      <a href="${dashboardUrl}"
        style="display:inline-block;background:#1e90ff;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700;">
        Renew Subscription
      </a>
    </div>
  `;
}

function subscriptionExpiredTemplate({ dashboardUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin:0 0 10px;color:#b91c1c;">Subscription Expired</h2>
      <p>Your <b>SkillStream subscription</b> has expired.</p>

      <p>Renew now to regain access to all AI hiring features.</p>

      <a href="${dashboardUrl}"
        style="display:inline-block;background:#dc143c;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700;">
        Renew Now
      </a>
    </div>
  `;
}

/* =====================================================
   SENDERS
===================================================== */

async function sendSubscriptionReminder(emp, daysLeft) {
  const dashboardUrl = getDashboardUrl("Employer", emp.region);
  const html = subscriptionReminderTemplate({ daysLeft, dashboardUrl });

  await sendEmail({
    to: emp.email,
    region: emp.region,
    subject: `Your SkillStream Subscription Expires in ${daysLeft} Day(s)`,
    html,
  });
}

async function sendSubscriptionExpiredEmail(emp) {
  const dashboardUrl = getDashboardUrl("Employer", emp.region);
  const html = subscriptionExpiredTemplate({ dashboardUrl });

  await sendEmail({
    to: emp.email,
    region: emp.region,
    subject: "Your SkillStream Subscription Has Expired",
    html,
  });
}

/* =====================================================
   CRON JOB – RUNS DAILY 2 AM
===================================================== */

cron.schedule("0 2 * * *", async () => {
  console.log("[cron] subscriptionExpiryCron running");

  const today = new Date();

  const employers = await EmployerModel.find({
    role: "Employer",
    subscribed: true,
    subscriptionEnds: { $ne: null },
  });

  for (const emp of employers) {
    try {
      const domain = (emp.email || "").split("@")[1] || "";
      if (BLOCKED_DOMAINS.some((d) => domain.endsWith(d))) continue;

      const daysLeft = calcDaysLeft(emp.subscriptionEnds, today);

      // ⏳ 7 DAYS
      if (daysLeft === 7 && !emp.subReminder7) {
        await sendSubscriptionReminder(emp, 7);
        emp.subReminder7 = true;
      }

      // ⏳ 3 DAYS
      if (daysLeft === 3 && !emp.subReminder3) {
        await sendSubscriptionReminder(emp, 3);
        emp.subReminder3 = true;
      }

      // ⏳ 1 DAY
      if (daysLeft === 1 && !emp.subReminder1) {
        await sendSubscriptionReminder(emp, 1);
        emp.subReminder1 = true;
      }

      // ❌ EXPIRED
      if (daysLeft <= 0 && !emp.subExpired) {
        await sendSubscriptionExpiredEmail(emp);

        emp.subExpired = true;

        // IMPORTANT: do NOT set subscribed=false (keep login/dashboard smooth)
        // emp.subscribed = false;

        // Optional UI labels:
        emp.plan = "Expired"; // better than "Free-Trial" for clarity
        emp.access = "User";
      }

      await emp.save();
    } catch (err) {
      console.error("Subscription cron error:", emp.email, err);
    }
  }

  console.log("[cron] subscriptionExpiryCron completed");
});
