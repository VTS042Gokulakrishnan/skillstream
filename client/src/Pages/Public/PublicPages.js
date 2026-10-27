import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Server } from "../../App";
import PublicShell from "../../Components/PublicSite/PublicShell";
import { policies } from "../../Components/PublicSite/policies";
import { PolicyContent } from "../../Components/PublicSite/PolicyView";
import { PracticePricePreview } from "./PublicPricing";
import team from "../../assets/group-business-partners-looking-camera.jpg";
import desk from "../../assets/businesswoman-discussing-with-colleagues-digital-tablet.jpg";

export function PolicyPage({ kind }) {
  const p = policies[kind];
  return (
    <PublicShell title={p.title} description={p.intro}>
      <div className="ss-policy-layout">
        <nav className="ss-policy-nav" aria-label="On this page">
          <strong>On this page</strong>
          {p.sections.map(([name], i) => (
            <a href={"#" + kind + "-" + i} key={name}>
              {name}
            </a>
          ))}
        </nav>
        <article>
          <p className="ss-eyebrow">
            {kind === "security" ? "ACCOUNT SAFETY" : "INFORMATION"}
          </p>
          <h1>{p.title}</h1>
          <p className="ss-lead">{p.intro}</p>
          <div className="ss-tabs">
            <Link to="/privacyCenter">Privacy</Link>
            <Link to="/termsAndCondition">Terms</Link>
            <Link to="/securityCenter">Security</Link>
          </div>
          <PolicyContent kind={kind} />
        </article>
      </div>
    </PublicShell>
  );
}
export function AboutPage() {
  return (
    <PublicShell
      title="About us"
      description="Job discovery, interview practice and recruitment tools in one platform."
    >
      <section className="ss-hero">
        <div>
          <p className="ss-eyebrow">ABOUT SKILLSTREAM</p>
          <h1>Helping careers and hiring move forward.</h1>
          <p className="ss-lead">
            SkillStream brings job discovery, interview practice and recruitment
            tools into one platform.
          </p>
          <div className="ss-actions">
            <Link className="ss-btn" to="/find-jobs">
              Explore jobs →
            </Link>
            <Link className="ss-btn ss-btn-outline" to="/employers">
              Explore hiring tools
            </Link>
          </div>
        </div>
        <img
          className="ss-hero-photo"
          src={team}
          alt="Professionals working together"
        />
      </section>
      <section className="ss-grid ss-grid-two">
        <div className="ss-card">
          <p className="ss-eyebrow">FOR CANDIDATES</p>
          <h2>Prepare for what's next.</h2>
          <p>
            Explore opportunities, prepare your resume and practice video and
            coding interviews.
          </p>
          <Feature
            icon="⌕"
            title="Job discovery"
            text="Find roles that match your experience and interests."
          />
          <Feature
            icon="▤"
            title="Resume preparation"
            text="Present your experience clearly."
          />
          <Feature
            icon="▷"
            title="Interview practice"
            text="Build confidence with video and coding practice."
          />
        </div>
        <div className="ss-card">
          <p className="ss-eyebrow">FOR EMPLOYERS</p>
          <h2>Support your hiring process.</h2>
          <p>
            Post roles, discover candidates and bring assessments into your
            recruitment workflow.
          </p>
          <Feature
            icon="▤"
            title="Job posting"
            text="Describe the role and the skills your team needs."
          />
          <Feature
            icon="⌕"
            title="Candidate discovery"
            text="Explore profiles and relevant experience."
          />
          <Feature
            icon="✓"
            title="Assessments"
            text="Use results alongside interviews and your own evaluation."
          />
        </div>
      </section>
      <section className="ss-hero ss-section">
        <img
          className="ss-hero-photo"
          src={desk}
          alt="Colleagues discussing their work"
        />
        <div>
          <p className="ss-eyebrow">OUR PURPOSE</p>
          <h2>
            Clearer next steps.
            <br />
            Better-informed decisions.
          </h2>
          <p>
            We help people understand their next steps and help employers bring
            relevant information into their hiring decisions.
          </p>
          <p>
            AI can support preparation and evaluation. People remain responsible
            for the decisions they make.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
function Feature({ icon, title, text }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3>
        <span aria-hidden="true" style={{ color: "#087cf0", marginRight: 12 }}>
          {icon}
        </span>
        {title}
      </h3>
      <p>{text}</p>
    </div>
  );
}
export function EmployerLanding() {
  return (
    <PublicShell title="Hiring tools for employers" employer>
      <section className="ss-hero">
        <div>
          <p className="ss-eyebrow">FOR EMPLOYERS</p>
          <h1>Find the people who move your business forward.</h1>
          <p className="ss-lead">
            Post roles, discover candidates and bring your hiring workflow
            together.
          </p>
          <div className="ss-actions">
            <Link className="ss-btn" to="/pricing/employer">
              Explore hiring plans →
            </Link>
            <a href="#hiring-tools">See how it works</a>
          </div>
        </div>
        <div className="ss-pipeline">
          <span className="ss-badge">Illustrative preview</span>
          <h3>Your hiring workflow</h3>
          <p>Bring the next steps into focus.</p>
          <div className="ss-pipeline-columns">
            {["Applications", "Review", "Assessments"].map((t, i) => (
              <div key={t}>
                <strong>{t}</strong>
                <span>
                  {
                    [
                      "Candidate profile",
                      "Experience & skills",
                      "Interview results",
                    ][i]
                  }
                </span>
                <span>{["Resume", "Role fit", "Next steps"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="hiring-tools" className="ss-section">
        <div className="ss-center">
          <p className="ss-eyebrow">A CLEARER HIRING WORKFLOW</p>
          <h2>Tools for every step.</h2>
        </div>
        <div className="ss-grid">
          {[
            [
              "▤",
              "Post a role",
              "Describe the opportunity and the skills your team needs.",
            ],
            [
              "⌕",
              "Review candidates",
              "Bring profiles and application information into your hiring workflow.",
            ],
            [
              "✓",
              "Assess skills",
              "Use assessment results alongside experience, interviews and your own evaluation.",
            ],
          ].map(([icon, title, text]) => (
            <div className="ss-card" key={title}>
              <span className="ss-icon" aria-hidden="true">
                {icon}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="ss-notice">
          AI-assisted insights can help organize information. Review results
          carefully and use human judgment when making hiring decisions.
        </p>
      </section>
      <section className="ss-banner">
        <div>
          <p className="ss-eyebrow">EMPLOYER PRICING</p>
          <h2>Find the right plan for your team.</h2>
          <p>Explore hiring tools and review plan details before purchasing.</p>
        </div>
        <Link className="ss-btn" to="/pricing/employer">
          View employer pricing →
        </Link>
      </section>
      <section className="ss-section ss-banner">
        <div>
          <h3>Looking for your next role?</h3>
          <p>Discover opportunities on SkillStream.</p>
        </div>
        <Link to="/find-jobs">Explore jobs →</Link>
      </section>
    </PublicShell>
  );
}
export function PracticeLanding() {
  return (
    <PublicShell title="Video and coding interview practice">
      <section className="ss-hero">
        <div>
          <p className="ss-eyebrow">CANDIDATE INTERVIEW PRACTICE</p>
          <h1>
            Practice today.
            <br />
            Feel ready tomorrow.
          </h1>
          <p className="ss-lead">
            Build confidence with video and coding interview practice.
          </p>
          <Link className="ss-btn" to="/pricing/candidate">
            View practice plans →
          </Link>
        </div>
        <div className="ss-pipeline">
          <span className="ss-badge">Practice and prepare</span>
          <h3>One question. A clearer answer.</h3>
          <p>
            Explain a challenge you worked through and the approach you took.
          </p>
          <div className="ss-preview-code">
            {
              "function prepare() {\n  practice();\n  reflect();\n  improve();\n}"
            }
          </div>
        </div>
      </section>
      <div className="ss-grid ss-grid-two">
        <div className="ss-card">
          <span className="ss-icon">▷</span>
          <h2>Video interviews</h2>
          <p>
            Practice answering role-specific questions aloud and review your
            feedback.
          </p>
          <Link to="/pricing/candidate">Explore video practice →</Link>
        </div>
        <div className="ss-card">
          <span className="ss-icon">&lt;/&gt;</span>
          <h2>Coding practice</h2>
          <p>
            Work through programming questions and develop your problem-solving
            skills.
          </p>
          <Link to="/pricing/candidate">Explore coding practice →</Link>
        </div>
      </div>
      <section className="ss-section">
        <h2>A simple way to practice</h2>
        <div className="ss-grid">
          {[
            "Choose a practice type",
            "Complete your session",
            "Review your feedback",
          ].map((t, i) => (
            <div className="ss-card" key={t}>
              <span className="ss-icon">{i + 1}</span>
              <h3>{t}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="ss-banner">
        <div>
          <h2>Choose your pace.</h2>
          <p>
            One-time practice packs and a one-month pass. No automatic renewal.
          </p>
        </div>
        <Link className="ss-btn" to="/pricing/candidate">
          Compare practice plans →
        </Link>
      </section>
      <PracticePricePreview />
      <p className="ss-muted" style={{ marginTop: 20 }}>
        Review the recording and processing notice before starting a session. AI
        feedback may be incomplete or incorrect.
      </p>
    </PublicShell>
  );
}
export function CommunityPage() {
  return (
    <PublicShell title="Community">
      <section className="ss-hero">
        <div>
          <span className="ss-badge">Community is being prepared</span>
          <h1>A place to learn from each other.</h1>
          <p className="ss-lead">
            We are working toward a space for career conversations, interview
            tips and hiring insights.
          </p>
        </div>
        <div className="ss-community-art" aria-hidden="true">
          <span>♧</span>
          <span>☏</span>
          <span>♧</span>
        </div>
      </section>
      <section>
        <h2>Planned topics</h2>
        <div className="ss-grid">
          {[
            "Career conversations",
            "Interview preparation",
            "Hiring insights",
          ].map((t) => (
            <div className="ss-card" key={t}>
              <span className="ss-badge">Planned topic</span>
              <h3>{t}</h3>
              <p>A space for useful questions, experiences and perspectives.</p>
            </div>
          ))}
        </div>
      </section>
      <section className="ss-section ss-banner">
        <div>
          <h2>Useful resources while we build</h2>
          <p>Explore practical guidance and interview preparation.</p>
          <div className="ss-actions">
            <Link className="ss-btn" to="/blog">
              Browse career resources
            </Link>
            <Link
              className="ss-btn ss-btn-outline"
              to="/practiceInterviewLanding"
            >
              Explore practice
            </Link>
          </div>
        </div>
      </section>
      <h2>Community standards</h2>
      <div className="ss-grid">
        {[
          "Respect others",
          "Protect personal information",
          "Keep discussions useful",
        ].map((t) => (
          <div className="ss-card" key={t}>
            <h3>{t}</h3>
          </div>
        ))}
      </div>
    </PublicShell>
  );
}
export function ContactPage() {
  const [form, setForm] = useState({
      name: "",
      email: "",
      topic: "Candidate support",
      subject: "",
      message: "",
    }),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(null);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await axios.post(Server + "/api/v1/contact/email/send/details", {
        ...form,
        subject: "[" + form.topic + "] " + form.subject,
        region: "United States",
      });
      setStatus({ ok: true, text: "Your message has been sent." });
      setForm({ ...form, subject: "", message: "" });
    } catch (e) {
      setStatus({
        ok: false,
        text: "We could not send your message. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <PublicShell title="Contact us">
      <p className="ss-eyebrow">CONTACT US</p>
      <h1>How can we help?</h1>
      <p className="ss-lead">
        Choose a topic so your message reaches the right team.
      </p>
      <section className="ss-contact-grid ss-section">
        <form className="ss-card ss-form" onSubmit={submit}>
          <h2>Send us a message</h2>
          {["name", "email"].map((name) => (
            <label key={name}>
              {name === "name" ? "Name" : "Email"}
              <input
                required
                type={name === "email" ? "email" : "text"}
                name={name}
                value={form[name]}
                onChange={update}
                maxLength={150}
              />
            </label>
          ))}
          <label>
            I need help with
            <select name="topic" value={form.topic} onChange={update}>
              {[
                "Candidate support",
                "Employer support",
                "Billing",
                "Privacy",
                "Security",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <input
              required
              name="subject"
              value={form.subject}
              onChange={update}
              maxLength={180}
            />
          </label>
          <label>
            Message
            <textarea
              required
              name="message"
              rows={6}
              value={form.message}
              onChange={update}
              maxLength={5000}
            />
          </label>
          {status && (
            <p
              role="status"
              className={"ss-notice" + (status.ok ? "" : " ss-error")}
            >
              {status.text}
            </p>
          )}
          <button disabled={busy} className="ss-btn">
            {busy ? "Sending…" : "Send message"}
          </button>
          <p className="ss-muted">
            We use these details to respond to your request.{" "}
            <Link to="/privacyCenter">Privacy Policy</Link>
          </p>
        </form>
        <aside className="ss-card">
          <h2>Contact details</h2>
          <Feature
            icon="✉"
            title="Email"
            text={
              <a href="mailto:info@skillstreamjobs.us">
                info@skillstreamjobs.us
              </a>
            }
          />
          <Feature
            icon="☏"
            title="Phone"
            text={<a href="tel:+18475981122">+1 (847) 598-1122</a>}
          />
          <Feature
            icon="⌖"
            title="Office"
            text="1827 Walden Office Sq, Suite 260, Schaumburg, IL 60173"
          />
          <p className="ss-notice">
            Please do not include passwords, payment details or sensitive
            documents in your message.
          </p>
        </aside>
      </section>
    </PublicShell>
  );
}
