import { interviewStage } from "./interviewStage";
import React, { useEffect, useState } from "react";
import { Button, Tag, Alert } from "antd";
import { FileText, Send, MapPin, Sparkles, Trash2 } from "lucide-react";
import axios from "axios";
import { Server } from "../../App";
import EmployerAvatar from "./EmployerAvatar";

export default function ApplicantReview({ applicant, job, onResume, onInvite, onVendor, onAnalysis, onQuestions, onDelete, renderResults, decision }) {
  const [live, setLive] = useState(applicant);
  const [error, setError] = useState(false);
  const [retrying,setRetrying] = useState(false);
  const [retryError,setRetryError] = useState("");
  const retryNotifications = async () => {
    if(retrying) return;
    setRetrying(true);setRetryError("");
    try {
      await axios.post(`${Server}/api/v1/videoInterview/retryNotifications/${job.userId}/${job.jobId}/${applicant.id}`,{}, {headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});
    } catch(err) {setRetryError(err.response?.data?.message || "Unable to retry notifications");}
    finally {setRetrying(false);}
  };
  useEffect(() => {
    setLive(applicant);
    let cancelled = false, timer;
    const refresh = async () => {
      try {
        const { data } = await axios.get(`${Server}/api/v1/videoInterview/liveStatus/${job.userId}/${job.jobId}/${applicant.id}`);
        if (!cancelled) { setLive(previous => ({ ...previous, ...data })); setError(false); }
      } catch { if (!cancelled) setError(true); }
      if (!cancelled) timer = setTimeout(refresh, 5000);
    };
    if (job.userId && applicant.id) refresh();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [applicant, job.userId, job.jobId]);
  const stages = [
    ["Analysis", live.analysisSavedAt ? "Completed" : live.interviewStatus === "Analysis Failed" ? "Failed" : live.interviewStatus === "Analysis In Progress" ? "In Progress" : "Not reported"],
    ["Video upload", live.videoUploadStatus || (live.video ? "Completed" : "Not reported")],
    ["Q&A PDF", live.qaPdfStatus || (live.transcript ? "Completed" : "Not reported")],
    ["Candidate email", live.candidateEmailStatus || "Not reported"],
    ["Employer email", live.employerEmailStatus || "Not reported"],
  ];
  return <div className="applicant-review">
    <section className="applicant-review-summary"><EmployerAvatar src={live.image} name={live.name} size={64}/><div><h2>{live.name || "Candidate"}</h2><p>{live.jobTitle || job.JobTitle}</p><span className="applicant-review-location"><MapPin size={15}/>{[live.city,live.country].filter(Boolean).join(", ") || "Location not provided"}</span></div><Tag>{live.applicationStatus || "New"}</Tag></section>
    <section className="applicant-review-section"><h3>Application details</h3><div className="applicant-review-role"><div><small>Applied role</small><strong>{job.JobTitle}</strong></div></div><Button type="primary" icon={<FileText size={17}/>} onClick={()=>onResume(live)}>View resume</Button>{onVendor && <Button onClick={()=>onVendor(live.vendor)}>Vendor details</Button>}</section>
    {onAnalysis && <section className="applicant-review-section"><div className="applicant-review-heading"><h3>AI fitment</h3>{live.matchingScore && <span className="applicant-review-score">{live.matchingScore}</span>}</div><div className="applicant-review-actions"><Button icon={<Sparkles size={17}/>} onClick={()=>onAnalysis(live)}>{live.fitmentSummary ? "View analysis" : "Analyze with AI"}</Button>{onQuestions && live.preCallQuestion?.length > 0 && <Button onClick={()=>onQuestions(live.preCallQuestion)}>Recruiter questions</Button>}</div></section>}
    {["video", "coding"].map(type => {
      const status = type === "video" ? live.interviewStatus : live.CodingInterviewStatus;
      const completed = status === "Completed";
      const displayStatus = interviewStage(live,type);
      const working = ["Processing","In progress"].includes(displayStatus);
      return <section className="applicant-review-section" key={type}><div className="applicant-review-heading"><h3>{type === "video" ? "Video interview" : "Coding round"}</h3><Tag color={displayStatus === "Failed" ? "red" : displayStatus === "Completed" ? "green" : "blue"}>{displayStatus}</Tag></div>
        <Button disabled={working} icon={<Send size={17}/>} onClick={()=>onInvite(live,type)}>{working ? "Interview in progress" : completed ? "Invite to retake" : displayStatus === "Expired" ? "Renew & resend" : status ? "Resend invitation" : type === "coding" && live.interviewStatus === "Completed" ? "Invite to coding round" : "Send interview"}</Button>
        {live[type === "video" ? "videoInviteSentAt" : "codingInviteSentAt"] && <small>Last sent: {new Date(live[type === "video" ? "videoInviteSentAt" : "codingInviteSentAt"]).toLocaleString()}</small>}
        {renderResults && renderResults(live,type)}
        {type === "video" && status && <div className="applicant-processing">{stages.map(([label,value])=><div key={label}><span>{label}</span><Tag color={value === "Failed" ? "red" : ["Completed","Sent"].includes(value) ? "green" : "default"}>{value}</Tag></div>)}</div>}
      </section>;
    })}
    {live.notificationError && <Alert type="error" message="Interview saved, but notification failed" description={retryError || "The interview results are saved. Retry the failed email notifications."} action={<Button loading={retrying} onClick={retryNotifications}>Retry emails</Button>}/>}
    {error && <Alert type="warning" message="Live status temporarily unavailable. Retrying automatically."/>}
    {live.interviewAttempts?.length > 0 && <section className="applicant-review-section"><h3>Previous attempts</h3>{live.interviewAttempts.map((attempt,index)=><div key={index}><strong>{attempt.type === "video" ? "Video" : "Coding"} · {new Date(attempt.archivedAt).toLocaleDateString()}</strong><div className="applicant-review-actions">{renderResults?.(attempt,attempt.type)}</div></div>)}</section>}
    {decision}
    {onDelete && <div className="applicant-review-delete"><span>Remove this application</span><Button danger type="text" icon={<Trash2 size={16}/>} onClick={()=>onDelete(live)}>Delete applicant</Button></div>}
  </div>;
}
