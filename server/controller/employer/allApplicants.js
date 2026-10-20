const { default: axios } = require("axios");
const employerModel = require("../../models/employerModel");
const aiRequestModel = require("../../models/AIRequests");
const { ObjectId } = require("mongodb");
const applicantModel = require("../../models/applicantsModel"); //
function formatTimeTaken(ms) {
  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    return remSeconds ? `${minutes} min ${remSeconds} sec` : `${minutes} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remMinutes = Math.floor((seconds % 3600) / 60);
    return remMinutes ? `${hours} hr ${remMinutes} min` : `${hours} hr`;
  }
}
const controller = {
  async getAllApplicants(req, res) {
    try {
      const { userId, access } = req.params;

      const user = await employerModel.findOne({ userId });

      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", status: false });
      }

      // const { access, organisationId } = user;
      let orgEmployers = [];

      // if (access === "Admin") {
      //   // Get all users under the same organisation
      //   orgEmployers = await employerModel.find(
      //     { organisationId },
      //     { jobs: 1, userId: 1, _id: 0 }
      //   );
      // } else if (access === "User") {
      orgEmployers = [user]; // Only their jobs
      // } else {
      //   return res
      //     .status(403)
      //     .json({ message: "Access level not recognized", status: false });
      // }

      const myJobsApplicants = [];
      // const otherUsersApplicants = [];

      for (const emp of orgEmployers) {
        const isSelf = emp.userId === userId;

        for (const job of emp.jobs || []) {
          let approvedCount = 0;
          let rejectedCount = 0;
          let totalApplicants = 0;

          (job.applicants || []).forEach((applicant) => {
            if (applicant.applicationStatus === "Approved") approvedCount++;
            else if (applicant.applicationStatus === "Rejected")
              rejectedCount++;
            totalApplicants++;
          });

          const jobData = {
            JobTitle: job.JobTitle,
            companyName: job.companyName,
            isVendor: job.isVendor,
            jobId: job.jobId,
            JobType: job.JobType,
            jobSkills: job.jobSkills,
            Qualification: job.Qualification,
            JobDescription: job.JobDescription,
            EmailAddress: job.EmailAddress,
            applicants: job.applicants || [],
            time: job.time,
            userId: emp.userId,
            userEmail: emp.email,
            newJobId: job.newJobId,
            newId: job.newId,
            counts: {
              approved: approvedCount,
              rejected: rejectedCount,
              total: totalApplicants,
            },
          };

          // if (isSelf) {
          myJobsApplicants.push(jobData);
          // } else {
          //   otherUsersApplicants.push(jobData);
          // }
        }
      }

      res.status(200).json({
        userId,
        // organisationId,
        totalJobs: myJobsApplicants.length,
        allApplicants: {
          jobs: myJobsApplicants,
          // otherUserJobs: otherUsersApplicants,
        },
      });
    } catch (error) {
      console.error("getAllApplicants error:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getAdminApplicants(req, res) {
    try {
      const { userId, access, organisationId } = req.params;

      // const user = await employerModel.findOne({ userId });

      // if (!user) {
      //   return res
      //     .status(404)
      //     .json({ message: "User not found", status: false });
      // }

      // const { access, organisationId } = user;
      let orgEmployers = [];

      if (access === "Admin") {
        // Get all users under the same organisation
        orgEmployers = await employerModel.find(
          { organisationId },
          { jobs: 1, userId: 1, _id: 0 }
        );
      } else {
        return res.status(403).json({
          message: "Access not updated,Please login again",
          status: false,
        });
      }

      // } else if (access === "User") {
      //   orgEmployers = [user]; // Only their jobs
      // } else {
      //   return res
      //     .status(403)
      //     .json({ message: "Access level not recognized", status: false });
      // }

      const myJobsApplicants = [];
      const otherUsersApplicants = [];

      for (const emp of orgEmployers) {
        const isSelf = emp.userId === userId;

        for (const job of emp.jobs || []) {
          let approvedCount = 0;
          let rejectedCount = 0;
          let totalApplicants = 0;

          (job.applicants || []).forEach((applicant) => {
            if (applicant.applicationStatus === "Approved") approvedCount++;
            else if (applicant.applicationStatus === "Rejected")
              rejectedCount++;
            totalApplicants++;
          });

          const jobData = {
            JobTitle: job.JobTitle,
            companyName: job.companyName,
            isVendor: job.isVendor,
            jobId: job.jobId,
            JobType: job.JobType,
            jobSkills: job.jobSkills,
            Qualification: job.Qualification,
            JobDescription: job.JobDescription,
            EmailAddress: job.EmailAddress,
            applicants: job.applicants || [],
            time: job.time,
            userId: emp.userId,
            userEmail: emp.email,
            newJobId: job.newJobId,
            newId: job.newId,
            counts: {
              approved: approvedCount,
              rejected: rejectedCount,
              total: totalApplicants,
            },
          };

          if (isSelf) {
            myJobsApplicants.push(jobData);
          } else {
            otherUsersApplicants.push(jobData);
          }
        }
      }

      res.status(200).json({
        userId,
        organisationId,
        totalJobs: myJobsApplicants.length,
        allApplicants: {
          jobs: myJobsApplicants,
          otherUserJobs: otherUsersApplicants,
        },
      });
    } catch (error) {
      console.error("getAllApplicants error:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async getApplicantsByUserAndJob(req, res) {
    try {
      const { userId, jobId } = req.params;
      console.log("filter");
      const employer = await employerModel.findOne(
        { userId, "jobs.jobId": jobId },
        { "jobs.$": 1, email: 1, userId: 1 }
      );

      if (!employer || !employer.jobs || employer.jobs.length === 0) {
        return res
          .status(404)
          .json({ message: "Job not found", status: false });
      }

      const job = employer.jobs[0];

      const approvedCount =
        job.applicants?.filter((a) => a.applicationStatus === "Approved")
          ?.length || 0;
      const rejectedCount =
        job.applicants?.filter((a) => a.applicationStatus === "Rejected")
          ?.length || 0;
      const totalApplicants = job.applicants?.length || 0;

      const jobData = {
        JobTitle: job.JobTitle,
        companyName: job.companyName,
        isVendor: job.isVendor,
        jobId: job.jobId,
        JobType: job.JobType,
        jobSkills: job.jobSkills,
        Qualification: job.Qualification,
        JobDescription: job.JobDescription,
        EmailAddress: job.EmailAddress,
        applicants: job.applicants || [],
        time: job.time,
        userId: employer.userId,
        userEmail: employer.email,
        counts: {
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalApplicants,
        },
      };

      return res.status(200).json({ jobData, status: true });
    } catch (error) {
      console.error("getApplicantsByUserAndJob error:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deleteApplicants(req, res) {
    try {
      let { jobId, userId, candidateId } = req.params;
      console.log(candidateId);
      const candidateObjectId = new ObjectId(candidateId);
      const deleteshortlisted = await employerModel.updateOne(
        { userId, "jobs.jobId": jobId },
        {
          $pull: {
            "jobs.$.applicants": { id: candidateId },
            allApplicants: { id: candidateObjectId },
          },
        }
      );
      console.log(deleteshortlisted);
      res.status(200).json({
        message: "Applicant Deleted Successfully",
        status: true,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async fitmentAnalysis(req, res) {
    try {
      const requestTime = new Date();

      const { jobDetails, userDetails } = req.body;
      const { userId, jobId, candidateId } = req.params;
      let body = {
        job_description: jobDetails,
        candidate_info: userDetails,
      };
      // console.log(body);

      const { data } = await axios.post(
        `${process.env.AI_URL}/fitment_analysis`,
        body
      );
      console.log(data);
      const storefitment = await employerModel.updateOne(
        {
          userId: userId,
          "jobs.jobId": jobId,
          "jobs.applicants.id": candidateId,
          // "allApplicants.jobId": jobId,}
        },
        {
          $set: {
            "jobs.$[job].applicants.$[applicant].fitmentSummary":
              JSON.stringify(data),
            "jobs.$[job].applicants.$[applicant].matchingScore":
              data.fitment_score,
            "jobs.$[job].applicants.$[applicant].preCallQuestion":
              data.screening_questions,
          },
        },
        {
          arrayFilters: [
            { "job.jobId": jobId },
            { "applicant.id": candidateId },
          ],
          new: true,
        }
      );
      const responseTime = new Date();
      const timeTaken = responseTime - requestTime;
      const storeResponse = await aiRequestModel.create({
        apiRoute: req.originalUrl,
        aiRoute: "/fitment_analysis",
        request: req.body,
        response: data,
        version: "1.1.0",
        requestTime,
        responseTime,
        timeTaken: formatTimeTaken(timeTaken),
      });
      res
        .status(200)
        .json({ message: "Fitment Analysis Completed", status: true, data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async analyseCandidate(req, res) {
    try {
      const { jobDetails, userDetails } = req.body;
      const requestTime = new Date();

      // const { userId, jobId, candidateId } = req.params;
      let body = {
        job_description: jobDetails,
        candidate_info: userDetails,
      };
      console.log(body);

      const { data } = await axios.post(
        `${process.env.AI_URL}/fitment_analysis`,
        body
      );
      console.log(data);
      const responseTime = new Date();
      const timeTaken = responseTime - requestTime;
      const storeResponse = await aiRequestModel.create({
        apiRoute: req.originalUrl,
        aiRoute: "/fitment_analysis",
        request: req.body,
        response: data,
        version: "1.1.0",
        requestTime,
        responseTime,
        timeTaken: formatTimeTaken(timeTaken),
      });
      // const storefitment = await employerModel.updateOne(
      //   {
      //     userId: userId,
      //     "jobs.jobId": jobId,
      //     "jobs.applicants.id": candidateId,
      //     // "allApplicants.jobId": jobId,}
      //   },
      //   {
      //     $set: {
      //       "jobs.$[job].applicants.$[applicant].fitmentSummary": data,
      //       "jobs.$[job].applicants.$[applicant].matchingScore":
      //         data.matching_score,
      //     },
      //   },
      //   {
      //     arrayFilters: [
      //       { "job.jobId": jobId },
      //       { "applicant.id": candidateId },
      //     ],
      //     new: true,
      //   }
      // );
      res
        .status(200)
        .json({ message: "Fitment Analysis Completed", status: true, data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};
module.exports = controller;
// async getAllApplicants(req, res) {
//   try {
//     const { userId } = req.params;
//     const getApplicants = await employerModel.findOne({ userId }, { _id: 0 });
//     // console.log(getApplicants);
//     let response = {
//       allApplicants: {
//         jobs: [],
//       },
//     };

//     getApplicants.jobs.forEach((job) => {
//       let approvedCount = 0;
//       let rejectedCount = 0;
//       let totalApplicants = 0;
//       job.applicants.forEach((applicant) => {
//         if (applicant.applicationStatus === "Approved") {
//           approvedCount++;
//         } else if (applicant.applicationStatus === "Rejected") {
//           rejectedCount++;
//         }
//         totalApplicants++;
//       });

//       response.allApplicants.jobs.push({
//         JobTitle: job.JobTitle,
//         companyName: job.companyName,
//         jobId: job.jobId,
//         JobType: job.JobType,
//         jobSkills: job.jobSkills,
//         Qualification: job.Qualification,
//         JobDescription: job.JobDescription,
//         EmailAddress: job.EmailAddress,
//         applicants: job.applicants,
//         time: job.time,
//         counts: {
//           approved: approvedCount,
//           rejected: rejectedCount,
//           total: totalApplicants,
//         },
//       });
//     });

//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error, status: false });
//   }
// },
