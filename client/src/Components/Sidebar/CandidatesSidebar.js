import React, { useEffect } from "react";
import CareerIcon from "../../Pages/HomeNew/CareerIcon";
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
      <aside className="user-sidebar" aria-label="Candidate navigation">
        <div className="sidebar-inner">
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
                      <CareerIcon name={({home:"home", "file-alt":"document",heart:"heart",bell:"bell",envelope:"chat","chart-bar":"chart","file-invoice":"document",user:"people"})[icon]} />
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
