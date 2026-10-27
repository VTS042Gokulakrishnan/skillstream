const VERSION = "2026-10-27";
function validAcceptance(value, role) {
  return (
    !!value &&
    value.accepted === true &&
    value.termsVersion === VERSION &&
    value.privacyVersion === VERSION &&
    (role !== "Employer" || value.employerTerms === true)
  );
}
function requireAcceptance(req, res) {
  if (!validAcceptance(req.body.policyAcceptance, req.body.role)) {
    res
      .status(400)
      .json({
        code: "POLICY_ACCEPTANCE_REQUIRED",
        message:
          "Please create your account through signup and agree to the current terms and privacy notice.",
      });
    return false;
  }
  return true;
}
function acceptanceRecord(req) {
  return {
    termsVersion: VERSION,
    privacyVersion: VERSION,
    employerTerms: req.body.role === "Employer",
    role: req.body.role,
    acceptedAt: new Date(),
  };
}
module.exports = {
  VERSION,
  validAcceptance,
  requireAcceptance,
  acceptanceRecord,
};
