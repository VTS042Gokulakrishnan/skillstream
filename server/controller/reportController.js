const Employer = require("../models/employerModel"); // path as in your project
const Candidate = require("../models/candidateModel");
const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
// const dayjs = require("dayjs");
const nodemailer = require("nodemailer");

const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const advancedFormat = require("dayjs/plugin/advancedFormat");
const { tryCatch } = require("bullmq");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

const getDashboardUrl = (role, region) => {
  const base =
    region === "United States"
      ? "https://skillstreamjobs.us"
      : region === "Canada"
      ? "https://skillstreamjobs.ca"
      : "https://skillstreamlabs.com";

  if (role === "Employer") return `${base}/employers`;
  if (role === "Vendor") return `${base}/vendor-dashboard`;
  return `${base}`; // Candidate
};

const getPricingdUrl = (region) => {
  const base =
    region === "United States"
      ? "https://skillstreamjobs.us"
      : region === "Canada"
      ? "https://skillstreamjobs.ca"
      : "https://skillstreamlabs.com";

  return `${base}/pricing`; // Candidate
};
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const getTransporter = (region) => {
  return region === "United States"
    ? nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: "info@skillstreamjobs.us",
          pass: "rsgdtwzstknlblcn",
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "support@skillstreamjobs.ca",
          pass: "yzsz ockc eiql oyqj",
        },
      });
};
const PERSONAL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
  "live.com",
  "msn.com",
];
const isPersonalEmail = (email) =>
  PERSONAL_DOMAINS.includes(email.split("@")[1]?.toLowerCase());
