// InterviewedCandidates.js
// ✅ Ready-to-paste page
// ✅ Keeps SAME collapsed layout + same candidate card design classes (Applicants.css)
// ✅ Separates Interview pipeline into: Video Round + Coding Round, each with Pending / Completed tabs
// ✅ Pending = status "Sent" (or missing), Completed = "Completed"
// ✅ Keeps existing features: Invite modal (DemoModal), View Results/Transcript/Coding Summary/Coding Video/Coding QA dropdown, Download Video Results PDF
// ✅ Supports Admin: My Jobs vs Other Users Jobs + Vendor tab (same as Shortlisted page structure)

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Spin,
  Empty,
  Tooltip,
  Dropdown,
  Collapse,
  Table,
  Card,
  List,
  Tag,
  Typography,
  Tabs,
  Steps,
} from "antd";
import { Server } from "../../../App";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";
import { FaBriefcase } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import DemoModal from "Components/VideoAssessment/DemoModal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Applicants.css";
import { jwtDecode } from "jwt-decode";
import { Segmented } from "antd";
import { Progress } from "antd";
import ResumePreviewDrawer from "Components/ReaderDrawer/ResumePreviewDrawer";



// ─────────────────────────────────────────────────────────────
// LIVE PIPELINE STATUS — helpers + component (ADDED)
// ─────────────────────────────────────────────────────────────

