const employerModel = require("../../models/employerModel");
const applicantModel = require("../../models/applicantsModel");
const formidable = require("formidable");
const axios = require("axios");
const nodemailer = require("nodemailer");
const controller = {
  async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const isUserCheck = await employerModel.findOne({ userId });
      if (isUserCheck) {
        const updateDetails = await employerModel.updateOne(
          { userId },
          { $set: req.body }
        );
        console.log(updateDetails);
        if (updateDetails.acknowledged) {
          res
            .status(201)
            .json({ message: "Successfully updated profile", status: true });
        } else {
          res
            .status(400)
            .json({ message: "Error in updating the details", status: false });
        }
      } else {
        res.status(404).json({ message: "userid  not found ", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async getAllEmployers(req, res) {
    try {
      const getAllUsers = await employerModel.aggregate([
        { $match: { role: "Employer" } },
        {
          $project: {
            userId: 1,
            image: 1,
            organisationId: 1,
            country: 1,
            email: 1,
            _id: 1,
            primaryIndustry: 1,
            access: 1,
            primaryIndustry: 1,
            state: 1,
            country: 1,
            city: 1,
            companyName: 1,
            jobs: { $size: { $ifNull: ["$jobs", []] } },
          },
        },
      ]);
      // console.log(getAllUsers);
      res.status(200).json({ Employers: getAllUsers });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async getEmployer(req, res) {
    try {
      const { userId } = req.params;
      // console.log(userId);
      const getUsers = await employerModel.find({
        userId,
      });
      // const getUsers = await employerModel.aggregate([
      //   { $match: { userId: String(userId) } },
      //   { $unwind: "$jobs" }, // Important: unwind the jobs array first
      //   {
      //     $project: {
      //       role: 1,
      //       image: 1,
      //       companyName: 1,
      //       country: 1,
      //       state: 1,
      //       city: 1,
      //       primaryIndustry: 1,
      //       phone: 1,
      //       email: 1,
      //       userId: 1,
      //       description: 1,
      //       foundedIn: 1,
      //       social: 1,
      //       website: 1,
      //       categories: 1,
      //       messages: 1,
      //       subscribed: 1,
      //       plan: 1,
      //       subscriptionDate: 1,
      //       stripeSubscriptionId: 1,
      //       securityCode: 1,
      //       linkedInloggedIn: 1,
      //       access: 1,
      //       organisationId: 1,
      //       region: 1,
      //       stripeCustomerId: 1,
      //       isEmailVerified: 1,
      //       password: 1,
      //       job: {
      //         jobId: "$jobs.jobId",
      //         JobTitle: "$jobs.JobTitle",
      //         JobType: "$jobs.JobType",
      //         Country: "$jobs.Country",
      //         isVendor: "$jobs.isVendor",
      //         Industry: "$jobs.Industry",
      //         jobSkills: "$jobs.jobSkills",
      //         City: "$jobs.City",
      //         State: "$jobs.State",
      //         userId: "$jobs.userId",
      //         employmentType: "$jobs.employmentType",
      //         offeredSalary: "$jobs.offeredSalary",
      //         time: "$jobs.time",
      //         postedTime: "$jobs.postedTime",
      //         status: "$jobs.status",
      //         companyName: "$jobs.companyName",
      //         ApplicationDeadlineDate: "$jobs.ApplicationDeadlineDate",
      //         JobDescription: "$jobs.JobDescription",
      //         image: "$jobs.image",
      //         applicants: {
      //           $map: {
      //             input: { $ifNull: ["$jobs.applicants", []] },
      //             as: "a",
      //             in: {
      //               isVendorApplicant: "$$a.isVendorApplicant",
      //               applicationStatus: "$$a.applicationStatus",
      //               time: "$$a.time",
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: "$userId",
      //       image: { $first: "$image" },
      //       companyName: { $first: "$companyName" },
      //       country: { $first: "$country" },
      //       city: { $first: "$city" },
      //       state: { $first: "$state" },
      //       primaryIndustry: { $first: "$primaryIndustry" },
      //       phone: { $first: "$phone" },
      //       email: { $first: "$email" },
      //       userId: { $first: "$userId" },
      //       description: { $first: "$description" },
      //       foundedIn: { $first: "$foundedIn" },
      //       social: { $first: "$social" },
      //       website: { $first: "$website" },
      //       categories: { $first: "$categories" },
      //       messages: { $first: "$messages" },
      //       subscribed: { $first: "$subscribed" },
      //       plan: { $first: "$plan" },
      //       subscriptionDate: { $first: "$subscriptionDate" },
      //       stripeSubscriptionId: { $first: "$stripeSubscriptionId" },
      //       securityCode: { $first: "$securityCode" },
      //       linkedInloggedIn: { $first: "$linkedInloggedIn" },
      //       access: { $first: "$access" },
      //       organisationId: { $first: "$organisationId" },
      //       region: { $first: "$region" },
      //       stripeCustomerId: { $first: "$stripeCustomerId" },
      //       isEmailVerified: { $first: "$isEmailVerified" },
      //       password: { $first: "$password" },
      //       jobs: { $push: "$job" }, // aggregate back into an array of job objects
      //     },
      //   },
      // ]);
      // console.log(getUsers);
      if (getUsers?.length != 0) {
        res.status(200).json({ Employer: getUsers, status: true });
      } else {
        res.status(404).json({ message: "user not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async searchEmployer(req, res) {
    try {
      const { c } = req.query;
      console.log(c);
      const search = await employerModel
        .find({
          companyName: { $regex: c, $options: "i" },
        })
        .select(["email", "companyName", "image", "_id", "userId"]);

      res.status(200).json({ search });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message, status: false });
    }
  },
  async sendEmail(req, res) {
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
      });
      await form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error(err); // Log the error for debugging purposes
          res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
          return; // Return early on error
        } else {
          const { from, emails, subject, message, Resumes, region } = fields;
          // const emailList = JSON.parse(emails); // Since emails are sent as a stringified array
          let attachment = files.attachment;
          console.log(attachment);

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

          // HTML for the email
          const html = `<!DOCTYPE html>
<html>
<head>
    <title>${subject}</title>
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
        .logo {
            display: block;
            width: 150px;
            margin: 0 auto 10px;
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
            text-align: left;
            padding: 10px 20px;
        }
        .footer {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            text-align: left;

        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
        <h2 class="header">${subject}</h2>
        <p class="content">${message}</p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>
</html>`;

          // Prepare the attachment if it exists
          let attachments = [];
          if (attachment) {
            attachments.push({
              filename: attachment.originalFilename,
              path: attachment.filepath,
              contentType: attachment.mimetype,
            });
          }
          if (Resumes) {
            console.log(Resumes.split(","));
            const resumeAttachments = Resumes.split(",");
            for (let i = 0; i < resumeAttachments.length; i++) {
              // console.log(resumeAttachments);

              const response = await axios.get(resumeAttachments[i], {
                responseType: "arraybuffer",
              });

              const filename = decodeURIComponent(
                resumeAttachments[i].split("/").pop()
              );
              const fileBuffer = Buffer.from(response.data, "binary");

              // Create an attachment object for Nodemailer
              attachments.push({
                filename: filename,
                content: fileBuffer,
                contentType: response.headers["content-type"],
              });
            }
          }
          console.log(attachments);

          // Loop through each email and send the email

          let details = {
            from: `SKILLSTREAM  ${
              region === "United States"
                ? "info@skillstreamjobs.us"
                : "support@skillstreamjobs.ca"
            }`,
            to: emails,
            subject: `${subject}`,
            text: `${subject}`,
            html: html,
            attachments: attachments,
            replyTo: from,
          };

          try {
            const mail = await mailTransporter.sendMail(details);
            console.log(mail.envelope);
          } catch (err) {
            console.log("Error in sending the mail for contact us form", err);
            // You can also accumulate these errors if needed
          }

          res.status(200).json({
            message: "Email Sent Successfully",
            status: true,
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },

  async updateNotifactionRead(req, res) {
    try {
      const { empId } = req.params;
      await employerModel.updateOne(
        { userId: empId },
        { $set: { "notifications.$[].read": true } } // 👈 set all to true
      );

      res.json({ status: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications:", err);
      res.status(500).json({ status: false, message: "Server error" });
    }
  },
};

module.exports = controller;
