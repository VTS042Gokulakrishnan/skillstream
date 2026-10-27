import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { Server } from "../../App";
import PublicShell, {
  usePublicAuth,
} from "../../Components/PublicSite/PublicShell";
const headers = () => ({
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
});
export function AudienceTabs({ employer }) {
  return (
    <div className="ss-tabs">
      <Link className={!employer ? "active" : ""} to="/pricing/candidate">
        Candidate practice
      </Link>
      <Link className={employer ? "active" : ""} to="/pricing/employer">
        Employer hiring
      </Link>
    </div>
  );
}
export function CandidatePricing() {
  return (
    <PublicShell title="Candidate practice pricing">
      <PracticePricingBody />
    </PublicShell>
  );
}
function PracticePricingBody() {
  const auth = usePublicAuth(),
    [plans, setPlans] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [buying, setBuying] = useState(null);
  const load = () => {
    setLoading(true);
    setError("");
    axios
      .get(Server + "/api/v1/practiceInterview/plans")
      .then(({ data }) => setPlans(data.plans))
      .catch(() =>
        setError("We could not load practice plans. Please try again.")
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const purchase = async (id) => {
    if (!localStorage.getItem("token")) {
      sessionStorage.setItem("practicePlanIntent", id);
      auth("register");
      return;
    }
    if (localStorage.getItem("Role") !== "Candidate") {
      setError(
        "Practice purchases require a candidate account. Please sign in with your candidate account."
      );
      return;
    }
    setBuying(id);
    setError("");
    try {
      const { data } = await axios.post(
        Server + "/api/v1/practiceInterview/payments/checkout",
        { planId: id },
        headers()
      );
      sessionStorage.removeItem("practicePlanIntent");
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Checkout could not start. Please try again."
      );
      setBuying(null);
    }
  };
  return (
    <>
      <AudienceTabs />
      <div className="ss-center">
        <p className="ss-eyebrow">CANDIDATE PRACTICE</p>
        <h1>
          Practice at your pace.
          <br />
          Prepare with confidence.
        </h1>
        <p className="ss-lead">
          Video and coding interview practice, with one-time payments.
        </p>
      </div>
      {loading && (
        <p role="status" className="ss-loading">
          Loading practice plans…
        </p>
      )}
      {error && (
        <div role="alert" className="ss-notice ss-error">
          {error}{" "}
          {!plans.length && (
            <button className="ss-text-btn" onClick={load}>
              Retry
            </button>
          )}
        </div>
      )}
      <div className="ss-grid">
        {plans.map((plan) => (
          <article
            className={
              "ss-card ss-plan " +
              (plan.id === "pack5" ? "ss-plan-featured" : "")
            }
            key={plan.id}
          >
            <span className="ss-badge">
              {plan.id === "pack5"
                ? "More practice"
                : plan.id === "unlimited"
                ? "One calendar month"
                : "A confident start"}
            </span>
            <h2>
              {plan.id === "pack3"
                ? "Practice starter"
                : plan.id === "pack5"
                ? "Practice plus"
                : "One-month pass"}
            </h2>
            <div className="ss-price">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(plan.amount / 100)}
              <small>USD</small>
            </div>
            <p>One-time payment</p>
            <ul>
              <li>{plan.description}</li>
              <li>
                {plan.id === "unlimited"
                  ? "No automatic renewal"
                  : "Includes both video and coding practice"}
              </li>
            </ul>
            <button
              className="ss-btn"
              disabled={!plan.available || !!buying}
              onClick={() => purchase(plan.id)}
            >
              {buying === plan.id
                ? "Opening checkout…"
                : !plan.available
                ? "Currently unavailable"
                : sessionStorage.getItem("practicePlanIntent") === plan.id
                ? "Continue with this plan"
                : "Choose plan"}
            </button>
          </article>
        ))}
      </div>
      <p className="ss-muted" style={{ marginTop: 20 }}>
        Plan availability is confirmed before checkout. Already have practice
        access?{" "}
        <Link to="/practiceInterview">Go to your practice workspace</Link>.
      </p>
      <section className="ss-section ss-grid ss-grid-two">
        <div className="ss-card">
          <span className="ss-icon">▷</span>
          <h2>Video practice</h2>
          <p>Practice answering role-specific questions aloud.</p>
        </div>
        <div className="ss-card">
          <span className="ss-icon">&lt;/&gt;</span>
          <h2>Coding practice</h2>
          <p>
            Work through programming questions and build problem-solving skills.
          </p>
        </div>
      </section>
      <section className="ss-faq">
        <h2>Frequently asked questions</h2>
        <details open>
          <summary>Is this a subscription?</summary>
          <p>No. These practice purchases do not automatically renew.</p>
        </details>
        <details>
          <summary>What is included?</summary>
          <p>
            Each pack includes the stated number of video and coding interviews.
            The one-month pass provides unlimited practice for one calendar
            month.
          </p>
        </details>
        <details>
          <summary>Where can I ask about billing?</summary>
          <p>
            <Link to="/contact">Contact support</Link> with questions about
            payments or refunds. Do not include payment card details.
          </p>
        </details>
      </section>
    </>
  );
}
export function EmployerPricing() {
  return (
    <PublicShell title="Employer pricing" employer>
      <EmployerPricingBody />
    </PublicShell>
  );
}
function EmployerPricingBody() {
  const auth = usePublicAuth(),
    [account, setAccount] = useState(null),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const token = localStorage.getItem("token"),
    role = localStorage.getItem("Role");
  useEffect(() => {
    if (!token || role !== "Employer") return;
    let active = true;
    setLoading(true);
    axios
      .get(
        Server + "/api/v1/employer/" + localStorage.getItem("UserId"),
        headers()
      )
      .then(({ data }) => {
        if (active) setAccount(data.Employer?.[0] || null);
      })
      .catch(() => {
        if (active)
          setError(
            "We could not check your current plan. Please reload before purchasing."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, role]);
  const subscribed =
    account?.subscribed && new Date(account.subscriptionEnds) > new Date();
  const billingManaged =
    account?.access === "User" ||
    ["hrpundits.com", "vivatechsolutions.io", "growthiq.net"].includes(
      String(account?.email || "")
        .split("@")[1]
        ?.toLowerCase()
    ) ||
    account?.email?.toLowerCase() === "nischalakrishna@gmail.com";
  const trial = account?.trialEnds && new Date(account.trialEnds) > new Date();
  const purchase = async () => {
    if (!token) {
      auth("register");
      return;
    }
    if (role !== "Employer") {
      setError(
        "Employer plans require an employer account. Please sign in with your employer account."
      );
      return;
    }
    if (!account) {
      setError("Please reload to verify your account before purchasing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_API_KEY);
      if (!stripe) throw new Error("Checkout unavailable");
      const { data } = await axios.post(
        Server + "/api/v1/subscribe/US/create/checkout-session",
        { period: "monthly" },
        headers()
      );
      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if (result?.error) throw result.error;
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Checkout could not start. Please try again or contact support."
      );
      setBusy(false);
    }
  };
  return (
    <>
      <AudienceTabs employer />
      <div className="ss-center">
        <p className="ss-eyebrow">FOR EMPLOYERS</p>
        <h1>Choose a plan for your hiring workflow.</h1>
        <p className="ss-lead">
          Hiring tools for employers and recruiting teams.
        </p>
      </div>
      {loading && <p role="status">Checking current plan…</p>}
      {error && (
        <p className="ss-notice ss-error" role="alert">
          {error}
        </p>
      )}
      {account && (
        <p className="ss-notice">
          {subscribed
            ? "Your subscription is active."
            : trial
            ? "Your trial is active until " +
              new Date(account.trialEnds).toLocaleDateString() +
              "."
            : "No active subscription found."}
        </p>
      )}
      <div className="ss-grid">
        {[
          ["14-day trial", "$0", "Subject to account eligibility"],
          ["Monthly hiring", "$249", "Billed monthly"],
          ["Annual hiring", "$2,988", "Annual checkout is not available yet"],
        ].map(([name, price, note], i) => (
          <article
            className={"ss-card ss-plan " + (i === 1 ? "ss-plan-featured" : "")}
            key={name}
          >
            <h2>{name}</h2>
            <div className="ss-price">
              {price}
              <small>{i === 1 ? "/ month" : i === 2 ? "/ year" : ""}</small>
            </div>
            <p>{note}</p>
            <ul>
              {[
                "Job posting",
                "Candidate search",
                "AI-assisted resume review",
                "Fitment insights",
                "Video assessments",
                "Email support",
              ].map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {i === 2 ? (
              <button className="ss-btn" disabled>
                Unavailable
              </button>
            ) : i === 0 ? (
              <button
                className="ss-btn ss-btn-outline"
                disabled={!!token}
                onClick={() => auth("register")}
              >
                {trial
                  ? "Current trial"
                  : token
                  ? "Trial eligibility determined at registration"
                  : "Create employer account"}
              </button>
            ) : (
              <button
                className="ss-btn"
                onClick={purchase}
                disabled={
                  billingManaged ||
                  loading ||
                  busy ||
                  !!subscribed ||
                  (role === "Employer" && !!token && !account)
                }
              >
                {billingManaged
                  ? "Managed by your organization"
                  : busy
                  ? "Opening checkout…"
                  : subscribed
                  ? "Current plan"
                  : "Choose monthly"}
              </button>
            )}
          </article>
        ))}
      </div>
      <p className="ss-muted" style={{ marginTop: 20 }}>
        Review the billing terms at checkout. Features are subject to account
        permissions. <Link to="/termsAndCondition">Employer terms</Link> ·{" "}
        <Link to="/contact">Billing support</Link>
      </p>
      <section className="ss-section ss-faq">
        <h2>Billing questions</h2>
        <details>
          <summary>Who is eligible for a trial?</summary>
          <p>
            Trial eligibility is determined during employer registration. Your
            account shows any available trial period.
          </p>
        </details>
        <details>
          <summary>Is annual billing available?</summary>
          <p>
            Annual checkout is currently unavailable. Monthly billing is offered
            separately.
          </p>
        </details>
        <details>
          <summary>How do I get billing help?</summary>
          <p>
            Contact support with questions about your plan, renewal or
            cancellation before purchasing.
          </p>
        </details>
      </section>
    </>
  );
}
export function PricingChooser() {
  return (
    <PublicShell title="Pricing">
      <div className="ss-center">
        <h1>The right tools for your next step.</h1>
        <p className="ss-lead">
          Choose the pricing that matches how you use SkillStream.
        </p>
      </div>
      <div className="ss-grid ss-grid-two">
        <div className="ss-card">
          <h2>Candidate practice</h2>
          <p>One-time video and coding interview practice purchases.</p>
          <Link className="ss-btn" to="/pricing/candidate">
            View practice plans →
          </Link>
        </div>
        <div className="ss-card">
          <h2>Employer hiring</h2>
          <p>Recruitment tools and employer subscriptions.</p>
          <Link className="ss-btn" to="/pricing/employer">
            View employer plans →
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

export function PracticePricePreview() {
  const [plans, setPlans] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    axios
      .get(Server + "/api/v1/practiceInterview/plans")
      .then(({ data }) => {
        if (active) setPlans(data.plans);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);
  if (failed)
    return (
      <p className="ss-notice">
        Practice prices could not load.{" "}
        <Link to="/pricing/candidate">View pricing and retry</Link>.
      </p>
    );
  if (!plans)
    return (
      <p role="status" className="ss-loading">
        Loading practice prices…
      </p>
    );
  return (
    <div className="ss-grid ss-section">
      {plans.map((plan) => (
        <article className="ss-card ss-plan" key={plan.id}>
          <h3>{plan.name}</h3>
          <div className="ss-price">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(plan.amount / 100)}
            <small>USD</small>
          </div>
          <p>One-time payment</p>
          <p>{plan.description}</p>
          <Link className="ss-btn ss-btn-outline" to="/pricing/candidate">
            {plan.available ? "View plan" : "View availability"}
          </Link>
        </article>
      ))}
    </div>
  );
}
