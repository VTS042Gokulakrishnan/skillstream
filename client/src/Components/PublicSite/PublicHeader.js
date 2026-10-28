import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import logo from "../../assets/logo-twos.png";
import "./PublicSite.css";
import "./PublicHeader.css";

export function useSessionRole() {
  const read = () => localStorage.getItem("token") ? localStorage.getItem("Role") : null;
  const [role, setRole] = useState(read);
  useEffect(() => {
    const update = () => setRole(read());
    window.addEventListener("skillstream-auth", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("skillstream-auth", update); window.removeEventListener("storage", update); };
  }, []);
  return role;
}

export function PublicAuthDialogs({ auth, setAuth, employer = false }) {
  const { pathname } = useLocation();
  const vendor = auth === "vendor" && pathname === "/employers";
  const close = () => setAuth(null);
  if (auth === "vendor" && !vendor) return null;
  if (auth === "register") return <Register key={pathname} isModalOpen setIsModalOpen={close} setModalType={setAuth} initialRole={employer ? "Employer" : "Candidate"} />;
  if (auth === "login" || vendor) return <Login key={pathname + auth} isModalOpen setIsModalOpen={close} setModalType={setAuth} isVendor={vendor} initialRole={vendor ? "Vendor" : employer ? "Employer" : "Candidate"} />;
  return null;
}

export function PublicNavigation({ employer = false, onAuth }) {
  const { pathname } = useLocation();
  const role = useSessionRole();
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [pathname]);
  const openAuth = mode => { setMenu(false); onAuth(mode); };
  const dashboard = role === "Employer" ? "/employer-dashboard" : role === "Vendor" ? "/vendor/dashboard" : "/candidate-dashboard";
  return <header className="ss-site-header">
    <div className="ss-site-header-inner">
      <Link className="ss-site-brand" to="/" aria-label="SkillStream home"><img src={logo} alt="SkillStream" /></Link>
      <button className="ss-site-menu-toggle" aria-label={menu ? "Close navigation" : "Open navigation"} aria-expanded={menu} aria-controls="public-navigation" onClick={() => setMenu(!menu)}>{menu ? "✕" : "☰"}</button>
      <nav id="public-navigation" className={menu ? "ss-site-nav is-open" : "ss-site-nav"} aria-label="Main navigation" onKeyDown={e => { if (e.key === "Escape") { setMenu(false); document.querySelector(".ss-site-menu-toggle")?.focus(); } }}>
        <div className="ss-site-links">
          {role === "Candidate" && <><Link to="/find-jobs">Find Jobs</Link><Link to="/employers-list">Companies</Link></>}
          {employer ? <><Link to="/pricing/employer">Pricing</Link></> : <><Link to="/blog">Blogs</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></>}
          {employer && <Link to="/blog">Resources</Link>}
          {!role && ["/", "/employers"].includes(pathname) && <Link to="/community">Community</Link>}
        </div>
        <div className="ss-site-actions">
          {!role && (!employer || pathname === "/employers") && <Link className="ss-site-audience" to={employer ? "/" : "/employers"}>{employer ? "Job seekers" : "For employers"}</Link>}
          {!role && pathname === "/employers" && <button className="ss-site-vendor" onClick={() => openAuth("vendor")}>Login as Vendor</button>}
          {role ? <Link className="ss-site-primary" to={dashboard}>Dashboard →</Link> : <><button className="ss-site-signin" onClick={() => openAuth("login")}>{employer ? "Employer login" : "Sign in"}</button><button className="ss-site-primary" onClick={() => openAuth("register")}>{employer ? "Get started" : "Register"} <span aria-hidden="true">→</span></button></>}
        </div>
      </nav>
    </div>
  </header>;
}

export default function PublicHeader() {
  const [auth, setAuth] = useState(null);
  const { pathname } = useLocation();
  useEffect(() => { setAuth(null); }, [pathname]);
  const employer = pathname === "/employers" || pathname === "/pricing/employer";
  return <><PublicNavigation employer={employer} onAuth={setAuth} /><PublicAuthDialogs auth={auth} setAuth={setAuth} employer={employer} /></>;
}
