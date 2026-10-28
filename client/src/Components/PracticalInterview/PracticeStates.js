import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import BrandLoader from "../Loader/BrandLoader";
import { Video, Code2 } from "lucide-react";
import practiceApi from "./practiceApi";
import logo from "../../assets/logo-twos.png";
export function PracticeHeader({ type, title, children, assessment = false }) {
  return (
    <header className="ss-session-header">
      <img src={logo} alt="SkillStream" />
      <div className="ss-practice-heading">
        <span className="ss-practice-type">{type === "Coding" ? <Code2 size={17} /> : <Video size={17} />}{type} {assessment ? "assessment" : "practice"}</span>
        <span className="ss-practice-role">{title}</span>
      </div>
      {children}
    </header>
  );
}
export function PracticeLoading({
  title = "Preparing your interview",
  description = "Preparing questions based on your role and resume. Please keep this tab open.",
}) {
  return (
    <div className="ss-session-state" role="status" aria-live="polite">
      <BrandLoader size="compact" label="" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
export function PracticeRetry({ onRetry, loading }) {
  return (
    <section className="ss-session-state" role="alert">
      <span className="ss-state-warning">!</span>
      <h2>We couldn’t confirm your submission</h2>
      <p>
        Keep this tab open and retry. Your recording is still available in this
        session.
      </p>
      <Button type="primary" size="large" loading={loading} onClick={onRetry}>
        Retry submission
      </Button>
    </section>
  );
}
export function PracticeResult({ type, sessionId, jobTitle }) {
  const [report, setReport] = useState(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(false);
  const check = async () => {
    setLoading(true);
    setError(false);
    try {
      const path = type === "coding" ? "get/coding/interview" : "getInterview";
      const { data } = await practiceApi.get(
        `/${path}/${localStorage.getItem("UserId")}`
      );
      setReport(
        (data.practiceInterview || []).find(
          (item) => item.videoId === sessionId
        ) || null
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    check();
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="ss-result ss-card ss-card-padding">
      <span className="ss-state-success">✓</span>
      <h1>Interview completed</h1>
      <p>Your responses have been submitted successfully.</p>
      <dl className="ss-result-facts">
        <div>
          <dt>Role</dt>
          <dd>{jobTitle}</dd>
        </div>
        <div>
          <dt>Practice type</dt>
          <dd>{type === "coding" ? "Coding" : "Video"} practice</dd>
        </div>
        <div>
          <dt>Completed on</dt>
          <dd>
            {report?.Date
              ? new Date(report.Date).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </dd>
        </div>
      </dl>
      <div className="ss-report-box">
        <h2>Interview report</h2>
        <p>Review your submitted responses and available feedback.</p>
        {report?.video ? (
          <a
            className="ss-button"
            href={report.video}
            target="_blank"
            rel="noreferrer"
          >
            Open report ↗
          </a>
        ) : (
          <>
            <p>
              {error
                ? "We couldn’t check your report. Please try again."
                : "Your report link is not available yet."}
            </p>
            <Button loading={loading} onClick={check}>
              Check again
            </Button>
          </>
        )}
      </div>
      <h3>Review your practice</h3>
      <p>Use the available feedback to plan your next practice session.</p>
      <div className="ss-info">
        Detailed scores are shown only when provided in the report.
      </div>
      <div className="ss-result-actions">
        <Link className="ss-button ss-button-outline" to="/practiceInterview">
          Back to practice history
        </Link>
        <Link className="ss-button" to="/practiceInterview">
          Practice again →
        </Link>
      </div>
    </section>
  );
}
