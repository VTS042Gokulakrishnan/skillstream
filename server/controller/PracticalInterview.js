const { createPdf, createCodingPdf } = require("../services/interviewFeedbackPdf");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const formidablePackage = require("formidable");
const formidable = formidablePackage.formidable || formidablePackage;
const employerModel = require("../models/employerModel");
const candidateModel = require("../models/candidateModel");
const speechFile = path.resolve("./audio/speech.mp3");
const openai = new OpenAI();
const { ObjectId } = require("mongodb");
const cloudinary = require("cloudinary");
const Aws = require("aws-sdk");
const { convert } = require("html-to-text");
const nodemailer = require("nodemailer");
const uniqid = require("uniqid");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { exec } = require("child_process");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});

ffmpeg.setFfmpegPath(ffmpegPath);

const compressVideo = (inputPath, outputPath) => {
  console.log("Compress Started");

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264") // h264 codec
      .size("1280x720") // resize to 720p
      .outputOptions(["-crf 28"]) // compression (lower = higher quality)
      .on("end", () => {
        console.log("Compress Completed");
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.log("compress err", err);
        reject(err);
      })
      .save(outputPath);
  });
};

module.exports = { compressVideo };

async function candidateSendEmail(candidateEmail, jobTitle, region, pdfBytes) {
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
    <title>Interview Completed</title>
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
        <h2 class="header">Interview Completed</h2>
        <p class="content">
            Dear <strong>Candidate</strong>,
        </p>
        <p class="content">
            Thank you for completing the interview for the <strong>${jobTitle}</strong> role. We appreciate the effort you put into completing the interview.
        </p>
        <p class="content">
            Our team is currently reviewing your responses, and we will update you on the next steps as soon as possible. If you have any questions in the meantime, please feel free to reach out.
        </p>
        <p class="content">  We encourage you to review the feedback carefully — it includes insights into your communication, clarity, and skill demonstration, along with improvement suggestions.</p>
        <p class="content">    Keep practicing and refining your interview skills using <strong>Skill Stream AI</strong> to increase your chances of success in real interviews.</p>
        <p class="content"> If you have any questions or need guidance, feel free to reach out to us anytime.</p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>
                   
                    `;

  let mailOptions = {
    from: `SKILLSTREAM  ${
      region === "United States"
        ? "info@skillstreamjobs.us"
        : "support@skillstreamjobs.ca"
    }`,
    to: `${candidateEmail}`,
    subject: `Interview Update - ${jobTitle} Interview`,
    html: html,
    attachments: [
      {
        filename: "Interview_Feedback.pdf",
        content: pdfBytes,
        contentType: "application/pdf",
      },
    ],
  };
  try {
    let info = await mailTransporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    console.log("Interview email sent to candidate");
  } catch (error) {
    console.log("Interview update sending failed", error.message);
    // Email failed, but execution continues
  }
}
// Payment is reserved once at session creation; submission never decrements again.
async function submitPaidPractice(req, res, coding) {
  const cleanup = [];
  try {
    const form = formidable({ multiples: false, keepExtensions: true,
      maxFileSize: 4 * 1024 * 1024 * 1024 });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve({ fields, files }));
    });
    const value = (item) => Array.isArray(item) ? item[0] : item;
    const video = value(coding ? files.video : files.file);
    const pdf = value(files.pdf);
    for (const item of Object.values(files)) {
      for (const file of (Array.isArray(item) ? item : [item])) if (file?.filepath) cleanup.push(file.filepath);
    }
    if (!video || !pdf) return res.status(400).json({ message: "Video and PDF are required", status: false });
    const field = (key) => value(fields[key]);
    let payload;
    try {
      if (coding) {
        payload = { questions: JSON.parse(field("questions")), answers: JSON.parse(field("answers")), outputs: JSON.parse(field("outputs")) };
      } else {
        const questions = JSON.parse(field("question"));
        const answers = JSON.parse(field("answer"));
        payload = { job_description_text: field("job_description_text"),
          messages: questions.flatMap((q, i) => [{ role: "assistant", content: q }, { role: "user", content: answers[i] }]),
          total_interview_time: 1200 };
      }
    } catch (_) { return res.status(400).json({ message: "Invalid interview answers", status: false }); }
    const { data: summary } = await axios.post(
      `${process.env.Video_AI}/${coding ? "evaluate_coding_round" : "analyze_interview"}`, payload,
      { headers: { "Content-Type": "application/json" } });
    const compressedPath = `${video.filepath}_compressed.mp4`;
    cleanup.push(compressedPath);
    await compressVideo(video.filepath, compressedPath);
    const key = `practice/${req.user._id}/${req.practiceSession.id}/${req.practiceLockId}`;
    const [videoData, pdfData] = await Promise.all([
      s3.upload({ Bucket: process.env.AWS_BUCKET_NAME_VIDEOS, Key: `${key}.mp4`,
        Body: fs.createReadStream(compressedPath), ACL: "public-read", ContentType: "video/mp4" }).promise(),
      s3.upload({ Bucket: process.env.AWS_BUCKET_NAME_VIDEOS, Key: `transcriptions/${key}.pdf`,
        Body: fs.createReadStream(pdf.filepath), ACL: "public-read", ContentType: "application/pdf" }).promise(),
    ]);
    await require("../services/practiceSessions").complete(req.user._id, req.practiceSession, req.practiceLockId, {
      video: videoData.Location, transcribe: pdfData.Location, Date: new Date(),
      videoId: req.practiceSession.id, jobTitle: field("jobTitle"), reportStatus: "processing",
    });
    res.status(201).json({ message: "Interview submitted for review", status: true, videoData, pdfData });
    // Report generation remains after the existing submission acknowledgement.
    let pdfBytes;
    try {
      const normalizedSummary = typeof summary === "string" ? JSON.parse(summary) : summary;
      pdfBytes = await (coding ? createCodingPdf(normalizedSummary, payload.questions) : createPdf(normalizedSummary));
      const reportData = await s3.upload({ Bucket: process.env.AWS_BUCKET_NAME_VIDEOS,
        Key: `feedback/${key}.pdf`, Body: Buffer.from(pdfBytes), ACL: "public-read", ContentType: "application/pdf" }).promise();
      const collection = coding ? "codingPracticeInterview" : "practiceInterview";
      await candidateModel.updateOne({ _id: req.user._id, [`${collection}.videoId`]: req.practiceSession.id }, {
        $set: { [`${collection}.$.feedbackReport`]: reportData.Location, [`${collection}.$.reportStatus`]: "ready" },
      });
    } catch (error) {
      console.error("Practice feedback report failed:", error.message);
      const collection = coding ? "codingPracticeInterview" : "practiceInterview";
      await candidateModel.updateOne({ _id: req.user._id, [collection]: { $elemMatch: { videoId: req.practiceSession.id, reportStatus: "processing" } } }, {
        $set: { [`${collection}.$.reportStatus`]: "failed" },
      }).catch((saveError) => console.error("Practice report status failed:", saveError.message));
    }
    // A storage failure must not prevent delivery of an already generated attachment.
    if (pdfBytes) await candidateSendEmail(req.user.email, field("jobTitle"), req.user.region, pdfBytes)
      .catch((error) => console.error("Practice feedback email failed:", error.message));
  } catch (error) {
    console.error("Practice submission failed:", error.message);
    if (!res.headersSent) res.status(500).json({ message: "Submission failed. Please retry; no additional credit will be charged.", status: false });
  } finally {
    await Promise.all(cleanup.map((file) => fs.promises.unlink(file).catch(() => {})));
  }
}

const controller = {
  async resumeJobText(req, res) {
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
      });

      await form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing the form:", err);
          return res
            .status(500)
            .json({ message: "Error parsing form data", status: false });
        }

        // Formidable v3 returns arrays even for single-value form inputs.
        fields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
        files = Object.fromEntries(Object.entries(files).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
        const { jobTitle, jobDescription } = fields;
        const fileField = fields.file; // if frontend sends string url

        // ✅ CASE 1: Resume is a URL string (no upload)
        if (
          fileField &&
          typeof fileField === "string" &&
          fileField.trim().startsWith("https")
        ) {
          try {
            const formData = {
              resume: fileField.trim(),
              job_description_text: convert(jobDescription),
              instructions: [],
            };
            console.log(formData);

            const response = await axios.post(
              `${process.env.Video_AI}/upload`,
              JSON.stringify(formData),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            return res.status(200).json({
              job_description_text: response.data.job_description_text,
              resume_text: response.data.resume_text,
              jobTitle: jobTitle,
              status: true,
            });
          } catch (error) {
            console.error("Error processing resume URL:", error);
            return res
              .status(500)
              .json({ message: "Error processing resume URL", status: false });
          }
        } else {
          // ✅ CASE 2: Resume file uploaded
          if (!files.file) {
            return res
              .status(400)
              .json({ message: "Resume file or URL missing", status: false });
          }

          const fileStream = fs.createReadStream(files.file.filepath);
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
            Key: files.file.originalFilename,
            Body: fileStream,
            ACL: "public-read-write",
            ContentType: "application/pdf",
          };

          s3.upload(params, async (error, data) => {
            if (error) {
              console.error("S3 Upload Error:", error);
              return res.status(500).json({ err: error, status: false });
            }

            try {
              const formData = {
                resume: data.Location,
                job_description_text: jobDescription,
                instructions: [],
              };
              console.log(formData);

              const response = await axios.post(
                `${process.env.Video_AI}/upload`,
                JSON.stringify(formData),
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              return res.status(200).json({
                job_description_text: response.data.job_description_text,
                resume_text: response.data.resume_text,
                jobTitle: jobTitle,
                status: true,
              });
            } catch (error) {
              console.error("Error sending data to AI API:", error);
              return res.status(500).json({
                message: "Error sending data to AI API",
                status: false,
              });
            }
          });
        }
      });
    } catch (error) {
      console.error("Unexpected Error:", error);
      return res.status(500).json({ error: error.message, status: false });
    }
  },
  async introText(req, res) {
    try {
      const { resume_text, job_description_text, instructions } = req.body;
      let formData = {
        resume_text,
        job_description_text,
        instructions,
      };
      console.log(formData);
      const { data } = await axios.post(
        `${process.env.Video_AI}/start_interview`,
        formData
      );
      console.log(data);
      res.status(200).json({
        initial_intro: data.initial_intro,
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async generateQuestions(req, res) {
    try {
      const {
        resume_text,
        job_description_text,
        question_count,
        question,
        answer,
        instructions,
        coding_questions,
      } = req.body;
      const format = question
        .map((e, idx) => {
          return [
            { role: "assistant", content: e },
            { role: "user", content: answer[idx] },
          ];
        })
        .flat();
      let formData = {
        resume_text,
        job_description_text,
        messages: format,
        instructions,
        question_count,
        coding_questions,
      };
      console.log(formData);

      const { data } = await axios.post(
        `${process.env.Video_AI}/ask_question`,
        formData
      );
      console.log(data);
      res.status(200).json({
        data: data,
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async analyseInterview(req, res) {
    try {
      const {
        resume_text,
        job_description_text,
        question,
        answer,
        email,
        jobTitle,
        userId,
        region,
      } = req.body;
      let formData = {
        resume_text,
        job_description_text,
        messages: question
          .map((e, idx) => {
            return [
              { role: "assistant", content: e },
              { role: "user", content: answer[idx] },
            ];
          })
          .flat(),
        total_interview_time: 1200,
      };

      console.log(formData);

      const { data } = await axios.post(
        `${process.env.Video_AI}/analyze_interview`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // const updateInterview = await candidateModel.updateOne(
      //   { userId: userId },
      //   { $inc: { practiceInterviewCount: -1 } }
      // );
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
      let mailOptions = {
        from: `SKILLSTREAM  ${
          region === "United States"
            ? "info@skillstreamjobs.us"
            : "support@skillstreamjobs.ca"
        }`,
        to: email,
        subject: `Practice Interview FeedBack - ${jobTitle}`,
        text: data.analysis,
      };

      // Send email
      if (email) {
        mailTransporter
          .sendMail(mailOptions)
          .then((info) => {
            console.log(info);
            console.log(data.analysis);
            res.status(200).json({
              analysis: data.analysis,
              status: true,
            });
          })
          .catch((err) => {
            console.log("Error in sending the mail for contact us form", err);
            res.status(400).json({ err });
          });
      } else {
        res.status(200).json({
          analysis: data.analysis,
          status: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async updateInterviewDetails(req, res) {
    return submitPaidPractice(req, res, false);
  },
  async getPracticalInterview(req, res) {
    try {
      const { userId } = req.params;
      const getInterview = await candidateModel.findOne({ userId });
      if (getInterview) {
        res.status(200).json({
          practiceInterview: getInterview.practiceInterview,
          practiceInterviewCount: getInterview.practiceInterviewCount,
          status: true,
        });
      } else {
        res.status(404).json({ message: "User not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deletePracticalInterview(req, res) {
    try {
      const { userId, videoId } = req.params;
      console.log(req.params);

      // const candidateObjectId = new ObjectId(candidateId);
      const deleteshortlisted = await candidateModel.updateOne(
        { userId },
        {
          $pull: {
            practiceInterview: { videoId: videoId },
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
  async codingResumeJobText(req, res) {
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
      });

      await form.parse(req, async (err, fields, files) => {
        if (!files.file) {
          return res
            .status(400)
            .json({ message: "Video or PDF file is missing", status: false });
        } else if (err) {
          console.error("Error parsing the file:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
        } else {
          const fileStream = fs.createReadStream(files.file.filepath);
          const { jobTitle, jobDescription } = fields;
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
            Key: files.file.originalFilename, // Name of the image
            Body: fileStream, // Body which will contain the image in buffer format
            ACL: "public-read-write", // defining the permissions to get the public link
            ContentType: "application/pdf", // Necessary to define the image content-type to view the photo in the browser with the link
          };
          s3.upload(params, async (error, data) => {
            if (error) {
              console.log(error);
              res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
            } else {
              // console.log(data);

              let formData = {
                resume: data.Location,
                job_description_text: jobDescription,
              };

              const response = await axios.post(
                `${process.env.Video_AI}/upload`,
                JSON.stringify(formData),
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              // console.log(data);
              res.status(200).json({
                job_description_text: response.data.job_description_text,
                resume_text: response.data.resume_text,
                jobTitle: jobTitle,
                status: true,
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
  async getCodingPracticalInterview(req, res) {
    try {
      const { userId } = req.params;
      const getInterview = await candidateModel.findOne({ userId });
      if (getInterview) {
        res.status(200).json({
          practiceInterview: getInterview.codingPracticeInterview,
          practiceInterviewCount: getInterview.codingPracticeInterviewCount,
          status: true,
        });
      } else {
        res.status(404).json({ message: "User not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deleteCodingPracticalInterview(req, res) {
    console.log("deleting");
    try {
      const { userId, videoId } = req.params;
      console.log(req.params);

      // const candidateObjectId = new ObjectId(candidateId);
      const deleteshortlisted = await candidateModel.updateOne(
        { userId },
        {
          $pull: {
            codingPracticeInterview: { videoId: videoId },
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
  async codingGenerateQuestions(req, res) {
    try {
      const { resume_text, job_description_text, level } = req.body;
      const payload = {
        resume_text,
        job_description_text,
        level,
        instructions: [],
      };
      console.log(req.body);

      const { data } = await axios.post(
        `${process.env.Video_AI}/ask_coding_questions`,
        payload
      );
      console.log(data);
      res.status(200).json({ data, status: "success" });
    } catch (error) {
      console.error("Error in generating the question", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", status: "error" });
    }
  },
  // codingPracticeInterview
  async codingAnalyseInterview(req, res) {
    return submitPaidPractice(req, res, true);
  },
};
module.exports = controller;
// const { userId, jobId, candidateId } = req.body;
// const candidateObjectId = new ObjectId(candidateId);

// const result = await employerModel.aggregate([
//   { $match: { userId: userId } }, // Match document by userId
//   { $unwind: "$jobs" }, // Unwind the job array
//   { $match: { "jobs.jobId": jobId } }, // Match the specific jobid
//   { $unwind: "$jobs.applicants" }, // Unwind the applicants array
//   { $match: { "jobs.applicants.id": candidateObjectId } }, // Match the specific applicantId
//   {
//     $project: {
//       jobDescription: "$jobs.JobDescription", // Project job description
//       resume: "$jobs.applicants.resume",
//       email: "$jobs.EmailAddress",
//       candidateEmail: "$jobs.applicants.email",
//       interviewStatus: "$jobs.applicants.interviewStatus",
//       expires_in: "$jobs.applicants.interviewViewLinkExpiresin",
//       jobTitle: "$jobs.JobTitle",
//       instructions: "$jobs.applicants.instructions", // Project applicant ID (adjust this if you need more details)
//     },
//   },
// ]);
// let formData = {
//   resume: result[0].resume,
//   job_description_text: convert(result[0].jobDescription),
//   instructions: result[0].instructions ? result[0].instructions : [],
// };
// console.log(result);

// const { data } = await axios.post(
//   `${process.env.Video_AI}/upload`,
//   JSON.stringify(formData),
//   {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   }
// );
// // console.log(data);
// res.status(200).json({
//   job_description_text: data.job_description_text,
//   resume_text: data.resume_text,
//   instructions: data.instructions,
//   interviewStatus: result[0].interviewStatus,
//   expires_in: result[0].expires_in
//     ? result[0].expires_in
//     : new Date(new Date().setDate(new Date().getDate() - 1)),
//   email: result[0].email,
//   jobTitle: result[0].jobTitle,
//   candidateEmail: result[0].candidateEmail,
//   status: true,
// });
