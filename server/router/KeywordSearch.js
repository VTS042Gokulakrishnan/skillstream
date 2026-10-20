const express = require("express");
const router = express.Router();
const searchController = require("../controller/KeywordSearch");
const { Authorization } = require("../middleware/auth");

router.post(
  "/candidate",
  Authorization,
  searchController.candidateKeywordSearch
);
router.post("/employer", searchController.employerKeywordSearch);
router.post("/employer/jobs", searchController.jobsKeywordSearch);
router.post(
  "/ai/search/candidate",
  Authorization,
  searchController.AIResumeSearch
);
router.post("/ai/search/jobs/:userId", searchController.AIJobSearch);
router.post("/global/search", searchController.globalSearch);

module.exports = router;
