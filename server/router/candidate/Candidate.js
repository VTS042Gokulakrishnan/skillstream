const express = require("express");
const router = express.Router();
const candidateController = require("../../controller/candidate/Candidates");
const { Authorization } = require("../../middleware/auth");

router.post("/update/:userId", candidateController.updateProfile);
router.get("/allCandidates", candidateController.getAllCandidates);
router.get("/:userId", candidateController.getcandidate);
router.post(
  "/profileViews/:userId",
  candidateController.addCandidateProfileViews
);
router.post("/contact/search", candidateController.searchCandidate);
router.get("/fetch/user/:userId", candidateController.getBothCandidate);
router.post("/edit/user/:userId", candidateController.editBothCandidate);


module.exports = router; 
