const jwt = require("jsonwebtoken");
const employers = require("../models/employerModel");

function allowedDuringSetup(method, path, userId) {
  return (method === "GET" && (path === "/employer/profile-status" || path.startsWith("/data/"))) ||
    (method === "POST" && path === `/employer/update/${userId}`);
}

// Apply to authenticated employer requests, including older API endpoints that
// do not use Authorization. Public and other-role requests retain their behavior.
async function employerSetupGate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  let decoded;
  try { decoded = jwt.verify(header.slice(7), process.env.REFRESH_KEY); }
  catch { return res.status(401).json({ message: "Your session has expired. Sign in again." }); }
  if (decoded.role !== "Employer") return next();
  try {
    const email = String(decoded.email || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const employer = await employers.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!employer) return res.status(401).json({ message: "Employer account not found." });
    if (employer.profileCompleted !== true && !allowedDuringSetup(req.method, req.path, employer.userId)) {
      return res.status(403).json({ code: "PROFILE_INCOMPLETE", message: "Complete your employer profile before accessing the workspace." });
    }
    return next();
  } catch (error) { return res.status(503).json({ message: "Unable to verify your profile. Please try again." }); }
}
module.exports = { employerSetupGate, allowedDuringSetup };
