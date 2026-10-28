const fs = require("fs");
const os = require("os");
const path = require("path");

function ensureInterviewUploadDirectory() {
  const defaultDirectory = process.platform === "win32"
    ? path.join(os.tmpdir(), "skillstream", "interview-uploads")
    : "/data/upload";
  const directory = path.resolve(
    process.env.INTERVIEW_UPLOAD_DIR || defaultDirectory
  );
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

module.exports = { ensureInterviewUploadDirectory };