const relativeTime = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date)) return "";
  const diffMs  = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);
  if (diffSec < 10)  return "just now";
  if (diffSec < 60)  return `${diffSec}s ago`;
  if (diffMin < 60)  return `${diffMin} min ago`;
  if (diffHr  < 24)  return `${diffHr}h ago`;
  if (diffDay === 1) return `yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return `${date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const PIPELINE_STEPS = [
  { key: "mail",      title: "Invite Sent", matches: ["Interview Mail Sent", "Sent"],                                                                         qPattern: null },
  { key: "interview", title: "Interview",   matches: ["Interview Initialised", "Interview In Progress", "Completed All Questions"],                            qPattern: /^(Generating|Attending|In|Done|Completed)\s+\d+/i },
  { key: "analysis",  title: "Analysis",    matches: ["Analysis In Progress", "Analysis Completed", "Analysis Failed"],                                        qPattern: null },
  { key: "upload",    title: "Video & PDF", matches: ["Video Upload In Progress", "PDF Upload In Progress", "Video Upload Failed", "Completed"],               qPattern: null },
];

const LIVE_ERROR_STATUSES = new Set(["Analysis Failed", "Video Upload Failed"]);

/**
 * Maps flat interviewStatus (+ videoUploadStatus, qaPdfStatus) to a step index.
 * Used as fallback when interviewLiveStatus history array is empty (old DB records).
 *
 * Returns the index of the FURTHEST step reached, and whether it is terminal/error.
 */
const deriveFlatStepIdx = (flatStatus, videoUploadStatus, qaPdfStatus) => {
  const s  = flatStatus        || "";
  const vu = videoUploadStatus || "";
  const qa = qaPdfStatus       || "";

  // Step 3 (upload) — any upload-related status OR Completed
  if (
    s === "Completed"              ||
    s === "Video Upload In Progress" ||
    s === "Video Upload Failed"    ||
    vu === "In Progress"           ||
    vu === "Completed"             ||
    vu === "Failed"                ||
    qa === "In Progress"           ||
    qa === "Completed"             ||
    qa === "Failed"
  ) return 3;

  // Step 2 (analysis)
  if (s === "Analysis In Progress" || s === "Analysis Completed" || s === "Analysis Failed") return 2;

  // Step 1 (interview)
  if (s === "Interview In Progress" || s === "Interview Initialised") return 1;

  // Step 0 (mail sent)
  if (s === "Sent" || s === "Interview Mail Sent") return 0;

  // Nothing matched — no step lit up
  return -1;
};

const buildStepItems = (liveHistory, currentFlatStatus, videoUploadStatus, qaPdfStatus) => {
  const history = Array.isArray(liveHistory) ? liveHistory : [];
  const flat    = currentFlatStatus || "";

  // When history exists use it; otherwise derive from flat fields
  const hasHistory = history.length > 0;

  const occurred = new Set(history.map((e) => e.status).concat(flat ? [flat] : []));

  let currentStepIdx;
  if (hasHistory) {
    currentStepIdx = -1;
    PIPELINE_STEPS.forEach((step, idx) => {
      const hit =
        step.matches.some((m) => occurred.has(m)) ||
        (step.qPattern && [...occurred].some((s) => step.qPattern.test(s)));
      if (hit) currentStepIdx = idx;
    });
  } else {
    // Old records — derive from flat status fields
    currentStepIdx = deriveFlatStepIdx(flat, videoUploadStatus, qaPdfStatus);
  }

  const hasError = [...occurred].some((s) => LIVE_ERROR_STATUSES.has(s)) ||
    (flat === "Analysis Failed") || (flat === "Video Upload Failed") ||
    (videoUploadStatus === "Failed");

  // Step 0 (invite sent) should always show green finish — the invite IS already sent
  // Step 1 then becomes the "pending" process step (waiting for candidate to start)
  const inviteSentStatuses = new Set(["Sent", "Interview Mail Sent"]);
  const isInviteSentOnly = currentStepIdx === 0;

  // Fully complete — all steps green
  const isFullyComplete = flat === "Completed" || (videoUploadStatus === "Completed" && qaPdfStatus === "Completed");

  const lastTimeForStep = (step) => {
    const relevant = history.filter(
      (e) => step.matches.includes(e.status) || (step.qPattern && step.qPattern.test(e.status))
    );
    return relevant.length ? relevant[relevant.length - 1].time : null;
  };

  const interviewStep = PIPELINE_STEPS[1];
  const latestQ = history
    .filter((e) => interviewStep.qPattern && interviewStep.qPattern.test(e.status))
    .slice(-1)[0] || null;

  return PIPELINE_STEPS.map((step, idx) => {
    // When only invite sent: step 0 = finish (green), step 1 = process (pending dot), rest = wait
    const isCompleted = idx < currentStepIdx
      || (idx === currentStepIdx && isFullyComplete && !hasError)
      || (isInviteSentOnly && idx === 0);
    const isCurrent   = (idx === currentStepIdx && !isFullyComplete && !isInviteSentOnly)
      || (isInviteSentOnly && idx === 1);
    const isError     = hasError && idx === currentStepIdx;

    let antStatus = "wait";
    if (isCompleted)           antStatus = "finish";
    if (isCurrent && !isError) antStatus = "process";
    if (isError)               antStatus = "error";

    const t = lastTimeForStep(step);
    const descParts = [];
    if (t) descParts.push(relativeTime(t));
    if (step.key === "interview" && isCurrent && latestQ) descParts.push(latestQ.status);
    if (isError) {
      if (occurred.has("Analysis Failed") || flat === "Analysis Failed")    descParts.push("Analysis error");
      if (occurred.has("Video Upload Failed") || flat === "Video Upload Failed") descParts.push("Upload error");
    }

    return {
      title: step.title,
      description: descParts.join(" · ") || undefined,
      status: antStatus,
      icon: undefined, // use Ant Design default process dot (circle), not a spinner
    };
  });
};

const LiveStatusPanel = ({ applicant, userId, jobId, candidateId }) => {
  const token = localStorage.getItem("token");
  const seed = {
    interviewStatus:     applicant.interviewStatus     || "",
    interviewLiveStatus: applicant.interviewLiveStatus || [],
    videoUploadStatus:   applicant.videoUploadStatus   || "",
    qaPdfStatus:         applicant.qaPdfStatus         || "",
  };
  const [liveData, setLiveData] = useState(seed);
  const intervalRef = useRef(null);
  const isTerminal = useCallback((s) => s === "Completed" || s === "Analysis Failed", []);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/videoInterview/liveStatus/${userId}/${jobId}/${candidateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiveData(data);
      if (isTerminal(data.interviewStatus) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch { /* API not yet deployed — stay on seed silently */ }
  }, [userId, jobId, candidateId, token, isTerminal]);

  useEffect(() => {
    setLiveData(seed);
    if (!isTerminal(applicant.interviewStatus)) {
      fetchStatus();
      intervalRef.current = setInterval(fetchStatus, 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicant.interviewStatus, candidateId]);

  const history           = liveData.interviewLiveStatus || [];
  const flatStatus        = liveData.interviewStatus     || "";
  const videoUploadStatus = liveData.videoUploadStatus   || "";
  const qaPdfStatus       = liveData.qaPdfStatus         || "";
  const stepItems         = buildStepItems(history, flatStatus, videoUploadStatus, qaPdfStatus);

  // -1 = nothing matched yet; Ant Design renders all steps as "wait" (no spinner shown)
  const currentStep = stepItems.reduce((acc, s, idx) =>
    (s.status === "finish" || s.status === "process" || s.status === "error") ? idx : acc, -1);

  return (
    <div style={{ marginTop: 14, padding: "12px 14px", background: "#f9f9f9", borderRadius: 10, border: "1px solid #ebebeb" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Interview Pipeline
        </span>
        {history.length > 0 && (
          <span style={{ fontSize: 10, color: "#bbb" }}>
            Updated {relativeTime(history[history.length - 1]?.time)}
          </span>
        )}
      </div>

      <Steps current={currentStep} size="small" items={stepItems} style={{ fontSize: 11 }} />

      {history.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 110, overflowY: "auto", paddingRight: 2 }}>
          {[...history].reverse().map((entry, idx) => {
            const isErr  = LIVE_ERROR_STATUSES.has(entry.status);
            const isDone = entry.status === "Completed";
            return (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "3px 0", borderBottom: idx < history.length - 1 ? "1px dashed #f0f0f0" : "none" }}>
                {isErr  ? <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 11, marginTop: 2 }} />
                : isDone ? <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 11, marginTop: 2 }} />
                :          <ClockCircleOutlined style={{ color: "#1890ff", fontSize: 11, marginTop: 2 }} />}
                <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: isErr ? "#ff4d4f" : isDone ? "#52c41a" : "#333" }}>
                  {entry.status}
                </span>
                <span style={{ fontSize: 10, color: "#bbb", whiteSpace: "nowrap" }}>
                  {relativeTime(entry.time)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const { Paragraph, Text } = Typography;

// ----------------------
// Helpers reused from your Shortlisted.js (only what Interview Pipeline needs)
// ----------------------
const isJsonString = (str) => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null;
  } catch (e) {
    return false;
  }
};

const VIDEO_INTERVIEW_ACTIVE_STATUSES = new Set([
  "Sent",
  "Interview In Progress",
  "Analysis In Progress",
  "Video Upload In Progress",
  "Video Upload Failed",
  "Completed",
  "Analysis Failed",
]);

const getVideoInterviewStatus = (applicant) => {
  if (applicant?.interviewStatus) return applicant.interviewStatus;
  if (applicant?.interviewSummary || applicant?.video || applicant?.transcript) {
    return "Completed";
  }
  return "";
};

const hasVideoInterviewAssets = (applicant) =>
  Boolean(
    applicant?.interviewSummary || applicant?.video || applicant?.transcript,
  );

const getVideoStatusMeta = (applicant) => {
  const status = applicant?.videoUploadStatus;
  if (status === "In Progress") return { color: "cyan", label: "Video Upload In Progress" };
  if (status === "Failed") return { color: "red", label: "Video Upload Failed" };
  if (status === "Completed") return { color: "green", label: "Video Uploaded" };
  if (getVideoInterviewStatus(applicant) === "Video Upload Failed") {
    return { color: "red", label: "Video Upload Failed" };
  }
  if (getVideoInterviewStatus(applicant) === "Video Upload In Progress") {
    return { color: "cyan", label: "Video Upload In Progress" };
  }
  return null;
};

const getPdfStatusMeta = (applicant) => {
  const status = applicant?.qaPdfStatus;
  if (status === "In Progress") return { color: "gold", label: "PDF Upload In Progress" };
  if (status === "Failed" || applicant?.qaPdfError) {
    return { color: "volcano", label: "PDF Upload Failed" };
  }
  if (status === "Completed" || applicant?.transcript) {
    return { color: "green", label: "PDF Uploaded" };
  }
  return null;
};

const getInterviewStatusMeta = (applicant) => {
  const status = getVideoInterviewStatus(applicant);
  if (status === "Sent") return { color: "orange", label: "Sent" };
  if (status === "Interview In Progress") return { color: "blue", label: "Interview In Progress" };
  if (status === "Analysis In Progress") return { color: "gold", label: "Analysis In Progress" };
  if (status === "Analysis Failed") return { color: "red", label: "Analysis Failed" };
  if (status === "Completed") return { color: "green", label: "Completed" };
  return null;
};

const getInterviewStatusTags = (applicant) =>
  [getInterviewStatusMeta(applicant), getVideoStatusMeta(applicant), getPdfStatusMeta(applicant)].filter(Boolean);

//json parsing
const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};
const parseTable = (tableString) => {
  const rows = tableString
    .trim()
    .split("\n")
    .filter((row) => !row.startsWith("|---"))
    .map((row) => row.split("|").map((cell) => cell.trim()));
  return rows;
};

