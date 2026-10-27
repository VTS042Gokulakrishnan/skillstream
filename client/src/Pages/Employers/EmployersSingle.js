import React, { useEffect, useState } from "react";
import { activeCompanyJobs } from "./companyJobs";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Skeleton } from "antd";
import { Toaster, toast } from "react-hot-toast";
import { Server } from "../../App";
import {
  Avatar,
  EmptyState,
  PortalFooter,
  displayDate,
} from "../../Components/CandidateUI/PortalUI";
const safeWeb = (value) => {
  if (!value) return "";
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : "https://" + value
    );
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
export default function EmployersSingle() {
  const { id } = useParams(),
    navigate = useNavigate();
  const [company, setCompany] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [page, setPage] = useState(1);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await axios.get(Server + "/api/v1/employer/" + id);
      setCompany(data.Employer?.[0] || null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    setPage(1);
    window.scrollTo(0, 0);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const jobs = activeCompanyJobs(company?.jobs);
  const save = async (job) => {
    const userId = localStorage.getItem("UserId");
    if (!userId) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        Server + "/api/v1/candidate/shortlistJob/add/" + userId,
        {
          jobId: job.jobId,
          jobTitle: job.JobTitle,
          companyName: company.companyName,
          categories: job.Industry,
          city: job.City || company.city,
          country: job.Country || company.country,
          logo: company.image,
          empId: job.userId || id,
          email: job.EmailAddress,
          role: localStorage.getItem("Role"),
          region: "United States",
        }
      );
      toast.success("Job shortlisted");
    } catch {
      toast.error("Could not shortlist this job.");
    }
  };
  const website = safeWeb(company?.website);
  return (
    <main className="ss-company-page">
      <Toaster />
      <Link className="ss-back" to="/employers-list">
        ← Back to companies
      </Link>
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : error ? (
        <div className="ss-error">
          Couldn’t load this company. <button onClick={load}>Try again</button>
        </div>
      ) : !company ? (
        <EmptyState
          title="Company not found"
          description="Return to companies to explore other employers."
        />
      ) : (
        <>
          <div className="ss-profile-hero">
            <Avatar name={company.companyName} image={company.image} />
            <div>
              <h1>{company.companyName}</h1>
              <p>{company.primaryIndustry || company.industry}</p>
              <p>
                ⌖ {[company.city, company.country].filter(Boolean).join(", ")} ·{" "}
                {jobs.length} open jobs
              </p>
            </div>
            <div className="ss-actions">
              <a className="ss-button" href="#open-positions">
                View open jobs ↓
              </a>
              {website && (
                <a
                  className="ss-button ss-button-outline"
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit website ↗
                </a>
              )}
            </div>
          </div>
          <div className="ss-grid">
            <div>
              <section className="ss-card ss-card-padding">
                <h2>About the company</h2>
                <p style={{ whiteSpace: "pre-line", color: "#64748e" }}>
                  {company.description ||
                    "This company hasn’t added an introduction yet."}
                </p>
              </section>
              <section className="ss-card ss-card-padding" id="open-positions">
                <h2>
                  Open positions{" "}
                  <span style={{ color: "#0866ed" }}>({jobs.length})</span>
                </h2>
                {!jobs.length ? (
                  <EmptyState
                    title="No open positions"
                    description="This company has no active jobs at the moment."
                  />
                ) : (
                  jobs.slice((page - 1) * 3, page * 3).map((job) => (
                    <article className="ss-company-job" key={job.jobId}>
                      <Avatar
                        name={company.companyName}
                        image={company.image}
                      />
                      <div>
                        <h3>{job.JobTitle}</h3>
                        <p>
                          {[job.City, job.Country].filter(Boolean).join(", ")} ·{" "}
                          {displayDate(job.time)}
                        </p>
                        <p>{job.offeredSalary || "Salary not provided"}</p>
                        <div className="ss-actions">
                          <span className="ss-status">
                            {job.JobType || "Job"}
                          </span>
                          {job.employmentType && (
                            <span className="ss-status">
                              {job.employmentType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ss-actions">
                        <button
                          className="ss-icon-button"
                          onClick={() => save(job)}
                          aria-label={"Save " + job.JobTitle}
                        >
                          <i className="la la-bookmark" aria-hidden="true" />
                        </button>
                        <Link
                          className="ss-button ss-button-outline"
                          to={"/job-detail/" + id + "/" + job.jobId}
                        >
                          View details
                        </Link>
                      </div>
                    </article>
                  ))
                )}
                {jobs.length > 3 && (
                  <div className="ss-pagination">
                    <span>
                      Showing {(page - 1) * 3 + 1}–
                      {Math.min(page * 3, jobs.length)} of {jobs.length}
                    </span>
                    <nav>
                      <button
                        className="ss-icon-button"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        aria-label="Previous page"
                      >
                        ‹
                      </button>
                      <span>{page}</span>
                      <button
                        className="ss-icon-button"
                        disabled={page * 3 >= jobs.length}
                        onClick={() => setPage(page + 1)}
                        aria-label="Next page"
                      >
                        ›
                      </button>
                    </nav>
                  </div>
                )}
              </section>
            </div>
            <aside>
              <section className="ss-card ss-card-padding">
                <h2>Company overview</h2>
                <dl className="ss-facts">
                  {[
                    ["Industry", company.primaryIndustry || company.industry],
                    ["Company size", company.teamSize],
                    ["Founded", company.foundedIn],
                    [
                      "Location",
                      [company.city, company.country]
                        .filter(Boolean)
                        .join(", "),
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value || "Not provided"}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section className="ss-card ss-card-padding">
                <h2>Contact & links</h2>
                <dl className="ss-facts">
                  <div>
                    <dt>Email</dt>
                    <dd>
                      {company.email ? (
                        <a href={"mailto:" + company.email}>{company.email}</a>
                      ) : (
                        "Not provided"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{company.phone || "Not provided"}</dd>
                  </div>
                  {website && (
                    <div>
                      <dt>Website</dt>
                      <dd>
                        <a href={website} target="_blank" rel="noreferrer">
                          {company.website} ↗
                        </a>
                      </dd>
                    </div>
                  )}
                  {safeWeb(company.linkedIn) && (
                    <div>
                      <dt>LinkedIn</dt>
                      <dd>
                        <a
                          href={safeWeb(company.linkedIn)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Company profile ↗
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </aside>
          </div>
        </>
      )}
      <PortalFooter />
    </main>
  );
}
