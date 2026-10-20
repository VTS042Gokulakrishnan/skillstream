const nodemailer = require("nodemailer");
const candidateModel = require("../models/candidateModel");
const employerModel = require("../models/employerModel");
const nonUserModel = require("../models/nonUsersModel");
const Aws = require("aws-sdk");
const formidable = require("formidable");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const AdmZip = require("adm-zip");
// const OpenAI = require("openai");
// const openai = new OpenAI();
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const path = require("path");
const unzipper = require("unzipper");
const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});

const { GoogleGenAI } = require("@google/genai");

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash";
const AUDIO_MODEL = process.env.GEMINI_AUDIO_MODEL || "gemini-3.6-flash";
const TTS_MODEL =
  process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";

function getGeminiError(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Gemini request failed"
  );
} 

function getUploadedFile(file) {
  return Array.isArray(file) ? file[0] : file;
}

function pcmToWav(pcmBuffer, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

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

const JSON5 = require("json5");
async function uploadToS3(filePath, s3Key, links) {
  const fileStream = fs.createReadStream(filePath);
  const fileExt = path.extname(filePath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
    Key: s3Key,
    Body: fileStream,
    ACL: "public-read-write",
    ContentType: fileExt,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        links.push(data.Location);
        resolve(data);
      }
    });
  });
}
async function uploadToS3Single(fileStream, Key, parsedData, fileExt) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
    Key: Key,
    Body: fileStream,
    ACL: "public-read-write",
    ContentType: fileExt,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, async (error, data) => {
      if (error) {
        reject(error);
      } else {
        const storeData = await nonUserModel.create({
          name: parsedData?.basic_info?.full_name,
          email: parsedData?.basic_info?.email,
          phone_number: parsedData?.basic_info?.phone_number,
          country: parsedData?.basic_info?.Country,
          city: parsedData?.basic_info?.City,
          resume: data.Location,
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
        });
        resolve(data);
      }
    });
  });
}
async function processResume(file) {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file));

    const { data } = await axios.post(
      `http://127.0.0.1:5001/upload`,
      formData,
      {
        headers: { ...formData.getHeaders() },
      }
    );
    console.log("parsing completed");

    return data;
  } catch (error) {
    console.error("Error In NLP PARSER :", error.message);
    console.log("error");

    throw new Error("Failed to parse resume");
  }
}
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
const controller = {
  async reumeParserAI(req, res) {
    try {
      const requestTime = new Date();

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
          const fileBuffer = fs.readFileSync(files.file.filepath);
          const fileExt = files.file.mimetype;
          const fileStream = fs.createReadStream(files.file.filepath);
          console.log(fileExt);

          const uploadedFiles = Array.isArray(files.file)
            ? files.file
            : [files.file]; // Handle single/multiple
          try {
            const results = [];
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
              parsedData = data;
            } catch (axiosError) {
              console.error("Error calling Python API:", axiosError.message);
              return res
                .status(500)
                .json({ message: "Failed to parse resume", status: false });
            }

            let content;
            // if (fileExt === "application/msword") {
            //   content =
            //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            // } else if (fileExt === "application/pdf") {
            //   content = "application/pdf";
            // } else if (
            //   fileExt ===
            //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            // ) {
            //   content =
            //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            // }
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
              Key: files.file.newFilename, // Name of the image
              Body: fileStream, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: fileExt, // Necessary to define the image content-type to view the photo in the browser with the link
            };
            s3.upload(params, async (error, data) => {
              if (error) {
                console.log(error);
                res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
              } else {
                console.log(parsedData);
                console.log(data);
                const storeData = await nonUserModel.create({
                  name: parsedData?.basic_info?.full_name,
                  email: parsedData?.basic_info?.email,
                  phone_number: parsedData?.basic_info?.phone_number,
                  country: parsedData?.basic_info?.Country,
                  city: parsedData?.basic_info?.City,
                  resume: data?.Location,
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
                });
                const responseTime = new Date();
                const timeTaken = responseTime - requestTime;
                const storeResponse = await aiRequestModel.create({
                  apiRoute: req.originalUrl,
                  aiRoute: "/parse_resume",
                  request: data?.Location,
                  response: data,
                  version: "1.1.0",
                  requestTime,
                  responseTime,
                  timeTaken: formatTimeTaken(timeTaken),
                });
                res.status(200).json({
                  message: "Resume uploaded Successfully",
                  status: true,
                });
              }
            });
          } catch (axiosError) {
            console.log("Error in resumeParserAI function:", axiosError);
            res
              .status(500)
              .json({ message: "Internal Server Error", status: false });
          }
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error, status: false });
    }
  },
  async resumeParserAIMultiple(req, res) {
    // const requestTime = new Date();

    const form = formidable({
      multiples: true,
      keepExtensions: true,
      useTempFiles: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", status: false });
      }

      const uploadedFiles = Array.isArray(files.file)
        ? files.file
        : [files.file];

      if (uploadedFiles.length === 0) {
        return res
          .status(400)
          .json({ message: "No file uploaded", status: false });
      }

      try {
        const processFiles = uploadedFiles.map(async (file) => {
          console.log("Parsing:", file.originalFilename);

          // Stream for parsing
          const parseStream = fs.createReadStream(file.filepath);
          const formData = new FormData();
          formData.append("file", parseStream);

          const { data } = await axios.post(
            `${process.env.AI_URL}/parse_resume`,
            formData,
            {
              headers: formData.getHeaders(),
            }
          );
          console.log("Parsed:", file.originalFilename);

          // New stream for uploading
          const uploadStream = fs.createReadStream(file.filepath);
          await uploadToS3Single(
            uploadStream,
            file.originalFilename,
            data,
            file.mimetype
          );
          console.log("Uploaded to S3:", file.originalFilename);

          // Delete the file
          fs.unlinkSync(file.filepath);
        });

        // Wait for all files to finish processing
        await Promise.all(processFiles);
        // const responseTime = new Date();
        // const timeTaken = responseTime - requestTime;
        // const storeResponse = await aiRequestModel.create({
        //   apiRoute: req.originalUrl,
        //   aiRoute: "/parse_resume",
        //   request: formData,
        //   response: data,
        //   version: "1.1.0",
        //   requestTime,
        //   responseTime,
        //   timeTaken: formatTimeTaken(timeTaken),
        // });
        return res.status(200).json({
          message: "Resume(s) uploaded successfully",
          status: true,
        });
      } catch (error) {
        console.error("Error processing resumes:", error);
        return res
          .status(500)
          .json({ message: "Failed to process resumes", status: false });
      }
    });
  },
  async resumeParserNLP(req, res) {
    try {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
        maxFileSize: 30 * 1024 * 1024 * 1024, // 2GB
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
          return;
        }

        if (!files.file || files.file.length === 0) {
          res.status(400).json({ message: "No file uploaded", status: false });
          return;
        }

        try {
          const zip = new AdmZip(files.file.filepath);
          const outputDir = "resumes";

          // Ensure the output directory exists
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          // Extract all files to the output directory
          zip.getEntries().forEach((entry) => {
            if (!entry.isDirectory) {
              const filePath = path.join(outputDir, entry.entryName);
              zip.extractEntryTo(entry, outputDir, false, true);
            }
          });
          let links = [];
          // Process and upload each file to S3

          const filesArray = fs.readdirSync(outputDir);

          const uploadPromises = filesArray.map(async (fileName) => {
            const filePath = path.join(outputDir, fileName);
            const s3Key = fileName;

            // Upload file to S3
            await uploadToS3(filePath, s3Key, links);

            // Delete the file from the output directory
            await deleteFile(filePath);
          });
          // Wait for all uploads and deletions to complete
          await Promise.all(uploadPromises);
          console.log("parsing....");
          let parseData;
          try {
            parseData = await processResume(files.file.filepath);
          } catch (error) {
            return res
              .status(500)
              .json({ message: error.message, status: false });
          }
          if (!parseData || parseData.length === 0) {
            return res
              .status(400)
              .json({ message: "Parsing failed", status: false });
          }
          // console.log(parseData);
          console.log("parsed Success");

          const s3LinkMap = links.reduce((acc, link) => {
            // Extract the filename from the URL
            const filename = link.split("/").pop();
            acc[filename] = link;
            return acc;
          }, {});
          console.log("Uploaded to s3");
          console.log("Merging Started to DB");

          const mergedData = parseData.map((data) => {
            const filename = data.file_name;
            return {
              name: data.name,
              email: data.email,
              phone_number: data.contact_number,
              country: data.country,
              state: "Not Availabe",
              jobTitle: data.job_title,
              skills: data.skills,
              resume: s3LinkMap[filename] || null,
              education: data.Education,
              // ...data
            };
          });
          console.log("Merging completed to DB");
          if (mergedData) {
            const storeData = await nonUserModel.insertMany(mergedData);
            res.status(200).json({
              message: "Resumes uploaded and processed successfully",
              status: true,
              mergedData,
              // links,
            });
          } else {
            res
              .status(400)
              .json({ message: "Error in merge data", status: false });
          }
        } catch (axiosError) {
          console.log("Error in resumeParserNLP function:", axiosError);
          res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message, status: false });
    }
  },
  async generateJobDescription(req, res) {
    const { jobTitle } = req.body;

    if (!jobTitle?.trim()) {
      return res.status(400).json({ message: "jobTitle is required", status: false });
    }

    const prompt = `Generate a detailed job description for a ${jobTitle} position.

Provide a concise textual overview of the position in jobDescription.
List key responsibilities and mandatory requirements as bullet points in keySkills_responsibilities.
In the skills array, include only technical skills that are absolutely mandatory as per the job requirements.
Do not include soft skills, optional skills, nice-to-have skills, or inferred skills.
Each skill must be a single, canonical, lower-case term such as "java", "spring boot", or "docker".
Fill every field and return JSON only.`;

    try {
      const response = await gemini.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              jobDescription: { type: "string" },
              keySkills_responsibilities: {
                type: "array",
                items: { type: "string" },
              },
              skills: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: [
              "jobDescription",
              "keySkills_responsibilities",
              "skills",
            ],
          },
        },
      });

      const jobDescriptionData = JSON.parse(response.text);
      return res.status(200).json(jobDescriptionData);
    } catch (error) {
      const message = getGeminiError(error);
      console.error("Error generating job description with Gemini:", message);
      return res.status(500).json({ message, status: false });
    }
  },

  async getSkillsFromDescription(req, res) {
    const { jobTitle, jobDescription } = req.body;

    if (!jobDescription?.trim()) {
      return res
        .status(400)
        .json({ message: "jobDescription is required", status: false });
    }

    const prompt = `Given the following job description for a ${jobTitle || "specified"} role,
extract only mandatory technical skills explicitly required in the description.

Every skill must be a canonical lower-case term suitable for exact MongoDB filtering.
Do not include generic words, soft skills, optional skills, nice-to-have skills, or inferred skills.

Job Description:
${jobDescription}`;

    try {
      const response = await gemini.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["skills"],
          },
        },
      });

      const parsed = JSON.parse(response.text);
      return res.status(200).json({ skills: parsed.skills });
    } catch (error) {
      const message = getGeminiError(error);
      console.error("Error extracting skills with Gemini:", message);
      return res.status(500).json({ message, status: false });
    }
  },

  async generatelinkedInPost(req, res) {
    const { JobTitle, companyName, city, country, state, jobUrl } = req.body;

    if (!JobTitle || !companyName || !jobUrl) {
      return res.status(400).json({
        message: "JobTitle, companyName, and jobUrl are required",
        status: false,
      });
    }

    const prompt = `Write a polished LinkedIn hiring post using these details:
Job title: ${JobTitle}
Company: ${companyName}
Location: ${city}, ${state}, ${country}
Application URL: ${jobUrl}

Include a short opportunity overview, position details, a clear call to apply,
a referral/share request, and relevant professional hashtags. Return plain text only.`;

    try {
      const response = await gemini.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
      });

      return res.status(200).json({ text: response.text.trim() });
    } catch (error) {
      const message = getGeminiError(error);
      console.error("Error generating LinkedIn post with Gemini:", message);
      return res.status(500).json({ message, status: false });
    }
  },

