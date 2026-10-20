const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const authRouter = require("./router/auth");
const forgotPasswordRouter = require("./router/forgotPassword");
const candidateRouter = require("./router/candidate/Candidate");
const employerRouter = require("./router/employer/Employer");
const uploadRouter = require("./router/Upload");
const searchrouter = require("./router/KeywordSearch");
const shortlistedRouter = require("./router/candidate/shortlistedJobs");
const shortlistedResumeRouter = require("./router/employer/shortlistedResume");
const jobsRouter = require("./router/employer/Jobs");
const applyJobRouter = require("./router/candidate/ApplyJobs");
const messageRouter = require("./router/Messages");
const jobAlertsRouter = require("./router/candidate/jobAlerts");
const ParserRouter = require("./router/resumeParser");
const APIRouter = require("./router/apiData");
// const session = require("express-session");
const subscriptionRouter = require("./router/subscriptions");
// const paypalRouter = require("./router/paypal");
const axios = require("axios");
const moment = require("moment");
const socket = require("socket.io");
const bodyParser = require("body-parser");
const contactRouter = require("./router/contact");
const linkedInRouter = require("./router/LinkedIn");
const VideoInterviewRouter = require("./router/VideoInterview");
const practicalInterviewRouter = require("./router/PracticalInterview");
const AIRouter = require("./router/AIFitment");
const superAdminRouter = require("./router/superAdmin");
const VendorRouter = require("./router/vendors");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const codingRoundRouter = require("./router/codingRound");
const reportRoutes = require("./router/report");
const convertResumeRouter = require("./router/convertResume");
// const passport = require("passport");
// require('./config/paasport');
const AzureOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const cookieSession = require("cookie-session");
const crypto = require("crypto");
const nonUserModel = require("./models/nonUsersModel");
const employerModel = require("./models/employerModel");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const openai = new OpenAI();
const multer = require("multer");
const upload = multer();
const { Readable } = require("stream");
const { convert } = require("html-to-text");
const { log } = require("console");
const session = require("express-session");
// const { nanoid } = require('nanoid');
const { v4: uuidv4 } = require("uuid");
const secureRequestLogger = require("./middleware/secureRequestLogger");

// This route must receive the exact raw bytes for Stripe signature verification.
app.post("/api/v1/practiceInterview/payments/webhook",
  express.raw({ type: "application/json" }), require("./services/practiceBilling").webhook);
app.use(express.json());
app.use(bodyParser.json());
const allowedOrigins = [
  process.env.CAWEBSITE,
  process.env.USWEBSITE,
  process.env.INWEBSITE,
  process.env.DEVWEBSITE,
  process.env.SEOWEBSITE,
];
// console.log(process.env.CAWEBSITE, process.env.USWEBSITE);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// const blockedPatterns = [
//   /\.env/,
//   /\.git/,
//   /\.ftpconfig/,
//   /\.sftp/,
//   /\.vscode/,
//   /\.idea/,
//   /sftp\.json/,
//   /phpinfo/,
//   /config\.(js|json|yml|yaml|ini|php|xml)/,
//   /secrets\.(json|yml|yaml|ini)/,
//   /application\.(properties|yml|yaml|json|xml)/,
//   /settings\.py/,
//   /local\.xml/,
//   /sendmail\.cf/,
//   /main\.cf/,
//   /docker-compose\.yml/,
//   /Dockerfile/,
//   /web\.config/,
//   /Telerik\.Web\.UI\.WebResource\.axd/,
// ];

// app.use((req, res, next) => {
//   const path = req.path;

//   // Log all paths
//   console.log("----path---");
//   console.log(path);

//   // // Check and block if path is suspicious
//   // if (blockedPatterns.some((pattern) => pattern.test(path))) {
//   //   console.warn(`Blocked attempt to access: ${path}`);
//   //   return res.status(403).send("Access denied.");
//   // }

