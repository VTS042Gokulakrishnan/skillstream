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

/* =====================================================
   CONSTANTS
===================================================== */

const BLOCKED_DOMAINS = ["hrpundits.com", "vivatechsolutions.io"];

/* =====================================================
   SEND EMAIL
===================================================== */

async function sendEmail(to, region, subject, html) {
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
   TRIAL EMAIL TEMPLATES (UNCHANGED)
===================================================== */

function trialReminder4DaysTemplate() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Trial Reminder</title>
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
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
        class="logo"
        alt="Skill Stream Logo"
      />

      <h2 class="header">Your Free Trial Ends Soon</h2>

      <p class="content">
        This is a friendly reminder that your <strong>Skill Stream 14-day free trial</strong>  
        will end in <strong>4 days</strong>.  
        Upgrade now to continue accessing all premium features.
      </p>

      <a href="https://www.skillstreamjobs.us/pricing" class="button">Upgrade Now</a>

      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}

function trialReminder2DaysTemplate() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Trial Reminder</title>
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
        background-color: #ff7f50;
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

      <h2 class="header">Only 2 Days Left in Your Trial</h2>

      <p class="content">
        Your <strong>Skill Stream trial</strong> is ending in <strong>2 days</strong>.  
        Don’t lose access to premium features — upgrade your plan to continue uninterrupted.
      </p>

      <a href="https://www.skillstreamjobs.us/pricing" class="button">
        Upgrade My Account
      </a>

      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}
function trialReminder1DayTemplate() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Trial Reminder</title>
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
        background-color: #ff7f50;
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

      <h2 class="header">Only 2 Days Left in Your Trial</h2>

      <p class="content">
        Your <strong>Skill Stream trial</strong> is ending in <strong>Tomorrow</strong>.  
        Don’t lose access to premium features — upgrade your plan to continue uninterrupted.
      </p>

      <a href="https://www.skillstreamjobs.us/pricing" class="button">
        Upgrade My Account
      </a>

      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}
function trialExpiredTemplate() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Trial Expired</title>
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

      <h2 class="header">Your Trial Has Ended</h2>

      <p class="content">
        Your <strong>14-day free trial</strong> has now expired.  
        Your account has been switched to our <strong>Free Trial Plan</strong>.  
        Upgrade anytime to regain full premium access.
      </p>

      <a href="https://www.skillstreamjobs.us/pricing" class="button">Upgrade Now</a>

      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
