const usermodel = require("../models/candidateModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmployerModel = require("../models/employerModel");
const VendorModel = require("../models/vendorModel");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const employerModel = require("../models/employerModel");
const clientId = process.env.GOOGLE_CLIENT_ID;
const secretKey = process.env.GOOGLE_SECRET_KEY;
const sharp = require("sharp");
const textToSVG = require("text-to-svg");
const Aws = require("aws-sdk");
const passport = require("passport");
const axios = require("axios");
const nonVendorModel = require("../models/nonVendorModels");
// const session=require("express-session")
// const passport = require("passport");
// const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});
const crypto = require("crypto");
const vendorModel = require("../models/vendorModel");

const personalEmails = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
];
const getDashboardUrl = (role, region) => {
  const base =
    region === "United States"
      ? "https://skillstreamjobs.us"
      : region === "Canada"
      ? "https://skillstreamjobs.ca"
      : "https://skillstreamlabs.com";

  if (role === "Employer") return `${base}/employers`;
  if (role === "Vendor") return `${base}/vendor-dashboard`;
  return `${base}/dashboard`; // Candidate
};

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

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
async function sendPostVerificationEmail({
  email,
  role,
  region,
  plan,
  access,
  trialEnds,
}) {
  const transporter = getTransporter(region);
  const dashboardUrl = getDashboardUrl(role, region);
  let header = "Registration Successful 🎉";
  let content = "";

  /* ===================== CANDIDATE ===================== */
  if (role === "Candidate") {
    content = `
      Your account has been successfully activated.
      <br/><br/>
      You can now start using SkillStream to explore opportunities,
      attend interviews, and enhance your career.
        <a href="${dashboardUrl}" 
       style="display:inline-block;background:#1e90ff;color:#fff;
       padding:12px 20px;border-radius:5px;text-decoration:none;">
      Go to Home
    </a>
    `;
  }

  /* ===================== VENDOR ===================== */
  if (role === "Vendor") {
    content = `
      Your vendor account has been successfully activated.
      <br/><br/>
      You can now manage candidates, upload resumes,
      and apply for jobs on behalf of your candidates.
        <a href="${dashboardUrl}" 
       style="display:inline-block;background:#1e90ff;color:#fff;
       padding:12px 20px;border-radius:5px;text-decoration:none;">
      Go to Home
    </a>
    `;
  }

  /* ===================== EMPLOYER ===================== */
  if (role === "Employer") {
    if (access === "User") {
      content = `
        You have been successfully registered and added to your organisation.
        <br/><br/>
        Your organisation’s <b>${plan}</b> plan is currently active,
        and you now have access based on your assigned role.
          <a href="${dashboardUrl}" 
       style="display:inline-block;background:#1e90ff;color:#fff;
       padding:12px 20px;border-radius:5px;text-decoration:none;">
      Go to Home
    </a>
      `;
    } else {
      content = `
        Your organisation has been successfully created.
        <br/><br/>
        We’ve activated a <b>14-day free trial</b> with full access to all employer features.
        <br/><br/>
        <b>Trial ends on:</b> ${formatDate(trialEnds)}
        <br/><br/>
        You have <b>Admin access</b>, allowing you to manage organisation users,
        post jobs, review applicants, and configure organisation settings.
          <a href="${dashboardUrl}" 
       style="display:inline-block;background:#1e90ff;color:#fff;
       padding:12px 20px;border-radius:5px;text-decoration:none;">
      Go to Home
    </a>
      `;
    }
  }

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SkillStream – Registration Successful</title>
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
        line-height: 1.6;
      }
      .footer {
        font-size: 14px;
        color: #666;
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
      <div class="header">${header}</div>
      <div class="content">${content}</div>
      <div class="footer">
        Best regards,<br/>
        <strong>Team SkillStream</strong>
      </div>
    </div>
  </body>
</html>
`;

  await transporter.sendMail({
    from: `SkillStream <${
      region === "United States"
        ? "info@skillstreamjobs.us"
        : "support@skillstreamjobs.ca"
    }>`,
    to: email,
    replyTo: ["akbarm@skillstreamjobs.us", "santhosh@vivatechsolutions.io"],
    subject: "SkillStream – Registration Successful",
    html,
    ...(role === "Employer" && {
      bcc: "akbarm@skillstreamjobs.us",
    }),
  });
}
async function generateUniqueOrgId() {
  let unique = false;
  let orgId;

  while (!unique) {
    orgId = crypto.randomBytes(10).toString("hex").slice(0, 10); // You can customize the length, e.g. 10 characters

    const existing = await employerModel.findOne({ organizationId: orgId });

    if (!existing) {
      unique = true;
    }
  }

  return orgId;
}
const getRegionBaseUrl = (region) => {
  if (region === "Canada")
    return process.env.CAWEBSITE || "https://www.skillstreamjobs.ca";
  if (region === "India")
    returnprocess.env.INWEBSITE || "https://www.skillstreamlabs.com";
  return process.env.USWEBSITE || "https://www.skillstreamjobs.us";
};
const controller = {
  async register(req, res) {
    try {
      const { email, password, role, name, region } = req.body;
      if (role === "Candidate") {
        if (email && password) {
          const existingUser = await usermodel.findOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          const getallUser = await usermodel.find({});
          if (!existingUser) {
            // generating userID
            const maxUserIdUser = await usermodel.findOne(
              {},
              {},
              { sort: { userId: -1 } }
            );
            // console.log(maxUserIdUser); // Find user with the maximum userId
            const maxUserId = maxUserIdUser
              ? parseInt(maxUserIdUser.userId.substring(5))
              : 0; // Extract the numeric part of the userId
            // console.log(maxUserId);
            const userCount = maxUserId + 1;
            let userId = "";
            if (userCount < 10) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }000${userCount}`;
            } else if (userCount < 100) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }00${userCount}`;
            } else if (userCount < 1000) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }0${userCount}`;
            } else {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }${userCount}`;
            }
            // console.log(userId);
            var salt = await bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const textToSVGInstance = textToSVG.loadSync();
            const initialLetter = name.charAt(0).toUpperCase();
            const svg = textToSVGInstance.getSVG(initialLetter, {
              fontSize: 70,
              anchor: "top",
              attributes: { fill: "white" },
            });
            const svgBuffer = Buffer.from(svg);

            const image = await sharp({
              create: {
                width: 100, // Adjust the size as needed
                height: 100,
                channels: 4,
                background: { r: 0, g: 128, b: 0, alpha: 1 }, // Green background
              },
            })
              .composite([{ input: svgBuffer, blend: "over" }])
              .png()
              .toBuffer();
            // console.log(image);
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
              Key: `avatars/${name}.png`, // Name of the image
              Body: image, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
            };
            const data = await s3.upload(params).promise();
            // console.log(data.Location);
            jwt.sign(
              { userId: userId, role: role, region: region },
              process.env.SECRET_KEY,
              { expiresIn: "10m" },
              (err, emailToken) => {
                // console.log(emailToken);
                const url = `${process.env.SERVER}/api/v1/auth/register/confirmation/${emailToken}`;
                let mailTransporter =
                  region === "United States"
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

                const html = `
             <!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Skill Stream</title>
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
      .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        text-align: center;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
      <h2 class="header">Welcome to Skill Stream!</h2>
      <p class="content">
        We're excited to have you on board. Please confirm your account by
        clicking the button below.
      </p>

      <div class="button-container">
        <a href="${url}" class="button" style="color: #ffffff !important;"
