const express = require("express");
const router = express.Router();
const { CodingExecution } = require("../controller/codingRound");

router.post("/code/execute", CodingExecution);

module.exports = router;
