import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import { Server } from "../../App";
import { BriefcaseBusiness, Landmark, House, Users, TrendingUp, Calculator, FileText, MessageSquare, BookOpen, Video, Code2, Search, Check, ArrowRight } from "lucide-react";
import heroPhoto from "../../assets/landing-professional-hero.png";
import logo from "../../assets/logo-twos.png";
import "./CandidateLanding.css";
import "./CandidateLandingPremium.css";

const iconMap = {laptop:BriefcaseBusiness,bank:Landmark,home:House,people:Users,chart:TrendingUp,calculator:Calculator,boost:FileText,chat:MessageSquare,learn:BookOpen,video:Video,code:Code2,search:Search};
const CareerIcon = ({name}) => React.createElement(iconMap[name] || BriefcaseBusiness, {className:"cl-icon",strokeWidth:1.6,"aria-hidden":true});

const categories = [["IT", "laptop"], ["Banking", "bank"], ["Work From Home", "home"], ["HR", "people"], ["Sales", "chart"], ["Accounting", "calculator"]];
const faqs = [
  ["How do I find the right jobs for me?", "Search by job title and city, then use the filters on Find Jobs to narrow your results by experience, job type, and work mode."],
  ["Do I need to create a resume?", "You can use your existing resume or open our resume builder to create one. Keep your resume up to date for the roles you want."],
  ["Can I practice video and coding interviews?", "Yes. Practice Assessment includes video and coding rounds. Choose a practice plan, set up your role and resume, and complete the device check before starting."],
  ["Are practice interviews free?", "Practice interviews require a purchased plan unless your account has active demo access. Available plans are shown before purchase."],
  ["How do I contact support?", "Send your question using the contact form on this page, or visit our Contact page."]
];

function JobSearch() {
  const navigate = useNavigate();
  const [job, setJob] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [industry, setIndustry] = useState("");
  const [options, setOptions] = useState({ states: [], industries: [] });
  const [optionError, setOptionError] = useState(false);
  const [cities, setCities] = useState([]);
  const [advanced, setAdvanced] = useState(false);
  const loadOptions = async () => {
    setOptionError(false);
    try {
      const [states, industries] = await Promise.all([
        axios.get(`${Server}/api/v1/data/states/United States`),
        axios.get(`${Server}/api/v1/data/industries`),
      ]);
      setOptions({ states: Array.isArray(states.data.states) ? states.data.states : [], industries: Array.isArray(industries.data.industries) ? industries.data.industries : [] });
    } catch { setOptionError(true); }
  };
  useEffect(() => { if (advanced) loadOptions(); }, [advanced]);
  useEffect(() => {
    let active = true;
    setCities([]);
    if (state) axios.get(`${Server}/api/v1/data/cities/United States/${encodeURIComponent(state)}`)
      .then(({ data }) => { if (active) setCities(Array.isArray(data.cities) ? data.cities : []); })
      .catch(() => { /* City remains editable when suggestions are unavailable. */ });
    return () => { active = false; };
  }, [state]);
  const submit = (event) => {
    event.preventDefault();
    const values = { job: job.trim(), City: city.trim(), State: state, Industry: industry, country: "United States" };
    navigate("/find-jobs?" + new URLSearchParams(Object.fromEntries(Object.entries(values).filter(([, value]) => value))).toString());
  };
  return <form className="cl-search" onSubmit={submit} aria-label="Search jobs">
    <div className="cl-search-row">
      <label><span>Job title or keywords</span><input value={job} onChange={(e) => setJob(e.target.value)} placeholder="e.g. Software Engineer" maxLength={120} /></label>
      <label><span>City</span><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Dallas" list="landing-cities" maxLength={100} /><datalist id="landing-cities">{cities.map((name) => <option key={name} value={name} />)}</datalist></label>
      <button className="cl-button" type="submit">Search jobs <span aria-hidden="true">→</span></button>
    </div>
    <button className="cl-text-button" type="button" aria-expanded={advanced} aria-controls="landing-filters" onClick={() => setAdvanced(!advanced)}>{advanced ? "Fewer filters −" : "More filters +"}</button>
    {advanced && <div id="landing-filters" className="cl-search-more">
      <label><span>State</span><select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }}><option value="">All states</option>{options.states.map((name) => <option key={name}>{name}</option>)}</select></label>
      <label><span>Industry</span><select value={industry} onChange={(e) => setIndustry(e.target.value)}><option value="">All industries</option>{options.industries.map((name) => <option key={name}>{name}</option>)}</select></label>
      {optionError && <p role="status">Filters couldn’t load. You can still search by title or city. <button type="button" className="cl-text-button" onClick={loadOptions}>Retry filters</button></p>}
    </div>}
  </form>;
}

