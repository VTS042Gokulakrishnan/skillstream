const employerModel = require("../models/employerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sharp = require("sharp");
const textToSVG = require("text-to-svg");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const controller = {
  async createUser(req, res) {
    try {
      const { email, adminEmail, password, role, region, userType } = req.body;
      const adminDetails = await employerModel.findOne({ email: adminEmail });
      const existingUser = await employerModel.findOne({ email: email });
      // const getallUser = await employerModel.find({});
      if (!existingUser) {
        // generating userID
        const maxUserIdUser = await employerModel.findOne(
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
          userId = `SKSTE000${userCount}`;
        } else if (userCount < 100) {
          userId = `SKSTE00${userCount}`;
        } else if (userCount < 1000) {
          userId = `SKSTE0${userCount}`;
        } else {
          userId = `SKSTE${userCount}`;
        }
        var salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await employerModel.create({
          email: email,
          password: hashedPassword,
          role: role,
          companyName: adminDetails.companyName,
          userId: userId,
          image: adminDetails.image
            ? adminDetails.image
            : "https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
          isEmailVerified: true,
          jobs: [],
          organisationId: adminDetails.organisationId,
          shortlistedResumes: [],
          region: region,
          resumeAlerts: [],
          allApplicants: [],
          notifications: [],
          profileCompleted: true,
          subscribed: adminDetails.subscribed,
          linkedInloggedIn: false,
          jobCount: 0,
          access: userType,
          plan: adminDetails.plan,
        });
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
        const loginUrl =
          region === "United States"
            ? process.env.USWEBSITE
            : region === "Canada"
            ? "https://www.skillstreamjobs.ca"
            : "https://www.skillstreamlabs.com";
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>Welcome to Skill Stream</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: Arial, sans-serif;
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
      text-align: left;
      padding: 10px 20px;
    }
    .button {
      display: inline-block;
      background-color: #1e90ff;
      color: #ffffff;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      font-size: 14px;
      color: #666;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream Logo" />
    <h2 class="header">Your Skill Stream Account Has Been Created</h2>
    <p class="content">
      Hello <strong>${email}</strong>,
    </p>
    <p class="content">
      An account has been created for you under the organization <strong>${adminDetails.companyName}</strong>. Below are your login credentials:
    </p>
    <p class="content">
      <strong>Username:</strong> ${email}<br/>
      <strong>Password:</strong> ${password}
    </p>
    <p class="content">
      Please log in and update your password after first login.
    </p>
    <a href=${loginUrl} class="button" style="color: #ffffff !important;" target="_blank">Login to Skill Stream</a>
    <p class="content">
      If you did not expect this email, please contact your administrator.
    </p>
    <p class="footer">
      Best regards,<br/>
      <strong>Team Skill Stream</strong>
    </p>
  </div>
</body>
</html>`;
        let details = {
          from:
            region === "United States"
              ? "info@skillstreamjobs.us"
              : "support@skillstreamjobs.ca",
          to: email,
          subject: "Skill Steam Login Details",
          text: "User Account Created",
          html: html,
        };
        mailTransporter
          .sendMail(details)
          .then(async (info) => {
            res.status(201).json({
              message: "User Created Successfully",
              status: true,
            });
          })
          .catch((err) =>
            console.log("Error in sending the mail for User Creation", err)
          );
      } else {
        res.status(409).json({
          message: "User already exists.",
          status: false,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error, status: false });
    }
  },
  async getUser(req, res) {
    try {
      const { organisationId } = req.params;
      const getUsers = await employerModel.aggregate([
        { $match: { organisationId } },
        {
          $project: {
            email: 1,
            password: 1,
            organisationId: 1,
            userId: 1,
            _id: 1,
            access: 1,
            jobs: { $size: { $ifNull: ["$jobs", []] } },
          },
        },
      ]);

      // console.log(getUsers);
      res.status(200).json({ users: getUsers, status: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error, status: false });
    }
  },

  async editUser(req, res) {
    try {
      const { email, password, userType } = req.body;
      const isUserExists = await employerModel.findOne({ email });
      if (!isUserExists) {
        return res
          .status(404)
          .json({ message: "User not Found", status: false });
      }
      const updateUser = await employerModel.updateOne(
        { email: email },
        {
          $set: {
            email: email,
            password: password,
            access: userType,
          },
        }
      );
      res.status(200).json({ message: "User Details Updated", status: false });
    } catch (error) {
      console.error(error);
    }
  },
  async deleteUser(req, res) {
    try {
      const { email } = req.body;

      const deletedUser = await require("../services/jobDeletion").deleteEmployer(email);

      if (!deletedUser) {
        return res
          .status(404)
          .json({ message: "User not found", status: false });
      }

      res
        .status(200)
        .json({ message: "User deleted successfully", status: true });
    } catch (error) {
      console.error("Delete User Error:", error);
      res.status(500).json({ error: "Failed to delete user", status: false });
    }
  },
};

module.exports = controller;
