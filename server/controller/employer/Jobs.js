const { availableJobStages, isAvailable } = require("../../services/jobAvailability");
const employerModel = require("../../models/employerModel");
const candidateModel = require("../../models/candidateModel");
const jobsModel = require("../../models/jobsModel");
const nonVendorModel = require("../../models/nonVendorModels");

const moment = require("moment");
const nodemailer = require("nodemailer");
const schedule = require("node-schedule");
const LinkedIn = require("node-linkedin")("77yvbgapey8cr2", "3Bz0lxMj1wGoNuDc");
const nonUserModel = require("../../models/nonUsersModel");
const JobCounterModel = require("../../models/jobCounterModel");

const crypto = require("crypto");
const cheerio = require("cheerio");
const { log } = require("console");
const vendorModel = require("../../models/vendorModel");
const axios = require("axios");
const { lowSurrogate } = require("pdf-lib");
async function sendEmail(to, subject, html, EmailAddress) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "support@skillstreamjobs.ca",
      pass: "yzsz ockc eiql oyqj",
    },
  });

  let mailOptions = {
    from: "support@skillstreamjobs.ca",
    to,
    subject,
    html,
    replyTo: EmailAddress,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("POST JOB EMAIL SENDING ERROR:", error.message);
    // Email failed, but execution continues
  }
}

async function uSSendEmail(to, subject, html, EmailAddress) {
  console.log("email sending");

  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: "jobs@skillstreamjobs.us",
      pass: "hvcnqbxrcbppkrqt",
    },
  });

  let mailOptions = {
    from: "jobs@skillstreamjobs.us",
    to,
    subject,
    html,
    replyTo: EmailAddress,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    console.log("email sent completed");
  } catch (error) {
    console.log("POST JOB EMAIL SENDING ERROR:", error.message);
    // Email failed, but execution continues
  }
}

