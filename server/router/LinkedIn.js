const express = require("express");
const router = express.Router();
const linkedinController = require("../controller/Linkedin");
const { Authorization } = require("../middleware/auth");

router.get("/auth/login", linkedinController.signInWithLinkedIn);
router.get("/auth/linkedin/callback", linkedinController.callBack);
router.get("/us/auth/linkedin/callback", linkedinController.UScallBack);
router.get("/in/auth/linkedin/callback", linkedinController.InCallBack);

router.post("/post/job/:userId", linkedinController.linkedinPost);
router.post("/update/login/:userId", linkedinController.updateLoggedIn);

module.exports = router;
