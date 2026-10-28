import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ConfigProvider, Dropdown } from "antd";
import { LayoutDashboard, BriefcaseBusiness, Users, Search, Sparkles, Star, Bookmark, CalendarDays, ChartNoAxesCombined, Building2, CreditCard, Bell, Plus, Menu, X, ChevronDown, MessageSquare, LockKeyhole, LogOut, HelpCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import logo from "../../assets/logo-twos.png";
import EmployerAvatar from "./EmployerAvatar";
import { useEmployer } from "./EmployerAccess";
import "./EmployerWorkspace.css";

export const employerPages = {
  "/employer-dashboard": ["Hiring overview", "Track your hiring progress, review candidates and plan the next step."],
  "/candidates-list": ["Resume search", "Find the right talent with skills, experience and Boolean search."],
  "/aisearch": ["AI resume search", "Choose a job and discover candidates matched to its requirements."],
  "/manage-jobs": ["Manage jobs", "Create, track and manage your job postings in one place."],
  "/applicants": ["All applicants", "Review applications and move your hiring process forward."],
  "/shortlisted-resumes": ["Shortlisted resumes", "Your selected candidates, ready for the next step."],
  "/savedresume": ["Saved resumes", "Keep promising candidates within reach."],
  "/post-job": ["Post a new job", "Tell candidates about the role, requirements and opportunity."],
  "/interview-candidates": ["Interviewed candidates", "Review interviews, feedback and candidate assessments."],
  "/aifitment": ["AI fitment analysis", "Compare resume evidence with the requirements of your role."],
  "/allusers": ["Users & permissions", "Manage your team and their access to the workspace."],
  "/create-user": ["Add a team member", "Give your team the access they need."],
  "/employer-profile-view": ["Company profile", "Your company information and hiring presence."],
  "/employer-view-profile": ["Company profile", "Review and manage your company information."],
  "/company-profile": ["Edit company profile", "Keep your company information up to date."],
  "/employer-billing": ["Billing", "Manage your plan, payment method and invoices."],
  "/resume-alerts": ["Notifications", "Stay up to date with your hiring activity."],
  "/globalsearch": ["Search across SkillStream", "Find candidates, jobs and employers in one place."],
  "/employer-messages": ["Messages", "Keep your hiring conversations together."],
  "/employer-change-password": ["Change password", "Keep your employer account secure."],
  "/employer-packages": ["Packages", "Explore your hiring plan options."],
};
const groups = [
  ["Workspace", [["/employer-dashboard", "Dashboard", LayoutDashboard], ["/post-job", "Post a new job", Plus], ["/manage-jobs", "Manage jobs", BriefcaseBusiness], ["/applicants", "All applicants", Users]]],
  ["Talent", [["/candidates-list", "Resume search", Search], ["/aiSearch", "AI resume search", Sparkles], ["/shortlisted-resumes", "Shortlisted resumes", Star], ["/savedResume", "Saved resumes", Bookmark], ["/interview-candidates", "Interviews", CalendarDays], ["/aiFitment", "AI fitment", ChartNoAxesCombined]]],
  ["Organization", [["/employer-profile-view", "Company profile", Building2], ["/allusers", "Users", Users], ["/employer-billing", "Billing", CreditCard], ["/employer-messages", "Messages", MessageSquare], ["/resume-alerts", "Notifications", Bell]]],
];

export default function EmployerWorkspace({ children }) {
  const account = useEmployer() || {};
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState(account.notifications || []);
  const searchRef = useRef(null);
  const token = localStorage.getItem("token");
  let decoded = {};
  try { decoded = jwtDecode(token); } catch { /* ProtectedRoute handles sign-in. */ }
  const access = account.access || decoded.access;
  const company = account.companyName || "Employer workspace";
  const name = account.name || decoded.name || account.email?.split("@")[0] || "Employer";
  const meta = employerPages[pathname.toLowerCase()] || ["Edit job", "Update your job information and requirements."];
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { setNotifications(account.notifications || []); }, [account.notifications]);
  useEffect(() => {
    const read = () => setNotifications(items => items.map(item => ({ ...item, read: true })));
    window.addEventListener("employer-notifications-read", read);
    return () => window.removeEventListener("employer-notifications-read", read);
  }, []);
  useEffect(() => {
    const key = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); } if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!process.env.REACT_APP_SERVER) return;
    const socket = io(process.env.REACT_APP_SERVER, { auth: { token } });
    socket.emit("add-user", localStorage.getItem("UserId"));
    socket.on("newNotification", item => setNotifications(list => [item, ...list]));
    return () => socket.disconnect();
  }, [token]);
  const logout = () => {
    ["token", "UserId", "Role", "ProfileCompleted", "Subscribed", "linkedinAccessToken", "ResumeUploaded"].forEach(key => localStorage.removeItem(key));
    window.dispatchEvent(new Event("skillstream-auth"));
    navigate("/employers");
  };
  const unread = notifications.filter(n => !n.read).length;
  const profileItems = [
    { key: "profile", label: <Link to="/employer-profile-view">View profile</Link>, icon: <Building2 size={16} /> },
    { key: "edit", label: <Link to="/company-profile">Edit profile</Link> },
    { key: "password", label: <Link to="/employer-change-password">Change password</Link>, icon: <LockKeyhole size={16} /> },
    { key: "billing", label: <Link to="/employer-billing">Billing & plans</Link>, icon: <CreditCard size={16} /> },
    { key: "blog", label: <Link to="/postBlog">Post blog</Link> },
    { type: "divider" }, { key: "logout", label: "Sign out", danger: true, icon: <LogOut size={16} />, onClick: logout },
  ];
  return <ConfigProvider theme={{ token: { colorPrimary: "#0785f9", colorText: "#102747", colorBorder: "#dce5ef", borderRadius: 8, controlHeight: 42, fontFamily: "Inter, system-ui, sans-serif" }, components: { Table: { headerBg: "#f4f8fc", cellPaddingBlock: 18 }, Tabs: { horizontalItemGutter: 28 } } }}>
    <div className={`em-workspace ${mobileOpen ? "em-nav-open" : ""}`} data-page={pathname.toLowerCase().slice(1)}>
      <a href="#em-main" className="em-skip">Skip to content</a>
      {mobileOpen && <button className="em-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className="em-sidebar" aria-label="Employer navigation">
        <Link to="/employer-dashboard" className="em-brand"><img src={logo} alt="SkillStream" /></Link>
        <button className="em-mobile-close em-icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        <nav>{groups.map(([title, links]) => <section key={title}><h2>{title}</h2>{links.filter(([path]) => path !== "/allusers" || access === "Admin").map(([path, label, Icon]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? "em-nav-link active" : "em-nav-link"}><Icon size={19} /><span>{label}</span></NavLink>)}</section>)}</nav>
        <div className="em-sidebar-company"><Building2 size={20} /><div><strong>{company}</strong><span>Employer workspace</span></div></div>
      </aside>
      <header className="em-topbar">
        <button className="em-mobile-toggle em-icon" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
        <Link className="em-mobile-brand" to="/employer-dashboard"><img src={logo} alt="SkillStream" /></Link>
        <Link className="em-company" to="/employer-profile-view"><Building2 size={20} /><span>{company}</span></Link>
        <form className="em-global-search" onSubmit={e => { e.preventDefault(); if (query.trim()) navigate(`/globalSearch?keyword=${encodeURIComponent(query.trim())}`); }}><Search size={19} /><input ref={searchRef} aria-label="Search candidates, jobs and employers" placeholder="Search candidates, jobs, or employers…" value={query} onChange={e => setQuery(e.target.value)} /><kbd>Ctrl K</kbd></form>
        <Link className="em-primary em-post-link" to="/post-job"><Plus size={18} />Post a job</Link>
        <Link to="/contact" className="em-icon em-help" aria-label="Help"><HelpCircle size={21} /></Link>
        <Dropdown trigger={["click"]} menu={{ items: [...notifications.slice(0, 5).map((n, i) => ({ key: String(i), label: <Link to="/resume-alerts"><strong>{n.name || "Hiring update"}</strong><br /><small>{n.JobTitle || n.message || n.type}</small></Link> })), { key: "all", label: <Link to="/resume-alerts">View all notifications{!notifications.length ? " · No new notifications" : ""}</Link> }] }}><button className="em-icon em-bell" aria-label={`Notifications, ${unread} unread`}><Bell size={22} />{unread > 0 && <span>{unread > 99 ? "99+" : unread}</span>}</button></Dropdown>
        <Dropdown trigger={["click"]} menu={{ items: profileItems }}><button className="em-account" aria-label="Account menu"><EmployerAvatar src={account.image} name={name} size={38} /><span><strong>{name}</strong><small>{access || "Employer"}</small></span><ChevronDown size={15} /></button></Dropdown>
      </header>
      <main id="em-main" className="em-main"><div className="em-page-heading"><div><h1>{meta[0]}</h1><p>{meta[1]}</p></div>{pathname.toLowerCase() === "/manage-jobs" && <Link className="em-primary" to="/post-job"><Plus size={18} />Post a new job</Link>}</div><div className="em-page-content">{children}</div></main>
    </div>
  </ConfigProvider>;
}
