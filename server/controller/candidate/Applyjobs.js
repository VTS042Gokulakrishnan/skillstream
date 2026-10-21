const candidateModel = require("../../models/candidateModel");
const employerModel = require("../../models/employerModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const axios = require("axios");

const controller = {
  async applyJob(req, res) {
    try {
      const { userId, employerId } = req.params;
      const { jobId, region } = req.body;
      // console.log("hi");
      if (userId && employerId && jobId) {
        if (!await require("../../services/jobAvailability").isAvailable(employerId, jobId)) {
          return res.status(410).json({ message: "This job is no longer available.", status: false });
        }
        const candidate = await candidateModel.findOne({ userId });
        if (candidate?.appliedJobs.some((job) => job.jobId === jobId)) {
          return res
            .status(400)
            .json({ message: "Job already Applied", status: false });
        } else {
          const userDetails = await candidateModel.findOne({ userId });
          const employerDetails = await employerModel.findOne({
            userId: employerId,
          });
          const jobEntireData = employerDetails?.jobs.find(
            (j) => j.jobId === jobId
          );
          if (!jobEntireData || jobEntireData.status !== "Active") return res.status(410).json({ message: "This job is no longer available.", status: false });
          const jobDetails = {
            job_title: jobEntireData.JobTitle,
            company: jobEntireData.companyName,
            location: `${(jobEntireData.City, jobEntireData.State)}`,
            education_required: jobEntireData.Qualification,
            skills_required: jobEntireData.jobSkills,
            job_description: jobEntireData.JobDescription,
          };
          const candidateInfo = {
            basic_info: {
              full_name: userDetails.name,
              email: userDetails.email,
              City: userDetails.city,
              Country: userDetails.country,
              Province: userDetails.state,
              Experience_in_Years: userDetails.experience,
              Experience_level: userDetails.Experience_level,
              Job_Title: userDetails.jobTitle,
            },
            education: userDetails.Education,
            work_experience: userDetails.work_experience,
            skills: userDetails.skills,
          };
          let body = {
            job_description: jobDetails,
            candidate_info: candidateInfo,
          };
          // console.log(body);

          const { data } = await axios.post(
            `${process.env.AI_URL}/fitment_analysis`,
            body
          );
          if (!await require("../../services/jobAvailability").isAvailable(employerId, jobId)) return res.status(410).json({ message: "This job is no longer available.", status: false });
          const addCandidate = await employerModel.updateOne(
            { userId: employerId, jobs: { $elemMatch: { jobId, status: "Active" } } },
            {
              $push: {
                "jobs.$.applicants": {
                  userId,
                  jobId,
                  name: userDetails.name,
                  resume: userDetails.resume,
                  image: userDetails.image,
                  position: userDetails.position,
                  jobTitle: userDetails.jobTitle,
                  currentSalary: userDetails.currentSalary,
                  city: userDetails.city,
                  country: userDetails.country,
                  skills: userDetails.skills,
                  work_experience: userDetails.work_experience,
                  experience: userDetails.experience,
                  education: userDetails.Education,
                  email: userDetails.email,
                  phone: userDetails.phone_number,
                  Experience_level: userDetails.Experience_level,
                  state: userDetails.state,
                  appliedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  applicationStatus: "pending",
                  id: userDetails._id,
                  fitmentSummary: JSON.stringify(data),
                  matchingScore: data.fitment_score,
                  preCallQuestion: data.screening_questions,
                },
                notifications: {
                  name: userDetails.name,
                  userId: userId,
                  id: userDetails._id,
                  jobId,
                  JobTitle: req.body.JobTitle,
                  image: userDetails.image,
                  resume: userDetails.resume,
                  currentSalary: userDetails.currentSalary,
                  appliedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  applicationStatus: "pending",
                  type: "Apply Job",
                  read: false,
                },
                allApplicants: {
                  userId,
                  jobId,
                  name: userDetails.name,
                  resume: userDetails.resume,
                  image: userDetails.image,
                  position: userDetails.position,
                  jobTitle: userDetails.jobTitle,
                  currentSalary: userDetails.currentSalary,
                  city: userDetails.city,
                  country: userDetails.country,
                  skills: userDetails.skills,
                  work_experience: userDetails.work_experience,
                  experience: userDetails.experience,
                  education: userDetails.Education,
                  email: userDetails.email,
                  phone: userDetails.phone_number,
                  Experience_level: userDetails.Experience_level,
                  state: userDetails.state,
                  appliedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  applicationStatus: "pending",
                  id: userDetails._id,
                  isVendorApplicants: false,
                },
              },
            }
          );
          if (!addCandidate.modifiedCount) return res.status(410).json({ message: "This job is no longer available.", status: false });
          const addJob = await candidateModel.updateOne(
            { userId },
            {
              $push: {
                appliedJobs: {
                  jobId,
                  JobTitle: req.body.JobTitle,
                  role: req.body.role,
                  companyName: req.body.companyName,
                  image: employerDetails.image,
                  employerId,
                  Industry: req.body.Industry,
                  offeredSalary: req.body.offeredSalary,
                  employmentType: req.body.employmentType,
                  jobType: req.body.jobType,
                  appliedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  status: req.body.status,
                  city: req.body.city,
                  country: req.body.country,
                  applicationStatus: "pending",
                  isVendorApplicants: false,
                },
              },
            }
          );
          // console.log(addJob);
          const sendUserSocket = onlineUsers.get(employerId);
          if (sendUserSocket) {
            req.app
              .get("io")
              .to(sendUserSocket)
              .emit("newNotification", {
                type: "Apply Job",
                message: `${userDetails.name} applied for the Job ${req.body.JobTitle}`,
                data: {
                  name: userDetails.name,
                  userId: userId,
                  id: userDetails._id,
                  jobId,
                  JobTitle: req.body.JobTitle,
                  image: userDetails.image,
                  resume: userDetails.resume,
                  currentSalary: userDetails.currentSalary,
                  appliedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  applicationStatus: "pending",
                  type: "Apply Job",
                  read: false,
                },
              });
            console.log("Notification sent");
          }
          // res.status(200).json({ message: "Applied Job Successfully" });
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
    <title>New Job Application - ${req.body.JobTitle}</title>
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
        <h2 class="header">New Job Application Received</h2>
        <p class="content">
            Hello <strong>${employerDetails.companyName}</strong>,<br><br>
            A new candidate <strong>${userDetails.name}</strong> has applied for the position of <strong>${req.body.JobTitle}</strong> at your company.
        </p>
        <p class="content">
            You can review the candidate's resume by clicking the button below:
        </p>
        <div class="button-container">
            <a href=https://docs.google.com/viewerng/viewer?url=${userDetails.resume} class="button" style="color: #ffffff !important;">View Resume</a>
        </div>
        <p class="content">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>      
                  `;
          // console.log(email);
          //   email details
          let details = {
            from: `SKILLSTREAM  ${
              region === "United States"
                ? "info@skillstreamjobs.us"
                : "support@skillstreamjobs.ca"
            }`,
            to: `${req.body.email},${employerDetails.email}`,
            subject: `Application for ${req.body.JobTitle}`,
            text: `Application for ${req.body.JobTitle}`,
            html: html,
            replyTo: userDetails.email,

            //   html: html,
          };

          //   sending the mail for registeration
          mailTransporter
            .sendMail(details)
            .then((info) => {
              res.status(200).json({
                message: "Job Applied Sucessfully",
                status: true,
              });
            })
            .catch((err) =>
              console.log("Error in sending the mail for contact us form", err)
            );
        }

        // console.log(addCandidate);
      } else {
        res.status(400).json({ error: "Missing required fields" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getAllAppliedJobs(req, res) {
    try {
      const { userId } = req.params;
      if (userId) {
        const userDetail = await candidateModel.findOne(
          { userId },
          { appliedJobs: 1, resume: 1, _id: 0 }
        );
        console.log(userDetail);
        res
          .status(200)
          .json({ appliedJobs: userDetail, resume: userDetail.resume });
      } else {
        res.status(400).json({ error: "User Id is missing" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deleteAppliedJobs(req, res) {
    try {
      let { jobId, userId } = req.params;
      // console.log(jo);
      const deleteshortlisted = await candidateModel.updateOne(
        { userId },
        {
          $pull: {
            appliedJobs: { jobId },
          },
        }
      );
      console.log(deleteshortlisted);
      res.status(200).json({
        message: "Applied Deleted Successfully",
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
