const candidateModel = require("../../models/candidateModel");
const employerModel = require("../../models/employerModel");
const vendorModel = require("../../models/vendorModel");

const moment = require("moment");
const nodemailer = require("nodemailer");

const controller = {
  async shortlistedJobs(req, res) {
    try {
      const { userId } = req.params;
      const { jobId, region, role } = req.body;
      console.log(userId, role);

      // Check if the job is already shortlisted
      let candidate;
      if (role === "Candidate") {
        candidate = await candidateModel.findOne({ userId });
      } else if (role === "Vendor") {
        candidate = await vendorModel.findOne({ userId });
      } else {
        return res.status(400).json({ message: "Invalid role", status: false });
      }

      if (!candidate) {
        return res
          .status(404)
          .json({ message: "User not found", status: false });
      }

      const employerDetails = await employerModel.findOne({
        userId: req.body.empId,
      });

      // Check if already shortlisted
      if (
        Array.isArray(candidate.shortlistedJobs) &&
        candidate.shortlistedJobs.some((job) => job.jobId === jobId)
      ) {
        return res
          .status(400)
          .json({ message: "Job already shortlisted", status: false });
      } else {
        if (role == "Candidate") {
          const Shorlist = await candidateModel.updateOne(
            { userId },
            {
              $push: {
                shortlistedJobs: {
                  jobId: req.body.jobId,
                  jobTitle: req.body.jobTitle,
                  shortlistedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  companyName: req.body.companyName,
                  categories: req.body.categories,
                  city: req.body.city,
                  country: req.body.country,
                  logo: req.body.logo,
                  status: req.body.status,
                  empId: req.body.empId,
                },
              },
            }
          );
        } else {
          const Shorlist = await vendorModel.updateOne(
            { userId },
            {
              $push: {
                shortlistedJobs: {
                  jobId: req.body.jobId,
                  jobTitle: req.body.jobTitle,
                  shortlistedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  companyName: req.body.companyName,
                  categories: req.body.categories,
                  city: req.body.city,
                  country: req.body.country,
                  logo: req.body.logo,
                  status: req.body.status,
                  empId: req.body.empId,
                },
              },
            }
          );
        }

        const addCandidate = await employerModel.updateOne(
          { userId: req.body.empId },
          {
            $push: {
              notifications: {
                name: candidate.name,
                userId: userId,
                jobId: req.body.jobId,
                JobTitle: req.body.jobTitle,
                image: candidate.image,
                resume: candidate.resume,
                currentSalary: candidate.currentSalary,
                shortlistedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: req.body.status,
                type: "Shortlist Job",
                read: false,
              },
            },
          }
        );
        const sendUserSocket = onlineUsers.get(req.body.empId);
        if (sendUserSocket) {
          req.app
            .get("io")
            .to(sendUserSocket)
            .emit("newNotification", {
              type: "Shortlist Job",
              message: `${candidate.name} shortlisted the Job ${req.body.jobTitle}`,
              data: {
                name: candidate.name,
                userId: userId,
                jobId: req.body.jobId,
                JobTitle: req.body.jobTitle,
                image: candidate.image,
                resume: candidate.resume,
                currentSalary: candidate.currentSalary,
                shortlistedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: req.body.status,
                type: "Shortlist Job",
                read: false,
              },
            });
          console.log("Notification sent");
        }
        // console.log(Shorlist);
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

        //   HTML for the email
        const html = `
 <!DOCTYPE html>
<html>
<head>
    <title>Candidate Shortlisted - ${req.body.jobTitle}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
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
        .logo-container {
            text-align: center;
            margin-bottom: 10px;
        }
        .logo {
            width: 150px;
        }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
            text-align: center;
            margin-bottom: 15px;
        }
        .content {
            font-size: 16px;
            color: #333;
            text-align: left;
            padding: 10px 20px;
        }
        .button-container {
            text-align: center;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
        </div>
        <h2 class="header">Candidate Shortlisted</h2>
        <p class="content">
            Hello <strong>${employerDetails?.companyName}</strong>,<br><br>
            The candidate <strong>${candidate.name}</strong> has been shortlisted for the <strong>${req.body.jobTitle}</strong> job.
        </p>
        <p class="content">
            You can review the candidate's resume by clicking the button below:
        </p>
        <div class="button-container">
            <a href=https://docs.google.com/viewerng/viewer?url=${candidate.resume} class="button" style="color: #ffffff !important;">View Resume</a>
        </div>
        <p class="content">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>                
                `;

        //   email details
        let details = {
          from: `SKILLSTREAM  ${
            region === "United States"
              ? "info@skillstreamjobs.us"
              : "support@skillstreamjobs.ca"
          }`,
          to: `${req.body.email},${employerDetails?.email}`,
          subject: `${req.body.jobTitle} - Shorlisted Job`,
          text: `${req.body.jobTitle} -Shorlisted Job `,
          html: html,
          replyTo: candidate.email,
        };

        //   sending the mail for registeration
        mailTransporter
          .sendMail(details)
          .then((info) => {
            res.status(200).json({
              message: "Job Shortlisted Sucessfully",
              status: true,
            });
          })
          .catch((err) =>
            console.log("Error in sending the mail for contact us form", err)
          );
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getShortlistedJobs(req, res) {
    try {
      const { userId, role } = req.params;
      let getShortlisted;
      if (role === "Candidate") {
        getShortlisted = await candidateModel.findOne({ userId });
      } else if (role === "Vendor") {
        getShortlisted = await vendorModel.findOne({ userId });
      } else {
        return res.status(400).json({ message: "Invalid role", status: false });
      }
      if (getShortlisted) {
        console.log(getShortlisted);
        if (getShortlisted.shortlistedJobs.length != 0) {
          res.status(200).json({ shortlisted: getShortlisted.shortlistedJobs });
        } else {
          res
            .status(400)
            .json({ message: "No Shortlisted Jobs", status: false });
        }
      } else {
        res.status(400).json({ message: "User ID not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deleteShortlistedJobs(req, res) {
    try {
      let { jobId, userId, role } = req.params;
      if (role === "Candidate") {
        const deleteshortlisted = await candidateModel.updateOne(
          { userId },
          {
            $pull: {
              shortlistedJobs: { jobId },
            },
          }
        );
      } else {
        const deleteshortlisted = await vendorModel.updateOne(
          { userId },
          {
            $pull: {
              shortlistedJobs: { jobId },
            },
          }
        );
      }

      res.status(200).json({
        message: "Shorlisted Jobs Deleted Successfully",
        status: true,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};
module.exports = controller;