//   next();
// });
app.use(secureRequestLogger);
async function generateUniqueOrgId() {
  let unique = false;
  let orgId;

  while (!unique) {
    orgId = crypto.randomBytes(10).toString("hex").slice(0, 10); // You can customize the length, e.g. 10 characters
    const existing = await employerModel.findOne({ organizationId: orgId });
    console.log(orgId);

    if (!existing) {
      unique = true;
    }
  }

  return orgId;
}
// for (let i = 0; i <= 30; i++) {
//   generateUniqueOrgId();
// }
// app.use(express.json({ limit: '100mb' }));
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/codingInterview", codingRoundRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/password", forgotPasswordRouter);
app.use("/api/v1/candidate", candidateRouter);
app.use("/api/v1/employer", employerRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/search/keyword", searchrouter);
app.use("/api/v1/candidate/shortlistJob", shortlistedRouter);
app.use("/api/v1/employer/shortlistResume", shortlistedResumeRouter);
app.use("/api/v1/employer/jobs", jobsRouter);
app.use("/api/v1/candidate/jobs", applyJobRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/candidate/jobAlerts", jobAlertsRouter);
app.use("/api/v1/data", APIRouter);
app.use("/api/v1/contact/email", contactRouter);
app.use("/api/v1/linkedIn", linkedInRouter);
app.use(
  "/api/v1/subscribe",
  bodyParser.raw({ type: "application/json" }),
  subscriptionRouter,
);
app.use("/api/report", reportRoutes); // protect with admin auth
app.use("/api/v1/parser", ParserRouter);
app.use("/api/v1/videoInterview", VideoInterviewRouter);
app.use("/api/v1/practiceInterview", practicalInterviewRouter);
app.use("/api/v1/ai", AIRouter);
app.use("/api/v1/superAdmin", superAdminRouter);
app.use("/api/v1/vendor", VendorRouter);
app.use(
  session({
    secret: process.env.SECRET_KEY, // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` in production if using HTTPS
  }),
);
app.use("/api/resume", convertResumeRouter);
// console.log(process.env.USWEBSITE);

mongoose
  .connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));
require("./config/SubscriptionCronJob");
const wss = new WebSocket.Server({ port: 5002 });

wss.on("connection", (ws) => {
  let filePath = null;
  let audioStream = null;

  ws.on("message", async (message) => {
    let filePath, speechFile, audioStream;
    // console.log(message);

    try {
      const parsedMessage = JSON.parse(message.toString());
      console.log(parsedMessage);

      // Handle Text-to-Speech (TTS)
      const text = parsedMessage.text || "Default text for TTS";
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });
      speechFile = path.join(__dirname, "temp_speech.mp3");
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);
      // Send the generated speech audio file back to the client
      const speechData = fs.readFileSync(speechFile);
      ws.send(speechData);
      // Delete the temporary speech file
      fs.unlink(speechFile, (err) => {
        if (err) console.error("Failed to delete speech file:", err);
      });
    } catch (error) {
      console.error("Error:", error);
      ws.send(JSON.stringify({ error: "Failed to process request" }));
    } finally {
      if (audioStream) audioStream.end();
    }
  });
  ws.on("close", () => {
    if (audioStream) audioStream.end();
  });
});
// const timestamp = Math.floor(Date.now() / 1000);
// console.log(timestamp);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server Listening ${PORT}`);
});

const auth = Buffer.from(
  process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET,
).toString("base64");
const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
app.set("io", io);
// console.log(auth);

global.onlineUsers = new Map();
// const text = "https://skillstreamjobs.ca/job-detail/SKSTE0003/Vivatech001";
io.on("connection", (socket) => {
  // console.log("connected");

  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    console.log("msg send", data);
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      console.log("msg receive", data.msg);
    }
  });
});
// app.post("/remove", async (req, res) => {
//   try {
//     // const result = await nonUserModel.aggregate([
//     //   {
//     //     $match: {
//     //       country: { $regex: /^canada$/i },
//     //     },
//     //   },
//     //   {
//     //     $facet: {
//     //       totalUsers: [
//     //         { $count: "count" }, // total users (with duplicates)
//     //       ],
//     //       uniqueUsers: [
//     //         {
//     //           $group: {
//     //             _id: { $toLower: "$email" },
//     //           },
//     //         },
//     //         {
//     //           $count: "count", // unique emails
//     //         },
//     //       ],
//     //     },
//     //   },
//     // ]);

