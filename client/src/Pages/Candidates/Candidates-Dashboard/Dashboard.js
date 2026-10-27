import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "chart.js/auto";
import { Skeleton } from "antd";
import { Server } from "../../../App";
import {
  Avatar,
  EmptyState,
  PageHeading,
  PortalFooter,
  displayDate,
} from "../../../Components/CandidateUI/PortalUI";
export default function Dashboard() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState(false);
  const chartRef = useRef(null);
  const load = async () => {
    setError(false);
    try {
      const { data } = await axios.get(
        Server + "/api/v1/candidate/" + localStorage.getItem("UserId")
      );
      setCandidate(data.Candidate?.[0] || {});
    } catch {
      setError(true);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("ProfileCompleted") === "false")
      navigate("/update-profile/" + localStorage.getItem("token"));
    load();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const jobs = candidate?.appliedJobs || [];
  useEffect(() => {
    if (!chartRef.current || !jobs.length) return;
    const counts = jobs.reduce((result, job) => {
      const status = job.status || "Pending";
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {});
    const chart = new Chart(chartRef.current, {
      type: "pie",
      data: {
        labels: Object.keys(counts),
        datasets: [
          {
            data: Object.values(counts),
            backgroundColor: [
              "#1976f5",
              "#63b8ff",
              "#79d3ba",
              "#b6a3ed",
              "#ffc775",
              "#ef9caa",
            ],
            borderWidth: 3,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              usePointStyle: true,
              padding: 20,
              color: "#536781",
              font: { size: 12 },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [candidate]); // eslint-disable-line react-hooks/exhaustive-deps
  const stats = [
    ["Applied jobs", jobs.length, "file-alt", "/applied-jobs"],
    ["Job alerts", candidate?.jobAlerts?.length || 0, "bell", "/job-alerts"],
    ["Messages", candidate?.messages?.length || 0, "envelope", "/messages"],
    [
      "Shortlisted jobs",
      candidate?.shortlistedJobs?.length || 0,
      "heart",
      "/shortlisted-jobs",
    ],
  ];
  const recent = [...jobs]
    .sort(
      (a, b) =>
        (new Date(b.appliedTime || b.time).getTime() || 0) -
        (new Date(a.appliedTime || a.time).getTime() || 0)
    )
    .slice(0, 3);
  const notifications = [...(candidate?.notifications || [])]
    .sort(
      (a, b) =>
        (new Date(b.time).getTime() || 0) - (new Date(a.time).getTime() || 0)
    )
    .slice(0, 3);
  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <PageHeading
          title={
            "Welcome back" +
            (candidate?.name ? ", " + candidate.name.split(" ")[0] : "")
          }
          description="Here’s your job search at a glance."
        >
          <Link className="ss-button" to="/find-jobs">
            Find jobs <span aria-hidden="true">→</span>
          </Link>
        </PageHeading>
        {error ? (
          <div className="ss-error">
            We couldn’t load your dashboard.{" "}
            <button onClick={load}>Try again</button>
          </div>
        ) : !candidate ? (
          <div className="ss-card ss-card-padding">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <>
            <div className="ss-stats">
              {stats.map(([label, count, icon, url]) => (
                <Link className="ss-card ss-stat" to={url} key={label}>
                  <div className="ss-stat-icon">
                    <i className={"la la-" + icon} aria-hidden="true" />
                  </div>
                  <div>
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                </Link>
              ))}
            </div>
            <div className="ss-grid">
              <section className="ss-card ss-card-padding">
                <h2>Application overview</h2>
                {jobs.length ? (
                  <>
                    <div className="ss-chart">
                      <canvas
                        ref={chartRef}
                        role="img"
                        aria-label={
                          "Application status chart for " +
                          jobs.length +
                          " applications"
                        }
                      />
                    </div>
                    <p
                      style={{ fontSize: 12, color: "#64748e", marginTop: 14 }}
                    >
                      {jobs.length} applications · All time
                    </p>
                  </>
                ) : (
                  <EmptyState
                    title="Your journey starts here"
                    description="Apply for a role to see your application breakdown."
                  />
                )}
              </section>
              <section className="ss-card ss-card-padding">
                <h2>Notifications</h2>
                {notifications.length ? (
                  notifications.map((n, i) => (
                    <div className="ss-list-row" key={n._id || i}>
                      <span className="ss-avatar">
                        <i className="la la-bell" aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{n.type || "New notification"}</strong>
                        <p>
                          {[n.companyName, n.JobTitle]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <small>{displayDate(n.time)}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="You’re all caught up"
                    description="New updates will appear here."
                  />
                )}
              </section>
            </div>
            <div className="ss-grid">
              <section className="ss-card ss-card-padding">
                <div
                  className="ss-actions"
                  style={{ justifyContent: "space-between", marginBottom: 12 }}
                >
                  <h2 style={{ margin: 0 }}>Recent applications</h2>
                  <Link to="/applied-jobs">View all</Link>
                </div>
                {recent.length ? (
                  recent.map((job, i) => (
                    <Link
                      className="ss-list-row"
                      key={job.jobId || i}
                      to={"/job-detail/" + job.employerId + "/" + job.jobId}
                    >
                      <Avatar
                        name={job.companyName || job.JobTitle}
                        image={job.image}
                      />
                      <div>
                        <strong>{job.JobTitle}</strong>
                        <p>
                          {[job.companyName, job.city || job.City]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span className="ss-status">
                        {job.status || "Pending"}
                      </span>
                    </Link>
                  ))
                ) : (
                  <EmptyState
                    title="No applications yet"
                    description="Find your next opportunity and apply."
                  />
                )}
              </section>
              <section className="ss-card ss-card-padding">
                <h2>Career tools</h2>
                {[
                  [
                    "CV Manager",
                    "Preview or update your saved resume",
                    "file-alt",
                    "/cv-manager",
                  ],
                  [
                    "View profile",
                    "Keep your professional details up to date",
                    "user",
                    "/candidates-profile-view",
                  ],
                  [
                    "Practice interviews",
                    "Prepare with video and coding practice",
                    "chart-bar",
                    "/practiceInterview",
                  ],
                ].map(([title, detail, icon, url]) => (
                  <Link className="ss-list-row" to={url} key={url}>
                    <span className="ss-avatar">
                      <i className={"la la-" + icon} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <p>{detail}</p>
                    </div>
                    <span aria-hidden="true">›</span>
                  </Link>
                ))}
              </section>
            </div>
          </>
        )}
        <PortalFooter />
      </div>
    </section>
  );
}
