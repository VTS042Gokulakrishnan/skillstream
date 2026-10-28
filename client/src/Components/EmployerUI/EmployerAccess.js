import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo-twos.png";
import "./EmployerWorkspace.css";

const EmployerContext = createContext(null);
export const useEmployer = () => useContext(EmployerContext);

// Older workflow reads omitted auth headers. Keep them authenticated within
// the employer session so the server can enforce onboarding consistently.
axios.interceptors.request.use(config => {
  const server = process.env.REACT_APP_SERVER;
  if (server && String(config.url || "").startsWith(`${server}/api/v1/`) && localStorage.getItem("Role") === "Employer") {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Check on navigation as well as login. Never mount the destination before the
// server confirms completion, including when local storage says it is complete.
export default function EmployerAccess({ children }) {
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("Role");
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const setup = pathname.startsWith("/update-profile/");
  useEffect(() => {
    if (role !== "Employer" || !token || setup) return;
    let active = true;
    setResult(null);
    axios.get(`${process.env.REACT_APP_SERVER}/api/v1/employer/profile-status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { if (active) { localStorage.setItem("ProfileCompleted", String(data.profileCompleted === true)); setResult({ token, pathname, data }); } })
      .catch(() => { if (active) setResult({ token, pathname, error: true }); });
    return () => { active = false; };
  }, [token, role, pathname, setup, attempt]);
  if (role !== "Employer" || !token || setup) return children;
  if (!result || result.token !== token || result.pathname !== pathname) return <div className="em-access"><img src={logo} alt="SkillStream" /><p role="status">Opening your workspace…</p></div>;
  if (result.error) return <div className="em-access"><img src={logo} alt="SkillStream" /><h1>Unable to verify your profile</h1><p>Your workspace will open once we can confirm your account.</p><button className="em-primary" onClick={() => setAttempt(n => n + 1)}>Try again</button></div>;
  if (!result.data.profileCompleted) return <Navigate to={`/update-profile/${token}`} replace />;
  return <EmployerContext.Provider value={result.data}>{children}</EmployerContext.Provider>;
}
