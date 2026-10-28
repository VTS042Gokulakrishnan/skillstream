import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Users, ClipboardCheck, Workflow, LayoutDashboard, Check, Plus } from "lucide-react";
import PublicShell, { usePublicAuth } from "../../Components/PublicSite/PublicShell";
import logo from "../../assets/logo-twos.png";
import "./EmployerLanding.css";

const features = [
  { icon: BriefcaseBusiness, name: "Job posting", tab: "Post a role", title: "Give your next hire a clear starting point.", copy: "Describe your opportunity, define the skills you need and publish a role your candidates can understand.", action: "Post a role", points: ["Role and location details", "Skills and experience requirements", "One place to review applications"] },
  { icon: Users, name: "Candidate discovery", tab: "Discover candidates", title: "Find the skills your team needs.", copy: "Explore candidate profiles and bring relevant skills, experience and resumes into your hiring conversations.", action: "Discover candidates", points: ["Relevant skills and experience", "Candidate profiles and resumes", "A clearer shortlist for your team"] },
  { icon: ClipboardCheck, name: "Assessments", tab: "Assess skills", title: "Bring more context to every conversation.", copy: "Review assessment results alongside experience and interviews to make better-informed hiring decisions.", action: "Explore assessments", points: ["Video and coding assessments", "Results alongside candidate profiles", "Human judgment at every step"] },
  { icon: Workflow, name: "Hiring workflow", tab: "Manage hiring", title: "Keep the next step in focus.", copy: "Bring applications, candidate reviews and interview information together as your hiring process moves forward.", action: "Start hiring", points: ["Organized candidate information", "Application review and next steps", "A shared view of your hiring work"] },
];
const candidates = [["AK", "Aisha Khan", "Product Designer", "Design systems"], ["ML", "Marcus Lee", "Full Stack Engineer", "React · Node.js"], ["NP", "Neha Patel", "UX Researcher", "User research"]];