async speechToText(req, res) {
  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (error, fields, parsedFiles) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          fields,
          files: parsedFiles,
        });
      });
    });

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!uploadedFile?.filepath) {
      return res.status(400).json({
        message: "No file uploaded",
        status: false,
      });
    }

    const audioBase64 = await fs.promises.readFile(
      uploadedFile.filepath,
      {
        encoding: "base64",
      }
    );

    const response = await gemini.models.generateContent({
      model: AUDIO_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: uploadedFile.mimetype || "audio/webm",
                data: audioBase64,
              },
            },
            {
              text: [
                "Transcribe this audio accurately.",
                "Return only the spoken text.",
                "Do not include commentary, labels, timestamps, or markdown.",
              ].join(" "),
            },
          ],
        },
      ],
    });

    const transcription = response.text?.trim();

    if (!transcription) {
      throw new Error("Gemini returned an empty transcription");
    }
console.log("Transcription completed:", transcription)
    return res.status(200).json({
      text: transcription,
      status: true,
    });
  } catch (error) {
    const message = getGeminiError(error);

    console.error("Gemini speech-to-text error:", message);

    return res.status(500).json({
      message,
      status: false,
    });
  }
},

  async textToSpeech(req, res) {
    try {
      const { textInput } = req.body;

      if (!textInput?.trim()) {
        return res
          .status(400)
          .json({ message: "textInput is required", status: false });
      }

      const response = await gemini.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text: textInput }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data
      );

      if (!audioPart?.inlineData?.data) {
        throw new Error("Gemini returned no audio data");
      }

      const pcmBuffer = Buffer.from(audioPart.inlineData.data, "base64");
      const wavBuffer = pcmToWav(pcmBuffer);

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", wavBuffer.length);

      console.log("TTS Completed") 
      return res.status(200).send(wavBuffer);
    } catch (error) {
      const message = getGeminiError(error);
      console.error("Gemini text-to-speech error:", message);
      return res.status(500).json({ message, status: false });
    }
  },
};
module.exports = controller;

