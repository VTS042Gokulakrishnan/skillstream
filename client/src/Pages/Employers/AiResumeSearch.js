import BrandLoader from "../../Components/Loader/BrandLoader";
import EmployerAvatar from "../../Components/EmployerUI/EmployerAvatar";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  Select,
  Progress,
  Modal,
  Spin,
  Typography,
  Tooltip,
  Card,
  List,
  Dropdown,
  Menu,
  Result,
} from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { Server } from "App";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useSpring, animated } from "@react-spring/web";
import { DownOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import ForwardMail from "Components/ForwardMail";
import Mail from "../../Components/Mail";
import ReCAPTCHA from "react-google-recaptcha";
import ResumePreviewDrawer from "Components/ReaderDrawer/ResumePreviewDrawer";
import SubscriptionGuard from "Components/SubscriberCheckWrapper/SubscriptionGuard";
const { Title, Text, Paragraph } = Typography;

const { Option } = Select;
const SkillTable = ({ skillMatchingTable }) => {
  // Parsing the input string into rows and columns
  const rows = parseTable(skillMatchingTable);

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
const parseTable = (tableString) => {
  // Split rows and columns, ignoring dashed lines
  const rows = tableString
    .trim()
    .split("\n")
    .filter((row) => !row.startsWith("|---"))
    .map((row) => row.split("|").map((cell) => cell.trim()));

  return rows;
};
const SkillsTable = ({ skills }) => {
  if (!skills || skills.length === 0) return <Text>No skills provided.</Text>;

  const columns = [
    { title: "Skill", dataIndex: "skill", key: "skill" },
    {
      title: "Present",
      dataIndex: "present",
      key: "present",
      render: (val) =>
        val ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: "Closest Match",
      dataIndex: "closest_match",
      key: "closest_match",
    },
    {
      title: "Evidence Location",
      dataIndex: "evidence_location",
      key: "evidence_location",
    },
    {
      title: "Matching Percentage",
      dataIndex: "usage_percentage",
      key: "usage_percentage",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={skills}
      rowKey={(record, idx) => idx}
      pagination={false}
      bordered
      size="small"
      style={{ marginBottom: 20 }}
    />
  );
};
const formatLabel = (text) => {
  if (!text) return "";
  return text
    .replace(/_/g, " ") // remove underscores
    .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letters
};
const AdvancedSourcingTable = ({ sourcing }) => {
  if (!sourcing) return null;

  const columns = [
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Value", dataIndex: "value", key: "value" },
    { title: "Evidence", dataIndex: "evidence", key: "evidence" },
  ];

  const data = Object.entries(sourcing).map(([category, obj], idx) => ({
    key: idx,
    category: formatLabel(category),
    value: obj.value,
    evidence: obj.evidence,
  }));

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      bordered
      size="small"
    />
  );
};
const AiResumeSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState({});
  const [resumes, setResumes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedAction, setSelectedAction] = useState("none");
  const [loading, setLoading] = useState(false);
  const searchRequest = useRef(null);
  useEffect(() => () => searchRequest.current?.abort(), []);
  const stopSearch = () => { searchRequest.current?.abort(); searchRequest.current = null; setLoading(false); setStatus("Stopped"); };
  const [loader, setLoader] = useState(false);
  const [Bloader, setBLoader] = useState(false);
  const searchInput = useRef(null);
  const [status, setStatus] = useState("Pending");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [IsResultModalVisible, setIsResultModalVisible] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [aiScore, setAiScore] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [fromEmail, setFromEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [resumeSearchLoader, setResumeSearchLoader] = useState(false);
  const [placeHolder, setPlaceHolder] = useState("none");
  const [navigatedSearch, setNaviagtedSearch] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const RECAPTCHA_SITE_KEY = "6LcxaGYrAAAAAGEbS0IuB200lZKYBBbh4af426yP"; // Replace with your actual site key
  const FIFTEEN_MINUTES = 15 * 60 * 1000;

  useEffect(() => {
    const maintenance = async () => {
      try {
        const repsonse = await axios.get(
          `${Server}/api/v1/data/maintenance/status`,
        );
        setMaintenanceMode(repsonse.data.data);
      } catch (error) {}
    };
    maintenance();
  }, []);
  const [captchaVerifiedTime, setCaptchaVerifiedTime] = useState(
    localStorage.getItem("captchaVerifiedTime") || null,
  );
  const handleCancel = () => {
    setSelectedResume(null);
    setDrawerVisible(false);
  };
  const handlePreview = (resumeUrl) => {
    if (!resumeUrl) {
      toast.error("No resume uploaded");
      return;
    }
    console.log(resumeUrl);
    setSelectedResume(resumeUrl); // ✅ Use the real file URL, not Google Docs Viewer
    setDrawerVisible(true);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const hasSearched = useRef(false);
  let token = localStorage.getItem("token");
  const { access } = jwtDecode(token);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleModalCancel = () => {
    setIsResultModalVisible(false);
  };
  const handleSearchClick = () => {
    const now = Date.now();

    if (!captchaVerifiedTime || now - captchaVerifiedTime > FIFTEEN_MINUTES) {
      setShowModal(true); // Show CAPTCHA modal
    } else {
      SearchWithAI();
    }
  };
  const handleCaptcha = async (value) => {
    try {
      const response = await axios.post(
        `${Server}/api/v1/data/verify/captcha`,
        {
          captchaToken: value,
        },
      );

      if (response.data.success) {
        setCaptchaValue(value);
        const now = Date.now();
        setCaptchaVerifiedTime(now);
        localStorage.setItem("captchaVerifiedTime", now);
        setShowModal(false);
        SearchWithAI(); // Now safe
      } else {
        toast.error("Captcha verification failed. Try again.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Captcha server error.");
    }
  };
  const showMailModal = () => {
    setModalOpen(true);
  };
  const showForwardMailModal = () => {
    setMailModalOpen(true);
  };
  const scoreProps = useSpring({
    opacity: aiScore !== null ? 1 : 0,
    transform: aiScore !== null ? "scale(1)" : "scale(0.8)",
    config: { duration: 500 },
  });
  useEffect(() => {
    setResumeSearchLoader(true);
    if (location.state?.jobdetails) {
      setSelectedAction(location.state.jobdetails?.jobId);
      setSelectedJobDetails(location.state.jobdetails);
      setPlaceHolder(location.state.jobdetails?.JobTitle);
      setNaviagtedSearch(true);
    }
  }, [location.state, jobs]);

  useEffect(() => {
    if (
      selectedJobDetails &&
      !hasSearched.current &&
      selectedAction != "none" &&
      navigatedSearch
    ) {
      // setSelectedAction(location.state.jobdetails?.jobId);
      // console.log("function calling");
      // console.log(selectedAction);
      hasSearched.current = true;
      setNaviagtedSearch(false);
      SearchWithAI();
    }
  }, [selectedJobDetails]);
  // useEffect(() => {
  //   if (location.state) {
  //     const { jobdetails } = location.state;
  //     console.log(jobdetails);

  //     setSelectedJobDetails(jobdetails);
  //     setSelectedAction(jobdetails?.jobId);
  //     SearchWithAI(selectedJobDetails);
  //   }
  //   // setSelectedJobDetails(jobdetails);
  //   // setSelectedAction(jobdetails?.jobId);
  //   // SearchWithAI(selectedJobDetails);
  // }, []);

  // useEffect(() => {
  //   if (location.state) {
  //     SearchWithAI(selectedJobDetails);
  //     navigate(location.pathname, { replace: true, state: {} });
  //   }
  // }, [selectedAction, selectedJobDetails]);
  // console.log(selectedAction);
  // console.log(selectedJobDetails);
  // const location = useLocation();
  // const { jobdetails } = location.state;
  // useEffect(() => {}, []);
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setFromEmail(decodedToken?.email);
    }
    // console.log(fromEmail);
  }, []);
  let emails = [];
  let selectedCandidate = [];
  useEffect(() => {
    selectedRowKeys.map((e, idx) => {
      // console.log(sortedCandidates[e].email);
      // console.log(resumes[e]);
      selectedCandidate.push(resumes[e].resume);
      emails.push(resumes[e].email);
      setSelectedEmails(emails);
      setSelectedResumes(selectedCandidate);
    });
  }, [selectedRowKeys]);
  // console.log(selectedEmails);

  let addedCandidates = [];
  useEffect(() => {
    selectedRowKeys.map((e, idx) => {
      addedCandidates.push(resumes[e]);
      setSelectedUser(addedCandidates);
    });
  }, [selectedRowKeys]);
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleActionChange = (value) => {
    setSelectedAction(value);
    // console.log(value);

    if (value != "none") {
      const selectedJob = jobs.find((job) => job.jobId === value);
      setSelectedJobDetails(selectedJob);
      // console.log(selectedJob);
    } else if (value === "none") {
      setSelectedJobDetails({});
    }
  };
  // console.log(selectedJobDetails);

  const getJobs = async () => {
    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/get/${userId}/${access}`,
      );
      const sortJobs = data.jobs?.sort(
        (a, b) => new Date(b.time) - new Date(a.time),
      );
      setJobs(sortJobs);
      // console.log(data.jobs);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  const SearchWithAI = async (tokenFromCaptcha) => {
    searchRequest.current?.abort();
    const request = new AbortController();
    searchRequest.current = request;
    // console.log("loading");

    try {
      if (selectedAction != "none") {
        // console.log("saerching");
        setStatus("Searching");
        setResumeSearchLoader(false);
        setLoading(true);
        let formData = {
          title: selectedJobDetails?.JobTitle,
          description: selectedJobDetails?.JobDescription,
          skills: selectedJobDetails?.jobSkills,
          keys_and_responsibilities: selectedJobDetails?.Responsibilties,
          experience: `${selectedJobDetails?.Experience}`,
          location: selectedJobDetails?.Country,
        };
        // console.log(formData);

        let { data } = await axios.post(
          `${Server}/api/v1/search/keyword/ai/search/candidate`,
          formData,
          {
            signal: request.signal,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (request.signal.aborted || searchRequest.current !== request) return;
        data?.candidates?.sort((a, b) => a.rank - b.rank);
        let candidates = [];
        data?.candidates?.map((e, idx) =>
          candidates.push({
            key: idx,
            rank: e.rank,
            image: e.image,
            name: e.name ? e.name : "User",
            position: e.jobTitle,
            experience: e.experience,
            score: e.matching_percentage, // Score percentage for each resume
            resume: e.resume,
            location: e.country ? `${e.country}` : "Not provided",
            state: e.state ? `${e.state}` : "Not provided",
            city: e.city ? `${e.city}` : "Not provided",
            summary: e.summary,
            education: e.Education,
            work_experience: e.work_experience,
            workAuthorization: e.workAuthorization,
            skills: e.skills,
            email: e.email,
            _id: e._id,
          }),
        );
        setResumes(candidates);
        setStatus("Completed");
        setLoading(false);

        // console.log("Completed");
      }
    } catch (error) {
      if (request.signal.aborted || axios.isCancel(error) || searchRequest.current !== request) return;
      // console.log(error);
      if (error.response?.data?.message === "No results Found") {
        setLoading(false);
        setStatus("Completed");
        setResumes([]);
      } else {
        setLoading(false);
        setStatus("Error");
      }
    }
  };
  const parseTableMarkdown = (markdown) => {
    if (typeof markdown !== "string") return [];

    const lines = markdown.trim().split("\n");
    const headers = lines[0]
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell);
    const rows = lines.slice(2).map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell),
    );
    return [headers, ...rows];
  };
  const downloadPDF = async () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let yPosition = 20;

    doc.setFontSize(18);
    doc.text("AI Analysis Result", margin, yPosition);
    yPosition += 10;
    const isNewFormat = !!aiResult.sales_pitch_and_alignment;
    const updatedFormat = !!aiResult.recommendation_summary;
    const isJsonFormat = !!aiResult.candidate_brief;
    const isLatestFormat = !!aiResult.candidate_Summary;
    const isJsonV2Format = !!aiResult.candidate_briefSummary;
    if (isJsonV2Format) {
      const sections = [
        { title: "Candidate Summary", text: aiResult.candidate_briefSummary },
        {
          title: "Suitability Statement",
          text: aiResult.suitability_statement,
        },
        { title: "Fitment Score", text: String(aiResult.fitment_score) },
        {
          title: "Recommendation Status",
          text: aiResult.recommendation_status,
        },
      ];

      sections.forEach(({ title, text }) => {
        if (!text) return;
        if (yPosition + 10 > doc.internal.pageSize.height) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text(`${title}:`, margin, yPosition);
        yPosition += 8;
        doc.setFontSize(12).setFont("helvetica", "normal");

        const lines = doc.splitTextToSize(text, pageWidth);
        lines.forEach((line) => {
          if (yPosition + 8 > doc.internal.pageSize.height) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 4;
      });

      // Mandatory Skills Table
      if (
        Array.isArray(aiResult.mandatory_skills) &&
        aiResult.mandatory_skills.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Mandatory Skills:", margin, yPosition);
        yPosition += 8;
        doc.autoTable({
          startY: yPosition,
          head: [["Skill", "Present", "Closest Match", "Evidence"]],
          body: aiResult.mandatory_skills.map((s) => [
            s.skill,
            s.present ? "Yes" : "No",
            s.closest_match || "",
            s.evidence_location || "",
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Secondary Skills Table
      if (
        Array.isArray(aiResult.secondary_skills) &&
        aiResult.secondary_skills.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Secondary Skills:", margin, yPosition);
        yPosition += 8;

        doc.autoTable({
          startY: yPosition,
          head: [["Skill", "Present", "Closest Match", "Evidence"]],
          body: aiResult.secondary_skills.map((s) => [
            s.skill,
            s.present ? "Yes" : "No",
            s.closest_match || "",
            s.evidence_location || "",
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Key Strengths
      if (
        Array.isArray(aiResult.key_strengths) &&
        aiResult.key_strengths.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Key Strengths:", margin, yPosition);
        yPosition += 8;

        aiResult.key_strengths.forEach((s) => {
          const lines = doc.splitTextToSize(`• ${s}`, pageWidth);
          lines.forEach((line) => {
            if (yPosition + 8 > doc.internal.pageSize.height) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 8;
          });
        });
      }

      // Missing Skills
      if (
        Array.isArray(aiResult.missing_skills) &&
        aiResult.missing_skills.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Missing Skills:", margin, yPosition);
        yPosition += 8;

        aiResult.missing_skills.forEach((s) => {
          doc.text(`• ${s}`, margin, yPosition);
          yPosition += 8;
        });
      }

      // Gap Closure Suggestions
      if (
        Array.isArray(aiResult.gap_closure_suggestions) &&
        aiResult.gap_closure_suggestions.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Gap Closure Suggestions:", margin, yPosition);
        yPosition += 8;

        aiResult.gap_closure_suggestions.forEach((s) => {
          const lines = doc.splitTextToSize(`- ${s}`, pageWidth);
          lines.forEach((line) => {
            if (yPosition + 8 > doc.internal.pageSize.height) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 8;
          });
        });
      }

      // Screening Questions
      // if (
      //   Array.isArray(aiResult.screening_questions) &&
      //   aiResult.screening_questions.length > 0
      // ) {
      //   doc.setFontSize(14).setFont("helvetica", "bold");
      //   doc.text("Screening Questions:", margin, yPosition);
      //   yPosition += 8;

      //   aiResult.screening_questions.forEach((q, idx) => {
      //     const lines = doc.splitTextToSize(`${idx + 1}. ${q}`, pageWidth);
      //     lines.forEach((line) => {
      //       if (yPosition + 8 > doc.internal.pageSize.height) {
      //         doc.addPage();
      //         yPosition = margin;
      //       }
      //       doc.text(line, margin, yPosition);
      //       yPosition += 8;
      //     });
      //   });
      // }
    } else if (isLatestFormat) {
      const sections = [
        { title: "Candidate Summary", text: aiResult.candidate_Summary },
        { title: "Recommendation", text: aiResult.recommendation },
        {
          title: "Suitability Statement",
          text: aiResult.suitability_statement,
        },
      ];

      sections.forEach(({ title, text }) => {
        if (!text) return;
        if (yPosition + 10 > doc.internal.pageSize.height) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text(`${title}:`, margin, yPosition);
        yPosition += 8;
        doc.setFontSize(12).setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, pageWidth);
        lines.forEach((line) => {
          if (yPosition + 8 > doc.internal.pageSize.height) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 4;
      });

      // Mandatory Skills Table
      if (
        Array.isArray(aiResult.mandatory_skills) &&
        aiResult.mandatory_skills.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Mandatory Skills:", margin, yPosition);
        yPosition += 8;
        doc.autoTable({
          startY: yPosition,
          head: [
            [
              "Skill",
              "Present",
              "Closest Match",
              "Evidence Location",
              "Matching %",
            ],
          ],
          body: aiResult.mandatory_skills.map((s) => [
            s.skill,
            s.present ? "Yes" : "No",
            s.closest_match || "",
            s.evidence_location || "",
            s.usage_percentage !== undefined ? `${s.usage_percentage}%` : "",
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Secondary Skills
      if (
        Array.isArray(aiResult.secondary_skills) &&
        aiResult.secondary_skills.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Secondary Skills:", margin, yPosition);
        yPosition += 8;
        doc.autoTable({
          startY: yPosition,
          head: [["Skill", "Present", "Closest Match", "Evidence Location"]],
          body: aiResult.secondary_skills.map((s) => [
            s.skill,
            s.present ? "Yes" : "No",
            s.closest_match || "",
            s.evidence_location || "",
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Gap Closure Suggestions
      if (
        Array.isArray(aiResult.gap_closure_suggestions) &&
        aiResult.gap_closure_suggestions.length > 0
      ) {
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Gap Closure Suggestions:", margin, yPosition);
        yPosition += 8;
        doc.setFont("helvetica", "normal");
        aiResult.gap_closure_suggestions.forEach((s) => {
          const lines = doc.splitTextToSize(`- ${s}`, pageWidth);
          lines.forEach((line) => {
            if (yPosition + 8 > doc.internal.pageSize.height) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 8;
          });
        });
      }

      // Screening Questions
      // if (
      //   Array.isArray(aiResult.screening_questions) &&
      //   aiResult.screening_questions.length > 0
      // ) {
      //   doc.setFontSize(14).setFont("helvetica", "bold");
      //   doc.text("Screening Questions:", margin, yPosition);
      //   yPosition += 8;
      //   doc.setFont("helvetica", "normal");
      //   aiResult.screening_questions.forEach((q, idx) => {
      //     const lines = doc.splitTextToSize(`${idx + 1}. ${q}`, pageWidth);
      //     lines.forEach((line) => {
      //       if (yPosition + 8 > doc.internal.pageSize.height) {
      //         doc.addPage();
      //         yPosition = margin;
      //       }
      //       doc.text(line, margin, yPosition);
      //       yPosition += 8;
      //     });
      //   });
      // }
    } else if (isJsonFormat) {
      const sections = [
        { title: "Candidate Brief", text: aiResult.candidate_brief },
        { title: "Recommendation", text: aiResult.recommendation },
        { title: "Fitment Score", text: String(aiResult.fitment_score) },
      ];

      sections.forEach(({ title, text }) => {
        if (!text) return;
        if (yPosition + 10 > doc.internal.pageSize.height) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${title}:`, margin, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text, pageWidth);
        lines.forEach((line) => {
          if (yPosition + 10 > doc.internal.pageSize.height) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 10;
        });
      });

      // Mandatory Skills Table
      if (
        Array.isArray(aiResult.mandatory_skills) &&
        aiResult.mandatory_skills.length > 0
      ) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Mandatory Skills:", margin, yPosition);
        yPosition += 10;
        doc.autoTable({
          startY: yPosition,
          head: [["Skill", "Present", "Closest Match", "Evidence Location"]],
          body: aiResult.mandatory_skills.map((s) => [
            s.skill,
            s.present ? "Yes" : "No",
            s.closest_match || "",
            s.evidence_location || "",
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Secondary Skills Table
      if (
        Array.isArray(aiResult.secondary_skills) &&
        aiResult.secondary_skills.length > 0
      ) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Secondary Skills:", margin, yPosition);
        yPosition += 10;
        doc.autoTable({
          startY: yPosition,
          head: [["Skill", "Present", "Closest Match", "Evidence Location"]],
          body: aiResult.secondary_skills.map((s) => [
            s.skill,
            s.present ? "Yes" : "No",
            s.closest_match || "",
            s.evidence_location || "",
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Gap Closure Suggestions
      if (
        Array.isArray(aiResult.gap_closure_suggestions) &&
        aiResult.gap_closure_suggestions.length > 0
      ) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Gap Closure Suggestions:", margin, yPosition);
        yPosition += 10;
        doc.setFont("helvetica", "normal");
        aiResult.gap_closure_suggestions.forEach((s) => {
          const lines = doc.splitTextToSize(`- ${s}`, pageWidth);
          lines.forEach((line) => {
            if (yPosition + 10 > doc.internal.pageSize.height) {
              doc.addPage();
              yPosition = margin;
            }
            doc.text(line, margin, yPosition);
            yPosition += 10;
          });
        });
      }

      // Advanced Sourcing
      if (aiResult.advanced_sourcing) {
        const rows = Object.entries(aiResult.advanced_sourcing).map(
          ([key, obj]) => [key, obj.value, obj.evidence],
        );

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Advanced Sourcing:", margin, yPosition);
        yPosition += 10;

        doc.autoTable({
          startY: yPosition,
          head: [["Category", "Value", "Evidence"]],
          body: rows,
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }

      // Screening Questions
      // if (
      //   Array.isArray(aiResult.screening_questions) &&
      //   aiResult.screening_questions.length > 0
      // ) {
      //   doc.setFontSize(14);
      //   doc.setFont("helvetica", "bold");
      //   doc.text("Screening Questions:", margin, yPosition);
      //   yPosition += 10;
      //   aiResult.screening_questions.forEach((q, i) => {
      //     const lines = doc.splitTextToSize(`${i + 1}. ${q}`, pageWidth);
      //     lines.forEach((line) => {
      //       if (yPosition + 10 > doc.internal.pageSize.height) {
      //         doc.addPage();
      //         yPosition = margin;
      //       }
      //       doc.text(line, margin, yPosition);
      //       yPosition += 10;
      //     });
      //   });
      // }
    }
    // === EXISTING SALES PITCH FORMAT ===
    else if (isNewFormat) {
      const sections = [
        {
          title: "Brief Summary",
          text: aiResult.sales_pitch_and_alignment,
        },
        { title: "Recommendation", text: aiResult.recommendation },
        {
          title: "Experience or Education Gaps",
          text: aiResult.experience_or_education_gaps,
        },
        { title: "Skills To Verify", text: aiResult.skills_to_verify },
      ];

      sections.forEach(({ title, text }) => {
        if (yPosition + 10 > doc.internal.pageSize.height) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${title}:`, margin, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text || "", pageWidth);
        lines.forEach((line) => {
          if (yPosition + 10 > doc.internal.pageSize.height) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 10;
        });
      });

      const jdSkillTable = parseTableMarkdown(aiResult.jd_skill_mapping_table);
      if (Array.isArray(jdSkillTable) && jdSkillTable.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("JD Skill Mapping Table:", margin, yPosition);
        yPosition += 10;

        const jdSkillResult = doc.autoTable({
          startY: yPosition,
          head: [jdSkillTable[0]],
          body: jdSkillTable.slice(1),
          margin: { top: 10 },
          theme: "striped",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10; // capture position after table
          },
        });
      }

      const secondarySkills = parseTableMarkdown(
        aiResult.secondary_skill_table,
      );
      if (Array.isArray(secondarySkills) && secondarySkills.length > 0) {
        if (yPosition + 10 > doc.internal.pageSize.height) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Secondary Skills Table:", margin, yPosition);
        yPosition += 10;

        doc.autoTable({
          startY: yPosition,
          head: [secondarySkills[0]],
          body: secondarySkills.slice(1),
          margin: { top: 10 },
          theme: "grid",
          styles: { fontSize: 10 },
          didDrawPage: (data) => {
            yPosition = data.cursor.y + 10;
          },
        });
      }
    } else if (updatedFormat) {
      const sections = [
        {
          title: "Brief Summary",
          text: aiResult.recommendation_summary,
        },
        // { title: "Recommendation", text: aiResult.recommendation },
        // {
        //   title: "Experience or Education Gaps",
        //   text: aiResult.experience_or_education_gaps,
        // },
        // { title: "Skills To Verify", text: aiResult.skills_to_verify },
      ];

      sections.forEach(({ title, text }) => {
        if (yPosition + 10 > doc.internal.pageSize.height) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${title}:`, margin, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text || "", pageWidth);
        lines.forEach((line) => {
          if (yPosition + 10 > doc.internal.pageSize.height) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 10;
        });
      });

      const jdSkillTable = parseTableMarkdown(aiResult.skill_table);
      if (Array.isArray(jdSkillTable) && jdSkillTable.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("JD Skill Mapping Table:", margin, yPosition);
        yPosition += 10;
        doc.autoTable({
          startY: yPosition,
          head: [jdSkillTable[0]],
          body: jdSkillTable.slice(1),
          margin: { top: 10 },
        });
      }
    } else {
      const sections = [
        { title: "Brief Summary", text: aiResult.brief_summary },
        { title: "Short Summary", text: aiResult.short_summary },
      ];

      sections.forEach(({ title, text }) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`${title}:`, margin, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text || "", pageWidth);
        lines.forEach((line) => {
          doc.text(line, margin, yPosition);
          yPosition += 10;
        });
      });

      const table = parseTableMarkdown(aiResult.skill_matching_table);
      if (table.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Skill Matching Table:", margin, yPosition);
        yPosition += 10;
        doc.autoTable({
          startY: yPosition,
          head: [table[0]],
          body: table.slice(1),
        });
      }
    }

    doc.save("analysis-result.pdf");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const handleExpand = (key) => {
    const isExpanded = expandedRowKeys.includes(key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key];
    setExpandedRowKeys(newExpandedRowKeys);
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      // sorter: (a, b) => a.rank.localeCompare(b.rank),
      // // ...getColumnSearchProps("rank"),
      width: 64,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"),
      render: (name, record) => <div className="em-resume-name"><EmployerAvatar src={record.image} name={name} size={40} /><strong>{name}</strong></div>,
      width: 200,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      sorter: (a, b) => String(a.position || "").localeCompare(String(b.position || "")),
      ...getColumnSearchProps("position"),
      width: 220,
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      sorter: (a, b) => {
        const yearsA = parseInt(a.experience.split(" ")[0], 10);
        const yearsB = parseInt(b.experience.split(" ")[0], 10);
        return yearsA - yearsB;
      },
      ...getColumnSearchProps("experience"),
      width: 120,
    },
    {
      title: "Country",
      dataIndex: "location",
      key: "location",
      width: 140,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 140,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: 150,
      className: "em-ai-location-cell",
    },
    {
      title: "Work Authorization",
      dataIndex: "workAuthorization",
      key: "workAuthorization",
      width: 180,
      className: "em-ai-location-cell",
      render: value => value || "Not provided",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (score, record) => (
        <div className="progress-container">
          {" "}
          {/* Add a container div for styling */}
          {record.isAnalysing === "Analysed" ? (
            <Progress
              type="circle"
              percent={score}
              width={60} // Size of the circle
              format={(percent) => `${percent}%`} // Show percentage in center
              strokeColor={{
                "0%": "#0057e7",
                "100%": "#34b1eb",
              }}
              className="blue-shadow" // Custom class for shadow effect
            />
          ) : (
            <p>Not Analysed</p>
          )}
        </div>
      ),
      // sorter: (a, b) => a.score - b.score,
      width: 130,
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => {
        const fileExtension = record?.resume?.split(".").pop().toLowerCase();
        const isDocx = fileExtension === "docx";
        const fileUrl = isDocx
          ? `https://docs.google.com/viewerng/viewer?url=${record.resume}`
          : `https://docs.google.com/viewerng/viewer?url=${record.resume}`;

        return (
          <Space size="middle">
            {record.resume ? (
              <Button
                onClick={() => handlePreview(record.resume)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View CV
              </Button>
            ) : (
              <Button>No cv</Button>
            )}
            {record.isAnalysing === "Analysed" ? (
              <>
                <Button
                  onClick={() => {
                    setAiResult(analysisResults[record._id]); // Set the right result
                    setAiScore(analysisResults[record._id]?.fitment_score);
                    setIsResultModalVisible(true);
                  }}
                >
                  View Results
                </Button>
              </>
            ) : (
              <Tooltip title={record.isAnalysing === "Analysing" ? "Analysing" : "Analyse"}>
                <Button aria-label="Analyse" onClick={() => handleModalOk(record)} disabled={loader} icon={record.isAnalysing === "Analysing" ? <BrandLoader size="button" label="" /> : <SearchOutlined />} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      /*
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      sorter: (a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated),
      ...getColumnSearchProps("lastUpdated"),
      width: 180,
   */
    },
  ];
  // console.log(candidates);

  const handleModalOk = async (selectedUser) => {
    const updatedData = resumes.map((item) =>
      item.key === selectedUser.key
        ? { ...item, isAnalysing: "Analysing" }
        : item,
    );
    setResumes(updatedData);
    setLoader(true);
    try {
      // console.log(selectedUser);

      let userId = localStorage.getItem("UserId");
      let bodyData = {
        jobDetails: {
          job_title: selectedJobDetails.JobTitle,
          company: selectedJobDetails.companyName,
          location: selectedJobDetails.Country,

          education_required: selectedJobDetails.Qualification,
          skills_required: selectedJobDetails.jobSkills,
          job_description: selectedJobDetails.JobDescription,
        },
        userDetails: {
          basic_info: {
            full_name: selectedUser.name,
            Country: selectedUser.location,
            Experience_in_Years: selectedUser.experience,
            Job_Title: selectedUser.position,
          },
          education: selectedUser.education,
          work_experience: selectedUser.work_experience,
          skills: selectedUser.skills,
        },
      };
      // console.log(bodyData);

      const { data } = await axios.post(
        `${Server}/api/v1/employer/jobs/openAI/aiResume/analyse/${userId}/${selectedJobDetails.jobId}/${selectedUser._id}`,
        bodyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(data);
      setAiResult(data.data);
      setAiScore(data.data.fitment_score);
      setAnalysisResults((prev) => ({
        ...prev,
        [selectedUser._id]: data.data,
      }));
      setLoader(false);
      const updatedDataAfterAnalysis = updatedData.map((item) =>
        item.key === selectedUser.key
          ? {
              ...item,
              isAnalysing: "Analysed",
              score: parseInt(data.data.fitment_score, 10),
            }
          : item,
      );
      setResumes(updatedDataAfterAnalysis);
      setIsResultModalVisible(true);
      // console.log(updatedDataAfterAnalysis);
    } catch (error) {
      // message.error("Failed to analyze. Please try again."); // Error handling
      console.log("Error analyzing with AI:", error);
      setLoader(false);
      const updatedDataAfterAnalysis = updatedData.map((item) =>
        item.key === selectedUser.key ? { ...item, isAnalysing: false } : item,
      );
      setResumes(updatedDataAfterAnalysis);
    }
  };
  const onSelectChange = (newSelectedRowKeys) => {
    // console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;
  const nestedMenu = (
    <Menu>
      {jobs.map((e, idx) => (
        <Menu.Item key={`1-${idx + 1}`}>
          <Button disabled={Bloader} icon={Bloader ? <BrandLoader size="button" label="" /> : undefined} onClick={() => shortlistedJob(e)}>
            {e?.JobTitle}
          </Button>
        </Menu.Item>
      ))}
    </Menu>
  );

  const shortlistedJob = async (e) => {
    e.preventDefault();
    try {
      setBLoader(true);
      // if (token) {
      let userId = localStorage.getItem("UserId");
      let jobDetails = {
        jobId: selectedJobDetails?.jobId,
        candidates: selectedUser,
        // jobId: params.jobId,
        // jobTitle: jobData[0]?.JobTitle,
        // companyName: jobData[0]?.companyName,
        // categories: jobData[0]?.Industry,
        // city: jobData[0]?.City,
        // country: jobData[0]?.Country,
        // logo: jobData[0]?.image,
        // empId: params.userId,
        // status: jobData[0]?.status,
        // email: jobData[0]?.EmailAddress,
      };
      // console.log(jobDetails);

      const { data } = await axios.post(
        `${Server}/api/v1/employer/shortlistResume/add/${userId}`,
        jobDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setBLoader(false);
      toast.success("Added to job");
      // } else {
      //   toast.error("Please login");
      //   showModal("login");
      // }
    } catch (error) {
      setBLoader(false);
      if (error.response.data.message === "Job already shortlisted") {
        toast.error("Already shortlisted");
      } else {
        // console.log(error.response.data.message);
        toast.error("Error in Shortlisting the job");
      }
    }
  };
  const items = [
    {
      label: (
        <a
          // type="primary"
          disabled={!hasSelected}
          onClick={showMailModal}
          // loading={loading}
        >
          Send Email
        </a>
      ),
      key: "0",
    },
    {
      key: "1",
      label: (
        <a onClick={shortlistedJob}>{Bloader ? "Adding.." : "Add to Job"}</a>
      ),
    },
    {
      key: "2",
      label: <a onClick={showForwardMailModal}>Forward Resume </a>,
    },
  ];

  return (
    <SubscriptionGuard>
      <div className="em-ai-search">
        <Toaster position="top-center" reverseOrder={false} />
        {maintenanceMode ? (
          <>
            <Result
              status="warning"
              // style={{ paddingTop: "180px" }}
              title={
                <div>
                  {" "}
                  <p style={{ fontSize: "30px" }}>
                    Sorry for the inconvinence!
                  </p>
                  <p
                    style={{
                      color: "black",
                      fontSize: "23px",
                      paddingTop: "20px",
                    }}
                  >
                    ⚠️ We’re currently performing maintenance. This features is
                    temporarily unavailable. Our team is actively working to
                    restore full service soon.
                  </p>
                </div>
              }
            />
          </>
        ) : (
          <>
            <div className="em-ai-controls"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Select
                // defaultValue="none"
                value={selectedAction} // <-- Use `value` instead of `defaultValue`
                style={{
                  width: 200,
                  marginRight: "10px",
                  marginTop: "18px",
                }}
                onChange={handleActionChange}
                virtual={false}
                disabled={loading}
              >
                <Option value="none">Select Job</Option>
                {jobs?.map((e, idx) => (
                  <Option key={idx} value={e?.jobId}>
                    {e?.JobTitle}
                  </Option>
                ))}
              </Select>

              <div className="ss-search-control">
                {loading ? (
                  <Space><BrandLoader size="compact" label="Searching…" /><Button danger onClick={stopSearch}>Stop search</Button></Space>
                ) : (
                  <Button
                    style={{
                      backgroundColor: "#1E90FF", // SkyBlue color
                      color: "#fff", // White text color
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    onClick={handleSearchClick}
                    // onMouseOver={(e) =>
                    //   (e.currentTarget.style.backgroundColor = "#4682B4")
                    // } // Darker SkyBlue on hover
                    // onMouseOut={(e) =>
                    //   (e.currentTarget.style.backgroundColor = "#1E90FF")
                    // } // Original color on mouse out
                  >
                    Search with AI
                  </Button>
                )}
              </div>
            </div>

            {status === "Pending" && (
              <p className="em-card em-empty">
                {" "}
                Select a Job & Search With AI{" "}
              </p>
            )}
            {status === "Stopped" && <p className="em-card" role="status">Search stopped. Select a job and search again when ready.</p>}
            {status === "Error" && (
              <p className="em-card em-empty" role="alert">
                {" "}
                Service Unavailable, Please try after some time!.
              </p>
            )}
            {status === "Searching" && (
              <div style={{ paddingTop: "100px", paddingBottom: "80px" }}>
                {" "}
                <BrandLoader label="Searching resumes…" />
              </div>
            )}
            {status === "Completed" && (
              <>
                {" "}
                <div style={{ marginBottom: 16 }}>
                  <Dropdown
                    menu={{ items }}
                    disabled={!hasSelected}
                    trigger={["click"]}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <Button
                        type="primary"
                        disabled={!hasSelected}
                        // loading={loading}
                      >
                        Actions
                        <DownOutlined />
                      </Button>
                    </a>
                  </Dropdown>
                  <span style={{ marginLeft: 8 }}>
                    {hasSelected
                      ? `Selected ${selectedRowKeys.length} items`
                      : ""}
                  </span>
                  {modalOpen && (
                    <div>
                      <Mail
                        modalOpen={modalOpen}
                        setModalOpen={setModalOpen}
                        showMailModal={showMailModal}
                        selectedEmails={selectedEmails}
                        fromEmail={fromEmail}
                      />
                    </div>
                  )}
                  {mailModalOpen && (
                    <div>
                      <ForwardMail
                        modalOpen={mailModalOpen}
                        setModalOpen={setMailModalOpen}
                        showMailModal={showForwardMailModal}
                        selectedResume={selectedResumes}
                        fromEmail={fromEmail}
                      />
                    </div>
                  )}
                </div>
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={resumes}
                  pagination={{ pageSize: 10 }}
                  tableLayout="fixed"
                  scroll={{ x: 1676 }}
                  className="aiResumeSearch-table"
                  style={{}}
                />
                <ResumePreviewDrawer
                  open={drawerVisible}
                  onClose={() => handleCancel()}
                  fileUrl={selectedResume}
                  highlightArray={selectedJobDetails?.jobSkills}
                />
              </>
            )}
          </>
        )}

        {showModal && (
          <Modal
            centered
            open={showModal}
            onCancel={() => setShowModal(false)}
            // onOk={handleOk}
            footer={null}
          >
            {" "}
            <h3>Verify you're human</h3>
            <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={handleCaptcha} />
          </Modal>
        )}
        <Modal
          title="AI Analysis Result"
          open={IsResultModalVisible}
          onCancel={handleModalCancel}
          width={1200}
          footer={[
            <Button
              key="download"
              onClick={() => downloadPDF()}
              style={{
                background: "linear-gradient(to right, #2563eb, #000000)",
                color: "#ffffff",
                fontWeight: 600,
                padding: "8px 20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: "none",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #1e40af, #111827)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #2563eb, #000000)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Download as PDF
            </Button>,
            <Button
              key="cancel"
              onClick={handleModalCancel}
              style={{
                background: "linear-gradient(to right, #2563eb, #000000)",
                color: "#ffffff",
                fontWeight: 600,
                padding: "8px 20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: "none",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #1e40af, #111827)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #2563eb, #000000)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Cancel
            </Button>,
          ]}
          centered
          styles={{ textAlign: "center" }}
        >
          <Spin spinning={loading} indicator={<BrandLoader size="compact" label="" />}>
            <div id="modal-content">
              {aiResult?.candidate_briefSummary ? (
                <div>
                  <Card
                    title="Candidate Summary"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.candidate_briefSummary}</Paragraph>
                  </Card>

                  <Card
                    title="Fitment Score"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.fitment_score}</Paragraph>
                  </Card>

                  <Card
                    title="Recommendation Status"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.recommendation_status}</Paragraph>
                  </Card>

                  <Card
                    title="Key Strengths"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    {aiResult.key_strengths?.map((s) => (
                      <Paragraph key={s}>• {s}</Paragraph>
                    ))}
                  </Card>

                  <Card
                    title="Missing Skills"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    {aiResult.missing_skills.length === 0 ? (
                      <Paragraph>• No Missing Skills</Paragraph>
                    ) : (
                      aiResult.missing_skills?.map((s) => (
                        <Paragraph key={s}>• {s}</Paragraph>
                      ))
                    )}
                  </Card>

                  <Card
                    title="Suitability Statement"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.suitability_statement}</Paragraph>
                  </Card>

                  <Card
                    title="Mandatory Skills"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Table
                      size="small"
                      pagination={false}
                      columns={[
                        { title: "Skill", dataIndex: "skill" },
                        {
                          title: "Present",
                          dataIndex: "present",
                          render: (v) => (v ? "Yes" : "No"),
                        },
                        { title: "Closest Match", dataIndex: "closest_match" },
                        { title: "Evidence", dataIndex: "evidence_location" },
                      ]}
                      dataSource={aiResult.mandatory_skills}
                      rowKey="skill"
                    />
                  </Card>

                  {aiResult.secondary_skills?.length > 0 && (
                    <Card
                      title="Secondary Skills"
                      size="small"
                      style={{ marginBottom: 10 }}
                    >
                      <Table
                        size="small"
                        pagination={false}
                        columns={[
                          { title: "Skill", dataIndex: "skill" },
                          {
                            title: "Present",
                            dataIndex: "present",
                            render: (v) => (v ? "Yes" : "No"),
                          },
                          {
                            title: "Closest Match",
                            dataIndex: "closest_match",
                          },
                          { title: "Evidence", dataIndex: "evidence_location" },
                        ]}
                        dataSource={aiResult.secondary_skills}
                        rowKey="skill"
                      />
                    </Card>
                  )}

                  <Card
                    title="Gap Closure Suggestions"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    {aiResult.gap_closure_suggestions.length === 0 ? (
                      <Paragraph>• No Gap Closure</Paragraph>
                    ) : (
                      aiResult.gap_closure_suggestions?.map((s) => (
                        <Paragraph key={s}>• {s}</Paragraph>
                      ))
                    )}
                  </Card>
                </div>
              ) : aiResult?.candidate_Summary ? (
                // === LATEST FORMAT ===
                <div>
                  <Card
                    title="Candidate Summary"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.candidate_Summary}</Paragraph>
                  </Card>

                  <Card
                    title="Mandatory Skills"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <SkillsTable skills={aiResult?.mandatory_skills} />
                  </Card>

                  {aiResult.secondary_skills?.length > 0 && (
                    <Card
                      title="Secondary Skills"
                      size="small"
                      style={{ marginBottom: 10 }}
                    >
                      <SkillsTable skills={aiResult?.secondary_skills} />
                    </Card>
                  )}

                  <Card
                    title="Recommendation"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.recommendation}</Paragraph>
                  </Card>

                  <Card
                    title="Suitability Statement"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.suitability_statement}</Paragraph>
                  </Card>

                  {aiResult.gap_closure_suggestions?.length > 0 && (
                    <Card
                      title="Gap Closure Suggestions"
                      size="small"
                      style={{ marginBottom: 10 }}
                    >
                      <List
                        dataSource={aiResult.gap_closure_suggestions}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </Card>
                  )}
                </div>
              ) : aiResult?.candidate_brief ? (
                <div>
                  {" "}
                  <Card
                    title="Candidate Brief"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.candidate_brief}</Paragraph>
                  </Card>
                  <Card
                    title="Mandatory Skills"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <SkillsTable skills={aiResult?.mandatory_skills} />
                  </Card>
                  <Card
                    title="Secondary Skills"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <SkillsTable skills={aiResult?.secondary_skills} />
                  </Card>
                  <Card
                    title="Recommendation"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <Paragraph>{aiResult.recommendation}</Paragraph>
                  </Card>
                  {aiResult.gap_closure_suggestions.length !== 0 && (
                    <Card
                      title="Gap Closure Suggestions"
                      size="small"
                      style={{ marginBottom: 10 }}
                    >
                      <List
                        dataSource={aiResult.gap_closure_suggestions}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </Card>
                  )}
                  <Card
                    title="Advanced Sourcing"
                    size="small"
                    style={{ marginBottom: 10 }}
                  >
                    <AdvancedSourcingTable
                      sourcing={aiResult.advanced_sourcing}
                    />
                  </Card>
                </div>
              ) : aiResult?.brief_summary ? (
                <div>
                  <label style={{ fontWeight: "bold" }}>Brief Summary:</label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.brief_summary}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>Short Summary:</label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.short_summary}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>
                    Skill Matching Table:
                  </label>
                  <SkillTable
                    skillMatchingTable={aiResult?.skill_matching_table}
                  />
                </div>
              ) : aiResult?.sales_pitch_and_alignment ? (
                <div>
                  <label style={{ fontWeight: "bold" }}>Brief Summary:</label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.sales_pitch_and_alignment}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>Recommendation:</label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.recommendation}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>
                    Experience or Education Gaps:
                  </label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.experience_or_education_gaps}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>
                    Skills to Verify:
                  </label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.skills_to_verify}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>
                    JD Skill Mapping Table:
                  </label>
                  <SkillTable
                    skillMatchingTable={aiResult?.jd_skill_mapping_table}
                  />

                  <label style={{ fontWeight: "bold" }}>
                    Secondary Skills:
                  </label>
                  <SkillTable
                    skillMatchingTable={aiResult?.secondary_skill_table}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ fontWeight: "bold" }}>Brief Summary:</label>
                  <Typography style={{ marginBottom: "20px" }}>
                    {aiResult?.recommendation_summary}
                  </Typography>

                  <label style={{ fontWeight: "bold" }}>Skill Table:</label>
                  <SkillTable skillMatchingTable={aiResult?.skill_table} />
                </div>
              )}
              {aiScore !== null && (
                <animated.div style={scoreProps} className="score-box">
                  <span>Score:</span> {aiScore}
                </animated.div>
              )}
            </div>
          </Spin>
        </Modal>
      </div>
    </SubscriptionGuard>
  );
};

export default AiResumeSearch;
{
  /* <Table
          columns={columns}
          dataSource={resumes}
          pagination={{ pageSize: 10 }}
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded, record) => handleExpand(record.key)}
          expandedRowRender={(record) => (
            <p style={{ margin: 0 }}>{record.summary}</p>
          )}
          style={{
            width: "100%",
            maxWidth: "1200px", // Max width for the table
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
          }}
          rowKey="key"
        />*/
}
