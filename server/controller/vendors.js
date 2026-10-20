const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const vendorModel = require("../models/vendorModel");
const employerModel = require("../models/employerModel");
const nodemailer = require("nodemailer");
const formidable = require("formidable");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const AWS = require("aws-sdk");
const aiRequestModel = require("../models/AIRequests");
const mongoose = require("mongoose");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});
const moment = require("moment");
const controller = {
  async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const isUserCheck = await vendorModel.findOne({ userId });
      if (isUserCheck) {
        const updateDetails = await vendorModel.updateOne(
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
  async vendorDetails(req, res) {
    try {
      const { userId } = req.params;
      const getUsers = await vendorModel.find({
        userId,
      });
      // console.log(getUsers);
      if (getUsers.length != 0) {
        res.status(200).json({ Vendor: getUsers, status: true });
      } else {
        res.status(404).json({ message: "user not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async AddCandidates(req, res) {
    const requestTime = new Date();

    // const parseForm = () =>
    //   new Promise((resolve, reject) => {
    //     const form = formidable({
    //       multiples: true,
    //       keepExtensions: true,
    //       useTempFiles: true,
    //     });
    //     form.parse(req, (err, fields, files) => {
    //       if (err) reject(err);
    //       else resolve({ fields, files });
    //     });
    //   });
    const parseForm = () =>
      new Promise((resolve, reject) => {
        const form = formidable({
          multiples: true,
          keepExtensions: true,
          useTempFiles: true,
        });
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
    try {
      const { files } = await parseForm();
      const uploadedFiles = Array.isArray(files.resumes)
        ? files.resumes
        : [files.resumes];
      const workAuthFile = files.workAuthDocs; // Only one file expected
      if (!uploadedFiles.length) {
        return res
          .status(400)
          .json({ message: "No file uploaded", status: false });
      }

      const successFiles = [];
      const failedFiles = [];
      for (const file of uploadedFiles) {
        try {
          const fileBuffer = fs.readFileSync(file.filepath);
          const fileStream = fs.createReadStream(file.filepath);
          const fileExt = file.mimetype;

          const formData = new FormData();
          formData.append("file", fs.createReadStream(file.filepath));

          // Parse resume using AI
          let parsedData;
          try {
            const { data } = await axios.post(
              `${process.env.AI_URL}/parse_resume`,
              formData,
              {
                headers: formData.getHeaders(),
              }
            );
            parsedData = data;
          } catch (err) {
            throw new Error("Resume parsing failed via AI: " + err.message);
          }

          // Upload to S3
          const s3Data = await new Promise((resolve, reject) => {
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
              Key: file.newFilename,
              Body: fileStream,
              ACL: "public-read-write",
              ContentType: fileExt,
            };
            s3.upload(params, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          let workAuthURL = "";
          if (workAuthFile) {
            const waStream = fs.createReadStream(workAuthFile.filepath);
            const waExt = workAuthFile.mimetype;
            const waUpload = await new Promise((resolve, reject) => {
              const params = {
                Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
                Key: workAuthFile.newFilename,
                Body: waStream,
                ACL: "public-read-write",
                ContentType: waExt,
              };
              s3.upload(params, (err, data) => {
                if (err) reject(err);
                else resolve(data);
              });
            });
            workAuthURL = waUpload.Location;
          }
          // console.log({
          //   name: parsedData?.basic_info?.full_name,
          //   email: parsedData?.basic_info?.email,
          //   phone_number: parsedData?.basic_info?.phone_number,
          //   country: parsedData?.basic_info?.Country,
          //   city: parsedData?.basic_info?.City,
          //   resume: s3Data?.Location,
          //   experience: parsedData?.basic_info?.Experience_in_Years,
          //   jobTitle: parsedData?.basic_info?.Job_Title,
          //   state: parsedData?.basic_info?.Province,
          //   linkedin_url: parsedData?.basic_info?.linkedin_url,
          //   technical_expertise_in_skills:
          //     parsedData?.basic_info?.technical_expertise_in_skills,
          //   Experience_level: parsedData?.basic_info?.Experience_level,
          //   skills: parsedData?.skills,
          //   Education: parsedData?.Education,
          //   work_experience: parsedData?.work_experience,
          // });

          // Store in DB
          const candidateEmail = parsedData?.basic_info?.email;

          const updated = await vendorModel.updateOne(
            {
              userId: req.params.userId,
              "candidates.email": candidateEmail,
            },
            {
              $set: {
                "candidates.$.name": parsedData?.basic_info?.full_name,
                "candidates.$.phone_number":
                  parsedData?.basic_info?.phone_number,
                "candidates.$.country": parsedData?.basic_info?.Country,
                "candidates.$.city": parsedData?.basic_info?.City,
                "candidates.$.resume": s3Data?.Location,
                "candidates.$.experience":
                  parsedData?.basic_info?.Experience_in_Years,
                "candidates.$.jobTitle": parsedData?.basic_info?.Job_Title,
                "candidates.$.state": parsedData?.basic_info?.Province,
                "candidates.$.linkedin_url":
                  parsedData?.basic_info?.linkedin_url,
                "candidates.$.technical_expertise_in_skills":
                  parsedData?.basic_info?.technical_expertise_in_skills,
                "candidates.$.Experience_level":
                  parsedData?.basic_info?.Experience_level,
                "candidates.$.skills": parsedData?.skills,
                "candidates.$.Education": parsedData?.Education,
                "candidates.$.work_experience": parsedData?.work_experience,
                "candidates.$.documents.workAuthorization": workAuthURL,
              },
            }
          );

          // If no candidate was matched (email not found), push as new
          if (updated.modifiedCount === 0) {
            await vendorModel.updateOne(
              { userId: req.params.userId },
              {
                $push: {
                  candidates: {
                    _id: new mongoose.Types.ObjectId(), // ← assign unique ID
                    name: parsedData?.basic_info?.full_name,
                    email: candidateEmail,
                    phone_number: parsedData?.basic_info?.phone_number,
                    country: parsedData?.basic_info?.Country,
                    city: parsedData?.basic_info?.City,
                    resume: s3Data?.Location,
                    experience: parsedData?.basic_info?.Experience_in_Years,
                    jobTitle: parsedData?.basic_info?.Job_Title,
                    state: parsedData?.basic_info?.Province,
                    linkedin_url: parsedData?.basic_info?.linkedin_url,
                    technical_expertise_in_skills:
                      parsedData?.basic_info?.technical_expertise_in_skills,
                    Experience_level: parsedData?.basic_info?.Experience_level,
                    skills: parsedData?.skills,
                    Education: parsedData?.Education,
                    work_experience: parsedData?.work_experience,
                    documents: {
                      workAuthorization: workAuthURL,
                    },
                  },
                },
              }
            );
          }
          // Store AI logs
          // const responseTime = new Date();
          // const timeTaken = responseTime - requestTime;
          // await aiRequestModel.create({
          //   apiRoute: req.originalUrl,
          //   aiRoute: "/parse_resume",
          //   request: s3Data?.Location,
          //   response: storedetails,
          //   version: "1.1.0",
          //   requestTime,
          //   responseTime,
          //   timeTaken: formatTimeTaken(timeTaken),
          // });

          successFiles.push({
            filename: file.originalFilename,
            url: s3Data?.Location,
          });
        } catch (error) {
          console.error(
            `Error processing file "${file.originalFilename}":`,
            error.message
          );
          failedFiles.push({
            filename: file.originalFilename,
            error: error.message,
          });
          continue; // Skip to the next file
        }
      }

      res.status(200).json({
        message: "Resume upload and parsing completed",
        status: true,
        successCount: successFiles.length,
        failedCount: failedFiles.length,
        successes: successFiles,
        failures: failedFiles,
        candidateIds: successFiles.map((file) => file._id),
      });
    } catch (error) {
      console.error("Fatal error in resumeParserAI:", error);
      res.status(500).json({ message: "Internal Server Error", status: false });
    }
  },
  async getVendorCandidates(req, res) {
    try {
      const vendor = await vendorModel.findOne({ userId: req.params.userId });
      if (!vendor) {
        return res
          .status(404)
          .json({ message: "Vendor not found", status: false });
      }
      res.json({ candidates: vendor.candidates, status: true });
    } catch (err) {
      res.status(500).json({ message: "Server error", status: false });
    }
  },
  async EditCandidate(req, res) {
    const { userId, candidateId } = req.params;
    const updatedData = req.body; // assume it contains the fields to update

    try {
      const result = await vendorModel.updateOne(
        { userId, "candidates._id": new mongoose.Types.ObjectId(candidateId) },
        {
          $set: {
            "candidates.$.name": updatedData.name,
            "candidates.$.phone_number": updatedData.phone_number,
            "candidates.$.country": updatedData.country,
            "candidates.$.city": updatedData.city,
            "candidates.$.resume": updatedData.resume,
            "candidates.$.experience": updatedData.experience,
            "candidates.$.jobTitle": updatedData.jobTitle,
            "candidates.$.state": updatedData.state,
            "candidates.$.linkedin_url": updatedData.linkedin_url,
            "candidates.$.technical_expertise_in_skills":
              updatedData.technical_expertise_in_skills,
            "candidates.$.Experience_level": updatedData.Experience_level,
            "candidates.$.skills": updatedData.skills,
            "candidates.$.Education": updatedData.Education,
            "candidates.$.work_experience": updatedData.work_experience,
          },
        }
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Candidate not found", status: false });
      }

      res.json({ message: "Candidate updated successfully", status: true });
    } catch (err) {
      res.status(500).json({ message: "Server error", status: false });
    }
  },
  async deleteCandidate(req, res) {
    const { userId, candidateId } = req.params;

    try {
      const result = await vendorModel.updateOne(
        { userId },
        {
          $pull: {
            candidates: { _id: new mongoose.Types.ObjectId(candidateId) },
          },
        }
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Candidate not found", status: false });
      }

      res.json({ message: "Candidate deleted successfully", status: true });
    } catch (err) {
      res.status(500).json({ message: "Server error", status: false });
    }
  },
  async applyJobAsVendor(req, res) {
    try {
      const { vendorId, employerId } = req.params;
      const {
        jobId,
        JobTitle,
        companyName,
        Industry,
        offeredSalary,
        employmentType,
        jobType,
        status,
        city,
        State,
        email,
        region,
        isVendorApplicant,
        // <-- now array
      } = req.body;
      let { candidateIds } = req.body;
      if (typeof candidateIds === "string") {
        candidateIds = [candidateIds];
      } else if (!Array.isArray(candidateIds)) {
        candidateIds = [];
      }
      // console.log(candidateIds);

      const employer = await employerModel.findOne({ userId: employerId });
      const vendor = await vendorModel.findOne({ userId: vendorId });

      if (!vendor || !employer) {
        return res
          .status(404)
          .json({ message: "Employer or Vendor not found" });
      }
      const job = employer.jobs.find((j) => j.jobId === jobId);
      if (!job) {
        return res
          .status(404)
          .json({ message: "Job not found in employer data" });
      }
      const appliedApplicants = [];

      // Loop through candidateIds and build application entries
      for (const candidateId of candidateIds) {
        // console.log(candidateId);

        const candidate = vendor.candidates.find(
          (c) => c._id.toString() === candidateId
        );
        console.log(candidate);
        if (!candidate) continue; // Skip if not found
        const applicantData = {
          userId: vendorId,
          jobId,
          name: candidate.name,
          resume: candidate.resume,
          email: candidate.email,
          // candidateEmail: candidate.email,
          phone: candidate.phone_number,
          Experience_level: candidate.Experience_level,
          image: candidate.image,
          jobTitle: candidate.jobTitle,
          currentSalary: candidate.currentSalary,
          city: candidate.city,
          country: candidate.country,
          state: candidate.state,
          skills: candidate.skills,
          work_experience: candidate.work_experience,
          education: candidate.Education,
          appliedTime: moment().format("MMM Do YYYY"),
          time: moment().format("MMMM D YYYY, h:mm:ss a"),
          applicationStatus: "pending",
          id: candidate._id,
          isVendorApplicants: true,
          workAuthorization: candidate.workAuthorization || "",
          documents: {
            workAuthorization: candidate?.documents?.workAuthorization,
          },
        };

        const jobDetails = {
          job_title: job.JobTitle,
          company: job.companyName,
          location: `${(job.City, job.State)}`,
          education_required: job.Qualification,
          skills_required: job.jobSkills,
          job_description: job.JobDescription,
        };
        const candidateInfo = {
          basic_info: {
            full_name: candidate.name,
            email: candidate.email,
            City: candidate.city,
            Country: candidate.country,
            Province: candidate.state,
            Experience_in_Years: candidate.experience,
            Experience_level: candidate.Experience_level,
            Job_Title: candidate.jobTitle,
          },
          education: candidate.education,
          work_experience: candidate.work_experience,
          skills: candidate.skills,
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
        const baseApplicant = {
          userId: vendorId,
          jobId,
          name: candidate.name,
          resume: candidate.resume,
          image: candidate.image,
          position: candidate.position,
          jobTitle: candidate.jobTitle,
          currentSalary: candidate.currentSalary,
          city: candidate.city,
          country: candidate.country,
          skills: candidate.skills,
          work_experience: candidate.work_experience,
          experience: candidate.experience,
          education: candidate.Education,
          email: vendor.email,
          phone: candidate.phone_number,
          Experience_level: candidate.Experience_level,
          state: candidate.state,
          appliedTime: moment().format("MMM Do YYYY"),
          time: moment().format("MMMM D YYYY, h:mm:ss a"),
          applicationStatus: "pending",
          id: candidate._id,
          isVendorApplicant: true,
          vendor: {
            name: vendor.name,
            phoneNumber: vendor.phone,
            country: vendor.country,
            city: vendor.city,
            state: vendor.state,
            email: vendor.email,
          },
          fitmentSummary: JSON.stringify(data),
          matchingScore: data.fitment_score,
          preCallQuestion: data.screening_questions,
        };
        if (candidate.documents?.workAuthorization) {
          baseApplicant.documents = {
            workAuthorization: candidate.documents.workAuthorization,
          };
        }
        const addCandidate = await employerModel.updateOne(
          { userId: employerId, "jobs.jobId": jobId },
          {
            $push: {
              "jobs.$.applicants": baseApplicant,
              notifications: {
                name: candidate.name,
                userId: vendorId,
                id: candidate._id,
                jobId,
                JobTitle: JobTitle,
                image: candidate.image,
                resume: candidate.resume,
                currentSalary: candidate.currentSalary,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                type: "Apply Job",
                read: false,
              },
              allApplicants: {
                userId: vendorId,
                jobId,
                name: candidate.name,
                resume: candidate.resume,
                image: candidate.image,
                position: candidate.position,
                jobTitle: candidate.jobTitle,
                currentSalary: candidate.currentSalary,
                city: candidate.city,
                country: candidate.country,
                skills: candidate.skills,
                work_experience: candidate.work_experience,
                experience: candidate.experience,
                education: candidate.Education,
                email: vendor.email,
                phone: candidate.phone_number,
                Experience_level: candidate.Experience_level,
                state: candidate.state,
                appliedTime: moment().format("MMM Do YYYY"),
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                applicationStatus: "pending",
                id: candidate._id,
                isVendorApplicant: true,
              },
            },
          }
        );
        // await vendorModel.updateOne({ userId: vendorId });
        appliedApplicants.push(applicantData);
      }
      if (appliedApplicants.length > 0) {
        await vendorModel.updateOne(
          { userId: vendorId },
          {
            $push: {
              appliedJobs: {
                jobId: job.jobId,
                JobTitle: job.JobTitle,
                JobDescription: job.JobDescription,
                EmailAddress: job.EmailAddress,
                JobType: job.JobType,
                employmentType: job.employmentType,
                Responsibilties: job.Responsibilties || [],
                skill_Experience: job.skill_Experience || [],
                offeredSalary: job.offeredSalary,
                jobSkills: job.jobSkills || [],
                Experience: job.Experience,
                Industry: job.Industry,
                Qualification: job.Qualification,
                ApplicationDeadlineDate: job.ApplicationDeadlineDate,
                Country: job.Country,
                City: job.City,
                State: job.State,
                image: job.image,
                time: moment().format("MMMM D YYYY, h:mm:ss a"),
                status: job.status,
                companyName: job.companyName,
                EmployerId: employerId,
                applicants: appliedApplicants,
              },
            },
          }
        );
      }
      res.status(200).json({
        message: "Job applied by vendor for selected candidate(s)",
        status: true,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Error applying job as vendor",
        status: false,
      });
    }
  },
  async getAppliedJobs(req, res) {
    try {
      const { vendorId } = req.params;

      const vendor = await vendorModel.findOne({ userId: vendorId });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.status(200).json({
        status: true,
        appliedJobs: vendor.appliedJobs || [],
      });
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
      res.status(500).json({ message: "Internal Server Error", status: false });
    }
  },
  async deleteAppliedCandidate(req, res) {
    try {
      const { vendorId, jobId, candidateId } = req.params;

      const result = await vendorModel.updateOne(
        { userId: vendorId, "appliedJobs.jobId": jobId },
        {
          $pull: {
            "appliedJobs.$.applicants": { id: candidateId },
          },
        }
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Candidate not found in job", status: false });
      }

      res.status(200).json({
        status: true,
        message: "Candidate removed from applied job",
      });
    } catch (err) {
      console.error("Error deleting candidate:", err);
      res.status(500).json({ message: "Server Error", status: false });
    }
  },
};
module.exports = controller;

// const application = {
//   jobId,
//   JobTitle,
//   companyName,
//   Industry,
//   offeredSalary,
//   employmentType,
//   jobType,
//   status,
//   city,
//   State,
//   email,
//   region,
//   isVendorApplicant: true,
//   appliedTime: moment().format("MMM Do YYYY"),
//   time: moment().format("MMMM D YYYY, h:mm:ss a"),
//   applicationStatus: "pending",
//   candidateId: candidate._id,
//   name: candidate.name,
//   email: vendor.email,
//   candidateEmail: candidate.email,
//   phone_number: candidate.phone_number,
//   country: candidate.country,
//   city: candidate.city,
//   resume: candidate.resume,
//   experience: candidate.experience,
//   jobTitle: candidate.jobTitle,
//   state: candidate.state,
//   linkedin_url: candidate.linkedin_url,
//   technical_expertise_in_skills:
//     candidate.technical_expertise_in_skills,
//   Experience_level: candidate.Experience_level,
//   skills: candidate.skills,
//   Education: candidate.Education,
//   work_experience: candidate.work_experience,
// };
// Push each application to employer's job and allApplicants
// const employerUpdate = {
//   $push: {
//     "jobs.$.applicants": {
//       $each: allApplications.map((app) => ({ ...app, userId: vendorId })),
//     },
//     allApplicants: {
//       $each: allApplications.map((app) => ({ ...app, userId: vendorId })),
//     },
//   },
// };

// await employerModel.updateOne(
//   { userId: employerId, "jobs.jobId": jobId },
//   employerUpdate
// );

// Push all to vendor.appliedJobs
// const vendorUpdate = {
//   $push: {
//     appliedJobs: {
//       $each: allApplications.map((app) => ({
//         ...app,
//         employerId,
//       })),
//     },
//   },
// };

// await vendorModel.updateOne({ userId: vendorId }, vendorUpdate);

// async vendorRegistrations(req, res) {
//   try {
//     const { email, vendorName, password, state, city, country } = req.body;
//     const findVendor = await vendorModel.find({ email });
//     if (!findVendor) {
//       var salt = await bcrypt.genSaltSync(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
//       const storeVendorDetails = await vendorModel.create({
//         email,
//         vendorName,
//         password: hashedPassword,
//         state,
//         city,
//         country,
//         role: "Vendor",
//       });
//       const accessToken = jwt.sign(
//         { email: email, role: "Vendor" },
//         process.env.SECRET_KEY,
//         { expiresIn: "1d" }
//       );
//       res.status(201).json({
//         message: "Registered Successfully",
//         accessToken,
//         status: true,
//       });
//     } else {
//       res.status(409).json({ message: "User Already Exists", status: false });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error: error,
//       message: "Internal Server Error",
//       status: false,
//     });
//   }
// },
// async vendorLogin(req, res) {
//   try {
//     const { email, password } = req.body;
//     const findVendor = await vendorModel.find({ email });
//     if(findVendor){

//     }else{

//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       error: error,
//       message: "Internal Server Error",
//       status: false,
//     });
//   }
// },