// for (const zipEntry of zipEntries) {
//   const tempPath = `/tmp/${zipEntry.entryName}`;
//   fs.writeFileSync(tempPath, zipEntry.getData());

//   const data = await processResume(tempPath);
//   const s3Link = await uploadToS3(tempPath, zipEntry.header.fileName, zipEntry.entryName);

//   data.resume = s3Link; // Add the S3 URL to the parsed data object

//   // const storedData = await nonUserModel.create({
//   //   name: data.basic_info.full_name,
//   //   email: data.basic_info.email,
//   //   phone_number: data.basic_info.phone_number,
//   //   country: data.basic_info.Country,
//   //   state: data.basic_info.Province,
//   //   resume: data.resume, // Store the S3 URL
//   //   experience: data.basic_info.Experience_in_Years,
//   //   jobTitle: data.basic_info.Job_Title,
//   //   linkedin_url: data.basic_info.linkedin_url,
//   //   technical_expertise_in_skills: data.basic_info.technical_expertise_in_skills,
//   //   Experience_level: data.basic_info.Experience_level,
//   //   skills: data.skills,
//   //   Education: data.Education,
//   //   work_experience: data.work_experience,
//   // });
// }
//   async generateJobDescription(req, res) {
//     const { jobTitle } = req.body;
//     const prompt = `Generate a detailed job description for a ${jobTitle} position.
// Provide a concise textual overview of the position in jobDescription.
// List key responsibilities and mandatory requirements as bullet points in keySkills_responsibilities.
// In the skills array, include only technical skills that are absolutely mandatory as per the job requirements.
// Do NOT include soft skills (e.g., problem solving, communication, adaptability, teamwork, leadership, clean code).
// Do NOT include optional, nice-to-have, or inferred skills—only those clearly required according to the job description.
// Each skill must be a single, canonical, lower-case term (such as "java", "spring boot", "docker").
// Respond only in this exact JSON format:
// {
//   "jobDescription": "<Brief overview of the position>",
//   "keySkills_responsibilities": [
//     "<Bullet point 1>",
//     "<Bullet point 2>",
//     "<Bullet point 3>"
//   ],
//   "skills": ["<mandatory_skill_1>", "<mandatory_skill_2>"]
// }
// Fill all three sections. Do NOT leave any section blank and do NOT include content outside the JSON format.
// Role: ${jobTitle}`;

