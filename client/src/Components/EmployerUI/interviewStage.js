export function interviewStage(person, type, now = Date.now()) {
  const video = type === "video";
  const raw = person[video ? "interviewStatus" : "CodingInterviewStatus"];
  if (!raw) return "Not sent";
  const processing = video ? [person.videoUploadStatus,person.qaPdfStatus,person.candidateEmailStatus,person.employerEmailStatus] : [];
  if (/Failed/i.test(raw) || processing.includes("Failed")) return "Failed";
  if (/Analysis|Upload|PDF/.test(raw) || processing.some(value=>["Pending","In Progress"].includes(value))) return "Processing";
  if (raw === "Completed") return "Completed";
  if (/Progress|Initialised|Question/.test(raw)) return "In progress";
  const expiry=Date.parse(person[video ? "interviewViewLinkExpiresin" : "CodingInterviewViewLinkExpiresin"]);
  if (raw === "Expired" || (Number.isFinite(expiry) && expiry < now)) return "Expired";
  return "Pending";
}
