import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Alert, Button, Skeleton, Tabs } from "antd";
import { Bell } from "lucide-react";
import { Server } from "../../../App";
export default function ResumesAlerts() {
  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [tab,setTab]=useState("all");
  const [saving,setSaving]=useState(false);
  const token=localStorage.getItem("token"),userId=localStorage.getItem("UserId");
  const load=async()=>{setLoading(true);setError("");try{const {data}=await axios.get(`${Server}/api/v1/employer/${userId}`,{headers:{Authorization:`Bearer ${token}`}});setNotifications([...(data.Employer?.[0]?.notifications||[])].sort((a,b)=>new Date(b.time)-new Date(a.time)));}catch{setError("Unable to load notifications.");}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const markRead=async()=>{setSaving(true);try{await axios.post(`${Server}/api/v1/employer/read/notifications/${userId}`,{},{headers:{Authorization:`Bearer ${token}`}});setNotifications(items=>items.map(n=>({...n,read:true})));window.dispatchEvent(new Event("employer-notifications-read"));}catch{setError("Could not mark notifications as read. Please try again.");}finally{setSaving(false);}};
  const unread=notifications.filter(n=>!n.read).length;
  const filtered=notifications.filter(n=>tab === "all" || (tab === "unread" ? !n.read : tab === "shortlists" ? n.type === "Shortlist Job" : n.type !== "Shortlist Job"));
  return <><div className="em-card"><div className="em-card-header"><h2>Your activity</h2><Button type="primary" loading={saving} disabled={!unread} onClick={markRead}>Mark all as read</Button></div><Tabs activeKey={tab} onChange={setTab} items={[{key:"all",label:`All (${notifications.length})`},{key:"unread",label:`Unread (${unread})`},{key:"applications",label:"Applications"},{key:"shortlists",label:"Shortlists"}]}/>{error && <Alert type="error" message={error} action={<Button onClick={load}>Retry</Button>}/>} {loading ? <Skeleton active/> : filtered.map((n,i)=><article className={`em-notification ${n.read ? "":"unread"}`} key={n._id || i}><span className="em-stat-icon"><Bell size={21}/></span><div><strong>{n.name || "Candidate"} {n.type === "Shortlist Job" ? "shortlisted your job":"applied for a job"}</strong><p>{n.JobTitle}</p></div><time>{Number.isFinite(new Date(n.time).getTime()) ? new Date(n.time).toLocaleString():""}</time><Link className="em-primary" to="/applicants">View application</Link></article>)}{!loading && !error && !filtered.length && <p className="em-empty">You’re all caught up. New hiring updates will appear here.</p>}</div></>;
}