//     try {
//       const { data } = await axios.post(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           model: "gpt-4o-mini",
//           messages: [{ role: "user", content: prompt }],
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           },
//         }
//       );
//       let resumeText = data.choices[0].message.content.trim();

//       // Attempt to extract JSON object from text
//       const jsonStart = resumeText.indexOf("{");
//       const jsonEnd = resumeText.lastIndexOf("}") + 1;

//       if (jsonStart === -1 || jsonEnd === -1) {
//         throw new Error("No JSON found in the response");
//       }

//       let jsonString = resumeText.slice(jsonStart, jsonEnd);

//       // Try parsing the extracted string
//       let jobDescriptionData;
//       try {
//         jobDescriptionData = JSON.parse(jsonString);
//       } catch (parseError) {
//         console.error("Failed to parse JSON:", parseError);
//         throw new Error("Failed to parse response as JSON");
//       }

//       res.status(200).json(jobDescriptionData);
//     } catch (error) {
//       console.error(
//         "Error generating job description:",
//         error.response ? error.response.data : error.message
//       );
//       res.status(500).json({
//         message: error.response ? error.response.data : error.message,
//         status: false,
//       });
//     }
//   },
//   async getSkillsFromDescription(req, res) {
//     const { jobTitle, jobDescription } = req.body;

