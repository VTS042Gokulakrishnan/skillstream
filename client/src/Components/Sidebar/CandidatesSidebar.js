import logo from "../../assets/logo-twos.png";
import "./CandidatesSidebar.css";
import React, { useEffect } from "react";
import { LayoutDashboard, FileText, Heart, Bell, MessageSquare, BarChart3, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const groups = [
  [
    "Workspace",
    [
      ["Dashboard", "/candidate-dashboard", "home"],
      ["Applied Jobs", "/applied-jobs", "file-alt"],
      ["Shortlisted Jobs", "/shortlisted-jobs", "heart"],
      ["Job Alerts", "/job-alerts", "bell"],
      ["Messages", "/messages", "envelope"],
    ],
  ],
  [
    "Career tools",
    [
      ["Practice Assessment", "/practiceInterview", "chart-bar"],
      ["CV Manager", "/cv-manager", "file-invoice"],
      ["View Profile", "/candidates-profile-view", "user"],
    ],
  ],
];
export default function CandidatesSidebar() {
  const { pathname } = useLocation();
  useEffect(() => {
    const click = (event) => {
      if (event.target.closest("#toggle-user-sidebar"))
        document.body.classList.toggle("user-sidebar-active");
    };
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("click", click);
      document.body.classList.remove("user-sidebar-active");
    };
  }, []);
  useEffect(() => {
    document.body.classList.remove("user-sidebar-active");
  }, [pathname]);
  return (
    <>
      <button
        className="ss-sidebar-toggle"
        aria-label="Open candidate menu"
        onClick={() => document.body.classList.toggle("user-sidebar-active")}
      >
        ☰ Menu
      </button>
      <div
        className="sidebar-backdrop"
        onClick={() => document.body.classList.remove("user-sidebar-active")}
      />
      <aside className="user-sidebar ss-candidate-sidebar" aria-label="Candidate navigation">
        <div className="sidebar-inner"><Link to="/candidate-dashboard" className="ss-candidate-brand"><img src={logo} alt="SkillStream" /><span>CANDIDATE WORKSPACE</span></Link>
          {groups.map(([title, items], i) => (
            <div key={title} className={i ? "ss-nav-divider" : ""}>
              <div className="ss-nav-label">{title}</div>
              <ul className="navigation">
                {items.map(([label, url, icon]) => (
                  <li key={url} className={pathname === url ? "active" : ""}>
                    <Link
                      to={url}
                      aria-current={pathname === url ? "page" : undefined}
                    >
                      {React.createElement(({home:LayoutDashboard,"file-alt":FileText,heart:Heart,bell:Bell,envelope:MessageSquare,"chart-bar":BarChart3,"file-invoice":FileText,user:UserRound})[icon], {size:19, className:"cl-icon", "aria-hidden":true})}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
