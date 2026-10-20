const express = require("express");
const router = express.Router();
const jobsController = require("../../controller/employer/Jobs");
const getAllApplicantController = require("../../controller/employer/allApplicants");
const { Authorization } = require("../../middleware/auth");

router.post("/post/:userId", Authorization, jobsController.postJob);
router.post("/us/post/:userId", jobsController.USpostJob);
router.post("/post/edit/:userId", Authorization, jobsController.editPostJob);

router.get("/alljobs/:country", jobsController.getAllJobs);
router.get("/all-jobs/:country", jobsController.getJobs);
router.get("/get/:userId/:access", jobsController.getPostedJob);
router.get(
  "/get/:userId/:access/:organisationId",
  jobsController.getPostedJobByAdmin
);

router.get("/singleJob/:userId/:jobId", jobsController.getPostedJobByID);
router.delete(
  "/delete/:userId/:jobId",
  Authorization,
  jobsController.deletePostedJob
);
router.post("/check", jobsController.check);
router.get(
  "/allApplicants/:userId/:access",
  Authorization,
  getAllApplicantController.getAllApplicants
);
router.get(
  "/allApplicants/:userId/:access/:organisationId",
  Authorization,
  getAllApplicantController.getAdminApplicants
);
router.get(
  "/applicants/filter/:userId/:jobId",
  Authorization,
  getAllApplicantController.getApplicantsByUserAndJob
);
router.post(
  "/openAI/analyse/:userId/:jobId/:candidateId",
  Authorization,
  getAllApplicantController.fitmentAnalysis
);
router.post(
  "/openAI/aiResume/analyse/:userId/:jobId/:candidateId",
  Authorization,
  getAllApplicantController.analyseCandidate
);
router.delete(
  "/applicants/delete/:userId/:jobId/:candidateId",
  Authorization,
  getAllApplicantController.deleteApplicants
);
router.post(
  "/status/:userId/:jobId",
  Authorization,
  jobsController.statusChange
);
router.post(
  "/add/user/:employerId/:jobId",
  Authorization,
  jobsController.addCandidateToJob
);
router.post(
  "/application/status/:employerId/:candidateId/:jobId",
  Authorization,
  jobsController.jobApplicationApproval
);

module.exports = router;