//     const prompt = `Given the following job description for a ${jobTitle} role:
// Extract a concise list of only the mandatory technical skills that are explicitly required in the job description.
// Every skill must be a single, canonical, boolean-friendly, lower-case term (e.g., "python", "react", "aws").
// Do NOT include phrases, generic words, ambiguous or compound expressions, soft skills (such as problem solving, teamwork, communication, leadership, etc.), or any secondary, optional, or nice-to-have skills.
// Only include skills that are clearly listed in the required section of the job description.
// Do NOT infer or add skills that are not explicitly stated in the JD.
// Your goal is to ensure these skills can be used as keys for precise, boolean-based MongoDB filtering and maximum resume extraction.
// Do not set a minimum or maximum number of skills; extract only as many or as few as are strictly needed by the job description.
// Respond only in the following JSON format, with all skill names in lower case:
// {
//   "skills": ["skill1", "skill2", "skill3"]
// }
// Job Description:
// ${jobDescription}
// `;

//     try {
//       const { data } = await axios.post(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           model: "gpt-4o-mini",
//           messages: [{ role: "user", content: prompt }],
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           },
//         }
//       );

//       const aiResponse = data.choices[0].message.content.trim();

//       const jsonStart = aiResponse.indexOf("{");
//       const jsonEnd = aiResponse.lastIndexOf("}") + 1;

//       if (jsonStart === -1 || jsonEnd === -1) {
//         throw new Error("No JSON found in the response");
//       }

//       const jsonString = aiResponse.slice(jsonStart, jsonEnd);

//       let parsed;
//       try {
//         parsed = JSON.parse(jsonString);
//       } catch (err) {
//         console.error("JSON parse error:", err);
//         throw new Error("Failed to parse OpenAI response as JSON");
//       }
//       console.log(parsed);

