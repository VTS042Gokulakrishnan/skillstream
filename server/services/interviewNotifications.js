// Persist each recipient independently so one failed email cannot hide the other outcome.
async function deliverInterviewNotifications({ candidateStatus, employerStatus, sendCandidate, sendEmployer, update }) {
  const errors=[];
  for(const [field,status,send] of [["candidateEmailStatus",candidateStatus,sendCandidate],["employerEmailStatus",employerStatus,sendEmployer]]) {
    if(status === "Sent") continue;
    await update({[field]:"In Progress"});
    try { await send(); await update({[field]:"Sent"}); }
    catch(error) { errors.push(error.message || "Email delivery failed"); await update({[field]:"Failed"}); }
  }
  await update({notificationError:errors.length ? errors.join("; ") : null});
  return errors.length === 0;
}
module.exports={deliverInterviewNotifications};
