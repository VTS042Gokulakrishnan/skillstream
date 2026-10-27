import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Register from "../../Pages/Auth/Register";
import Login from "../../Pages/Auth/Login";
import "./PublicSite.css";
const AuthContext = createContext(() => {});
export const usePublicAuth = () => useContext(AuthContext);
export default function PublicShell({
  children,
  title,
  description,
  employer = false,
}) {
  const [auth, setAuth] = useState(null),
    [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenu(false);
  }, [pathname]);
  const role = localStorage.getItem("Role");
  return (
    <AuthContext.Provider value={(mode = "register") => setAuth(mode)}>
      <div className="ss-public">
        <Helmet>
          <title>{title} | SkillStream</title>
          <meta name="description" content={description || title} />
        </Helmet>
        <header className="ss-public-header">
          <Link className="ss-brand" to="/">
            Skill<span>Stream</span>
          </Link>
          <button
            className="ss-menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
          <nav className={menu ? "is-open" : ""} aria-label="Main navigation">
            <Link to="/find-jobs">Find jobs</Link>
            <Link to="/employers">For employers</Link>
            <Link to="/practiceInterviewLanding">Practice</Link>
            <Link to="/blog">Resources</Link>
            <Link to={employer ? "/pricing/employer" : "/pricing/candidate"}>
              Pricing
            </Link>
            <Link to="/about">About</Link>
          </nav>
          <div className="ss-header-actions">
            {localStorage.getItem("token") ? (
              <Link
                className="ss-btn ss-btn-small"
                to={
                  role === "Employer"
                    ? "/employer-dashboard"
                    : role === "Vendor"
                    ? "/vendor/dashboard"
                    : "/candidate-dashboard"
                }
              >
                Dashboard
              </Link>
            ) : (
              <>
                <button
                  className="ss-text-btn"
                  onClick={() => setAuth("login")}
                >
                  Sign in
                </button>
                <button
                  className="ss-btn ss-btn-small"
                  onClick={() => setAuth("register")}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </header>
        <main className="ss-public-main">{children}</main>
        <footer className="ss-public-footer">
          <div>
            <Link className="ss-brand" to="/">
              Skill<span>Stream</span>
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
        {auth === "register" && (
          <Register
            isModalOpen={true}
            setIsModalOpen={() => setAuth(null)}
            setModalType={setAuth}
            initialRole={employer ? "Employer" : "Candidate"}
          />
        )}
        {auth === "login" && (
          <Login
            isModalOpen={true}
            setIsModalOpen={() => setAuth(null)}
            setModalType={setAuth}
            initialRole={employer ? "Employer" : "Candidate"}
          />
        )}
      </div>
    </AuthContext.Provider>
  );
}