//       res.status(200).json({ skills: parsed.skills });
//     } catch (error) {
//       console.error(
//         "Error extracting skills:",
//         error.response ? error.response.data : error.message
//       );
//       res.status(500).json({
//         message: error.response ? error.response.data : error.message,
//         status: false,
//       });
//     }
//   },
//   async generatelinkedInPost(req, res) {
//     try {
//       const { JobTitle, companyName, city, country, state, jobUrl } = req.body;

//       const prompt = `🔹 Now Hiring: ${JobTitle} | ${companyName} | ${city},${state}, ${country}
// A rewarding career opportunity is available for an accomplished ${JobTitle} with ${companyName}, based in ${city},${state}, ${country}.
// Position Information:
// Title: ${JobTitle}
// Company: ${companyName}
// Location: ${city},${state}, ${country}
// Interested candidates can learn more and apply here: ${jobUrl}
// If you or someone in your network is ready to take the next step in their career, don’t miss out on this opportunity. Referrals are welcome—let’s connect talent with opportunity!
// #hiring #jobopening #${JobTitle} #careers #jobs #${companyName} #jobsearch #nowhiring #${city}jobs #${country}jobs #${city}careers #${country}careers #opportunity #applynow #talentacquisition #recruitment
// 💡 Looking for a new challenge or know a professional fit in the region? Tag someone who should see this or share with your network to help spread the word!
// `;

//       const { data } = await axios.post(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           model: "gpt-4o-mini",
//           messages: [{ role: "user", content: prompt }],
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           },
//         }
//       );

//       const rawText = data.choices[0].message.content.trim();
//       console.log(rawText);

//       // Optional cleanup/formatting (for plain text use):
//       const formattedText = rawText.replace(/\r?\n/g, "\n").trim();

//       res.status(200).json({ text: formattedText });
//     } catch (error) {
//       console.error(
//         "Error generating LinkedIn post:",
//         error.response ? error.response.data : error.message
//       );
//       res.status(500).json({
//         message: error.response ? error.response.data : error.message,
//         status: false,
//       });
//     }
//   },
//   async speechToText(req, res) {
//     try {
//       const form = formidable({
//         multiples: true,
//         keepExtensions: true,
//         useTempFiles: true,
//       });
//       await form.parse(req, async (err, fields, files) => {
//         if (!files.file) {
//           res.status(400).json({ message: "No file uploaded", status: false });
//           return; // Return early to avoid further processing
//         } else if (err) {
//           console.error(err); // Log the error for debugging purposes
//           res
//             .status(500)
//             .json({ message: "Internal Server Error", status: false });
//           return; // Return early on error
//         } else {
//           // const fileBuffer = files.file;
//           // console.log(files.file);
//           // console.log(files.file);
//           const fileStream = fs.createReadStream(files.file.filepath);
//           const transcription = await openai.audio.transcriptions.create({
//             file: fileStream,
//             model: "whisper-1",
//           });
//           console.log(transcription.text);

//           res.status(200).json({ text: transcription.text, status: true });
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         message: error.response ? error.response.data : error.message,
//         status: false,
//       });
//     }
//   },
//   async textToSpeech(req, res) {
//     try {
//       const { textInput } = req.body;
//       console.log(textInput);

//       const mp3 = await openai.audio.speech.create({
//         model: "tts-1",
//         voice: "alloy",
//         input: textInput,
//       });
//       speechFile = path.join(__dirname, "temp_speech.mp3");
//       const buffer = Buffer.from(await mp3.arrayBuffer());
//       await fs.promises.writeFile(speechFile, buffer);
//       // Send the generated speech audio file back to the client
//       const speechData = fs.readFileSync(speechFile);
//       console.log("send");

//       res.setHeader("Content-Type", "audio/mpeg");
//       res.send(buffer);
//       // Delete the temporary speech file
//       fs.unlink(speechFile, (err) => {
//         if (err) console.error("Failed to delete speech file:", err);
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({
//         message: error.response ? error.response.data : error.message,
//         status: false,
//       });
//     }
//   },