`;
}

/* =====================================================
   SUBSCRIPTION EMAIL TEMPLATES (FULL HTML)
===================================================== */

function subscriptionReminderTemplate(daysLeft) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Subscription Reminder</title>
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
        margin: 15px auto;
        max-width: 420px;
        color: #333;
        font-size: 15px;
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

      <h2 class="header">Your Subscription Ends Soon</h2>

      <p class="content">
        Your <strong>Skill Stream subscription</strong> will expire in
        <strong>${daysLeft} day${daysLeft > 1 ? "s" : ""}</strong>.
        Renew now to continue enjoying uninterrupted access to premium features.
      </p>

      <ul>
        <li>AI Resume Search</li>
        <li>AI Fitment Analysis</li>
        <li>AI Video Assessment</li>
        <li>Premium Job Posting</li>
      </ul>

      <a href="https://www.skillstreamjobs.us/pricing" class="button">
        Renew Subscription
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

function subscriptionExpiredTemplate() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Skill Stream — Subscription Expired</title>
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

      <h2 class="header">Your Subscription Has Expired</h2>

      <p class="content">
        Your <strong>Skill Stream subscription</strong> has expired.
        Renew now to regain access to AI-powered hiring tools and premium features.
      </p>

      <a href="https://www.skillstreamjobs.us/pricing" class="button">
        Renew Now
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

/* =====================================================
   COMBINED CRON – TRIAL + SUBSCRIPTION
===================================================== */

cron.schedule("0 1 * * *", async () => {
  console.log("[cron] Trial + Subscription cron started");

  const today = new Date();

  const employers = await EmployerModel.find({
    role: "Employer",
    isEmailVerified: true,
    $or: [{ trialStart: { $ne: null } }, { subscribed: true }],
  });

  for (const emp of employers) {
    try {
      const domain = (emp.email || "").split("@")[1] || "";
      if (BLOCKED_DOMAINS.some((d) => domain.endsWith(d))) continue;

      /* ===================== TRIAL FLOW ===================== */
      if (emp.trialStart && emp.trialEnds && !emp.subscribed) {
        const daysLeft = Math.ceil(
          (emp.trialEnds - today) / (1000 * 60 * 60 * 24),
        );

        if (daysLeft === 4 && !emp.remindedDay10) {
          await sendEmail(
            emp.email,
            emp.region,
            "Trial – 4 Days Left",
            trialReminder4DaysTemplate(),
          );
          emp.remindedDay10 = true;
        }

        if (daysLeft === 2 && !emp.remindedDay12) {
          await sendEmail(
            emp.email,
            emp.region,
            "Trial – 2 Days Left",
            trialReminder2DaysTemplate(),
          );
          emp.remindedDay12 = true;
        }

        if (daysLeft === 1 && !emp.remindedDay13) {
          await sendEmail(
            emp.email,
            emp.region,
            "Trial – Ends Tomorrow",
            trialReminder1DayTemplate(),
          );
          emp.remindedDay13 = true;
        }

        if (daysLeft <= 0 && !emp.remindedDay14) {
          await sendEmail(
            emp.email,
            emp.region,
            "Trial Ended",
            trialExpiredTemplate(),
          );
          emp.remindedDay14 = true;
          emp.plan = "Free-Trial";
          emp.trialStart = null;
          emp.trialEnds = null;
        }
      }

      /* ===================== SUBSCRIPTION FLOW ===================== */
      // if (emp.subscribed && emp.subscriptionEnds) {
      //   const daysLeft = Math.ceil(
      //     (emp.subscriptionEnds - today) / (1000 * 60 * 60 * 24)
      //   );

      //   if (daysLeft === 7 && !emp.subReminder7) {
      //     await sendEmail(emp.email, emp.region, "Subscription – 7 Days Left", subscriptionReminderTemplate(7));
      //     emp.subReminder7 = true;
      //   }

      //   if (daysLeft === 3 && !emp.subReminder3) {
      //     await sendEmail(emp.email, emp.region, "Subscription – 3 Days Left", subscriptionReminderTemplate(3));
      //     emp.subReminder3 = true;
      //   }

      //   if (daysLeft === 1 && !emp.subReminder1) {
      //     await sendEmail(emp.email, emp.region, "Subscription – Ends Tomorrow", subscriptionReminderTemplate(1));
      //     emp.subReminder1 = true;
      //   }

      //   if (daysLeft <= 0 && !emp.subExpired) {
      //     await sendEmail(emp.email, emp.region, "Subscription Expired", subscriptionExpiredTemplate());
      //     emp.subExpired = true;
      //     // emp.subscribed = true;
      //     emp.plan = "Free-Trial";
      //     emp.access = "User";
      //   }
      // }

      await emp.save();
    } catch (err) {
      console.error("Cron error:", emp.email, err);
    }
  }

  console.log("[cron] Trial + Subscription cron completed");
});

// const cron = require("node-cron");
// const EmployerModel = require("../models/employerModel");
// const nodemailer = require("nodemailer");

// // -------------------- MAILERS ----------------------

// const canadaMailer = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "support@skillstreamjobs.ca",
//     pass: "yzsz ockc eiql oyqj",
//   },
// });

// const usMailer = nodemailer.createTransport({
//   host: "smtp.office365.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: "info@skillstreamjobs.us",
//     pass: "rsgdtwzstknlblcn",
//   },
// });

// // const indiaMailer = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: "support@skillstreamlabs.com",
// //     pass: "your-app-password",
// //   },
// // });

// function getMailer(region) {
//   if (region === "United States") return usMailer;
//   //   if (region === "India") return indiaMailer;
//   return canadaMailer;
// }

// // -------------------------------------------------------------
// // HTML EMAIL TEMPLATES (FROM USER INPUT) – NO DESIGN CHANGES
// // -------------------------------------------------------------

// function trialReminder4DaysTemplate() {
//   return `
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>Skill Stream — Trial Reminder</title>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         background-color: #f4f4f4;
//         margin: 0;
//         padding: 0;
//         text-align: center;
//       }
//       .container {
//         background-color: #ffffff;
//         padding: 20px;
//         max-width: 600px;
//         margin: 20px auto;
//         border-radius: 10px;
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//       }
//       .logo {
//         width: 150px;
//         margin-bottom: 15px;
//       }
//       .header {
//         font-size: 22px;
//         font-weight: bold;
//         color: #333;
//         margin-bottom: 15px;
//       }
//       .content {
//         font-size: 16px;
//         color: #333;
//         padding: 10px 20px;
//       }
//       .footer {
//         font-size: 14px;
//         color: #666;
//         margin-top: 15px;
//       }
//       .button {
//         display: inline-block;
//         background-color: #1e90ff;
//         color: #ffffff !important;
//         padding: 12px 20px;
//         text-decoration: none;
//         border-radius: 5px;
//         font-size: 16px;
//         margin-top: 20px;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <img
//         src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
//         class="logo"
//         alt="Skill Stream Logo"
//       />

