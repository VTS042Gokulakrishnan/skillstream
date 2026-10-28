import React from "react";
import logo from "../../assets/logo-twos.png";
import "./BrandLoader.css";

// Keep the brand and animation in one place for every API loading surface.
export default function BrandLoader({ size = "page", label = "Loading…" }) {
  return <span className={`ss-brand-loader ss-brand-loader--${size}`} role="status" aria-live="polite">
    <span className="ss-brand-loader-mark"><img src={logo} alt="" /><span /></span>
    {label && <span className="ss-brand-loader-label">{label}</span>}
  </span>;
}
