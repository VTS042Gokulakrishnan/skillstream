import React, { useEffect } from "react";
import "./EmailStatus.css";
import NewLogo from "../../assets/logo-twos.png";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function EmailStatus() {
  const params = new URLSearchParams(window.location.search);

  const status = params.get("status");
  const role = params.get("role");
  const region = params.get("region");

  const regionBase =
    {
      Canada: "https://skillstreamjobs.ca",
      "United States": "https://skillstreamjobs.us",
      India: "https://skillstreamlabs.com",
    }[region] || "https://skillstreamjobs.us";

  const redirectUrl =
    role === "Employer" ? `${regionBase}/employers` : `${regionBase}/`;

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 15000);
    return () => clearTimeout(timer);
  }, [redirectUrl]);

  const getMessage = () => {
    if (status === "expired")
      return {
        title: "Verification Link Expired",
        desc: "This verification link is no longer valid. Please request a new verification email to continue.",
        icon: <FaExclamationTriangle className="email-icon expired" />,
      };

    if (status === "alreadyVerified")
      return {
        title: "Email Already Verified",
        desc: "Your email address is already verified. You will be redirected shortly.",
        icon: <FaInfoCircle className="email-icon info" />,
      };

    if (status === "success")
      return {
        title: "Email Verified Successfully",
        desc: "Thank you for verifying your email. Your account is now active.",
        icon: <FaCheckCircle className="email-icon success" />,
      };
    if (status === "invalid")
      return {
        title: "Invalid Verification Link",
        desc: "This verification link is invalid or has already been used. Please register again or request a new verification email.",
        icon: <FaTimesCircle className="email-icon invalid" />,
      };
    return {
      title: "Unknown Status",
      desc: "Something went wrong. Please try again later.",
      icon: <FaInfoCircle className="email-icon info" />,
    };
  };

  const { title, desc, icon } = getMessage();

  return (
    <div className="email-status-wrapper">
      <div className="email-status-card">
        {/* Center block */}
        <div className="center-block">
          <img src={NewLogo} alt="SkillStream Logo" className="logo" />
          {icon}
        </div>

        <h1>{title}</h1>
        <p>{desc}</p>

        <button
          className="redirect-btn"
          onClick={() => (window.location.href = redirectUrl)}
        >
          Visit Home Page
        </button>

        <span className="auto-redirect">
          You’ll be redirected automatically in a few seconds…
        </span>
      </div>
    </div>
  );
}