export default function CandidatePage() {
  const navigate = useNavigate();
  useEffect(() => {
    const role = localStorage.getItem("Role");
    if (localStorage.getItem("token")) {
      const destination = { Employer: "/employer-dashboard", Candidate: "/candidate-dashboard", Vendor: "/vendor/dashboard" }[role];
      if (destination) navigate(destination, { replace: true });
    }
  }, [navigate]);
  return <div className="cl-page cl-search-first cl-premium">
    <Helmet><title>Find jobs & prepare for interviews | SkillStream</title><meta name="description" content="Discover job opportunities, build your resume, and prepare with video and coding practice interviews on SkillStream." /></Helmet>
    <main className="cl-container">
      <section className="cl-search-hero" aria-labelledby="landing-heading">
        <div className="cl-search-hero-copy"><p className="cl-eyebrow">YOUR NEXT OPPORTUNITY</p><h1 id="landing-heading">Your next chapter.<br /><span>Make it yours.</span></h1><p>Find the right role, tell your story and walk into your next interview prepared.</p><div className="cl-hero-actions"><a className="cl-button" href="#career-search">Find your next role <ArrowRight size={17} /></a><Link className="cl-hero-secondary" to="/practiceInterviewLanding">Prepare for interviews <ArrowRight size={17} /></Link></div><div className="cl-hero-points"><span><Check size={15} /> Discover opportunities</span><span><Check size={15} /> Build confidence</span></div></div>
        <div className="cl-search-hero-photo"><img src={heroPhoto} alt="Professional working at her desk" fetchpriority="high" /></div>
        <div className="cl-search-panel" id="career-search"><div className="cl-search-panel-heading"><Search size={20} /><div><h2>Where do you want to go next?</h2><p>Start with a role, a skill or a city.</p></div></div><JobSearch /></div>
      </section>
      <section className="cl-section" aria-labelledby="support-heading"><div className="cl-section-intro"><p className="cl-eyebrow">MORE THAN A JOB SEARCH</p><h2 id="support-heading">Every next step.<br /><span>A little more confident.</span></h2><p>Tools to help you move from exploring opportunities to preparing for the conversation.</p></div>
        <div className="cl-support-grid">
          <a className="cl-support-card" href="https://resume.careeriq.ai" target="_blank" rel="noopener noreferrer"><CareerIcon name="boost" /><h3>Tell your story.</h3><strong>Build visibility</strong><p>Showcase your experience with a resume that tells your professional story.</p><span className="cl-round-arrow" aria-hidden="true">↗</span></a>
          <Link className="cl-support-card" to="/practiceInterviewLanding"><CareerIcon name="chat" /><h3>Own the interview.</h3><strong>Practice interviews</strong><p>Build confidence with video and coding practice before your next interview.</p><span className="cl-round-arrow" aria-hidden="true">→</span></Link>
          <a className="cl-support-card" href="https://upskillgenius.com/" target="_blank" rel="noopener noreferrer"><CareerIcon name="learn" /><h3>Keep moving forward.</h3><strong>Explore career resources</strong><p>Explore learning resources to grow your skills and prepare for what comes next.</p><span className="cl-round-arrow" aria-hidden="true">↗</span></a>
        </div>
      </section>
      <section className="cl-discovery" aria-labelledby="discovery-heading"><div><p className="cl-eyebrow">CAREER DISCOVERY</p><h2 id="discovery-heading">Discover roles<br />that fit your goals.</h2><p>Explore opportunities that match your interests, experience and ambitions.</p><Link className="cl-button" to="/find-jobs">Find jobs →</Link></div><div className="cl-discovery-preview" aria-label="Illustration of job discovery"><div className="cl-preview-header"><span>YOUR NEXT MOVE</span><Search size={20}/></div><div className="cl-discovery-role"><span className="cl-role-icon"><BriefcaseBusiness size={24}/></span><div><h3>A role that fits you.</h3><p>Explore opportunities with your goals in mind.</p></div></div><div className="cl-role-tags"><span>Your skills</span><span>Your location</span><span>Your ambitions</span></div><div className="cl-role-checks"><span><Check size={16}/> Explore role requirements</span><span><Check size={16}/> Discover companies</span><span><Check size={16}/> Save opportunities for later</span></div><Link to="/find-jobs">Start exploring <ArrowRight size={17}/></Link></div></section>
      <section className="cl-practice-first cl-section" aria-labelledby="practice-heading"><div className="cl-practice-intro"><p className="cl-eyebrow">PRACTICE AND PREPARE</p><h2 id="practice-heading">Build your skills with<br />hands-on practice.</h2><p>Sharpen your interview and coding skills before your next opportunity.</p></div>
        <Link className="cl-practice-option" to="/practiceInterviewLanding"><CareerIcon name="video" /><h3>Video practice</h3><p>Practice answering role-specific interview questions aloud.</p><span className="cl-link">Explore practice →</span></Link>
        <Link className="cl-practice-option" to="/practiceInterviewLanding"><CareerIcon name="code" /><h3>Coding practice</h3><p>Solve programming questions and build your problem-solving skills.</p><span className="cl-link">Explore practice →</span></Link>
      </section>
      <section className="cl-section" aria-labelledby="categories-heading"><div className="cl-section-heading"><div><h2 id="categories-heading">Popular job categories</h2><p>Explore roles and find the right fit for your skills and goals.</p></div><Link className="cl-link" to="/find-jobs">View all jobs →</Link></div>
        <div className="cl-categories">{categories.map(([label, icon]) => <Link key={label} to="/find-jobs" state={{ job: label === "Work From Home" ? "remote" : label, country: "United States" }}><CareerIcon name={icon} /><strong>{label}</strong><span aria-hidden="true">→</span></Link>)}</div>
      </section>
      <section className="cl-journey cl-section" aria-label="Your career journey">{[["01","Discover your direction","Explore roles by skill, location and industry."],["02","Make your experience count","Bring your strengths together in your resume."],["03","Prepare for what’s next","Practice before the real conversation."]].map(([n,title,copy])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></div>)}</section>
      <section className="cl-help cl-section"><div><h2>Frequently asked questions</h2><p>Find answers to common questions about SkillStream.</p><div className="cl-faqs">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>
      <section className="cl-final-cta"><div><p className="cl-eyebrow">YOUR FUTURE STARTS WITH A STEP</p><h2>Ready for what’s next?</h2><p>Find your next opportunity and prepare to make it count.</p></div><Link className="cl-button" to="/find-jobs">Explore jobs <ArrowRight size={18}/></Link></section>
    </main>
    <footer className="cl-footer"><div className="cl-container cl-footer-grid">
      <div className="cl-footer-brand"><img src={logo} alt="SkillStream" /><p>Your career journey, one place.</p></div>
      <nav aria-label="About us"><h3>About Us</h3><Link to="/about">About</Link><Link to="/pricing/candidate">Pricing</Link><Link to="/blog">Blog</Link><Link to="/contact">Contact</Link><Link to="/employers">Employers Page</Link></nav>
      <nav aria-label="Helpful resources"><h3>Helpful Resources</h3><a href="#site-map">Site Map</a><Link to="/termsAndCondition">Terms of Use</Link><Link to="/privacyCenter">Privacy Center</Link><Link to="/securityCenter">Security Center</Link></nav>
      <div className="cl-reach"><h3>Reach Us</h3><a href="mailto:info@skillstreamjobs.us">info@skillstreamjobs.us</a><a href="tel:+18475981122">+1 (847) 598-1122</a><address>1827 Walden Office Sq Suite #260<br />Schaumburg, IL 60173</address></div>
      <details id="site-map" className="cl-site-map"><summary>Site Map</summary><nav aria-label="Site map"><Link to="/">Home</Link><Link to="/practiceInterviewLanding">Practice Interviews</Link><Link to="/employers">Employers</Link><Link to="/contact">Contact</Link></nav></details>
      <div className="cl-footer-bottom"><small>© {new Date().getFullYear()} SkillStream. All rights reserved.</small><nav aria-label="Social media"><a href="https://www.facebook.com/profile.php?id=61563887762159" target="_blank" rel="noreferrer">Facebook</a><a href="https://www.instagram.com/skillstream_jobs/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com/company/104131262/" target="_blank" rel="noreferrer">LinkedIn</a></nav></div>
    </div></footer>
  </div>;
}
