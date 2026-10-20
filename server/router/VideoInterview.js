const express = require("express");
const router = express.Router();
const {
  resumeJobText,
  introText,
  generateQuestions,
  analyseInterview,
  audioTranscription,
  textToSpeech,
  updateInterviewDetails,
  sendInterviewMail,
  USsendInterviewMail,
  CodingExecution,
  sendCodingInterviewMail,
  CodingResumeJobText,
  CodingGenerateQuestions,
  CodingAnalyse,
  getLiveStatus,
  pushCandidateLiveStatus,
  // getLink,
} = require("../controller/VideoInterview");

router.post("/upload", resumeJobText);
router.post("/startInterview", introText);
router.post("/genrate/question", generateQuestions);
router.post("/analyse", analyseInterview);
router.post("/transcribe", audioTranscription);
router.post("/textToSpeech", textToSpeech);
router.post("/uploadVideo/:userId/:jobId/:candidateId", updateInterviewDetails);
router.post("/sendEmail/:userId/:jobId/:candidateId", sendInterviewMail);
router.post("/us/sendEmail/:userId/:jobId/:candidateId", USsendInterviewMail);
router.post("/coding/execution", CodingExecution);
router.post("/upload/details", CodingResumeJobText);
router.post(
  "/coding/sendemail/:userId/:jobId/:candidateId",
  sendCodingInterviewMail,
);
router.post("/coding/generate/questions", CodingGenerateQuestions);
router.post("/coding/analyse/:userId/:jobId/:candidateId", CodingAnalyse);
router.get("/liveStatus/:userId/:jobId/:candidateId", getLiveStatus);
router.post("/pushStatus/:userId/:jobId/:candidateId", pushCandidateLiveStatus);
module.exports = router;
