const express = require("express");
const router = express.Router();
const conatctController = require("../controller/contact");

router.post("/send/details", conatctController.contactUs);
router.post("/submit/resume", conatctController.submitResumes);
router.post("/apply/job", conatctController.easyApply);
router.post("/add/details", conatctController.addDetails);


router.post("/resume/writting", conatctController.resumeWriting);

module.exports = router;
