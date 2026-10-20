const nodemailer = require("nodemailer");
const candidateModel = require("../models/candidateModel");
const employerModel = require("../models/employerModel");
const nonUserModel = require("../models/nonUsersModel");
const Aws = require("aws-sdk");
const formidable = require("formidable");
const fs = require("fs");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const FormData = require("form-data");
const moment = require("moment");
const AdmZip = require("adm-zip");
const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});
const controller = {
  async contactUs(req, res) {
    try {
      const { name, email, subject, message, region } = req.body;
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
          <title>New Contact Form Submission</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
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
                  margin-top: 15px;
              }
          </style>
      </head>
      <body>
          <div class="container">
          <div class="logo-container">
              <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
               </div>
              <h2 class="header">📩 New Contact Form Submission</h2>
              <p class="content">
                  <strong>Hello,</strong> You have received a new message from <strong>${name}</strong>.
              </p>
              <p class="content"><strong>📌 Name:</strong> ${name}</p>
              <p class="content"><strong>📧 Email:</strong> ${email}</p>
              <p class="content"><strong>📄 Subject:</strong> ${subject}</p>
              <p class="content"><strong>💬 Message:</strong> ${message}</p>
              <p class="content">Best regards,<br><strong>Team Skill Stream</strong></p>
          </div>
      </body>
      </html>
      `;

      // console.log(email);
      //   email details
      let details = {
        from: `SKILLSTREAM Support ${
          region === "United States"
            ? "info@skillstreamjobs.us"
            : "support@skillstreamjobs.ca"
        }`,
        to:
          region === "United States"
            ? "info@skillstreamjobs.us"
            : "support@skillstreamjobs.ca",
        subject: `${subject}`,
        text: "Contact Us Form Response",
        html: html,
        replyTo: email,
        //   html: html,
      };

      //   sending the mail for registeration
      mailTransporter
        .sendMail(details)
        .then((info) => {
          console.log(info);

          res.status(200).json({
            message: "Contact us Form Submitted Sucessfully",
            status: true,
          });
        })
        .catch((err) => {
          console.log("Error in sending the mail for contact us form", err);
          res.status(400).json({ err });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async submitResumes(req, res) {
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
      });
      await form.parse(req, async (err, fields, files) => {
        if (!files.file) {
          res.status(400).json({ message: "No file uploaded", status: false });
          return; // Return early to avoid further processing
        } else if (err) {
          console.error(err); // Log the error for debugging purposes
          res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
          return; // Return early on error
        } else {
          const fileStream = fs.createReadStream(files.file.filepath);
          let formData = new FormData();
          formData.append("file", fs.createReadStream(files.file.filepath));
          let parsedData;
          try {
            // Call Python API
            const { data } = await axios.post(
              `${process.env.AI_URL}/parse_resume`,
              formData,
              {
                headers: { ...formData.getHeaders() },
              }
            );
            if (data?.error) {
              res.status(400).json({ message: data.error, status: false });
              return;
            }
            parsedData = data;
            console.log(data);
          } catch (axiosError) {
            console.error("Error calling Python API:", axiosError.message);
            return res
              .status(500)
              .json({ message: "Failed to parse resume", status: false });
          }

          const params = {
            Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
            Key: files.file.newFilename, // Name of the image
            Body: fileStream, // Body which will contain the image in buffer format
            ACL: "public-read-write", // defining the permissions to get the public link
            ContentType: files.file.mimetype, // Necessary to define the image content-type to view the photo in the browser with the link
          };
          s3.upload(params, async (error, data) => {
            if (error) {
              console.log(error);
              res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
            } else {
              // console.log(parsedData);
              res.status(200).json({
                message: "Resume uploaded Successfully",
                status: true,
                location: data.Location,
                data: parsedData,
              });
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async addDetails(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        city,
        resume,
        state,
        experience,
        jobTitle,
        skills,
        region,
      } = req.body;
      const findUser = await nonUserModel.findOne({ email });
      if (findUser) {
        const updatedetails = await nonUserModel.updateOne(
          { email },
          {
            $set: {
              resume,
            },
          }
        );

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
            <title>Resume Updated Successfully</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
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
                    margin-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                 <div class="logo-container">
              <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
               </div>
                <h2 class="header">Resume Updated Successfully</h2>
                <p class="content">
                    Hello <strong>${firstName} ${lastName}</strong>,
                </p>
                <p class="content">
                    Your resume has been successfully updated! We will notify you when job opportunities match your profile.
                </p>
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
          to: email,
          subject: "Your Resume has uploaded Successfully!",
          text: "Your Resume has uploaded Successfully",
          html: html,
          //   html: html,
        };

        //   sending the mail for registeration
        mailTransporter
          .sendMail(details)
          .then((info) => {
            res.status(200).json({
              message: "Resume & details Updated",
              status: true,
            });
          })
          .catch((err) => {
            console.log("Error in sending the mail for contact us form", err);
            res.status(500).json({
              error: "Error in sending the mail for contact us form" + error,
              status: false,
            });
          });
      } else {
        const addDetails = await nonUserModel.create({
          name: `${firstName} ${lastName}`,
          email,
          phoneNumber,
          country,
          city,
          resume,
          state,
          experience,
          jobTitle,
          skills,
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

        //   HTML for the email
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Resume Updated Successfully</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
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
                    margin-top: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                 <div class="logo-container">
              <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
               </div>
                <h2 class="header">Resume Updated Successfully</h2>
                <p class="content">
                    Hello <strong>${firstName} ${lastName}</strong>,
                </p>
                <p class="content">
                    Your resume has been successfully updated! We will notify you when job opportunities match your profile.
                </p>
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
          to: email,
          subject: "Your Resume has uploaded Successfully!",
          text: "Your Resume has uploaded Successfully",
          html: html,
          //   html: html,
        };

        //   sending the mail for registeration
        mailTransporter
          .sendMail(details)
          .then((info) => {
            res.status(200).json({
              message: "Resume & details added",
              status: true,
            });
          })
          .catch((err) => {
            console.log("Error in sending the mail for contact us form", err);
            res.status(500).json({
              error: "Error in sending the mail for contact us form" + error,
              status: false,
            });
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async easyApply(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        state,
        city,
        resume,
        experience,
        jobTitle,
        postedJobTitle,
        empEmail,
        skills,
        Education,
        work_experience,
        Experience_level,
        linkedin_url,
        technical_expertise_in_skills,
        employerId,
        jobId,
        region,
        workAuthorization,
      } = req.body;
      const findUser = await nonUserModel.findOne({ email });
      const employerDetails = await employerModel.findOne({
        userId: employerId,
      });
      const jobEntireData = employerDetails.jobs.find((j) => j.jobId === jobId);

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
          full_name: `${firstName} ${lastName}`,
          email: email,
          City: city,
          Country: country,
          Province: state,
          Experience_in_Years: experience,
          Experience_level: Experience_level,
          Job_Title: jobTitle,
        },
        education: Education,
        work_experience: work_experience,
        skills: skills,
      };
      let body = {
        job_description: jobDetails,
        candidate_info: candidateInfo,
      };
      const { data } = await axios.post(
        `${process.env.AI_URL}/fitment_analysis`,
        body
      );
      if (findUser) {
        // console.log("user");

        const updatedetails = await nonUserModel.updateOne(
          { email },
          {
            $set: {
              name: `${firstName} ${lastName}`,
              email,
              phone_number: phoneNumber,
              country,
              state,
              city,
              resume,
              experience,
              jobTitle,
              skills,
              Education,
              work_experience,
              Experience_level,
              linkedin_url,
              technical_expertise_in_skills,
              workAuthorization: workAuthorization ? workAuthorization : "NA",
            },
          }
        );

        const addCandidate = await employerModel.updateOne(
          { userId: employerId, "jobs.jobId": jobId },
          {
            $push: {
              "jobs.$.applicants": {
                // userId,
                jobId,
                name: `${firstName} ${lastName}`,
                resume: resume,
                image: findUser.image,
                jobTitle: jobTitle,
                city: city,
                country: country,
                skills: skills,
                work_experience: work_experience,
                experience: experience,
                education: Education,
                email: email,
                phone: phoneNumber,
                Experience_level: Experience_level,
                state: state,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                id: findUser._id,
                workAuthorization: workAuthorization ? workAuthorization : "NA",
                isVendorApplicants: false,
                fitmentSummary: JSON.stringify(data),
                matchingScore: data.fitment_score,
                preCallQuestion: data.screening_questions,
              },
              allApplicants: {
                jobId,
                name: `${firstName} ${lastName}`,
                resume: resume,
                image: findUser.image,

                jobTitle: jobTitle,
                city: city,
                country: country,
                skills: skills,
                work_experience: work_experience,
                experience: experience,
                education: Education,
                email: email,
                phone: phoneNumber,
                Experience_level: Experience_level,
                state: state,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                id: findUser._id,
                isVendorApplicants: false,
              },
              notifications: {
                name: `${firstName} ${lastName}`,
                // userId: userId,
                id: findUser._id,
                jobId,
                JobTitle: postedJobTitle,
                image: findUser.image,
                resume: resume,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                type: "Apply Job",
                read: false,
              },
            },
          }
        );
        const sendUserSocket = onlineUsers.get(employerId);
        if (sendUserSocket) {
          req.app
            .get("io")
            .to(sendUserSocket)
            .emit("newNotification", {
              type: "Apply Job",
              message: `${firstName} ${lastName} applied for the Job ${postedJobTitle}`,
              data: {
                name: `${firstName} ${lastName}`,
                // userId: userId,
                id: findUser._id,
                jobId,
                JobTitle: postedJobTitle,
                image: findUser.image,
                resume: resume,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                type: "Apply Job",
                read: false,
              },
            });
          console.log("Notification sent");
        }
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
            <title>New Job Application</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
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
                    text-align: left;
                    padding: 10px 20px;
                }
                .button-container {
    text-align: center;
    margin-top: 20px;
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
              <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
               </div>
                <h2 class="header">New Job Application Received</h2>
                <p class="content">
                    Hello <strong>${employerDetails.companyName}</strong>,
                </p>
                <p class="content">
                    <strong>${findUser.name}</strong> has applied for the job position <strong>${postedJobTitle}</strong>.
                </p>
           
                <p class="content">
                    Click the button below to view the applicant's resume.
                </p>
<div class="button-container">
                <a href=https://docs.google.com/viewerng/viewer?url=${resume} class="button" style="color: #ffffff !important;">View Resume</a>
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
          to: empEmail,
          subject: `Job Application for ${postedJobTitle} `,
          text: `Job Application for ${postedJobTitle} `,
          html: html,
          replyTo: findUser.name,
          //   html: html,
        };

        // sending the mail for registeration
        mailTransporter
          .sendMail(details)
          .then((info) => {
            res.status(200).json({
              message: "Job Application has been sumbitted",
              status: true,
            });
          })
          .catch((err) => {
            console.log("Error in sending the mail for contact us form", err);
            res.status(500).json({
              error: "Error in sending the mail for contact us form" + err,
              status: false,
            });
          });
        // res.status(200).json({
        //   message: "Job Application has been sumbitted",
        //   status: true,
        // });
      } else {
        // console.log("non-userS");
        const addDetails = await nonUserModel.create({
          name: `${firstName} ${lastName}`,
          email,
          phone_number: phoneNumber,
          country,
          state,
          city,
          resume,
          experience,
          jobTitle,
          skills,
          Education,
          work_experience,
          Experience_level,
          workAuthorization: workAuthorization ? workAuthorization : "NA",
          linkedin_url,
          technical_expertise_in_skills,
          image:
            "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
        });
        // console.log(addDetails.name);
        const addCandidate = await employerModel.updateOne(
          { userId: employerId, "jobs.jobId": jobId },
          {
            $push: {
              "jobs.$.applicants": {
                // userId,
                jobId,
                name: `${firstName} ${lastName}`,
                resume: resume,
                image:
                  "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
                // position: updatedetails.position,
                jobTitle: jobTitle,
                // currentSalary: updatedetails.currentSalary,
                city: city,
                country: country,
                skills: skills,
                work_experience: work_experience,
                experience: experience,
                education: Education,
                email: email,
                phone: phoneNumber,
                Experience_level: Experience_level,
                state: state,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                id: addDetails._id,
                workAuthorization: workAuthorization ? workAuthorization : "NA",
                fitmentSummary: JSON.stringify(data),
                matchingScore: data.fitment_score,
                preCallQuestion: data.screening_questions,
              },
              allApplicants: {
                jobId,
                name: `${firstName} ${lastName}`,
                resume: resume,
                image:
                  "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
                // position: updatedetails.position,
                jobTitle: jobTitle,
                // currentSalary: updatedetails.currentSalary,
                city: city,
                country: country,
                skills: skills,
                work_experience: work_experience,
                experience: experience,
                education: Education,
                email: email,
                phone: phoneNumber,
                Experience_level: Experience_level,
                state: state,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                id: addDetails._id,
              },
              notifications: {
                name: `${firstName} ${lastName}`,
                // userId: userId,
                id: addDetails._id,
                jobId,
                JobTitle: postedJobTitle,
                image:
                  "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
                resume: resume,
                // currentSalary: userDetails.currentSalary,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                type: "Apply Job",
                read: false,
              },
            },
          }
        );
        const sendUserSocket = onlineUsers.get(employerId);
        if (sendUserSocket) {
          req.app
            .get("io")
            .to(sendUserSocket)
            .emit("newNotification", {
              type: "Apply Job",
              message: `${addDetails.name} applied for the Job ${req.body.JobTitle}`,
              data: {
                name: addDetails.name,
                userId: userId,
                id: addDetails._id,
                jobId,
                JobTitle: req.body.JobTitle,
                image: addDetails.image,
                resume: addDetails.resume,
                currentSalary: addDetails.currentSalary,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                type: "Apply Job",
                read: false,
              },
            });
          console.log("Notification sent");
        }
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
            <title>New Job Application</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
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
                    text-align: left;
                    padding: 10px 20px;
                }
                    .button-container {
    text-align: center;
    margin-top: 20px;
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
              <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
               </div>
                <h2 class="header">New Job Application Received</h2>
                <p class="content">
                    Hello <strong>${employerDetails.companyName}</strong>,
                </p>
                <p class="content">
                    <strong>${addDetails.name}</strong> has applied for the job position <strong>${postedJobTitle}</strong>.
                </p>
                <p class="content">
                    Click the button below to view the applicant's resume.
                </p>
                <div class="button-container">
                <a href=https://docs.google.com/viewerng/viewer?url=${resume} class="button" style="color: #ffffff !important;">View Resume</a>
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
          to: empEmail,
          subject: `Job Application for ${postedJobTitle} `,
          text: `Job Application for ${postedJobTitle} `,
          html: html,
          replyTo: addDetails.email,
          //   html: html,
        };
        // console.log(email);

        //   sending the mail for registeration
        mailTransporter
          .sendMail(details)
          .then((info) => {
            res.status(200).json({
              message: "Job Application has been sumbitted",
              status: true,
            });
          })
          .catch((err) => {
            console.log("Error in sending the mail for contact us form", err);
            res.status(500).json({
              error: "Error in sending the mail for contact us form" + err,
              status: false,
            });
          });
        // res.status(200).json({
        //   message: "Job Application has been sumbitted",
        //   status: true,
        // });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async resumeWriting(req, res) {
    try {
      const { resumeUrl } = req.body;

      if (!resumeUrl) {
        return res.status(400).json({ message: "resumeUrl is required" });
      }

      // Extract ext
      const fileExt = resumeUrl.split(".").pop().toLowerCase();

      // 1️⃣ Download input file from S3 or external URL
      const fileResponse = await axios.get(resumeUrl, {
        responseType: "arraybuffer",
      });

      const formData = new FormData();

      // 2️⃣ Attach file to FormData for Python API
      formData.append(
        "file",
        Buffer.from(fileResponse.data),
        fileExt === "pdf" ? "resume.pdf" : "resume.docx"
      );

      // 3️⃣ Call Python API – ZIP expected
      const aiResponse = await axios.post(
        `${process.env.AI_URL}/generate-resume`,
        formData,
        {
          responseType: "arraybuffer",
          headers: formData.getHeaders(),
        }
      );

      // 4️⃣ Extract ZIP
      const zip = new AdmZip(aiResponse.data);
      const entries = zip.getEntries();

      let basicResume = null;
      let traditionalResume = null;

      entries.forEach((file) => {
        const name = file.entryName;
        const buffer = file.getData();
        const base64 = buffer.toString("base64");

        let ext = name.includes(".") ? name.split(".").pop() : "pdf";

        const mimeType =
          ext === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        if (name.includes("ats_resume_basic_resume")) {
          basicResume = {
            fileName: name,
            mimeType,
            base64,
          };
        }

        if (name.includes("ats_resume_traditional_resume")) {
          traditionalResume = {
            fileName: name,
            mimeType,
            base64,
          };
        }
      });

      // 5️⃣ Return the two files to frontend
      return res.json({
        status: true,
        message: "AI resumes generated",
        basicResume,
        traditionalResume,
      });
    } catch (error) {
      console.log("Resume Writing Error:", error);
      return res.status(500).json({
        message: "AI Resume generation failed",
        error: error.message,
        status: false,
      });
    }
  },

  // async resumeWriting(req, res) {
  //   try {
  //     const form = formidable({
  //       multiples: true,
  //       keepExtensions: true,
  //       useTempFiles: true,
  //     });
  //     await form.parse(req, async (err, fields, files) => {
  //       if (!files.file) {
  //         res.status(400).json({ message: "No file uploaded", status: false });
  //         return; // Return early to avoid further processing
  //       } else if (err) {
  //         console.error(err); // Log the error for debugging purposes
  //         res
  //           .status(500)
  //           .json({ message: "Internal Server Error", status: false });
  //         return; // Return early on error
  //       } else {
  //         const fileStream = fs.createReadStream(files.file.filepath);
  //         let formData = new FormData();

  //         formData.append("file", fs.createReadStream(files.file.filepath));
  //         const { data, headers } = await axios.post(
  //           `${process.env.AI_URL}/upload_resume`,
  //           formData,
  //           {
  //             responseType: "arraybuffer", // ⭐ REQUIRED ⭐
  //             headers: formData.getHeaders(),
  //           }
  //         );

  //         res.setHeader("Content-Type", headers["content-type"]);
  //         res.setHeader(
  //           "Content-Disposition",
  //           "inline; filename=enhanced_resume.pdf"
  //         );
  //         res.send(data); // Send raw PDF bytes
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ error, status: false });
  //   }
  // },
};
module.exports = controller;

// async submitResumes(req, res) {
//   try {
//     const form = formidable({
//       multiples: true,
//       keepExtensions: true,
//       useTempFiles: true,
//     });
//     await form.parse(req, async (err, fields, files) => {
//       if (!files.file) {
//         res.status(400).json({ message: "No file uploaded", status: false });
//         return; // Return early to avoid further processing
//       } else if (err) {
//         console.error(err); // Log the error for debugging purposes
//         res
//           .status(500)
//           .json({ message: "Internal Server Error", status: false });
//         return; // Return early on error
//       } else {
//         // const fileBuffer = files.file;
//         // console.log(files.file.newFilename);
//         // console.log(files.file.filepath);
//         // const filePath = files.file.filepath;
//         // const buffer= fs.readFile(files.file.filepath);
//         // console.log(buffer);
//         const fileBuffer = fs.readFileSync(files.file.filepath);
//         const parsedData = await pdfParse(fileBuffer);
//         // console.log(parsedData.text);
//         const resumeText = parsedData.text;
//         const skillsMatch = resumeText.match(
//           /(SKILLS|Professional Skills)\s([\s\S]*?)(?:\n[A-Z\s]+\n|\n$)/
//         );
//         const skills = skillsMatch[2]
//           .split(/[\s,]+/) // Split by whitespace or commas
//           .filter((skill) => skill) // Remove any empty strings
//           .map((skill) => skill.trim()); // Trim each skill

//         const fileStream = fs.createReadStream(files.file.filepath);
//         // //   console.log(fileStream);
//         // const axios = require("axios");
//         // const FormData = require("form-data");

//         // let data = new FormData();
//         // data.append("file", fs.createReadStream(files.file.filepath));

//         // let config = {
//         //   method: "post",
//         //   maxBodyLength: Infinity,
//         //   url: "http://127.0.0.1:5000/parse_resume",
//         //   headers: {
//         //     ...data.getHeaders(),
//         //   },
//         //   data: data,
//         // };

//         // axios
//         //   .request(config)
//         //   .then((response) => {
//         //     console.log(JSON.stringify(response.data));
//         //   })
//         //   .catch((error) => {
//         //     console.log(error);
//         //   });
//         const params = {
//           Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
//           Key: files.file.newFilename, // Name of the image
//           Body: fileStream, // Body which will contain the image in buffer format
//           ACL: "public-read-write", // defining the permissions to get the public link
//           ContentType: "application/pdf", // Necessary to define the image content-type to view the photo in the browser with the link
//         };
//         s3.upload(params, async (error, data) => {
//           if (error) {
//             console.log(error);
//             res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
//           } else {
//             console.log(data);
//             // const fileStream = fs.createReadStream(files.file.filepath);
//             // const FormData = require("form-data");

//             // let formdata = new FormData();
//             // formdata.append("file", fs.createReadStream(files.file.filepath));
//             // const resumeParser = await axios.post(
//             //   "http://54.146.18.229:5000/parse_resume",
//             //   formdata
//             // );

//             // console.log(resumeParser.data);
//             res.status(200).json({
//               message: "Resume uploaded Successfully",
//               status: true,
//               location: data.Location,
//               // resumeData: resumeParser.data,
//               skills: skills,
//             });
//           }
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error, status: false });
//   }
// },

// async submitResumes(req, res) {
//   try {
//     const form = formidable({
//       multiples: true,
//       keepExtensions: true,
//       useTempFiles: true,
//     });
//     await form.parse(req, async (err, fields, files) => {
//       if (!files.file) {
//         res.status(400).json({ message: "No file uploaded", status: false });
//         return; // Return early to avoid further processing
//       } else if (err) {
//         console.error(err); // Log the error for debugging purposes
//         res
//           .status(500)
//           .json({ message: "Internal Server Error", status: false });
//         return; // Return early on error
//       } else {
//         const fileBuffer = fs.readFileSync(files.file.filepath);
//         const parsedData = await pdfParse(fileBuffer);
//         // console.log(parsedData.text);
//         const resumeText = parsedData.text;
//         const skillsMatch = resumeText.match(
//           /(SKILLS|Professional Skills)\s([\s\S]*?)(?:\n[A-Z\s]+\n|\n$)/
//         );
//         const skills = skillsMatch[2]
//           .split(/[\s,]+/) // Split by whitespace or commas
//           .filter((skill) => skill) // Remove any empty strings
//           .map((skill) => skill.trim()); // Trim each skill

//         const fileStream = fs.createReadStream(files.file.filepath);

//         const params = {
//           Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
//           Key: files.file.newFilename, // Name of the image
//           Body: fileStream, // Body which will contain the image in buffer format
//           ACL: "public-read-write", // defining the permissions to get the public link
//           ContentType: "application/pdf", // Necessary to define the image content-type to view the photo in the browser with the link
//         };
//         s3.upload(params, async (error, data) => {
//           if (error) {
//             console.log(error);
//             res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
//           } else {
//             console.log(data);
//             res.status(200).json({
//               message: "Resume uploaded Successfully",
//               status: true,
//               location: data.Location,
//               // resumeData: resumeParser.data,
//               skills: skills,
//             });
//           }
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error, status: false });
//   }
// },
// const addCandidate = await employerModel.updateOne(
//   { userId: employerId, "jobs.jobId": jobId },
//   {
//     $push: {
//       "jobs.$.applicants": {
//         // userId,
//         jobId,
//         name: ` ${firstName} ${lastName}`,
//         resume: resume,
//         image:
//           "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
//         jobTitle: jobTitle,
//         country: country,
//         skills: skills,
//         work_experience: work_experience,
//         experience: experience,
//         education: Education,
//         email: email,
//         phone: phoneNumber,
//         Experience_level: Experience_level,
//         state: state,
//         appliedTime: moment().format("MMM Do YYYY"),
//         time: moment().format("MMMM D YYYY, h:mm:ss a"),
//         applicationStatus: "pending",
//         id: addDetails._id,
//       },
//       allApplicants: {
//         jobId,
//         name: ` ${firstName} ${lastName}`,
//         resume: resume,
//         image:
//           "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
//         jobTitle: jobTitle,
//         country: country,
//         skills: skills,
//         work_experience: work_experience,
//         experience: experience,
//         education: Education,
//         email: email,
//         phone: phoneNumber,
//         Experience_level: Experience_level,
//         state: state,
//         appliedTime: moment().format("MMM Do YYYY"),
//         time: moment().format("MMMM D YYYY, h:mm:ss a"),
//         applicationStatus: "pending",
//         id: addDetails._id,
//       },
//     },
//   }
// );
