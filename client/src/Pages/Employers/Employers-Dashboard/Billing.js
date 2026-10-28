import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Server } from "App";

/**
 * ✅ Billing page updates
 * - Shows Current Plan clearly (Trial / Subscribed / Inactive / Recruiter Access)
 * - Upgrade modal shows 3 options: Free Trial + Monthly + Yearly
 * - Free Trial is always "automatic" (no start button), and can be locked:
 *    - if Subscribed OR (Trial expired AND Not Subscribed)
 * - Payment & invoices only for Subscribed users
 */

const Billing = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("UserId");
  const role = localStorage.getItem("Role");

  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({jobs:0});

  const [billingStatus, setBillingStatus] = useState(""); // Recruiter Access | Not Subscribed | Trial | Subscribed | Error
  const [plan, setPlan] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [trialInfo, setTrialInfo] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const [subscriptionId, setSubscriptionId] = useState(null);

  // Payment method (best-effort from invoices)
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Upgrade modal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  // Recruiter access rules
  const recruiterDomains = useMemo(
    () => ["@hrpundits.com", "@vivatechsolutions.io", "@growthiq.net"],
    []
  );
  const recruiterEmails = useMemo(() => ["nischalakrishna@gmail.com"], []);

  // ✅ Pricing rules
  const MONTHLY_PRICE = 249;
  const YEARLY_PRICE = MONTHLY_PRICE * 12;

  // ✅ Stripe price IDs
  const STRIPE_PRICE_ID_MONTHLY = "price_1PdWn2P218aRnkr8eMEL98xa";
  const STRIPE_PRICE_ID_YEARLY = "price_REPLACE_WITH_YEARLY_PRICE_ID";

  // ✅ test email: treat as NOT recruiter access even though domain matches
  // const TEST_FREE_TRIAL_EMAILS = ["gokulakrishnan@vivatechsolutions.io"];
  const TEST_FREE_TRIAL_EMAILS = [];

  const isRecruiterAccessEmail = (email = "") => {
    const lower = String(email).toLowerCase().trim();
    if (!lower) return false;
    if (TEST_FREE_TRIAL_EMAILS.includes(lower)) return false; // test overrides recruiter access
    if (recruiterEmails.includes(lower)) return true;
    return recruiterDomains.some((d) => lower.endsWith(d));
  };

  const safeDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const daysBetween = (from, to) => {
    if (!from || !to) return null;
    const ms = to.getTime() - from.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (!token) {
      navigate("/employers");
      return;
    }
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getUser = async () => {
    try {
      setLoading(true);

      const decoded = jwtDecode(token);
      const res = await axios.get(`${Server}/api/v1/employer/${decoded?.userId}`);
      const employer = res?.data?.Employer?.[0];
      setUsage({jobs:employer?.jobs?.length || 0});

      if (!employer) {
        setBillingStatus("Error");
        toast.error("Employer data not found.");
        setLoading(false);
        return;
      }

      const email =
        employer?.email ||
        employer?.companyEmail ||
        employer?.employerEmail ||
        "";

      // ✅ Recruiter Access override
      if (isRecruiterAccessEmail(email)) {
        setBillingStatus("Recruiter Access");
        setPlan("Recruiter Access");
        setTransactions([]);
        setTrialInfo(null);
        setSubscriptionInfo(null);
        setSubscriptionId(null);
        setPaymentMethod(null);
        setLoading(false);
        return;
      }

      // Plan label (display)
      if (employer?.plan) setPlan(employer.plan);
      else if (employer?.subscribed && !employer?.trialStart) setPlan("Recommended");
      else setPlan("");

      // Dates
      const now = new Date();
      const trialStarts = safeDate(employer?.trialStart);
      const trialEnds = safeDate(employer?.trialEnds);

      const subscriptionStart = safeDate(employer?.subscriptionStart);
      const subscriptionEnds = safeDate(employer?.subscriptionEnds);

      // Trial status
      const isTrialConfigured = !!trialStarts && !!trialEnds;
      const isTrialActive = isTrialConfigured && now >= trialStarts && now <= trialEnds;
      const isTrialExpired = isTrialConfigured && now > trialEnds;

      if (isTrialConfigured) {
        setTrialInfo({
          trialStarts,
          trialEnds,
          daysLeft: isTrialActive ? daysBetween(now, trialEnds) : 0,
          isActive: isTrialActive,
          isExpired: isTrialExpired,
        });
      } else {
        setTrialInfo(null);
      }

      // Subscription status
      const isSubscribed = !!employer?.subscribed;
      const isSubscriptionActive =
        isSubscribed && (!!subscriptionEnds ? now <= subscriptionEnds : true);

      if (subscriptionStart || subscriptionEnds) {
        setSubscriptionInfo({
          subscriptionStart,
          subscriptionEnds,
          isActive: isSubscriptionActive,
        });
      } else {
        setSubscriptionInfo(null);
      }

      // Decide billingStatus
      if (isTrialActive) {
        setBillingStatus("Trial");
        setTransactions([]);
        setSubscriptionId(null);
        setPaymentMethod(null);
        setLoading(false);
        return;
      }

      if (isSubscriptionActive && employer?.stripeCustomerId) {
        setBillingStatus("Subscribed");
        await fetchPlanDetails(employer?.stripeCustomerId);
        await fetchTransactions(employer?.stripeCustomerId);
        setLoading(false);
        return;
      }

      // Not subscribed
      if (!isSubscribed || isTrialExpired || !isSubscriptionActive) {
        setBillingStatus("Not Subscribed");
        setTransactions([]);
        setSubscriptionId(null);
        setPaymentMethod(null);
        setLoading(false);
        return;
      }

      setBillingStatus("Not Subscribed");
      setLoading(false);
    } catch (e) {
      console.error(e);
      setBillingStatus("Error");
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  // Stripe APIs
  const fetchPlanDetails = async (customerId) => {
    try {
      const res = await axios.get(
        `${Server}/api/v1/subscribe/get/plan?customerId=${customerId}`
      );
      const stripePlanName = res?.data?.plan?.name || "";
      const subId = res?.data?.plan?.subscriptionId || null;

      setSubscriptionId(subId);
      if (stripePlanName) setPlan(stripePlanName);
    } catch (e) {
      console.error("Error fetching plan details:", e);
    }
  };

  const fetchTransactions = async (customerId) => {
    try {
      const res = await axios.get(
        `${Server}/api/v1/subscribe/get/transaction?customerId=${customerId}`
      );

      const invoices = res?.data?.transactions || [];
      setTransactions(invoices);

      const first = invoices?.[0];
      const pmd =
        first?.payment_intent?.payment_method?.card ||
        first?.charge?.payment_method_details?.card ||
        first?.payment_method_details?.card ||
        null;

      if (pmd) {
        setPaymentMethod({
          type: "card",
          brand: pmd.brand,
          last4: pmd.last4,
          exp_month: pmd.exp_month,
          exp_year: pmd.exp_year,
        });
      } else {
        setPaymentMethod(null);
      }
    } catch (e) {
      console.error("Error fetching transactions:", e);
      toast.error("Failed to load billing history.");
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionId) {
      toast.error("Subscription ID not found.");
      return;
    }
    try {
      setIsCancelling(true);
      await axios.get(
        `${Server}/api/v1/subscribe/cancel/subscription?subscriptionId=${subscriptionId}`
      );
      toast.success("Cancellation scheduled at period end.");
      await getUser();
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel subscription.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setIsManaging(true);

      const res = await axios.post(`${Server}/api/v1/subscribe/portal`, {
        returnUrl: window.location.origin + "/billing",
      });

      const url = res?.data?.url;
      if (!url) {
        toast.error("Failed to open billing portal.");
        return;
      }
      window.location.href = url;
    } catch (e) {
      console.error(e);
      toast.error("Failed to open billing portal.");
    } finally {
      setIsManaging(false);
    }
  };

  const handleSubscribeFromBilling = async (p) => {
    try {
      if (!token) {
        navigate("/employers");
        return;
      }

      if (
        p.period === "yearly" &&
        (!p.priceId || String(p.priceId).includes("REPLACE_WITH_YEARLY_PRICE_ID"))
      ) {
        toast.error("Please paste your Yearly Stripe priceId in Billing page.");
        return;
      }

      setIsSubscribing(true);

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

      const body = {
        plan: p.badge,
        amount: p.amount,
        userId,
        product: "Recommended Full Access",
        priceId: p.priceId,
        role: role || "Employer",
        period: p.period,
      };

      const { data } = await axios.post(
        `${Server}/api/v1/subscribe/US/create/checkout-session`,
        body
      );

      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (e) {
      console.error(e);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const displayedPlanLabel = () => {
    if (billingStatus === "Trial") return "Free Trial";
    if (!plan) return "No Active Plan";
    if (plan === "Recommended") return "Recommended Plan";
    if (plan === "Recruiter Access") return "Recruiter Access";
    return `${plan} Plan`;
  };

  const statusPill = () => {
    const map = {
      "Recruiter Access": {
        label: "Admin Access",
        bg: "#EEF2FF",
        color: "#3730A3",
      },
      Trial: { label: "Free Trial", bg: "#ECFDF3", color: "#065F46" },
      Subscribed: { label: "Active", bg: "#EFF6FF", color: "#1D4ED8" },
      "Not Subscribed": { label: "Inactive", bg: "#FEF2F2", color: "#991B1B" },
      Error: { label: "Error", bg: "#FEF2F2", color: "#991B1B" },
    };
    const s = map[billingStatus] || {
      label: billingStatus,
      bg: "#F3F4F6",
      color: "#111827",
    };
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 999,
          background: s.bg,
          color: s.color,
          fontWeight: 500,
          fontSize: 12,
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: s.color,
            display: "inline-block",
          }}
        />
        {s.label}
      </span>
    );
  };

  // ✅ Free trial disable rule
  const freeTrialDisabled =
    billingStatus === "Subscribed" ||
    (trialInfo?.isExpired && billingStatus === "Not Subscribed");

  // ✅ Upgrade plans includes Free Trial card (no button)
  const upgradePlans = useMemo(() => {
    const freeTrialPlan = {
      type: "trial",
      badge: "Free Trial (14 Days)",
      priceText: "$0",
      durationText: "/trial",
      amount: 0,
      period: "trial",
      priceId: null,
      features: [
        "Unlimited Job Postings",
        "Unlimited access to Database",
        "AI Resume Search",
        "AI Fitment Analysis",
        "AI Video Interview",
        "Email Support",
        "14 Days Trial",
      ],
    };

    const monthly = {
      type: "monthly",
      badge: "Recommended (Monthly)",
      priceText: `$${MONTHLY_PRICE}`,
      durationText: "/month",
      amount: MONTHLY_PRICE,
      period: "monthly",
      priceId: STRIPE_PRICE_ID_MONTHLY,
      features: [
        "Unlimited Job Postings",
        "Unlimited access to Database",
        "AI Resume Search",
        "AI Fitment Analysis",
        "AI Video Interview",
        "Email Support",
      ],
    };

    const yearly = {
      type: "yearly",
      badge: "Recommended (Yearly)",
      priceText: `$${YEARLY_PRICE}`,
      durationText: "/year",
      amount: YEARLY_PRICE,
      period: "yearly",
      priceId: STRIPE_PRICE_ID_YEARLY,
      features: [
        "Unlimited Job Postings",
        "Unlimited access to Database",
        "AI Resume Search",
        "AI Fitment Analysis",
        "AI Video Interview",
        "Email Support",
      ],
    };

    return [freeTrialPlan, monthly, yearly];
  }, [YEARLY_PRICE]);

  const pageWrapStyle = {
    maxWidth: "100%",
    margin: "0 auto",
    padding: "0 0 24px",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    borderRadius: 12,
    boxShadow: "none",
    overflow: "hidden",
  };

  const cardHeaderStyle = {
    padding: "20px 24px",
    background:
      "#ffffff",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const cardBodyStyle = { padding: 24 };

  const primaryBtnStyle = (disabled) => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    background: "#0785f9",
    color: "#fff",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    boxShadow: "none",
  });

  const ghostBtnStyle = (disabled) => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(15, 23, 42, 0.14)",
    background: "#fff",
    color: "#0F172A",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  });

  const dangerBtnStyle = (disabled) => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.30)",
    background: "#fff",
    color: "#B91C1C",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  });

  const sectionTitle = {
    margin: 0,
    fontSize: 16,
    fontWeight: 650,
    color: "#0F172A",
  };

  const mutedText = { margin: "6px 0 0", color: "#475569", fontSize: 13 };

  const labelText = { color: "#64748B", fontSize: 12, fontWeight: 600 };
  const valueText = { color: "#0F172A", fontSize: 14, fontWeight: 650 };

  const divider = {
    height: 1,
    background: "rgba(15, 23, 42, 0.08)",
    margin: "14px 0",
  };

  if (loading) return <p>Loading...</p>;

  const currentPlanLine = () => {
    if (billingStatus === "Recruiter Access") return "Recruiter Access";
    if (billingStatus === "Trial") {
      return `Free Trial • Ends on ${
        trialInfo?.trialEnds ? formatDate(trialInfo.trialEnds) : "-"
      }`;
    }
    if (billingStatus === "Subscribed") {
      return `${displayedPlanLabel()} • Ends on ${
        subscriptionInfo?.subscriptionEnds
          ? formatDate(subscriptionInfo.subscriptionEnds)
          : "-"
      }`;
    }
    return "No Active Subscription";
  };

  return (
    <>
      <section className="em-billing">
        <Toaster position="top-center" reverseOrder={false} />
        <br />

        <div className="upper-title-box" style={pageWrapStyle}>
          <h3 style={{ marginBottom: 6 }}>Billing</h3>
          <p className="text" style={{ marginTop: 0 }}>
            Manage subscription, payment method, and invoices.
          </p>
        </div>

        <div style={pageWrapStyle}>
          { /* Current plan and usage */ }
          <div className="em-billing-overview"><div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h2 style={sectionTitle}>Your current plan</h2>
                <p style={mutedText}>Your current plan status and key dates.</p>
              </div>
              {statusPill()}
            </div>

            <div style={cardBodyStyle}>
              {/* ✅ Current plan line (missing earlier) */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  background: "#F8FAFC",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  color: "#0F172A",
                  fontWeight: 650,
                  lineHeight: 1.4,
                }}
              >
                <span className="em-plan-name">{currentPlanLine()}</span>
              </div>

              <div style={{ height: 10 }} />

              {/* Messages */}
              {billingStatus === "Recruiter Access" && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#EEF2FF",
                    border: "1px solid rgba(55,48,163,0.15)",
                    color: "#1E1B4B",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  You have full access provided by the admin.
                  <br />
                  <span style={{ fontWeight: 650 }}>
                    Billing and transactions are managed by the admin.
                  </span>
                </div>
              )}

              {billingStatus === "Not Subscribed" && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#FEF2F2",
                    border: "1px solid rgba(153,27,27,0.15)",
                    color: "#7F1D1D",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  You don’t have an active subscription.
                  {trialInfo?.isExpired ? (
                    <>
                      {" "}
                      Your trial expired on{" "}
                      <strong>{formatDate(trialInfo.trialEnds)}</strong>.
                    </>
                  ) : null}
                </div>
              )}

              {billingStatus === "Trial" && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#ECFDF3",
                    border: "1px solid rgba(6,95,70,0.15)",
                    color: "#064E3B",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  You are currently on a <strong>Free Trial</strong>. Upgrade anytime.
                </div>
              )}

              {billingStatus === "Subscribed" && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "#EFF6FF",
                    border: "1px solid rgba(29,78,216,0.15)",
                    color: "#1E3A8A",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  Your subscription is active. You can manage billing or cancel at period end.
                </div>
              )}

              <div style={divider} />

              {/* Actions */}
              {billingStatus !== "Recruiter Access" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {(billingStatus === "Trial" || billingStatus === "Not Subscribed") && (
                    <>
                      <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        disabled={isSubscribing}
                        style={primaryBtnStyle(isSubscribing)}
                      >
                        Upgrade
                      </button>

                      <button onClick={() => navigate("/pricing")} style={ghostBtnStyle(false)}>
                        View Plans
                      </button>
                    </>
                  )}

                  {billingStatus === "Subscribed" && (
                    <>
                      <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        disabled={isSubscribing}
                        style={primaryBtnStyle(isSubscribing)}
                      >
                        Upgrade
                      </button>

                      <button
                        onClick={handleManageBilling}
                        disabled={isManaging}
                        style={ghostBtnStyle(isManaging)}
                      >
                        {isManaging ? "Opening..." : "Manage Billing"}
                      </button>

                      <button
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        style={dangerBtnStyle(isCancelling)}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <section className="em-card em-plan-usage"><h2>Plan activity</h2><div className="em-plan-usage-row"><span>Jobs posted</span><strong>{usage.jobs}</strong></div><div className="em-plan-usage-row"><span>Subscription status</span>{statusPill()}</div><div className="em-plan-usage-row"><span>{billingStatus === "Trial" ? "Trial ends":"Current period ends"}</span><strong>{formatDate(billingStatus === "Trial" ? trialInfo?.trialEnds : subscriptionInfo?.subscriptionEnds)}</strong></div><p>Usage limits are determined by your current plan.</p></section></div>
          {/* Payment and invoices */}
          {billingStatus === "Subscribed" && (
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr)",
                gap: 18,
              }}
            >
              {/* Payment method card */}
              <div className="em-payment-card" style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div>
                    <h2 style={sectionTitle}>Payment method</h2>
                    <p style={mutedText}>Manage the payment method used for your subscription.</p>
                    <button className="em-primary" onClick={handleManageBilling} disabled={isManaging}>{isManaging ? "Opening…":"Update payment method"}</button>
                  </div>
                </div>

                <div style={cardBodyStyle}>
                  {paymentMethod ? (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: "1px solid rgba(15, 23, 42, 0.10)",
                        background: "#F8FAFC",
                      }}
                    >
                      <div style={labelText}>Card</div>
                      <div style={{ ...valueText, marginTop: 4 }}>
                        {String(paymentMethod.brand || "CARD").toUpperCase()} •••• {paymentMethod.last4}
                      </div>
                      <div style={{ marginTop: 8, color: "#475569", fontWeight: 500 }}>
                        Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "#475569", fontWeight: 500, lineHeight: 1.5 }}>
                      Payment method isn’t available from invoices.
                      <br />
                      Use <strong>Manage Billing</strong> to view/update cards in Stripe.
                    </div>
                  )}
                </div>
              </div>

              {/* Billing history card */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div>
                    <h2 style={sectionTitle}>Invoices</h2>
                    <p style={mutedText}>View and download past invoices.</p>
                  </div>
                </div>

                <div style={{ padding: 18, paddingTop: 10 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", fontSize: 12, color: "#64748B", padding: "10px 8px", borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}>
                            Date
                          </th>
                          <th style={{ textAlign: "left", fontSize: 12, color: "#64748B", padding: "10px 8px", borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}>
                            Status
                          </th>
                          <th style={{ textAlign: "right", fontSize: 12, color: "#64748B", padding: "10px 8px", borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}>
                            Amount
                          </th>
                          <th style={{padding:"10px 16px",textAlign:"right"}}>Invoice</th>
                        </tr>
                      </thead>

                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((invoice, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: "12px 8px", borderBottom: "1px solid rgba(15, 23, 42, 0.06)", fontWeight: 600, color: "#0F172A" }}>
                                <a
                                  href={invoice.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#2563EB", textDecoration: "none", fontWeight: 650 }}
                                >
                                  {new Date(invoice.created * 1000).toLocaleDateString()}
                                </a>
                              </td>

                              <td style={{ padding: "12px 8px", borderBottom: "1px solid rgba(15, 23, 42, 0.06)" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 650,
                                    background: invoice.status === "paid" ? "#ECFDF3" : invoice.status === "open" ? "#EFF6FF" : "#F3F4F6",
                                    color: invoice.status === "paid" ? "#065F46" : invoice.status === "open" ? "#1D4ED8" : "#111827",
                                    border: "1px solid rgba(15, 23, 42, 0.06)",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {invoice.status || "-"}
                                </span>
                              </td>

                              <td style={{ padding: "12px 8px", borderBottom: "1px solid rgba(15, 23, 42, 0.06)", textAlign: "right", fontWeight: 650, color: "#0F172A" }}>
                                ${((invoice.amount_due ?? 0) / 100).toFixed(2)}
                              </td>
                              <td style={{padding:"12px 16px",textAlign:"right"}}>{invoice.invoice_pdf || invoice.hosted_invoice_url ? <a href={invoice.invoice_pdf || invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">Download ↗</a> : "—"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ padding: 14, color: "#475569", fontWeight: 500 }}>
                              No billing history found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 10, color: "#64748B", fontSize: 12, fontWeight: 500 }}>
                    Tip: Use “Manage Billing” to download invoices and update payment methods.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ UPGRADE MODAL with Free Trial + Monthly + Yearly */}
        {isUpgradeModalOpen && (
          <div
            onClick={() => setIsUpgradeModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 980,
                background: "#fff",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
                border: "1px solid rgba(15,23,42,0.10)",
              }}
            >
              {/* header */}
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid rgba(15,23,42,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(180deg, rgba(59,130,246,0.10) 0%, rgba(255,255,255,1) 90%)",
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 950, color: "#0F172A" }}>
                    Upgrade Plan
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#475569", marginTop: 4 }}>
                    Free trial is automatic. Choose monthly or yearly to subscribe.
                  </div>
                </div>

                <button
                  onClick={() => setIsUpgradeModalOpen(false)}
                  style={{
                    border: "1px solid rgba(15,23,42,0.14)",
                    background: "#fff",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontWeight: 650,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>

              {/* body */}
              <div style={{ padding: 18 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 16,
                  }}
                >
                  {upgradePlans.map((p, idx) => {
                    const isTrialCard = p.type === "trial";
                    const locked = isTrialCard && freeTrialDisabled;

                    return (
                      <div
                        key={idx}
                        style={{
                          border: "1px solid rgba(15,23,42,0.10)",
                          borderRadius: 16,
                          padding: 16,
                          position: "relative",
                          background: "#fff",
                          boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
                          opacity: locked ? 0.6 : 1,
                        }}
                      >
                        {/* lock overlay (single lock) */}
                        {locked && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: 16,
                              background: "rgba(255,255,255,0.65)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 14,
                            }}
                          >
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 12px",
                                borderRadius: 14,
                                background: "rgba(15, 23, 42, 0.86)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                color: "#fff",
                                fontWeight: 950,
                                fontSize: 13,
                                textAlign: "center",
                              }}
                            >
                              <span style={{ fontSize: 16 }}>🔒</span>
                              Free Trial Not Available
                            </div>
                          </div>
                        )}

                        {/* top tag */}
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(37,99,235,0.08)",
                            color: "#1D4ED8",
                            fontWeight: 650,
                            fontSize: 12,
                            border: "1px solid rgba(37,99,235,0.15)",
                          }}
                        >
                          {p.badge}
                        </div>

                        {/* price */}
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 34, fontWeight: 950, color: "#0F172A", lineHeight: 1.1 }}>
                            {p.priceText}
                            <span style={{ fontSize: 13, fontWeight: 650, color: "#64748B", marginLeft: 8 }}>
                              {p.durationText}
                            </span>
                          </div>

                          <div style={{ marginTop: 6, color: "#475569", fontWeight: 600, fontSize: 13 }}>
                            {isTrialCard
                              ? "Trial access for 14 days (automatic)"
                              : "Recommended Plan • Full Access"}
                          </div>
                        </div>

                        {/* features */}
                        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                          {p.features.map((f, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <span
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 6,
                                  background: "rgba(16,185,129,0.12)",
                                  color: "#065F46",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 950,
                                  fontSize: 12,
                                  flex: "0 0 auto",
                                  border: "1px solid rgba(6,95,70,0.12)",
                                  marginTop: 1,
                                }}
                              >
                                ✓
                              </span>
                              <div style={{ color: "#0F172A", fontWeight: 600, fontSize: 13 }}>
                                {f}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* actions */}
                        {isTrialCard ? (
                          <button
                            disabled
                            style={{
                              width: "100%",
                              marginTop: 14,
                              padding: "12px 14px",
                              borderRadius: 14,
                              border: "1px solid rgba(15,23,42,0.14)",
                              background: "#F8FAFC",
                              color: "#0F172A",
                              fontWeight: 950,
                              cursor: "not-allowed",
                            }}
                          >
                            {billingStatus === "Trial"
                              ? "Current Plan"
                              : locked
                              ? "Not Available"
                              : "Trial Provided Automatically"}
                          </button>
                        ) : (
                          <button
                            disabled={isSubscribing}
                            onClick={() => handleSubscribeFromBilling(p)}
                            style={{
                              width: "100%",
                              marginTop: 14,
                              padding: "12px 14px",
                              borderRadius: 14,
                              border: "none",
                              background: "#0785f9",
                              color: "#fff",
                              fontWeight: 950,
                              cursor: isSubscribing ? "not-allowed" : "pointer",
                              opacity: isSubscribing ? 0.7 : 1,
                              boxShadow: "none",
                            }}
                          >
                            {isSubscribing ? "Redirecting..." : "Subscribe"}
                          </button>
                        )}

                        {p.period === "yearly" &&
                          (!p.priceId ||
                            String(p.priceId).includes("REPLACE_WITH_YEARLY_PRICE_ID")) && (
                            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "#B91C1C" }}>
                              Add yearly Stripe priceId to enable yearly checkout.
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 14, fontSize: 12, color: "#64748B", fontWeight: 500 }}>
                  Payments are processed securely via Stripe.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Billing;


// import React, { useEffect, useMemo, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import { loadStripe } from "@stripe/stripe-js";
// import { Server } from "App";

// const Billing = () => {
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");
//   const userId = localStorage.getItem("UserId");
//   const role = localStorage.getItem("Role");

//   const [loading, setLoading] = useState(true);
//  const [usage, setUsage] = useState({jobs:0});

//   const [billingStatus, setBillingStatus] = useState(""); // Recruiter Access | Not Subscribed | Trial | Subscribed | Error
//   const [plan, setPlan] = useState("");
//   const [transactions, setTransactions] = useState([]);

//   const [trialInfo, setTrialInfo] = useState(null);
//   const [subscriptionInfo, setSubscriptionInfo] = useState(null);

//   const [subscriptionId, setSubscriptionId] = useState(null);

//   // Payment method (best-effort from invoices)
//   const [paymentMethod, setPaymentMethod] = useState(null);

//   // Upgrade modal
//   const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
//   const [isSubscribing, setIsSubscribing] = useState(false);

//   const [isCancelling, setIsCancelling] = useState(false);
//   const [isManaging, setIsManaging] = useState(false);

//   // Recruiter access rules
//   const recruiterDomains = useMemo(
//     () => ["@hrpundits.com", "@vivatechsolutions.io", "@growthiq.net"],
//     []
//   );
//   const recruiterEmails = useMemo(() => ["nischalakrishna@gmail.com"], []);

//   // ✅ Pricing rules (same as Pricing page)
//   const MONTHLY_PRICE = 249;
//   const YEARLY_PRICE = MONTHLY_PRICE * 12;

//   // ✅ Stripe price IDs
//   const STRIPE_PRICE_ID_MONTHLY = "price_1PdWn2P218aRnkr8eMEL98xa";
//   // ⚠️ Create a YEARLY recurring price in Stripe (same product) and paste it here:
//   const STRIPE_PRICE_ID_YEARLY = "price_REPLACE_WITH_YEARLY_PRICE_ID";

//   const upgradePlans = useMemo(
//     () => [
//       {
//         badge: "Recommended (Monthly)",
//         priceText: `$${MONTHLY_PRICE}`,
//         durationText: "/month",
//         amount: MONTHLY_PRICE,
//         period: "monthly",
//         priceId: STRIPE_PRICE_ID_MONTHLY,
//         features: [
//           "Unlimited Job Postings",
//           "Unlimited access to Database",
//           "AI Resume Search",
//           "AI Fitment Analysis",
//           "AI Video Interview",
//           "Email Support",
//         ],
//       },
//       {
//         badge: "Recommended (Yearly)",
//         priceText: `$${YEARLY_PRICE}`,
//         durationText: "/year",
//         amount: YEARLY_PRICE,
//         period: "yearly",
//         priceId: STRIPE_PRICE_ID_YEARLY,
//         features: [
//           "Unlimited Job Postings",
//           "Unlimited access to Database",
//           "AI Resume Search",
//           "AI Fitment Analysis",
//           "AI Video Interview",
//           "Email Support",
//         ],
//       },
//     ],
//     [YEARLY_PRICE]
//   );

//   useEffect(() => {
//     if (!token) {
//       navigate("/employers");
//       return;
//     }
//     getUser();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);
// const TEST_FREE_TRIAL_EMAILS = ["gokulakrishnan@vivatechsolutions.io"];
//   const isRecruiterAccessEmail = (email = "") => {
//     const lower = String(email).toLowerCase().trim();
//     if (!lower) return false;
//      if (TEST_FREE_TRIAL_EMAILS.includes(lower)) return false;
//     if (recruiterEmails.includes(lower)) return true;
//     return recruiterDomains.some((d) => lower.endsWith(d));
//   };

//   const safeDate = (value) => {
//     if (!value) return null;
//     const d = new Date(value);
//     return isNaN(d.getTime()) ? null : d;
//   };

//   const formatDate = (d) => {
//     if (!d) return "-";
//     return d.toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const daysBetween = (from, to) => {
//     if (!from || !to) return null;
//     const ms = to.getTime() - from.getTime();
//     return Math.ceil(ms / (1000 * 60 * 60 * 24));
//   };

//   const getUser = async () => {
//     try {
//       setLoading(true);

//       const decoded = jwtDecode(token);
//       let { data } = await axios.get(`${Server}/api/v1/employer/${decoded?.userId}`);
//       const employer = data?.Employer?.[0];

//       if (!employer) {
//         setBillingStatus("Error");
//         toast.error("Employer data not found.");
//         setLoading(false);
//         return;
//       }

//       const email =
//         employer?.email || employer?.companyEmail || employer?.employerEmail || "";

//       // Recruiter Access override
//       if (isRecruiterAccessEmail(email)) {
//         setBillingStatus("Recruiter Access");
//         setPlan("Recruiter Access");
//         setTransactions([]);
//         setTrialInfo(null);
//         setSubscriptionInfo(null);
//         setSubscriptionId(null);
//         setPaymentMethod(null);
//         setLoading(false);
//         return;
//       }

//       // Plan label (display)
//       if (employer?.plan) setPlan(employer.plan);
//       else if (employer?.subscribed && !employer?.trialStarts) setPlan("Recommended");
//       else setPlan("");

//       // Dates
//       const now = new Date();
//       const trialStarts = safeDate(employer?.trialStarts);
//       const trialEnds = safeDate(employer?.trialEnds);

//       const subscriptionStart = safeDate(employer?.subscriptionStart);
//       const subscriptionEnds = safeDate(employer?.subscriptionEnds);

//       // Trial status
//       const isTrialConfigured = !!trialStarts && !!trialEnds;
//       const isTrialActive = isTrialConfigured && now >= trialStarts && now <= trialEnds;
//       const isTrialExpired = isTrialConfigured && now > trialEnds;

//       if (isTrialConfigured) {
//         setTrialInfo({
//           trialStarts,
//           trialEnds,
//           daysLeft: isTrialActive ? daysBetween(now, trialEnds) : 0,
//           isActive: isTrialActive,
//           isExpired: isTrialExpired,
//         });
//       } else {
//         setTrialInfo(null);
//       }

//       // Subscription status
//       const isSubscribed = !!employer?.subscribed;
//       const isSubscriptionActive =
//         isSubscribed && (!!subscriptionEnds ? now <= subscriptionEnds : true);

//       if (subscriptionStart || subscriptionEnds) {
//         setSubscriptionInfo({
//           subscriptionStart,
//           subscriptionEnds,
//           isActive: isSubscriptionActive,
//         });
//       } else {
//         setSubscriptionInfo(null);
//       }

//       // Decide billingStatus
//       if (isTrialActive) {
//         setBillingStatus("Trial");
//         setTransactions([]);
//         setSubscriptionId(null);
//         setPaymentMethod(null);
//         setLoading(false);
//         return;
//       }

//       if (isSubscriptionActive && employer?.stripeCustomerId) {
//         setBillingStatus("Subscribed");

//         await fetchPlanDetails(employer?.stripeCustomerId);
//         await fetchTransactions(employer?.stripeCustomerId);

//         setLoading(false);
//         return;
//       }

//       // Not subscribed
//       if (!isSubscribed || isTrialExpired || !isSubscriptionActive) {
//         setBillingStatus("Not Subscribed");
//         setTransactions([]);
//         setSubscriptionId(null);
//         setPaymentMethod(null);
//         setLoading(false);
//         return;
//       }

//       setBillingStatus("Not Subscribed");
//       setLoading(false);
//     } catch (e) {
//       console.error(e);
//       setBillingStatus("Error");
//       toast.error("Something went wrong.");
//       setLoading(false);
//     }
//   };

//   // Your Stripe APIs
//   const fetchPlanDetails = async (customerId) => {
//     try {
//       const res = await axios.get(
//         `${Server}/api/v1/subscribe/get/plan?customerId=${customerId}`
//       );
//       const stripePlanName = res?.data?.plan?.name || "";
//       const subId = res?.data?.plan?.subscriptionId || null;

//       setSubscriptionId(subId);

//       // prefer stripe nickname if present
//       if (stripePlanName) setPlan(stripePlanName);
//     } catch (e) {
//       console.error("Error fetching plan details:", e);
//     }
//   };

//   const fetchTransactions = async (customerId) => {
//     try {
//       const res = await axios.get(
//         `${Server}/api/v1/subscribe/get/transaction?customerId=${customerId}`
//       );

//       const invoices = res?.data?.transactions || [];
//       setTransactions(invoices);

//       // Best-effort card extraction from invoice
//       const first = invoices?.[0];
//       const pmd =
//         first?.payment_intent?.payment_method?.card ||
//         first?.charge?.payment_method_details?.card ||
//         first?.payment_method_details?.card ||
//         null;

//       if (pmd) {
//         setPaymentMethod({
//           type: "card",
//           brand: pmd.brand,
//           last4: pmd.last4,
//           exp_month: pmd.exp_month,
//           exp_year: pmd.exp_year,
//         });
//       } else {
//         setPaymentMethod(null);
//       }
//     } catch (e) {
//       console.error("Error fetching transactions:", e);
//       toast.error("Failed to load billing history.");
//     }
//   };

//   const handleCancelSubscription = async () => {
//     if (!subscriptionId) {
//       toast.error("Subscription ID not found.");
//       return;
//     }
//     try {
//       setIsCancelling(true);
//       await axios.get(
//         `${Server}/api/v1/subscribe/cancel/subscription?subscriptionId=${subscriptionId}`
//       );
//       toast.success("Cancellation scheduled at period end.");
//       await getUser();
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to cancel subscription.");
//     } finally {
//       setIsCancelling(false);
//     }
//   };

//   // Stripe Customer Portal (requires backend endpoint /api/v1/subscribe/portal)
//   const handleManageBilling = async () => {
//     try {
//       setIsManaging(true);

//       const res = await axios.post(`${Server}/api/v1/subscribe/portal`, {
//         returnUrl: window.location.origin + "/billing",
//       });

//       const url = res?.data?.url;
//       if (!url) {
//         toast.error("Failed to open billing portal.");
//         return;
//       }
//       window.location.href = url;
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to open billing portal.");
//     } finally {
//       setIsManaging(false);
//     }
//   };

//   // ✅ Subscribe from Billing modal (Monthly/Yearly)
//   const handleSubscribeFromBilling = async (p) => {
//     try {
//       if (!token) {
//         navigate("/employers");
//         return;
//       }

//       if (p.period === "yearly" && (!p.priceId || p.priceId.includes("REPLACE_WITH_YEARLY_PRICE_ID"))) {
//         toast.error("Please paste your Yearly Stripe priceId in Billing page.");
//         return;
//       }

//       setIsSubscribing(true);

//       const stripe = await loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

//       const body = {
//         plan: p.badge, // keep the bracketed name
//         amount: p.amount,
//         userId,
//         product: "Recommended Full Access",
//         priceId: p.priceId,
//         role: role || "Employer",
//         period: p.period,
//       };

//       const { data } = await axios.post(
//         `${Server}/api/v1/subscribe/US/create/checkout-session`,
//         body
//       );

//       await stripe.redirectToCheckout({ sessionId: data.id });
//     } catch (e) {
//       console.error(e);
//       toast.error("Subscription failed. Please try again.");
//     } finally {
//       setIsSubscribing(false);
//     }
//   };

//   const displayedPlanLabel = () => {
//     if (!plan) return "No Active Plan";
//     if (plan === "Recommended") return "Recommended Plan";
//     if (plan === "Recruiter Access") return "Recruiter Access";
//     return `${plan} Plan`;
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <>
//       <section>
//         <Toaster position="top-center" reverseOrder={false} />
//         <br />

//         <div className="upper-title-box">
//           <h3>Billing Information</h3>
//           <p className="text">Manage your subscription and transactions here.</p>
//         </div>

//         {/* PLAN / STATUS CARD */}
//         <div className="plan-card-container">
//           <div className="plan-card">
//             <h2 className="plan-title">Your Billing Information</h2>

//             <div className="plan-content">
//               <div className="plan-details">
//                 <h3 className="plan-name">{displayedPlanLabel()}</h3>

//                 {billingStatus === "Recruiter Access" && (
//                   <p className="plan-description">
//                     You have full access provided by the admin. <br />
//                     <strong>All billing and transactions are managed by the admin.</strong>
//                   </p>
//                 )}

//                 {billingStatus === "Trial" && trialInfo?.trialEnds && (
//                   <p className="plan-description">
//                     You are on a <strong>Free Trial</strong>. <br />
//                     Trial expires on <strong>{formatDate(trialInfo.trialEnds)}</strong>
//                     {typeof trialInfo.daysLeft === "number" ? (
//                       <>
//                         {" "}
//                         (About <strong>{trialInfo.daysLeft}</strong> day
//                         {trialInfo.daysLeft === 1 ? "" : "s"} left)
//                       </>
//                     ) : null}
//                     .
//                   </p>
//                 )}

//                 {billingStatus === "Subscribed" && (
//                   <p className="plan-description">
//                     Your subscription is active.
//                     {subscriptionInfo?.subscriptionEnds ? (
//                       <>
//                         {" "}
//                         It ends on <strong>{formatDate(subscriptionInfo.subscriptionEnds)}</strong>.
//                       </>
//                     ) : null}
//                   </p>
//                 )}

//                 {billingStatus === "Not Subscribed" && (
//                   <p className="plan-description">
//                     You do not have an active subscription.
//                     {trialInfo?.isExpired ? (
//                       <>
//                         {" "}
//                         Your trial has expired on{" "}
//                         <strong>{formatDate(trialInfo.trialEnds)}</strong>.
//                       </>
//                     ) : null}
//                   </p>
//                 )}

//                 {/* ACTIONS */}
//                 {billingStatus !== "Recruiter Access" && (
//                   <div className="plan-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                     {(billingStatus === "Trial" || billingStatus === "Not Subscribed") && (
//                       <>
//                         <button
//                           className="subscribe-button"
//                           onClick={() => setIsUpgradeModalOpen(true)}
//                           disabled={isSubscribing}
//                           style={{ opacity: isSubscribing ? 0.7 : 1 }}
//                         >
//                           Upgrade
//                         </button>

//                         <button
//                           className="update-plan-button"
//                           onClick={() => navigate("/pricing")}
//                           style={{ cursor: "pointer" }}
//                         >
//                           View Plans
//                         </button>
//                       </>
//                     )}

//                     {billingStatus === "Subscribed" && (
//                       <>
//                         <button
//                           className="subscribe-button"
//                           onClick={() => setIsUpgradeModalOpen(true)}
//                           disabled={isSubscribing}
//                           style={{ opacity: isSubscribing ? 0.7 : 1 }}
//                         >
//                           Upgrade
//                         </button>

//                         <button
//                           className="update-plan-button"
//                           onClick={handleManageBilling}
//                           disabled={isManaging}
//                           style={{ cursor: "pointer", opacity: isManaging ? 0.7 : 1 }}
//                         >
//                           {isManaging ? "Opening..." : "Manage Billing"}
//                         </button>

//                         <button
//                           className="update-plan-button"
//                           onClick={handleCancelSubscription}
//                           disabled={isCancelling}
//                           style={{ cursor: "pointer", opacity: isCancelling ? 0.7 : 1 }}
//                         >
//                           {isCancelling ? "Cancelling..." : "Cancel Subscription"}
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* PAYMENT METHOD + BILLING HISTORY */}
//         {billingStatus === "Subscribed" && (
//           <>
//             <div className="plan-card-container">
//               <div className="plan-card">
//                 <h2 className="plan-title">Payment Method</h2>
//                 <div className="plan-content">
//                   <div className="plan-details">
//                     {paymentMethod ? (
//                       <>
//                         <h3 className="plan-name">Saved Card</h3>
//                         <p className="plan-description">
//                           <strong>{paymentMethod.brand?.toUpperCase()}</strong> ••••{" "}
//                           <strong>{paymentMethod.last4}</strong> <br />
//                           Expires:{" "}
//                           <strong>
//                             {paymentMethod.exp_month}/{paymentMethod.exp_year}
//                           </strong>
//                         </p>
//                       </>
//                     ) : (
//                       <>
//                         <h3 className="plan-name">Payment Method</h3>
//                         <p className="plan-description">
//                           Payment method details are not available from invoices.
//                           <br />
//                           Click <strong>Manage Billing</strong> to view/update cards in Stripe.
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="invoice-container">
//               <div className="header-section">
//                 <h2 className="invoice-title">Invoices</h2>
//                 <p className="invoice-subtitle">View or download your past invoices.</p>
//               </div>

//               <div className="table-container">
//                 <table className="invoice-table">
//                   <thead>
//                     <tr>
//                       <th>Date</th>
//                       <th>Status</th>
//                       <th>Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.length > 0 ? (
//                       transactions.map((invoice, index) => (
//                         <tr key={index}>
//                           <td>
//                             <a
//                               href={invoice.hosted_invoice_url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               {new Date(invoice.created * 1000).toLocaleDateString()}
//                             </a>
//                           </td>
//                           <td>
//                             <span className={`status-badge ${invoice.status}`}>
//                               {invoice.status?.charAt(0)?.toUpperCase() + invoice.status?.slice(1)}
//                             </span>
//                           </td>
//                           <td className="amount">
//                             ${((invoice.amount_due ?? 0) / 100).toFixed(2)}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
//                           No billing history found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}

//         {/* ✅ UPGRADE MODAL WITH PRICING (Monthly/Yearly) */}
//         {isUpgradeModalOpen && (
//           <div
//             style={{
//               position: "fixed",
//               inset: 0,
//               background: "rgba(0,0,0,0.55)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 9999,
//               padding: 16,
//             }}
//             onClick={() => setIsUpgradeModalOpen(false)}
//           >
//             <div
//               style={{
//                 background: "#fff",
//                 borderRadius: 12,
//                 width: "100%",
//                 maxWidth: 980,
//                 padding: 18,
//               }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                 <h3 style={{ margin: 0 }}>Upgrade Plan</h3>
//                 <button
//                   className="update-plan-button"
//                   onClick={() => setIsUpgradeModalOpen(false)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   Close
//                 </button>
//               </div>

//               <p style={{ marginTop: 10, marginBottom: 14, color: "#333" }}>
//                 Choose Monthly or Yearly. Both include full access.
//               </p>

//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//                   gap: 16,
//                 }}
//               >
//                 {upgradePlans.map((p, idx) => (
//                   <div
//                     key={idx}
//                     style={{
//                       border: "1px solid #e5e7eb",
//                       borderRadius: 12,
//                       padding: 14,
//                       boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
//                       position: "relative",
//                     }}
//                   >
//                     {/* badge */}
//                     <div
//                       style={{
//                         position: "absolute",
//                         left: "50%",
//                         transform: "translateX(-50%)",
//                         top: -12, // no twin negative class
//                         padding: "6px 12px",
//                         borderRadius: 9999,
//                         background: "linear-gradient(to right, #4299e1, #0070f3)",
//                         color: "#fff",
//                         fontWeight: 700,
//                         fontSize: 13,
//                         boxShadow: "0 6px 18px rgba(66,153,225,0.35)",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {p.badge}
//                     </div>

//                     <div style={{ marginTop: 18 }}>
//                       <div style={{ fontSize: 34, fontWeight: 800, color: "#111" }}>
//                         {p.priceText}{" "}
//                         <span style={{ fontSize: 12, fontWeight: 700, color: "#666" }}>
//                           {p.durationText}
//                         </span>
//                       </div>

//                       <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
//                         {p.features.map((f, i) => (
//                           <div key={i} style={{ fontSize: 14, color: "#333" }}>
//                             • {f}
//                           </div>
//                         ))}
//                       </div>

//                       <button
//                         className="subscribe-button"
//                         style={{
//                           width: "100%",
//                           marginTop: 14,
//                           cursor: "pointer",
//                           opacity: isSubscribing ? 0.7 : 1,
//                         }}
//                         disabled={isSubscribing}
//                         onClick={() => handleSubscribeFromBilling(p)}
//                       >
//                         {isSubscribing ? "Redirecting..." : "Subscribe"}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
//                 Note: Add your Yearly Stripe priceId in the code to enable yearly checkout.
//               </p>
//             </div>
//           </div>
//         )}
//       </section>
//     </>
//   );
// };

// export default Billing;

// import React, { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import { Server } from "App";

// const Billing = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState({});
//   const [loading, setLoading] = useState(true);
//  const [usage, setUsage] = useState({jobs:0});
//   const [billingStatus, setBillingStatus] = useState("");
//   const [plan, setPlan] = useState("");
//   const [transactions, setTransactions] = useState([]);
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (token) {
//       getUser();
//     } else {
//       navigate("/employers");
//     }
//   }, []);

//   const getUser = async () => {
//     try {
//       const decoded = jwtDecode(token);
//       let { data } = await axios.get(
//         `${Server}/api/v1/employer/${decoded?.userId}`
//       );
//       data = data?.Employer[0];
//       if (data?.subscribed) {
//         if (!data?.trialStarts) {
//           // setBillingStatus("Recruiter Access");
//           setPlan("Recommended");
//         } else {
//           setPlan(data?.plan);
//           if (data?.stripeCustomerId) {
//             fetchBillingDetails(data?.stripeCustomerId);
//           }
//         }
//       } else {
//         setBillingStatus("Not Subscribed");
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error(error);
//       setBillingStatus("Error");
//       toast.error("Something went wrong.");
//       setLoading(false);
//     }
//   };

//   const fetchBillingDetails = async (customerId) => {
//     try {
//       // Fetch Plan Details
//       // const planResponse = await axios.get(
//       //   `${Server}/api/v1/subscribe/get/plan?customerId=${customerId}`
//       // );
//       // console.log(planResponse)
//       // setPlan(planResponse.data?.plan?.name || "No active plan");

//       // Fetch Transactions
//       const transactionResponse = await axios.get(
//         `${Server}/api/v1/subscribe/get/transaction?customerId=${customerId}`
//       );
//       // console.log(transactionResponse)
//       setTransactions(transactionResponse.data?.transactions || []);
//     } catch (error) {
//       console.error("Error fetching billing details:", error);
//       toast.error("Failed to load billing details.");
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <>
//       <section>
//         <Toaster position="top-center" reverseOrder={false} />
//         <br />
//         <div className="upper-title-box">
//           <h3>Billing Information</h3>
//           <p className="text">
//             Manage your subscription and transactions here.
//           </p>
//         </div>

//         <div className="plan-card-container">
//           <div className="plan-card">
//             <h2 className="plan-title">Your Billing Information</h2>
//             <div className="plan-content">
//               {plan ? (
//                 <div className="current-plan-label">
//                   {plan === "Recommended" ? `Premium` : plan}
//                 </div>
//               ) : null}
//               <div className="plan-details">
//                 <h3 className="plan-name">
//                   {plan
//                     ? plan === "Recommended"
//                       ? `Premium Plan`
//                       : `${plan} Plan`
//                     : "No Active Plan"}
//                 </h3>

//                 {billingStatus === "Recruiter Access" ? (
//                   <p className="plan-description">
//                     You have full access provided by the admin. <br />
//                     <strong>
//                       All billing and transactions are managed by the admin.
//                     </strong>
//                   </p>
//                 ) : billingStatus === "Not Subscribed" ? (
//                   <p className="plan-description">
//                     You do not have an active subscription.{" "}
//                     <a href="/pricing" className="plan-link">
//                       Subscribe now
//                     </a>
//                     .
//                   </p>
//                 ) : (
//                   <p className="plan-description">
//                     Subscription has full access to all features.{" "}
//                     <a
//                       onClick={() => navigate("/pricing")}
//                       className="plan-link"
//                     >
//                       View Benefits
//                     </a>
//                     .
//                   </p>
//                 )}

//                 {billingStatus === "Not Subscribed" && (
//                   <div className="plan-actions">
//                     <button
//                       className="subscribe-button"
//                       onClick={() => navigate("/pricing")}
//                     >
//                       Subscribe Now
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payment Method Section */}
//         {/* {billingStatus !== "Recruiter Access" && billingStatus !== "Not Subscribed"&&(
//           <div className="plan-card-container">
//             <div className="plan-card">
//               <h2 className="plan-title">Payment Method</h2>
//               <div className="plan-content">
//                 <div className="plan-details">
//                   {transactions.length > 0 ? (
//                     <>
//                       <h3 className="plan-name">Saved Payment Method</h3>
//                       <p className="plan-description">
//                         Your payment details are securely stored with Stripe.
//                       </p>
//                     </>
//                   ) : (
//                     <>
//                       <h3 className="plan-name">No Payment Method</h3>
//                       <p className="plan-description">No cards found.</p>
//                     </>
//                   )}
//                   <div className="plan-actions">
//                     <button className="update-plan-button">+ Add Card</button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}*/}

//         {/* Invoice History */}
//         {billingStatus !== "Recruiter Access" &&
//           billingStatus !== "Not Subscribed" && (
//             <div className="invoice-container">
//               <div className="header-section">
//                 <h2 className="invoice-title">Invoice History</h2>
//                 <p className="invoice-subtitle">
//                   View or download your past invoices.
//                 </p>
//               </div>

//               <div className="table-container">
//                 <table className="invoice-table">
//                   <thead>
//                     <tr>
//                       <th>Date</th>
//                       <th>Status</th>
//                       <th>Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transactions.length > 0 ? (
//                       transactions.map((invoice, index) => (
//                         <tr key={index}>
//                           <td>
//                             <a
//                               href={invoice.hosted_invoice_url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               {new Date(
//                                 invoice.created * 1000
//                               ).toLocaleDateString()}
//                             </a>
//                           </td>
//                           <td>
//                             <span className={`status-badge ${invoice.status}`}>
//                               {invoice.status.charAt(0).toUpperCase() +
//                                 invoice.status.slice(1)}
//                             </span>
//                           </td>
//                           <td className="amount">
//                             ${(invoice.amount_due / 100).toFixed(2)}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="3"
//                           style={{ textAlign: "center", padding: "10px" }}
//                         >
//                           No transactions found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//       </section>
//     </>
//   );
// };

// export default Billing;
