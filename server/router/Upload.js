const express = require("express");
const router = express.Router();
const ImageUploadController = require("../controller/Upload");

router.post(
  "/image/candidate/:userId",
  ImageUploadController.candidateImageUpload
);
router.post(
  "/image/employer/:userId",
  ImageUploadController.employerImageUpload
);
router.post(
  "/resume/candidate/:userId",
  ImageUploadController.candidateResumeUpload
);
router.post(
  "/store/enhance/resume/:userId",
  ImageUploadController.addPrimaryResume
);
router.post("/make/primary/:userId", ImageUploadController.changePrimaryResume);
router.delete("/delete/resume/:userId", ImageUploadController.DeleteResume);

module.exports = router;
