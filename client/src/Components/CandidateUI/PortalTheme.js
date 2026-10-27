import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import "./PortalTheme.css";

const workspace = new Set([
  "/candidate-dashboard",
  "/applied-jobs",
  "/shortlisted-jobs",
  "/job-alerts",
  "/cv-manager",
  "/candidates-profile-view",
  "/messages",
  "/practiceInterview",
]);
const practice = new Set([
  "/practicalAssessment",
  "/practical-interview",
  "/coding-practice",
]);
export default function PortalTheme() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const kind = workspace.has(pathname)
      ? "ss-workspace"
      : practice.has(pathname)
      ? "ss-practice"
      : pathname === "/employers-list" || /^\/employers\/[^/]+$/.test(pathname)
      ? "ss-companies"
      : "";
    const jobHeader = pathname === "/" || pathname === "/find-jobs" || /^\/job-detail\/[^/]+\/[^/]+$/.test(pathname);
    if (kind || jobHeader) document.body.classList.add("ss-header");
    if (kind) document.body.classList.add("ss-theme", kind);
    return () =>
      document.body.classList.remove(
        "ss-header",
        "ss-theme",
        "ss-workspace",
        "ss-practice",
        "ss-companies"
      );
  }, [pathname]);
  return null;
}
