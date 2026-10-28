import React, { useState } from "react";

export function initialsFor(firstName = "", lastName = "") {
  const parts = String(firstName).trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || "";
  const last = String(lastName).trim() || (parts.length > 1 ? parts[parts.length - 1] : "");
  return ((Array.from(first)[0] || "") + (Array.from(last)[0] || "")).toUpperCase() || "?";
}

export default function EmployerAvatar({ src, name = "", firstName, lastName, size = 48 }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const label = [firstName || name, lastName].filter(Boolean).join(" ");
  const colors = ["#6554c0", "#087f8c", "#1764c0", "#a33b70", "#95621b"];
  const hash = Array.from(label).reduce((n, c) => n + c.codePointAt(0), 0);
  return <span className="em-avatar" style={{ width: size, height: size, minWidth: size, background: colors[hash % colors.length], fontSize: size * .34 }} aria-label={label || "Unnamed profile"}>
    {src && failedSrc !== src ? <img src={src} alt={label} onError={() => setFailedSrc(src)} /> : initialsFor(firstName || name, lastName)}
  </span>;
}
