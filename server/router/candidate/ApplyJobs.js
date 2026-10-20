const express = require("express");
const router = express.Router();
const applyJobController = require("../../controller/candidate/Applyjobs");
const { Authorization } = require("../../middleware/auth");

router.post("/applyJob/:userId/:employerId", applyJobController.applyJob);
router.get("/getJob/:userId", applyJobController.getAllAppliedJobs);
router.delete(
    "/delete/:userId/:jobId",
    applyJobController.deleteAppliedJobs
  );

module.exports = router;
