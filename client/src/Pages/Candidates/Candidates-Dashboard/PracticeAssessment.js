import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Skeleton, Tabs, message } from "antd";
import moment from "moment";
import {
  EmptyState,
  PortalFooter,
} from "../../../Components/CandidateUI/PortalUI";
import practiceApi from "Components/PracticalInterview/practiceApi";
import PracticePlansModal from "Components/PracticalInterview/PracticePlansModal";

export default function PracticeAssessment() {
  const navigate = useNavigate();
  const [historyType, setHistoryType] = useState("all");
  const [historyPage, setHistoryPage] = useState(1);
  const [access, setAccess] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState({ video: [], coding: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [buying, setBuying] = useState("");
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [payment, setPayment] = useState("");
  const [verifying, setVerifying] = useState(false);
  const verificationAttempts = useRef(0);
  const [deleting, setDeleting] = useState("");
  const userId = localStorage.getItem("UserId");

  const refresh = async () => {
    const [status, video, coding] = await Promise.all([
      practiceApi.get("/access"),
      practiceApi.get(`/getInterview/${userId}`),
      practiceApi.get(`/get/coding/interview/${userId}`),
    ]);
    setAccess(status.data.access);
    setPlans(status.data.plans);
    setHistory({
      video: video.data.practiceInterview || [],
      coding: coding.data.practiceInterview || [],
    });
  };
  const verifyPayment = async () => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (!sessionId) return;
    verificationAttempts.current += 1;
    setVerifying(true);
    setError("");
    setPayment("processing");
    try {
      const { data } = await practiceApi.post("/payments/verify", {
        sessionId,
      });
      if (data.paid) {
        await refresh();
        setPayment("success");
        window.history.replaceState(null, "", window.location.pathname);
      } else setPayment("pending");
    } catch (err) {
      setPayment("pending");
      setError(
        err.response?.data?.message ||
          "Payment confirmation is not available yet. Retry confirmation before purchasing again."
      );
    } finally {
      setVerifying(false);
    }
  };
  useEffect(() => {
    let disposed = false;
    const load = async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        if (query.get("session_id")) await verifyPayment();
        else if (query.get("payment") === "cancelled") setPayment("cancelled");
        if (!disposed) await refresh();
      } catch (err) {
        if (!disposed)
          setError(
            err.response?.data?.message ||
              "Unable to load your practices. Please refresh or sign in again."
          );
      } finally {
        if (!disposed) setLoading(false);
      }
    };
    load();
    return () => {
      disposed = true;
    };
    // The dashboard loads once per visit; purchases explicitly refresh access.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (payment !== "pending" || verificationAttempts.current >= 12) return;
    const timer = setTimeout(() => verifyPayment(), 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment]);

  const purchase = async (planId) => {
    setBuying(planId);
    setCheckoutError("");
    try {
      const { data } = await practiceApi.post("/payments/checkout", { planId });
      window.location.assign(data.url);
    } catch (err) {
      setCheckoutError(
        err.response?.data?.message ||
          "Unable to open payment. Please try again."
      );
      setBuying("");
    }
  };
  const remove = async (type, id) => {
    setDeleting(id);
    try {
      const route =
        type === "coding" ? "delete/coding/interview" : "delete/interview";
      await practiceApi.delete(`/${route}/${userId}/${id}`);
      await refresh();
    } catch (_) {
      message.error("Unable to delete this interview. Please try again.");
    } finally {
      setDeleting("");
    }
  };
  const showPlans = () => {
    setCheckoutError("");
    setModalOpen(true);
  };
  const rows = ["video", "coding"]
    .flatMap((type) => history[type].map((item) => ({ ...item, type })))
    .filter((item) => historyType === "all" || item.type === historyType)
    .sort(
      (a, b) =>
        (new Date(b.Date).getTime() || 0) - (new Date(a.Date).getTime() || 0)
    );
  const page = Math.min(historyPage, Math.max(1, Math.ceil(rows.length / 5)));
  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Practice interviews</h3>
            <div className="text">
              Prepare with video and coding practice interviews.
            </div>
          </div>
          {access?.demo?.active && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Demo access"
              description={`${
                access.demo.remainingInterviews
              } demo interviews remaining, shared across ${access.demo.allowedTypes.join(
                " and "
              )}. Expires ${moment(access.demo.expiresAt).format(
                "MMM D, YYYY, h:mm A"
              )}. Demo interviews are used before paid credits.`}
            />
          )}
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              closable
              onClose={() => setError("")}
              style={{ marginBottom: 16 }}
            />
          )}
          {payment === "success" && (
            <Alert
              type="success"
              showIcon
              message="Payment successful. Your practice plan is ready."
            />
          )}
          {payment === "cancelled" && (
            <Alert
              type="info"
              showIcon
              message="Payment cancelled. No interviews were added."
            />
          )}
          {["processing", "pending"].includes(payment) && (
            <Alert
              type="info"
              showIcon
              message="Confirming your payment. Your access will appear once payment is verified."
              action={
                <Button loading={verifying} onClick={verifyPayment}>
                  Check payment
                </Button>
              }
            />
          )}

          {loading ? (
            <Skeleton active />
          ) : (
            access && (
              <>
                <div className="ss-practice-choices">
                  {["video", "coding"].map((type) => {
                    const coding = type === "coding",
                      allowed = coding ? access.canCoding : access.canVideo;
                    return (
                      <section className="ss-card ss-card-padding" key={type}>
                        <div className="ss-job-identity">
                          <span className="ss-practice-icon">
                            <i
                              className={coding ? "la la-code" : "la la-video"}
                              aria-hidden="true"
                            />
                          </span>
                          <div>
                            <h2>{coding ? "Coding" : "Video"} practice</h2>
                            <p>
                              {coding
                                ? "Solve programming questions in a focused coding workspace."
                                : "Practise answering role-specific questions aloud."}
                            </p>
                          </div>
                        </div>
                        <div className="ss-practice-features">
                          <span>
                            {coding
                              ? "Choose difficulty"
                              : "Camera & microphone"}
                          </span>
                          <span>
                            {coding ? "Run your code" : "Screen sharing"}
                          </span>
                        </div>
                        {access.purchased && (
                          <p className="ss-preparing-note">
                            {access.unlimited
                              ? "Unlimited access until " +
                                moment(access.unlimitedUntil).format(
                                  "MMM D, YYYY"
                                )
                              : (coding ? "Coding" : "Video") +
                                " interviews remaining: " +
                                access[type]}
                          </p>
                        )}
                        <Button
                          type="primary"
                          block
                          size="large"
                          disabled={verifying || payment === "pending"}
                          onClick={() =>
                            allowed
                              ? navigate("/practicalAssessment", {
                                  state: { round: coding ? "Coding" : "Video" },
                                })
                              : showPlans()
                          }
                        >
                          {allowed
                            ? "Set up " + type + " practice →"
                            : "Purchase " + type + " practice"}
                        </Button>
                      </section>
                    );
                  })}
                </div>
                <div className="ss-purchase-center">
                  <Button
                    size="large"
                    onClick={showPlans}
                    disabled={verifying || payment === "pending"}
                  >
                    Purchase practice interviews
                  </Button>
                </div>
                <section className="ss-card">
                  <div className="ss-toolbar">
                    <h2>My practice history</h2>
                    <div className="ss-segment">
                      {["all", "video", "coding"].map((type) => (
                        <button
                          key={type}
                          className={historyType === type ? "active" : ""}
                          onClick={() => {
                            setHistoryType(type);
                            setHistoryPage(1);
                          }}
                        >
                          {type[0].toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!rows.length ? (
                    <EmptyState
                      title="No practice interviews yet"
                      description="Your completed sessions and report links will appear here."
                    />
                  ) : (
                    <>
                      <div className="ss-table-scroll">
                        <table className="ss-table">
                          <thead>
                            <tr>
                              <th>Interview title</th>
                              <th>Type</th>
                              <th>Date</th>
                              <th>Report</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows
                              .slice((page - 1) * 5, page * 5)
                              .map((item, index) => (
                                <tr key={item.type + (item.videoId || index)}>
                                  <td>
                                    <strong>{item.jobTitle}</strong>
                                  </td>
                                  <td>
                                    {item.type === "video" ? "Video" : "Coding"}
                                  </td>
                                  <td>
                                    {moment(item.Date).isValid()
                                      ? moment(item.Date).format("MMM D, YYYY")
                                      : "—"}
                                  </td>
                                  <td>
                                    {item.feedbackReport ? (
                                      <span className="ss-status ss-status-success">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="ss-status">
                                        Not available yet
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="ss-actions">
                                      {item.feedbackReport && (
                                        <a
                                          href={item.feedbackReport}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Open report →
                                        </a>
                                      )}
                                      {item.video && <a href={item.video} target="_blank" rel="noreferrer">Watch recording →</a>}
                                      <Button
                                        size="small"
                                        danger
                                        loading={deleting === item.videoId}
                                        onClick={() =>
                                          remove(item.type, item.videoId)
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="ss-pagination">
                        <span>{rows.length} interviews</span>
                        <nav>
                          <button
                            className="ss-icon-button"
                            disabled={page === 1}
                            onClick={() => setHistoryPage(page - 1)}
                            aria-label="Previous page"
                          >
                            ‹
                          </button>
                          <span>{page}</span>
                          <button
                            className="ss-icon-button"
                            disabled={page * 5 >= rows.length}
                            onClick={() => setHistoryPage(page + 1)}
                            aria-label="Next page"
                          >
                            ›
                          </button>
                        </nav>
                      </div>
                    </>
                  )}
                </section>
                <PortalFooter />
              </>
            )
          )}
          <PracticePlansModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            plans={plans}
            onPurchase={purchase}
            buying={buying}
            error={checkoutError}
          />
        </div>
      </section>
    </div>
  );
}
