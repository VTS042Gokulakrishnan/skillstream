const express = require("express");
const router = express.Router();
const {
  updateProfile,
  vendorDetails,
  AddCandidates,
  deleteCandidate,
  EditCandidate,
  getVendorCandidates,
  applyJobAsVendor,
  deleteAppliedCandidate,
  getAppliedJobs,
  // getLink,
} = require("../controller/vendors");
const multer = require("multer");
const storage = multer.memoryStorage(); // or diskStorage
const upload = multer({ storage });

router.post("/update/:userId", updateProfile);
router.get("/details/:userId", vendorDetails);
router.post("/upload/candidates/:userId", AddCandidates);
router.delete("/delete/:userId/:candidateId", deleteCandidate);
router.put("/edit/:userId/:candidateId", EditCandidate);
router.get("/get/candidates/:userId", getVendorCandidates);
router.post(
  "/applyJob/:vendorId/:employerId",
  upload.single("resume"),
  applyJobAsVendor
);
router.get("/get/appliedJobs/:vendorId", getAppliedJobs);
router.delete(
  "/delete/applicants/:vendorId/:jobId/:candidateId",
  deleteAppliedCandidate
);

module.exports = router;
