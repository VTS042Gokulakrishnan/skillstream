import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Skeleton, Tabs, message } from "antd";
import moment from "moment";
import practiceApi from "Components/PracticalInterview/practiceApi";
import PracticePlansModal from "Components/PracticalInterview/PracticePlansModal";

export default function PracticeAssessment() {
  const navigate = useNavigate();
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
    setHistory({ video: video.data.practiceInterview || [], coding: coding.data.practiceInterview || [] });
  };
  const verifyPayment = async () => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;
    verificationAttempts.current += 1;
    setVerifying(true);
    setError("");
    setPayment("processing");
    try {
      const { data } = await practiceApi.post("/payments/verify", { sessionId });
      if (data.paid) {
        await refresh();
        setPayment("success");
        window.history.replaceState(null, "", window.location.pathname);
      } else setPayment("pending");
    } catch (err) {
      setPayment("pending");
      setError(err.response?.data?.message || "Payment confirmation is not available yet. Retry confirmation before purchasing again.");
    } finally { setVerifying(false); }
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
        if (!disposed) setError(err.response?.data?.message || "Unable to load your practices. Please refresh or sign in again.");
      } finally { if (!disposed) setLoading(false); }
    };
    load();
    return () => { disposed = true; };
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
      setCheckoutError(err.response?.data?.message || "Unable to open payment. Please try again.");
      setBuying("");
    }
  };
  const remove = async (type, id) => {
    setDeleting(id);
    try {
      const route = type === "coding" ? "delete/coding/interview" : "delete/interview";
      await practiceApi.delete(`/${route}/${userId}/${id}`);
      await refresh();
    } catch (_) { message.error("Unable to delete this interview. Please try again."); }
    finally { setDeleting(""); }
  };
  const showPlans = () => { setCheckoutError(""); setModalOpen(true); };
  const renderTab = (type) => {
    const coding = type === "coding";
    const canStart = coding ? access?.canCoding : access?.canVideo;
    const label = coding ? "Coding" : "Video";
    return <>
      <div className="practice-assessment-actions">
        {canStart && <Button type="primary" size="large" disabled={verifying}
          onClick={() => navigate("/practicalAssessment", { state: { round: label } })}>
          Practice {label} Assessment
        </Button>}
        <Button type={canStart ? "default" : "primary"} size="large" onClick={showPlans} disabled={verifying || payment === "pending"}>
          Purchase Practice Interviews
        </Button>
        {access?.purchased && <span className="practice-assessment-balance">
          {access.unlimited ? `Unlimited access until ${moment(access.unlimitedUntil).format("MMM D, YYYY, h:mm A")}`
            : `${label} interviews remaining: ${access[type]}`}
        </span>}
      </div>
      <div className="ls-widget">
        <div className="widget-title"><h4>My {label} Practice Assessments</h4></div>
        <div className="widget-content"><div className="table-outer">
          {!history[type].length ? <p className="text-center">No Assessments</p> :
            <table className="default-table manage-job-table">
              <thead><tr><th>Job Title</th><th>Interview Date</th><th>Action</th></tr></thead>
              <tbody>{history[type].map((item, index) => <tr key={item.videoId || index}>
                <td>{item.jobTitle}</td><td>{moment(item.Date).format("MMM Do YYYY")}</td>
                <td><div style={{ display: "flex", gap: 12 }}>
                  <a href={item.video} target="_blank" rel="noreferrer">View result</a>
                  <Button size="small" danger loading={deleting === item.videoId} onClick={() => remove(type, item.videoId)}>Delete</Button>
                </div></td>
              </tr>)}</tbody>
            </table>}
        </div></div>
      </div>
    </>;
  };

  return <div><section className="user-dashboard"><div className="dashboard-outer">
    <div className="upper-title-box"><h3>Practice Assessment</h3>
      <div className="text">Prepare with video and coding practice interviews.</div></div>
    {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} style={{ marginBottom: 16 }} />}
    {payment === "success" && <Alert type="success" showIcon message="Payment successful. Your practice plan is ready." />}
    {payment === "cancelled" && <Alert type="info" showIcon message="Payment cancelled. No interviews were added." />}
    {["processing", "pending"].includes(payment) && <Alert type="info" showIcon
      message="Confirming your payment. Your access will appear once payment is verified."
      action={<Button loading={verifying} onClick={verifyPayment}>Check payment</Button>} />}
    {loading ? <Skeleton active /> : access && <Tabs items={[
      { key: "video", label: "Video Assessment", children: renderTab("video") },
      { key: "coding", label: "Coding Practice", children: renderTab("coding") },
    ]} />}
    <PracticePlansModal open={modalOpen} onClose={() => setModalOpen(false)} plans={plans}
      onPurchase={purchase} buying={buying} error={checkoutError} />
  </div></section></div>;
}
