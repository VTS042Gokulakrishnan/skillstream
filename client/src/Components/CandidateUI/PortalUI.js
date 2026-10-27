import React from "react";
import { Link } from "react-router-dom";
export function PageHeading({ title, description, children }) {
  return (
    <header className="ss-page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}
export function PortalFooter() {
  return (
    <footer className="ss-footer">
      <span>
        © {new Date().getFullYear()} SkillStream. All rights reserved.
      </span>
      <nav aria-label="Footer">
        <Link to="/contact">Help</Link>
        <Link to="/privacyCenter">Privacy</Link>
        <Link to="/termsAndCondition">Terms</Link>
      </nav>
    </footer>
  );
}
export function EmptyState({ title, description, children }) {
  return (
    <div className="ss-empty">
      <span className="ss-empty-icon" aria-hidden="true">
        ◇
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Avatar({ name, image }) {
  return image ? (
    <img
      className="ss-avatar"
      src={image}
      alt=""
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <span className="ss-avatar" aria-hidden="true">
      {(name || "Company").slice(0, 2).toUpperCase()}
    </span>
  );
}
export function JobLink({ job }) {
  return (
    <Link
      className="ss-button ss-button-outline"
      to={`/job-detail/${job.employerId}/${job.jobId}`}
    >
      View job
    </Link>
  );
}
export function displayDate(value) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}