//     // const total = result[0].totalUsers[0]?.count || 0;
//     // const unique = result[0].uniqueUsers[0]?.count || 0;

//     // console.log("Total users in Canada (with duplicates):", total);
//     // console.log("Unique users in Canada (by email):", unique);
//     // res.status(200).json({ total, unique });

//     const keepUsers = await nonUserModel.aggregate([
//       {
//         $match: {
//           country: { $regex: /^usa$/i },
//         },
//       },
//       {
//         $sort: { createdAt: 1 }, // or { _id: 1 } for old, -1 for recent
//       },
//       {
//         $group: {
//           _id: { $toLower: "$email" },
//           latestId: { $last: "$_id" },
//         },
//       },
//     ]);

//     const idsToKeep = keepUsers.map((u) => u.latestId);
//     console.log(idsToKeep.length);
//     // const deleteResult = await nonUserModel.deleteMany({
//     //   country: { $regex: /^canada$/i },
//     //   _id: { $nin: idsToKeep },
//     // });
//     res.status(200).json({ uniqueCount: idsToKeep.length });
//   } catch (error) {
//     console.log(error);
//   }
// });
// console.log(crypto.randomBytes(32));

// const endpointSecret = "whsec_UTRA4QqeBz8MffFfybeeplCtBHdE6cA6";
// app.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     console.log("header", sig);
//     console.log("body", req.body);

//     // let event;

//     // try {
//     //   const payloadString = JSON.stringify(req.body, null, 2);
//     //   const secret = "whsec_UTRA4QqeBz8MffFfybeeplCtBHdE6cA6";
//     //   event = stripe.webhooks.constructEvent(payloadString, sig, secret);
//     // } catch (err) {
//     //   console.error("Webhook signature verification failed:", err.message);
//     //   return res.status(400).send(`Webhook Error: ${err.message}`);
//     // }

//     // // Handle the event
//     // if (event.type === "checkout.session.completed") {
//     //   const session = event.data.object;
//     //   console.log(session);

//     //   // Retrieve customer ID and subscription ID
//     //   const customerId = session.customer;
//     //   const subscriptionId = session.subscription;

//     //   console.log("Customer ID:", customerId);
//     //   console.log("Subscription ID:", subscriptionId);

//     // Save to your database
//     // Example:
//     // await saveSubscriptionToDatabase({
//     //   userId: session.metadata.userId, // if you include userId in metadata
//     //   customerId,
//     //   subscriptionId,
//     // });

//     res.status(200).send("Success");
//     // } else {
//     //   console.warn(`Unhandled event type ${event.type}`);
//     // }
//   }
// );

// const wss = new WebSocket.Server({ port: 5002 });

// wss.on("connection", (ws) => {
//   const filePath = path.join(__dirname, "temp_audio.mp3");
//   const audioStream = fs.createWriteStream(filePath);
//   console.log("Client connected");

//   ws.on("message", async (message) => {
//     console.log("Receiving audio data");

//     // Append incoming audio data to file
//     if (Buffer.isBuffer(message)) {
//       audioStream.write(message);
//     }

//     // For real-time processing, you might need to handle each chunk, but here we process after receiving all data
//   });

//   ws.on("close", async () => {
//     console.log("Connection closed, processing audio");

//     // Close the audio stream to finish writing
//     audioStream.end();

//     try {
//       const fileStream = fs.createReadStream(filePath);
//       const transcription = await openai.audio.transcriptions.create({
//         file: fileStream,
//         model: "whisper-1",
//         prompt: "you have to convert the text only in English language",
//       });

//       ws.send(JSON.stringify({ text: transcription.text }));
//       console.log("Transcription completed:", transcription.text);

