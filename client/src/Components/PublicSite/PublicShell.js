import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PublicNavigation, PublicAuthDialogs } from "./PublicHeader";
import logo from "../../assets/logo-twos.png";
import "./PublicSite.css";
const AuthContext = createContext(() => {});
export const usePublicAuth = () => useContext(AuthContext);
export default function PublicShell({
  children,
  title,
  description,
  employer = false,
  className = "",
}) {
  const [auth, setAuth] = useState(null);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setAuth(null);
  }, [pathname]);
  return (
    <AuthContext.Provider value={(mode = "register") => setAuth(mode)}>
      <div className={`ss-public ${className}`}>
        <Helmet>
          <title>{title} | SkillStream</title>
          <meta name="description" content={description || title} />
        </Helmet>
        <PublicNavigation employer={employer} onAuth={setAuth} />
        <main className="ss-public-main">{children}</main>
        <footer className="ss-public-footer">
          <div>
            <Link className="ss-brand" to="/">
              <img src={logo} alt="SkillStream" className="ss-footer-logo" />
            </Link>
            <p>Your next step, clearly.</p>
          </div>
          <nav aria-label="Company">
            <strong>SkillStream</strong>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/community">Community</Link>
          </nav>
          <nav aria-label="Products">
            <strong>Explore</strong>
            <Link to="/find-jobs">Find jobs</Link>
            <Link to="/employers">Hiring tools</Link>
            <Link to="/pricing/candidate">Practice pricing</Link>
            <Link to="/pricing/employer">Employer pricing</Link>
          </nav>
          <nav aria-label="Policies">
            <strong>Information</strong>
            <Link to="/privacyCenter">Privacy Policy</Link>
            <Link to="/termsAndCondition">Terms & Conditions</Link>
            <Link to="/securityCenter">Security Center</Link>
          </nav>
          <div className="ss-footer-bottom">
            © {new Date().getFullYear()} SkillStream.{" "}
            <a href="mailto:info@skillstreamjobs.us">info@skillstreamjobs.us</a>
          </div>
        </footer>
        <PublicAuthDialogs auth={auth} setAuth={setAuth} employer={employer} />
      </div>
    </AuthContext.Provider>
  );
}
