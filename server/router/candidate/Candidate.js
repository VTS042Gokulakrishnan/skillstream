const express = require("express");
const router = express.Router();
const candidateController = require("../../controller/candidate/Candidates");
const { Authorization } = require("../../middleware/auth");
const preferences = require("../../controller/candidate/jobPreferences");
router.get("/preferences/locations", Authorization, preferences.get);
router.put("/preferences/locations", Authorization, preferences.save);

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
