import React, { useState } from "react";
import { Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Server } from "../../App";
import Googlelogin from "./Googlelogin";
import MicrosoftLogin from "./MicrosoftLogin";
import { PolicyDialog } from "../../Components/PublicSite/PolicyView";
import { policyConsent } from "../../Components/PublicSite/policies";
import "../../Components/PublicSite/PublicSite.css";
import logo from "../../assets/logo-twos.png";
import { accountRole, loginDestination, saveSession } from "./authContext";
import "./Auth.css";
export default function Register({
  isModalOpen = true,
  setIsModalOpen,
  setModalType,
  initialRole,
  isVendor = false,
}) {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const complete = (data) => { saveSession(data); setIsModalOpen(false); navigate(loginDestination(data, location)); };
  const role = accountRole(pathname, { initialRole, isVendor });
  const [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      confirm: "",
    }),
    [agreed, setAgreed] = useState(false),
    [policy, setPolicy] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agreed)
      return setError(
        "Please agree to the terms and acknowledge the privacy policy."
      );
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    setBusy(true);
    try {
      await axios.post(Server + "/api/v1/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        region: "United States",
        policyAcceptance: policyConsent(role),
      });
      setSuccess(true);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "We could not create your account. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Modal
        open={!!isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={580}
        className="ss-signup-modal ss-auth-modal"
        title={<><img className="ss-auth-brand" src={logo} alt="SkillStream" /><span className="ss-auth-heading">{"Create your " + role.toLowerCase() + " account"}</span></>}
      >
        <div className="ss-public">
          <p>
            {role === "Employer"
              ? "Manage job posts and connect with candidates."
              : "Find opportunities and prepare for your next interview."}
          </p>
          {success ? (
            <div role="status">
              <p className="ss-notice">
                Account created. Please check your email to confirm your account
                before signing in.
              </p>
              <button className="ss-btn" onClick={() => setModalType("login")}>
                Go to sign in
              </button>
            </div>
          ) : (
            <>
              <form className="ss-form" onSubmit={submit}>
                {[
                  ["name", "Name", "text"],
                  [
                    "email",
                    role === "Employer" ? "Work email" : "Email",
                    "email",
                  ],
                  ["password", "Password", "password"],
                  ["confirm", "Confirm password", "password"],
                ].map(([name, label, type]) => (
                  <label key={name}>
                    {label}
                    <input
                      name={name}
                      type={type}
                      autoComplete={
                        name === "confirm" || name === "password"
                          ? "new-password"
                          : name === "name"
                          ? "name"
                          : "email"
                      }
                      required
                      minLength={type === "password" ? 8 : undefined}
                      maxLength={type === "password" ? 128 : 150}
                      value={form[name]}
                      onChange={update}
                    />
                  </label>
                ))}
                <label className="ss-agreement">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    I agree to the{" "}
                    <button
                      className="ss-text-btn"
                      type="button"
                      onClick={() => setPolicy("terms")}
                    >
                      Terms & Conditions
                    </button>
                    {role === "Employer" ? ", including Employer Terms," : ""}{" "}
                    and acknowledge the{" "}
                    <button
                      className="ss-text-btn"
                      type="button"
                      onClick={() => setPolicy("privacy")}
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
                {role === "Employer" && (
                  <p className="ss-muted">
                    You must be authorized to act for your organization.
                  </p>
                )}
                {error && (
                  <p className="ss-notice ss-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="ss-btn" disabled={busy || !agreed}>
                  {busy
                    ? "Creating account…"
                    : role === "Employer"
                    ? "Create employer account"
                    : "Create account"}
                </button>
              </form>
              <p
                className="ss-muted"
                style={{ textAlign: "center", marginTop: 20 }}
              >
                Or continue with
              </p>
              {agreed ? (
                <div className="ss-signup-social">
                  <Googlelogin
                    userType={role}
                    setIsModalOpen={setIsModalOpen}
                    policyAcceptance={policyConsent(role)}
                    onAuthenticated={complete}
                  />
                  <MicrosoftLogin
                    role={role}
                    region="United States"
                    policyAcceptance={policyConsent(role)}
                    onAuthenticated={complete}
                  />
                </div>
              ) : (
                <p className="ss-muted" style={{ textAlign: "center" }}>
                  Agree above to continue with Google or Microsoft.
                </p>
              )}
              <div className="ss-dialog-actions">
                <span className="ss-muted">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="ss-text-btn"
                    onClick={() => setModalType("login")}
                  >
                    Sign in
                  </button>
                </span>
                <button
                  type="button"
                  className="ss-text-btn"
                  onClick={() => setPolicy("security")}
                >
                  Security Center
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
      <PolicyDialog kind={policy} onClose={() => setPolicy(null)} />
    </>
  );
}
