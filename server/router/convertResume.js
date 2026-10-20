const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { convertResume } = require("../controller/ConvertResume");

// 🧠 Convert DOC/DOCX → PDF (preserving layout)
router.post("/convert-resume", upload.single("file"), convertResume);

module.exports = router;
