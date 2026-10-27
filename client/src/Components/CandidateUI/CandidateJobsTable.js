import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { Modal, Skeleton } from "antd";
import { Server } from "../../App";
import {
  Avatar,
  EmptyState,
  JobLink,
  PageHeading,
  PortalFooter,
  displayDate,
} from "./PortalUI";
export default function CandidateJobsTable({ alerts = false, shortlisted = false }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [months, setMonths] = useState("all");
  const [page, setPage] = useState(1);
  const userId = localStorage.getItem("UserId");
  const role = localStorage.getItem("Role");
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const url = shortlisted
        ? "shortlistJob/view/" + userId + "/" + role
        : alerts
        ? "jobAlerts/get/" + userId + "/" + role
        : "jobs/getJob/" + userId;
      const { data } = await axios.get(Server + "/api/v1/candidate/" + url);
      const records = shortlisted
        ? data.shortlisted
        : alerts ? data.jobAlerts?.jobAlerts : data.appliedJobs?.appliedJobs;
      setJobs(Array.isArray(records) ? records.map((job) => {
        if (!shortlisted) return job;
        const saved = moment(job.shortlistedTime, ["MMM Do YYYY", moment.ISO_8601], true);
        return {
          ...job,
          JobTitle: job.jobTitle,
          employerId: job.empId,
          image: job.logo,
          appliedTime: saved.isValid() ? saved.toISOString() : null,
        };
      }) : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("ProfileCompleted") === "false")
      navigate(shortlisted && role !== "Candidate" ? "/company-profile" : "/my-profile");
    load();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, shortlisted]);
  const filtered = useMemo(() => {
    const dateOf = (job) =>
      alerts ? job.postedTime : job.appliedTime || job.time;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - Number(months));
    return jobs
      .filter((job) => months === "all" || new Date(dateOf(job)) >= cutoff)
      .sort(
        (a, b) =>
          (new Date(dateOf(b)).getTime() || 0) -
          (new Date(dateOf(a)).getTime() || 0)
      );
  }, [jobs, months, alerts]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 5));
  const currentPage = Math.min(page, pageCount);
  const remove = (job) =>
    Modal.confirm({
      title: shortlisted
        ? "Remove this saved job?"
        : alerts
        ? "Remove this alert?"
        : "Remove this application from your list?",
      content:
        job.JobTitle || "This item will be removed from your saved list.",
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const url = shortlisted
            ? "shortlistJob/delete/" + userId + "/" + job.jobId + "/" + role
            : alerts
            ? "jobAlerts/delete/" + userId + "/" + job.jobId + "/" + role
            : "jobs/delete/" + userId + "/" + job.jobId;
          await axios.delete(Server + "/api/v1/candidate/" + url);
          setJobs((items) => items.filter((item) => item.jobId !== job.jobId));
          toast.success(shortlisted ? "Saved job removed" : alerts ? "Alert removed" : "Application removed");
        } catch {
          toast.error("Could not remove this item. Please try again.");
        }
      },
    });
  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <Toaster position="top-center" />
        <PageHeading
          title={shortlisted ? "Shortlisted jobs" : alerts ? "Job alerts" : "Applied jobs"}
          description={
            shortlisted
              ? "Keep your saved opportunities in one place."
              : alerts
              ? "Review your latest job notifications."
              : "Track the roles you’ve applied for."
          }
        />
        <div className="ss-card">
          <div className="ss-toolbar">
            <h2>{shortlisted ? "My saved jobs" : alerts ? "Recent alerts" : "My applications"}</h2>
            <select
              className="ss-select"
              aria-label="Filter by date"
              value={months}
              onChange={(e) => {
                setMonths(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All time</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
              <option value="24">Last 24 months</option>
            </select>
          </div>
          {loading ? (
            <div className="ss-card-padding">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : error ? (
            <div className="ss-empty">
              <p>We couldn’t load your {shortlisted ? "saved jobs" : alerts ? "alerts" : "applications"}.</p>
              <button className="ss-button" onClick={load}>
                Try again
              </button>
            </div>
          ) : !filtered.length ? (
            <EmptyState
              title={shortlisted ? "No saved jobs found" : alerts ? "No alerts yet" : "No applications found"}
              description={
                months === "all"
                  ? shortlisted
                    ? "Save jobs while browsing to find them here."
                    : alerts
                    ? "Your new job notifications will appear here."
                    : "Your applications will appear here after you apply for a job."
                  : "Try a wider date range."
              }
            />
          ) : (
            <>
              <div className="ss-table-scroll">
                <table className="ss-table">
                  <thead>
                    <tr>
                      <th>Role & company</th>
                      <th>Location</th>
                      <th>{shortlisted ? "Saved on" : alerts ? "Received" : "Applied on"}</th>
                      {!alerts && !shortlisted && <th>Status</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .slice((currentPage - 1) * 5, currentPage * 5)
                      .map((job, index) => (
                        <tr key={job._id || job.jobId + "-" + index}>
                          <td>
                            <div className="ss-job-identity">
                              <Avatar
                                name={job.companyName || job.JobTitle}
                                image={job.image}
                              />
                              <div>
                                <strong>
                                  {job.JobTitle || "Job opportunity"}
                                </strong>
                                <small>
                                  {job.companyName || job.Industry || ""}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {[job.city || job.City, job.country || job.Country]
                              .filter(Boolean)
                              .join(", ") || "Not provided"}
                          </td>
                          <td>
                            {displayDate(
                              alerts
                                ? job.postedTime
                                : job.appliedTime || job.time
                            )}
                          </td>
                          {!alerts && !shortlisted && (
                            <td>
                              <span
                                className={
                                  "ss-status " +
                                  (/approved|accepted|shortlisted/i.test(
                                    job.status
                                  )
                                    ? "ss-status-success"
                                    : /reject/i.test(job.status)
                                    ? "ss-status-danger"
                                    : "")
                                }
                              >
                                {job.status || "Pending"}
                              </span>
                            </td>
                          )}
                          <td>
                            <div className="ss-actions">
                              <JobLink job={job} />
                              <button
                                className="ss-icon-button"
                                aria-label={"Remove " + (job.JobTitle || "job")}
                                onClick={() => remove(job)}
                              >
                                <i className="la la-trash" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="ss-pagination">
                <span>
                  Showing {(currentPage - 1) * 5 + 1}–
                  {Math.min(currentPage * 5, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <nav aria-label="Pagination">
                  <button
                    className="ss-icon-button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <span>
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    className="ss-icon-button"
                    disabled={currentPage === pageCount}
                    onClick={() => setPage(currentPage + 1)}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>
        <PortalFooter />
      </div>
    </section>
  );
}