const SkillTable = ({ skillMatchingTable }) => {
  if (!skillMatchingTable) return null;
  const rows = parseTable(skillMatchingTable);
  if (!rows?.length) return null;

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "20px",
      }}
    >
      <thead>
        <tr>
          {rows[0].map((header, index) => (
            <th
              key={index}
              style={{ border: "1px solid #ddd", padding: "8px" }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(1).map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                style={{ border: "1px solid #ddd", padding: "8px" }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ----------------------
// Main Component
// ----------------------
const InterviewedCandidates = () => {
  // Data (same structure as Shortlisted.js)
  const [applicants, setApplicants] = useState([]);
  const [vendorApplicants, setVendorApplicants] = useState([]);
  const [OtherApplicants, setOtherApplicants] = useState([]);
  const [vendorOtherApplicants, setVendorOtherApplicants] = useState([]);

  // Tabs
  const [activeTab, setActiveTab] = useState("myJobs"); // myJobs | otherJobs
  const [mainTab, setMainTab] = useState("applicants"); // applicants | vendorApplicants
  const [roundTab, setRoundTab] = useState("video"); // video | coding
  const [stageTab, setStageTab] = useState("pending"); // pending | completed
  const [roleAccess, setRoleAccess] = useState("");

  // Loaders
  const [loader, setLoader] = useState(false);
  const [adminLoader, setAdminLoader] = useState(false);

  // Invite Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState({});

  // Results
  const [videoResults, setVideoResults] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [interviewTranscript, setInterviewTranscript] = useState({});
  const [isViewResultModalVisible, setIsViewResultModalVisible] =
    useState(false);

  // Vendor (optional; if you want vendor details modal, keep it)
  const [VendorModal, setVendorModal] = useState(false);
  const [VendorDetails, setVendorDetails] = useState({});
  // job filers
  const [jobTitleFilter, setJobTitleFilter] = useState("All");
  const [jobs, setJobs] = useState([]); // for dropdown options
  const [jobFilter, setJobFilter] = useState([]); // original list before dropdown filter

  //Admin & vendor job filers

  const [VendorJobTitleFilter, setVendorJobTitleFilter] = useState("All");
  const [vendorJobs, setVendorJobs] = useState([]);
  const [vendorJobFilter, setVendorJobFilter] = useState([]);

  const [otherJobTitleFilter, setOtherJobTitleFilter] = useState("All");
  const [otherUserJobs, setOtherUserJobs] = useState([]);
  const [otherUserjobFilter, setOtherUserJobFilter] = useState([]);

  const [vendorOtherJobTitleFilter, setVendorOtherJobTitleFilter] =
    useState("All");
  const [vendorOtherUserJobs, setVendorOtherUserJobs] = useState([]);
  const [vendorOtherUserjobFilter, setVendorOtherUserJobFilter] = useState([]);

  //resume preview drawer opening

  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [highlightArray, setHighlightArray] = useState([]);
  // Pagination (same UX pattern as your ApplicantLayout)
  const [panelPage, setPanelPage] = useState(1);
  const [applicantPage, setApplicantPage] = useState({});
  const panelsPerPage = 7;
  const applicantsPerPage = 1;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("UserId");
  const decoded = jwtDecode(token);
  const { access, organisationId } = decoded;

  // ----------------------
  //Resume Drawer
  // ----------------------
  const normalizeSkillsArray = (jobSkills) => {
    if (!jobSkills) return [];
    if (Array.isArray(jobSkills)) return jobSkills.filter(Boolean);

    // if skills stored as string "Java, Spring, AWS"
    if (typeof jobSkills === "string") {
      return jobSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [];
  };

  const openResumeDrawer = (resume, jobSkills) => {
    setResumeUrl(resume);
    setHighlightArray(normalizeSkillsArray(jobSkills));
    setResumeDrawerOpen(true);
  };

  const closeResumeDrawer = () => {
    setResumeDrawerOpen(false);
    setResumeUrl(null); // ✅ must reset
    setHighlightArray([]); // ✅ must reset
  };

  // ----------------------

  // ----------------------
  // Interview status rules
  // ----------------------
  const isInInterviewPipeline = (a) =>
    VIDEO_INTERVIEW_ACTIVE_STATUSES.has(getVideoInterviewStatus(a)) ||
    a?.CodingInterviewStatus === "Sent" ||
    a?.CodingInterviewStatus === "Completed" ||
    !!a?.CodingInterviewStatus;

  const matchRoundStage = (a, round, stage) => {
    if (round === "video") {
      const status = getVideoInterviewStatus(a);
      if (stage === "pending") return status !== "Completed";
      return status === "Completed" || hasVideoInterviewAssets(a);
    }
    if (round === "coding") {
      if (stage === "pending")
        return !a?.CodingInterviewStatus || a?.CodingInterviewStatus === "Sent";
      return a?.CodingInterviewStatus === "Completed";
    }
    return false;
  };
  // ----------------------
  // Get Interview score
  // ----------------------

  const getVideoInterviewScore = (applicant) => {
    if (!applicant?.interviewSummary) return null;
    const parsed = safeJsonParse(applicant.interviewSummary);
    const score = parsed?.analysis?.score;
    if (score === undefined || score === null) return null;

    // If score is already percent-like (0-100), keep.
    // If it’s 0-10 or 0-5, normalize (optional). We keep as-is if <=100.
    const n = Number(score);
    if (Number.isNaN(n)) return null;
    return n > 100 ? 100 : n < 0 ? 0 : n;
  };

  // Coding score from CodingInterviewSummary JSON: evaluation.total_score
  const getCodingInterviewScore = (applicant) => {
    if (!applicant?.CodingInterviewSummary) return null;
    const parsed = safeJsonParse(applicant.CodingInterviewSummary);
    const score = parsed?.evaluation?.total_score;
    if (score === undefined || score === null) return null;

    const n = Number(score);
    if (Number.isNaN(n)) return null;
    return n > 100 ? 100 : n < 0 ? 0 : n;
  };
  // ----------------------
  // Fetch (reuses same API as Shortlisted.js)
  // ----------------------

  const getApplicants = async (fetching) => {
    try {
      if (fetching === "fetch") setLoader(true);

      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/allApplicants/${userId}/${access}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Base “Approved” lists (same as your Shortlisted.js)
      const approved = data.allApplicants.jobs
        .map((job) => ({
          ...job,
          applicants: job.applicants.filter(
            (a) => a.applicationStatus === "Approved" && !a?.isVendorApplicant,
          ),
        }))
        .sort((a, b) => new Date(b.time) - new Date(a.time));

      const vendorApproved = data.allApplicants.jobs
        .filter((job) => job?.isVendor === true)
        .map((job) => ({
          ...job,
          applicants: job.applicants.filter(
            (a) =>
              a.applicationStatus === "Approved" &&
              a?.isVendorApplicant === true,
          ),
        }))
        .sort((a, b) => new Date(b.time) - new Date(a.time));

      setApplicants(approved);
      setJobs(approved);
      setJobFilter(approved);

      setVendorApplicants(vendorApproved);
      setVendorJobs(vendorApproved);
      setVendorJobFilter(vendorApproved);
      setLoader(false);

      if (access === "Admin") {
        if (fetching === "fetch") setAdminLoader(true);

        const { data: adminData } = await axios.get(
          `${Server}/api/v1/employer/jobs/allApplicants/${userId}/${access}/${organisationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const otherApproved = adminData.allApplicants.otherUserJobs
          .map((job) => ({
            ...job,
            applicants: job.applicants.filter(
              (a) =>
                a.applicationStatus === "Approved" && !a?.isVendorApplicant,
            ),
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        const otherVendorApproved = adminData.allApplicants.otherUserJobs
          .filter((job) => job?.isVendor === true)
          .map((job) => ({
            ...job,
            applicants: job.applicants.filter(
              (a) =>
                a.applicationStatus === "Approved" &&
                a?.isVendorApplicant === true,
            ),
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        setOtherApplicants(otherApproved);
        setOtherUserJobs(otherApproved);
        setOtherUserJobFilter(otherApproved);

        setVendorOtherApplicants(otherVendorApproved);
        setVendorOtherUserJobs(otherVendorApproved);
        setVendorOtherUserJobFilter(otherVendorApproved);
        setAdminLoader(false);
      }
    } catch (error) {
      setLoader(false);
      setAdminLoader(false);
    }
  };
  useEffect(() => {
    const filtered = jobFilter.filter((job) => {
      if (jobTitleFilter === "All") return true;
      return job.jobId === jobTitleFilter;
    });
    setApplicants(filtered);
  }, [jobTitleFilter, jobFilter]);

  useEffect(() => {
    const filtered = vendorJobFilter.filter((job) => {
      if (VendorJobTitleFilter === "All") return true;
      return job.jobId === VendorJobTitleFilter;
    });
    setVendorApplicants(filtered);
  }, [VendorJobTitleFilter, vendorJobFilter]);

  useEffect(() => {
    const filtered = otherUserjobFilter.filter((job) => {
      if (otherJobTitleFilter === "All") return true;
      return job.jobId === otherJobTitleFilter;
    });
    setOtherApplicants(filtered);
  }, [otherJobTitleFilter, otherUserjobFilter]);

  useEffect(() => {
    const filtered = vendorOtherUserjobFilter.filter((job) => {
      if (vendorOtherJobTitleFilter === "All") return true;
      return job.jobId === vendorOtherJobTitleFilter;
    });
    setVendorOtherApplicants(filtered);
  }, [vendorOtherJobTitleFilter, vendorOtherUserjobFilter]);
  useEffect(() => {
    setRoleAccess(decoded?.access);
    getApplicants("fetch");
  }, []);

  // ----------------------
  // Invite email (kept from your Shortlisted.js)
  // ----------------------
  const sendEmail = async ({
    userId,
    candidateId,
    jobId,
    from,
    to,
    candidateName,
    JobTitle,
    companyName,
  }) => {
    try {
      const payload = {
        userId,
        candidateId,
        jobId,
        from,
        to,
        candidateName,
        JobTitle,
        companyName,
      };

      await axios.post(
        `${Server}/api/v1/videoInterview/sendEmail/${userId}/${jobId}/${candidateId}`,
        payload,
      );
      toast.success("Email Invite Sent");
      // refresh to update Sent status if backend updates it
      getApplicants("update");
    } catch (error) {
      toast.error("Error in sending Interview Invite");
    }
  };

  const handleOpenModal = ({
    userId,
    candidateId,
    jobId,
    from,
    to,
    candidateName,
    JobTitle,
    companyName,
    CodingInterviewStatus,
    interviewStatus,
  }) => {
    setSelectedCandidate({
      userId,
      candidateId,
      jobId,
      from,
      to,
      candidateName,
      JobTitle,
      companyName,
      CodingInterviewStatus,
      interviewStatus,
    });
    setIsModalOpen(true);
  };

  // ----------------------
  // Results handlers (kept from your Shortlisted.js)
  // ----------------------
  const handleResults = (i) => {
    setInterviewTranscript(i);
    if (i?.video) setVideoLink(i?.video);

    if (i?.interviewSummary) {
      if (isJsonString(i?.interviewSummary)) {
        const parsed = JSON.parse(i?.interviewSummary);
        setVideoResults(parsed);
      } else {
        setVideoResults(i?.interviewSummary);
      }
    }
  };

  const handleViewModalCancel = () => setIsViewResultModalVisible(false);

  const dowloadVideoResults = async () => {
    const doc = new jsPDF();
    const margin = 10;
    const lineHeight = 8;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let yPosition = margin;

    const addWrappedText = (label, text) => {
      if (!text) return;
      const labelText = `${label}:`;
      const wrappedText = doc.splitTextToSize(
        `${labelText} ${text}`,
        pageWidth,
      );
      wrappedText.forEach((line) => {
        if (yPosition + lineHeight > pageHeight) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    };

    const addLine = (text, bold = false) => {
      if (!text) return;
      if (yPosition + lineHeight > pageHeight) {
        doc.addPage();
        yPosition = margin;
      }
      if (bold) doc.setFont(undefined, "bold");
      doc.text(text, margin, yPosition);
      if (bold) doc.setFont(undefined, "normal");
      yPosition += lineHeight;
    };

    doc.setFontSize(18);
    doc.text("Video Interview Analysis Result", margin, yPosition);
    yPosition += 10;
    doc.setFontSize(12);

    if (typeof videoResults === "string") {
      addLine("Old Format Summary", true);
      const lines = doc.splitTextToSize(videoResults, pageWidth);
      lines.forEach((line) => {
        if (yPosition + lineHeight > pageHeight) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    } else if (typeof videoResults === "object") {
      addLine("Structured AI Summary", true);
      addWrappedText("Score", videoResults?.analysis?.score);
      addWrappedText("Focus Category", videoResults?.focus_category);
      addWrappedText("Camera Summary", videoResults?.camera_summary);
      addWrappedText("Gadget Summary", videoResults?.gadget_summary);
      addWrappedText(
        "Next Round",
        videoResults?.analysis?.next_round_eligibility,
      );
      addWrappedText(
        "Communication Clarity",
        videoResults?.analysis?.communication_clarity,
      );

      const perQ = videoResults?.analysis?.per_question_feedback || {};
      for (const [key, q] of Object.entries(perQ)) {
        addLine(`${key}: ${q?.question || ""}`, true);
        addWrappedText("Answer Summary", q?.answer_summary);
        addWrappedText("Strengths", (q?.strengths || []).join(", "));
        addWrappedText(
          "Areas for Improvement",
          (q?.areas_for_improvement || []).join(", "),
        );
        if (q?.scores) {
          addWrappedText(
            "Scores",
            `Technical: ${q.scores?.technical_depth}, Problem Solving: ${q.scores?.problem_solving}, Practical Insight: ${q.scores?.practical_insight}`,
          );
        }
        yPosition += 5;
      }
    }

    doc.save("video-result.pdf");
  };

  // ----------------------
  // Dropdown menu (same behavior)
  // ----------------------
  const getMenuItemsByRound = (candidate) => {
    // VIDEO ROUND menu
    if (roundTab === "video") {
      return [
        ...(candidate?.video
          ? [
              {
                label: (
                  <a href={candidate.video} target="_blank" rel="noreferrer">
                    View Video
                  </a>
                ),
                key: "v0",
              },
            ]
          : []),

        ...(candidate?.interviewSummary
          ? [
              {
                label: (
                  <a
                    onClick={() => setIsViewResultModalVisible(true)}
                    style={{ cursor: "pointer" }}
                  >
                    View Results
                  </a>
                ),
                key: "v1",
              },
            ]
          : []),

        ...(candidate?.transcript
          ? [
              {
                label: (
                  <a
                    href={candidate.transcript}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Transcript
                  </a>
                ),
                key: "v2",
              },
            ]
          : []),
      ];
    }

    // CODING ROUND menu
    return [
      ...(candidate?.CodingInterviewSummary
        ? [
            {
              label: (
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() =>
                    Modal.info({
                      title: "Coding Interview Summary",
                      width: 800,
                      content: (() => {
                        try {
                          const summary = JSON.parse(
                            candidate.CodingInterviewSummary,
                          );
                          const evalData = summary.evaluation;
                          return (
                            <>
                              <p>
                                <b>Total Score:</b> {evalData.total_score}
                              </p>
                              <p>
                                <b>Decision:</b> {evalData.decision}
                              </p>
                              <p>
                                <b>Final Feedback:</b> {evalData.final_feedback}
                              </p>
                              <Table
                                dataSource={evalData.per_question}
                                pagination={false}
                                columns={[
                                  { title: "Q#", dataIndex: "id" },
                                  { title: "Feedback", dataIndex: "feedback" },
                                  { title: "Score", dataIndex: "score" },
                                ]}
                                rowKey="id"
                              />
                            </>
                          );
                        } catch {
                          return <p>No valid coding summary available.</p>;
                        }
                      })(),
                    })
                  }
                >
                  View Coding Results
                </button>
              ),
              key: "c0",
            },
          ]
        : []),

      ...(candidate?.codingVideo
        ? [
            {
              label: (
                <a
                  href={candidate.codingVideo}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Coding Video
                </a>
              ),
              key: "c1",
            },
          ]
        : []),

      ...(candidate?.codingQ_A
        ? [
            {
              label: (
                <a href={candidate.codingQ_A} target="_blank" rel="noreferrer">
                  View Coding QA
                </a>
              ),
              key: "c2",
            },
          ]
        : []),
    ];
  };

  // ----------------------
  // Vendor modal (optional)
  // ----------------------
  const showVendorModal = (vendor) => {
    setVendorModal(true);
    setVendorDetails(vendor);
  };
  const handleVendorModalCancel = () => {
    setVendorModal(false);
    setVendorDetails({});
  };

  // ----------------------
  // Choose dataset based on Admin tabs (same style as Shortlisted)
  // ----------------------
  const baseJobs = useMemo(() => {
    const isVendor = mainTab === "vendorApplicants";
    const isOther = activeTab === "otherJobs";

    if (!isVendor && !isOther) return applicants;
    if (!isVendor && isOther) return OtherApplicants;
    if (isVendor && !isOther) return vendorApplicants;
    return vendorOtherApplicants;
  }, [
    mainTab,
    activeTab,
    applicants,
    OtherApplicants,
    vendorApplicants,
    vendorOtherApplicants,
  ]);

  const filterJobsByRoundStage = (jobs, round, stage) => {
    return (jobs || [])
      .map((job) => ({
        ...job,
        applicants: (job.applicants || []).filter(
          (a) => isInInterviewPipeline(a) && matchRoundStage(a, round, stage),
        ),
      }))
      .filter((job) => (job.applicants || []).length > 0);
  };
  const filteredJobs = useMemo(() => {
    return filterJobsByRoundStage(baseJobs, roundTab, stageTab);
  }, [baseJobs, roundTab, stageTab]);

  const currentLoader = useMemo(() => {
    if (roleAccess === "Admin" && activeTab === "otherJobs") return adminLoader;
    return loader;
  }, [roleAccess, activeTab, adminLoader, loader]);
  const countCandidates = (jobsArr) =>
    (jobsArr || []).reduce(
      (sum, job) => sum + (job?.applicants?.length || 0),
      0,
    );

  const pendingCount = useMemo(() => {
    const list = filterJobsByRoundStage(baseJobs, roundTab, "pending");
    return countCandidates(list);
  }, [baseJobs, roundTab]);

  const completedCount = useMemo(() => {
    const list = filterJobsByRoundStage(baseJobs, roundTab, "completed");
    return countCandidates(list);
  }, [baseJobs, roundTab]);
  useEffect(() => {
    // if pending has candidates => stay pending, else go completed
    if (pendingCount > 0) {
      setStageTab("pending");
    } else {
      setStageTab("completed");
    }
    setPanelPage(1);
    setApplicantPage({});
  }, [
    roundTab,
    mainTab,
    activeTab,
    jobTitleFilter,
    VendorJobTitleFilter,
    otherJobTitleFilter,
    vendorOtherJobTitleFilter,
    pendingCount,
  ]);
  // ----------------------
  // SAME collapsed layout + candidate cards (pipeline-focused actions)
  // ----------------------
  useEffect(() => {
    setPanelPage(1);
    setApplicantPage({});
  }, [mainTab, activeTab, roundTab, stageTab]);
  const ApplicantLayout = (givenApplicants, applLoader) => {
    const totalPanels = givenApplicants.length;
    const totalPanelPages = Math.ceil(totalPanels / panelsPerPage);

    const paginatedPanels = givenApplicants.slice(
      (panelPage - 1) * panelsPerPage,
      panelPage * panelsPerPage,
    );

    const renderPageNumbers = (current, total, onChange) => {
      const pages = [];
      let start = 1;
      let end = total;

      if (total > 4) {
        if (current <= 2) {
          start = 1;
          end = 4;
        } else if (current >= total - 1) {
          start = total - 3;
          end = total;
        } else {
          start = current - 1;
          end = current + 1;
        }
      }

      if (start > 1) {
        pages.push(
          <Button
            key={1}
            size="small"
            type={current === 1 ? "primary" : "default"}
            onClick={() => onChange(1)}
          >
            1
          </Button>,
        );
        if (start > 2) pages.push(<span key="dots1">...</span>);
      }

      for (let i = start; i <= end; i++) {
        pages.push(
          <Button
            key={i}
            size="small"
            type={current === i ? "primary" : "default"}
            onClick={() => onChange(i)}
          >
            {i}
          </Button>,
        );
      }

      if (end < total) {
        if (end < total - 1) pages.push(<span key="dots2">...</span>);
        pages.push(
          <Button
            key={total}
            size="small"
            type={current === total ? "primary" : "default"}
            onClick={() => onChange(total)}
          >
            {total}
          </Button>,
        );
      }

      return pages;
    };

    if (applLoader) {
      return (
        <p
          style={{
            paddingBottom: "80px",
            fontSize: "22px",
            fontweight: "800",
            color: "#000",
            textAlign: "center",
          }}
        >
          Fetching Interview Candidates...
        </p>
      );
    }

    if (!givenApplicants?.length) {
      return <Empty description="No candidates in this stage" />;
    }

    return (
      <div>
        {paginatedPanels.map((e, idx) => {
          const currentApplicantPage = applicantPage[e.jobId] || 1;
          const totalApplicants = e.applicants.length;
          const totalApplicantPages = Math.ceil(
            totalApplicants / applicantsPerPage,
          );

          const paginatedApplicants = e.applicants.slice(
            (currentApplicantPage - 1) * applicantsPerPage,
            currentApplicantPage * applicantsPerPage,
          );

          return (
            <div className="tabs-box" key={idx}>
              <Collapse bordered={false} key={idx}>
                <Collapse.Panel
                  header={
                    activeTab === "myJobs"
                      ? `${e.JobTitle} (${e.newId ? e.newJobId : e.jobId}) - ${
                          e.applicants.length
                        } Candidate${e.applicants.length > 1 ? "s" : ""}`
                      : `${e.JobTitle} (${e.newId ? e.newJobId : e.jobId}) - ${
                          e.EmailAddress
                        } - ${e.applicants.length} Candidate${
                          e.applicants.length > 1 ? "s" : ""
                        }`
                  }
                  key={idx}
                >
                  <div className="aplicants-upper-bar">
                    <h6>{e.JobTitle}</h6>
                    <ul className="aplicantion-status tab-buttons clearfix">
                      <li
                        className="tab-btn active-btn totals"
                        data-tab="#totals"
                      >
                        Total(s): {e?.applicants?.length || 0}
                      </li>
                    </ul>
                  </div>

                  <div className="tabs-content">
                    <div className="tab active-tab" id="totals">
                      <div className="row">
                        {paginatedApplicants.map((i, idx2) => {
                          const currentStatus =
                            roundTab === "video"
                              ? getVideoInterviewStatus(i)
                              : i?.CodingInterviewStatus;
                          const statusTags =
                            roundTab === "video"
                              ? getInterviewStatusTags(i)
                              : [];

                          const isPending =
                            roundTab === "video"
                              ? currentStatus !== "Completed"
                              : !currentStatus || currentStatus === "Sent";
                          const isCompleted =
                            roundTab === "video"
                              ? currentStatus === "Completed" ||
                                hasVideoInterviewAssets(i)
                              : currentStatus === "Completed";

                          const score =
                            roundTab === "video"
                              ? getVideoInterviewScore(i)
                              : getCodingInterviewScore(i);

                          return (
                            <div className="widget-content" key={idx2}>
                              <div className="row">
                                <div className="col-lg-12">
                                  <div className="candidate-block-three">
                                    <div className="inner-box">
                                      <div className="content">
                                        {/* LEFT */}
                                        <div>
                                          <figure className="image">
                                            <img
                                              src={
                                                i?.image ||
                                                "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png"
                                              }
                                              alt="User"
                                              style={{
                                                width: "80px",
                                                height: "80px",
                                              }}
                                            />
                                          </figure>

                                          <h4>
                                            <a href="#">{i?.name}</a>
                                          </h4>

                                          <ul className="candidate-info">
                                            <li>
                                              <span className="icon flaticon-map-locator"></span>
                                              {i?.country || "N/A"}
                                            </li>
                                            <br />
                                            <li>
                                              <FaBriefcase
                                                className="icon"
                                                style={{ marginRight: "8px" }}
                                              />
                                              {i?.jobTitle || "N/A"}
                                            </li>

                                            {mainTab === "vendorApplicants" && (
                                              <li>
                                                <Button
                                                  icon={<EyeOutlined />}
                                                  onClick={() =>
                                                    showVendorModal(i?.vendor)
                                                  }
                                                >
                                                  Vendor Details
                                                </Button>
                                              </li>
                                            )}
                                          </ul>
                                          {statusTags.length > 0 && (
                                            <div
                                              style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "6px",
                                                marginTop: "10px",
                                              }}
                                            >
                                              {statusTags.map((tag) => (
                                                <Tag
                                                  color={tag.color}
                                                  key={tag.label}
                                                >
                                                  {tag.label}
                                                </Tag>
                                              ))}
                                            </div>
                                          )}

                                          {/* ✅ Live Pipeline Status Panel */}
                                          {roundTab === "video" && (
                                            <LiveStatusPanel
                                              applicant={i}
                                              userId={userId}
                                              jobId={e.jobId}
                                              candidateId={String(i?.id)}
                                            />
                                          )}
                                        </div>

                                        {/* RIGHT ACTIONS (same style as Shortlisted icons) */}
                                        <div className="btn-box-one">
                                          <div className="button-container">
                                            {/* ✅ Interview Score Progress (replaces tags) */}
                                            {score !== null &&
                                              score !== undefined && (
                                                <Tooltip
                                                  title={`${
                                                    roundTab === "video"
                                                      ? "Video"
                                                      : "Coding"
                                                  } Score`}
                                                >
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      width: "56px",
                                                      height: "56px",
                                                      borderRadius: "10px",
                                                      background: "#fff",
                                                      border:
                                                        "1px solid #e9e9e9",
                                                    }}
                                                  >
                                                    <Progress
                                                      type="circle"
                                                      width={44}
                                                      percent={Number(score)}
                                                    />
                                                  </div>
                                                </Tooltip>
                                              )}

                                            {/* ✅ View Resume (same as existing) */}
                                            <Tooltip title="View Resume">
                                              <div
                                                className="square green"
                                                style={{
                                                  backgroundColor: "#1E88E5",
                                                }}
                                                onClick={() => {
                                                  console.log("clicked button");
                                                  openResumeDrawer(
                                                    i?.resume,
                                                    e?.jobSkills 
                                                     
                                                  );
                                                }}
                                              >
                                                <EyeOutlined />
                                              </div>
                                            </Tooltip>

                                            {/* ✅ Pending => Send Invite (square icon like existing) */}
                                            {isPending && (
                                              <Tooltip title="Send / Resend Interview Invite">
                                                <div
                                                  className="square red"
                                                  onClick={() =>
                                                    handleOpenModal({
                                                      userId: userId,
                                                      candidateId: i?.id,
                                                      jobId: e?.jobId,
                                                      from: e?.EmailAddress,
                                                      to: i?.email,
                                                      candidateName: i?.name,
                                                      JobTitle: e?.JobTitle,
                                                      companyName:
                                                        e?.companyName,
                                                      CodingInterviewStatus:
                                                        i?.CodingInterviewStatus,
                                                      interviewStatus:
                                                        i?.interviewStatus,
                                                    })
                                                  }
                                                  style={{
                                                    backgroundColor: "#FFC107",
                                                  }}
                                                >
                                                  <VideoCameraOutlined />
                                                </div>
                                              </Tooltip>
                                            )}

                                            {/* ✅ Completed => Results dropdown (round-specific items) */}
                                            {isCompleted && (
                                              <Tooltip title="View Results">
                                                <div
                                                  className="square green"
                                                  style={{
                                                    backgroundColor: "#00BCD4",
                                                  }}
                                                >
                                                  <Dropdown
                                                    menu={{
                                                      items:
                                                        getMenuItemsByRound(i),
                                                    }}
                                                    trigger={["click"]}
                                                  >
                                                    <button
                                                      style={{
                                                        border: "none",
                                                        background:
                                                          "transparent",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() =>
                                                        handleResults(i)
                                                      }
                                                    >
                                                      <FileTextOutlined />
                                                    </button>
                                                  </Dropdown>
                                                </div>
                                              </Tooltip>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {/* end inner content */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <ResumePreviewDrawer
                    open={resumeDrawerOpen}
                    onClose={closeResumeDrawer}
                    fileUrl={resumeUrl}
                    highlightArray={highlightArray}
                  />
                  {/* Applicant pagination inside each job collapse */}
                  {totalApplicantPages > 1 && (
                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Button
                        size="small"
                        disabled={currentApplicantPage === 1}
                        onClick={() =>
                          setApplicantPage((prev) => ({
                            ...prev,
                            [e.jobId]: Math.max((prev[e.jobId] || 1) - 1, 1),
                          }))
                        }
                      >
                        Prev
                      </Button>

                      {renderPageNumbers(
                        currentApplicantPage,
                        totalApplicantPages,
                        (page) =>
                          setApplicantPage((prev) => ({
                            ...prev,
                            [e.jobId]: page,
                          })),
                      )}

                      <Button
                        size="small"
                        disabled={currentApplicantPage === totalApplicantPages}
                        onClick={() =>
                          setApplicantPage((prev) => ({
                            ...prev,
                            [e.jobId]: Math.min(
                              (prev[e.jobId] || 1) + 1,
                              totalApplicantPages,
                            ),
                          }))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </Collapse.Panel>
              </Collapse>

              {/* Panel pagination for job collapses */}
              {totalPanelPages > 1 && idx === paginatedPanels.length - 1 && (
                <div
                  style={{
                    marginTop: "25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Button
                    size="small"
                    disabled={panelPage === 1}
                    onClick={() => setPanelPage(Math.max(panelPage - 1, 1))}
                  >
                    Prev
                  </Button>

                  {renderPageNumbers(panelPage, totalPanelPages, (page) =>
                    setPanelPage(page),
                  )}

                  <Button
                    size="small"
                    disabled={panelPage === totalPanelPages}
                    onClick={() =>
                      setPanelPage(Math.min(panelPage + 1, totalPanelPages))
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Interview Pipeline</h3>
            <div className="text">
              Video & Coding rounds — Pending & Completed
            </div>
          </div>

          <Toaster position="top-center" reverseOrder={false} />

          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Interviewed Candidates</h4>
                    <div className="chosen-outer" style={{ marginBottom: 12 }}>
                      {mainTab === "applicants" ? (
                        activeTab === "myJobs" ? (
                          <select
                            className="chosen-select"
                            value={jobTitleFilter}
                            onChange={(e) => setJobTitleFilter(e.target.value)}
                          >
                            <option value="All">All Jobs</option>
                            {jobs?.map((e, idx) => (
                              <option key={idx} value={e?.jobId}>
                                {e?.JobTitle}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="chosen-select"
                            value={otherJobTitleFilter}
                            onChange={(e) =>
                              setOtherJobTitleFilter(e.target.value)
                            }
                          >
                            <option value="All">All Jobs</option>
                            {otherUserJobs?.map((e, idx) => (
                              <option key={idx} value={e?.jobId}>
                                {e?.JobTitle}
                              </option>
                            ))}
                          </select>
                        )
                      ) : activeTab === "myJobs" ? (
                        <select
                          className="chosen-select"
                          value={VendorJobTitleFilter}
                          onChange={(e) =>
                            setVendorJobTitleFilter(e.target.value)
                          }
                        >
                          <option value="All">All Jobs</option>
                          {vendorJobs?.map((e, idx) => (
                            <option key={idx} value={e?.jobId}>
                              {e?.JobTitle}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          className="chosen-select"
                          value={vendorOtherJobTitleFilter}
                          onChange={(e) =>
                            setVendorOtherJobTitleFilter(e.target.value)
                          }
                        >
                          <option value="All">All Jobs</option>
                          {vendorOtherUserJobs?.map((e, idx) => (
                            <option key={idx} value={e?.jobId}>
                              {e?.JobTitle}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="widget-content">
                    {/* ✅ Top-level Tabs: Applicants / Vendor */}
                    <Tabs activeKey={mainTab} onChange={(k) => setMainTab(k)}>
                      <Tabs.TabPane tab="Applicants" key="applicants" />
                      <Tabs.TabPane
                        tab="Vendor Job Applicant"
                        key="vendorApplicants"
                      />
                    </Tabs>

                    {/* ✅ Admin scope Tabs: My Jobs / Other Jobs */}
                    {roleAccess === "Admin" && (
                      <Tabs
                        activeKey={activeTab}
                        onChange={(k) => setActiveTab(k)}
                        style={{ marginTop: 10 }}
                      >
                        <Tabs.TabPane tab="My Jobs Applicants" key="myJobs" />
                        <Tabs.TabPane
                          tab="Other Users Jobs Applicants"
                          key="otherJobs"
                        />
                      </Tabs>
                    )}

                    {/* ✅ Professional ATS Filter Bar (Round + Stage) */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        alignItems: "center",
                        margin: "12px 0 16px 0",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                      >
                        <Segmented
                          value={roundTab}
                          onChange={(val) => {
                            setRoundTab(val);
                            setPanelPage(1);
                          }}
                          options={[
                            { label: "Video Round", value: "video" },
                            { label: "Coding Round", value: "coding" },
                          ]}
                        />

                        <Segmented
                          value={stageTab}
                          onChange={(val) => {
                            setStageTab(val);
                            setPanelPage(1);
                          }}
                          options={[
                            {
                              label: `Pending (${pendingCount})`,
                              value: "pending",
                            },
                            {
                              label: `Completed (${completedCount})`,
                              value: "completed",
                            },
                          ]}
                        />
                      </div>

                      {/* Optional small hint text */}
                      <div style={{ fontSize: 12, color: "#666" }}>
                        Tip: Pending = invite sent but not attended • Completed
                        = results available
                      </div>
                    </div>

                    {/* ✅ Same collapse layout as your old page */}
                    {ApplicantLayout(filteredJobs, currentLoader)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="copyright-text">
            <p>© 2024 Skill Stream. All Right Reserved.</p>
          </div>
        </div>
      </section>

      {/* ✅ Invite Modal (same as your Shortlisted page) */}
      {isModalOpen && (
        <DemoModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          selectedCandidate={selectedCandidate}
        />
      )}

      {/* ✅ Video Results Modal (same idea as your Shortlisted page) */}
      <Modal
        title="AI Analysis Result"
        width={1200}
        open={isViewResultModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="download" onClick={() => dowloadVideoResults()}>
            Download as PDF
          </Button>,
          <Button key="cancel" onClick={handleViewModalCancel}>
            Cancel
          </Button>,
        ]}
        centered
        styles={{ textAlign: "center" }}
      >
        <div id="modal-content">
          {typeof videoResults === "string" ? (
            <>
              <h3>Old Format Summary</h3>
              <ReactMarkdown>{videoResults}</ReactMarkdown>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                AI Analysis Result
              </h3>
              <p className="text-sm text-gray-700">
                <strong>Structured AI Analysis</strong>
              </p>

              <div className="space-y-2 my-4 text-gray-900">
                <p>
                  <strong>Score:</strong>{" "}
                  <span className="text-blue-700">
                    {videoResults?.analysis?.score}
                  </span>
                </p>
                <p>
                  <strong>Focus Category:</strong>{" "}
                  <span className="text-blue-700">
                    {videoResults?.focus_category}
                  </span>
                </p>
                <p>
                  <strong>Camera Summary:</strong>{" "}
                  <span className="text-blue-700">
                    {videoResults?.camera_summary}
                  </span>
                </p>
                <p>
                  <strong>Gadget Summary:</strong>{" "}
                  <span className="text-blue-700">
                    {videoResults?.gadget_summary}
                  </span>
                </p>
                <p>
                  <strong>Next Round:</strong>{" "}
                  <span className="text-blue-700">
                    {videoResults?.analysis?.next_round_eligibility}
                  </span>
                </p>
                <p>
                  <strong>Communication Clarity:</strong>{" "}
                  <span className="text-blue-700">
                    {videoResults?.analysis?.communication_clarity}
                  </span>
                </p>
              </div>

              <h3 className="mt-6 text-md font-semibold text-gray-900">
                Per-Question Feedback
              </h3>

              <div className="space-y-4 mt-2">
                {Object.entries(
                  videoResults?.analysis?.per_question_feedback || {},
                )
                  .filter(([_, v]) => !v.skipped && v.question)
                  .map(([key, value], i) => (
                    <div
                      key={i}
                      className="border rounded-md p-4 bg-gray-50 shadow-sm"
                    >
                      <h4 className="font-bold text-gray-900 mb-2">
                        {key}:{" "}
                        <span className="font-semibold">{value.question}</span>
                      </h4>

                      <p className="mb-1">
                        <strong className="text-gray-900">
                          Answer Summary:
                        </strong>{" "}
                        <span className="text-blue-700">
                          {value.answer_summary}
                        </span>
                      </p>

                      {value.strengths?.length > 0 && (
                        <p className="mb-1">
                          <strong className="text-gray-900">Strengths:</strong>{" "}
                          <span className="text-blue-700">
                            {value.strengths.join(", ")}
                          </span>
                        </p>
                      )}

                      {value.areas_for_improvement?.length > 0 && (
                        <p className="mb-1">
                          <strong className="text-gray-900">
                            Areas for Improvement:
                          </strong>{" "}
                          <span className="text-blue-700">
                            {value.areas_for_improvement.join(", ")}
                          </span>
                        </p>
                      )}

                      {value.scores && (
                        <p className="mt-2 text-sm">
                          <strong className="text-gray-900">Scores:</strong>{" "}
                          <span className="text-blue-700">
                            Technical {value.scores.technical_depth} | Problem
                            Solving {value.scores.problem_solving} | Practical
                            Insight {value.scores.practical_insight}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ✅ Vendor Modal (optional) */}
      <Modal
        title="Vendor Details"
        open={VendorModal}
        onCancel={handleVendorModalCancel}
        footer={false}
        centered
        styles={{ textAlign: "center" }}
      >
        <ul style={{ listStyleType: "circle" }}>
          <li>Name : {VendorDetails?.name}</li>
          <li>Email : {VendorDetails?.email}</li>
          <li>Phone : {VendorDetails?.phoneNumber}</li>
          <li>
            Location :{" "}
            {VendorDetails
              ? `${VendorDetails?.city},${VendorDetails?.state},${VendorDetails?.country}`
              : "N/A"}
          </li>
        </ul>
      </Modal>
    </div>
  );
};

export default InterviewedCandidates;