const VIDEO_FIELDS = ["interviewStatus","interviewSummary","video","transcript","interviewLiveStatus","videoUploadStatus","qaPdfStatus","analysisSavedAt","candidateEmailStatus","employerEmailStatus","notificationError","notificationContext","notificationRetrying","videoUploadError","qaPdfError","videoUploadStartedAt","videoUploadCompletedAt"];
const CODING_FIELDS = ["CodingInterviewStatus","CodingInterviewSummary","codingVideo","codingQ_A"];
function invitationUpdate(applicant, type, body, now = new Date()) {
  const video = type === "video";
  const statusKey = video ? "interviewStatus" : "CodingInterviewStatus";
  const expiryKey = video ? "interviewViewLinkExpiresin" : "CodingInterviewViewLinkExpiresin";
  const prefix = "jobs.$[job].applicants.$[applicant].";
  const completed = applicant[statusKey] === "Completed";
  if (applicant.notificationRetrying && video) throw new Error("Notifications are still processing. Please wait.");
  if (completed && video && [applicant.videoUploadStatus,applicant.qaPdfStatus,applicant.candidateEmailStatus,applicant.employerEmailStatus].some(value=>["Pending","In Progress"].includes(value))) throw new Error("This interview is still processing. Wait before starting a retake.");
  if (completed && body.retake !== true) throw new Error("Choose Invite to retake for a completed interview.");
  if (applicant[statusKey] && !["Sent","Completed","Expired","Pending","Interview Mail Sent"].includes(applicant[statusKey])) throw new Error("This interview is still processing or in progress. Wait before sending another invitation.");
  const hours = [24,48,72,168].includes(Number(body.expiryHours)) ? Number(body.expiryHours) : 24;
  const valid = !completed && new Date(applicant[expiryKey]) > now;
  const set = {
    [prefix + statusKey]: "Sent",
    [prefix + expiryKey]: valid ? applicant[expiryKey] : new Date(now.getTime()+hours*3600000),
    [prefix + (video ? "videoInviteSentAt" : "codingInviteSentAt")]: now,
    [prefix + (video ? "instructions" : "CodingInstructions")]: valid ? applicant[video ? "instructions" : "CodingInstructions"] || [] : body.instructions || [],
    [prefix + (video ? "isCodingRound" : "CodingLevel")]: valid ? applicant[video ? "isCodingRound" : "CodingLevel"] : video ? !!body.isCodingRound : body.level,
  };
  const update = {$set:set};
  if (completed) {
    const fields = video ? VIDEO_FIELDS : CODING_FIELDS;
    const snapshot = {type,archivedAt:now};
    for (const field of fields) if(applicant[field] !== undefined) snapshot[field] = applicant[field];
    update.$push = {[prefix+"interviewAttempts"]:snapshot};
    update.$unset = Object.fromEntries(fields.filter(field=>field!==statusKey).map(field=>[prefix+field,""]));
  }
  return update;
}
module.exports = {invitationUpdate};
