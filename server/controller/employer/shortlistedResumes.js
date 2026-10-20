const employerModel = require("../../models/employerModel");
const candidateModel = require("../../models/candidateModel");

const moment = require("moment");
const nodemailer = require("nodemailer");
const controller = {
  async shortlistedResumes(req, res) {
    try {
      const { userId } = req.params;
      const { jobId, candidates } = req.body; // Assuming `candidates` is an array of candidate data

      const employer = await employerModel.findOne({ userId });

      const shortlistedCandidates = [];

      for (const candidate of candidates) {
        const alreadyShortlisted = employer.shortlistedResumes.some(
          (job) => job.id === candidate._id
        );

        if (!alreadyShortlisted) {
          await employerModel.updateOne(
            { userId, "jobs.jobId": jobId },
            {
              $push: {
                "jobs.$.savedResumes": {
                  jobId,
                  id: candidate._id,
                  jobTitle: candidate.jobTitle,
                  shortlistedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  name: candidate.name,
                  city: candidate.city,
                  country: candidate.country,
                  image: candidate.image,
                  resume: candidate.resume,
                },
                shortlistedResumes: {
                  id: candidate._id,
                  jobTitle: candidate.jobTitle,
                  shortlistedTime: moment().format("MMM Do YYYY"),
                  time: moment().format("MMMM D YYYY, h:mm:ss a"),
                  name: candidate.name,
                  city: candidate.city,
                  country: candidate.country,
                  image: candidate.image,
                  resume: candidate.resume,
                },
              },
            }
          );

          shortlistedCandidates.push(candidate.name); // Keep track of successfully shortlisted candidates
        }
      }

      if (shortlistedCandidates.length > 0) {
        res.status(200).json({
          message: "Resumes Added to Selected Job",
          shortlistedCandidates,
          status: true,
        });
      } else {
        res.status(400).json({
          message: "All resumes were already shortlisted",
          status: false,
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },

  // async shortlistedResumes(req, res) {
  //   try {
  //     const { userId } = req.params;
  //     const { jobId } = req.body;
  //     const employer = await employerModel.findOne({ userId });
  //     if (employer.shortlistedResumes.some((job) => job.id === id)) {
  //       // console.log();
  //       return res
  //         .status(400)
  //         .json({ message: "Resume already shortlisted", status: false });
  //     } else {
  //       const Shorlist = await employerModel.updateOne(
  //         { userId, "jobs.jobId": jobId },
  //         {
  //           $push: {
  //             "jobs.$.savedResumes": {
  //               jobId,
  //               id: req.body.id,
  //               jobTitle: req.body.jobTitle,
  //               shortlistedTime: moment().format("MMM Do YYYY"),
  //               time: moment().format("MMMM D YYYY, h:mm:ss a"),
  //               name: req.body.name,
  //               city: req.body.city,
  //               country: req.body.country,
  //               image: req.body.image,
  //               resume: req.body.resume,
  //             },
  //             shortlistedResumes: {
  //               id: req.body._id,
  //               jobTitle: req.body.jobTitle,
  //               shortlistedTime: moment().format("MMM Do YYYY"),
  //               time: moment().format("MMMM D YYYY, h:mm:ss a"),
  //               name: req.body.name,
  //               city: req.body.city,
  //               country: req.body.country,
  //               image: req.body.image,
  //               resume: req.body.resume,
  //             },
  //           },
  //         }
  //       );
  //       const addNotifications = await candidateModel.updateOne(
  //         { userId: req.body.userId },
  //         {
  //           $push: {
  //             notifications: {
  //               companyName: employer.companyName,
  //               employerId: employer.userId,
  //               image: employer.image,
  //               shortlistedTime: moment().format("MMM Do YYYY"),
  //               time: moment().format("MMMM D YYYY, h:mm:ss a"),
  //               type: "Resume Shorlist",
  //             },
  //           },
  //         }
  //       );
  //       console.log(Shorlist);
  //       // let mailTransporter = nodemailer.createTransport({
  //       //   service: "gmail",
  //       //   auth: {
  //       //     user: "support@skillstreamjobs.ca",
  //       //     pass: "yzsz ockc eiql oyqj",
  //       //   },
  //       // });

  //       // //   HTML for the email
  //       // const html = `
  //       // <div>
  //       //         <div>Hello,${req.body.name}</div>
  //       //         <div>${employer.companyName}  has shortlisted your resume</div>

  //       //  </div>
  //       //         `;
  //       // // console.log(email);
  //       // //   email details
  //       // let details = {
  //       //   from: `SKILL STREAM <${employer.email}>`,
  //       //   to: `${req.body.email}`,
  //       //   subject: `Your resume has been shortlisted`,
  //       //   text: `Your resume has been shortlisted`,
  //       //   html: html,
  //       //   //   html: html,
  //       // };

  //       // //   sending the mail for registeration
  //       // mailTransporter
  //       //   .sendMail(details)
  //       //   .then((info) => {
  //       //     res.status(200).json({
  //       //       message: "Shorlisted Successfully",
  //       //       status: true,
  //       //     });
  //       //   })
  //       //   .catch((err) =>
  //       //     console.log("Error in sending the mail for contact us form", err)
  //       //   );
  //       res
  //         .status(200)
  //         .json({ message: "Resume Added to Selected Job", status: true });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res
  //       .status(500)
  //       .json({ message: "Internal Server Error", error, status: false });
  //   }
  // },
  async getShortlistedResume(req, res) {
    try {
      const { userId } = req.params;
      const getApplicants = await employerModel.findOne({ userId }, { _id: 0 });
      // console.log(getApplicants);
      let shortlisted = {
        jobs: [],
      };

      getApplicants.jobs.forEach((job) => {
        shortlisted.jobs.push({
          JobTitle: job.JobTitle,
          jobId: job.jobId,
          companyName: job.companyName,
          JobType: job.JobType,
          jobSkills: job.jobSkills,
          Qualification: job.Qualification,
          JobDescription: job.JobDescription,
          savedResumes: job.savedResumes,
        });
      });

      res.status(200).json(shortlisted);
      // const { userId } = req.params;
      // const getShortlisted = await employerModel.findOne({ userId });
      // if (getShortlisted) {
      //   console.log(getShortlisted);
      //   if (getShortlisted.shortlistedResumes.length != 0) {
      //     //   console.log(getTime);
      //     res
      //       .status(200)
      //       .json({ shortlisted: getShortlisted.shortlistedResumes });
      //   } else {
      //     res
      //       .status(400)
      //       .json({ message: "No Shortlisted Jobs", status: false });
      //   }
      // } else {
      //   res.status(400).json({ message: "User ID not found", status: false });
      // }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deleteShortlistedResume(req, res) {
    try {
      let { jobId, userId, candidateId } = req.params;
      console.log(req.params);

      // const candidateObjectId = new ObjectId(candidateId);
      const deleteshortlisted = await employerModel.updateOne(
        { userId, "jobs.jobId": jobId },
        {
          $pull: {
            "jobs.$.savedResumes": { id: candidateId },
            shortlistedResumes: { id: candidateId },
          },
        }
      );
      console.log(deleteshortlisted);
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
