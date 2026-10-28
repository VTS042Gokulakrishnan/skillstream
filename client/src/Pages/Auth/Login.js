import React, { useRef, useState } from "react";
import { Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Server } from "../../App";
import Googlelogin from "./Googlelogin";
import MicrosoftLogin from "./MicrosoftLogin";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "../../assets/logo-twos.png";
import { accountRole, loginDestination, saveSession } from "./authContext";
import "../../Components/PublicSite/PublicSite.css";
import "./Auth.css";

export default function Login({ isModalOpen = true, setIsModalOpen, setModalType, initialRole, isVendor = false }) {
  const location = useLocation(), navigate = useNavigate();
  const role = accountRole(location.pathname, { initialRole, isVendor });
  const [stage, setStage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const captchaRef = useRef(null);
  const close = () => setIsModalOpen(false);
  const changeStage = (next) => { setError(""); setNotice(""); setStage(next); setPassword(""); setConfirm(""); setCaptcha(null); };
  const complete = (data) => {
    saveSession(data);
    close();
    navigate(loginDestination(data, location));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError(""); setNotice("");
    if (stage === "login" && !captcha) return setError("Please complete the security check.");
    if (stage === "reset" && password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      if (stage === "login") {
        const { data } = await axios.post(`${Server}/api/v1/auth/login`, { email: email.trim(), password, role, region: "United States", captcha });
        if (data.message === "Login Successfully") complete(data);
        else if (data.message === "Email Verification Pending") { setUserId(data.userId); setStage("confirm"); }
        else setError(data.message || "Unable to sign in. Please try again.");
      } else if (stage === "recover") {
        const { data } = await axios.post(`${Server}/api/v1/password/forgotPassword`, { email: email.trim(), role, region: "United States" });
        if (data.userId) { setUserId(data.userId); setStage("reset"); setNotice("Check your email for your password reset code."); }
        else setNotice(data.message || "Check your email for password reset instructions.");
      } else if (stage === "reset") {
        await axios.post(`${Server}/api/v1/password/resetPassword/${userId}`, { password, securityCode: otp, region: "United States" });
        changeStage("login"); setNotice("Password updated. Sign in with your new password.");
      } else {
        await axios.post(`${Server}/api/v1/auth/register/confirmation/resend`, { userId, role, region: "United States" });
        setNotice("Verification email sent. Follow the link in your email, then sign in.");
      }
    } catch (err) {
      const data = err.response?.data;
      if (stage === "login" && data?.message === "Profile Incomplete. Please update your profile." && data.accessToken) {
        saveSession(data); close(); navigate(`/update-profile/${data.accessToken}`);
      } else setError(data?.message || "Unable to connect. Please try again.");
    } finally {
      setBusy(false);
      if (stage === "login") { setCaptcha(null); captchaRef.current?.reset(); }
    }
  };
  const title = stage === "login" ? `Sign in to your ${role.toLowerCase()} account` : stage === "recover" ? "Forgot your password?" : stage === "reset" ? "Set a new password" : "Confirm your email";
  return <Modal open={!!isModalOpen} onCancel={close} footer={null} width={500} className="ss-auth-modal" title={<><img className="ss-auth-brand" src={logo} alt="SkillStream" /><span className="ss-auth-heading">{title}</span></>}>
    <div className="ss-public">
      <p>{stage === "login" ? (role === "Vendor" ? "Welcome back. Connect with your hiring partners." : role === "Employer" ? "Welcome back. Your next great hire starts here." : "Welcome back. Take the next step in your career.") : stage === "recover" ? `Enter the email for your ${role.toLowerCase()} account.` : stage === "reset" ? "Enter the code from your email and choose a new password." : "Verify your email address before signing in."}</p>
      {error && <p className="ss-notice ss-error" role="alert">{error}</p>}
      {notice && <p className="ss-notice" role="status">{notice}</p>}
      <form className="ss-form" onSubmit={submit}>
        {(stage === "login" || stage === "recover") && <label>Email<input autoFocus name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>}
        {stage === "reset" && <label>Verification code<input autoFocus name="otp" autoComplete="one-time-code" required value={otp} onChange={e => setOtp(e.target.value)} /></label>}
        {(stage === "login" || stage === "reset") && <label>Password<div className="ss-auth-password"><input name="password" type={visible ? "text" : "password"} autoComplete={stage === "reset" ? "new-password" : "current-password"} required minLength={stage === "reset" ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} /><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button></div></label>}
        {stage === "reset" && <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} /></label>}
        {stage === "login" && <><div className="ss-auth-help"><button type="button" className="ss-text-btn" onClick={() => changeStage("recover")}>Forgot password?</button></div><div className="ss-auth-captcha"><ReCAPTCHA ref={captchaRef} sitekey="6LcxaGYrAAAAAGEbS0IuB200lZKYBBbh4af426yP" onChange={setCaptcha} onExpired={() => setCaptcha(null)} onErrored={() => { setCaptcha(null); setError("The security check could not load. Please retry."); }} /></div></>}
        <button type="submit" className="ss-btn ss-auth-submit" disabled={busy}>{busy ? "Please wait…" : stage === "login" ? "Sign in" : stage === "recover" ? "Send reset code" : stage === "reset" ? "Update password" : "Resend verification email"}</button>
      </form>
      {stage === "login" && <><div className="ss-auth-divider">or continue with</div><div className="ss-auth-social"><Googlelogin userType={role} setIsModalOpen={setIsModalOpen} onAuthenticated={complete} /><MicrosoftLogin role={role} region="United States" onAuthenticated={complete} /></div>{role !== "Vendor" && <p className="ss-auth-bottom">New to SkillStream? <button className="ss-text-btn" type="button" onClick={() => setModalType("register")}>Create {role.toLowerCase()} account</button></p>}</>}
      {stage !== "login" && <p className="ss-auth-bottom"><button className="ss-text-btn" type="button" onClick={() => changeStage("login")}>Back to {role.toLowerCase()} sign in</button></p>}
    </div>
  </Modal>;
}
