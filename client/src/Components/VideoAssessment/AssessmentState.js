import React from "react";
import { CheckCircle2, Clock3, Wrench } from "lucide-react";

export default function AssessmentState({ kind = "completed", email, message, processing = false }) {
  const expired = kind === "expired";
  const maintenance = kind === "maintenance";
  const Icon = expired ? Clock3 : maintenance ? Wrench : CheckCircle2;
  return <section className="ss-session-state ss-assessment-result">
    <span className={expired || maintenance ? "ss-state-warning" : "ss-state-success"}><Icon size={25} /></span>
    <h1>{expired ? "Interview link expired" : maintenance ? "We’ll be back shortly" : "Interview completed"}</h1>
    <p>{expired ? "This invitation is no longer active. Contact your recruiter to arrange a new interview link." : maintenance ? "Assessments are temporarily unavailable. Please try again later." : message || "Your responses have been submitted for review. You’ll be notified when the review is complete."}</p>
    {processing && <p>Your interview analysis is saved. Your recording is processing in the background.</p>}
    {expired && email && <a className="ss-button" href={`mailto:${email}`}>Contact recruiter</a>}
    {expired && email && <p className="ss-assessment-contact">{email}</p>}
    <a className="ss-button ss-button-outline" href="/">Back to home</a>
  </section>;
}
