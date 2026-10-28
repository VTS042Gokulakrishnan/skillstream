import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Alert, Button, Select, Skeleton, Table, Tag } from "antd";
import { BriefcaseBusiness, Users, Star, CalendarDays } from "lucide-react";
import Chart from "chart.js/auto";
import { Server } from "../../../App";
import EmployerAvatar from "../../../Components/EmployerUI/EmployerAvatar";

const ranges = ["All", "Last 7 Days", "Last 15 Days", "Last 1 Months", "Last 2 Months", "Last 3 Months", "Above 6 Months"];
function Trend({ records, label, color, dateOf }) {
  const ref = useRef(null);
  const [range, setRange] = useState("All");
  useEffect(() => {
    if (!ref.current) return;
    const days = { "Last 7 Days": 7, "Last 15 Days": 15, "Last 1 Months": 30, "Last 2 Months": 60, "Last 3 Months": 90 }[range];
    const totals = {};
    records.forEach(record => {
      const date = new Date(dateOf(record));
      if (!Number.isFinite(date.getTime())) return;
      const age = (Date.now() - date.getTime()) / 86400000;
      if (days && age > days) return;
      if (range === "Above 6 Months" && age <= 180) return;
      const key = date.toISOString().slice(0, 10);
      totals[key] = (totals[key] || 0) + 1;
    });
    const labels = Object.keys(totals).sort();
    const chart = new Chart(ref.current, { type: "line", data: { labels, datasets: [{ label, data: labels.map(key => totals[key]), borderColor: color, backgroundColor: color + "18", fill: true, tension: .3, pointRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } }, y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#edf2f8" } } } } });
    return () => chart.destroy();
  }, [records, range, label, color, dateOf]);
  return <section className="em-card"><div className="em-card-header"><h2>{label}</h2><Select aria-label={`${label} date range`} value={range} onChange={setRange} options={ranges.map(value => ({value,label:value}))} style={{width:150}} /></div><div style={{height:235}}><canvas ref={ref} aria-label={label} role="img" /></div>{!records.length && <p className="em-empty" style={{padding:8}}>Activity will appear here as your hiring progresses.</p>}</section>;
}
function AppliedCandidatesPie({ applications }) {
  const canvas = useRef(null);
  const counts = applications.reduce((totals, applicant) => {
    const status = applicant.applicationStatus === "Approved" ? "Shortlisted" : applicant.applicationStatus === "Rejected" ? "Rejected" : "New / in review";
    totals[status] = (totals[status] || 0) + 1;
    return totals;
  }, {});
  const signature = JSON.stringify(counts);
  useEffect(() => {
    if (!canvas.current || !applications.length) return;
    const values = JSON.parse(signature);
    const chart = new Chart(canvas.current, { type: "pie", data: { labels: Object.keys(values), datasets: [{ data: Object.values(values), backgroundColor: ["#0785f9", "#21bf9b", "#f59e66"], borderColor: "#fff", borderWidth: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 20 } } } } });
    return () => chart.destroy();
  }, [signature, applications.length]);
  return <section className="em-card"><div className="em-card-header"><h2>Applied candidates</h2><span>{applications.length} applications</span></div>{applications.length ? <div style={{height:280}}><canvas ref={canvas} role="img" aria-label={`Applications by stage: ${Object.entries(counts).map(([key,value])=>`${key}: ${value}`).join(', ')}`}/></div> : <p className="em-empty">The application breakdown will appear when candidates apply.</p>}</section>;
}
const jobDate = job => job.time || job.postedTime;
const appliedDate = applicant => applicant.time || applicant.appliedTime;
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    axios.get(`${Server}/api/v1/employer/${localStorage.getItem("UserId")}`, {headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}).then(({data}) => {if(active)setData(data.Employer?.[0] || {});}).catch(() => {if(active)setError(true);});
    return () => {active=false;};
  }, [attempt]);
  if(error)return <Alert type="error" message="Could not load your hiring overview" action={<Button onClick={() => setAttempt(n=>n+1)}>Retry</Button>} />;
  if(!data)return <div className="em-card"><Skeleton active paragraph={{rows:8}} /></div>;
  const jobs = data.jobs || [];
  const applications = jobs.flatMap(job => (job.applicants || []).map(applicant => ({...applicant, role:job.JobTitle, jobId:job.jobId})));
  const shortlisted = applications.filter(a=>a.applicationStatus === "Approved");
  const interviews = applications.filter(a=>a.interviewStatus || a.CodingInterviewStatus || a.interviewScore);
  const recent = [...applications].sort((a,b)=>new Date(appliedDate(b))-new Date(appliedDate(a))).slice(0,5);
  const notifications = [...(data.notifications || [])].sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,4);
  const columns = [
    {title:"Candidate",key:"name",render:(_,a)=><div className="em-resume-name"><EmployerAvatar src={a.image} name={a.name} size={36}/><strong>{a.name || "Candidate"}</strong></div>},
    {title:"Applied role",dataIndex:"role"},
    {title:"Stage",key:"stage",render:(_,a)=><Tag color={a.applicationStatus === "Approved" ? "green":"blue"}>{a.applicationStatus === "Approved" ? "Shortlisted":a.applicationStatus || "New"}</Tag>},
    {title:"Action",key:"action",render:()=> <Link to="/applicants">View applicant</Link>},
  ];
  return <>
    <div className="em-stats-grid">{[["Jobs posted",jobs.length,BriefcaseBusiness,"/manage-jobs"],["Applicants",applications.length,Users,"/applicants"],["Shortlisted",shortlisted.length,Star,"/shortlisted-resumes"],["Interviews",interviews.length,CalendarDays,"/interview-candidates"]].map(([label,value,Icon,to])=><Link to={to} className="em-stat" key={label}><span className="em-stat-icon"><Icon size={24}/></span><div><small>{label}</small><strong>{value}</strong></div></Link>)}</div>
    <div className="em-two-col"><Trend records={applications} label="Application trend" color="#0785f9" dateOf={appliedDate}/><AppliedCandidatesPie applications={applications}/></div>
    <div className="em-two-col"><section className="em-card"><div className="em-card-header"><h2>Recent applicants</h2><Link to="/applicants">View all applicants →</Link></div><Table columns={columns} dataSource={recent} rowKey={(a)=>`${a.userId}-${a.jobId}`} pagination={false} scroll={{x:540}} locale={{emptyText:"New applications will appear here."}}/></section><section className="em-card"><div className="em-card-header"><h2>Notifications</h2><Link to="/resume-alerts">View all →</Link></div>{notifications.map((n,i)=><div className="em-person-line" key={n._id || i}><EmployerAvatar name={n.name} size={36}/><div><strong>{n.name || "Hiring update"}</strong><small>{n.type} · {n.JobTitle}</small></div><Link to={n.jobId ? `/job-detail/${data.userId}/${n.jobId}`:"/applicants"}>View</Link></div>)}{!notifications.length && <p className="em-empty">You’re all caught up.</p>}</section></div>
    <div className="em-two-col"><Trend records={jobs} label="Your posted jobs" color="#15bcd1" dateOf={jobDate}/><section className="em-card"><div className="em-card-header"><h2>Hiring pipeline</h2><Link to="/applicants">View all</Link></div>{[["Applied",applications.length],["In review",applications.filter(a=>a.applicationStatus === "pending").length],["Shortlisted",shortlisted.length],["Interviews",interviews.length]].map(([label,value])=><div className="em-pipeline-row" key={label}><span>{label}</span><div className="em-progress"><i style={{width:`${applications.length ? value/applications.length*100:0}%`}}/></div><strong>{value}</strong></div>)}<hr/><Link to="/employer-messages">Messages <strong>{data.messages?.length || 0}</strong> →</Link></section></div>
  </>;
}
