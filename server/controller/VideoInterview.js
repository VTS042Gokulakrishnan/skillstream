const axios = require("axios");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const formidable = require("formidable");
const employerModel = require("../models/employerModel");
const mongoose = require("mongoose");
const speechFile = path.resolve("./audio/speech.mp3");
const openai = new OpenAI();
const { ObjectId } = require("mongodb");
const cloudinary = require("cloudinary");
const Aws = require("aws-sdk");
const { convert } = require("html-to-text");
const nodemailer = require("nodemailer");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { exec } = require("child_process");
const { tryCatch } = require("bullmq");

const videoInterviewQuestionSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, index: true },
    jobId: { type: String, index: true },
    jobTitle: String,
    resumeText: String,
    jobDescriptionText: String,
    employerId: { type: String, index: true },
    questions: [String],
    answers: [String],
    messages: [
      {
        role: String,
        content: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "videointerview_questions",
  },
);

const videoInterviewQuestionModel =
  mongoose.models.videointerview_questions ||
  mongoose.model("videointerview_questions", videoInterviewQuestionSchema);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// const uploadDir = "/data/upload";

// // 🔹 Ensure the folder exists every time the service starts
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }
const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});

ffmpeg.setFfmpegPath(ffmpegPath);
const deleteFileSafe = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code !== "ENOENT") {
        console.error("❌ Delete failed:", filePath, err);
      } else {
        console.log("⚠ File already deleted:", filePath);
      }
    } else {
      console.log("🗑️ Deleted:", filePath);
    }
  });
};

async function translateToEnglish(text) {
  if (!text || !text.trim()) return { translated: text, detectedLanguage: null };

  const nonAsciiRatio =
    (text.match(/[^\x00-\x7F]/g) || []).length / text.length;

  // Already mostly English — skip API call
  if (nonAsciiRatio < 0.1) return { translated: text, detectedLanguage: null };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a translator. Your job is to:\n" +
            "1. Detect the language of the given text.\n" +
            "2. Translate it to English.\n" +
            "Respond ONLY in this exact JSON format, no extra text:\n" +
            '{"detectedLanguage": "Hindi", "translatedText": "translated text here"}',
        },
        { role: "user", content: text },
      ],
      max_tokens: 600,
      temperature: 0,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";

    try {
      const parsed = JSON.parse(raw);
      return {
        translated: parsed.translatedText || text,
        detectedLanguage: parsed.detectedLanguage || null,
      };
    } catch (parseErr) {
      // If JSON parsing fails, return raw text without language label
      console.error("Translation JSON parse failed:", parseErr.message);
      return { translated: raw || text, detectedLanguage: null };
    }
  } catch (error) {
    console.error("Translation failed, using original:", error.message);
    return { translated: text, detectedLanguage: null };
  }
}

function safeText(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFC")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}
// const compressVideo = (inputPath, outputPath) => {
//   console.log("Compress Started");

//   return new Promise((resolve, reject) => {
//     ffmpeg(inputPath)
//       .videoCodec("libx264") // h264 codec
//       .size("1280x720") // resize to 720p
//       .outputOptions(["-crf 28"]) // compression (lower = higher quality)
//       .on("end", () => {
//         console.log("Compress Completed");
//         resolve(outputPath);
//       })
//       .on("error", (err) => {
//         console.log("compress err", err);
//         reject(err);
//       })
//       .save(outputPath);
//   });
// };
const compressVideo = (inputPath, outputPath) => {
  console.log("Compression started for:", inputPath);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size("1280x720") // 720p is good balance
      .outputOptions([
        "-preset ultrafast", // ⚡ fastest CPU preset
        "-crf 30", // higher = more compression (26–30 range works well)
        "-movflags +faststart", // web-streaming friendly
      ])
      // .on("progress", (progress) => {
      //   if (progress.percent)
      //     console.log(`Compression progress: ${progress.percent.toFixed(2)}%`);
      // })
      .on("end", () => {
        console.log("Compression completed:", outputPath);
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("Compression failed:", err);
        reject(err);
      })
      .save(outputPath);
  });
};

module.exports = { compressVideo };

const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Language configuration
const languageConfig = {
  javascript: {
    file: "Main.js",
    image: "node:18",
    run: (file) => `node ${file}`,
  },
  python: {
    file: "Main.py",
    image: "python:3.10",
    run: (file) => `python ${file}`,
  },
  cpp: {
    file: "Main.cpp",
    image: "gcc:12",
    run: (file) => `sh -c "g++ ${file} -o main && ./main"`,
  },
  java: {
    file: "Main.java",
    image: "openjdk:17",
    run: (file) => `sh -c "javac ${file} && java Main"`,
  },
};