function DashboardPreview() {
  return <div className="em-dashboard" aria-label="Illustrative hiring dashboard">
    <aside className="em-dashboard-sidebar"><img src={logo} alt="SkillStream" /><span className="is-active"><LayoutDashboard size={16} /> Overview</span><span><BriefcaseBusiness size={16} /> Jobs</span><span><Users size={16} /> Candidates</span><span><ClipboardCheck size={16} /> Assessments</span><span><Workflow size={16} /> Workflow</span></aside>
    <div className="em-dashboard-main"><div className="em-dashboard-heading"><div><small>YOUR WORKSPACE</small><h2>Hiring overview</h2></div><span className="em-preview-action"><Plus size={14} /> New role</span></div>
      <div className="em-stats">{[["Open roles", "12"], ["Candidates", "48"], ["In assessment", "16"], ["Next steps", "8"]].map(([label,value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className="em-pipeline">{["Applications", "In review", "Assessments"].map((title,i) => <section key={title}><h3><span className={`em-dot em-dot-${i}`} />{title}<small>{["12","8","4"][i]}</small></h3>{candidates.map(([initials,name,job,skill],j) => <div className="em-person" key={name}><span className={`em-avatar em-avatar-${(i+j)%3}`}>{initials}</span><div><strong>{name}</strong><p>{job}</p><small>{i === 2 ? "Results available" : skill}</small></div></div>)}</section>)}</div>
      <p className="em-preview-caption">Illustrative preview · Sample data</p>
    </div>
  </div>;
}

function FeaturePreview({ selected }) {
  if (selected === 0) return <div className="em-role-preview"><span className="em-preview-kicker"><BriefcaseBusiness size={17} /> NEW OPPORTUNITY</span><h3>Senior Product Designer</h3><p>Design · Full time · Remote</p><div className="em-preview-field">Skills required</div><div className="em-chips"><span>Product design</span><span>Figma</span><span>Collaboration</span></div><div className="em-preview-lines"><i /><i /><i /></div><span className="em-preview-action">Ready to publish <Check size={16} /></span></div>;
  if (selected === 1) return <div className="em-profile-preview"><span className="em-profile-orbit" /><div className="em-profile-card"><span className="em-avatar em-avatar-large">AK</span><h3>Aisha Khan</h3><p>Product Designer</p><div className="em-chips"><span>UX Design</span><span>Figma</span><span>Research</span></div><p>Designing thoughtful digital experiences with a focus on people.</p><span className="em-preview-action">Candidate profile <ArrowRight size={15} /></span></div></div>;
  if (selected === 2) return <div className="em-role-preview"><span className="em-preview-kicker"><ClipboardCheck size={17} /> ASSESSMENT OVERVIEW</span><h3>More than a resume.</h3>{["Video interview", "Coding assessment", "Reviewer notes"].map(text => <div className="em-assessment-row" key={text}><Check size={17} /><span>{text}</span><small>Ready to review</small></div>)}<p>Use results alongside interviews and experience.</p></div>;
  return <div className="em-role-preview"><span className="em-preview-kicker"><Workflow size={17} /> HIRING WORKFLOW</span><h3>Every next step, together.</h3>{["Review applications", "Plan assessments", "Discuss next steps"].map((text,i) => <div className="em-assessment-row" key={text}><span className="em-step-number">{i+1}</span><span>{text}</span></div>)}</div>;
}

function EmployerContent() {
  const openAuth = usePublicAuth();
  const [selected, setSelected] = useState(0);
  const root = useRef(null);
  const feature = features[selected];
  useEffect(() => {
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = root.current.querySelectorAll(".em-reveal");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold:0.08 });
    nodes.forEach(node => { node.classList.add("em-observed"); observer.observe(node); });
    return () => observer.disconnect();
  }, []);
  const start = () => openAuth("register");
  const selectTab = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index+1)%4;
    else if (event.key === "ArrowLeft") next = (index+3)%4;
    else if (event.key === "Home") next=0;
    else if (event.key === "End") next=3;
    if (next !== undefined) { event.preventDefault(); setSelected(next); document.getElementById(`em-tab-${next}`).focus(); }
  };
  return <div ref={root}>
    <section className="em-hero em-hero-team"><div className="em-hero-glow" aria-hidden="true" /><div className="em-hero-copy"><p className="em-eyebrow">FOR EMPLOYERS</p><h1>Build your next<br /><span>great team.</span></h1><p className="em-lead">Post roles, discover candidates and bring assessments<br className="em-desktop-break" /> into your hiring workflow.</p><div className="em-actions"><button className="ss-btn" onClick={start}>Start hiring <ArrowRight size={18} /></button><a className="em-outline" href="#hiring-tools">Explore hiring tools</a></div></div><div className="em-container em-dashboard-wrap"><DashboardPreview /></div></section>
    <section id="hiring-tools" className="em-container em-section em-reveal"><div className="em-section-title"><p className="em-eyebrow">BUILT AROUND YOUR TEAM</p><h2>One workspace. <span>Every hiring step.</span></h2><p>Bring your roles, candidates and assessments into focus.</p></div><div className="em-product-grid">{features.map((f,i) => <a href="#feature-showcase" className="em-product-card" key={f.name} onClick={() => setSelected(i)}><f.icon size={30} strokeWidth={1.6} /><h3>{f.name}</h3><p>{["Create and publish roles with the details candidates need.", "Find and explore skilled candidates that match your needs.", "Use skills assessments to evaluate and compare candidates.", "Keep candidate information and next steps organized."][i]}</p><span className="em-card-arrow"><ArrowRight size={18} /></span></a>)}</div></section>
    <section id="feature-showcase" className="em-showcase"><div className="em-container em-reveal"><div className="em-showcase-heading"><h2>Move from opportunity<br /><span>to offer.</span></h2><div role="tablist" aria-label="Hiring capabilities" className="em-tabs">{features.map((f,i) => <button role="tab" id={`em-tab-${i}`} aria-controls="em-feature-panel" aria-selected={selected===i} tabIndex={selected===i ? 0 : -1} onKeyDown={e => selectTab(e,i)} onClick={() => setSelected(i)} key={f.tab}>{f.tab}</button>)}</div></div><div id="em-feature-panel" role="tabpanel" aria-labelledby={`em-tab-${selected}`} tabIndex={0} className="em-feature-panel" key={selected}><div className="em-feature-copy"><h3>{feature.title}</h3><p>{feature.copy}</p><ul>{feature.points.map(point => <li key={point}><Check size={16} />{point}</li>)}</ul><button className="ss-btn" onClick={start}>{feature.action} <ArrowRight size={17} /></button></div><div className="em-feature-art"><FeaturePreview selected={selected} /><small>Illustrative preview</small></div></div></div></section>
    <section id="how-it-works" className="em-container em-section em-reveal"><div className="em-steps">{[["Publish a role", "Share your hiring needs with candidates."], ["Review candidates", "Explore profiles, assess skills and shortlist."], ["Plan the next step", "Bring your team together to move candidates forward."]].map(([title,copy],i) => <div key={title}><span>{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div>{i<2 && <ArrowRight className="em-step-arrow" size={22} />}</div>)}</div><div className="em-pricing"><div><h3>A plan for your next stage.</h3><p>Explore employer plans and find the right fit for your team.</p></div><Link to="/pricing/employer">View employer pricing <ArrowRight size={18} /></Link></div></section>
    <section className="em-container em-section em-reveal"><div className="em-section-title em-align-left"><h2>Frequently asked <span>questions</span></h2><p>A few details to help you get started.</p></div><div className="em-faq">{[["How do I post a job on SkillStream?", "Create an employer account, complete your company profile and review the available plans. You can then create a job with the role, location and skills you need."], ["Can I use assessments in my hiring process?", "SkillStream supports video and coding assessments. Review the available tools in your plan and use results alongside interviews and your own evaluation."], ["How does candidate discovery work?", "Explore candidate information and relevant experience through the hiring tools available to your account."], ["Where can vendors sign in?", "Use Login as Vendor in the navigation on this employer page. On a smaller screen, open the navigation menu to find it."]].map(([question,answer]) => <details key={question}><summary>{question}<Plus size={18} /></summary><p>{answer}</p></details>)}</div></section>
    <section className="em-container em-section em-reveal"><div className="em-final-cta"><div><h2>Ready to build your team?</h2><p>Post roles, find talent and bring assessments<br className="em-desktop-break" /> into your hiring workflow.</p></div><button onClick={start}>Create employer account <ArrowRight size={18} /></button></div></section>
  </div>;
}

export default function EmployerLanding() {
  return <PublicShell title="Hiring tools for employers" description="Post roles, discover candidates and bring assessments into your hiring workflow." employer className="em-page"><EmployerContent /></PublicShell>;
}
