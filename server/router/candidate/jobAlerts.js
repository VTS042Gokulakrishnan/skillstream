const express = require("express");
const router = express.Router();
const JobAlertsController = require("../../controller/candidate/jobAlerts");

const { Authorization } = require("../../middleware/auth");

router.get("/get/:userId/:role", JobAlertsController.getAllJobAlerts);
router.delete(
  "/delete/:userId/:jobId/:role",
  JobAlertsController.deleteAppliedJobs
);

module.exports = router;
