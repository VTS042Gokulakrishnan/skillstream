const express = require("express");
const router = express.Router();
const messageController = require("../controller/Messages");
const { Authorization } = require("../middleware/auth");

router.post("/send", messageController.addMessages);
router.post("/get", messageController.getMessages);
// router.get("/users/:role", messageController.getMessgeContacts);
router.get("/users/:userId/:role", messageController.getMessgeContacts);

// router.post("/image/employer/:userId", ImageUploadController.employerImageUpload);
// router.post("/resume/candidate/:userId", ImageUploadController.candidateResumeUpload);

module.exports = router;