//       <h2 class="header">Your Free Trial Ends Soon</h2>

//       <p class="content">
//         This is a friendly reminder that your <strong>Skill Stream 14-day free trial</strong>
//         will end in <strong>4 days</strong>.
//         Upgrade now to continue accessing all premium features.
//       </p>

//       <a href="https://www.skillstreamjobs.us/pricing" class="button">Upgrade Now</a>

//       <p class="footer">
//         Best regards,<br /><strong>Team Skill Stream</strong>
//       </p>
//     </div>
//   </body>
// </html>
// `;
// }

// function trialReminder2DaysTemplate() {
//   return `
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>Skill Stream — Trial Reminder</title>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         background-color: #f4f4f4;
//         margin: 0;
//         padding: 0;
//         text-align: center;
//       }
//       .container {
//         background-color: #ffffff;
//         padding: 20px;
//         max-width: 600px;
//         margin: 20px auto;
//         border-radius: 10px;
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//       }
//       .logo {
//         width: 150px;
//         margin-bottom: 15px;
//       }
//       .header {
//         font-size: 22px;
//         font-weight: bold;
//         color: #333;
//         margin-bottom: 15px;
//       }
//       .content {
//         font-size: 16px;
//         color: #333;
//         padding: 10px 20px;
//       }
//       .footer {
//         font-size: 14px;
//         color: #666;
//         margin-top: 15px;
//       }
//       .button {
//         display: inline-block;
//         background-color: #ff7f50;
//         color: #ffffff !important;
//         padding: 12px 20px;
//         text-decoration: none;
//         border-radius: 5px;
//         font-size: 16px;
//         margin-top: 20px;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <img
//         src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
//         class="logo"
//         alt="Skill Stream Logo"
//       />

//       <h2 class="header">Only 2 Days Left in Your Trial</h2>

//       <p class="content">
//         Your <strong>Skill Stream trial</strong> is ending in <strong>2 days</strong>.
//         Don’t lose access to premium features — upgrade your plan to continue uninterrupted.
//       </p>

//       <a href="https://www.skillstreamjobs.us/pricing" class="button">
//         Upgrade My Account
//       </a>