>Confirm Account</a>
      </div>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>

                    `;
                let details = {
                  from: `SKILLSTREAM ${
                    region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: email,
                  subject: "SKILLSTREAM - Email Confirmation",
                  text: "Let's confirm your email address",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    const newUser = await usermodel.create({
                      email: email,
                      password: hashedPassword,
                      role: role,
                      name: req.body.name,
                      userId: userId,
                      image: data.Location,
                      isEmailVerified: false,
                      shortlistedJobs: [],
                      region: region,
                      jobAlerts: [],
                      appliedJobs: [],
                      notifications: [],
                      profileCompleted: false,
                      isResumeUploaded: false,
                      lastLoggedIn: new Date(),
                    });

                    res.status(201).json({
                      message: "Please Confirm your email",
                      status: true,
                      userId,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      "Error in sending the mail for registration::",
                      err
                    );
                    res.status(500).json({ error: err, status: false });
                  });
              }
            );
          } else {
            res.status(409).json({
              message: "User already exists.",
              status: false,
            });
          }
        } else {
          res
            .status(403)
            .json({ message: "Please Fill the Empty Field", status: false });
        }
      } else if (role === "Employer") {
        if (email && password) {
          console.log("Regstering");
          const emailDomain = email.split("@")[1].toLowerCase();
          if (personalEmails.includes(emailDomain)) {
            return res.status(400).json({
              status: false,
              message: "Please register using a valid business email address",
            });
          }
          const emailSuffix = email.split("@")[1].toLowerCase();
          const existingUser = await EmployerModel.findOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          const existingOrgUser = await EmployerModel.findOne({
            email: { $regex: `@${emailSuffix}$`, $options: "i" },
            isEmailVerified: true, // VERY IMPORTANT
          });
          console.log("Employer findings completed");
          let copiedOrgId = null;
          let copiedPlan = "Free-trial";
          let copiedSubscribed = false;
          let accessLevel = "User"; // default

          // If someone from same domain exists → copy their orgId + plan + subscribed
          if (existingOrgUser) {
            copiedOrgId = existingOrgUser.organisationId;
            copiedPlan = existingOrgUser.plan;
            copiedSubscribed = existingOrgUser.subscribed;
            accessLevel = "User";
          } else {
            copiedOrgId = await generateUniqueOrgId();
            accessLevel = "Admin";
          }
          // const getallUser = await EmployerModel.find({});
          if (!existingUser) {
            // generating userID
            const maxUserIdUser = await EmployerModel.findOne(
              {},
              {},
              { sort: { userId: -1 } }
            );
            // console.log(maxUserIdUser); // Find user with the maximum userId
            const maxUserId = maxUserIdUser
              ? parseInt(maxUserIdUser.userId.substring(5))
              : 0; // Extract the numeric part of the userId
            // console.log(maxUserId);
            const userCount = maxUserId + 1;
            let userId = "";
            if (userCount < 10) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }000${userCount}`;
            } else if (userCount < 100) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }00${userCount}`;
            } else if (userCount < 1000) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }0${userCount}`;
            } else {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }${userCount}`;
            }
            // console.log(userId);
            console.log("Password Encrypting");

            var salt = await bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const textToSVGInstance = textToSVG.loadSync();
            const organisationId = await generateUniqueOrgId();

            const initialLetter = name.charAt(0).toUpperCase();
            const svg = textToSVGInstance.getSVG(initialLetter, {
              fontSize: 70,
              anchor: "top",
              attributes: { fill: "white" },
            });
            const svgBuffer = Buffer.from(svg);

            const image = await sharp({
              create: {
                width: 100, // Adjust the size as needed
                height: 100,
                channels: 4,
                background: { r: 0, g: 128, b: 0, alpha: 1 }, // Green background
              },
            })
              .composite([{ input: svgBuffer, blend: "over" }])
              .png()
              .toBuffer();

            console.log("Uploading Image");
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
              Key: `avatars/${name}.png`, // Name of the image
              Body: image, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
            };
            const data = await s3.upload(params).promise();
            // console.log(data.Location);
            jwt.sign(
              { userId: userId, role: role, region: region },
              process.env.SECRET_KEY,
              { expiresIn: "10m" },
              (err, emailToken) => {
                // console.log(emailToken);
                const url = `${process.env.SERVER}/api/v1/auth/register/confirmation/${emailToken}`;
                let mailTransporter =
                  region === "United States"
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

                const html = `
             <!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Skill Stream</title>
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
      .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        text-align: center;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
      <h2 class="header">Welcome to Skill Stream!</h2>
      <p class="content">
        We're excited to have you on board. Please confirm your account by
        clicking the button below.
      </p>

      <div class="button-container">
        <a href="${url}" class="button" style="color: #ffffff !important;">Confirm Account</a>
      </div>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
                    `;
                let details = {
                  from: `SKILLSTREAM ${
                    region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: email,
                  subject: "SKILLSTREAM - Email Confirmation",
                  text: "Let's confirm your email address",
                  html: html,
                };
                console.log("Email Sending");

                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    const newUser = await EmployerModel.create({
                      email: email,
                      password: hashedPassword,
                      role: role,
                      companyName: req.body.name,
                      userId: userId,
                      image: data.Location,
                      isEmailVerified: false,
                      jobs: [],
                      shortlistedResumes: [],
                      region: region,
                      resumeAlerts: [],
                      allApplicants: [],
                      notifications: [],
                      profileCompleted: false,

                      linkedInloggedIn: false,
                      jobCount: 0,
                      organisationId: copiedOrgId,
                      access: accessLevel,
                      subscribed: copiedSubscribed, // full access initially
                      trialStart: null,
                      trialEnds: null,
                      remindedDay10: false,
                      remindedDay12: false,
                      remindedDay13: false,
                      remindedDay14: false,
                      plan: copiedPlan,
                    });
                    [];
                    console.log("Email Sent completed");

                    res.status(201).json({
                      message: "Please Confirm your email",
                      status: true,
                      userId,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      "Error in sending the mail for registration::",
                      err
                    );
                    res.status(500).json({ error: err, status: false });
                  });
              }
            );
          } else {
            res.status(409).json({
              message: "Conflict: User already exists.",
              status: false,
            });
          }
        } else {
          res
            .status(403)
            .json({ message: "Please Fill the Empty Field", status: false });
        }
      } else if (role === "Vendor") {
        console.log(req.body);
        if (email && password) {
          const existingUser = await VendorModel.findOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          // const getallUser = await VendorModel.find({});
          if (!existingUser) {
            // generating userID
            const maxUserIdUser = await VendorModel.findOne(
              {},
              {},
              { sort: { userId: -1 } }
            );
            // console.log(maxUserIdUser); // Find user with the maximum userId
            const maxUserId = maxUserIdUser
              ? parseInt(maxUserIdUser.userId.substring(5))
              : 0; // Extract the numeric part of the userId
            // console.log(maxUserId);
            const userCount = maxUserId + 1;
            let userId = "";
            if (userCount < 10) {
              userId = `${
                role === "Candidate"
                  ? "SKSTC"
                  : role === "Employer"
                  ? "SKSTE"
                  : "SKSTV"
              }000${userCount}`;
            } else if (userCount < 100) {
              userId = `${
                role === "Candidate"
                  ? "SKSTC"
                  : role === "Employer"
                  ? "SKSTE"
                  : "SKSTV"
              }00${userCount}`;
            } else if (userCount < 1000) {
              userId = `${
                role === "Candidate"
                  ? "SKSTC"
                  : role === "Employer"
                  ? "SKSTE"
                  : "SKSTV"
              }0${userCount}`;
            } else {
              userId = `${
                role === "Candidate"
                  ? "SKSTC"
                  : role === "Employer"
                  ? "SKSTE"
                  : "SKSTV"
              }${userCount}`;
            }
            // console.log(userId);
            var salt = await bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const textToSVGInstance = textToSVG.loadSync();
            const initialLetter = name.charAt(0).toUpperCase();
            const svg = textToSVGInstance.getSVG(initialLetter, {
              fontSize: 70,
              anchor: "top",
              attributes: { fill: "white" },
            });
            const svgBuffer = Buffer.from(svg);

            const image = await sharp({
              create: {
                width: 100, // Adjust the size as needed
                height: 100,
                channels: 4,
                background: { r: 0, g: 128, b: 0, alpha: 1 }, // Green background
              },
            })
              .composite([{ input: svgBuffer, blend: "over" }])
              .png()
              .toBuffer();
            // console.log(image);
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
              Key: `avatars/${name}.png`, // Name of the image
              Body: image, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
            };
            const data = await s3.upload(params).promise();
            // console.log(data.Location);
            jwt.sign(
              { userId: userId, role: role, region: region },
              process.env.SECRET_KEY,
              { expiresIn: "10m" },
              (err, emailToken) => {
                // console.log(emailToken);
                const url = `${process.env.SERVER}/api/v1/auth/register/confirmation/${emailToken}`;
                let mailTransporter =
                  region === "United States"
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

                const html = `
             <!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Skill Stream</title>
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
      .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        text-align: center;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
      <h2 class="header">Welcome to Skill Stream!</h2>
      <p class="content">
        We're excited to have you on board. Please confirm your account by
        clicking the button below.
      </p>

      <div class="button-container">
        <a href="${url}" class="button" style="color: #ffffff !important;"
>Confirm Account</a>
      </div>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>

                    `;
                let details = {
                  from: `SKILLSTREAM ${
                    region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: email,
                  subject: "SKILLSTREAM - Email Confirmation",
                  text: "Let's confirm your email address",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    const newUser = await VendorModel.create({
                      email: email,
                      password: hashedPassword,
                      role: role,
                      name: req.body.name,
                      userId: userId,
                      image: data.Location,
                      isEmailVerified: false,
                      shortlistedJobs: [],
                      region: region,
                      jobAlerts: [],
                      appliedJobs: [],
                      notifications: [],
                      profileCompleted: false,
                    });
                    await nonVendorModel.deleteOne({
                      email: new RegExp(`^${email}$`, "i"),
                    });
                    res.status(201).json({
                      message: "Please Confirm your email",
                      status: true,
                      userId,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      "Error in sending the mail for registration::",
                      err
                    );
                    res.status(500).json({ error: err, status: false });
                  });
              }
            );
          } else {
            res.status(409).json({
              message: "User already exists.",
              status: false,
            });
          }
        } else {
          res
            .status(403)
            .json({ message: "Please Fill the Empty Field", status: false });
        }
      }
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  },

  async checkLink(req, res) {
    const token = req.params.id;

    let checkLink;
    let Userrole = "Guest";
    let region = "United States";

    try {
      // ✅ VERIFY TOKEN SAFELY
      checkLink = jwt.verify(token, process.env.SECRET_KEY);
      Userrole = checkLink.role;
      region = checkLink.region || region;

      const baseUrl = getRegionBaseUrl(region);

      if (!checkLink.userId) {
        return res.redirect(
          `${baseUrl}/email-status?status=invalid&role=${Userrole}&region=${region}`
        );
      }

      /* ===================== CANDIDATE ===================== */
      if (checkLink.role === "Candidate") {
        const isUserExists = await usermodel.findOne({
          userId: checkLink.userId,
        });

        if (!isUserExists) {
          return res.redirect(
            `${baseUrl}/email-status?status=invalid&role=Candidate&region=${region}`
          );
        }

        if (!isUserExists.isEmailVerified) {
          await usermodel.updateOne(
            { userId: isUserExists.userId },
            {
              $set: {
                isEmailVerified: true,
              },
            }
          );
          await sendPostVerificationEmail({
            email: isUserExists.email,
            role: "Candidate",
            region,
          });
          return res.redirect(
            `${baseUrl}/email-status?status=success&role=Candidate&region=${region}`
          );
        }

        return res.redirect(
          `${baseUrl}/email-status?status=alreadyVerified&role=Candidate&region=${region}`
        );
      }

      /* ===================== EMPLOYER ===================== */
      if (checkLink.role === "Employer") {
        const isUserExists = await EmployerModel.findOne({
          userId: checkLink.userId,
        });

        if (!isUserExists) {
          return res.redirect(
            `${baseUrl}/email-status?status=invalid&role=Employer&region=${region}`
          );
        }

        if (!isUserExists.isEmailVerified) {
          const emailDomain = isUserExists.email.split("@")[1].toLowerCase();
          const blockedDomains = ["hrpundits.com", "vivatechsolutions.io"];
          const isBlocked = blockedDomains.includes(emailDomain);
          let trialEndsForEmail = isUserExists.trialEnds;
          if (isBlocked || isUserExists.subscribed === true) {
            await EmployerModel.updateOne(
              { userId: isUserExists.userId },
              { $set: { isEmailVerified: true } }
            );
          } else {
            const trialStart = new Date();
            const trialEnds = new Date(
              trialStart.getTime() + 14 * 24 * 60 * 60 * 1000
            );
            trialEndsForEmail = trialEnds; // ✅ KEY FIX
            await EmployerModel.updateOne(
              { userId: isUserExists.userId },
              {
                $set: {
                  isEmailVerified: true,
                  trialStart,
                  trialEnds,
                  subscribed: true,
                  plan: "Recommended",
                  remindedDay10: false,
                  remindedDay12: false,
                  remindedDay13: false,
                  remindedDay14: false,
                },
              }
            );
          }

          await sendPostVerificationEmail({
            email: isUserExists.email,
            role: "Employer",
            region,
            plan: isUserExists.plan,
            access: isUserExists.access, // Admin | User
            trialEnds: trialEndsForEmail,
          });

          return res.redirect(
            `${baseUrl}/email-status?status=success&role=Employer&region=${region}`
          );
        }

        return res.redirect(
          `${baseUrl}/email-status?status=alreadyVerified&role=Employer&region=${region}`
        );
      }

      /* ===================== VENDOR ===================== */
      if (checkLink.role === "Vendor") {
        const isUserExists = await VendorModel.findOne({
          userId: checkLink.userId,
        });

        if (!isUserExists) {
          return res.redirect(
            `${baseUrl}/email-status?status=invalid&role=Vendor&region=${region}`
          );
        }

        if (!isUserExists.isEmailVerified) {
          await VendorModel.updateOne(
            { userId: isUserExists.userId },
            { $set: { isEmailVerified: true } }
          );

          return res.redirect(
            `${baseUrl}/email-status?status=success&role=Vendor&region=${region}`
          );
        }

        return res.redirect(
          `${baseUrl}/email-status?status=alreadyVerified&role=Vendor&region=${region}`
        );
      }

      /* ===================== FALLBACK ===================== */
      return res.redirect(
        `${baseUrl}/email-status?status=invalid&role=${Userrole}&region=${region}`
      );
    } catch (error) {
      console.error(error);

      const baseUrl = getRegionBaseUrl(region);

      if (error.name === "TokenExpiredError") {
        return res.redirect(
          `${baseUrl}/email-status?status=expired&role=${Userrole}&region=${region}`
        );
      }

      return res.redirect(
        `${baseUrl}/email-status?status=invalid&role=${Userrole}&region=${region}`
      );
    }
  },
  async resendLink(req, res) {
    try {
      const userId = req.body.userId;
      const role = req.body.role;
      const region = req.body.region;

      console.log(userId, role);
      if (role === "Candidate") {
        const checkUserExist = await usermodel.findOne({
          userId: userId,
        });
        // console.log(checkUserExist);
        if (checkUserExist) {
          if (!checkUserExist.isEmailVerified) {
            jwt.sign(
              { userId: userId, role: role, region: region },
              process.env.SECRET_KEY,
              { expiresIn: "10m" },
              (err, emailToken) => {
                const url = `${process.env.SERVER}/api/v1/auth/register/confirmation/${emailToken}`;
                // console.log(url);
                let mailTransporter =
                  req.body.region === "United States"
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

                const html = `
              <!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Skill Stream</title>
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
      .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        text-align: center;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
      <h2 class="header">Welcome to Skill Stream!</h2>
      <p class="content">
        We're excited to have you on board. Please confirm your account by
        clicking the button below.
      </p>

      <div class="button-container">
        <a href="${url}" class="button" style="color: #ffffff !important;">Confirm Account</a>
      </div>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>

                        `;
                let details = {
                  from: `SKILLSTREAM ${
                    req.body.region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: checkUserExist.email,
                  subject: "SKILLSTREAM - Email Confirmation",
                  text: "Let's confirm your email address",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    res.status(201).json({
                      message: "Confirmation Mail Sent",
                      status: true,
                      userId: checkUserExist.userId,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      "Error in sending the mail for registration::",
                      err
                    );
                    res.status(500).json({ error: err, status: false });
                  });
              }
            );
          } else {
            res
              .status(409)
              .json({ message: "Email Already Verified", status: false });
          }
        } else {
          res
            .status(404)
            .json({ message: "User does not Exists", status: false });
        }
      } else if (role === "Employer") {
        const checkUserExist = await EmployerModel.findOne({
          userId,
        });
        if (checkUserExist) {
          if (!checkUserExist.isEmailVerified) {
            jwt.sign(
              { userId: userId, role: role, region: region },
              process.env.SECRET_KEY,
              { expiresIn: "10m" },
              (err, emailToken) => {
                console.log(err);
                // console.log(emailToken);
                const url = `${process.env.SERVER}/api/v1/auth/register/confirmation/${emailToken}`;
                // console.log(url);
                let mailTransporter =
                  req.body.region === "United States"
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

                const html = `
                   <!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Skill Stream</title>
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
      .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        text-align: center;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
      <h2 class="header">Welcome to Skill Stream!</h2>
      <p class="content">
        We're excited to have you on board. Please confirm your account by
        clicking the button below.
      </p>

      <div class="button-container">
        <a href="${url}" class="button" style="color: #ffffff !important;">Confirm Account</a>
      </div>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
                        `;
                let details = {
                  from: `SKILLSTREAM ${
                    req.body.region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: checkUserExist.email,
                  subject: "SKILLSTREAM - Email Confirmation",
                  text: "Let's confirm your email address",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    res.status(201).json({
                      message: "Confirmation Mail Sent ",
                      status: true,
                      userId: checkUserExist.userId,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      "Error in sending the mail for registration::",
                      err
                    );
                    res.status(500).json({ error: err, status: false });
                  });
              }
            );
          } else {
            res
              .status(409)
              .json({ message: "Email Already Verified", status: false });
          }
        } else {
          res
            .status(404)
            .json({ message: "User does not Exists", status: false });
        }
      } else {
        const checkUserExist = await VendorModel.findOne({
          userId,
        });
        if (checkUserExist) {
          if (!checkUserExist.isEmailVerified) {
            jwt.sign(
              { userId: userId, role: role, region: region },
              process.env.SECRET_KEY,
              { expiresIn: "10m" },
              (err, emailToken) => {
                console.log(err);
                // console.log(emailToken);
                const url = `${process.env.SERVER}/api/v1/auth/register/confirmation/${emailToken}`;
                // console.log(url);
                let mailTransporter =
                  req.body.region === "United States"
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

                const html = `
                   <!DOCTYPE html>
<html>
  <head>
    <title>Welcome to Skill Stream</title>
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
      .logo-container {
        text-align: center;
        margin-bottom: 15px;
      }
      .header {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        text-align: center;
      }
      .content {
        font-size: 16px;
        color: #333;
        padding: 10px 20px;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 20px;
      }
      .footer {
        font-size: 14px;
        color: #666;
        margin-top: 15px;
      }
      .button {
        display: inline-block;
        background-color: #1e90ff;
        color: #ffffff;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-container">
        <img
          src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
          class="logo"
          alt="Skill Stream AI Logo"
        />
      </div>
      <h2 class="header">Welcome to Skill Stream!</h2>
      <p class="content">
        We're excited to have you on board. Please confirm your account by
        clicking the button below.
      </p>

      <div class="button-container">
        <a href="${url}" class="button" style="color: #ffffff !important;">Confirm Account</a>
      </div>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
    </div>
  </body>
</html>
                        `;
                let details = {
                  from: `SKILLSTREAM ${
                    req.body.region === "United States"
                      ? "info@skillstreamjobs.us"
                      : "support@skillstreamjobs.ca"
                  }`,
                  // to: "gokulakrishnan@vivatechsolutions.io",
                  to: checkUserExist.email,
                  subject: "SKILLSTREAM - Email Confirmation",
                  text: "Let's confirm your email address",
                  html: html,
                };
                mailTransporter
                  .sendMail(details)
                  .then(async (info) => {
                    res.status(201).json({
                      message: "Confirmation Mail Sent ",
                      status: true,
                      userId: checkUserExist.userId,
                    });
                  })
                  .catch((err) => {
                    console.log(
                      "Error in sending the mail for registration::",
                      err
                    );
                    res.status(500).json({ error: err, status: false });
                  });
              }
            );
          } else {
            res
              .status(409)
              .json({ message: "Email Already Verified", status: false });
          }
        } else {
          res
            .status(404)
            .json({ message: "User does not Exists", status: false });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },

  async login(req, res) {
    try {
      const { email, password, role, region, captcha } = req.body;
      if (!captcha) {
        return res.status(400).json({ message: "CAPTCHA not verified" });
      }
      const secretKey = "6LcxaGYrAAAAANW5XqvjRlHP5cT8RI66s3CIw3bR"; // Use your actual secret key
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
      const captchaRes = await fetch(verifyUrl, { method: "POST" });
      const captchaData = await captchaRes.json();
      console.log(captchaData);

      if (!captchaData.success) {
        return res.status(400).json({ message: "Failed CAPTCHA verification" });
      }
      if (email && password && role) {
        if (role === "Candidate") {
          const findUser = await usermodel.findOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          if (findUser) {
            const comparePassword = bcrypt.compareSync(
              password,
              findUser.password
            );
            if (comparePassword) {
              if (findUser.isEmailVerified) {
                const accessToken = jwt.sign(
                  {
                    role: findUser.role,
                    userId: findUser.userId,
                    email: findUser.email,
                  },
                  process.env.SECRET_KEY,
                  { expiresIn: "5m" }
                );

                const refreshToken = jwt.sign(
                  {
                    role: findUser.role,
                    userId: findUser.userId,
                    email: findUser.email,
                    profileCompleted: findUser.profileCompleted,
                    isResumeUploaded: findUser.isResumeUploaded,
                  },
                  process.env.REFRESH_KEY,
                  { expiresIn: "1d" }
                );
                if (!findUser.profileCompleted || !findUser.country) {
                  return res.status(403).json({
                    message: "Profile Incomplete. Please update your profile.",
                    status: false,
                    accessToken: refreshToken,
                    userId: findUser.userId,
                    role: findUser.role,
                    profileCompleted: findUser.profileCompleted,
                    isResumeUploaded: findUser.isResumeUploaded,
                  });
                }
                // Define normalized country aliases
                const normalizeCountry = (value = "") => {
                  const country = value.trim().toLowerCase();

                  if (
                    [
                      "us",
                      "usa",
                      "united states",
                      "united states of america",
                    ].includes(country)
                  ) {
                    return "united states";
                  } else if (["ca", "canada"].includes(country)) {
                    return "canada";
                  } else if (["in", "india", "bharat"].includes(country)) {
                    return "india";
                  } else {
                    return country; // default to raw input for other countries
                  }
                };

                const normalizedUserCountry = normalizeCountry(
                  findUser.country
                );
                const normalizedRegion = normalizeCountry(region);
                if (
                  normalizedUserCountry &&
                  normalizedUserCountry !== "india" &&
                  normalizedRegion !== "india" && // Allow India users unrestricted access
                  normalizedUserCountry !== normalizedRegion
                ) {
                  let portal = "";
                  if (normalizedUserCountry === "united states") {
                    portal = process.env.USWEBSITE;
                  } else if (normalizedUserCountry === "canada") {
                    portal = "https://skillstreamjobs.ca";
                  } else if (normalizedUserCountry === "india") {
                    portal = "https://www.skillstreamlabs.com";
                  }

                  return res.status(403).json({
                    message: `You are registered in the ${findUser.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,
                    status: false,
                  });
                }
                res.cookie("jwt", refreshToken, {
                  httpOnly: true,
                  sameSite: "None",
                  secure: true,
                  maxAge: 24 * 60 * 60 * 1000,
                });
                findUser.lastLoggedIn = new Date();
                await findUser.save();

                res.status(200).json({
                  message: "Login Successfully",
                  status: true,
                  userId: findUser.userId,
                  role: findUser.role,
                  accessToken: refreshToken,
                  profileCompleted: findUser.profileCompleted,
                  isResumeUploaded: findUser.isResumeUploaded,
                });
              } else {
                res.status(202).json({
                  message: "Email Verification Pending",
                  status: false,
                  userId: findUser.userId,
                  role: findUser.role,
                  profileCompleted: findUser.profileCompleted,
                  isResumeUploaded: findUser.isResumeUploaded,
                });
              }
            } else {
              res
                .status(403)
                .json({ message: "Invalid Password", status: false });
            }
          } else {
            res
              .status(404)
              .json({ message: "User doe not Exists", status: false });
          }
        } else if (role === "Employer") {
          const findEmployer = await EmployerModel.findOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          if (findEmployer) {
            const comparePassword = bcrypt.compareSync(
              password,
              findEmployer.password
            );
            if (comparePassword) {
              if (findEmployer.isEmailVerified) {
                const accessToken = jwt.sign(
                  {
                    role: findEmployer.role,
                    userId: findEmployer.userId,
                    email: findEmployer.email,
                    organisationId: findEmployer.organisationId,
                  },
                  process.env.SECRET_KEY,
                  { expiresIn: "5m" }
                );

                const refreshToken = jwt.sign(
                  {
                    role: findEmployer.role,
                    userId: findEmployer.userId,
                    email: findEmployer.email,
                    profileCompleted: findEmployer.profileCompleted,
                    subscribed: findEmployer.subscribed,
                    organisationId: findEmployer.organisationId,
                    access: findEmployer.access,
                  },
                  process.env.REFRESH_KEY,
                  { expiresIn: "1d" }
                );
                if (!findEmployer.profileCompleted || !findEmployer.country) {
                  return res.status(403).json({
                    message: "Profile Incomplete. Please update your profile.",
                    status: false,
                    accessToken: refreshToken,
                    userId: findEmployer.userId,
                    role: findEmployer.role,
                    profileCompleted: findEmployer.profileCompleted,
                    subscribed: findEmployer.subscribed,
                    linkedInloggedIn: findEmployer.linkedInloggedIn,
                  });
                }
                const normalizeCountry = (value = "") => {
                  const country = value.trim().toLowerCase();

                  if (
                    [
                      "us",
                      "usa",
                      "united states",
                      "united states of america",
                    ].includes(country)
                  ) {
                    return "united states";
                  } else if (["ca", "canada"].includes(country)) {
                    return "canada";
                  } else if (["in", "india", "bharat"].includes(country)) {
                    return "india";
                  } else {
                    return country; // default to raw input for other countries
                  }
                };

                const normalizedUserCountry = normalizeCountry(
                  findEmployer.country
                );
                const normalizedRegion = normalizeCountry(region);
                if (
                  normalizedUserCountry &&
                  normalizedUserCountry !== "india" &&
                  normalizedRegion !== "india" && // Allow India users unrestricted access
                  normalizedUserCountry !== normalizedRegion &&
                  !findEmployer.allowedCrossOrigins
                ) {
                  let portal = "";
                  if (normalizedUserCountry === "united states") {
                    portal = process.env.USWEBSITE;
                  } else if (normalizedUserCountry === "canada") {
                    portal = "https://skillstreamjobs.ca";
                  } else if (normalizedUserCountry === "india") {
                    portal = "https://www.skillstreamlabs.com";
                  }
                  return res.status(403).json({
                    message: `You are registered in the ${findEmployer.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,

                    status: false,
                  });
                }

                res.cookie("jwt", refreshToken, {
                  httpOnly: true,
                  sameSite: "None",
                  secure: true,
                  maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({
                  message: "Login Successfully",
                  status: true,
                  userId: findEmployer.userId,
                  role: findEmployer.role,
                  accessToken: refreshToken,
                  profileCompleted: findEmployer.profileCompleted,
                  subscribed: findEmployer.subscribed,
                  linkedInloggedIn: findEmployer.linkedInloggedIn,
                });
              } else {
                res.status(202).json({
                  message: "Email Verification Pending",
                  status: false,
                  userId: findEmployer.userId,
                  role: findEmployer.role,
                  profileCompleted: findEmployer.profileCompleted,
                  subscribed: findEmployer.subscribed,
                  linkedInloggedIn: findEmployer.linkedInloggedIn,
                });
              }
            } else {
              res
                .status(403)
                .json({ message: "Invalid Password", status: false });
            }
          } else {
            res
              .status(404)
              .json({ message: "User does not Exists", status: false });
          }
        } else {
          {
            const findEmployer = await VendorModel.findOne({
              email: new RegExp(`^${email}$`, "i"),
            });
            if (findEmployer) {
              const comparePassword = bcrypt.compareSync(
                password,
                findEmployer.password
              );
              if (comparePassword) {
                if (findEmployer.isEmailVerified) {
                  const accessToken = jwt.sign(
                    {
                      role: findEmployer.role,
                      userId: findEmployer.userId,
                      email: findEmployer.email,
                    },
                    process.env.SECRET_KEY,
                    { expiresIn: "5m" }
                  );

                  const refreshToken = jwt.sign(
                    {
                      role: findEmployer.role,
                      userId: findEmployer.userId,
                      email: findEmployer.email,
                      profileCompleted: findEmployer.profileCompleted,
                    },
                    process.env.REFRESH_KEY,
                    { expiresIn: "1d" }
                  );
                  if (!findEmployer.profileCompleted || !findEmployer.country) {
                    return res.status(403).json({
                      message:
                        "Profile Incomplete. Please update your profile.",
                      status: false,
                      accessToken: refreshToken,
                      userId: findEmployer.userId,
                      role: findEmployer.role,
                      profileCompleted: findEmployer.profileCompleted,
                    });
                  }
                  // const normalizeCountry = (value = "") => {
                  //   const country = value.trim().toLowerCase();

                  //   if (
                  //     [
                  //       "us",
                  //       "usa",
                  //       "united states",
                  //       "united states of america",
                  //     ].includes(country)
                  //   ) {
                  //     return "united states";
                  //   } else if (["ca", "canada"].includes(country)) {
                  //     return "canada";
                  //   } else if (["in", "india", "bharat"].includes(country)) {
                  //     return "india";
                  //   } else {
                  //     return country; // default to raw input for other countries
                  //   }
                  // };

                  // const normalizedUserCountry = normalizeCountry(
                  //   findEmployer.country
                  // );
                  // const normalizedRegion = normalizeCountry(region);
                  // if (
                  //   normalizedUserCountry &&
                  //   normalizedUserCountry !== "india" &&
                  //   normalizedRegion !== "india" && // Allow India users unrestricted access
                  //   normalizedUserCountry !== normalizedRegion
                  // ) {
                  //   let portal = "";
                  //   if (normalizedUserCountry === "united states") {
                  //     portal = "https://skillstreamjobs.us";
                  //   } else if (normalizedUserCountry === "canada") {
                  //     portal = "https://skillstreamjobs.ca";
                  //   } else if (normalizedUserCountry === "india") {
                  //     portal = "https://www.skillstreamlabs.com";
                  //   }
                  //   return res.status(403).json({
                  //     message: `You are registered in the ${findEmployer.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,

                  //     status: false,
                  //   });
                  // }

                  res.cookie("jwt", refreshToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                  });
                  res.status(200).json({
                    message: "Login Successfully",
                    status: true,
                    userId: findEmployer.userId,
                    role: findEmployer.role,
                    accessToken: refreshToken,
                    profileCompleted: findEmployer.profileCompleted,
                  });
                } else {
                  res.status(202).json({
                    message: "Email Verification Pending",
                    status: false,
                    userId: findEmployer.userId,
                    role: findEmployer.role,
                    profileCompleted: findEmployer.profileCompleted,
                  });
                }
              } else {
                res
                  .status(403)
                  .json({ message: "Invalid Password", status: false });
              }
            } else {
              res
                .status(404)
                .json({ message: "User does not Exists", status: false });
            }
          }
        }
      } else {
        res
          .status(400)
          .json({ message: "Please provide all fields.", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async googleLogin(req, res) {
    const { credential, clientId } = req.body;
    try {
      // console.log(credential, clientId);
      const { role, region } = req.body;
      console.log(req.body);

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      const { email } = payload;
      // console.log(payload);

      const userid = payload["sub"];
      if (payload) {
        if (role === "Candidate") {
          // console.log(payload);
          const isUserExists = await usermodel.findOne({
            email: new RegExp(`^${payload.email}$`, "i"),
          });
          if (!isUserExists) {
            const maxUserIdUser = await usermodel.findOne(
              {},
              {},
              { sort: { userId: -1 } }
            );
            // console.log(maxUserIdUser) // Find user with the maximum userId
            const maxUserId = maxUserIdUser
              ? parseInt(maxUserIdUser.userId.substring(5))
              : 0; // Extract the numeric part of the userId
            // console.log(maxUserId)
            const userCount = maxUserId + 1;
            let userId = "";
            if (userCount < 10) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }000${userCount}`;
            } else if (userCount < 100) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }00${userCount}`;
            } else if (userCount < 1000) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }0${userCount}`;
            } else {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }${userCount}`;
            }

            const newUser = await usermodel.create({
              email: payload.email,
              password: "GoogleLogin",
              role: role,
              userId: userId,
              image: payload.picture,
              name: payload.given_name,
              isEmailVerified: true,
              shortlistedJobs: [],
              jobAlerts: [],
              appliedJobs: [],
              notifications: [],
              profileCompleted: false,
              isResumeUploaded: false,
              region: region,
              codingPracticeInterviewCount: 0,
              practiceInterviewCount: 0,
              lastLoggedIn: new Date(),
            });

            const refreshToken = jwt.sign(
              {
                role: role,
                userId: userId,
                email: payload.email,
                profileCompleted: newUser.profileCompleted,
                isResumeUploaded: newUser.isResumeUploaded,
              },
              process.env.REFRESH_KEY,
              { expiresIn: "1d" }
            );
            res.status(201).json({
              message: "Registered Successfully",
              status: true,
              userId: userId,
              accessToken: refreshToken,
              role: role,
              profileCompleted: false,
              isResumeUploaded: false,
            });
          } else {
            const refreshToken = jwt.sign(
              {
                role: isUserExists.role,
                userId: isUserExists.userId,
                email: isUserExists.email,
                profileCompleted: isUserExists.profileCompleted,
                isResumeUploaded: isUserExists.isResumeUploaded,
              },
              process.env.REFRESH_KEY,
              { expiresIn: "1d" }
            );
            if (!isUserExists.profileCompleted || !isUserExists.country) {
              return res.status(403).json({
                message: "Profile Incomplete. Please update your profile.",
                status: false,
                accessToken: refreshToken,
                userId: isUserExists.userId,
                role: isUserExists.role,
                profileCompleted: isUserExists.profileCompleted,
                isResumeUploaded: isUserExists.isResumeUploaded,
              });
            }
            const normalizeCountry = (value = "") => {
              const country = value.trim().toLowerCase();

              if (
                [
                  "us",
                  "usa",
                  "united states",
                  "united states of america",
                ].includes(country)
              ) {
                return "united states";
              } else if (["ca", "canada"].includes(country)) {
                return "canada";
              } else if (["in", "india", "bharat"].includes(country)) {
                return "india";
              } else {
                return country; // default to raw input for other countries
              }
            };

            const normalizedUserCountry = normalizeCountry(
              isUserExists.country
            );
            const normalizedRegion = normalizeCountry(region);
            if (
              normalizedUserCountry &&
              normalizedUserCountry !== "india" &&
              normalizedRegion !== "india" && // Allow India users unrestricted access
              normalizedUserCountry !== normalizedRegion
            ) {
              let portal = "";
              if (normalizedUserCountry === "united states") {
                portal = process.env.USWEBSITE;
              } else if (normalizedUserCountry === "canada") {
                portal = "https://skillstreamjobs.ca";
              } else if (normalizedUserCountry === "india") {
                portal = "https://www.skillstreamlabs.com";
              }
              return res.status(403).json({
                message: `You are registered in the ${isUserExists.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,

                status: false,
              });
            }
            res.cookie("jwt", refreshToken, {
              httpOnly: true,
              sameSite: "None",
              secure: true,
              maxAge: 24 * 60 * 60 * 1000,
            });
            isUserExists.lastLoggedIn = new Date();
            await isUserExists.save();
            res.status(200).json({
              message: "Login Successfully",
              userId: isUserExists.userId,
              role: isUserExists.role,
              accessToken: refreshToken,
              profileCompleted: isUserExists.profileCompleted,
              isResumeUploaded: isUserExists.isResumeUploaded,
            });
          }
        } else if (role === "Employer") {
          // console.log(payload);
          const emailDomain = email.split("@")[1].toLowerCase();
          if (personalEmails.includes(emailDomain)) {
            return res.status(400).json({
              status: false,
              message: "Please register using a valid business email address",
            });
          }
          const emailSuffix = email.split("@")[1].toLowerCase();
          // const blockedDomains = ["hrpundits.com", "vivatechsolutions.io"];
          // const isBlocked = blockedDomains.includes(emailDomain);

          const isUserExists = await EmployerModel.findOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          const existingOrgUser = await EmployerModel.findOne({
            email: { $regex: `@${emailSuffix}$`, $options: "i" },
            isEmailVerified: true, // VERY IMPORTANT
          });
          console.log("Employer findings completed");
          let copiedOrgId = null;
          let copiedPlan = null;
          let copiedSubscribed = true;
          let accessLevel = "User"; // default
          let trialStart = null;
          let trialEnds = null;
          // If someone from same domain exists → copy their orgId + plan + subscribed
          if (existingOrgUser) {
            copiedOrgId = existingOrgUser.organisationId;
            copiedPlan = existingOrgUser.plan;
            copiedSubscribed = existingOrgUser.subscribed;
            accessLevel = "User";
          } else {
            copiedOrgId = await generateUniqueOrgId();
            accessLevel = "Admin";
            copiedPlan = "Recommended";
            trialStart = new Date();
            trialEnds = new Date(
              trialStart.getTime() + 14 * 24 * 60 * 60 * 1000
            );
          }
          // const isUserExists = await employerModel.findOne({
          //   email: new RegExp(`^${payload.email}$`, "i"),
          // });
          if (!isUserExists) {
            const maxUserIdUser = await employerModel.findOne(
              {},
              {},
              { sort: { userId: -1 } }
            );
            // console.log(maxUserIdUser) // Find user with the maximum userId
            const maxUserId = maxUserIdUser
              ? parseInt(maxUserIdUser.userId.substring(5))
              : 0; // Extract the numeric part of the userId
            // console.log(maxUserId)
            const userCount = maxUserId + 1;
            let userId = "";
            if (userCount < 10) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }000${userCount}`;
            } else if (userCount < 100) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }00${userCount}`;
            } else if (userCount < 1000) {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }0${userCount}`;
            } else {
              userId = `${
                role === "Candidate" ? "SKSTC" : "SKSTE"
              }${userCount}`;
            }
            const organisationId = await generateUniqueOrgId();

            const newUser = await employerModel.create({
              email: payload.email,
              password: "GoogleLogin",
              role: role,
              userId: userId,
              isEmailVerified: true,
              image: payload.picture,
              companyName: payload.given_name,
              jobs: [],
              social: [],
              shortlistedResumes: [],
              resumeAlerts: [],
              allApplicants: [],
              notifications: [],
              profileCompleted: false,
              // subscribed: false,
              linkedInloggedIn: false,
              jobCount: 0,
              // organisationId: organisationId,
              region: region,
              organisationId: copiedOrgId,
              access: accessLevel,
              subscribed: copiedSubscribed, // full access initially
              trialStart: trialStart,
              trialEnds: trialEnds,
              remindedDay10: false,
              remindedDay12: false,
              remindedDay13: false,
              remindedDay14: false,
              plan: copiedPlan,
            });
            await sendPostVerificationEmail({
              email: email,
              role: "Employer",
              region,
              plan: copiedPlan,
              access: accessLevel, // Admin | User
              trialEnds: trialEnds,
            });
            // console.log(newUser);
            const accessToken = jwt.sign(
              {
                role: role,
                userId: userId,
                email: payload.email,
                profileCompleted: false,
                subscribed: copiedSubscribed,
                organisationId: copiedOrgId,
                access: accessLevel,
              },
              process.env.REFRESH_KEY,
              { expiresIn: "1d" }
            );
            res.status(201).json({
              message: "Registered Successfully",
              status: true,
              userId: userId,
              accessToken: accessToken,
              role: role,
              profileCompleted: newUser.profileCompleted,
              subscribed: copiedSubscribed,
              linkedInloggedIn: newUser.linkedInloggedIn,
            });
          } else {
            // const accessToken = jwt.sign(
            //   {
            //     role: isUserExists.role,
            //     userId: isUserExists.userId,
            //     email: isUserExists.email,
            //     profileCompleted: isUserExists.profileCompleted,
            //     subscribed: isUserExists.subscribed,
            //   },
            //   process.env.SECRET_KEY,
            //   { expiresIn: "5m" }
            // );

            const refreshToken = jwt.sign(
              {
                role: isUserExists.role,
                userId: isUserExists.userId,
                email: isUserExists.email,
                profileCompleted: isUserExists.profileCompleted,
                subscribed: isUserExists.subscribed,
                organisationId: isUserExists.organisationId,
                access: isUserExists.access,
              },
              process.env.REFRESH_KEY,
              { expiresIn: "1d" }
            );

            res.cookie("jwt", refreshToken, {
              httpOnly: true,
              sameSite: "None",
              secure: true,
              maxAge: 24 * 60 * 60 * 1000,
            });
            if (!isUserExists.profileCompleted || !isUserExists.country) {
              return res.status(403).json({
                message: "Profile Incomplete. Please update your profile.",
                status: false,
                accessToken: refreshToken,
                userId: isUserExists.userId,
                role: isUserExists.role,
                profileCompleted: isUserExists.profileCompleted,
                subscribed: isUserExists.subscribed,
                linkedInloggedIn: isUserExists.linkedInloggedIn,
              });
            }
            const normalizeCountry = (value = "") => {
              const country = value.trim().toLowerCase();

              if (
                [
                  "us",
                  "usa",
                  "united states",
                  "united states of america",
                ].includes(country)
              ) {
                return "united states";
              } else if (["ca", "canada"].includes(country)) {
                return "canada";
              } else if (["in", "india", "bharat"].includes(country)) {
                return "india";
              } else {
                return country; // default to raw input for other countries
              }
            };

            const normalizedUserCountry = normalizeCountry(
              isUserExists.country
            );
            const normalizedRegion = normalizeCountry(region);
            if (
              normalizedUserCountry &&
              normalizedUserCountry !== "india" &&
              normalizedRegion !== "india" && // Allow India users unrestricted access
              normalizedUserCountry !== normalizedRegion &&
              !isUserExists.allowedCrossOrigins
            ) {
              let portal = "";
              if (normalizedUserCountry === "united states") {
                portal = process.env.USWEBSITE;
              } else if (normalizedUserCountry === "canada") {
                portal = "https://skillstreamjobs.ca";
              } else if (normalizedUserCountry === "india") {
                portal = "https://www.skillstreamlabs.com";
              }
              return res.status(403).json({
                message: `You are registered in the ${isUserExists.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,
                status: false,
              });
            }
            res.status(200).json({
              message: "Login Successfully",
              userId: isUserExists.userId,
              role: isUserExists.role,
              accessToken: refreshToken,
              profileCompleted: isUserExists.profileCompleted,
              subscribed: isUserExists.subscribed,
              linkedInloggedIn: isUserExists.linkedInloggedIn,
            });
          }
        } else if (role === "Vendor") {
          {
            // console.log(payload);
            const isUserExists = await vendorModel.findOne({
              email: new RegExp(`^${payload.email}$`, "i"),
            });
            if (!isUserExists) {
              const maxUserIdUser = await vendorModel.findOne(
                {},
                {},
                { sort: { userId: -1 } }
              );
              // console.log(maxUserIdUser) // Find user with the maximum userId
              const maxUserId = maxUserIdUser
                ? parseInt(maxUserIdUser.userId.substring(5))
                : 0; // Extract the numeric part of the userId
              // console.log(maxUserId)
              const userCount = maxUserId + 1;
              let userId = "";
              if (userCount < 10) {
                userId = `${
                  role === "Candidate"
                    ? "SKSTC"
                    : role === "Employer"
                    ? "SKSTE"
                    : "SKSTV"
                }000${userCount}`;
              } else if (userCount < 100) {
                userId = `${
                  role === "Candidate"
                    ? "SKSTC"
                    : role === "Employer"
                    ? "SKSTE"
                    : "SKSTV"
                }00${userCount}`;
              } else if (userCount < 1000) {
                userId = `${
                  role === "Candidate"
                    ? "SKSTC"
                    : role === "Employer"
                    ? "SKSTE"
                    : "SKSTV"
                }0${userCount}`;
              } else {
                userId = `${
                  role === "Candidate"
                    ? "SKSTC"
                    : role === "Employer"
                    ? "SKSTE"
                    : "SKSTV"
                }${userCount}`;
              }
              const organisationId = await generateUniqueOrgId();

              const newUser = await vendorModel.create({
                email: payload.email,
                password: "GoogleLogin",
                role: role,
                userId: userId,
                isEmailVerified: true,
                image: payload.picture,
                name: payload.given_name,

                profileCompleted: false,

                region: region,
              });
              await nonVendorModel.deleteOne({
                email: new RegExp(`^${email}$`, "i"),
              });
              // console.log(newUser);
              const accessToken = jwt.sign(
                {
                  role: role,
                  userId: userId,
                  email: payload.email,
                  profileCompleted: false,
                },
                process.env.REFRESH_KEY,
                { expiresIn: "1d" }
              );
              res.status(201).json({
                message: "Registered Successfully",
                status: true,
                userId: userId,
                accessToken: accessToken,
                role: role,
                profileCompleted: newUser.profileCompleted,
              });
            } else {
              // const accessToken = jwt.sign(
              //   {
              //     role: isUserExists.role,
              //     userId: isUserExists.userId,
              //     email: isUserExists.email,
              //     profileCompleted: isUserExists.profileCompleted,
              //     subscribed: isUserExists.subscribed,
              //   },
              //   process.env.SECRET_KEY,
              //   { expiresIn: "5m" }
              // );

              const refreshToken = jwt.sign(
                {
                  role: isUserExists.role,
                  userId: isUserExists.userId,
                  email: isUserExists.email,
                  profileCompleted: isUserExists.profileCompleted,
                },
                process.env.REFRESH_KEY,
                { expiresIn: "1d" }
              );

              res.cookie("jwt", refreshToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
              });
              if (!isUserExists.profileCompleted || !isUserExists.country) {
                return res.status(403).json({
                  message: "Profile Incomplete. Please update your profile.",
                  status: false,
                  accessToken: refreshToken,
                  userId: isUserExists.userId,
                  role: isUserExists.role,
                  profileCompleted: isUserExists.profileCompleted,
                });
              }
              // const normalizeCountry = (value = "") => {
              //   const country = value.trim().toLowerCase();

              //   if (
              //     [
              //       "us",
              //       "usa",
              //       "united states",
              //       "united states of america",
              //     ].includes(country)
              //   ) {
              //     return "united states";
              //   } else if (["ca", "canada"].includes(country)) {
              //     return "canada";
              //   } else if (["in", "india", "bharat"].includes(country)) {
              //     return "india";
              //   } else {
              //     return country; // default to raw input for other countries
              //   }
              // };

              // const normalizedUserCountry = normalizeCountry(
              //   isUserExists.country
              // );
              // const normalizedRegion = normalizeCountry(region);
              // if (
              //   normalizedUserCountry &&
              //   normalizedUserCountry !== "india" &&
              //   normalizedRegion !== "india" && // Allow India users unrestricted access
              //   normalizedUserCountry !== normalizedRegion
              // ) {
              //   let portal = "";
              //   if (normalizedUserCountry === "united states") {
              //     portal = "https://skillstreamjobs.us";
              //   } else if (normalizedUserCountry === "canada") {
              //     portal = "https://skillstreamjobs.ca";
              //   } else if (normalizedUserCountry === "india") {
              //     portal = "https://www.skillstreamlabs.com";
              //   }
              //   return res.status(403).json({
              //     message: `You are registered in the ${isUserExists.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,
              //     status: false,
              //   });
              // }
              res.status(200).json({
                message: "Login Successfully",
                userId: isUserExists.userId,
                role: isUserExists.role,
                accessToken: refreshToken,
                profileCompleted: isUserExists.profileCompleted,
              });
            }
          }
        }
      } else {
        res
          .staus(400)
          .json({ message: "Error Occurred ,Please Try Again", status: false });
      }

      // res.status(200).json({ payload });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async microsoftLogin(req, res) {
    const { token, role, region } = req.body;
    console.log(token, role, region);
    try {
      const microsoftUser = await axios.get(
        "https://graph.microsoft.com/v1.0/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const payload = microsoftUser.data;
      const email = payload.mail || payload.userPrincipalName;
      console.log(email);

      if (role === "Candidate") {
        let user = await usermodel.findOne({
          email: new RegExp(`^${email}$`, "i"),
        });

        if (!user) {
          // Handle user creation (similar to your Google logic)
          // Generate userId based on max count
          const maxUser = await usermodel.findOne(
            {},
            {},
            { sort: { userId: -1 } }
          );
          const count = maxUser ? parseInt(maxUser.userId.substring(5)) + 1 : 1;
          const userId = `SKSTC${count.toString().padStart(4, "0")}`;

          //genrating image with initial letter
          const textToSVGInstance = textToSVG.loadSync();
          const initialLetter = payload.givenName.charAt(0).toUpperCase();
          const svg = textToSVGInstance.getSVG(initialLetter, {
            fontSize: 70,
            anchor: "top",
            attributes: { fill: "white" },
          });
          const svgBuffer = Buffer.from(svg);

          const image = await sharp({
            create: {
              width: 100, // Adjust the size as needed
              height: 100,
              channels: 4,
              background: { r: 0, g: 128, b: 0, alpha: 1 }, // Green background
            },
          })
            .composite([{ input: svgBuffer, blend: "over" }])
            .png()
            .toBuffer();
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
            Key: `avatars/${payload.givenName}.png`, // Name of the image
            Body: image, // Body which will contain the image in buffer format
            ACL: "public-read-write", // defining the permissions to get the public link
            ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
          };
          const data = await s3.upload(params).promise();
          user = await usermodel.create({
            email,
            password: "MicrosoftLogin",
            role,
            userId,
            name: payload.givenName || "MS User",
            image: data.Location, // You may not get image here
            isEmailVerified: true,
            shortlistedJobs: [],
            jobAlerts: [],
            appliedJobs: [],
            notifications: [],
            profileCompleted: false,
            isResumeUploaded: false,
            region: region,
            codingPracticeInterviewCount: 0,
            practiceInterviewCount: 0,
            lastLoggedIn: new Date(),
          });

          const refreshToken = jwt.sign(
            {
              role,
              userId,
              email,
              profileCompleted: false,
              isResumeUploaded: false,
            },
            process.env.REFRESH_KEY,
            { expiresIn: "1d" }
          );

          return res.status(201).json({
            message: "Registered Successfully",
            status: true,
            userId,
            accessToken: refreshToken,
            role,
            profileCompleted: false,
            isResumeUploaded: false,
          });
        } else {
          // Existing user
          const refreshToken = jwt.sign(
            {
              role: user.role,
              userId: user.userId,
              email: user.email,
              profileCompleted: user.profileCompleted,
              isResumeUploaded: user.isResumeUploaded,
            },
            process.env.REFRESH_KEY,
            { expiresIn: "1d" }
          );

          if (!user.profileCompleted || !user.country) {
            return res.status(403).json({
              message: "Profile Incomplete. Please update your profile.",
              status: false,
              accessToken: refreshToken,
              userId: user.userId,
              role: user.role,
              profileCompleted: user.profileCompleted,
              isResumeUploaded: user.isResumeUploaded,
            });
          }

          const normalizeCountry = (value = "") => {
            const country = value.trim().toLowerCase();

            if (
              [
                "us",
                "usa",
                "united states",
                "united states of america",
              ].includes(country)
            ) {
              return "united states";
            } else if (["ca", "canada"].includes(country)) {
              return "canada";
            } else if (["in", "india", "bharat"].includes(country)) {
              return "india";
            } else {
              return country; // default to raw input for other countries
            }
          };

          const normalizedUserCountry = normalizeCountry(user.country);
          const normalizedRegion = normalizeCountry(region);
          if (
            normalizedUserCountry &&
            normalizedUserCountry !== "india" &&
            normalizedRegion !== "india" && // Allow India users unrestricted access
            normalizedUserCountry !== normalizedRegion
          ) {
            let portal = "";
            if (normalizedUserCountry === "united states") {
              portal = process.env.USWEBSITE;
            } else if (normalizedUserCountry === "canada") {
              portal = "https://skillstreamjobs.ca";
            } else if (normalizedUserCountry === "india") {
              portal = "https://www.skillstreamlabs.com";
            }

            return res.status(403).json({
              message: `You are registered in the ${user.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,
              status: false,
            });
          }
          user.lastLoggedIn = new Date();
          await user.save();
          return res.status(200).json({
            message: "Login Successfully",
            userId: user.userId,
            role: user.role,
            accessToken: refreshToken,
            profileCompleted: user.profileCompleted,
            isResumeUploaded: user.isResumeUploaded,
          });
        }
      } else if (role === "Employer") {
        // Employer Flow (similar structure)
        // Same logic but use `employerModel`
        const emailDomain = email.split("@")[1].toLowerCase();
        if (personalEmails.includes(emailDomain)) {
          return res.status(400).json({
            status: false,
            message: "Please register using a valid business email address",
          });
        }
        const emailSuffix = email.split("@")[1].toLowerCase();
        const blockedDomains = ["hrpundits.com", "vivatechsolutions.io"];
        // const isBlocked = blockedDomains.includes(emailDomain);

        let user = await EmployerModel.findOne({
          email: new RegExp(`^${email}$`, "i"),
        });
        const existingOrgUser = await EmployerModel.findOne({
          email: { $regex: `@${emailSuffix}$`, $options: "i" },
          isEmailVerified: true, // VERY IMPORTANT
        });
        console.log("Employer findings completed");
        let copiedOrgId = null;
        let copiedPlan = null;
        let copiedSubscribed = true;
        let accessLevel = "User"; // default
        let trialStart = null;
        let trialEnds = null;
        // let trialStart = new Date();
        // let trialEnds = new Date(
        //   trialStart.getTime() + 14 * 24 * 60 * 60 * 1000
        // );
        // If someone from same domain exists → copy their orgId + plan + subscribed
        if (existingOrgUser) {
          console.log("Exisiting organisation user..");
          copiedOrgId = existingOrgUser.organisationId;
          copiedPlan = existingOrgUser.plan;
          copiedSubscribed = existingOrgUser.subscribed;
          accessLevel = "User";
        } else {
          console.log("new user..");
          copiedOrgId = await generateUniqueOrgId();
          accessLevel = "Admin";
          copiedPlan = "Recommended";
          trialStart = new Date();
          trialEnds = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000);
        }
        // let user = await employerModel.findOne({
        //   email: new RegExp(`^${email}$`, "i"),
        // });

        if (!user) {
          // Handle user creation (similar to your Google logic)
          // Generate userId based on max count
          const maxUser = await employerModel.findOne(
            {},
            {},
            { sort: { userId: -1 } }
          );
          const count = maxUser ? parseInt(maxUser.userId.substring(5)) + 1 : 1;
          const userId = `SKSTE${count.toString().padStart(4, "0")}`;
          //genrating image with initial letter
          const textToSVGInstance = textToSVG.loadSync();
          const initialLetter = payload.givenName.charAt(0).toUpperCase();
          // const organisationId = await generateUniqueOrgId();
          const svg = textToSVGInstance.getSVG(initialLetter, {
            fontSize: 70,
            anchor: "top",
            attributes: { fill: "white" },
          });
          const svgBuffer = Buffer.from(svg);

          const image = await sharp({
            create: {
              width: 100, // Adjust the size as needed
              height: 100,
              channels: 4,
              background: { r: 0, g: 128, b: 0, alpha: 1 }, // Green background
            },
          })
            .composite([{ input: svgBuffer, blend: "over" }])
            .png()
            .toBuffer();
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
            Key: `avatars/${payload.givenName}.png`, // Name of the image
            Body: image, // Body which will contain the image in buffer format
            ACL: "public-read-write", // defining the permissions to get the public link
            ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
          };
          const data = await s3.upload(params).promise();
          user = await employerModel.create({
            email,
            password: "MicrosoftLogin",
            role,
            userId,
            image: data.Location,
            isEmailVerified: true,
            jobs: [],
            social: [],
            shortlistedResumes: [],
            resumeAlerts: [],
            allApplicants: [],
            notifications: [],
            profileCompleted: false,
            // subscribed: false,
            linkedInloggedIn: false,
            jobCount: 0,
            // organisationId: organisationId,
            region: region,
            organisationId: copiedOrgId,
            access: accessLevel,
            subscribed: copiedSubscribed, // full access initially
            trialStart: trialStart,
            trialEnds: trialEnds,
            remindedDay10: false,
            remindedDay12: false,
            remindedDay13: false,
            remindedDay14: false,
            plan: copiedPlan,
          });
          await sendPostVerificationEmail({
            email: email,
            role: "Employer",
            region,
            plan: copiedPlan,
            access: accessLevel, // Admin | User
            trialEnds: trialEnds,
          });
          const refreshToken = jwt.sign(
            {
              role,
              userId,
              email,
              profileCompleted: false,
              subscribed: copiedSubscribed,
              organisationId: copiedOrgId,
              access: accessLevel,
            },
            process.env.REFRESH_KEY,
            { expiresIn: "1d" }
          );

          return res.status(201).json({
            message: "Registered Successfully",
            status: true,
            userId,
            accessToken: refreshToken,
            role,
            profileCompleted: user.profileCompleted,
            subscribed: user.subscribed,
            linkedInloggedIn: user.linkedInloggedIn,
          });
        } else {
          // Existing user
          const refreshToken = jwt.sign(
            {
              role: user.role,
              userId: user.userId,
              email: user.email,
              profileCompleted: user.profileCompleted,
              subscribed: user.subscribed,
              organisationId: user.organisationId,
              access: user.access,
            },
            process.env.REFRESH_KEY,
            { expiresIn: "1d" }
          );

          if (!user.profileCompleted || !user.country) {
            return res.status(403).json({
              message: "Profile Incomplete. Please update your profile.",
              status: false,
              accessToken: refreshToken,
              userId: user.userId,
              role: user.role,
              profileCompleted: user.profileCompleted,
              subscribed: user.subscribed,
              linkedInloggedIn: user.linkedInloggedIn,
            });
          }

          const normalizeCountry = (value = "") => {
            const country = value.trim().toLowerCase();

            if (
              [
                "us",
                "usa",
                "united states",
                "united states of america",
              ].includes(country)
            ) {
              return "united states";
            } else if (["ca", "canada"].includes(country)) {
              return "canada";
            } else if (["in", "india", "bharat"].includes(country)) {
              return "india";
            } else {
              return country; // default to raw input for other countries
            }
          };

          const normalizedUserCountry = normalizeCountry(user.country);
          const normalizedRegion = normalizeCountry(region);
          if (
            normalizedUserCountry &&
            normalizedUserCountry !== "india" &&
            normalizedRegion !== "india" && // Allow India users unrestricted access
            normalizedUserCountry !== normalizedRegion &&
            !user.allowedCrossOrigins
          ) {
            let portal = "";
            if (normalizedUserCountry === "united states") {
              portal = process.env.USWEBSITE;
            } else if (normalizedUserCountry === "canada") {
              portal = "https://skillstreamjobs.ca";
            } else if (normalizedUserCountry === "india") {
              portal = "https://www.skillstreamlabs.com";
            }
            return res.status(403).json({
              message: `You are registered in the ${user.country} region and are attempting to log in from the ${region} region. Please access the ${portal} Website`,
              status: false,
            });
          }

          return res.status(200).json({
            message: "Login Successfully",
            userId: user.userId,
            role: user.role,
            accessToken: refreshToken,
            profileCompleted: user.profileCompleted,
            subscribed: user.subscribed,
            linkedInloggedIn: user.linkedInloggedIn,
          });
        }
      } else {
        // Employer Flow (similar structure)
        // Same logic but use `employerModel`
        let user = await VendorModel.findOne({
          email: new RegExp(`^${email}$`, "i"),
        });

        if (!user) {
          // Handle user creation (similar to your Google logic)
          // Generate userId based on max count
          const maxUser = await VendorModel.findOne(
            {},
            {},
            { sort: { userId: -1 } }
          );
          const count = maxUser ? parseInt(maxUser.userId.substring(5)) + 1 : 1;
          const userId = `SKSTV${count.toString().padStart(4, "0")}`;
          //genrating image with initial letter
          const textToSVGInstance = textToSVG.loadSync();
          const initialLetter = payload.givenName.charAt(0).toUpperCase();
          const organisationId = await generateUniqueOrgId();
          const svg = textToSVGInstance.getSVG(initialLetter, {
            fontSize: 70,
            anchor: "top",
            attributes: { fill: "white" },
          });
          const svgBuffer = Buffer.from(svg);

          const image = await sharp({
            create: {
              width: 100, // Adjust the size as needed
              height: 100,
              channels: 4,
              background: { r: 0, g: 128, b: 0, alpha: 1 }, // Green background
            },
          })
            .composite([{ input: svgBuffer, blend: "over" }])
            .png()
            .toBuffer();
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
            Key: `avatars/${payload.givenName}.png`, // Name of the image
            Body: image, // Body which will contain the image in buffer format
            ACL: "public-read-write", // defining the permissions to get the public link
            ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
          };
          const data = await s3.upload(params).promise();
          user = await VendorModel.create({
            email,
            password: "MicrosoftLogin",
            role,
            userId,
            image: data.Location,
            isEmailVerified: true,
            profileCompleted: false,
            region: region,
          });
          await nonVendorModel.deleteOne({
            email: new RegExp(`^${email}$`, "i"),
          });
          const refreshToken = jwt.sign(
            {
              role,
              userId,
              email,
              profileCompleted: false,
            },
            process.env.REFRESH_KEY,
            { expiresIn: "1d" }
          );

          return res.status(201).json({
            message: "Registered Successfully",
            status: true,
            userId,
            accessToken: refreshToken,
            role,
            profileCompleted: user.profileCompleted,
          });
        } else {
          // Existing user
          const refreshToken = jwt.sign(
            {
              role: user.role,
              userId: user.userId,
              email: user.email,
              profileCompleted: user.profileCompleted,
            },
            process.env.REFRESH_KEY,
            { expiresIn: "1d" }
          );

          if (!user.profileCompleted || !user.country) {
            return res.status(403).json({
              message: "Profile Incomplete. Please update your profile.",
              status: false,
              accessToken: refreshToken,
              userId: user.userId,
              role: user.role,
              profileCompleted: user.profileCompleted,
            });
          }

          return res.status(200).json({
            message: "Login Successfully",
            userId: user.userId,
            role: user.role,
            accessToken: refreshToken,
            profileCompleted: user.profileCompleted,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },

  async micorsoftCallback(req, res) {
    const code = req.query.code;

    try {
      const tokenRes = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID,
          scope: "https://graph.microsoft.com/user.read",
          code,
          redirect_uri: "http://localhost:8080/api/v1/auth/microsoft/callback",
          grant_type: "authorization_code",
          client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token } = tokenRes.data;

      // Use token to fetch user info
      const userRes = await axios.get("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const microsoftUser = userRes.data;
      const email = microsoftUser.mail || microsoftUser.userPrincipalName;

      // Find or create user in your DB
      let user = await employerModel.findOne({ email });
      if (!user) {
        user = await employerModel.create({
          // name: microsoftUser.displayName,
          email,
        });
      }
      // const token = jwt.sign({ id: user._id }, 'your_jwt_secret');

      res.status(200).json({ message: "Logged in successfully", user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};

module.exports = controller;
// async microsoftLogin(req, res) {
//   try {
//     const params = new URLSearchParams({
//       client_id: process.env.MICROSOFT_CLIENT_ID,
//       response_type: "code",
//       redirect_uri: "http://localhost:8080/api/v1/auth/microsoft/callback",
//       response_mode: "query",
//       scope: "https://graph.microsoft.com/user.read openid profile email",
//     });

//     res.redirect(
//       `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`
//     );
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error, status: false });
//   }
// },

// async micorsoftCallback(req, res) {
//   try {
//     res.send(`Logged in successfully as ${req.user.email}`);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error, status: false });
//   }
// },
