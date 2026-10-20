import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Server } from "App";

/**
 * SubscriptionGuard
 * Wrap any page content:
 *  <SubscriptionGuard>
 *     <YourPage />
 *  </SubscriptionGuard>
 *
 * Props:
 * - children: page content
 * - allowTrial: true by default (trial active -> allowed)
 * - onUpgrade: optional callback (defaults navigate("/billing"))
 */
const SubscriptionGuard = ({
  children,
  allowTrial = true,
  onUpgrade
  
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [reason, setReason] = useState(""); // message
  const [details, setDetails] = useState({ trialEnds: null, subscriptionEnds: null });

  // ✅ Exceptions (always allow)
  const recruiterDomains = useMemo(
    () => ["@hrpundits.com", "@vivatechsolutions.io", "@growthiq.net"],
    []
  );
  const recruiterEmails = useMemo(() => ["nischalakrishna@gmail.com"], []);

  // ✅ OPTIONAL: Allow your own email to behave like normal user for testing
  // Remove if you don't want bypass
  // "gokulakrishnan@vivatechsolutions.io"
  const TEST_FREE_TRIAL_EMAILS = useMemo(
    () => [],
    []
  );

  const isRecruiterAccessEmail = (email = "") => {
    const lower = String(email).toLowerCase().trim();
    if (!lower) return false;

    // ✅ bypass recruiter-access for trial testing (optional)
    if (TEST_FREE_TRIAL_EMAILS.includes(lower)) return false;

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

  const computeAccess = (employer) => {
    const now = new Date();

    const email =
      employer?.email || employer?.companyEmail || employer?.employerEmail || "";

    // ✅ exceptions always allowed
    if (isRecruiterAccessEmail(email)) {
      return {
        allowed: true,
        reason: "",
        details: { trialEnds: null, subscriptionEnds: null },
      };
    }

    const trialEnds = safeDate(employer?.trialEnds);
    const trialStarts = safeDate(employer?.trialStart);
    const subscriptionEnds = safeDate(employer?.subscriptionEnds);
    const subscriptionStart = safeDate(employer?.subscriptionStart);

    // Rule: both null -> no active subscription
    const noTrialConfigured = !trialStarts && !trialEnds;
    const noSubConfigured = !subscriptionStart && !subscriptionEnds;

    // Trial active?
    const trialActive =
      allowTrial &&
      !!trialStarts &&
      !!trialEnds &&
      now >= trialStarts &&
      now <= trialEnds;

    // Subscription active?
    const subActive = !!subscriptionEnds ? now <= subscriptionEnds : false;

    if (trialActive) {
      return {
        allowed: true,
        reason: "",
        details: { trialEnds, subscriptionEnds },
      };
    }

    if (subActive) {
      return {
        allowed: true,
        reason: "",
        details: { trialEnds, subscriptionEnds },
      };
    }

    // If trial expired
    if (!!trialEnds && now > trialEnds) {
      return {
        allowed: false,
        reason: `You do not have an active subscription. Trial expired on ${formatDate(
          trialEnds
        )}.`,
        details: { trialEnds, subscriptionEnds },
      };
    }

    // If subscription expired
    if (!!subscriptionEnds && now > subscriptionEnds) {
      return {
        allowed: false,
        reason: `You do not have an active subscription. Subscription expired on ${formatDate(
          subscriptionEnds
        )}.`,
        details: { trialEnds, subscriptionEnds },
      };
    }

    // If both null OR not configured
    if (noTrialConfigured && noSubConfigured) {
      return {
        allowed: false,
        reason: "You do not have an active subscription.",
        details: { trialEnds, subscriptionEnds },
      };
    }

    // Default: not active
    return {
      allowed: false,
      reason: "You do not have an active subscription.",
      details: { trialEnds, subscriptionEnds },
    };
  };

  const fetchEmployer = async () => {
    try {
      if (!token) {
        // if page needs auth, redirect
        navigate("/employers");
        return;
      }

      const decoded = jwtDecode(token);
      const res = await axios.get(`${Server}/api/v1/employer/${decoded?.userId}`);
      const employer = res?.data?.Employer?.[0];

      if (!employer) {
        setAllowed(false);
        setReason("You do not have an active subscription.");
        setDetails({ trialEnds: null, subscriptionEnds: null });
        setLoading(false);
        return;
      }

      const access = computeAccess(employer);
      setAllowed(access.allowed);
      setReason(access.reason);
      setDetails(access.details);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setAllowed(false);
      setReason("You do not have an active subscription.");
      setDetails({ trialEnds: null, subscriptionEnds: null });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = () => {
    if (onUpgrade) return onUpgrade();
    navigate("/employer-billing"); // or /pricing if you want
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  // ✅ Allowed → render normally
  if (allowed) return <>{children}</>;

  // ✅ Locked UI overlay
  return (
    <div style={{ position: "relative" }}>
      {/* Dim + disable everything */}
      <div style={{ filter: "grayscale(1)", opacity: 0.55, pointerEvents: "none" }}>
        {children}
      </div>

      {/* Center lock panel (single lock icon) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(15, 23, 42, 0.10)",
            boxShadow: "0 18px 50px rgba(15,23,42,0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              background:
                "linear-gradient(180deg, rgba(59,130,246,0.10) 0%, rgba(255,255,255,1) 90%)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            {/* 🔒 Single Lock Icon */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "rgba(37,99,235,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🔒
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 950, color: "#0F172A" }}>
                Access Restricted
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 3 }}>
                You do not have an active subscription.
              </div>
            </div>
          </div>

          <div style={{ padding: 18 }}>
            <div style={{ color: "#0F172A", fontWeight: 800, lineHeight: 1.5 }}>
              {reason || "You do not have an active subscription."}
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "#64748B", fontWeight: 700 }}>
              Please upgrade to continue using this feature.
            </div>

            <button
              onClick={handleUpgrade}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(to right, #2563EB, #3B82F6)",
                color: "#fff",
                fontWeight: 950,
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(37,99,235,0.20)",
              }}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGuard;