//       <p class="footer">
//         Best regards,<br /><strong>Team Skill Stream</strong>
//       </p>
//     </div>
//   </body>
// </html>
// `;
// }
// function trialReminder1DayTemplate() {
//   return `
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>Skill Stream — Trial Reminder</title>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         background-color: #f4f4f4;
//         margin: 0;
//         padding: 0;
//         text-align: center;
//       }
//       .container {
//         background-color: #ffffff;
//         padding: 20px;
//         max-width: 600px;
//         margin: 20px auto;
//         border-radius: 10px;
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//       }
//       .logo {
//         width: 150px;
//         margin-bottom: 15px;
//       }
//       .header {
//         font-size: 22px;
//         font-weight: bold;
//         color: #333;
//         margin-bottom: 15px;
//       }
//       .content {
//         font-size: 16px;
//         color: #333;
//         padding: 10px 20px;
//       }
//       .footer {
//         font-size: 14px;
//         color: #666;
//         margin-top: 15px;
//       }
//       .button {
//         display: inline-block;
//         background-color: #ff7f50;
//         color: #ffffff !important;
//         padding: 12px 20px;
//         text-decoration: none;
//         border-radius: 5px;
//         font-size: 16px;
//         margin-top: 20px;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <img
//         src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
//         class="logo"
//         alt="Skill Stream Logo"
//       />

//       <h2 class="header">Only 2 Days Left in Your Trial</h2>

//       <p class="content">
//         Your <strong>Skill Stream trial</strong> is ending in <strong>Tomorrow</strong>.
//         Don’t lose access to premium features — upgrade your plan to continue uninterrupted.
//       </p>

//       <a href="https://www.skillstreamjobs.us/pricing" class="button">
//         Upgrade My Account
//       </a>

//       <p class="footer">
//         Best regards,<br /><strong>Team Skill Stream</strong>
//       </p>
//     </div>
//   </body>
// </html>
// `;
// }
// function trialExpiredTemplate() {
//   return `
// <!DOCTYPE html>
// <html>
//   <head>
//     <title>Skill Stream — Trial Expired</title>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         background-color: #f4f4f4;
//         margin: 0;
//         padding: 0;
//         text-align: center;
//       }
//       .container {
//         background-color: #ffffff;
//         padding: 20px;
//         max-width: 600px;
//         margin: 20px auto;
//         border-radius: 10px;
//         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//       }
//       .logo {
//         width: 150px;
//         margin-bottom: 15px;
//       }
//       .header {
//         font-size: 22px;
//         font-weight: bold;
//         color: #333;
//         margin-bottom: 15px;
//       }
//       .content {
//         font-size: 16px;
//         color: #333;
//         padding: 10px 20px;
//       }
//       .footer {
//         font-size: 14px;
//         color: #666;
//         margin-top: 15px;
//       }
//       .button {
//         display: inline-block;
//         background-color: #dc143c;
//         color: #ffffff !important;
//         padding: 12px 20px;
//         text-decoration: none;
//         border-radius: 5px;
//         font-size: 16px;
//         margin-top: 20px;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <img
//         src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
//         class="logo"
//         alt="Skill Stream Logo"
//       />

//       <h2 class="header">Your Trial Has Ended</h2>

//       <p class="content">
//         Your <strong>14-day free trial</strong> has now expired.
//         Your account has been switched to our <strong>Free Trial Plan</strong>.
//         Upgrade anytime to regain full premium access.
//       </p>

//       <a href="https://www.skillstreamjobs.us/pricing" class="button">Upgrade Now</a>

//       <p class="footer">
//         Best regards,<br /><strong>Team Skill Stream</strong>
//       </p>
//     </div>
//   </body>
// </html>
// `;
// }

// // -------------------------------------------------------------
// // SEND EMAIL
// // -------------------------------------------------------------

// async function sendEmail(to, region, templateHTML, subject) {
//   const mailer = getMailer(region);
//   return await mailer.sendMail({
//     from: "Skill Stream",
//     to,
//     subject,
//     html: templateHTML,
//     replyTo: "akbarm@skillstreamjobs.us",
//   });
// }

// // -------------------------------------------------------------
// // CRON JOB – RUNS DAILY 1 AM
// // -------------------------------------------------------------

// const BLOCKED_DOMAINS = ["hrpundits.com", "vivatechsolutions.io"];
// cron.schedule("0 1 * * *", async () => {
//   console.log("[cron] freeTrialCron running at", new Date().toISOString());
//   try {
//     console.log("Checking Trial users");
//     const today = new Date();
//     const employers = await EmployerModel.find({
//       role: "Employer",
//       isEmailVerified: true,
//       // either trialStart is set or subscribed true
//       $or: [{ trialStart: { $ne: null } }, { subscribed: true }],
//     });