//       // Optionally delete the audio file after processing
//       fs.unlink(filePath, (err) => {
//         if (err) console.error("Failed to delete audio file:", err);
//       });
//     } catch (error) {
//       console.error("Transcription Error:", error);
//       ws.send(JSON.stringify({ error: "Failed to transcribe audio" }));
//     }
//   });
// });

// app.post("/remove", async (req, res) => {
//   try {
//     const database = mongoose.connection.db;
//     // console.log(database.collection);
//     const collection = database.collection("nonusers_resumes");

//     const skillVariations = [
//       "Mongo",
//       "Mongo DB",
//       "MongoDB",
//       "Mongodb",
//       "No SQL – MongoDB",
//       "No-SQL",
//       "NoSQL (MongoDB)",
//       "NoSQL MongoDB",
//     ];
//     const updatedSkill = "MongoDB";

//     // Update all documents where skills contain any of the variations
//     const result = await collection.updateMany(
//       { skills: { $in: skillVariations } }, // Find documents containing variations
//       {
//         $set: {
//           "skills.$[elem]": updatedSkill, // Set the matching array element to the updated skill
//         },
//       },
//       {
//         arrayFilters: [
//           { elem: { $in: skillVariations } }, // Apply the update only to elements in skills that match
//         ],
//       }
//     );
//     const allDocuments = await collection
//       .aggregate([
//         { $unwind: "$skills" }, // Splits the array into individual skill entries
//         { $group: { _id: "$skills" } }, // Groups by each unique skill
//         { $sort: { _id: 1 } }, // Sorts the skills alphabetically
//       ])
//       .toArray();
//     const allSkills = allDocuments.map((doc) => doc._id);
//     // const allDocuments = await collection
//     //   .find({ email: { $ne: null } })
//     //   .toArray();
//     // const seenEmails = new Set();
//     // const duplicates = [];

//     // allDocuments.forEach((doc) => {
//     //   if (seenEmails.has(doc.name)) {
//     //     duplicates.push(doc._id);
//     //   } else {
//     //     seenEmails.add(doc.name);
//     //   }
//     // });
//     // console.log(duplicates.length);
//     // if (duplicates.length > 0) {
//     //   const deleteusers = await collection.deleteMany({
//     //     _id: { $in: duplicates },
//     //   });
//     //   console.log(deleteusers);
//     // }
//     res.status(200).json({
//       updatedSkill,
//       allSkills,
//       skills: allSkills.length,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error });
//   }
// });

// app.use(passport.initialize());
// app.use(passport.session()); // Enables session support

// // app.get("/auth/microsoft", passport.authenticate("azure_ad_oauth2"));

// // app.get(
// //   "/api/v1/microsoft/auth/callback",
// //   passport.authenticate("azure_ad_oauth2", { failureRedirect: "/" }),
// //   (req, res) => {
// //     res.redirect("http://localhost:3000");
// //   }
// // );
// // passport.use(
// //   new AzureOAuth2Strategy(
// //     {
// //       clientID: process.env.MICROSOFT_CLIENT_ID,
// //       clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
// //       callbackURL: "http://localhost:8080/api/v1/microsoft/auth/callback",
// //       authorizationURL:
// //         "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
// //       tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
// //       scope: ["https://graph.microsoft.com/user.read"],
// //     },
// //     async (accessToken, refreshToken, params, profile, done) => {
// //       try {
// //         // console.log("Access Token:", accessToken);
// //         const userInfo = await axios.get(
// //           "https://graph.microsoft.com/v1.0/me",
// //           {
// //             headers: { Authorization: `Bearer ${accessToken}` },
// //           }
// //         );
// //         console.log(userInfo.data);

// //         return done(null, userInfo.data);
// //       } catch (error) {
// //         console.error(
// //           "Error fetching user info:",
// //           error.response?.data || error.message
// //         );

// //         return done(error, null);
// //       }
// //     }
// //   )
// // );
// passport.serializeUser((user, done) => {
//   done(null, user); // Store user in session
// });

// passport.deserializeUser((user, done) => {
//   done(null, user); // Retrieve user from session
// });
