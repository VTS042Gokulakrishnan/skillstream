import React, { useEffect, useMemo, useState } from "react";
import { companyJobCount } from "./companyJobs";
import { Link } from "react-router-dom";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../App";
import {
  Avatar,
  EmptyState,
  PageHeading,
  PortalFooter,
} from "../../Components/CandidateUI/PortalUI";
export default function EmployersList() {
  const [companies, setCompanies] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false);
  const [query, setQuery] = useState(""),
    [country, setCountry] = useState(""),
    [industry, setIndustry] = useState(""),
    [filters, setFilters] = useState({ query: "", country: "", industry: "" }),
    [page, setPage] = useState(1);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await axios.get(
        Server + "/api/v1/employer/allEmployers"
      );
      setCompanies(data.Employers || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, []);
  const filtered = useMemo(
    () =>
      companies.filter(
        (c) =>
          (c.companyName || "")
            .toLowerCase()
            .includes(filters.query.toLowerCase()) &&
          (!filters.country || c.country === filters.country) &&
          (!filters.industry ||
            (c.primaryIndustry || c.industry) === filters.industry)
      ),
    [companies, filters]
  );
  const countries = [
    ...new Set(companies.map((c) => c.country).filter(Boolean)),
  ].sort();
  const industries = [
    ...new Set(
      companies.map((c) => c.primaryIndustry || c.industry).filter(Boolean)
    ),
  ].sort();
  const pages = Math.max(1, Math.ceil(filtered.length / 9)),
    current = Math.min(page, pages);
  return (
    <main className="ss-company-page">
      <PageHeading
        title="Discover your next company"
        description="Explore employers and find the team where you belong."
      />
      <form
        className="ss-company-search ss-card"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters({ query: query.trim(), country, industry });
          setPage(1);
        }}
      >
        <label>
          Company name
          <input
            placeholder="Search companies"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Location
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Industry
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <button className="ss-button" type="submit">
          Search
        </button>
        <button
          type="button"
          className="ss-reset"
          onClick={() => {
            setQuery("");
            setCountry("");
            setIndustry("");
            setFilters({ query: "", country: "", industry: "" });
            setPage(1);
          }}
        >
          Reset
        </button>
      </form>
      <div className="ss-toolbar" style={{ padding: "0 0 20px" }}>
        <strong>
          {loading
            ? "Loading companies…"
            : filtered.length + " companies found"}
        </strong>
        <span>Explore companies</span>
      </div>
      {loading ? (
        <div className="ss-card ss-card-padding">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : error ? (
        <div className="ss-error">
          Couldn’t load companies. <button onClick={load}>Try again</button>
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title="No companies found"
          description="Try a different name, location or industry."
        />
      ) : (
        <>
          <div className="ss-company-grid">
            {filtered.slice((current - 1) * 9, current * 9).map((c) => {
              const count = companyJobCount(c.jobs);
              return (
                <article
                  className="ss-company-card ss-card"
                  key={c.userId || c._id}
                >
                  <Avatar name={c.companyName} image={c.image} />
                  <h2>
                    <Link to={"/employers/" + c.userId}>
                      {c.companyName || "Company"}
                    </Link>
                  </h2>
                  <p>
                    ⌖{" "}
                    {[c.city, c.country].filter(Boolean).join(", ") ||
                      "Location not provided"}
                  </p>
                  <p>
                    {c.primaryIndustry || c.industry || "Industry not provided"}
                  </p>
                  <div className="ss-company-card-footer">
                    <span
                      className={
                        "ss-status " + (count ? "ss-status-success" : "")
                      }
                    >
                      {count} {Array.isArray(c.jobs) ? "open " : ""}
                      {count === 1 ? "job" : "jobs"}
                    </span>
                    <Link to={"/employers/" + c.userId}>View company →</Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="ss-pagination">
            <span>
              Showing {(current - 1) * 9 + 1}–
              {Math.min(current * 9, filtered.length)} of {filtered.length}
            </span>
            <nav aria-label="Company pages">
              <button
                className="ss-icon-button"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              <span>
                {current} / {pages}
              </span>
              <button
                className="ss-icon-button"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          </div>
        </>
      )}
      <PortalFooter />
    </main>
  );
}
