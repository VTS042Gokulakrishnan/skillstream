const express = require("express");
const router = express.Router();
const { analyseCandidate } = require("../controller/AIFitment");
const { Authorization } = require("../middleware/auth");


router.post("/analyse/fitemnt", Authorization, analyseCandidate);

module.exports = router;
