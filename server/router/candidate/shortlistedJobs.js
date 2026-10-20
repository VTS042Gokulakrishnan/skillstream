const express = require("express");
const router = express.Router();
const candidateController = require("../../controller/candidate/shortlistedJobs");
const { Authorization } = require("../../middleware/auth");

router.post("/add/:userId", candidateController.shortlistedJobs);
router.get("/view/:userId/:role", candidateController.getShortlistedJobs);
router.delete(
  "/delete/:userId/:jobId/:role",
  candidateController.deleteShortlistedJobs
);
module.exports = router;