//     for (const emp of employers) {
//       try {
//         const email = (emp.email || "").toLowerCase();
//         const domain = email.split("@")[1] || "";
//         const blocked = BLOCKED_DOMAINS.some((d) => domain.endsWith(d));

//         // If blocked domain -> skip sending or updating per your request
//         if (blocked) {
//           // skip this user entirely
//           continue;
//         }

//         if (emp.trialStart && emp.trialEnds) {
//           const daysLeft = Math.ceil(
//             (emp.trialEnds - today) / (1000 * 60 * 60 * 24)
//           );

//           // ------------------- 4 DAYS REMAIN -----------------------
//           if (daysLeft === 4 && !emp.remindedDay10) {
//             await sendEmail(
//               emp.email,
//               emp.region,
//               trialReminder4DaysTemplate(),
//               "Your Skill Stream Trial – 4 Days Left"
//             );
//             emp.remindedDay10 = true;

//             await emp.save();
//           }

//           // ------------------- 2 DAYS REMAIN -----------------------
//           if (daysLeft === 2 && !emp.remindedDay12) {
//             await sendEmail(
//               emp.email,
//               emp.region,
//               trialReminder2DaysTemplate(),
//               "Your Skill Stream Trial – 2 Days Left"
//             );
//             emp.remindedDay12 = true;

//             await emp.save();
//           }
//           if (daysLeft === 1 && !emp.remindedDay13) {
//             await sendEmail(
//               emp.email,
//               emp.region,
//               trialReminder1DayTemplate(),
//               "Your Skill Stream Trial – Ends Tomorrow"
//             );
//             emp.remindedDay13 = true;

//             await emp.save();
//           }
//           // ------------------- TRIAL EXPIRED -----------------------
//           if (daysLeft <= 0 && !emp.remindedDay14) {
//             await sendEmail(
//               emp.email,
//               emp.region,
//               trialExpiredTemplate(),
//               "Your Skill Stream Trial Has Ended"
//             );

//             emp.remindedDay14 = true;
//             // emp.subscribed = false;
//             emp.plan = "Free-Trial";
//             await emp.save();
//             console.log(`[cron] expired email + downgraded for ${emp.email}`);
//             continue;
//           }

//           console.log("Email sent for Trial users");
//         }
//       } catch (e) {
//         console.log("Cron error:", emp.email, e);
//       }
//     }

//     console.log("[cron] freeTrialCron completed at", new Date().toISOString());
//   } catch (err) {
//     console.error("[cron] fatal error:", err);
//   }
// });

// ---------- CASE A: user has subscribed === true (special flow) ----------
// if (emp.subscribed === true) {
//   // days since last update (updatedAt)
//   const daysSinceUpdate = Math.floor(
//     (today - new Date(emp.updatedAt || emp.createdAt)) / MS_PER_DAY
//   );

//   // If 29 days passed since last update -> send 1-day-left email (only once)
//   if (daysSinceUpdate === 28 && !emp.subscribedOneDayLeftSent) {
//     await sendEmail(
//       emp.email,
//       emp.region,
//       "Your Skillstream Trial — 2 Day Left",
//       template2Days()
//     ); // reusing 2-day template for 1-day-left text acceptable
//     emp.subscribedOneDayLeftSent = true;
//     await emp.save();
//     console.log(
//       `[cron] sent 1-day-left to subscribed user: ${emp.email}`
//     );
//   }

//   // If >= 30 days -> auto-disable subscription (only once)
//   if (daysSinceUpdate >= 30 && !emp.subscribedAutoDisabled) {
//     await sendEmail(
//       emp.email,
//       emp.region,
//       "Your Skillstream Trial Has Ended",
//       templateExpired()
//     );
//     emp.subscribed = false;
//     emp.plan = "Free-Trial";
//     emp.subscribedAutoDisabled = true;
//     await emp.save();
//     console.log(`[cron] auto-disabled subscription for ${emp.email}`);
//   }

//   // move to next user
//   continue;
// }
