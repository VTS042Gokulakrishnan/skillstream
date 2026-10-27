const express = require("express");
const router = express.Router();
const {
  resumeJobText,
  introText,
  generateQuestions,
  analyseInterview,
  getPracticalInterview,
  updateInterviewDetails,
  deletePracticalInterview,
  codingGenerateQuestions,
  codingAnalyseInterview,
  deleteCodingPracticalInterview,
  getCodingPracticalInterview,
  //   audioTranscription,
  //   textToSpeech,
  //   updateInterviewDetails,
  //   sendInterviewMail,
  // getLink,
} = require("../controller/PracticalInterview");
const { Authorization } = require("../middleware/auth");
const payments = require("../controller/practicePayments");
const { requireSession } = require("../services/practiceSessions");

router.get("/plans", payments.catalog);
router.use(Authorization, payments.candidateOnly);
router.get("/access", payments.status);
router.post("/payments/checkout", payments.checkout);
router.post("/payments/verify", payments.verify);
router.post("/sessions", payments.begin);
router.post("/sessions/:sessionId/cancel", payments.cancel);
router.post("/upload", requireSession(null), resumeJobText);
router.post("/startInterview", requireSession("video", "start"), introText);
router.post("/genrate/question", requireSession("video", "questions"), generateQuestions);
// Legacy analysis bypass is retired; paid sessions submit through update/details.
router.post("/analyse", (req, res) => res.status(410).json({ message: "Please use Practice Assessment." }));
router.post("/update/details/:userId", payments.ownerOnly, requireSession("video", "submit"), updateInterviewDetails);
router.delete("/delete/interview/:userId/:videoId", payments.ownerOnly, deletePracticalInterview);
router.get("/getInterview/:userId", payments.ownerOnly, getPracticalInterview);

//coding interview
router.post("/genrate/coding/question", requireSession("coding", "start"), codingGenerateQuestions);
router.post("/coding/update/details/:userId", payments.ownerOnly, requireSession("coding", "submit"), codingAnalyseInterview);
router.delete(
  "/delete/coding/interview/:userId/:videoId",
  payments.ownerOnly,
  deleteCodingPracticalInterview
);
router.get("/get/coding/interview/:userId", payments.ownerOnly, getCodingPracticalInterview);
// router.post("/transcribe", audioTranscription);
// router.post("/textToSpeech", textToSpeech);
// router.post("/uploadVideo/:userId/:jobId/:candidateId", updateInterviewDetails);
// router.post("/sendEmail/:userId/:jobId/:candidateId", sendInterviewMail);

module.exports = router;
