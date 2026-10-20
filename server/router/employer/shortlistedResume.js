const express = require("express");
const router = express.Router();
const employerController = require("../../controller/employer/shortlistedResumes");
const { Authorization } = require("../../middleware/auth");

router.post(
  "/add/:userId",
  Authorization,
  employerController.shortlistedResumes
);
router.get(
  "/view/:userId",
  Authorization,
  employerController.getShortlistedResume
);
router.delete(
  "/delete/:jobId/:userId/:candidateId",
  Authorization,
  employerController.deleteShortlistedResume
);
module.exports = router;