async function candidateSendEmail(
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
  region,
  email,
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
            Dear <strong>${candidateName}</strong>,
        </p>
        <p class="content">
            Thank you for completing the interview for the <strong>${jobTitle}</strong> role. We appreciate the time and effort you invested in the process.
        </p>
        <p class="content">
            Our team is currently reviewing your responses, and we will update you on the next steps as soon as possible. If you have any questions in the meantime, please feel free to reach out.
        </p>
        <p class="content">
            We appreciate your interest in joining <strong>${companyName}</strong> and wish you the best of luck!
        </p>
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
    replyTo: email,
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
async function EmployerSendEmail(
  candidateEmail,
  videoData,
  jobTitle,
  region,
  email,
  pdfBytes,
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
    <title>Candidate Interview Completion</title>
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
            width: 150px;
            margin: 0 auto 15px;
            display: block;
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
        <h2 class="header">Candidate Interview Completed</h2>
        <p class="content">
            We’re pleased to inform you that the candidate with the email address <strong>${candidateEmail}</strong> has successfully completed all required steps for the <strong>${jobTitle}</strong> position.
        </p>
        <div class="button-container">
            <a href="${videoData.Location}" class="button" style="color: #ffffff !important;">View Video Results</a>
        </div>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
    </div>
</body>
</html>

                        `;

  let details = {
    from: `SKILLSTREAM  ${
      region === "United States"
        ? "info@skillstreamjobs.us"
        : "support@skillstreamjobs.ca"
    }`,
    to: `${email}`,
    subject: `Interview Update - ${jobTitle} Interview`,
    html: html,
    replyTo: candidateEmail,
    attachments: [
      {
        filename: "Interview_Feedback.pdf",
        content: pdfBytes,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    let info = await mailTransporter.sendMail(details);
    console.log("Email sent:", info.response);
    console.log("Interview email sent to employer");
  } catch (error) {
    console.log("Interview update sending failed", error.message);
    // Email failed, but execution continues
  }
}

function wrapText(text, font, fontSize, maxWidth) {
  if (!text) return [""];

  const words = safeText(text).split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
   let textWidth;
    try {
      textWidth = font.widthOfTextAtSize(testLine, fontSize);
    } catch (e) {
      textWidth = font.widthOfTextAtSize(testLine.replace(/[^\x20-\x7E]/g, "?"), fontSize);
    }

    if (textWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

function drawWrappedText({
  pdfDoc,
  page,
  text,
  x,
  y,
  font,
  fontSize,
  maxWidth,
  lineHeight,
  margin,
  pageWidth,
  pageHeight,
  color = rgb(0, 0, 0),
}) {
  const wrappedLines = wrapText(text, font, fontSize, maxWidth);

  for (const line of wrappedLines) {
    if (y - lineHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    try {
      page.drawText(safeText(line), {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
    } catch (e) {
      page.drawText(line.replace(/[^\x20-\x7E]/g, "?"), {
        x,
        y,
        size: fontSize,
        font,
        color,
      });
    }

    y -= lineHeight;
  }

  return { page, y };
}

async function createPdf(summary) {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 11;
    const titleFontSize = 16;
    const headingFontSize = 13;
    const textColor = rgb(0, 0, 0);
    const lineHeight = 17;

    const pageWidth = 600;
    const pageHeight = 700;
    const margin = 50;
    const maxWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addLine = (text, options = {}) => {
      const selectedFont = options.bold ? boldFont : font;
      const selectedSize = options.size || fontSize;

      const result = drawWrappedText({
        pdfDoc,
        page,
        text,
        x: margin,
        y,
        font: selectedFont,
        fontSize: selectedSize,
        maxWidth,
        lineHeight: options.lineHeight || lineHeight,
        margin,
        pageWidth,
        pageHeight,
        color: textColor,
      });

      page = result.page;
      y = result.y;

      if (options.spacing) {
        y -= options.spacing;
      }
    };

    addLine("Interview Result Summary", {
      bold: true,
      size: titleFontSize,
      spacing: 12,
    });

    addLine(`Score: ${summary?.analysis?.score ?? "N/A"}`, {
      bold: true,
    });

    addLine(
      `Next Round Eligibility: ${
        summary?.analysis?.next_round_eligibility ?? "N/A"
      }`,
      {
        bold: true,
        spacing: 6,
      },
    );

    addLine(`Focus Category: ${summary?.focus_category ?? "N/A"}`);
    addLine(`Camera Summary: ${summary?.camera_summary ?? "N/A"}`);
    addLine(`Gadget Summary: ${summary?.gadget_summary ?? "N/A"}`, {
      spacing: 10,
    });

    addLine("Question Feedback", {
      bold: true,
      size: headingFontSize,
      spacing: 6,
    });

    const filteredQuestions = Object.entries(
      summary?.analysis?.per_question_feedback || {},
    ).filter(([, value]) => !value.skipped && value.question);

    for (const [, value] of filteredQuestions) {
      addLine(`Q: ${value.question ?? "N/A"}`, {
        bold: true,
        spacing: 4,
      });

      addLine(`Summary: ${value.answer_summary ?? "N/A"}`, {
        spacing: 4,
      });

      if (value.strengths && value.strengths.length > 0) {
        addLine(`Strengths: ${value.strengths.join(", ")}`, {
          spacing: 4,
        });
      }

      if (
        value.areas_for_improvement &&
        value.areas_for_improvement.length > 0
      ) {
        addLine(
          `Areas for Improvement: ${value.areas_for_improvement.join(", ")}`,
          {
            spacing: 4,
          },
        );
      }

      if (value.evidence && value.evidence.length > 0) {
        addLine(`Evidence: ${value.evidence.join(" | ")}`, {
          spacing: 8,
        });
      }
    }

    addLine(
      `Communication Clarity: ${
        summary?.analysis?.communication_clarity ?? "N/A"
      }`,
      {
        bold: true,
        spacing: 4,
      },
    );

    return await pdfDoc.save();
  } catch (error) {
    console.error("Error creating result summary PDF:", error);
    throw new Error("Result summary PDF generation failed.");
  }
}
async function createCodingPdf(summary) {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);
    const lineHeight = 20;
    const pageWidth = 600;
    const pageHeight = 700;
    const margin = 50;
    const maxWidth = pageWidth - 2 * margin;

    // -----------------------------
    // REMOVE NEWLINES (IMPORTANT!)
    // -----------------------------
    function cleanText(str) {
       return String(str || "")
        .replace(/\r?\n|\r/g, " ") // remove newline characters
        .replace(/\s+/g, " ") // collapse spaces
        .trim();
    }

    // -----------------------------
    // TEXT WRAPPER
    // -----------------------------
    function wrapText(text) {
      text = cleanText(text);

      const words = text.split(" ");
      const lines = [];
      let currentLine = "";

      for (let word of words) {
        const testLine = currentLine + word + " ";
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        }
      }

      if (currentLine.trim() !== "") {
        lines.push(currentLine.trim());
      }

      return lines;
    }

    // -----------------------------
    // BUILD PDF TEXT LINES
    // -----------------------------
    let lines = [];

    // ===== Overall Evaluation =====
    lines.push(`Total Score: ${summary.evaluation.total_score}`);
    lines.push(
      ...wrapText(
        `Final Feedback: ${cleanText(summary.evaluation.final_feedback)}`,
      ),
    );
    lines.push(`Decision: ${summary.evaluation.decision}`);
    lines.push("");

    // ===== Per-Question Details =====
    for (const q of summary.evaluation.per_question) {
      lines.push(`Q${q.id}:`);
      lines.push(...wrapText(q.question));
      lines.push(`Score: ${q.score}`);
      lines.push(...wrapText(`Feedback: ${q.feedback}`));
      lines.push("");
    }

    // -----------------------------
    // PAGE RENDERING
    // -----------------------------
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (let line of lines) {
      if (y - lineHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      try {
        page.drawText(line, {
          x: margin,
          y: y,
          size: fontSize,
          font,
          color: textColor,
        });
      } catch (error) {
        page.drawText(line.replace(/[^\x20-\x7e]/g, "?"), {
          x: margin,
          y: y,
          size: fontSize,
          font,
          color: textColor,
        });
      }

      y -= lineHeight;
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw new Error("PDF generation failed.");
  }
}

async function createQAPdf(messages) {
  try {
    const pdfDoc = await PDFDocument.create();
     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 11;
    const titleFontSize = 16;
    const textColor = rgb(0, 0, 0);
    const lineHeight = 17;

    const pageWidth = 600;
    const pageHeight = 700;
    const margin = 50;
    const maxWidth = pageWidth - 2 * margin;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    const addLine = (text, options = {}) => {
      const selectedFont = options.bold ? boldFont : font;
      const selectedSize = options.size || fontSize;

      const result = drawWrappedText({
        pdfDoc,
        page,
        text,
        x: margin,
        y,
        font: selectedFont,
        fontSize: selectedSize,
        maxWidth,
        lineHeight: options.lineHeight || lineHeight,
        margin,
        pageWidth,
        pageHeight,
        color: textColor,
      });

      page = result.page;
      y = result.y;

      if (options.spacing) {
        y -= options.spacing;
      }
    };

    addLine("Interview Questions and Answers", {
      bold: true,
      size: titleFontSize,
      spacing: 14,
    });

   const qaPairs = [];

    for (let i = 0; i < messages.length; i++) {
      const current = messages[i];
      const next = messages[i + 1];

      if (
        current?.role === "assistant" &&
        next?.role === "user" &&
        current?.content &&
        next?.content
      ) {
        qaPairs.push({
          question: current.content,
          answer: next.content,
        });

        i++;
      }
    }

    // Translate all answers to English in parallel (handles Tamil, Telugu, Hindi, etc.)
    const translatedPairs = await Promise.all(
      qaPairs.map(async (pair) => {
        const result = await translateToEnglish(pair.answer);
        return {
          question: pair.question,
          answer: result.translated,
          detectedLanguage: result.detectedLanguage,
        };
      })
    );


    translatedPairs.forEach((pair, index) => {
      addLine(`${index + 1}. ${pair.question}`, {
        bold: true,
        spacing: 6,
      });

      // Show translation note if language was detected
      if (pair.detectedLanguage) {
        addLine(`[Translated from ${pair.detectedLanguage}]`, {
          spacing: 2,
          // italic look — slightly smaller size
          size: 9,
        });
      }

      addLine(`Answer: ${pair.answer}`, {
        spacing: 14,
      });
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error("Error creating Q&A PDF:", error);
    throw new Error("Q&A PDF generation failed.");
  }
}

// ─── liveStatus helper ───────────────────────────────────────────────────────
async function pushLiveStatusRaw(
  employerModel,
  baseQuery,
  jobId,
  candidateObjectId,
  status,
  extraSetFields = {}
) {
  return employerModel.updateOne(
    baseQuery,
    {
      $set: {
        "jobs.$[job].applicants.$[applicant].interviewStatus": status,
        ...extraSetFields,
      },
      $push: {
        "jobs.$[job].applicants.$[applicant].interviewLiveStatus": {
          status,
          time: new Date(),
        },
      },
    },
    {
      arrayFilters: [
        { "job.jobId": jobId },
        { "applicant.id": candidateObjectId },
      ],
      new: true,
    }
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const controller = {
  async resumeJobText(req, res) {
    try {
      const { userId, jobId, candidateId } = req.body;
      const candidateObjectId = new ObjectId(candidateId);

      const result = await employerModel.aggregate([
        { $match: { userId: userId } }, // Match document by userId
        { $unwind: "$jobs" }, // Unwind the job array
        { $match: { "jobs.jobId": jobId } }, // Match the specific jobid
        { $unwind: "$jobs.applicants" }, // Unwind the applicants array
        { $match: { "jobs.applicants.id": candidateObjectId } }, // Match the specific applicantId
        {
          $project: {
            jobDescription: "$jobs.JobDescription", // Project job description
            resume: "$jobs.applicants.resume",
            email: "$jobs.EmailAddress",
            candidateEmail: "$jobs.applicants.email",
            candidateName: "$jobs.applicants.name",
            interviewStatus: "$jobs.applicants.interviewStatus",
            companyName: "$jobs.companyName",
            expires_in: "$jobs.applicants.interviewViewLinkExpiresin",
            jobTitle: "$jobs.JobTitle",
            instructions: "$jobs.applicants.instructions",
            isCodingRound: {
              $ifNull: ["$jobs.applicants.isCodingRound", false],
            }, // Project applicant ID (adjust this if you need more details)
          },
        },
      ]);
      let formData = {
        resume: result[0].resume,
        job_description_text: convert(result[0].jobDescription),
        instructions: result[0].instructions ? result[0].instructions : [],
      };
      console.log(result);

      const { data } = await axios.post(
        `${process.env.Video_AI}/upload`,
        JSON.stringify(formData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(result[0].isCodingRound);
      res.status(200).json({
        job_description_text: data.job_description_text,
        resume_text: data.resume_text,
        instructions: data.instructions,
        interviewStatus: result[0].interviewStatus,
        expires_in: result[0].expires_in
          ? result[0].expires_in
          : new Date(new Date().setDate(new Date().getDate() - 1)),
        email: result[0].email,
        jobTitle: result[0].jobTitle,
        candidateEmail: result[0].candidateEmail,
        companyName: result[0].companyName,
        candidateName: result[0].candidateName,
        coding: result[0].isCodingRound,
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
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
      const { data } = await axios.post(
        `${process.env.Video_AI}/start_interview`,
        formData,
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
      // console.log(formData);

      const { data } = await axios.post(
        `${process.env.Video_AI}/ask_question`,
        formData,
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
      const { resume_text, job_description_text, question, answer } = req.body;
      let formData = {
        // resume_text,
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

      console.log(formData.messages);
      console.log(formData.job_description_text);

      const { data } = await axios.post(
        `${process.env.Video_AI}/analyze_interview`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(data);
      console.log(typeof data);

      res.status(200).json({
        analysis: data,
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async audioTranscription(req, res) {
    console.log("hi");

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
          const audioFile = files.file;

          const fileStream = fs.createReadStream(files.file.filepath);
          // const fileStream = fs.createReadStream("./audio/speech.mp3");

          // console.log();
          // const formData = new FormData();
          // formData.append("file", fileStream);
          // formData.append("model", "whisper-1");
          const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-1",
          });
          console.log(transcription.text);

          res.json({ text: transcription.text });
        }
      });
      // const audioFile = req.files.file; // Assuming you're using a middleware to handle file uploads
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  },
  async textToSpeech(req, res) {
    const { text } = req.body;

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: "Today is a wonderful day to build something people love!",
      });
      console.log(speechFile);

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);
      res.set("Content-Type", "audio/mpeg");
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to synthesize speech" });
    }
  },

  async sendInterviewMail(req, res) {
    console.log("Sent interview mail");

    try {
      const {
        from,
        to,
        JobTitle,
        candidateName,
        companyName,
        instructions,
        isCodingRound,
        // interviewType,
        region,
      } = req.body;
      // console.log(req.body);
      const { jobId, userId, candidateId } = req.params;
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
              // timeout: 60000, // 10 seconds connection timeout
              // socketTimeout: 60000, // 30 seconds total send timeout
            })
          : nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "support@skillstreamjobs.ca",
                pass: "yzsz ockc eiql oyqj",
              },
              // timeout: 60000, // 10 seconds connection timeout
              // socketTimeout: 60000, // 30 seconds total send timeout
            });

      console.log(req.body);
      let domain = "";
      if (region === "Canada") {
        domain = "https://skillstreamjobs.ca";
      } else if (region === "United States") {
        domain = process.env.USWEBSITE;
      } else if (region === "India") {
        domain = "https://www.skillstreamlabs.com";
      }
      const interviewLink = `${domain}/videoAssessment/${userId}/${candidateId}/${jobId}`;
      //   HTML for the email
      const html = `
      <!DOCTYPE html>
<html>
<head>
    <title>Interview Invitation</title>
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
        ol {
            text-align: left;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
        <h2 class="header">Interview Invitation</h2>
        <p class="content">
            Hi <strong>${candidateName}</strong>,
        </p>
        <p class="content">
            Congratulations! You have been selected for the interview round for the role of <strong>${JobTitle}</strong> at <strong>${companyName}</strong>.
        </p>
        <p class="content">
            Please click the button below to start your interview:
        </p>
        <div class="button-container">
            <a href="${interviewLink}" class="button" style="color: #ffffff !important;" target="_blank">Start Interview</a>
        </div>
        <h3 class="content">Instructions:</h3>
        <ol class="content">
            <li>Ensure your webcam and microphone are working properly.</li>
            <li>Enable screen recording permissions when prompted.</li>
            <li>Click "Next Question" for each question and answer thoroughly.</li>
            <li>The recording will capture both video and audio, so choose a quiet, well-lit environment.</li>
            <li>Wait for your answers to submit at the end. The system will redirect you automatically.</li>
            <li>Do not click "Stop Sharing" during the interview.</li>
        </ol>
        <p class="content">Best of luck!</p>
        <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
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
        to: to,
        subject: `Interview Invitation for ${JobTitle}`,
        text: "Contact Us Form Response",
        html: html,
        replyTo: from,

        //   html: html,
      };

      // sending the mail for registeration
      mailTransporter
        .sendMail(details)
        .then(async (info) => {
          const candidateObjectId = new ObjectId(candidateId);
          const expires_in = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const addDetails = await employerModel.updateOne(
            {
              userId: userId,
              "jobs.jobId": jobId,
              "jobs.applicants.id": candidateObjectId,
            },
            {
              $set: {
                "jobs.$[job].applicants.$[applicant].interviewStatus": "Sent",
                "jobs.$[job].applicants.$[applicant].instructions":
                  instructions,
                "jobs.$[job].applicants.$[applicant].isCodingRound":
                  isCodingRound,
                "jobs.$[job].applicants.$[applicant].interviewViewLinkExpiresin":
                  expires_in,
              },
            },
            {
              arrayFilters: [
                { "job.jobId": jobId },
                { "applicant.id": candidateObjectId },
              ],
              new: true,
            },
          );
          await employerModel.updateOne(
            {
              userId: userId,
              "jobs.jobId": jobId,
              "jobs.applicants.id": candidateObjectId,
            },
            {
              $push: {
                "jobs.$[job].applicants.$[applicant].interviewLiveStatus": {
                  status: "Interview Mail Sent",
                  time: new Date(),
                },
              },
            },
            {
              arrayFilters: [
                { "job.jobId": jobId },
                { "applicant.id": candidateObjectId },
              ],
            },
          );
          res.status(200).json({
            message: "Interview Inviatetion Sent",
            status: true,
          });
        })
        .catch((err) => {
          console.log("Error in sending the mail for contact us form", err);
          res.status(400).json({ err });
        });
      // res.send("hi");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error, status: false });
    }
  },
  async USsendInterviewMail(req, res) {
    // console.log("Sent interview mail");

    try {
      const {
        from,
        to,
        JobTitle,
        candidateName,
        companyName,
        instructions,
        region,
      } = req.body;
      const { jobId, userId, candidateId } = req.params;
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
      console.log(req.body);

      const interviewLink = `${process.env.USWEBSITE}/videoAssessment/${userId}/${candidateId}/${jobId}`;
      //   HTML for the email
      const html = `
      <p>Hi ${candidateName},</p>
      <p>Congratulations! You have been selected for the interview round for the role of <strong>${JobTitle}</strong> at <strong>${companyName}</strong>.</p>
      <p>Please click on the link below to start your interview:</p>
      <p><a href="${interviewLink}" target="_blank">Interview Link</a></p>
      
      <h3>Instructions:</h3>
      <ol>
          <li>Ensure your webcam and microphone are working properly.</li>
          <li>Make sure your screen recording permissions are enabled. You will be prompted to allow screen recording at the beginning of the interview. Please choose the entire window to capture correctly.</li>
          <li>You will have a "Next Question" button for each question. Please answer each question thoroughly at your own pace.</li>
          <li>The recording will capture both video and audio. Ensure your environment is quiet and well-lit.</li>
          <li>At the end of the interview, please wait for your answers to be submitted. The recording will automatically stop and redirect you to the feedback page.</li>
          <li>Please do not click the "Stop Sharing" button during the interview.</li>
      </ol>
  
      <p>Best of luck!</p>
      <p>Best regards,</p>
      <p>SkillStream</p>
  `;

      //   email details
      let details = {
        from: `SKILLSTREAM  ${
          region === "United States"
            ? "info@skillstreamjobs.us"
            : "support@skillstreamjobs.ca"
        }`,
        to: to,
        subject: `Interview Invitation for ${JobTitle}`,
        text: "Contact Us Form Response",
        html: html,
        replyTo: from,
        //   html: html,
      };

      // sending the mail for registeration
      mailTransporter
        .sendMail(details)
        .then(async (info) => {
          const candidateObjectId = new ObjectId(candidateId);
          const expires_in = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const addDetails = await employerModel.updateOne(
            {
              userId: userId,
              "jobs.jobId": jobId,
              "jobs.applicants.id": candidateObjectId,
            },
            {
              $set: {
                "jobs.$[job].applicants.$[applicant].interviewStatus": "Sent",
                "jobs.$[job].applicants.$[applicant].instructions":
                  instructions,
                "jobs.$[job].applicants.$[applicant].interviewViewLinkExpiresin":
                  expires_in,
              },
            },
            {
              arrayFilters: [
                { "job.jobId": jobId },
                { "applicant.id": candidateObjectId },
              ],
              new: true,
            },
          );
          await employerModel.updateOne(
            {
              userId: userId,
              "jobs.jobId": jobId,
              "jobs.applicants.id": candidateObjectId,
            },
            {
              $push: {
                "jobs.$[job].applicants.$[applicant].interviewLiveStatus": {
                  status: "Interview Mail Sent",
                  time: new Date(),
                },
              },
            },
            {
              arrayFilters: [
                { "job.jobId": jobId },
                { "applicant.id": candidateObjectId },
              ],
            },
          );
          res.status(200).json({
            message: "Interview Inviatetion Sent",
            status: true,
          });
        })
        .catch((err) => {
          console.log("Error in sending the mail for contact us form", err);
          res.status(400).json({ err });
        });
      // res.send("hi");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error, status: false });
    }
  },
  async updateInterviewDetails(req, res) {
    console.log("Uploading interview details");
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
        uploadDir: "/data/upload",
        // maxFileSize: 3000 * 1024 * 1024, // 3000MB (3GB)
        // uploadDir: "/data/upload",
        maxFileSize: 4 * 1024 * 1024 * 1024, // 12 GB
      });

      await form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing the file:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
        }

        const { userId, jobId, candidateId } = req.params;
        const {
          candidateEmail,
          jobTitle,
          email,
          candidateName,
          companyName,
          region,
          resume_text,
          job_description_text,
          question,
          answer,
        } = fields;
        const candidateObjectId = new ObjectId(candidateId);
        const videoFile = Array.isArray(files.file)
          ? files.file[0]
          : files.file;
        // const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
        const baseQuery = {
          userId,
          "jobs.jobId": jobId,
          "jobs.applicants.id": candidateObjectId,
        };

        const updateApplicant = async (setPayload) =>
          employerModel.updateOne(
            baseQuery,
            {
              $set: setPayload,
            },
            {
              arrayFilters: [
                { "job.jobId": jobId },
                { "applicant.id": candidateObjectId },
              ],
              new: true,
            },
          );

        try {
          if (!job_description_text || !question || !answer) {
            return res.status(400).json({
              message: "Interview analysis payload is missing",
              status: false,
            });
          }

          const parsedQuestions = JSON.parse(question);
          const parsedAnswers = JSON.parse(answer);
          const formData = {
            job_description_text,
            messages: parsedQuestions
              .map((item, idx) => [
                { role: "assistant", content: item },
                { role: "user", content: parsedAnswers[idx] },
              ])
              .flat(),
            total_interview_time: 1200,
          };

          await videoInterviewQuestionModel.findOneAndUpdate(
            {
              candidateId: candidateObjectId,
              jobId,
              employerId: userId,
            },
            {
              $set: {
                candidateId: candidateObjectId,
                jobId,
                jobTitle,
                resumeText: resume_text || "",
                jobDescriptionText: job_description_text || "",
                employerId: userId,
                questions: parsedQuestions,
                answers: parsedAnswers,
                messages: formData.messages,
              },
            },
            {
              upsert: true,
              new: true,
            },
          );

          const analysisStatusUpdate = await pushLiveStatusRaw(
            employerModel,
            baseQuery,
            jobId,
            candidateObjectId,
            "Analysis In Progress",
            {
              "jobs.$[job].applicants.$[applicant].videoUploadStatus": "Pending",
              "jobs.$[job].applicants.$[applicant].qaPdfStatus": "Pending",
            }
          );

          const analysisStatusMatched =
            analysisStatusUpdate?.matchedCount ?? analysisStatusUpdate?.n ?? 0;

          if (!analysisStatusMatched) {
            return res.status(404).json({
              message: "Candidate interview record not found",
              status: false,
            });
          }

          console.log(formData.messages);
          console.log(formData.job_description_text);

          const { data } = await axios.post(
            `${process.env.Video_AI}/analyze_interview`,
            formData,
            { headers: { "Content-Type": "application/json" } },
          );

          let summary = JSON.stringify(data);
          if (
            typeof summary === "string" &&
            summary.startsWith("'") &&
            summary.endsWith("'")
          ) {
            summary = summary.slice(1, -1);
          }

          const analysisUpdate = await pushLiveStatusRaw(
            employerModel,
            baseQuery,
            jobId,
            candidateObjectId,
            "Video Upload In Progress",
            {
              "jobs.$[job].applicants.$[applicant].interviewSummary": summary,
              "jobs.$[job].applicants.$[applicant].videoUploadStatus": "In Progress",
              "jobs.$[job].applicants.$[applicant].qaPdfStatus": "Pending",
              "jobs.$[job].applicants.$[applicant].analysisSavedAt": new Date(),
              "jobs.$[job].applicants.$[applicant].videoUploadStartedAt": new Date(),
              "jobs.$[job].applicants.$[applicant].videoUploadError": null,
              "jobs.$[job].applicants.$[applicant].qaPdfError": null,
            }
          );

          const analysisMatched =
            analysisUpdate?.matchedCount ?? analysisUpdate?.n ?? 0;

          if (!analysisMatched) {
            return res.status(404).json({
              message: "Candidate interview record not found",
              status: false,
            });
          }

          res.status(201).json({
            message:
              "Interview analysis saved. Video processing continues in background.",
            status: true,
          });

          (async () => {
            console.log(
              "background submitting video & PDF in video analysis started",
            );

            const inputVideoPath = videoFile?.filepath;
            // const inputPdfPath = pdfFile?.filepath;
            const compressedPath = inputVideoPath
              ? `${inputVideoPath}_compressed.mp4`
              : null;

            try {
              if (!inputVideoPath) {
                throw new Error("Video is missing");
              }

              await compressVideo(inputVideoPath, compressedPath);

              const videoStream = fs.createReadStream(compressedPath);
              // const pdfStream = fs.createReadStream(inputPdfPath);
              const uploadSuffix = `${jobId}_${candidateId}_${Date.now()}`;

              console.log("Uploading video");
              const videoData = await s3
                .upload({
                  Bucket: process.env.AWS_BUCKET_NAME_VIDEOS,
                  Key: `interviews/${uploadSuffix}.mp4`,
                  Body: videoStream,
                  ACL: "public-read-write",
                  ContentType: "video/mp4",
                })
                .promise();

              let pdfData = null;
              let qaPdfError = null;

              await pushLiveStatusRaw(
                employerModel,
                baseQuery,
                jobId,
                candidateObjectId,
                "PDF Upload In Progress",
                {
                  "jobs.$[job].applicants.$[applicant].video": videoData.Location,
                  "jobs.$[job].applicants.$[applicant].videoUploadStatus": "Completed",
                  "jobs.$[job].applicants.$[applicant].videoUploadCompletedAt": new Date(),
                  "jobs.$[job].applicants.$[applicant].videoUploadError": null,
                  "jobs.$[job].applicants.$[applicant].qaPdfStatus": "In Progress",
                }
              );

              try {
                console.log("Generating and uploading Q&A PDF");
                const qaPdfBytes = await createQAPdf(formData.messages);
                pdfData = await s3
                  .upload({
                    Bucket: process.env.AWS_BUCKET_NAME_VIDEOS,
                    Key: `transcriptions/${uploadSuffix}_interview_summary.pdf`,
                    Body: Buffer.from(qaPdfBytes),
                    ACL: "public-read-write",
                    ContentType: "application/pdf",
                  })
                  .promise();
              } catch (pdfError) {
                qaPdfError = pdfError?.message || "Q&A PDF generation failed";
                console.error("Q&A PDF generation/upload failed:", pdfError);
              }

              console.log("Upload completed");

              const completedExtraFields = {
                "jobs.$[job].applicants.$[applicant].video": videoData.Location,
                "jobs.$[job].applicants.$[applicant].videoUploadStatus": "Completed",
                "jobs.$[job].applicants.$[applicant].qaPdfStatus": pdfData
                  ? "Completed"
                  : "Failed",
                "jobs.$[job].applicants.$[applicant].videoUploadCompletedAt": new Date(),
                "jobs.$[job].applicants.$[applicant].videoUploadError": null,
                "jobs.$[job].applicants.$[applicant].qaPdfError": qaPdfError,
              };

              if (pdfData?.Location) {
                completedExtraFields[
                  "jobs.$[job].applicants.$[applicant].transcript"
                ] = pdfData.Location;
              }

              await pushLiveStatusRaw(
                employerModel,
                baseQuery,
                jobId,
                candidateObjectId,
                "Completed",
                completedExtraFields
              );

              try {
                const parsedSummary =
                  typeof data === "string" ? JSON.parse(data) : data;
                const pdfBytes = await createPdf(parsedSummary);

                await candidateSendEmail(
                  candidateEmail,
                  candidateName,
                  jobTitle,
                  companyName,
                  region,
                  email,
                );

                await EmployerSendEmail(
                  candidateEmail,
                  videoData,
                  jobTitle,
                  region,
                  email,
                  pdfBytes,
                );

                console.log("Email sent in video analysis");
              } catch (notificationError) {
                console.error(
                  "Post-upload PDF/email generation failed:",
                  notificationError,
                );
              }
            } catch (uploadError) {
              console.error("Post-response upload/email failed:", uploadError);
              await pushLiveStatusRaw(
                employerModel,
                baseQuery,
                jobId,
                candidateObjectId,
                "Video Upload Failed",
                {
                  "jobs.$[job].applicants.$[applicant].videoUploadStatus": "Failed",
                  "jobs.$[job].applicants.$[applicant].videoUploadError":
                    uploadError?.message || "Video upload failed",
                }
              );
            } finally {
              deleteFileSafe(inputVideoPath);
              deleteFileSafe(compressedPath);
              // deleteFileSafe(inputPdfPath);

              console.log("All temp files removed.");
              console.log("background process completed");
            }
          })();
        } catch (analysisError) {
          console.error("Error analyzing interview:", analysisError);
          await pushLiveStatusRaw(
            employerModel,
            baseQuery,
            jobId,
            candidateObjectId,
            "Analysis Failed"
          );
          return res.status(500).json({
            message: "Failed to analyze interview",
            status: false,
          });
        }
      });
    } catch (error) {
      console.error("Error in updateInterviewDetails:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", status: false });
    }
  },

  //coding round
  async sendCodingInterviewMail(req, res) {
    console.log("Sent interview mail");

    try {
      const {
        from,
        to,
        JobTitle,
        candidateName,
        companyName,
        instructions,
        level,
        // interviewType,
        region,
      } = req.body;
      // console.log(req.body);
      const { jobId, userId, candidateId } = req.params;
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
              // timeout: 60000, // 10 seconds connection timeout
              // socketTimeout: 60000, // 30 seconds total send timeout
            })
          : nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "support@skillstreamjobs.ca",
                pass: "yzsz ockc eiql oyqj",
              },
              // timeout: 60000, // 10 seconds connection timeout
              // socketTimeout: 60000, // 30 seconds total send timeout
            });

      console.log(req.body);
      let domain = "";
      if (region === "Canada") {
        domain = "https://skillstreamjobs.ca";
      } else if (region === "United States") {
        domain = process.env.USWEBSITE;
      } else if (region === "India") {
        domain = "https://www.skillstreamlabs.com";
      }
      const interviewLink = `${domain}/codingRound/${userId}/${candidateId}/${jobId}`;
      //   HTML for the email
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Coding Interview Invitation</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      ol {
        text-align: left;
        padding-left: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img
        src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png"
        class="logo"
        alt="Skill Stream AI Logo"
      />
      <h2 class="header">Coding Interview Invitation</h2>
      <p class="content">Hi <strong>${candidateName}</strong>,</p>
      <p class="content">
        Congratulations! You have been selected for the coding interview round
        for the role of <strong>${JobTitle}</strong> at
        <strong>${companyName}</strong>.
      </p>
      <p class="content">
        Please click the button below to start your interview:
      </p>
      <div class="button-container">
        <a
          href="${interviewLink}"
          class="button"
          style="color: #ffffff !important"
          target="_blank"
          >Start Interview</a
        >
      </div>
      <h3 class="content">Instructions:</h3>
      <ol class="content">
        <li>Ensure your webcam and microphone are working properly.</li>
        <li>Enable screen recording permissions when prompted.</li>
        <li>
          Write your code for each question, click "Run" to see the output, then
          click "Submit" to move to the next question.
        </li>

        <li>
          The recording will capture both video and audio, so choose a quiet,
          well-lit environment.
        </li>
        <li>Do not click "Stop Sharing" during the interview.</li>
      </ol>
      <p class="content">Best of luck!</p>
      <p class="footer">
        Best regards,<br /><strong>Team Skill Stream</strong>
      </p>
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
        to: to,
        subject: `Coding Interview Invitation for ${JobTitle}`,
        text: `Coding Interview Invitation for ${JobTitle}`,
        html: html,
        replyTo: from,
        //   html: html,
      };
      // level
      // sending the mail for registeration
      mailTransporter
        .sendMail(details)
        .then(async (info) => {
          const candidateObjectId = new ObjectId(candidateId);
          const expires_in = new Date(Date.now() + 24 * 60 * 60 * 1000);
          const addDetails = await employerModel.updateOne(
            {
              userId: userId,
              "jobs.jobId": jobId,
              "jobs.applicants.id": candidateObjectId,
            },
            {
              $set: {
                "jobs.$[job].applicants.$[applicant].CodingInterviewStatus":
                  "Sent",
                "jobs.$[job].applicants.$[applicant].CodingInstructions":
                  instructions,
                "jobs.$[job].applicants.$[applicant].CodingLevel": level,
                "jobs.$[job].applicants.$[applicant].CodingInterviewViewLinkExpiresin":
                  expires_in,
              },
            },
            {
              arrayFilters: [
                { "job.jobId": jobId },
                { "applicant.id": candidateObjectId },
              ],
              new: true,
            },
          );
          res.status(200).json({
            message: "Interview Invitation Sent",
            status: true,
          });
        })
        .catch((err) => {
          console.log("Error in sending the mail for contact us form", err);
          res.status(400).json({ err });
        });
      // res.send("hi");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error, status: false });
    }
  },
  async CodingExecution(req, res) {
    try {
      const { code, language } = req.body;

      const langConfig = {
        javascript: { file: "main.js", run: (f) => `node ${f}` },
        python: { file: "main.py", run: (f) => `python3 ${f}` },
        cpp: { file: "main.cpp", run: (f) => `g++ ${f} -o main && ./main` },
        java: { file: "Main.java", run: (f) => `javac ${f} && java Main` },
      };

      if (!langConfig[language]) {
        return res.status(400).json({ error: "Unsupported language" });
      }

      const filePath = `/tmp/${langConfig[language].file}`;
      require("fs").writeFileSync(filePath, code);

      exec(
        langConfig[language].run(filePath),
        { cwd: "/tmp", timeout: 5000 },
        (err, stdout, stderr) => {
          if (err) return res.json({ output: stderr || err.message });
          res.json({ output: stdout });
        },
      );
    } catch (error) {
      console.error("Error in executing the code", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", status: false });
    }
  },
  async CodingResumeJobText(req, res) {
    try {
      const { userId, jobId, candidateId } = req.body;
      const candidateObjectId = new ObjectId(candidateId);

      const result = await employerModel.aggregate([
        { $match: { userId: userId } }, // Match document by userId
        { $unwind: "$jobs" }, // Unwind the job array
        { $match: { "jobs.jobId": jobId } }, // Match the specific jobid
        { $unwind: "$jobs.applicants" }, // Unwind the applicants array
        { $match: { "jobs.applicants.id": candidateObjectId } }, // Match the specific applicantId
        {
          $project: {
            jobDescription: "$jobs.JobDescription", // Project job description
            resume: "$jobs.applicants.resume",
            email: "$jobs.EmailAddress",
            candidateEmail: "$jobs.applicants.email",
            candidateName: "$jobs.applicants.name",
            interviewStatus: "$jobs.applicants.CodingInterviewStatus",
            companyName: "$jobs.companyName",
            expires_in: "$jobs.applicants.CodingInterviewViewLinkExpiresin",
            jobTitle: "$jobs.JobTitle",
            instructions: "$jobs.applicants.CodingInstructions",
            level: "$jobs.applicants.CodingLevel",
          },
        },
      ]);
      let formData = {
        resume: result[0].resume,
        job_description_text: convert(result[0].jobDescription),
        instructions: result[0].instructions ? result[0].instructions : [],
      };
      console.log(result);

      const { data } = await axios.post(
        `${process.env.Video_AI}/upload`,
        JSON.stringify(formData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log(data);

      res.status(200).json({
        job_description_text: data.job_description_text,
        resume_text: data.resume_text,
        instructions: data.instructions,
        interviewStatus: result[0].interviewStatus,
        level: result[0].level,
        expires_in: result[0].expires_in
          ? result[0].expires_in
          : new Date(new Date().setDate(new Date().getDate() - 1)),
        email: result[0].email,
        jobTitle: result[0].jobTitle,
        candidateEmail: result[0].candidateEmail,
        companyName: result[0].companyName,
        candidateName: result[0].candidateName,
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async CodingGenerateQuestions(req, res) {
    try {
      const { resume_text, job_description_text, level, instructions } =
        req.body;
      const payload = {
        resume_text,
        job_description_text,
        level,
        instructions,
      };
      console.log(payload);
      const { data } = await axios.post(
        `${process.env.Video_AI}/ask_coding_questions`,
        payload,
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
  async CodingAnalyse(req, res) {
    console.log("Uploading interview details");
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
        uploadDir: "/data/upload",
        maxFileSize: 4 * 1024 * 1024 * 1024, // 12 GB
      });

      await form.parse(req, async (err, fields, files) => {
        if (!files.video || !files.pdf) {
          // console.error("Video or PDF file is missing", err);
          return res
            .status(400)
            .json({ message: "Video or PDF file is missing", status: false });
        } else if (err) {
          console.error("Error parsing the file:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
        }

        const { userId, jobId, candidateId } = req.params;
        const {
          candidateEmail,
          jobTitle,
          email,
          candidateName,
          companyName,
          region,
          questions,
          answers,
          outputs,
        } = fields;

        const candidateObjectId = new ObjectId(candidateId);
        let formData = {
          questions: JSON.parse(questions),
          answers: JSON.parse(answers),
          outputs: JSON.parse(outputs),
        };
        console.log(formData);

        const { data } = await axios.post(
          `${process.env.Video_AI}/evaluate_coding_round`,
          formData,
          { headers: { "Content-Type": "application/json" } },
        );
        // console.log(data);
        let summaryObj = data;

        // Inject question text into each per-question entry
        if (
          summaryObj?.evaluation?.per_question &&
          Array.isArray(formData.questions)
        ) {
          summaryObj.evaluation.per_question =
            summaryObj.evaluation.per_question.map((item, index) => ({
              ...item,
              question: formData.questions[index] || "Question not found",
            }));
        }

        // Convert back to string for storing in DB
        let updatedSummaryString = JSON.stringify(summaryObj);

        // Remove extra quotes if exists
        if (
          updatedSummaryString.startsWith("'") &&
          updatedSummaryString.endsWith("'")
        ) {
          updatedSummaryString = updatedSummaryString.slice(1, -1);
        }
        await employerModel.updateOne(
          {
            userId: userId,
            "jobs.jobId": jobId,
            "jobs.applicants.id": candidateObjectId,
          },
          {
            $set: {
              "jobs.$[job].applicants.$[applicant].CodingInterviewSummary":
                updatedSummaryString,
            },
          },
          {
            arrayFilters: [
              { "job.jobId": jobId },
              { "applicant.id": candidateObjectId },
            ],
            new: true,
          },
        );

        res.status(201).json({
          message: "Video & PDF Submitted for Review",
          status: true,
        });
        (async () => {
          console.log("background calling for submitting video & PDF");
          try {
            const inputVideoPath = files.video.filepath;
            // console.log(files.video);
            console.log(inputVideoPath);

            const compressedPath = `${inputVideoPath}_compressed.mp4`;

            // Convert & compress before uploading
            await compressVideo(inputVideoPath, compressedPath);
            console.log("upload start");

            // Upload the video to S3
            const videoStream = fs.createReadStream(compressedPath);
            const videoParams = {
              Bucket: process.env.AWS_BUCKET_NAME_VIDEOS,
              Key: `${candidateId}.mp4`, // video file name
              Body: videoStream,
              ACL: "public-read-write",
              ContentType: "video/mp4",
            };

            // Upload the PDF to S3
            const pdfStream = fs.createReadStream(files.pdf.filepath);
            const pdfParams = {
              Bucket: `${process.env.AWS_BUCKET_NAME_VIDEOS}/transcriptions`,
              Key: `${candidateId}_interview_summary.pdf`, // PDF file name
              Body: pdfStream,
              ACL: "public-read-write",
              ContentType: "application/pdf",
            };

            // Upload both video and PDF to S3 using Promise.all
            try {
              console.log("Starting uploads...");

              // ⛔ VERY IMPORTANT: MUST AWAIT
              const [videoData, pdfData] = await Promise.all([
                s3.upload(videoParams).promise(),
                s3.upload(pdfParams).promise(),
              ]);

              console.log("Uploads completed.");

              // UPDATE DB
              await employerModel.updateOne(
                {
                  userId,
                  "jobs.jobId": jobId,
                  "jobs.applicants.id": candidateObjectId,
                },
                {
                  $set: {
                    "jobs.$[job].applicants.$[applicant].codingVideo":
                      videoData.Location,
                    "jobs.$[job].applicants.$[applicant].codingQ_A":
                      pdfData.Location,
                    "jobs.$[job].applicants.$[applicant].CodingInterviewStatus":
                      "Completed",
                  },
                },
                {
                  arrayFilters: [
                    { "job.jobId": jobId },
                    { "applicant.id": candidateObjectId },
                  ],
                },
              );

              // Send emails
              const pdfBytes = await createCodingPdf(
                JSON.parse(updatedSummaryString),
              );

              await candidateSendEmail(
                candidateEmail,
                candidateName,
                jobTitle,
                companyName,
                region,
                email,
              );

              await EmployerSendEmail(
                candidateEmail,
                videoData,
                jobTitle,
                region,
                email,
                pdfBytes,
              );

              console.log("Emails sent. Now deleting temp files...");

              // SAFE DELETE FUNCTION
              const deleteFileSafe = (filePath) => {
                if (!filePath) return;
                fs.unlink(filePath, (err) => {
                  if (err) {
                    // File already deleted? Windows throws error → ignore
                    if (err.code !== "ENOENT") {
                      console.error("❌ Delete failed:", filePath, err);
                    } else {
                      console.log("⚠ File already deleted:", filePath);
                    }
                  } else {
                    console.log("🗑️ Deleted:", filePath);
                  }
                });
              };

              // DELETE FILES AFTER EVERYTHING IS 100% DONE
              deleteFileSafe(files.video.filepath);
              deleteFileSafe(compressedPath);
              deleteFileSafe(files.pdf.filepath);

              console.log("All temp files removed.");
            } catch (err) {
              console.error("Upload or email error:", err);
            }
          } catch (err) {
            console.error("Post-response upload/email failed:", err);
          }
        })();
      });
    } catch (error) {
      console.error("Error in updateInterviewDetails:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", status: false });
    }
  },
   async getLiveStatus(req, res) {
  try {
    const { userId, jobId, candidateId } = req.params;
    const candidateObjectId = new ObjectId(candidateId);

    const result = await employerModel.aggregate([
      { $match: { userId } },
      { $unwind: "$jobs" },
      { $match: { "jobs.jobId": jobId } },
      { $unwind: "$jobs.applicants" },
      { $match: { "jobs.applicants.id": candidateObjectId } },
      {
        $project: {
          interviewStatus:     "$jobs.applicants.interviewStatus",
          interviewLiveStatus: "$jobs.applicants.interviewLiveStatus",
          videoUploadStatus:   "$jobs.applicants.videoUploadStatus",
          qaPdfStatus:         "$jobs.applicants.qaPdfStatus",
          videoUploadError:    "$jobs.applicants.videoUploadError",
          qaPdfError:          "$jobs.applicants.qaPdfError",
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ message: "Candidate not found", status: false });
    }

    res.status(200).json({ ...result[0], status: true });
  } catch (error) {
    console.error("getLiveStatus error:", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
},

async pushCandidateLiveStatus (req, res) {
  try {
    const { userId, jobId, candidateId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required", status: false });
    }

    const candidateObjectId = new ObjectId(candidateId);
    const baseQuery = {
      userId,
      "jobs.jobId": jobId,
      "jobs.applicants.id": candidateObjectId,
    };

    await employerModel.updateOne(
      baseQuery,
      {
        $set: {
          "jobs.$[job].applicants.$[applicant].interviewStatus": status,
        },
        $push: {
          "jobs.$[job].applicants.$[applicant].interviewLiveStatus": {
            status,
            time: new Date(),
          },
        },
      },
      {
        arrayFilters: [
          { "job.jobId": jobId },
          { "applicant.id": candidateObjectId },
        ],
      }
    );

    res.status(200).json({ message: "Status pushed", status: true });
  } catch (error) {
    console.error("pushCandidateLiveStatus error:", error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
},
};

// ─── New liveStatus controller methods ───────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

module.exports = controller;
// Promise.all([
//   s3.upload(videoParams).promise(),
//   s3.upload(pdfParams).promise(),
// ]).then(async ([videoData, pdfData]) => {
//   console.log("Video Data:", videoData);
//   console.log("PDF Data:", pdfData);
//   // console.log(summary);
//   console.log("Upload Completed");

//   const addDetails = await employerModel.updateOne(
//     {
//       userId: userId,
//       "jobs.jobId": jobId,
//       "jobs.applicants.id": candidateObjectId,
//     },
//     {
//       $set: {
//         "jobs.$[job].applicants.$[applicant].codingVideo":
//           videoData.Location,
//         "jobs.$[job].applicants.$[applicant].codingQ_A":
//           pdfData.Location, // Add the PDF URL here
//         "jobs.$[job].applicants.$[applicant].CodingInterviewStatus":
//           "Completed",
//       },
//     },
//     {
//       arrayFilters: [
//         { "job.jobId": jobId },
//         { "applicant.id": candidateObjectId },
//       ],
//       new: true,
//     }
//   );
//   console.log("Email Sending started in video analysis");

//   const pdfBytes = await createCodingPdf(
//     JSON.parse(updatedSummaryString)
//   );
//   await candidateSendEmail(
//     candidateEmail,
//     candidateName,
//     jobTitle,
//     companyName,
//     region,
//     email
//   );
//   await EmployerSendEmail(
//     candidateEmail,
//     videoData,
//     jobTitle,
//     region,
//     email,
//     pdfBytes
//   );
// });
// console.log("Emails sent. Now deleting temp files...");

// // SAFE DELETE FUNCTION
// const deleteFileSafe = (filePath) => {
//   if (!filePath) return;
//   fs.unlink(filePath, (err) => {
//     if (err) {
//       // File already deleted? Windows throws error → ignore
//       if (err.code !== "ENOENT") {
//         console.error("❌ Delete failed:", filePath, err);
//       } else {
//         console.log("⚠ File already deleted:", filePath);
//       }
//     } else {
//       console.log("🗑️ Deleted:", filePath);
//     }
//   });
// };

// // DELETE FILES AFTER EVERYTHING IS 100% DONE
// deleteFileSafe(files.video.filepath);
// deleteFileSafe(compressedPath);
// deleteFileSafe(files.pdf.filepath);

// console.log("All temp files removed.");
// (async () => {
//   console.log(
//     "background calling for submitting video & PDF in video analysis"
//   );
//   try {
//     const inputVideoPath = files.file.filepath;
//     const compressedPath = `${inputVideoPath}_compressed.mp4`;

//     // Convert & compress before uploading
//     await compressVideo(inputVideoPath, compressedPath);

//     // Upload the video to S3
//     const videoStream = fs.createReadStream(compressedPath);
//     const videoParams = {
//       Bucket: process.env.AWS_BUCKET_NAME_VIDEOS,
//       Key: `${candidateId}.mp4`, // video file name
//       Body: videoStream,
//       ACL: "public-read-write",
//       ContentType: "video/mp4",
//     };

//     // Upload the PDF to S3
//     const pdfStream = fs.createReadStream(files.pdf.filepath);
//     const pdfParams = {
//       Bucket: `${process.env.AWS_BUCKET_NAME_VIDEOS}/transcriptions`,
//       Key: `${candidateId}_interview_summary.pdf`, // PDF file name
//       Body: pdfStream,
//       ACL: "public-read-write",
//       ContentType: "application/pdf",
//     };
//     console.log("Uploading video & PDF");

//     // Upload both video and PDF to S3 using Promise.all
//     Promise.all([
//       s3.upload(videoParams).promise(),
//       s3.upload(pdfParams).promise(),
//     ]).then(async ([videoData, pdfData]) => {
//       console.log("Video Data:", videoData);
//       console.log("PDF Data:", pdfData);
//       // console.log(summary);

//       console.log("Upload completed video & PDF in video analysis");

//       const addDetails = await employerModel.updateOne(
//         {
//           userId: userId,
//           "jobs.jobId": jobId,
//           "jobs.applicants.id": candidateObjectId,
//         },
//         {
//           $set: {
//             "jobs.$[job].applicants.$[applicant].video":
//               videoData.Location,
//             "jobs.$[job].applicants.$[applicant].transcript":
//               pdfData.Location, // Add the PDF URL here
//             "jobs.$[job].applicants.$[applicant].interviewStatus":
//               "Completed",
//           },
//         },
//         {
//           arrayFilters: [
//             { "job.jobId": jobId },
//             { "applicant.id": candidateObjectId },
//           ],
//           new: true,
//         }
//       );
//       const pdfBytes = await createPdf(JSON.parse(summary));
//       console.log("Sending email in video analysis");

//       await candidateSendEmail(
//         candidateEmail,
//         candidateName,
//         jobTitle,
//         companyName,
//         region,
//         email
//       );
//       await EmployerSendEmail(
//         candidateEmail,
//         videoData,
//         jobTitle,
//         region,
//         email,
//         pdfBytes
//       );
//     });
//     console.log("Email sent in video analysis");
//     const deleteFileSafe = (filePath) => {
//       if (!filePath) return;
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           // File already deleted? Windows throws error → ignore
//           if (err.code !== "ENOENT") {
//             console.error("❌ Delete failed:", filePath, err);
//           } else {
//             console.log("⚠ File already deleted:", filePath);
//           }
//         } else {
//           console.log("🗑️ Deleted:", filePath);
//         }
//       });
//     };

//     // DELETE FILES AFTER EVERYTHING IS 100% DONE
//     deleteFileSafe(files.file.filepath);
//     // deleteFileSafe(compressedPath);
//     deleteFileSafe(files.pdf.filepath);

//     console.log("All temp files removed.");
//     // console.log("unlinking");
//     // fs.unlink(files.file.filepath, (err) => {
//     //   if (err)
//     //     console.error("Failed to delete original temp video:", err);
//     // });
//     // fs.unlink(files.pdf.filepath, (err) => {
//     //   if (err)
//     //     console.error("Failed to delete original temp video:", err);
//     // });
//     // await Promise.all([
//     //   fs.promises.unlink(files.file.filepath).catch(console.error),
//     //   // fs.promises.unlink(compressedPath).catch(console.error),
//     //   fs.promises.unlink(files.pdf.filepath).catch(console.error),
//     // ]);
//   } catch (err) {
//     console.error("Post-response upload/email failed:", err);
//   }
// })();
// console.log("unlinking");
// fs.unlink(files.file.filepath, (err) => {
//   if (err)
//     console.error("Failed to delete original temp video:", err);
// });
// fs.unlink(files.pdf.filepath, (err) => {
//   if (err)
//     console.error("Failed to delete original temp video:", err);
// });
// const cloudinaryUploadResponse = await new Promise(
//   (resolve, reject) => {
//     cloudinary.v2.uploader.upload_large(
//       filepath,
//       {
//         resource_type: "video",
//         folder: "videos",
//         format: "mp4",
//         async: true,
//         public_id: `interview_${candidateId}`,
//         notification_url: ` ${process.env.SERVER}/api/v1/videoInterview/getLink/${userId}/${jobId}/${candidateId}`,
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Error uploading to Cloudinary:", error);
//           reject({ status: error.http_code, message: error.message });
//         } else {
//           resolve(result);
//           return res.status(200).json({
//             message: "Video uploaded successfully",
//             status: true,
//           });
//         }
//       }
//     );
//   }
// );

// // cloudinary.v2.uploader.upload_large(
// //   filepath,
// //   {
// //     resource_type: "video",
// //     folder: "videos",
// //     format: "mp4",
// //     eager_async: true,
// //     public_id: `interview_${candidateId}`, // Setting a unique public_id for easy reference
// //     eager_notification_url: `${process.env.SERVER}/api/v1/videoInterview/getLink/${userId}/${jobId}/${candidateId}`,
// //   },
// //   async (error, result) => {
// //     if (error) {
// //       console.error("Error uploading to Cloudinary:", error);
// //       return res
// //         .status(403)
// //         .json({ message: "Upload failed, please try again" });
// //     } else {
// //       console.log("Upload successful:", result);
// //       const { secure_url } = result;

// //       // You can now use the secure_url as needed

// //     }
// //   }
// // );
//   async updateInterviewDetails(req, res) {
//     console.log("Uploading interview details");
//     try {
//       const form = formidable({
//         multiples: true,
//         keepExtensions: true,
//         useTempFiles: true,
//         maxFileSize: 500 * 1024 * 1024, // 500MB
//       });

//       await form.parse(req, async (err, fields, files) => {
//         if (!files.file || !files.pdf) {
//           console.error("Video or PDF file is missing", err);
//           return res
//             .status(400)
//             .json({ message: "Video or PDF file is missing", status: false });
//         } else if (err) {
//           console.error("Error parsing the file:", err);
//           return res
//             .status(500)
//             .json({ message: "Internal Server Error", status: false });
//         }

//         const { userId, jobId, candidateId } = req.params;
//         const {
//           candidateEmail,
//           jobTitle,
//           email,
//           candidateName,
//           companyName,
//           region,
//           // summary,
//           resume_text,
//           job_description_text,
//           question,
//           answer,
//         } = fields;
//         let formData = {
//           // resume_text,
//           job_description_text,
//           messages: JSON.parse(question)
//             .map((e, idx) => [
//               { role: "assistant", content: e },
//               { role: "user", content: JSON.parse(answer)[idx] },
//             ])
//             .flat(),
//           total_interview_time: 1200,
//         };
//         console.log(formData.messages);
//         console.log(formData.job_description_text);

//         const { data } = await axios.post(
//           `${process.env.Video_AI}/analyze_interview`,
//           formData,
//           { headers: { "Content-Type": "application/json" } }
//         );
//         let summary = JSON.stringify(data);
//         console.log(formData);
//         if (
//           typeof summary === "string" &&
//           summary.startsWith("'") &&
//           summary.endsWith("'")
//         ) {
//           summary = summary.slice(1, -1);
//         }
//          await employerModel.updateOne(
//           {
//             userId: userId,
//             "jobs.jobId": jobId,
//             "jobs.applicants.id": candidateObjectId,
//           },
//           {
//             $set: {
//               "jobs.$[job].applicants.$[applicant].interviewSummary": summary,
//             },
//           }
//         );
//         // Upload the video to S3
//         const videoStream = fs.createReadStream(files.file.filepath);
//         const videoParams = {
//           Bucket: process.env.AWS_BUCKET_NAME_VIDEOS,
//           Key: `${candidateId}.webm`, // video file name
//           Body: videoStream,
//           ACL: "public-read-write",
//           ContentType: "video/webm",
//         };

//         // Upload the PDF to S3
//         const pdfStream = fs.createReadStream(files.pdf.filepath);
//         const pdfParams = {
//           Bucket: `${process.env.AWS_BUCKET_NAME_VIDEOS}/transcriptions`,
//           Key: `${candidateId}_interview_summary.pdf`, // PDF file name
//           Body: pdfStream,
//           ACL: "public-read-write",
//           ContentType: "application/pdf",
//         };

//         // Upload both video and PDF to S3 using Promise.all
//         Promise.all([
//           s3.upload(videoParams).promise(),
//           s3.upload(pdfParams).promise(),
//         ])
//           .then(async ([videoData, pdfData]) => {
//             console.log("Video Data:", videoData);
//             console.log("PDF Data:", pdfData);
//             // console.log(summary);
//             const candidateObjectId = new ObjectId(candidateId);
//             const addDetails = await employerModel.updateOne(
//               {
//                 userId: userId,
//                 "jobs.jobId": jobId,
//                 "jobs.applicants.id": candidateObjectId,
//               },
//               {
//                 $set: {
//                   "jobs.$[job].applicants.$[applicant].video":
//                     videoData.Location,
//                   "jobs.$[job].applicants.$[applicant].transcript":
//                     pdfData.Location, // Add the PDF URL here
//                   "jobs.$[job].applicants.$[applicant].interviewStatus":
//                     "Completed",
//                 },
//               },
//               {
//                 arrayFilters: [
//                   { "job.jobId": jobId },
//                   { "applicant.id": candidateObjectId },
//                 ],
//                 new: true,
//               }
//             );
//             let mailTransporter =
//               region === "United States"
//                 ? nodemailer.createTransport({
//                     host: "smtp.office365.com",
//                     port: 587,
//                     secure: false,
//                     auth: {
//                       user: "info@skillstreamjobs.us",
//                       pass: "rsgdtwzstknlblcn",
//                     },
//                   })
//                 : nodemailer.createTransport({
//                     service: "gmail",
//                     auth: {
//                       user: "support@skillstreamjobs.ca",
//                       pass: "yzsz ockc eiql oyqj",
//                     },
//                   });

//             //   HTML for the email
//             const html = `

//                  <!DOCTYPE html>
// <html>
// <head>
//     <title>Interview Completed</title>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #ffffff;
//             margin: 0;
//             padding: 0;
//             text-align: center;
//         }
//         .container {
//             background-color: #ffffff;
//             padding: 20px;
//             max-width: 600px;
//             margin: 20px auto;
//             border-radius: 10px;
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }
//         .logo {
//             width: 150px;
//             display: block;
//             margin: 0 auto 15px;
//         }
//         .header {
//             font-size: 22px;
//             font-weight: bold;
//             color: #333;
//             margin-bottom: 15px;
//             text-align: center;
//         }
//         .content {
//             font-size: 16px;
//             color: #333;
//             text-align: left;
//             padding: 10px 20px;
//         }
//         .footer {
//             font-size: 14px;
//             color: #666;
//             margin-top: 15px;
//             text-align: left;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
//         <h2 class="header">Interview Completed</h2>
//         <p class="content">
//             Dear <strong>${candidateName}</strong>,
//         </p>
//         <p class="content">
//             Thank you for completing the interview for the <strong>${jobTitle}</strong> role. We appreciate the time and effort you invested in the process.
//         </p>
//         <p class="content">
//             Our team is currently reviewing your responses, and we will update you on the next steps as soon as possible. If you have any questions in the meantime, please feel free to reach out.
//         </p>
//         <p class="content">
//             We appreciate your interest in joining <strong>${companyName}</strong> and wish you the best of luck!
//         </p>
//         <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
//     </div>
// </body>
// </html>

//                     `;
//             // console.log(email);
//             //   email details
//             let details = {
//               from: `SKILLSTREAM  ${
//                 region === "United States"
//                   ? "info@skillstreamjobs.us"
//                   : "support@skillstreamjobs.ca"
//               }`,
//               to: `${candidateEmail}`,
//               subject: `Interview Update - ${jobTitle} Interview`,
//               html: html,
//               replyTo: email,
//             };

//             //   sending the mail for registeration
//             mailTransporter
//               .sendMail(details)
//               .then(async (info) => {
//                 let mailTransporter =
//                   region === "United States"
//                     ? nodemailer.createTransport({
//                         host: "smtp.office365.com",
//                         port: 587,
//                         secure: false,
//                         auth: {
//                           user: "info@skillstreamjobs.us",
//                           pass: "rsgdtwzstknlblcn",
//                         },
//                       })
//                     : nodemailer.createTransport({
//                         service: "gmail",
//                         auth: {
//                           user: "support@skillstreamjobs.ca",
//                           pass: "yzsz ockc eiql oyqj",
//                         },
//                       });

//                 //   HTML for the email
//                 const html = `
//                    <!DOCTYPE html>
// <html>
// <head>
//     <title>Candidate Interview Completion</title>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//             text-align: center;
//         }
//         .container {
//             background-color: #ffffff;
//             padding: 20px;
//             max-width: 600px;
//             margin: 20px auto;
//             border-radius: 10px;
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }
//         .logo {
//             width: 150px;
//             margin: 0 auto 15px;
//             display: block;
//         }
//         .header {
//             font-size: 22px;
//             font-weight: bold;
//             color: #333;
//             margin-bottom: 15px;
//             text-align: center;

//         }
//         .content {
//             font-size: 16px;
//             color: #333;
//             text-align: left;
//             padding: 10px 20px;
//         }
//         .button-container {
//             text-align: center;
//             margin-top: 20px;
//         }
//         .button {
//             display: inline-block;
//             background-color: #1e90ff;
//             color: #ffffff;
//             padding: 12px 20px;
//             text-decoration: none;
//             border-radius: 5px;
//             font-size: 16px;
//         }
//         .footer {
//             font-size: 14px;
//             color: #666;
//             margin-top: 15px;
//             text-align: left;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
//         <h2 class="header">Candidate Interview Completed</h2>
//         <p class="content">
//             We’re pleased to inform you that the candidate with the email address <strong>${candidateEmail}</strong> has successfully completed all required steps for the <strong>${jobTitle}</strong> position.
//         </p>
//         <div class="button-container">
//             <a href="${videoData.Location}" class="button" style="color: #ffffff !important;">View Video Results</a>
//         </div>
//         <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
//     </div>
// </body>
// </html>

//                         `;
//                 // console.log(email);
//                 const pdfBytes = await createPdf(JSON.parse(summary));
//                 //   email details
//                 let details = {
//                   from: `SKILLSTREAM  ${
//                     region === "United States"
//                       ? "info@skillstreamjobs.us"
//                       : "support@skillstreamjobs.ca"
//                   }`,
//                   to: `${email}`,
//                   subject: `Interview Update - ${jobTitle} Interview`,
//                   html: html,
//                   replyTo: candidateEmail,
//                   attachments: [
//                     {
//                       filename: "Interview_Feedback.pdf",
//                       content: pdfBytes,
//                       contentType: "application/pdf",
//                     },
//                   ],
//                 };

//                 //   sending the mail for registeration
//                 mailTransporter
//                   .sendMail(details)
//                   .then((info) => {
//                     res.status(201).json({
//                       message: "Video & PDF Submitted for Review",
//                       status: true,
//                       videoData,
//                       pdfData,
//                     });
//                   })
//                   .catch((err) => {
//                     console.log(
//                       "Error in sending the mail for contact us form",
//                       err
//                     );
//                     res.status(400).json({ err });
//                   });
//               })
//               .catch((err) => {
//                 console.log(
//                   "Error in sending the mail for contact us form",
//                   err
//                 );
//                 res.status(400).json({ err });
//               });
//           })
//           .catch((error) => {
//             console.error("Error uploading files to S3:", error);
//             res.status(500).send({ err: error });
//           });
//       });
//     } catch (error) {
//       console.error("Error in updateInterviewDetails:", error);
//       return res
//         .status(500)
//         .json({ error: "Internal Server Error", status: false });
//     }
//   }
//             let mailTransporter =
//               region === "United States"
//                 ? nodemailer.createTransport({
//                     host: "smtp.office365.com",
//                     port: 587,
//                     secure: false,
//                     auth: {
//                       user: "info@skillstreamjobs.us",
//                       pass: "rsgdtwzstknlblcn",
//                     },
//                   })
//                 : nodemailer.createTransport({
//                     service: "gmail",
//                     auth: {
//                       user: "support@skillstreamjobs.ca",
//                       pass: "yzsz ockc eiql oyqj",
//                     },
//                   });

//             //   HTML for the email
//             const html = `

//                  <!DOCTYPE html>
// <html>
// <head>
//     <title>Interview Completed</title>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             background-color: #ffffff;
//             margin: 0;
//             padding: 0;
//             text-align: center;
//         }
//         .container {
//             background-color: #ffffff;
//             padding: 20px;
//             max-width: 600px;
//             margin: 20px auto;
//             border-radius: 10px;
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }
//         .logo {
//             width: 150px;
//             display: block;
//             margin: 0 auto 15px;
//         }
//         .header {
//             font-size: 22px;
//             font-weight: bold;
//             color: #333;
//             margin-bottom: 15px;
//             text-align: center;
//         }
//         .content {
//             font-size: 16px;
//             color: #333;
//             text-align: left;
//             padding: 10px 20px;
//         }
//         .footer {
//             font-size: 14px;
//             color: #666;
//             margin-top: 15px;
//             text-align: left;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
//         <h2 class="header">Interview Completed</h2>
//         <p class="content">
//             Dear <strong>${candidateName}</strong>,
//         </p>
//         <p class="content">
//             Thank you for completing the interview for the <strong>${jobTitle}</strong> role. We appreciate the time and effort you invested in the process.
//         </p>
//         <p class="content">
//             Our team is currently reviewing your responses, and we will update you on the next steps as soon as possible. If you have any questions in the meantime, please feel free to reach out.
//         </p>
//         <p class="content">
//             We appreciate your interest in joining <strong>${companyName}</strong> and wish you the best of luck!
//         </p>
//         <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
//     </div>
// </body>
// </html>

//                     `;
//             // console.log(email);
//             //   email details
//             let details = {
//               from: `SKILLSTREAM  ${
//                 region === "United States"
//                   ? "info@skillstreamjobs.us"
//                   : "support@skillstreamjobs.ca"
//               }`,
//               to: `${candidateEmail}`,
//               subject: `Interview Update - ${jobTitle} Interview`,
//               html: html,
//               replyTo: email,
//             };

//             //   sending the mail for registeration
//             mailTransporter
//               .sendMail(details)
//               .then(async (info) => {
//                 let mailTransporter =
//                   region === "United States"
//                     ? nodemailer.createTransport({
//                         host: "smtp.office365.com",
//                         port: 587,
//                         secure: false,
//                         auth: {
//                           user: "info@skillstreamjobs.us",
//                           pass: "rsgdtwzstknlblcn",
//                         },
//                       })
//                     : nodemailer.createTransport({
//                         service: "gmail",
//                         auth: {
//                           user: "support@skillstreamjobs.ca",
//                           pass: "yzsz ockc eiql oyqj",
//                         },
//                       });

//                 //   HTML for the email
//                 const html = `
//                    <!DOCTYPE html>
// <html>
// <head>
//     <title>Candidate Interview Completion</title>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//             text-align: center;
//         }
//         .container {
//             background-color: #ffffff;
//             padding: 20px;
//             max-width: 600px;
//             margin: 20px auto;
//             border-radius: 10px;
//             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//         }
//         .logo {
//             width: 150px;
//             margin: 0 auto 15px;
//             display: block;
//         }
//         .header {
//             font-size: 22px;
//             font-weight: bold;
//             color: #333;
//             margin-bottom: 15px;
//             text-align: center;

//         }
//         .content {
//             font-size: 16px;
//             color: #333;
//             text-align: left;
//             padding: 10px 20px;
//         }
//         .button-container {
//             text-align: center;
//             margin-top: 20px;
//         }
//         .button {
//             display: inline-block;
//             background-color: #1e90ff;
//             color: #ffffff;
//             padding: 12px 20px;
//             text-decoration: none;
//             border-radius: 5px;
//             font-size: 16px;
//         }
//         .footer {
//             font-size: 14px;
//             color: #666;
//             margin-top: 15px;
//             text-align: left;
//         }
//     </style>
// </head>
// <body>
//     <div class="container">
//         <img src="https://skill-stream-jobs.s3.us-east-1.amazonaws.com/candidates-image/logo-twos.png" class="logo" alt="Skill Stream AI Logo">
//         <h2 class="header">Candidate Interview Completed</h2>
//         <p class="content">
//             We’re pleased to inform you that the candidate with the email address <strong>${candidateEmail}</strong> has successfully completed all required steps for the <strong>${jobTitle}</strong> position.
//         </p>
//         <div class="button-container">
//             <a href="${videoData.Location}" class="button" style="color: #ffffff !important;">View Video Results</a>
//         </div>
//         <p class="footer">Best regards,<br><strong>Team Skill Stream</strong></p>
//     </div>
// </body>
// </html>

//                         `;
//                 // console.log(email);
//                 const pdfBytes = await createPdf(JSON.parse(summary));
//                 //   email details
//                 let details = {
//                   from: `SKILLSTREAM  ${
//                     region === "United States"
//                       ? "info@skillstreamjobs.us"
//                       : "support@skillstreamjobs.ca"
//                   }`,
//                   to: `${email}`,
//                   subject: `Interview Update - ${jobTitle} Interview`,
//                   html: html,
//                   replyTo: candidateEmail,
//                   attachments: [
//                     {
//                       filename: "Interview_Feedback.pdf",
//                       content: pdfBytes,
//                       contentType: "application/pdf",
//                     },
//                   ],
//                 };

//                 //   sending the mail for registeration
//                 mailTransporter
//                   .sendMail(details)
//                   .then((info) => {
//                     res.status(201).json({
//                       message: "Video & PDF Submitted for Review",
//                       status: true,
//                       videoData,
//                       pdfData,
//                     });
//                   })
//                   .catch((err) => {
//                     console.log(
//                       "Error in sending the mail for contact us form",
//                       err
//                     );
//                     res.status(400).json({ err });
//                   });
//               })
//               .catch((err) => {
//                 console.log(
//                   "Error in sending the mail for contact us form",
//                   err
//                 );
//                 res.status(400).json({ err });
//               });