async function generateUniqueJobId(companyName) {
  let jobId;
  let isUnique = false;

  while (!isUnique) {
    // Create a base job ID combining timestamp, company name, and a random number
    const baseJobId = `${companyName}-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;
    // Hash the base job ID to ensure it's a suitable length and format
    jobId = crypto
      .createHash("sha256")
      .update(baseJobId)
      .digest("hex")
      .substring(0, 12); // Use a substring to control length

    // Check if the job ID already exists
    const existingJob = await jobsModel.findOne({ jobId });
    if (!existingJob) {
      isUnique = true;
    }
  }

  return jobId;
}
async function generateUniqueNewJobId(findUser) {
  try {
    // Extract company domain from email
    const domain = findUser.email?.split("@")[1]?.toLowerCase() || "";
    const companyPrefix = domain.split(".")[0].toUpperCase().slice(0, 8);

    // Fetch all jobs of users in the same company (by domain)
    const companyUsers = await employerModel.find({
      email: { $regex: `@${domain}$`, $options: "i" },
      "jobs.0": { $exists: true },
    });

    // Gather all jobs from all company users
    let allJobs = [];
    for (const user of companyUsers) {
      const jobs = (user.jobs || []).map((j) => ({
        jobId: j.newId ? j.newJobId : j.jobId,
        postedTime: j.time,
      }));
      allJobs.push(...jobs);
    }

    // Sort by postedTime to find latest sequence
    allJobs = allJobs
      .filter((j) => j.jobId && j.postedTime)
      .sort((a, b) => new Date(a.postedTime) - new Date(b.postedTime));

    let nextSeq = 1;
    if (allJobs.length > 0) {
      // Extract numeric part of last jobId
      const lastJob = allJobs[allJobs.length - 1];
      const match = lastJob.jobId.match(/(\d+)$/);
      // console.log(match);
      if (match) {
        nextSeq = parseInt(match[1], 10) + 1;
        console.log(nextSeq);
      }
    }

    const seqStr = String(nextSeq).padStart(3, "0");
    const jobId = `${companyPrefix}${seqStr}`;
    // 🪵 Append logs
    const logMessage = `${moment().format(
      "YYYY-MM-DD HH:mm:ss"
    )} | Company: ${companyPrefix} | New Job ID: ${jobId} | User: ${
      findUser.email
    }\n`;
    return jobId;
  } catch (error) {
    console.error("Error generating unique job ID:", error);
    throw error;
  }
}
async function generateUniqueJobId(findUser) {
  // Use first word of company as prefix, uppercase, max 8 chars
  const domain = findUser.email?.split("@")[1]?.toLowerCase() || "";
  const companyPrefix = domain.split(".")[0].toUpperCase().slice(0, 8);

  // Atomically increment the sequence for this company
  const counter = await JobCounterModel.findOneAndUpdate(
    { company: companyPrefix },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true } // create if doesn't exist
  );

  const seqStr = String(counter.sequence).padStart(3, "0");
  return `${companyPrefix}${seqStr}`;
}

const controller = {
  async check(req, res) {
    try {
      const { Country, jobSkills } = req.body;
      let domain = "";
      if (Country.toLowerCase().includes("canada")) {
        domain = "https://www.skillstreamjobs.ca";
      } else if (
        Country.toLowerCase().includes("united states") ||
        Country.toLowerCase().includes("usa")
      ) {
        domain = process.env.USWEBSITE;
      }
      const lowerCountry = Country.toLowerCase();
      let countryFilter = { country: Country };
      if (
        lowerCountry.includes("united states") ||
        lowerCountry.includes("usa")
      ) {
        countryFilter = {
          $or: [{ country: "United States" }, { country: "USA" }],
        };
      }
      // console.log(countryFilter);

      // // Fetch candidates
      const candidates = await candidateModel.find(countryFilter);

      // Fetch non-users
      const nonuser = await nonUserModel.find(countryFilter);

      res
        .status(200)
        .json({ counts: nonuser.length, domain, results: nonuser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async postJob(req, res) {
    try {
      // console.log("hi");
      const { userId } = req.params;
      const findUser = await employerModel.findOne({ userId });
      const jobId = await generateUniqueJobId(findUser);
      console.log(jobId);
      //      const jobId = await generateUniqueNewJobId(findUser);
      // console.log(jobId);
      let jobCount;
      if (findUser.jobs.length === 0) {
        jobCount = 1;
      } else {
        jobCount = findUser.jobCount + 1;
      }
      // console.log(jobCount);
      const {
        JobTitle,
        JobDescription,
        EmailAddress,
        Specialisms,
        JobType,
        offeredSalary,
        employmentType,
        Experience,
        Industry,
        // packages,
        Responsibilties,
        skill_Experience,
        Qualification,
        ApplicationDeadlineDate,
        Country,
        City,
        State,
        jobSkills,
        status,
        companyName,
        region,
        isVendor,
        // CompleteAddress,
      } = req.body;
      // console.log(req.body);
      if (!findUser.subscribed) {
        return res.status(400).json({
          message: "You don't have access , Please Subscribe to post job",
          status: false,
        });
      }
      const plan = findUser.plan; // Assume `plan` is stored in the user document
      const maxJobs = { free: 1, basic: 1, standard: 3 };
      const deletionDays = { free: 7, basic: 30, standard: 30 };

      if (findUser.plan === "Free-trial" && findUser.jobCount >= 1) {
        const deleteDate = moment().add(7, "days").toDate();
        schedule.scheduleJob(deleteDate, async () => {
          await employerModel.updateOne(
            { userId },
            { $pull: { jobs: { jobId } }, $inc: { jobCount: -1 } }
          );
          await jobsModel.deleteOne({ jobId });
        });
        return res.status(400).json({
          message: `plan limit exceeded`,
          status: false,
        });
      }
      if (findUser.plan === "Basic" && findUser.jobCount >= 1) {
        const deleteDate = moment().add(30, "days").toDate();
        schedule.scheduleJob(deleteDate, async () => {
          await employerModel.updateOne(
            { userId },
            { $pull: { jobs: { jobId } }, $inc: { jobCount: -1 } }
          );
          await jobsModel.deleteOne({ jobId });
        });
        return res.status(400).json({
          message: `plan limit exceeded`,
          status: false,
        });
      }
      if (findUser.plan === "Standard" && findUser.jobCount >= 3) {
        const deleteDate = moment().add(30, "days").toDate();
        schedule.scheduleJob(deleteDate, async () => {
          await employerModel.updateOne(
            { userId },
            { $pull: { jobs: { jobId } }, $inc: { jobCount: -1 } }
          );
          await jobsModel.deleteOne({ jobId });
        });
        return res.status(400).json({
          message: `plan limit exceeded`,
          status: false,
        });
      }
      if (userId) {
        const findUser = await employerModel.findOne({ userId });
        // console.log(findUser.jobs.length);
        let companyName = findUser.companyName;
        if (companyName.includes(" ")) {
          companyName = companyName.split(" ")[0];
        }
        // const jobId = await generateUniqueJobId(companyName);
        const postJob = await employerModel.updateOne(
          { userId },

          {
            $push: {
              jobs: {
                jobId,
                JobTitle,
                JobDescription,
                EmailAddress,
                Specialisms,
                JobType,
                employmentType,
                Responsibilties,
                skill_Experience,
                offeredSalary,
                jobSkills,
                Experience,
                Industry,
                Qualification,
                ApplicationDeadlineDate,
                Country,
                City,
                State,
                CompleteAddress: findUser.address,
                image: findUser.image,
                postedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                status: "Active",
                companyName: findUser.companyName,
                userId: findUser.userId,
                website: findUser.website,
                isVendor: isVendor,
              },
            },
            $set: {
              jobCount: jobCount,
            },
          }
        );
        const addjobs = await jobsModel.create({
          jobId,
          JobTitle,
          JobDescription,
          EmailAddress,
          Specialisms,
          JobType,
          employmentType,
          Responsibilties,
          skill_Experience,
          offeredSalary,
          jobSkills,
          Experience,
          Industry,
          Qualification,
          ApplicationDeadlineDate,
          Country,
          City,
          State,
          CompleteAddress: findUser.address,
          image: findUser.image,
          postedTime: moment().format("MMM Do YYYY"),
          time: moment().format("MMMM D YYYY, h:mm:ss a"),
          status: "Active",
          companyName: findUser.companyName,
          userId: findUser.userId,
          website: findUser.website,
          isVendor: isVendor,
        });
        console.log("DB stored");

        // const candidates = await candidateModel.find({});
        // const nonuser = await nonUserModel.find({});
        let domain = "";
        if (Country.toLowerCase().includes("canada")) {
          domain = "https://www.skillstreamjobs.ca";
        } else if (
          Country.toLowerCase().includes("united states") ||
          Country.toLowerCase().includes("usa")
        ) {
          domain = process.env.USWEBSITE;
        } else if (
          Country.toLowerCase().includes("india") ||
          Country.toLowerCase().includes("in")
        ) {
          domain = "https://www.skillstreamlabs.com";
        }
        const lowerCountry = Country.toLowerCase();
        let countryFilter = { country: Country };
        if (
          lowerCountry.includes("united states") ||
          lowerCountry.includes("usa")
        ) {
          countryFilter = {
            $or: [{ country: "United States" }, { country: "USA" }],
          };
        }
        //  fetch users
        console.log("fetching");
        const lowerJobSkills = jobSkills.map((skill) => skill.toLowerCase());
        // console.log({ Country, State, lowerJobSkills: lowerJobSkills });

        const candidates = await candidateModel.aggregate([
          {
            $match: {
              country: Country,
              state: State,
              skills: { $exists: true, $ne: [] },
            },
          },
          {
            $project: {
              name: 1,
              email: 1,
              skills: 1,
              matchedSkills: {
                $size: {
                  $filter: {
                    input: {
                      $map: {
                        input: "$skills",
                        as: "skill",
                        in: { $toLower: "$$skill" },
                      },
                    },
                    as: "skill",
                    cond: { $in: ["$$skill", lowerJobSkills] },
                  },
                },
              },
            },
          },
          { $match: { matchedSkills: { $gte: 2 } } },
        ]);
        // console.log(candidates);
        // Same for non-users
        const nonuser = await nonUserModel.aggregate([
          {
            $match: {
              country: Country,
              state: State,
              skills: { $exists: true, $ne: [] },
            },
          },
          {
            $project: {
              name: 1,
              email: 1,
              skills: 1,
              matchedSkills: {
                $size: {
                  $filter: {
                    input: {
                      $map: {
                        input: "$skills",
                        as: "skill",
                        in: { $toLower: "$$skill" },
                      },
                    },
                    as: "skill",
                    cond: { $in: ["$$skill", lowerJobSkills] },
                  },
                },
              },
            },
          },
          { $match: { matchedSkills: { $gte: 2 } } },
          // { $limit: 500 },
        ]);
        const vendors = await vendorModel.find({}); // or isVendor: true
        const nonVendors = await nonVendorModel.find({});
        console.log("fetched");

        const sendEmailNotification = async (recipientEmail, jobDetails) => {
          // Function to check if a string contains HTML tags
          const hasHtmlTags = (str) => /<\/?[a-z][\s\S]*>/i.test(str);

          // Function to remove HTML tags using cheerio
          const removeHtmlTags = (htmlString) => {
            const $ = cheerio.load(htmlString); // Load HTML string
            return $.text(); // Extract and return plain text
          };

          // Check if JobDescription contains HTML tags
          const plainJobDescription = hasHtmlTags(jobDetails.JobDescription)
            ? removeHtmlTags(jobDetails.JobDescription) // If HTML tags are present, strip them
            : jobDetails.JobDescription; // If no tags, use the description as is
          const emailSubject = `New Job Alert: ${jobDetails.JobTitle} at ${jobDetails.companyName}`;

          const emailText = `<!DOCTYPE html>
<html>
<head>
    <title>Exciting Job Opportunity for You!</title>
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
        <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
        <h2 class="header">New Job Opportunity Matches Your Skills!</h2>
        <p class="content">
            Hi there!,
        </p>
        <p class="content">
            We found a job that aligns with your skills and experience. Here are the details:
        </p>
        <p class="content">
            <strong>Job Title:</strong> ${jobDetails.JobTitle} <br>
            <strong>Company:</strong> ${jobDetails.companyName} <br>
            <strong>Location:</strong> ${jobDetails.City}, ${jobDetails.State}, ${jobDetails.Country} <br>
        </p>
        
        <div class="content">
        <strong>Job Description:</strong>
             ${jobDetails.JobDescription}
        </div>
        <div class="button-container">
            <a href="${domain}/job-detail/${userId}/${jobId}" class="button">Apply Now</a>
        </div>
        <p class="footer">
            Best regards,<br>
            <strong>Skill Stream Team</strong>
        </p>
    </div>
</body>
</html>`;

          try {
            region === "United States"
              ? await uSSendEmail(
                  recipientEmail,
                  emailSubject,
                  emailText,
                  jobDetails.EmailAddress
                )
              : await sendEmail(
                  recipientEmail,
                  emailSubject,
                  emailText,
                  jobDetails.EmailAddress
                );
          } catch (error) {
            console.log(
              `Failed to send email to ${recipientEmail}:`,
              error.message
            );
          }
        };
        const sendNonVendorInvitationEmail = async (
          recipientEmail,
          jobDetails
        ) => {
          const hasHtmlTags = (str) => /<\/?[a-z][\s\S]*>/i.test(str);
          const removeHtmlTags = (htmlString) => {
            const $ = cheerio.load(htmlString);
            return $.text();
          };

          const plainJobDescription = hasHtmlTags(jobDetails.JobDescription)
            ? removeHtmlTags(jobDetails.JobDescription)
            : jobDetails.JobDescription;

          const emailSubject = `You're Invited to Join as a Vendor & Apply for New Jobs`;

          const emailText = `<!DOCTYPE html>
<html>
<head>
    <title>Join Skill Stream as a Vendor</title>
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
        <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
        <h2 class="header">You're Invited to Join Skill Stream as a Vendor!</h2>
        <p class="content">
            Hi there,
        </p>
        <p class="content">
            A new job from <strong>${jobDetails.companyName}</strong> may be relevant to your candidates. As a valued partner, we invite you to register as a vendor and apply on their behalf.
        </p>
        <p class="content">
            <strong>Job Title:</strong> ${jobDetails.JobTitle} <br>
            <strong>Location:</strong> ${jobDetails.City}, ${jobDetails.State}, ${jobDetails.Country} <br>
        </p>
         <div class="content">
        <strong>Job Description:</strong>
             ${jobDetails.JobDescription}
        </div>
        <div class="button-container">
            <a href="${domain}/job-detail/${userId}/${jobId}" class="button">Register/Apply as Vendor</a>
        </div>
        <p class="footer">
            Regards,<br>
            <strong>Skill Stream Team</strong>
        </p>
    </div>
</body>
</html>`;

          try {
            region === "United States"
              ? await uSSendEmail(
                  recipientEmail,
                  emailSubject,
                  emailText,
                  jobDetails.EmailAddress
                )
              : await sendEmail(
                  recipientEmail,
                  emailSubject,
                  emailText,
                  jobDetails.EmailAddress
                );
          } catch (error) {
            console.log(
              `Failed to send non-vendor invite to ${recipientEmail}:`,
              error.message
            );
          }
        };
        // console.log("matching");
        // for (const candidate of candidates) {
        //   await candidateModel.updateOne(
        //     { _id: candidate._id },
        //     {
        //       $push: {
        //         jobAlerts: {
        //           jobId,
        //           JobTitle,
        //           companyName: findUser.companyName,
        //           employerId: findUser.userId,
        //           Country,
        //           City,
        //           State,
        //           postedTime: moment().format("MMM Do YYYY"),
        //         },
        //         notifications: {
        //           companyName: findUser.companyName,
        //           employerId: findUser.userId,
        //           jobId,
        //           JobTitle,
        //           image: findUser.image,
        //           postedTime: moment().format("MMM Do YYYY"),
        //         },
        //       },
        //     }
        //   );
        //   await sendEmailNotification(candidate.email, {
        //     JobTitle,
        //     name: candidate.name,
        //     companyName: findUser.companyName,
        //     City,
        //     State,
        //     Country,
        //     JobDescription,
        //   });
        // }

        // for (const nonUser of nonuser) {
        //   await sendEmailNotification(nonUser.email, nonUser.email, {
        //     JobTitle,
        //     name: nonUser.name,
        //     companyName: findUser.companyName,
        //     City,
        //     State,
        //     Country,
        //     JobDescription,
        //   });
        // }

        res.status(200).json({
          message: "Job post created Successfullly",
          status: true,
          jobId: jobId,
        });

        (async () => {
          console.log("email started");

          console.log("testing email started");

          if (EmailAddress !== "gokulakrishnan@vivatechsolutions.io") {
            if (isVendor) {
              console.log("vendor started");

              for (const vendor of vendors) {
                console.log(vendor._id);

                await vendorModel.updateOne(
                  { _id: vendor._id },
                  {
                    $push: {
                      jobAlerts: {
                        jobId,
                        JobTitle,
                        companyName: findUser.companyName,
                        employerId: findUser.userId,
                        Country,
                        City,
                        State,
                        postedTime: moment().format("MMM Do YYYY"),
                      },
                      notifications: {
                        companyName: findUser.companyName,
                        employerId: findUser.userId,
                        jobId,
                        JobTitle,
                        image: findUser.image,
                        postedTime: moment().format("MMM Do YYYY"),
                        read: false,
                      },
                    },
                  }
                );
                // const sendUserSocket = onlineUsers.get(vendor._id);
                // if (sendUserSocket) {
                //   req.app
                //     .get("io")
                //     .to(sendUserSocket)
                //     .emit("newNotification", {
                //       type: "Job Alert",
                //       message: `${findUser.companyName} Posted a job ${JobTitle}`,
                //       data: {
                //         companyName: findUser.companyName,
                //         employerId: findUser.userId,
                //         jobId,
                //         JobTitle,
                //         image: findUser.image,
                //         postedTime: moment().format("MMM Do YYYY"),
                //         read: false,
                //       },
                //     });
                //   console.log("Notification sent");
                // }
                await sendEmailNotification(vendor.email, {
                  JobTitle,
                  name: vendor.name,
                  companyName: findUser.companyName,
                  City,
                  State,
                  Country,
                  JobDescription,
                  EmailAddress,
                });
              }
              for (const nonVendor of nonVendors) {
                await sendNonVendorInvitationEmail(nonVendor.email, {
                  JobTitle,
                  companyName: findUser.companyName,
                  City,
                  State,
                  Country,
                  JobDescription,
                  EmailAddress,
                });
              }
            }

            for (const candidate of candidates) {
              await candidateModel.updateOne(
                { _id: candidate._id },
                {
                  $push: {
                    jobAlerts: {
                      jobId,
                      JobTitle,
                      companyName: findUser.companyName,
                      employerId: findUser.userId,
                      Country,
                      City,
                      State,
                      postedTime: moment().format("MMM Do YYYY"),
                    },
                    notifications: {
                      companyName: findUser.companyName,
                      employerId: findUser.userId,
                      jobId,
                      JobTitle,
                      image: findUser.image,
                      postedTime: moment().format("MMM Do YYYY"),
                      read: false,
                    },
                  },
                }
              );
              // const sendUserSocket = onlineUsers.get(candidate._id);
              // if (sendUserSocket) {
              //   req.app
              //     .get("io")
              //     .to(sendUserSocket)
              //     .emit("newNotification", {
              //       type: "Job Alert",
              //       message: `${findUser.companyName} Posted a job ${JobTitle}`,
              //       data: {
              //         companyName: findUser.companyName,
              //         employerId: findUser.userId,
              //         jobId,
              //         JobTitle,
              //         image: findUser.image,
              //         postedTime: moment().format("MMM Do YYYY"),
              //         read: false,
              //       },
              //     });
              //   console.log("Notification sent");
              // }
              await sendEmailNotification(candidate.email, {
                JobTitle,
                name: candidate.name,
                companyName: findUser.companyName,
                City,
                State,
                Country,
                JobDescription,
                EmailAddress,
              });
              console.log(candidate.email, {
                JobTitle,
                name: candidate.name,
                companyName: findUser.companyName,
                City,
                State,
                Country,
                JobDescription,
                EmailAddress,
              });
            }

            for (const nonUser of nonuser) {
              await sendEmailNotification(nonUser.email, {
                JobTitle,
                name: nonUser.name,
                companyName: findUser.companyName,
                City,
                State,
                Country,
                JobDescription,
                EmailAddress,
              });
              console.log(nonUser.email, {
                JobTitle,
                name: nonUser.name,
                companyName: findUser.companyName,
                City,
                State,
                Country,
                JobDescription,
                EmailAddress,
              });
            }
          } else {
            console.log("test email Completed");
          }
        })();
      } else {
        res.status(400).json({ message: "UserId missing", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async USpostJob(req, res) {
    try {
      // console.log("hi");
      const { userId } = req.params;
      const findUser = await employerModel.findOne({ userId });

      let jobCount;
      if (findUser.jobs.length === 0) {
        jobCount = 1;
      } else {
        jobCount = findUser.jobCount + 1;
      }
      console.log(jobCount);
      const {
        JobTitle,
        JobDescription,
        EmailAddress,
        Specialisms,
        JobType,
        offeredSalary,
        employmentType,
        Experience,
        Industry,
        // packages,
        Responsibilties,
        skill_Experience,
        Qualification,
        ApplicationDeadlineDate,
        Country,
        City,
        State,
        jobSkills,
        status,
        companyName,
        // CompleteAddress,
      } = req.body;
      // console.log(req.body);
      if (!findUser.subscribed) {
        return res.status(400).json({
          message: "You don't have access , Please Subscribe to post job",
          status: false,
        });
      }
      const plan = findUser.plan; // Assume `plan` is stored in the user document
      const maxJobs = { free: 1, basic: 1, standard: 3 };
      const deletionDays = { free: 7, basic: 30, standard: 30 };

      if (findUser.plan === "Free-trial" && findUser.jobCount >= 1) {
        const deleteDate = moment().add(7, "days").toDate();
        schedule.scheduleJob(deleteDate, async () => {
          await employerModel.updateOne(
            { userId },
            { $pull: { jobs: { jobId } }, $inc: { jobCount: -1 } }
          );
          await jobsModel.deleteOne({ jobId });
        });
        return res.status(400).json({
          message: `plan limit exceeded`,
          status: false,
        });
      }
      if (findUser.plan === "Basic" && findUser.jobCount >= 1) {
        const deleteDate = moment().add(30, "days").toDate();
        schedule.scheduleJob(deleteDate, async () => {
          await employerModel.updateOne(
            { userId },
            { $pull: { jobs: { jobId } }, $inc: { jobCount: -1 } }
          );
          await jobsModel.deleteOne({ jobId });
        });
        return res.status(400).json({
          message: `plan limit exceeded`,
          status: false,
        });
      }
      if (findUser.plan === "Standard" && findUser.jobCount >= 3) {
        const deleteDate = moment().add(30, "days").toDate();
        schedule.scheduleJob(deleteDate, async () => {
          await employerModel.updateOne(
            { userId },
            { $pull: { jobs: { jobId } }, $inc: { jobCount: -1 } }
          );
          await jobsModel.deleteOne({ jobId });
        });
        return res.status(400).json({
          message: `plan limit exceeded`,
          status: false,
        });
      }
      if (userId) {
        const findUser = await employerModel.findOne({ userId });
        // console.log(findUser.jobs.length);
        let companyName = findUser.companyName;
        if (companyName.includes(" ")) {
          companyName = companyName.split(" ")[0];
        }
        const jobId = await generateUniqueJobId(companyName);
        const postJob = await employerModel.updateOne(
          { userId },

          {
            $push: {
              jobs: {
                jobId,
                JobTitle,
                JobDescription,
                EmailAddress,
                Specialisms,
                JobType,
                employmentType,
                Responsibilties,
                skill_Experience,
                offeredSalary,
                jobSkills,
                Experience,
                Industry,
                Qualification,
                ApplicationDeadlineDate,
                Country,
                City,
                State,
                CompleteAddress: `${(City, Country)}`,
                image: findUser.image,
                postedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                status: "Active",
                companyName: findUser.companyName,
                userId: findUser.userId,
                website: findUser.website,
              },
            },
            $set: {
              jobCount: jobCount,
            },
          }
        );
        const addjobs = await jobsModel.create({
          jobId,
          JobTitle,
          JobDescription,
          EmailAddress,
          Specialisms,
          JobType,
          employmentType,
          Responsibilties,
          skill_Experience,
          offeredSalary,
          jobSkills,
          Experience,
          Industry,
          Qualification,
          ApplicationDeadlineDate,
          Country,
          City,
          State,
          CompleteAddress: `${(City, Country)}`,
          image: findUser.image,
          postedTime: moment().format("MMM Do YYYY"),
          time: moment().format("MMMM D YYYY, h:mm:ss a"),
          status: "Active",
          companyName: findUser.companyName,
          userId: findUser.userId,
          website: findUser.website,
        });

        const candidates = await candidateModel.find({});
        const nonuser = await nonUserModel.find({});
        const sendEmailNotification = async (recipientEmail, jobDetails) => {
          // Function to check if a string contains HTML tags
          const hasHtmlTags = (str) => /<\/?[a-z][\s\S]*>/i.test(str);

          // Function to remove HTML tags using cheerio
          const removeHtmlTags = (htmlString) => {
            const $ = cheerio.load(htmlString); // Load HTML string
            return $.text(); // Extract and return plain text
          };

          // Check if JobDescription contains HTML tags
          const plainJobDescription = hasHtmlTags(jobDetails.JobDescription)
            ? removeHtmlTags(jobDetails.JobDescription) // If HTML tags are present, strip them
            : jobDetails.JobDescription; // If no tags, use the description as is
          const emailSubject = `New Job Alert: ${jobDetails.JobTitle} at ${jobDetails.companyName}`;
          const emailText = `Hi ${jobDetails.name},
  
          We found a job that matches your skills:
          
          Job Title: ${jobDetails.JobTitle}
          Company: ${jobDetails.companyName}
          Location: ${jobDetails.City}, ${jobDetails.State}, ${jobDetails.Country}
          Description: ${plainJobDescription}
          
          Apply here:${process.env.USWEBSITE}/job-detail/${userId}/${jobId}



          Best regards,
           Skill Stream Team`;

          await sendEmail(
            recipientEmail,
            emailSubject,
            emailText,
            EmailAddress
          );
        };
        // Iterate through each candidate
        candidates.forEach(async (candidate) => {
          // Compare candidate's skills with jobSkills (case-insensitive)
          const lowerCaseJobSkills = jobSkills.map((skill) =>
            skill.toLowerCase()
          );
          const lowerCaseCandidateSkills = candidate.skills.map((skill) =>
            skill.toLowerCase()
          );
          const matchedSkills = lowerCaseCandidateSkills.filter((skill) =>
            lowerCaseJobSkills.includes(skill)
          );
          // console.log(matchedSkills);
          if (matchedSkills.length > 0) {
            // If skills match, add job details to job alerts array
            await candidateModel.updateOne(
              { _id: candidate._id },
              {
                $push: {
                  jobAlerts: {
                    jobId,
                    JobTitle,
                    companyName: findUser.companyName,
                    employerId: findUser.userId,
                    Country,
                    City,
                    State,
                    postedTime: moment().format("MMM Do YYYY"),
                  },
                  notifications: {
                    companyName: findUser.companyName,
                    employerId: findUser.userId,
                    jobId,
                    JobTitle,
                    image: findUser.image,
                    postedTime: moment().format("MMM Do YYYY"),
                    read: false,
                  },
                },
              }
            );
            // const sendUserSocket = onlineUsers.get(candidateId);
            // if (sendUserSocket) {
            //   req.app
            //     .get("io")
            //     .to(sendUserSocket)
            //     .emit("newNotification", {
            //       type: "Job Alert",
            //       message: `${findUser.companyName} Posted a job ${JobTitle}`,
            //       data: {
            //         companyName: findUser.companyName,
            //         employerId: findUser.userId,
            //         jobId,
            //         JobTitle,
            //         image: findUser.image,
            //         postedTime: moment().format("MMM Do YYYY"),
            //         read: false,
            //       },
            //     });
            //   console.log("Notification sent");
            // }
            await sendEmailNotification(candidate.email, {
              JobTitle,
              name: candidate.name,
              companyName: findUser.companyName,
              City,
              State,
              Country,
              JobDescription,
            });
          }
        });
        nonuser.forEach(async (nonuser) => {
          const lowerCaseJobSkills = jobSkills.map((skill) =>
            skill.toLowerCase()
          );
          const lowerCaseNonUserSkills = nonuser.skills.map((skill) =>
            skill.toLowerCase()
          );
          const matchedSkills = lowerCaseNonUserSkills.filter((skill) =>
            lowerCaseJobSkills.includes(skill)
          );

          if (matchedSkills.length > 0) {
            // Send email to non-user
            await sendEmailNotification(nonuser.email, {
              JobTitle,
              name: nonuser.name,
              companyName: findUser.companyName,
              City,
              State,
              Country,
              JobDescription,
            });
          }
        });

        res.status(200).json({
          message: "Job post created Successfullly",
          status: true,
          jobId: jobId,
        });
      } else {
        res.status(400).json({ message: "UserId missing", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async editPostJob(req, res) {
    try {
      // console.log("hi");
      const { userId } = req.params;
      const findUser = await employerModel.findOne({ userId });
      const {
        jobId,
        JobTitle,
        JobDescription,
        EmailAddress,
        Specialisms,
        JobType,
        offeredSalary,
        employmentType,
        Experience,
        Industry,
        Responsibilties,
        skill_Experience,
        Qualification,
        ApplicationDeadlineDate,
        Country,
        City,
        State,
        jobSkills,
        status,
        companyName,
      } = req.body;

      if (userId) {
        if (!findUser?.jobs?.some((job) => job.jobId === jobId) || await jobsModel.exists({ userId, jobId, status: "Deleted" })) {
          return res.status(410).json({ message: "This job is no longer available." });
        }
        const updateJob = await employerModel.updateOne(
          { userId, "jobs.jobId": jobId },
          {
            $set: {
              "jobs.$.JobTitle": JobTitle,
              "jobs.$.JobDescription": JobDescription,
              "jobs.$.EmailAddress": EmailAddress,
              "jobs.$.Specialisms": Specialisms,
              "jobs.$.JobType": JobType,
              "jobs.$.employmentType": employmentType,
              "jobs.$.Responsibilties": Responsibilties,
              "jobs.$.skill_Experience": skill_Experience,
              "jobs.$.offeredSalary": offeredSalary,
              "jobs.$.jobSkills": jobSkills,
              "jobs.$.Experience": Experience,
              "jobs.$.Industry": Industry,
              "jobs.$.Qualification": Qualification,
              "jobs.$.ApplicationDeadlineDate": ApplicationDeadlineDate,
              "jobs.$.Country": Country,
              "jobs.$.City": City,
              "jobs.$.State": State,
              "jobs.$.CompleteAddress": `${(City, Country)}`,
              "jobs.$.image": findUser.image,
              "jobs.$.status": "Active",
              "jobs.$.companyName": findUser.companyName,
              "jobs.$.userId": findUser.userId,
              "jobs.$.website": findUser.website,
            },
          }
        );

        console.log(updateJob);
        const addjobs = await jobsModel.updateOne(
          { userId, jobId, status: { $ne: "Deleted" } },
          {
            $set: {
              jobId,
              JobTitle,
              JobDescription,
              EmailAddress,
              Specialisms,
              JobType,
              employmentType,
              Responsibilties,
              skill_Experience,
              offeredSalary,
              jobSkills,
              Experience,
              Industry,
              Qualification,
              ApplicationDeadlineDate,
              Country,
              City,
              State,
              CompleteAddress: findUser.address,
              image: findUser.image,
              companyName: findUser.companyName,
              userId: findUser.userId,
              website: findUser.website,
            },
          }
        );
        res.status(200).json({
          message: "Job updated Successfullly",
          jobId: jobId,
          status: true,
        });
      } else {
        res.status(400).json({ message: "UserId missing", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getAllJobs(req, res) {
    try {
      const country = req.params.country?.replaceAll("-", " ");
      const rows = await jobsModel.aggregate([{ $match: country ? { Country: country } : {} }, ...availableJobStages()]);
      const grouped = new Map();
      for (const job of rows) grouped.set(job.userId, [...(grouped.get(job.userId) || []), job]);
      res.status(200).json({ jobs: [...grouped.values()] });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getJobs(req, res) {
    try {
      const { country } = req.params;
      const { id } = req.query;
      console.log(id);
      const formatedCountry =
        country === "United-States"
          ? `${country.split("-")[0]} ${country.split("-")[1]}`
          : country;

      const jobsQuery = { Country: formatedCountry };
      let locations = false;
      if (id) {
        const candidate = await candidateModel.findOne({ userId: id });
        if (candidate?.preferred_locations?.length) {
          jobsQuery.City = { $in: candidate.preferred_locations.map((city) => new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) };
          locations = true;
        }
        if (candidate?.resume && candidate.skills?.length) jobsQuery.jobSkills = { $in: candidate.skills };
      }
      const getAllJobs = await jobsModel.aggregate([{ $match: jobsQuery }, ...availableJobStages()]);
      if (getAllJobs.length === 0) {
        return res.status(200).json({ TotalJobs: 0, getAllJobs: [], preferred_locations: locations });
      }
      console.log(`Prefered locations : ${locations}`);
      return res.status(200).json({
        TotalJobs: getAllJobs.length,
        getAllJobs,
        preferred_locations: locations,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  // async getJobs(req, res) {
  //   try {
  //     const { country } = req.params;
  //     const { id } = req.query;
  //     if (id) {
  //       console.log(id);
  //     }
  //     // console.log(
  //     //   country === "United-States"
  //     //     ? `${country.split("-")[0]} ${country.split("-")[1]}`
  //     //     : country
  //     // );
  //     const formatedCountry =
  //       country === "United-States"
  //         ? `${country.split("-")[0]} ${country.split("-")[1]}`
  //         : country;
  //     const getAllJobs = await jobsModel.find({ Country: formatedCountry });
  //     if (getAllJobs.length === 0) {
  //       res.status(400).json({ message: "No Jobs Found" });
  //     } else {
  //       res.status(200).json({ TotalJobs: getAllJobs.length, getAllJobs });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res
  //       .status(500)
  //       .json({ message: "Internal Server Error", error, status: false });
  //   }
  // },
  async getPostedJob(req, res) {
    try {
      const { userId, access } = req.params;
      if (userId) {
        // const jobDetails = await employerModel.findOne({ userId });

        // if (jobDetails) {
        // const { access, organisationId } = jobDetails;
        // if (access === "User") {
        const employer = await employerModel.aggregate([
          { $match: { userId } },
          { $unwind: "$jobs" },
          {
            $project: {
              job: {
                jobId: "$jobs.jobId",
                JobTitle: "$jobs.JobTitle",
                JobType: "$jobs.JobType",
                Country: "$jobs.Country",
                isVendor: "$jobs.isVendor",
                jobSkills: "$jobs.jobSkills",
                City: "$jobs.City",
                image: "$jobs.image",
                State: "$jobs.State",
                userId: "$jobs.userId",
                time: "$jobs.time",
                postedTime: "$jobs.postedTime",
                status: "$jobs.status",
                companyName: "$jobs.companyName",
                ApplicationDeadlineDate: "$jobs.ApplicationDeadlineDate",
                JobDescription: "$jobs.JobDescription",
                newJobId: "$jobs.newJobId",
                newId: "$jobs.newId",
                applicants: {
                  $map: {
                    input: { $ifNull: ["$jobs.applicants", []] },
                    as: "a",
                    in: {
                      isVendorApplicant: "$$a.isVendorApplicant",
                      applicationStatus: "$$a.applicationStatus",
                    },
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: "$_id",
              jobs: { $push: "$job" },
            },
          },
        ]);
        console.log(employer.length);
        if (employer.length != 0) {
          return res.status(200).json({
            userId,
            jobs: employer[0]?.jobs || [],
            access: access,
          });
        } else {
          return res.status(404).json({
            message: "No jobs posted",
          });
        }
      } else {
        res.status(400).json({ message: "User Id is required" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getPostedJobByAdmin(req, res) {
    try {
      const { userId, access, organisationId } = req.params;
      if (userId) {
        if (access === "Admin") {
          const orgEmployers = await employerModel.aggregate([
            { $match: { organisationId } },
            { $unwind: "$jobs" },
            {
              $project: {
                userId: 1,
                job: {
                  jobId: "$jobs.jobId",
                  JobTitle: "$jobs.JobTitle",
                  JobType: "$jobs.JobType",
                  Country: "$jobs.Country",
                  isVendor: "$jobs.isVendor",
                  jobSkills: "$jobs.jobSkills",
                  City: "$jobs.City",
                  image: "$jobs.image",
                  State: "$jobs.State",
                  userId: "$jobs.userId",
                  time: "$jobs.time",
                  postedTime: "$jobs.postedTime",
                  status: "$jobs.status",
                  companyName: "$jobs.companyName",
                  ApplicationDeadlineDate: "$jobs.ApplicationDeadlineDate",
                  EmailAddress: "$jobs.EmailAddress",
                  Experience: "$jobs.Experience",
                  _id: "$jobs._id",
                  newJobId: "$jobs.newJobId",
                  newId: "$jobs.newId",
                  // Add more fields as needed
                  applicants: {
                    $map: {
                      input: { $ifNull: ["$jobs.applicants", []] },
                      as: "a",
                      in: {
                        isVendorApplicant: "$$a.isVendorApplicant",
                        applicationStatus: "$$a.applicationStatus",
                      },
                    },
                  },
                },
              },
            },
            {
              $group: {
                _id: "$userId",
                jobs: { $push: "$job" },
              },
            },
          ]);

          let ownJobs = [],
            otherUsersJobs = [];

          for (const emp of orgEmployers) {
            if (emp._id === userId) {
              ownJobs = emp.jobs;
            } else {
              otherUsersJobs.push(...emp.jobs);
            }
          }

          return res.status(200).json({
            organisationId,
            totalJobs: ownJobs.length,
            otherUsersJobsTotal: otherUsersJobs.length,
            jobs: ownJobs,
            otherUsersJobs: otherUsersJobs,
            access: access,
          });
        } else {
          res.status(401).json({
            message: "Access is not updated ,Please login again & Check",
          });
        }
        //  else {
        //   res.status(400).json({ message: "No Jobs Posted" });
        // }
        return res.status(200).json({
          userId,
          jobs: jobDetails.jobs || [],
        });

        // res.status(403).json({ message: "Access level not recognized" });
      } else {
        res.status(400).json({ message: "User Id is required" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getPublicJobByID(req, res) {
    try {
      const { userId, jobId } = req.params;
      if (!await isAvailable(userId, jobId)) return res.status(410).json({ message: "This job is no longer available." });
      const owner = await employerModel.findOne({ userId, jobs: { $elemMatch: { jobId, status: "Active" } } }, { "jobs.$": 1 });
      if (!owner) return res.status(410).json({ message: "This job is no longer available." });
      return res.json({ jobs: owner.jobs, userId });
    } catch (error) { return res.status(500).json({ message: "Unable to load this job." }); }
  },
  async getPostedJobByID(req, res) {
    try {
      const { userId, jobId } = req.params;
      if (userId) {
        const jobDetails = await employerModel.findOne(
          { userId, "jobs.jobId": jobId },
          { "jobs.$": 1, _id: 0 }
        );
        if (jobDetails) {
          res.status(200).json({ jobs: jobDetails.jobs, userId });
        } else {
          res.status(400).json({ message: "No Jobs Posted" });
        }
      } else {
        res.status(400).json({ message: "User Id is required" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deletePostedJob(req, res) {
    try {
      const { userId, jobId } = req.params;
      if (userId) {
        const owner = await employerModel.findOne({ userId });
        const actor = req.user;
        const sameOrgAdmin = actor?.access === "Admin" && actor.organisationId && actor.organisationId === owner?.organisationId;
        if (actor?.role !== "Employer" || (actor.userId !== userId && !sameOrgAdmin)) {
          return res.status(403).json({ message: "You cannot delete this employer's job." });
        }
        await require("../../services/jobDeletion").deleteJob(userId, jobId);
        res.status(200).json({ message: "Job Deleted Successfully" });
      } else {
        res.status(400).json({ message: "User Id is required" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async statusChange(req, res) {
    try {
      const { userId, jobId } = req.params;
      const { status, email, jobTitle, region } = req.body;
      const owner = await employerModel.findOne({ userId, "jobs.jobId": jobId });
      const actor = req.user;
      const sameOrgAdmin = actor?.access === "Admin" && actor.organisationId && actor.organisationId === owner?.organisationId;
      if (actor?.role !== "Employer" || (actor.userId !== userId && !sameOrgAdmin)) return res.sendStatus(403);
      if (!owner || await jobsModel.exists({ userId, jobId, status: "Deleted" })) return res.status(410).json({ message: "This job is no longer available." });
      const updateStatus = await employerModel.updateOne(
        { userId, "jobs.jobId": jobId },
        { $set: { "jobs.$.status": status } }
      );
      const updateJobStatus = await jobsModel.updateOne(
        { userId, jobId, status: { $ne: "Deleted" } },
        { $set: { status: status } }
      );
      // Update candidate status in appliedJobs and shortlistedJobs
      const updateCandidateStatus = await candidateModel.updateMany(
        {
          $or: [
            { "appliedJobs.jobId": jobId },
            { "shortlistedJobs.jobId": jobId },
          ],
        },
        {
          $set: {
            "appliedJobs.$[job].status": status,
            "shortlistedJobs.$[job].status": status,
          },
        },
        {
          arrayFilters: [{ "job.jobId": jobId }],
          multi: true,
        }
      );
      console.log(updateStatus);
      console.log(updateJobStatus);
      console.log(updateCandidateStatus);
      if (updateStatus.modifiedCount === 1) {
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
    <title>Job Status Update</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
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
            display: block;
            margin: 0 auto 15px;
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
            text-align: center;
            padding: 10px 20px;
        }
        .status-box {
            font-size: 18px;
            font-weight: bold;
            color: #ffffff;
            padding: 12px;
            display: inline-block;
            border-radius: 5px;
            margin: 15px 0;
        }
            .status-container{
            text-align:center;
            }
        /* Status Colors */
        .active { background-color: #28a745; }  /* Green */
        .inactive { background-color: #dc3545; } /* Red */
        .hold { background-color: #ffc107; color: #333; } /* Yellow */
        .closed { background-color: #6c757d; } /* Grey */
        .footer {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
        <h2 class="header">Job Status Update</h2>
        <p class="content">
            Your job <strong>${jobTitle}</strong> status has changed to:
        </p>
       <div class="status-container"> <div class="status-box ${status.toLowerCase()}">${status}</div></div>
        <p class="content">Please check your dashboard for more details.</p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>
               
                `;
        console.log(email);
        //   email details
        let details = {
          from: `SKILLSTREAM  ${
            region === "United States"
              ? "info@skillstreamjobs.us"
              : "support@skillstreamjobs.ca"
          }`,
          to: `${email}`,
          subject: `Job Status for ${jobTitle} Changed`,
          text: `Job Status for ${jobTitle} Changed`,
          html: html,
          replyTo: email,
          //   html: html,
        };

        //   sending the mail for registeration
        mailTransporter
          .sendMail(details)
          .then((info) => {
            res.status(200).json({
              message: "Status updated successfully",
              status: true,
            });
          })
          .catch((err) => {
            console.log("Error in sending the mail for contact us form", err);
            res.status(400).json({ err });
          });
      } else {
        res.status(400).json({ message: "Failed to update status" });
      }
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
        status: false,
      });
    }
  },
  async jobApplicationApproval(req, res) {
    try {
      const { employerId, candidateId, jobId } = req.params;
      const { applicationStatus, region } = req.body;
      console.log(req.params);
      console.log(applicationStatus);
      let userDetail = await candidateModel.findOne({ _id: candidateId });

      // If user not found in the candidate model, search in the nonUser model
      if (!userDetail) {
        userDetail = await nonUserModel.findOne({ _id: candidateId });
      }

      const empDetails = await employerModel.findOne({ userId: employerId });
      console.log(userDetail);
      if (applicationStatus === "Approve") {
        const findUser = await candidateModel.findOne({ id: candidateId });
        // console.log(findUser);

        const updateStatus = await candidateModel.updateOne(
          {
            _id: candidateId,
            "appliedJobs.jobId": jobId,
          },
          {
            $set: {
              "appliedJobs.$.applicationStatus": "Approved",
            },
          }
        );
        const updateApplicants = await employerModel.updateOne(
          {
            userId: employerId,
            "jobs.jobId": jobId,
            "jobs.applicants.id": candidateId,
            // "jobs.applicants.id": candidateId,
            "allApplicants.jobId": jobId,
            // "jobs.applicants.jobId": jobId,
          },
          {
            $set: {
              "allApplicants.$[allApplicant].applicationStatus": "Approved",
              "jobs.$[job].applicants.$[applicant].applicationStatus":
                "Approved",
            },
          },
          {
            arrayFilters: [
              { "job.jobId": jobId },
              { "applicant.id": candidateId },
              {
                "allApplicant.jobId": jobId,
                "allApplicant.id": candidateId,
              },
            ],
            new: true,
          }
        );
        const updateNotifications = await candidateModel.updateOne(
          { _id: candidateId },
          {
            $push: {
              notifications: {
                companyName: empDetails.companyName,
                employerId: empDetails.userId,
                jobId,
                JobTitle: req.body.JobTitle,
                image: empDetails.image,
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                type: "Job Approval",
                read: false,
              },
            },
          }
        );
        // const sendUserSocket = onlineUsers.get(candidateId);
        // if (sendUserSocket) {
        //   req.app
        //     .get("io")
        //     .to(sendUserSocket)
        //     .emit("newNotification", {
        //       type: "Job Approval",
        //       message: `${empDetails.companyName} approved your Application for the job title ${req.body.JobTitle}`,
        //       data: {
        //         companyName: empDetails.companyName,
        //         employerId: empDetails.userId,
        //         jobId,
        //         JobTitle: req.body.JobTitle,
        //         image: empDetails.image,
        //         time: moment().format("MMMM D YYYY, h:mm:ss a"),
        //         type: "Job Approval",
        //         read: false,
        //       },
        //     });
        //   console.log("Notification sent");
        // }
        // console.log(updateStatus);
        console.log(updateNotifications);
        if (
          // updateStatus.modifiedCount != 0 &&
          updateApplicants.modifiedCount != 0
        ) {
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
    <title>Job Application Approved</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
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
            display: block;
            margin: 0 auto 15px;
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
        <h2 class="header">Job Application Approved</h2>
        <p class="content">
            Hello <strong>${userDetail.name}</strong>,
        </p>
        <p class="content">
            Congratulations! Your application for the position of <strong>${req.body.JobTitle}</strong> has been approved.
        </p>
        <p class="content">
            Stay tuned for further updates or check your profile for more details.
        </p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
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
            to: `${userDetail.email}`,
            subject: `Job Update-${req.body.JobTitle} application `,
            text: `Job Update-${req.body.JobTitle} application`,
            html: html,
            replyTo: empDetails.email,
            //   html: html,
          };

          //   sending the mail for registeration
          mailTransporter
            .sendMail(details)
            .then((info) => {
              res.status(200).json({
                message: "Application status updated",
                status: true,
              });
            })
            .catch((err) =>
              console.log("Error in sending the mail for contact us form", err)
            );
        } else {
          res
            .status(409)
            .json({ message: "Already Status Upadted", status: false });
        }
      } else if (applicationStatus === "Reject") {
        const updateStatus = await candidateModel.updateOne(
          {
            _id: candidateId,
            "appliedJobs.jobId": jobId,
          },
          {
            $set: {
              "appliedJobs.$.applicationStatus": "Rejected",
            },
          },
          {
            $push: {
              notifications: {
                companyName: empDetails.companyName,
                employerId: empDetails.userId,
                jobId,
                JobTitle: req.body.JobTitle,
                image: empDetails.image,
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                type: "Job Reject",
                read: false,
              },
            },
          }
        );

        const updateApplicants = await employerModel.updateOne(
          {
            userId: employerId,
            "jobs.jobId": jobId,
            "jobs.applicants.id": candidateId,
            // "jobs.applicants.userId":candidateId,
            "allApplicants.jobId": jobId,
            // "jobs.applicants.jobId": jobId,
          },
          {
            $set: {
              // "allApplicants.$.applicationStatus": "Rejected",
              "allApplicants.$[allApplicant].applicationStatus": "Rejected",
              "jobs.$[job].applicants.$[applicant].applicationStatus":
                "Rejected",
            },
          },
          {
            arrayFilters: [
              { "job.jobId": jobId },
              { "applicant.id": candidateId },
              {
                "allApplicant.jobId": jobId,
                "allApplicant.id": candidateId,
              },
            ],
            new: true,
          }
        );

        const updateNotifications = await candidateModel.updateOne(
          { _id: candidateId },
          {
            $push: {
              notifications: {
                companyName: empDetails.companyName,
                employerId: empDetails.userId,
                jobId,
                JobTitle: req.body.JobTitle,
                image: empDetails.image,
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                type: "Job Reject",
                read: false,
              },
            },
          }
        );
        // console.log(updateStatus);
        // const sendUserSocket = onlineUsers.get(candidateId);
        // if (sendUserSocket) {
        //   req.app
        //     .get("io")
        //     .to(sendUserSocket)
        //     .emit("newNotification", {
        //       type: "Job Reject",
        //       message: `${empDetails.name} Rejected your Application for the job title ${req.body.JobTitle}`,
        //       data: {
        //         companyName: empDetails.companyName,
        //         employerId: empDetails.userId,
        //         jobId,
        //         JobTitle: req.body.JobTitle,
        //         image: empDetails.image,
        //         time: moment().format("MMMM D YYYY, h:mm:ss a"),
        //         type: "Job Reject",
        //         read: false,
        //       },
        //     });
        // }
        if (
          updateStatus.modifiedCount != 0 &&
          updateApplicants.modifiedCount != 0
        ) {
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
    <title>Job Application Update</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
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
            display: block;
            margin: 0 auto 15px;
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
        <h2 class="header">Job Application Update</h2>
        <p class="content">
            Hello <strong>${userDetail.name}</strong>,
        </p>
        <p class="content">
            We appreciate your interest in the <strong>${req.body.JobTitle}</strong> position. After careful review, we regret to inform you that your application has not been selected at this time.
        </p>
        <p class="content">
            We encourage you to explore other opportunities on Skill Stream that match your skills and experience.
        </p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
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
            to: `${userDetail.email}`,
            subject: `Job Update-${req.body.JobTitle}application `,
            text: `Job Update-${req.body.JobTitle}application`,
            html: html,
            replyTo: empDetails.email,
            //   html: html,
          };

          // sending the mail for registeration
          mailTransporter
            .sendMail(details)
            .then((info) => {
              res.status(200).json({
                message: "Application status updated",
                status: true,
              });
            })
            .catch((err) =>
              console.log("Error in sending the mail for contact us form", err)
            );
          // res.status(200).json({
          //   message: "Application status updated",
          //   status: true,
          // });
        } else {
          res
            .status(409)
            .json({ message: "Already Status Upadted", status: false });
        }
      } else {
        res
          .status(400)
          .json({ message: "Error in updating the Job Status", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
        status: false,
      });
    }
  },
  async addCandidateToJob(req, res) {
    try {
      // const {
      //   name,
      //   email,
      //   phoneNumber,
      //   country,
      //   state,
      //   city,
      //   resume,
      //   experience,
      //   jobTitle,
      //   postedJobTitle,
      //   skills,
      //   Education,
      //   work_experience,
      //   Experience_level,
      //   linkedin_url,
      //   technical_expertise_in_skills,
      // } = req.body;
      const candidates = Array.isArray(req.body) ? req.body : [req.body];
      for (const candidate of candidates) {
        const {
          name,
          email,
          phoneNumber,
          country,
          state,
          city,
          resume,
          experience,
          jobTitle,
          postedJobTitle,
          skills,
          Education,
          work_experience,
          Experience_level,
          linkedin_url,
          technical_expertise_in_skills,
          workAuthorization,
        } = candidate;
        const { employerId, jobId } = req.params;
        const employerDetails = await employerModel.findOne({
          userId: employerId,
        });
        const jobData = employerDetails.jobs.find((j) => j.jobId === jobId);
        const jobDetails = {
          job_title: jobData.JobTitle,
          company: jobData.companyName,
          location: `${jobData.City}, ${jobData.State}`,
          education_required: jobData.Qualification,
          skills_required: jobData.jobSkills,
          job_description: jobData.JobDescription,
        };

        const candidateInfo = {
          basic_info: {
            full_name: name,
            email,
            City: city,
            Country: country,
            Province: state,
            Experience_in_Years: experience,
            Experience_level: Experience_level,
            Job_Title: jobTitle,
          },
          education: Education,
          work_experience: work_experience,
          skills,
        };
        let fitmentSummary = {};
        try {
          const fitmentResponse = await axios.post(
            `${process.env.AI_URL}/fitment_analysis`,
            {
              job_description: jobDetails,
              candidate_info: candidateInfo,
            }
          );
          fitmentSummary = fitmentResponse.data;
        } catch (err) {
          console.error("Fitment analysis failed:", err.message);
        }
        // console.log("user");
        const updatedetails = await nonUserModel.create({
          name: name,
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
          image:
            "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
        });

        const addCandidate = await employerModel.updateOne(
          { userId: employerId, "jobs.jobId": jobId },
          {
            $push: {
              "jobs.$.applicants": {
                jobId,
                name: name,
                resume: resume,
                image:
                  "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",
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
                id: updatedetails._id,
                workAuthorization,
                fitmentSummary: JSON.stringify(fitmentSummary),
                matchingScore: fitmentSummary?.fitment_score,
                preCallQuestion: fitmentSummary?.screening_questions || [],
              },
              allApplicants: {
                jobId,
                name: name,
                resume: resume,
                image:
                  "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png",

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
                id: updatedetails._id,
              },
            },
          }
        );
      }
      res
        .status(200)
        .json({ message: "Candidates Added Successfully", status: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
        status: false,
      });
    }
  },
};
module.exports = controller;

// Iterate through each candidate
// candidates.forEach(async (candidate) => {
//   // Compare candidate's skills with jobSkills (case-insensitive)
//   const lowerCaseJobSkills = jobSkills.map((skill) =>
//     skill.toLowerCase()
//   );
//   const lowerCaseCandidateSkills = candidate.skills.map((skill) =>
//     skill.toLowerCase()
//   );
//   const matchedSkills = lowerCaseCandidateSkills.filter((skill) =>
//     lowerCaseJobSkills.includes(skill)
//   );
//   // console.log(matchedSkills);
//   if (matchedSkills.length > 0) {
//     // If skills match, add job details to job alerts array
//     await candidateModel.updateOne(
//       { _id: candidate._id },
//       {
//         $push: {
//           jobAlerts: {
//             jobId,
//             JobTitle,
//             companyName: findUser.companyName,
//             employerId: findUser.userId,
//             Country,
//             City,
//             State,
//             postedTime: moment().format("MMM Do YYYY"),
//           },
//           notifications: {
//             companyName: findUser.companyName,
//             employerId: findUser.userId,
//             jobId,
//             JobTitle,
//             image: findUser.image,
//             postedTime: moment().format("MMM Do YYYY"),
//           },
//         },
//       }
//     );
//     await sendEmailNotification(candidate.email, {
//       JobTitle,
//       name: candidate.name,
//       companyName: findUser.companyName,
//       City,
//       State,
//       Country,
//       JobDescription,
//     });
//   }
// });
// const emailLimit = Math.min(nonuser.length, 500); // Send all if less than 500, else limit to 500
// non user
// for (let i = 0; i < emailLimit; i++) {
//   const nonUser = nonuser[i];

//   const lowerCaseJobSkills = jobSkills.map((skill) =>
//     skill.toLowerCase()
//   );
//   const lowerCaseNonUserSkills = nonUser.skills.map((skill) =>
//     skill.toLowerCase()
//   );
//   const matchedSkills = lowerCaseNonUserSkills.filter((skill) =>
//     lowerCaseJobSkills.includes(skill)
//   );

//   if (matchedSkills.length > 0 && nonUser.email) {
//     await sendEmailNotification(nonUser.email, {
//       JobTitle,
//       name: nonUser.name,
//       companyName: findUser.companyName,
//       City,
//       State,
//       Country,
//       JobDescription,
//     });
//   }
// }

// }

// if (access === "Admin") {
//   const orgEmployers = await employerModel.aggregate([
//     { $match: { organisationId } },
//     { $unwind: "$jobs" },
//     {
//       $project: {
//         userId: 1,
//         job: {
//           jobId: "$jobs.jobId",
//           JobTitle: "$jobs.JobTitle",
//           JobType: "$jobs.JobType",
//           Country: "$jobs.Country",
//           isVendor: "$jobs.isVendor",
//           jobSkills: "$jobs.jobSkills",
//           City: "$jobs.City",
//           image: "$jobs.image",
//           State: "$jobs.State",
//           userId: "$jobs.userId",
//           time: "$jobs.time",
//           postedTime: "$jobs.postedTime",
//           status: "$jobs.status",
//           companyName: "$jobs.companyName",
//           ApplicationDeadlineDate: "$jobs.ApplicationDeadlineDate",
//           EmailAddress: "$jobs.EmailAddress",
//           Experience: "$jobs.Experience",
//           _id: "$jobs._id",
//           // Add more fields as needed
//           applicants: {
//             $map: {
//               input: { $ifNull: ["$jobs.applicants", []] },
//               as: "a",
//               in: {
//                 isVendorApplicant: "$$a.isVendorApplicant",
//                 applicationStatus: "$$a.applicationStatus",
//               },
//             },
//           },
//         },
//       },
//     },
//     {
//       $group: {
//         _id: "$userId",
//         jobs: { $push: "$job" },
//       },
//     },
//   ]);

//   let ownJobs = [],
//     otherUsersJobs = [];

//   for (const emp of orgEmployers) {
//     if (emp._id === userId) {
//       ownJobs = emp.jobs;
//     } else {
//       otherUsersJobs.push(...emp.jobs);
//     }
//   }

//   return res.status(200).json({
//     organisationId,
//     totalJobs: ownJobs.length,
//     otherUsersJobsTotal: otherUsersJobs.length,
//     jobs: ownJobs,
//     otherUsersJobs: otherUsersJobs,
//     access: "Admin",
//   });
// }
// } else {
//   res.status(400).json({ message: "No Jobs Posted" });
// }
// return res.status(200).json({
//   userId,
//   jobs: jobDetails.jobs || [],
// });

// res.status(403).json({ message: "Access level not recognized" });

// const jobDetails = await employerModel.findOne({ userId });

// if (jobDetails) {
// const { access, organisationId } = jobDetails;
// if (access === "User") {
// const employer = await employerModel.aggregate([
//   { $match: { userId } },
//   { $unwind: "$jobs" },
//   {
//     $project: {
//       job: {
//         jobId: "$jobs.jobId",
//         JobTitle: "$jobs.JobTitle",
//         JobType: "$jobs.JobType",
//         Country: "$jobs.Country",
//         isVendor: "$jobs.isVendor",
//         jobSkills: "$jobs.jobSkills",
//         City: "$jobs.City",
//         image: "$jobs.image",
//         State: "$jobs.State",
//         userId: "$jobs.userId",
//         time: "$jobs.time",
//         postedTime: "$jobs.postedTime",
//         status: "$jobs.status",
//         companyName: "$jobs.companyName",
//         ApplicationDeadlineDate: "$jobs.ApplicationDeadlineDate",
//         JobDescription: "$jobs.JobDescription",
//         applicants: {
//           $map: {
//             input: { $ifNull: ["$jobs.applicants", []] },
//             as: "a",
//             in: {
//               isVendorApplicant: "$$a.isVendorApplicant",
//               applicationStatus: "$$a.applicationStatus",
//             },
//           },
//         },
//       },
//     },
//   },
//   {
//     $group: {
//       _id: "$_id",
//       jobs: { $push: "$job" },
//     },
//   },
// ]);
// console.log(employer.length);

// return res.status(200).json({
//   userId,
//   jobs: employer[0]?.jobs || [],
//   access: access,
// });
// }