const REGION_CONFIG = {
  Canada: {
    label: "Canada",
    domain: "https://www.skillstreamjobs.ca",
  },
  "United States": {
    label: "United States",
    domain: "https://www.skillstreamjobs.us",
  },
  India: {
    label: "India",
    domain: "https://www.skillstreamlabs.com",
  },
};
function getOtherRegions(currentRegion) {
  return Object.values(REGION_CONFIG).filter((r) => r.label !== currentRegion);
}
function oldEmployerTemplate({ dashboardUrl, trialEnds, email, name }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Trial Extended</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .container {
        background-color: #ffffff;
        padding: 20px;
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .logo {
        width: 150px;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff !important;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
      ul {
        text-align: left;
        max-width: 420px;
        margin: 15px auto;
        font-size: 15px;
        color: #333;
      }
      .tip {
        background: #f8f9fc;
        padding: 12px;
        border-left: 4px solid #1e90ff;
        margin: 15px auto;
        max-width: 420px;
        font-size: 14px;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
        class="logo"
        alt="Skill Stream Logo"
      />

      <h2 class="header">Your Free Trial Has Been Extended 🎉</h2>

      <p class="content">
        Hi <strong>${name}</strong>,<br /><br />
        Great news! Your <strong>SkillStream free trial</strong> has been extended.
        You now have more time to explore our AI-powered hiring tools.
      </p>

      <p class="content">
        <strong>New trial expiry date:</strong> ${formatDate(trialEnds)}
      </p>

      <ul>
        <li>AI Resume Search</li>
        <li>AI Fitment Analysis</li>
        <li>AI Video Interviews</li>
        <li>AI Job Distribution</li>
      </ul>

      ${
        isPersonalEmail(email)
          ? `<div class="tip">
              <strong>Tip:</strong> Please register using a company or professional email
              (for example: <i>yourname@company.com</i>) to ensure uninterrupted access.
            </div>`
          : ""
      }

      <a href="${dashboardUrl}" class="button">
        Go to Dashboard
      </a>

      <p class="footer">
        Best regards,<br />
        <strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}

function endTrialTemplate({ name, trialEnds, dashboardUrl }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Trial Ending</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .container {
        background-color: #ffffff;
        padding: 20px;
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .logo {
        width: 150px;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #ff4d4f;
        color: #ffffff !important;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
        class="logo"
        alt="Skill Stream Logo"
      />

      <h2 class="header">Your Free Trial Is Ending Soon</h2>

      <p class="content">
        Hi <strong>${name}</strong>,<br /><br />
        This is a reminder that your <strong>SkillStream free trial</strong>
        is scheduled to end on <strong>${formatDate(trialEnds)}</strong>.
      </p>

      <p class="content">
        Upgrade your plan now to continue using AI-powered hiring tools
        without any interruption.
      </p>

      <a href="${dashboardUrl}" class="button">
        Upgrade Plan
      </a>

      <p class="footer">
        Best regards,<br />
        <strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}

const REGION_DOMAINS = {
  Canada: ["https://www.skillstreamjobs.ca", "https://www.skillstreamjobs.us"],
  "United States": [
    "https://www.skillstreamjobs.us",
    "https://www.skillstreamjobs.ca",
  ],
  India: ["https://www.skillstreamlabs.com", "https://www.skillstreamjobs.us"],
};

function crossOriginAccessTemplate({ name, currentRegion }) {
  const otherRegions = getOtherRegions(currentRegion);

  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Cross-Region Access Enabled</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .container {
        background-color: #ffffff;
        padding: 20px;
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .logo {
        width: 150px;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
      }
      ul {
        text-align: left;
        max-width: 420px;
        margin: 15px auto;
        font-size: 15px;
        color: #333;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff !important;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
        class="logo"
        alt="Skill Stream Logo"
      />

      <h2 class="header">Cross-Region Login Enabled 🌍</h2>

      <p class="content">
        Hi <strong>${name}</strong>,
      </p>

      <p class="content">
        Your account is currently registered in <strong>${currentRegion}</strong>.
        We’ve enabled access to the other SkillStream regions so you can log in seamlessly.
      </p>

      <p class="content">
        You now have access to the following regions:
      </p>

      <ul>
        ${otherRegions
          .map((r) => `<li><strong>${r.label}</strong> — ${r.domain}</li>`)
          .join("")}
      </ul>

      <p class="content">
        You can use the <strong>same email and password</strong> across all regions.
      </p>

      <a href="${otherRegions[0].domain}" class="button">
        Login Now
      </a>

      <p class="footer">
        Best regards,<br />
        <strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}
function revokeCrossOriginTemplate({ name, revokedRegions, currentRegion }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Access Update</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .container {
        background-color: #ffffff;
        padding: 20px;
        max-width: 600px;
        margin: 20px auto;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .logo {
        width: 150px;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
      }
      ul {
        text-align: left;
        max-width: 420px;
        margin: 15px auto;
        font-size: 15px;
        color: #333;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #dc143c;
        color: #ffffff !important;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
        class="logo"
        alt="Skill Stream Logo"
      />

      <h2 class="header">Cross-Region Access Disabled</h2>

      <p class="content">
        Hi <strong>${name}</strong>,
      </p>

      <p class="content">
        Cross-region login access has been <strong>disabled</strong> for your account.
      </p>

      <p class="content">
        You no longer have access to the following regions:
      </p>

      <ul>
        ${revokedRegions
          .map(
            (r) =>
              `<li><strong>${r.label}</strong> — ${r.domain}</li>`
          )
          .join("")}
      </ul>

      <p class="content">
        You can continue using SkillStream in your registered region:
        <strong>${currentRegion}</strong>.
      </p>

      <a href="${
        REGION_CONFIG[currentRegion].domain
      }" class="button">
        Go to Dashboard
      </a>

      <p class="footer">
        Best regards,<br />
        <strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}

async function sendEmail({ emp, subject, body }) {
  const transporter = getTransporter(emp.region);

  // const html = body;

  await transporter.sendMail({
    from: `SkillStream <${
      emp.region === "United States"
        ? "info@skillstreamjobs.us"
        : "support@skillstreamjobs.ca"
    }>`,
    to: emp.email,
    bcc: "akbarm@skillstreamjobs.us",
    subject,
    html: body,
    replyTo: ["akbarm@skillstreamjobs.us", "ananthakumar@vivatechsolutions.io"],
  });
}
// Helper: parse filter params
function parseDateRange(q) {
  const { filterType, startDate, endDate } = q;
  const today = dayjs().startOf("day");
  if (filterType === "today") {
    return { start: today.toDate(), end: dayjs(today).endOf("day").toDate() };
  }
  if (filterType === "this_month") {
    return {
      start: dayjs().startOf("month").toDate(),
      end: dayjs().endOf("month").toDate(),
    };
  }
  if (filterType === "last_6_months") {
    return {
      start: dayjs().subtract(6, "month").startOf("month").toDate(),
      end: dayjs().endOf("month").toDate(),
    };
  }
  // custom: expect ISO dates or yyyy-mm-dd
  if (filterType === "custom" && startDate && endDate) {
    return {
      start: dayjs(startDate).startOf("day").toDate(),
      end: dayjs(endDate).endOf("day").toDate(),
    };
  }
  // default: full range
  return { start: new Date("1970-01-01"), end: new Date() };
}

function setColWidths(headerRow, worksheet) {
  // set width based on header length, fallback min width
  worksheet.columns.forEach((col) => {
    const header = (col.header || "").toString();
    const length = Math.max(header.length + 4, 16);
    col.width = length;
  });
}

async function streamWorkbookToResponse(workbook, filename, res) {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}

const EXCLUDED_DOMAINS = ["vivatechsolutions.io", "hrpundits.com"];

function employerEmailExcluded(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return EXCLUDED_DOMAINS.some(
    (d) => lower.endsWith(`@${d}`) || lower.includes(d)
  );
}

exports.employerActivityReport = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);

    const query = {
      createdAt: { $gte: start, $lte: end },
      $or: [{ email: { $exists: true } }, { email: { $ne: null } }],
    };

    let employers = await Employer.aggregate([
      { $match: query },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          email: 1,
          phone: 1,
          companyName: 1,
          city: 1,
          state: 1,
          country: 1,
          jobs: 1,
          updatedAt: 1,
          createdAt: 1,
          trialStart: 1,
          trialEnds: 1,
          subscriptionStart: 1,
          subscriptionEnds: 1,
          isEmailVerified: 1,
        },
      },
    ]).allowDiskUse(true);

    // Exclude blocked domains
    employers = employers.filter((e) => !employerEmailExcluded(e.email || ""));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Skillstream";

    const sheet = workbook.addWorksheet("Employer Activity", {
      views: [{ state: "frozen", ySplit: 4 }],
    });

    // ===============================
    // NO RESULTS CASE
    // ===============================
    if (!employers.length) {
      sheet.addRow(["No Results Found"]);
      sheet.getCell("A1").font = {
        bold: true,
        size: 14,
        color: { argb: "FF0000" },
      };

      const filename = `employer_activity_${dayjs().format(
        "YYYYMMDD_HHmmss"
      )}.xlsx`;
      await streamWorkbookToResponse(workbook, filename, res);
      return;
    }

    // -------------------------------------------------------
    // REPORT HEADER
    // -------------------------------------------------------
    sheet.mergeCells("A1", "M1");
    sheet.getCell("A1").value = "Skillstream Employer Activity Report";
    sheet.getCell("A1").font = { size: 16, bold: true };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2", "M2");
    sheet.getCell("A2").value = `Date Range: ${dayjs(start).format(
      "DD MMM YYYY"
    )} to ${dayjs(end).format("DD MMM YYYY")}`;
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.mergeCells("A3", "M3");
    sheet.getCell("A3").value = `Total Results: ${employers.length}`;
    sheet.getCell("A3").font = { bold: true };
    sheet.getCell("A3").alignment = { horizontal: "center" };

    // -------------------------------------------------------
    // HEADER ROW
    // -------------------------------------------------------
    const headerRow = sheet.addRow([
      "Email",
      "Phone Number",
      "Company Name",
      "City",
      "State",
      "Country",
      "Jobs Posted",
      "Active Plan",
      "Trial / Subscription End Date",
      "Subscribed Date",
      "Email Verified",
      "Last Active",
      "Created At",
    ]);

    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    sheet.autoFilter = { from: "A4", to: "M4" };

    // -------------------------------------------------------
    // DATA ROWS
    // -------------------------------------------------------
    employers.forEach((e) => {
      const createdMonth = dayjs(e.createdAt).month(); // 0 = Jan
      const isDecemberUser = createdMonth === 11;

      let activePlan = "Extended 14 Free Trial";
      if (e.subscriptionStart) activePlan = "Subscribed";
      else if (isDecemberUser) activePlan = "14 Free Trial";

      const trialOrSubEnd =
        e.subscriptionEnds ||
        e.trialEnds ||
        dayjs(e.createdAt).add(14, "day").toDate();

      sheet.addRow([
        e.email || "",
        e.phone || "",
        e.companyName || "",
        e.city || "",
        e.state || "",
        e.country || "",
        Array.isArray(e.jobs) ? e.jobs.length : 0,
        activePlan,
        trialOrSubEnd ? dayjs(trialOrSubEnd).format("YYYY-MM-DD") : "",
        e.trialStart
          ? dayjs(e.trialStart).format("YYYY-MM-DD")
          : e.subscriptionStart
          ? dayjs(e.subscriptionStart).format("YYYY-MM-DD")
          : "",
        // e.subscriptionStart
        //   ? dayjs(e.subscriptionStart).format("YYYY-MM-DD")
        //   : "",
        e.isEmailVerified ? "Yes" : "No",
        e.updatedAt ? dayjs(e.updatedAt).format("YYYY-MM-DD HH:mm") : "",
        e.createdAt ? dayjs(e.createdAt).format("YYYY-MM-DD HH:mm") : "",
      ]);
    });

    // -------------------------------------------------------
    // COLUMN WIDTH + BORDERS
    // -------------------------------------------------------
    sheet.columns.forEach((col) => {
      col.width = Math.max(18, (col.header?.length || 10) + 4);
    });

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const filename = `employer_activity_${dayjs().format(
      "YYYYMMDD_HHmmss"
    )}.xlsx`;
    await streamWorkbookToResponse(workbook, filename, res);
  } catch (err) {
    console.error("employerActivityReport error", err);
    res.status(500).json({
      error: "Failed to generate employer report",
      details: err.message,
    });
  }
};

exports.candidateActivityReport = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);

    const query = {
      createdAt: { $gte: start, $lte: end },
    };

    const candidates = await Candidate.find(query)
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Skillstream";
    const sheet = workbook.addWorksheet("Candidate Activity");

    // ===============================
    //  NO RESULTS CASE
    // ===============================
    if (!candidates || candidates.length === 0) {
      sheet.addRow(["No Results Found"]);
      sheet.getCell("A1").font = {
        bold: true,
        color: { argb: "FF0000" },
        size: 14,
      };

      const filename = `candidate_activity_${dayjs().format(
        "YYYYMMDD_HHmmss"
      )}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // ===============================
    //  TOTAL RESULTS ROW
    // ===============================
    sheet.addRow([`Total Results: ${candidates.length}`]);
    sheet.getCell("A1").font = { bold: true, size: 13 };

    sheet.addRow([]); // empty row

    // ===============================
    //        HEADER ROW
    // ===============================
    const headerRow = sheet.addRow([
      "Name",
      "Email",
      "Phone Number",
      "Resume",
      "Country",
      "State",
      "City",
      "Last Logged In",
      "Created At",
    ]);

    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4A4A4A" },
    };

    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // ===============================
    //        DATA ROWS
    // ===============================
    candidates.forEach((c) => {
      const row = sheet.addRow([
        c.name || "",
        c.email || "",
        c.phone_number || "",
        c.resume || "",
        c.country || "",
        c.state || "",
        c.city || "",
        c.lastLoggedIn ? dayjs(c.lastLoggedIn).format("YYYY-MM-DD HH:mm") : "",
        c.createdAt ? dayjs(c.createdAt).format("YYYY-MM-DD HH:mm") : "",
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle" };
      });
    });

    // ===============================
    // AUTO COLUMN WIDTH
    // ===============================
    sheet.columns.forEach((column) => {
      let maxLength = 12;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLength) maxLength = len;
      });
      column.width = maxLength + 4;
    });

    // ===============================
    // AUTO FILTER
    // ===============================
    sheet.autoFilter = {
      from: "A3",
      to: "I3",
    };

    // ===============================
    // FREEZE HEADER
    // ===============================
    sheet.views = [{ state: "frozen", ySplit: 3 }];

    // ===============================
    // SEND FILE
    // ===============================
    const filename = `candidate_activity_${dayjs().format(
      "YYYYMMDD_HHmmss"
    )}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("candidateActivityReport error", err);
    res.status(500).json({
      error: "Failed to generate candidate report",
      details: err.message,
    });
  }
};

// Aggregation endpoints for counts grouped by day or month (used if you need counts)
function buildTimeGroup(stage, groupBy) {
  if (groupBy === "day") {
    return {
      $dateToString: { format: "%Y-%m-%d", date: stage },
    };
  }
  // default month
  return {
    $dateToString: { format: "%Y-%m", date: stage },
  };
}

exports.employerActivityCounts = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy = "month" } = req.query;

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          email: { $exists: true },
        },
      },
      { $addFields: { timeBucket: buildTimeGroup("$createdAt", groupBy) } },
      { $group: { _id: "$timeBucket", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ];

    const result = await Employer.aggregate(pipeline).exec();
    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.candidateActivityCounts = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req.query);
    const { groupBy = "month" } = req.query;

    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $addFields: { timeBucket: buildTimeGroup("$createdAt", groupBy) } },
      { $group: { _id: "$timeBucket", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ];

    const result = await Candidate.aggregate(pipeline).exec();
    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEmployerList = async (req, res) => {
  try {
    // let { page = 1, limit = 20, search = "" } = req.query;
    // page = Number(page);
    // limit = Number(limit);

    // const skip = (page - 1) * limit;

    const domainExclusions = ["hrpundits.com", "vivatechsolutions.io"];
    // const domainExclusions = ["hrpundits.com"];

    const query = {
      email: {
        $not: {
          $regex: `(${domainExclusions.join("|")})$`,
          $options: "i",
        },
      },
    };

    // if (search) {
    //   query.$or = [
    //     { email: new RegExp(search, "i") },
    //     { companyName: new RegExp(search, "i") },
    //     { phone: new RegExp(search, "i") },
    //   ];
    // } 

    const employers = await Employer.aggregate([
      { $match: query },
      {
        $addFields: {
          jobsPostedCount: { $size: "$jobs" },
          lastActive: "$updatedAt",
        },
      },
      { $sort: { createdAt: -1 } },
      //   { $skip: skip },
      //   { $limit: limit },
    ]);

    const total = await Employer.countDocuments(query);

    res.json({
      status: "success",
      data: employers,
      total,
      //   page,
      //   limit,
    });
  } catch (err) {
    console.error("Employer List Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getCandidateList = async (req, res) => {
  try {
    // let { page = 1, limit = 20, search = "" } = req.query;
    // page = Number(page);
    // limit = Number(limit);

    // const skip = (page - 1) * limit;

    const query = {};

    // if (search) {
    //   query.$or = [
    //     { email: new RegExp(search, "i") },
    //     { name: new RegExp(search, "i") },
    //     { phone_number: new RegExp(search, "i") },
    //   ];
    // }

    const candidates = await Candidate.aggregate([
      { $match: query },
      {
        $addFields: {
          lastActive: "$lastLoggedIn",
        },
      },
      { $sort: { createdAt: -1 } },
      //   { $skip: skip },
      //   { $limit: limit },
    ]);

    const total = await Candidate.countDocuments(query);

    res.json({
      status: "success",
      data: candidates,
      total,
      //   page,
      //   limit,
    });
  } catch (err) {
    console.error("Candidate List Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
exports.allowCrossOrigin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const emp = await Employer.findOne({ userId });

    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    const otherRegions = getOtherRegions(emp.region);

    emp.allowedCrossOrigins = true;
    emp.allowedDomains = otherRegions.map((r) => r.domain);
    await emp.save();

    await sendEmail({
      emp,
      subject: "SkillStream – Cross-Region Login Enabled 🌍",
      body: crossOriginAccessTemplate({
        name: emp.companyName,
        currentRegion: emp.region,
      }),
    });

    return res.json({
      success: true,
      message: "Cross-region access enabled",
      allowedRegions: otherRegions,
    });
  } catch (err) {
    console.error("allowCrossOrigin error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.revokeCrossOrigin = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const emp = await Employer.findOne({ userId });

    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    if (!emp.allowedCrossOrigins) {
      return res.json({
        success: true,
        message: "Cross-region access already disabled",
      });
    }

    const revokedRegions = getOtherRegions(emp.region);

    emp.allowedCrossOrigins = false;
    emp.allowedDomains = [];
    await emp.save();

    // 📩 Send revoke email
    await sendEmail({
      emp,
      subject: "SkillStream – Cross-Region Access Disabled",
      body: revokeCrossOriginTemplate({
        name: emp.companyName,
        revokedRegions,
        currentRegion: emp.region,
      }),
    });

    return res.json({
      success: true,
      message: "Cross-region access revoked",
      revokedRegions,
    });
  } catch (err) {
    console.error("revokeCrossOrigin error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// exports.allowCrossOrigin = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "userId is required",
//       });
//     }

//     const emp = await Employer.findOneAndUpdate(
//       { userId },
//       { $set: { allowedCrossOrigins: true } },
//       { new: true }
//     );

//     if (!emp) {
//       return res.status(404).json({
//         success: false,
//         message: "Employer not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Cross-origin access enabled",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.endTrial = async (req, res) => {
  try {
    const { userId, days } = req.body;

    if (!userId || days === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId and days are required",
      });
    }

    const emp = await Employer.findOne({ userId });
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    const trialEnds =
      days === 0 ? new Date() : dayjs().add(days, "day").toDate();

    emp.trialEnds = trialEnds;

    await emp.save();
    // const dashboardUrl = getDashboardUrl("Employer", emp.region);
    const dashboardUrl = getPricingdUrl(emp.region);

    // 📧 Send email
    await sendEmail({
      emp,
      subject: "Your SkillStream Free Trial Is Ending Soon",
      body: endTrialTemplate({
        name: emp.companyName,
        trialEnds,
        dashboardUrl: dashboardUrl,
      }),
    });

    return res.json({
      success: true,
      message: "Trial end updated successfully",
      trialEnds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.extendFreeTrial = async (req, res) => {
  try {
    const { userId, days } = req.body;

    if (!userId || !days) {
      return res.status(400).json({
        success: false,
        message: "userId and days are required",
      });
    }

    const emp = await Employer.findOne({ userId });
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    const trialStart = new Date();
    const trialEnds = dayjs(trialStart).add(days, "day").toDate();

    emp.trialStart = trialStart;
    emp.trialEnds = trialEnds;
    emp.subscribed = true;
     emp.plan="Recommended",
    await emp.save();
    const dashboardUrl = getDashboardUrl("Employer", emp.region);
    // 📧 Send email
    await sendEmail({
      emp,
      subject: "Your SkillStream Free Trial Has Been Extended 🎉",
      body: oldEmployerTemplate({
        dashboardUrl: dashboardUrl,
        trialEnds,
        email: emp.email,
        name: emp.companyName,
      }),
    });

    return res.json({
      success: true,
      message: "Free trial extended successfully",
      trialEnds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// exports.employerActivityReport = async (req, res) => {
//   try {
//     const { start, end } = parseDateRange(req.query);
//     // find employers created or updated in range? The user asked "registration activity" and "last active by updatedAt"
//     // We'll include those created in range (createdAt) in the list, but sort by updatedAt descending.
//     const query = {
//       createdAt: { $gte: start, $lte: end },
//       $or: [{ email: { $exists: true } }, { email: { $ne: null } }],
//     };

//     // fetch employers excluding excluded domains
//     // const employers = await Employer.find(query)
//     //   .sort({ updatedAt: -1 })
//     //   .lean()
//     //   .exec();
//     const employers = await Employer.aggregate([
//       { $match: query },
//       { $sort: { updatedAt: -1 } },
//       {
//         $project: {
//           email: 1,
//           phone: 1,
//           companyName: 1,
//           city: 1,
//           state: 1,
//           country: 1,
//           jobs: 1,
//           updatedAt: 1,
//           createdAt: 1,
//         },
//       },
//     ]).allowDiskUse(true);

//     // filter out excluded emails
//     const filtered = employers.filter(
//       (e) => !employerEmailExcluded(e.email || "")
//     );

//     // build workbook
//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = "Skillstream";
//     const sheet = workbook.addWorksheet("Employer Activity");

//     // header row
//     sheet.addRow([
//       "Email",
//       "Phone Number",
//       "Company Name",
//       "City",
//       "State",
//       "Country",
//       "Jobs Posted Count",
//       "Last Active (updatedAt)",
//       "Created At",
//     ]);

//     // style header
//     sheet.getRow(1).font = { bold: true };

//     // fill rows
//     filtered.forEach((e) => {
//       const jobCount =
//         typeof e.jobCount === "number"
//           ? e.jobCount
//           : Array.isArray(e.jobs)
//           ? e.jobs.length
//           : 0;
//       sheet.addRow([
//         e.email || "",
//         e.phone || "",
//         e.companyName || "",
//         e.city || "",
//         e.state || "",
//         e.country || "",
//         jobCount,
//         e.updatedAt ? dayjs(e.updatedAt).format("YYYY-MM-DD HH:mm") : "",
//         e.createdAt ? dayjs(e.createdAt).format("YYYY-MM-DD HH:mm") : "",
//       ]);
//     });

//     setColWidths(sheet.getRow(1).values, sheet);

//     const filename = `employer_activity_${dayjs().format(
//       "YYYYMMDD_HHmmss"
//     )}.xlsx`;
//     await streamWorkbookToResponse(workbook, filename, res);
//   } catch (err) {
//     console.error("employerActivityReport error", err);
//     res.status(500).json({
//       error: "Failed to generate employer report",
//       details: err.message,
//     });
//   }
// };

// exports.candidateActivityReport = async (req, res) => {
//   try {
//     const { start, end } = parseDateRange(req.query);
//     const query = {
//       createdAt: { $gte: start, $lte: end },
//     };

//     const candidates = await Candidate.find(query)
//       .sort({ updatedAt: -1 })
//       .lean()
//       .exec();

//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = "Skillstream";
//     const sheet = workbook.addWorksheet("Candidate Activity");

//     sheet.addRow([
//       "Name",
//       "Email",
//       "Phone Number",
//       "Resume",
//       "Country",
//       "State",
//       "City",
//       "Last Logged In",
//       "Created At",
//     ]);
//     sheet.getRow(1).font = { bold: true };

//     candidates.forEach((c) => {
//       sheet.addRow([
//         c.name || "",
//         c.email || "",
//         c.phone_number || "",
//         c.resume || "",
//         c.country || "",
//         c.state || "",
//         c.city || "",
//         c.lastLoggedIn ? dayjs(c.lastLoggedIn).format("YYYY-MM-DD HH:mm") : "",
//         c.createdAt ? dayjs(c.createdAt).format("YYYY-MM-DD HH:mm") : "",
//       ]);
//     });

//     setColWidths(sheet.getRow(1).values, sheet);

//     const filename = `candidate_activity_${dayjs().format(
//       "YYYYMMDD_HHmmss"
//     )}.xlsx`;
//     await streamWorkbookToResponse(workbook, filename, res);
//   } catch (err) {
//     console.error("candidateActivityReport error", err);
//     res.status(500).json({
//       error: "Failed to generate candidate report",
//       details: err.message,
//     });
//   }
// };

// exports.employerActivityReport = async (req, res) => {
//   try {
//     const { start, end } = parseDateRange(req.query);

//     const query = {
//       createdAt: { $gte: start, $lte: end },
//       $or: [{ email: { $exists: true } }, { email: { $ne: null } }],
//     };

//     // let employers = await Employer.find(query)
//     //   .sort({ updatedAt: -1 })
//     //   .lean()
//     //   .exec();
//     let employers = await Employer.aggregate([
//       { $match: query },
//       { $sort: { updatedAt: -1 } },
//       {
//         $project: {
//           email: 1,
//           phone: 1,
//           companyName: 1,
//           city: 1,
//           state: 1,
//           country: 1,
//           jobs: 1,
//           updatedAt: 1,
//           createdAt: 1,
//         },
//       },
//     ]).allowDiskUse(true);
//     // Exclude domains
//     employers = employers.filter((e) => !employerEmailExcluded(e.email || ""));

//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = "Skillstream";

//     // ===============================
//     // NO RESULTS CASE
//     // ===============================
//     if (!employers || employers.length === 0) {
//       sheet.addRow(["No Results Found"]);
//       sheet.getCell("A1").font = {
//         bold: true,
//         size: 14,
//         color: { argb: "FF0000" },
//       };

//       const filename = `employer_activity_${dayjs().format(
//         "YYYYMMDD_HHmmss"
//       )}.xlsx`;
//       res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       );
//       res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
//       await workbook.xlsx.write(res);
//       res.end();
//       return;
//     }
//     const sheet = workbook.addWorksheet("Employer Activity", {
//       views: [{ state: "frozen", ySplit: 4 }],
//     });

//     // -------------------------------------------------------
//     //  REPORT HEADER (Professional)
//     // -------------------------------------------------------
//     sheet.mergeCells("A1", "I1");
//     sheet.getCell("A1").value = "Skillstream Employer Activity Report";
//     sheet.getCell("A1").font = { size: 16, bold: true };
//     sheet.getCell("A1").alignment = { horizontal: "center" };

//     sheet.mergeCells("A2", "I2");
//     sheet.getCell("A2").value = `Date Range: ${dayjs(start).format(
//       "DD MMM YYYY"
//     )}  to  ${dayjs(end).format("DD MMM YYYY")}`;
//     sheet.getCell("A2").alignment = { horizontal: "center" };

//     sheet.mergeCells("A3", "I3");
//     sheet.getCell("A3").value = `Total Results: ${employers.length}`;
//     sheet.getCell("A3").font = { bold: true };
//     sheet.getCell("A3").alignment = { horizontal: "center" };

//     // -------------------------------------------------------
//     // HEADER ROW
//     // -------------------------------------------------------
//     const headerRow = sheet.addRow([
//       "Email",
//       "Phone Number",
//       "Company Name",
//       "City",
//       "State",
//       "Country",
//       "Jobs Posted Count",
//       "Last Active",
//       "Created At",
//     ]);

//     headerRow.font = { bold: true };
//     headerRow.alignment = { horizontal: "center" };

//     // Add auto-filter
//     sheet.autoFilter = {
//       from: "A4",
//       to: "I4",
//     };

//     // -------------------------------------------------------
//     // NO RESULTS HANDLING
//     // -------------------------------------------------------
//     if (employers.length === 0) {
//       const row = sheet.addRow(["No Results Found"]);
//       sheet.mergeCells(`A5:I5`);
//       row.font = { italic: true, color: { argb: "FF555555" } };
//       row.alignment = { horizontal: "center" };

//       const filename = `employer_activity_${dayjs().format(
//         "YYYYMMDD_HHmmss"
//       )}.xlsx`;
//       await streamWorkbookToResponse(workbook, filename, res);
//       return;
//     }

//     // -------------------------------------------------------
//     // DATA ROWS
//     // -------------------------------------------------------
//     employers.forEach((e) => {
//       const jobCount = Array.isArray(e.jobs) ? e.jobs.length : e.jobCount || 0;

//       sheet.addRow([
//         e.email || "",
//         e.phone || "",
//         e.companyName || "",
//         e.city || "",
//         e.state || "",
//         e.country || "",
//         jobCount,
//         e.updatedAt ? dayjs(e.updatedAt).format("YYYY-MM-DD HH:mm") : "",
//         e.createdAt ? dayjs(e.createdAt).format("YYYY-MM-DD HH:mm") : "",
//       ]);
//     });

//     // -------------------------------------------------------
//     // Column Width + Borders
//     // -------------------------------------------------------
//     sheet.columns.forEach((col) => {
//       col.width = Math.max(18, (col.header?.length || 10) + 4);
//     });

//     sheet.eachRow((row) => {
//       row.eachCell((cell) => {
//         cell.border = {
//           top: { style: "thin" },
//           bottom: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: "thin" },
//         };
//       });
//     });

//     const filename = `employer_activity_${dayjs().format(
//       "YYYYMMDD_HHmmss"
//     )}.xlsx`;
//     await streamWorkbookToResponse(workbook, filename, res);
//   } catch (err) {
//     console.error("employerActivityReport error", err);
//     res.status(500).json({
//       error: "Failed to generate employer report",
//       details: err.message,
//     });
//   }
// };
