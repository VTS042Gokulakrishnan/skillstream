import EmployerApplicantTable from "../../../Components/EmployerUI/EmployerApplicantTable";
import EmployerAvatar from "../../../Components/EmployerUI/EmployerAvatar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Skeleton,
  Modal,
  Input,
  Button,
  message,
  Spin,
  Empty,
  Typography,
  Tooltip,
  Collapse,
  Table,
  Card,
  List,
  Tag,
} from "antd";
import { Server } from "../../../App";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  QuestionOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";
import { FaBriefcase } from "react-icons/fa"; // Importing Font Awesome icon (for job title)
import { Typewriter } from "react-simple-typewriter";
import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import "./Applicants.css";
import { blue } from "@mui/material/colors";
import { useLocation } from "react-router-dom";
import { CaretRightOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { Tabs } from "antd";
import { jwtDecode } from "jwt-decode";
import ResumePreviewDrawer from "Components/ReaderDrawer/ResumePreviewDrawer";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const parseTable = (tableString) => {
  if (!tableString || typeof tableString !== "string") return [];
  const rows = tableString
    .trim()
    .split("\n")
    .filter((row) => !row.startsWith("|---"))
    .map((row) => row.split("|").map((cell) => cell.trim()));
  return rows;
};
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

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [vendorApplicants, setVendorApplicants] = useState([]);

  const [OtherApplicants, setOtherApplicants] = useState([]);
  const [vendorOtherApplicants, setVendorOtherApplicants] = useState([]);

  const [statusFilter, setStatusFilter] = useState("pending");
  const [filterApplicant, setFilterApplicant] = useState([]);
  const [vendorFilterApplicant, setVendorFilterApplicant] = useState([]);

  const [otherUserFilterApplicant, setOtherUserFilterApplicant] = useState([]);
  const [vendorOtherUserFilterApplicant, setVendorOtherUserFilterApplicant] =
    useState([]);

  const [jobTitleFilter, setJobTitleFilter] = useState("All");
  const [VendorJobTitleFilter, setVendorJobTitleFilter] = useState("All");

  const [otherJobTitleFilter, setOtherJobTitleFilter] = useState("All");
  const [vendorOtherJobTitleFilter, setVendorOtherJobTitleFilter] =
    useState("All");

  const [jobs, setJobs] = useState([]);
  const [vendorJobs, setVendorJobs] = useState([]);
  const [jobFilter, setJobFilter] = useState([]);
  const [vendorJobFilter, setVendorJobFilter] = useState([]);

  const [otherUserjobFilter, setOtherUserJobFilter] = useState([]);
  const [vendorOtherUserjobFilter, setVendorOtherUserJobFilter] = useState([]);

  const [selectedApplicant, setSelectedApplicant] = useState();
  const [selectedJob, setSelectedJob] = useState();
  const [selectedUser, setSelectedUser] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiScore, setAiScore] = useState(null);
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState(false);
  const [sentLoader, setEmailLoader] = useState(false);
  const [VendorModal, setVendorModal] = useState(false);
  const [VendorDetails, setVendorDetails] = useState({});

  const [loadingStates, setLoadingStates] = useState({});
  const [loader, setLoader] = useState(false);
  const [activeTab, setActiveTab] = useState("myJobs");
  const [otherUserJobs, setOtherUserJobs] = useState([]);
  const [vendorOtherUserJobs, setVendorOtherUserJobs] = useState([]);
  const [roleAccess, setRoleAccess] = useState("");
  const [currentEmployerId, setCurrentEmployerId] = useState("");
  const [mainTab, setMainTab] = useState("applicants");
  const [panelPage, setPanelPage] = useState(1);
  const [applicantPage, setApplicantPage] = useState({});
  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [highlightArray, setHighlightArray] = useState([]);
  // ======= Resume Viewer Start =======    //
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

  // ======= Resume Viewer End =======    //
  const panelsPerPage = 7;
  const applicantsPerPage = 1;
  let token = localStorage.getItem("token");

  const scoreProps = useSpring({
    opacity: aiScore !== null ? 1 : 0,
    transform: aiScore !== null ? "scale(1)" : "scale(0.8)",
    config: { duration: 500 },
  });

  const location = useLocation();
  const { jobTitle, tab, isVendor, jobId, empId } = location.state || {};
  // console.log(tab, isVendor, jobId, empId);

  useEffect(() => {
    // if (jobTitle) {
    //   // Filter applicants by job title if it's passed via location.state
    //   const filteredApplicants = jobFilter.filter((job) => {
    //     return job.JobTitle === jobTitle; // Match job title from state
    //   });
    //   setApplicants(filteredApplicants); // Update applicants with the filtered list
    //   setFilterApplicant(filteredApplicants); // Set filtered list for further filtering
    // }
  }, [jobFilter]);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [preCallQuestion, setPrecallQuestions] = useState(false);
  const [adminLoader, setAdminLoader] = useState(false);

  let userId = localStorage.getItem("UserId");
  const { access, organisationId } = jwtDecode(token);
  // console.log(access, organisationId);
  // if (jobId) {
  //       const fetchSingleJobApplicants = async () => {
  //         console.log("filtering");
  //         try {

  //         } catch (error) {
  //           console.log(error);
  //         }
  //       };

  const getApplicants = async (fetching) => {
    try {
      if (fetching === "fetch") {
        setLoader(true);
      }
      if (jobId) {
        // console.log("filtering");

        const { data } = await axios.get(
          `${Server}/api/v1/employer/jobs/applicants/filter/${empId}/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const { jobData } = data;
        if (isVendor) {
          setMainTab("vendorApplicants");
          const filterVendor = {
            ...jobData,
            applicants: jobData?.applicants.filter(
              (applicant) =>
                applicant.applicationStatus === "pending" &&
                applicant?.isVendorApplicant === true,
            ),
          };
          if (tab === "myJobs") {
            setVendorApplicants([filterVendor]);
            setVendorFilterApplicant([filterVendor]);
            setVendorJobs([filterVendor]);
            setVendorJobs([filterVendor]);
            setVendorJobFilter([filterVendor]);
            setVendorJobTitleFilter(jobId);
            setActiveTab("myJobs");
          } else if (tab === "otherJobs") {
            setVendorOtherApplicants([filterVendor]);
            setVendorOtherUserFilterApplicant([filterVendor]);
            setVendorOtherUserJobs([filterVendor]);
            setVendorOtherUserJobFilter([filterVendor]);
            setVendorOtherJobTitleFilter(jobId);
            setActiveTab("otherJobs");
          }
        } else {
          const filterApp = {
            ...jobData,
            applicants: jobData?.applicants.filter(
              (applicant) =>
                applicant.applicationStatus === "pending" &&
                !applicant?.isVendorApplicant,
            ),
          };
          setMainTab("applicants");
          if (tab === "myJobs") {
            setApplicants([filterApp]);
            setFilterApplicant([filterApp]);
            setJobs([filterApp]);
            setJobFilter([filterApp]);
            setJobTitleFilter(jobId);
            setActiveTab("myJobs");
          } else if (tab === "otherJobs") {
            setOtherApplicants([filterApp]);
            setOtherUserFilterApplicant([filterApp]);
            setOtherUserJobs([filterApp]);
            setOtherUserJobFilter([filterApp]);
            setOtherJobTitleFilter(jobId);
            setActiveTab("otherJobs");
          }
        }
        setLoader(false);
      } else {
        // console.log("getting applicnats");
        const { data } = await axios.get(
          `${Server}/api/v1/employer/jobs/allApplicants/${userId}/${access}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const pending = data.allApplicants.jobs
          .map((job) => ({
            ...job,
            applicants: job.applicants.filter(
              (applicant) =>
                applicant.applicationStatus === "pending" &&
                !applicant?.isVendorApplicant,
            ),
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        const vendorPending = data.allApplicants.jobs
          .filter((job) => job?.isVendor === true)
          .map((job) => ({
            ...job,
            applicants: job.applicants.filter(
              (applicant) =>
                applicant.applicationStatus === "pending" &&
                applicant?.isVendorApplicant === true,
            ),
          }))
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        setApplicants(pending);
        setVendorApplicants(vendorPending);

        setFilterApplicant(pending);
        setVendorFilterApplicant(vendorPending);

        setJobs(pending);
        setVendorJobs(vendorPending);

        setJobFilter(pending);
        setVendorJobFilter(vendorPending);

        setLoader(false);
        if (access === "Admin") {
          if (fetching === "fetch") {
            setAdminLoader(true);
          }
          const { data } = await axios.get(
            `${Server}/api/v1/employer/jobs/allApplicants/${userId}/${access}/${organisationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const pendingOtherJobs = data.allApplicants.otherUserJobs
            .map((job) => ({
              ...job,
              applicants: job.applicants.filter(
                (applicant) =>
                  applicant.applicationStatus === "pending" &&
                  !applicant?.isVendorApplicant,
              ),
            }))
            .sort((a, b) => new Date(b.time) - new Date(a.time));
          const vendorPendingOtherJobs = data.allApplicants.otherUserJobs
            .filter((job) => job?.isVendor === true)
            .map((job) => ({
              ...job,
              applicants: job.applicants.filter(
                (applicant) =>
                  applicant.applicationStatus === "pending" &&
                  applicant?.isVendorApplicant === true,
              ),
            }))
            .sort((a, b) => new Date(b.time) - new Date(a.time));
          setOtherUserFilterApplicant(pendingOtherJobs);
          setVendorOtherUserFilterApplicant(vendorPendingOtherJobs);

          setOtherApplicants(pendingOtherJobs);
          setVendorOtherApplicants(vendorPendingOtherJobs);

          setOtherUserJobs(pendingOtherJobs);
          setVendorOtherUserJobs(vendorPendingOtherJobs);

          setOtherUserJobFilter(pendingOtherJobs);
          setVendorOtherUserJobFilter(vendorPendingOtherJobs);
          setAdminLoader(false);
        }
      }
    } catch (error) {
      // console.log(error);
      setLoader(false);
    }
  };

  const navigate = useNavigate();
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");

  useEffect(() => {
    if (profileCompleted === "false") {
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateStatus = async (
    JobTitle,
    applicationStatus,
    jobId,
    candidateId,
    action,
    employerId,
  ) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [candidateId]: { ...prevState[candidateId], [action]: true }, // Set loading state for the specific action
    }));
    try {
      // console.log(JobTitle, applicationStatus, jobId, candidateId);
      // let employerId = localStorage.getItem("UserId");
      let jobDetails = {
        applicationStatus,
        JobTitle,
        region: "United States",
      };
      const { data } = await axios.post(
        `${Server}/api/v1/employer/jobs/application/status/${employerId}/${candidateId}/${jobId}`,
        jobDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(data);
      toast.success(`${applicationStatus}ed Successfully!`);
      getApplicants("update");
      setStatus(true);
      setLoadingStates((prevState) => ({
        ...prevState,
        [candidateId]: { ...prevState[candidateId], [action]: false }, // Reset loading for the specific action
      }));
    } catch (error) {
      // console.log(error);
      setLoadingStates((prevState) => ({
        ...prevState,
        [candidateId]: { ...prevState[candidateId], [action]: false }, // Reset loading for the specific action
      }));
    }
  };

  const deleteApplicant = async (jobId, userId, employerId) => {
    try {
      // let employerId = localStorage.getItem("UserId");
      // console.log(jobId, userId);
      const { data } = await axios.delete(
        `${Server}/api/v1/employer/jobs/applicants/delete/${employerId}/${jobId}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(data);
      toast.success("Deleted Successfully");
      getApplicants("update");
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    const decoded = jwtDecode(token);
    setRoleAccess(decoded?.access);

    getApplicants("fetch");
    // }
  }, []);
  useEffect(() => {
    getApplicants("update");
  }, [aiResult, status]);

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleJobTitleFilterChange = (event) => {
    setJobTitleFilter(event.target.value);
  };
  const handleVendorJobTitleFilterChange = (event) => {
    setVendorJobTitleFilter(event.target.value);
  };
  const handleOtherJobTitleFilterChange = (event) => {
    setOtherJobTitleFilter(event.target.value);
  };
  const handleVendorOtherJobTitleFilterChange = (event) => {
    setVendorOtherJobTitleFilter(event.target.value);
  };
  useEffect(() => {
    setApplicants(() =>
      filterApplicant.map((job) => ({
        ...job,
        applicants: job.applicants.filter(
          (applicant) =>
            statusFilter === "Pending" ||
            applicant.applicationStatus === statusFilter,
        ),
      })),
    );
    setOtherApplicants(() =>
      otherUserFilterApplicant.map((job) => ({
        ...job,
        applicants: job.applicants.filter(
          (applicant) =>
            statusFilter === "Pending" ||
            applicant.applicationStatus === statusFilter,
        ),
      })),
    );
  }, [statusFilter]);

  useEffect(() => {
    // console.log(jobFilter);

    const filteredApplicants = jobFilter.filter((job) => {
      if (jobTitleFilter === "All") {
        return true;
      } else {
        return job.jobId === jobTitleFilter;
      }
    });
    setApplicants(filteredApplicants);

    setFilterApplicant(filteredApplicants);
  }, [jobTitleFilter]);
  useEffect(() => {
    // console.log(otherUserjobFilter);

    const OtherfilteredApplicants = otherUserjobFilter.filter((job) => {
      if (otherJobTitleFilter === "All") {
        return true;
      } else {
        return job.jobId === otherJobTitleFilter;
      }
    });
    // console.log(OtherfilteredApplicants);

    setOtherApplicants(OtherfilteredApplicants);
    setOtherUserFilterApplicant(OtherfilteredApplicants);
  }, [otherJobTitleFilter]);
  useEffect(() => {
    const myVendorFiltered = vendorJobFilter.filter((job) => {
      if (VendorJobTitleFilter === "All") {
        return true;
      } else {
        return job.jobId === VendorJobTitleFilter;
      }
    });

    setVendorApplicants(myVendorFiltered);
    setVendorFilterApplicant(myVendorFiltered);
  }, [VendorJobTitleFilter]);

  useEffect(() => {
    const otherVendorFiltered = vendorOtherUserjobFilter.filter((job) => {
      if (vendorOtherJobTitleFilter === "All") return true;
      return job.jobId === vendorOtherJobTitleFilter;
    });

    setVendorOtherApplicants(otherVendorFiltered);
    setVendorOtherUserFilterApplicant(otherVendorFiltered);
  }, [vendorOtherJobTitleFilter]);
  const handleAnalyzeAI = (e, applicant) => {
    setIsModalVisible(true);
    setSelectedApplicant(applicant);
    setSelectedJob({
      job_title: e.JobTitle,
      company: e.companyName,
      location: e.JobType,
      // experience_required: "10+ years of experience in Java development",
      education_required: e.Qualification,
      skills_required: e.jobSkills,
      job_description: e.JobDescription,
    });
    setSelectedUser({
      basic_info: {
        full_name: applicant.name,
        email: applicant.email,
        City: applicant.city,
        Country: applicant.country,
        Province: applicant.state,
        Experience_in_Years: applicant.experience,
        Experience_level: applicant.Experience_level,
        Job_Title: applicant.jobTitle,
      },
      education: applicant.education,
      work_experience: applicant.work_experience,
      skills: applicant.skills,
    });
    setUserName(applicant.name);
    setCurrentEmployerId(e.userId);
  };
  const handleShowQuestionModal = (questions) => {
    setIsQuestionModalVisible(true);
    setPrecallQuestions(questions);
  };
  // console.log(selectedUser);
  // console.log(aiResult);
  // console.log(selectedApplicant.jobId);
  const handleModalOk = async () => {
    setLoading(true);
    try {
      // let userId = localStorage.getItem("UserId");
      let bodyData = {
        jobDetails: selectedJob,
        userDetails: selectedUser,
      };
      const { data } = await axios.post(
        `${Server}/api/v1/employer/jobs/openAI/analyse/${currentEmployerId}/${selectedApplicant.jobId}/${selectedApplicant.id}`,
        bodyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(data);

      // const { result, score } = await simulateAiAnalysis(
      //   userDetails,
      //   jobDescription
      // );

      setAiResult(data.data);
      setAiScore(data.data.fitment_score);
      setPrecallQuestions(data?.screening_questions);
      setLoading(false);
      setIsModalVisible(false);
      setIsResultModalVisible(true);
    } catch (error) {
      message.error("Failed to analyze. Please try again."); // Error handling
      // console.log("Error analyzing with AI:", error);
    } finally {
      setLoading(false);
      setSelectedApplicant();
      setSelectedJob();
      setSelectedUser();
    }
  };
  // console.log(aiResult);

  const simulateAiAnalysis = (userDetails, jobDescription) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const score = Math.floor(Math.random() * 100) + 1; // Generate a random score between 1 and 100
        resolve({
          result:
            "AI analysis result for " + jobDescription + " and " + userDetails,
          score: score,
        });
      }, 3000); // Simulate a 3-second loading time
    });
  };

  const handleModalCancel = () => {
    setIsResultModalVisible(false);
    setIsModalVisible(false);
    setUserDetails("");
    setJobDescription("");
    setAiResult("");
    setSelectedApplicant();
    setSelectedJob();
    setSelectedUser();
  };

  const handleResultModalCancel = () => {
    if (loading) {
      Modal.confirm({
        title: "Are you sure you want to close?",
        content: "You will lose the result if you close now.",
        okText: "Yes",
        cancelText: "No",
        onOk() {
          setIsResultModalVisible(false);
          setIsModalVisible(false);
          setSelectedApplicant();
          setSelectedJob();
          setSelectedUser();
        },
      });
    } else {
      setIsResultModalVisible(false);
      setIsModalVisible(false);
      setSelectedApplicant();
      setSelectedJob();
      setSelectedUser();
    }
  };
  const handleViewResult = async (applicant) => {
    // console.log(applicant);
    setIsResultModalVisible(true);
    setAiResult(JSON.parse(applicant.fitmentSummary));
    setAiScore(applicant.matchingScore);
  };
  // download as pdf
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
  // send interview to applicants
  const showVendorModal = (vendor) => {
    setVendorModal(true);
    setVendorDetails(vendor);
    console.log(vendor);
  };
  const handleVendorModalCancel = () => {
    setVendorModal(false);
    setVendorDetails({});
  };
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
    setEmailLoader(true);
    try {
      let payload = {
        userId,
        candidateId,
        jobId,
        from,
        to,
        candidateName,
        JobTitle,
        companyName,
      };
      // console.log(payload);

      const { data } = await axios.post(
        `${Server}/api/v1/videoInterview/sendEmail/${userId}/${jobId}/${candidateId}`,
        payload,
      );
      // console.log(data);
      toast.success("Email Invite Sent");
      setEmailLoader(false);
    } catch (error) {
      // console.log(error);
      toast.error("Error in sending Interview Invite");
    }
  };

  const ApplicantLayout = (givenApplicants, applLoader) => <EmployerApplicantTable mode="applicants" jobs={givenApplicants} loading={applLoader} renderDetails={(i, e, idx) => { return (<div className="widget-content" key={idx}>
                                    <div className="row">
                                      <div className="col-lg-12">
                                        <div className="candidate-block-three">
                                          <div className="inner-box">
                                            <div className="content">
                                              <div>
                                                <figure className="image">
                                                  <EmployerAvatar src={i?.image} name={i?.name} size={60} />
                                                </figure>
                                                <h4>
                                                  <a
                                                    style={{
                                                      fontSize: "16px",
                                                      color: "blue",
                                                    }}
                                                    href="#"
                                                  >
                                                    {i?.name}
                                                  </a>
                                                </h4>
                                                <ul className="candidate-info">
                                                  <li>
                                                    <span className="icon flaticon-map-locator"></span>
                                                    {i?.country
                                                      ? i?.country
                                                      : "N/A"}
                                                  </li>
                                                  <br />

                                                  <li>
                                                    <FaBriefcase
                                                      className="icon"
                                                      style={{
                                                        marginRight: "8px",
                                                      }}
                                                    />
                                                    {i?.jobTitle
                                                      ? i?.jobTitle
                                                      : "N/A"}
                                                  </li>

                                                  {mainTab ===
                                                    "vendorApplicants" && (
                                                    <li>
                                                      <Button
                                                        icon={<EyeOutlined />}
                                                        // type="primary"

                                                        onClick={() =>
                                                          showVendorModal(
                                                            i?.vendor,
                                                          )
                                                        }
                                                      >
                                                        Vendor Details
                                                      </Button>
                                                    </li>
                                                  )}
                                                </ul>
                                                {/* <ul className="post-tags">
                                              <li>
                                                <motion.span>
                                                  {i?.skills.join("\n \n")}
                                                </motion.span>
                                              </li>
                                            </ul> */}
                                              </div>
                                              <ul
                                                className="post-tags"
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                }}
                                              >
                                                <li>
                                                  <a href="#">
                                                    <motion.div
                                                      style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                      }}
                                                      initial={{
                                                        opacity: 0,
                                                      }}
                                                      animate={{
                                                        opacity: 1,
                                                      }}
                                                      transition={{
                                                        delay: 0.3,
                                                        duration: 0.5,
                                                      }}
                                                    >
                                                      <span
                                                        style={{
                                                          width: "10px",
                                                          height: "10px",
                                                          borderRadius: "50%",
                                                          backgroundColor:
                                                            i?.applicationStatus ===
                                                            "Approved"
                                                              ? "green"
                                                              : i?.applicationStatus ===
                                                                "Rejected"
                                                              ? "red"
                                                              : "#FFC107",
                                                          marginRight: "8px",
                                                        }}
                                                      />
                                                      <motion.span
                                                        style={{
                                                          color:
                                                            i?.applicationStatus ===
                                                            "Approved"
                                                              ? "green"
                                                              : i?.applicationStatus ===
                                                                "Rejected"
                                                              ? "red"
                                                              : "#FFC107",
                                                        }}
                                                      >
                                                        {i?.applicationStatus}
                                                      </motion.span>
                                                    </motion.div>
                                                  </a>
                                                </li>
                                              </ul>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  gap: "20px",
                                                  justifyContent: "center",
                                                }}
                                              >
                                                <Button
                                                  icon={<CheckCircleOutlined />}
                                                  type="primary"
                                                  onClick={() =>
                                                    updateStatus(
                                                      e?.JobTitle,
                                                      "Approve",
                                                      i?.jobId,
                                                      i?.id,
                                                      "approve",
                                                      e.userId,
                                                    )
                                                  }
                                                  disabled={
                                                    loadingStates[i?.id]
                                                      ?.approve ||
                                                    i?.applicationStatus ===
                                                      "Approved" ||
                                                    i?.applicationStatus ===
                                                      "Rejected"
                                                  }
                                                  style={{
                                                    marginRight: "8px",
                                                    backgroundColor: "#4CAF50",
                                                  }}
                                                >
                                                  {loadingStates[i?.id]
                                                    ?.approve ? (
                                                    <span>
                                                      Approving...
                                                      <LoadingOutlined />{" "}
                                                    </span>
                                                  ) : (
                                                    "Approve"
                                                  )}
                                                </Button>
                                                <Button
                                                  icon={<CloseCircleOutlined />}
                                                  type="danger"
                                                  onClick={() =>
                                                    updateStatus(
                                                      e?.JobTitle,
                                                      "Rejecte",
                                                      i?.jobId,
                                                      i?.id,
                                                      "reject",
                                                      e.userId,
                                                    )
                                                  }
                                                  style={{
                                                    marginRight: "8px",
                                                    backgroundColor: "#FF5252",
                                                  }}
                                                  disabled={
                                                    loadingStates[i?.id]
                                                      ?.reject ||
                                                    i?.applicationStatus ===
                                                      "Approved" ||
                                                    i?.applicationStatus ===
                                                      "Rejected"
                                                  }
                                                >
                                                  {loadingStates[i?.id]
                                                    ?.reject ? (
                                                    <span>
                                                      <LoadingOutlined />{" "}
                                                      Rejecting...
                                                    </span>
                                                  ) : (
                                                    "Reject"
                                                  )}
                                                </Button>

                                                <Button
                                                  icon={<EyeOutlined />}
                                                  type="primary"
                                                  style={{
                                                    backgroundColor: "#1E88E5",
                                                  }}
                                                  onClick={() =>
                                                    openResumeDrawer(
                                                      i?.resume,
                                                      e?.jobSkills,
                                                    )
                                                  }
                                                >
                                                  View Resume
                                                </Button>

                                                <Button
                                                  icon={<DeleteOutlined />}
                                                  type="default"
                                                  onClick={() =>
                                                    deleteApplicant(
                                                      i?.jobId,
                                                      i?.id,
                                                      e.userId,
                                                    )
                                                  }
                                                  style={{
                                                    backgroundColor: "#FF9800",
                                                  }}
                                                >
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>

                                            <div className="btn-box-one">
                                              <div className="button-container">
                                                {i?.matchingScore && (
                                                  <Tooltip title="Candidate Score">
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                        width: "50px",
                                                        height: "52px",
                                                        backgroundColor:
                                                          "#1e90ff ",
                                                        color: "#ffff",
                                                        borderRadius: "10px",
                                                        fontWeight: "bold",
                                                        fontSize: "14px",
                                                        textAlign: "center",
                                                        marginRight: "8px",
                                                      }}
                                                    >
                                                      <span>{`${
                                                        i.matchingScore.split(
                                                          "%",
                                                        )[0]
                                                      }%`}</span>
                                                    </div>
                                                  </Tooltip>
                                                )}
                                                {(i?.preCallQuestion?.length || 0) >
                                                  0 &&
                                                  i?.fitmentSummary && (
                                                    <Tooltip title="Recruiter Questions">
                                                      <div
                                                        className="square blue"
                                                        type="primary"
                                                        onClick={() =>
                                                          handleShowQuestionModal(
                                                            i?.preCallQuestion,
                                                          )
                                                        }
                                                        style={{
                                                          backgroundColor:
                                                            "#00BCD4",
                                                        }}
                                                      >
                                                        <QuestionOutlined />
                                                      </div>
                                                    </Tooltip>
                                                  )}
                                                {!i?.fitmentSummary ? (
                                                  <Tooltip title="Analyze with AI">
                                                    <div
                                                      className="loader-one"
                                                      onClick={() =>
                                                        handleAnalyzeAI(e, i)
                                                      }
                                                    >
                                                      <span className="loader__inner1"></span>
                                                      <span className="loader__inner1"></span>
                                                      <span className="loader__text1">
                                                        <SearchOutlined />
                                                      </span>
                                                    </div>
                                                  </Tooltip>
                                                ) : (
                                                  <Tooltip title="View Analysis Results">
                                                    <div
                                                      className="square blue"
                                                      type="primary"
                                                      onClick={() =>
                                                        handleViewResult(i)
                                                      }
                                                      style={{
                                                        backgroundColor:
                                                          "#00BCD4",
                                                      }}
                                                    >
                                                      <FileTextOutlined />
                                                    </div>
                                                  </Tooltip>
                                                )}

                                                {/* Tooltip for Analyze with AI */}
                                                {/* <div style={{display:"flex"}}> */}
                                                {/* Tooltip for View Results */}
                                                {/*!i?.videoResults ? (
                                                      <Tooltip title="AI Video Assessments">
                                                        <div
                                                          className="square red"
                                                          type="primary"
                                                          onClick={() =>
                                                            sendEmail({
                                                              userId: userId,
                                                              candidateId:
                                                                i?.id,
                                                              jobId: e?.jobId,
                                                              from: e?.EmailAddress,
                                                              to: i?.email,
                                                              candidateName:
                                                                i?.name,
                                                              JobTitle:
                                                                e?.JobTitle,
                                                              companyName:
                                                                e?.companyName,
                                                            })
                                                          }
                                                          style={{
                                                            marginBottom: "8px",
                                                            backgroundColor:
                                                              "#FFC107",
                                                          }}
                                                        >
                                                          {sentLoader ? (
                                                            <Spin />
                                                          ) : (
                                                            <VideoCameraOutlined />
                                                          )}
                                                        </div>
                                                      </Tooltip>
                                                    ) : (
                                                      <Tooltip title="View Video Results">
                                                        <div
                                                          className="square green"
                                                          type="primary"
                                                          onClick={() =>
                                                            navigate(
                                                              `/resume/${i?.userId}`
                                                            )
                                                          }
                                                          style={{
                                                            marginBottom: "8px",
                                                            backgroundColor:
                                                              "#1E88E5",
                                                          }}
                                                        >
                                                          <EyeOutlined />
                                                        </div>
                                                      </Tooltip>
                                                    )*/}

                                                {/* Tooltip for View Video Results */}
                                                {/* </div> */}
                                              </div>
                                            </div>
                                            {/* <div className="btn-box-one">
                                          <div className="button-container">
                                            <Button
                                              icon={<EyeOutlined />}
                                              type="primary"
                                              onClick={() =>
                                                navigate(`/resume/${i?.userId}`)
                                              }
                                              style={{
                                                marginBottom: "8px", // Space between rows
                                                backgroundColor: "#1E88E5",
                                              }}
                                            >
                                              View Resume
                                            </Button>
                                            <Button
                                              icon={<RobotOutlined />}
                                              type="primary"
                                              onClick={handleAnalyzeAI}
                                              style={{
                                                marginBottom: "8px",
                                                backgroundColor: "#9C27B0",
                                              }}
                                            >
                                              Analyze with AI
                                            </Button>
                                            <Button
                                              icon={<VideoCameraOutlined />}
                                              type="primary"
                                              onClick={() =>
                                                navigate(
                                                  `/video-assessment/${i?.userId}`
                                                )
                                              }
                                              style={{
                                                marginBottom: "8px",
                                                backgroundColor: "#FFC107",
                                              }}
                                            >
                                              AI Video Assessments
                                            </Button>
                                            <Button
                                              icon={<FileTextOutlined />}
                                              type="primary"
                                              onClick={() =>
                                                navigate(
                                                  `/results/${i?.userId}`
                                                )
                                              }
                                              style={{
                                                backgroundColor: "#00BCD4",
                                              }}
                                            >
                                              View Results
                                            </Button>
                                          </div>
                                        </div> */}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>); }} />;
  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>All Applicants</h3>
            <div className="text">Ready to jump back in?</div>
          </div>
          <Toaster position="top-center" reverseOrder={false} />
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Applicant</h4>

                    <div className="chosen-outer">
                      {mainTab === "applicants" ? (
                        activeTab === "myJobs" ? (
                          <select
                            className="chosen-select"
                            value={jobTitleFilter}
                            onChange={handleJobTitleFilterChange}
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
                            onChange={handleOtherJobTitleFilterChange}
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
                          onChange={handleVendorJobTitleFilterChange}
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
                          onChange={handleVendorOtherJobTitleFilterChange}
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
                    {roleAccess === "Admin" ? (
                      <Tabs
                        activeKey={mainTab}
                        onChange={(key) => setMainTab(key)}
                      >
                        <Tabs.TabPane tab="Applicants" key="applicants">
                          {" "}
                          <Tabs
                            activeKey={activeTab}
                            onChange={(key) => setActiveTab(key)}
                          >
                            <Tabs.TabPane tab="My Jobs Applicants" key="myJobs">
                              {" "}
                              {ApplicantLayout(applicants, loader)}
                            </Tabs.TabPane>
                            <Tabs.TabPane
                              tab="Other Users Jobs Applicants"
                              key="otherJobs"
                            >
                              {ApplicantLayout(OtherApplicants, adminLoader)}
                            </Tabs.TabPane>
                          </Tabs>
                        </Tabs.TabPane>
                        <Tabs.TabPane
                          tab="Vendor Job Applicant"
                          key="vendorApplicants"
                        >
                          {" "}
                          <Tabs
                            activeKey={activeTab}
                            onChange={(key) => setActiveTab(key)}
                          >
                            <Tabs.TabPane tab="My Jobs Applicants" key="myJobs">
                              {" "}
                              {ApplicantLayout(vendorApplicants, loader)}
                            </Tabs.TabPane>
                            <Tabs.TabPane
                              tab="Other Users Jobs Applicants"
                              key="otherJobs"
                            >
                              {ApplicantLayout(
                                vendorOtherApplicants,
                                adminLoader,
                              )}
                            </Tabs.TabPane>
                          </Tabs>
                        </Tabs.TabPane>
                      </Tabs>
                    ) : (
                      <Tabs
                        activeKey={mainTab}
                        onChange={(key) => setMainTab(key)}
                      >
                        <Tabs.TabPane tab="Applicants" key="applicants">
                          {ApplicantLayout(applicants, loader)}
                        </Tabs.TabPane>
                        <Tabs.TabPane
                          tab="Vendor Job Applicant"
                          key="vendorApplicants"
                        >
                          {ApplicantLayout(vendorApplicants, loader)}
                        </Tabs.TabPane>
                      </Tabs>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="copyright-text">
        <p>© 2024 Skill Stream. All Right Reserved.</p>
      </div>
      <ResumePreviewDrawer
        open={resumeDrawerOpen}
        onClose={closeResumeDrawer}
        fileUrl={resumeUrl}
        highlightArray={highlightArray}
      />
      {/* Modal for AI Analysis */}
      {/* Modal for AI Analysis */}
      <Modal
        title="Analyze with AI"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleResultModalCancel}
        okText="Analyze"
        cancelText="Cancel"
        centered
        styles={{ textAlign: "center" }}
      >
        <div>
          <div>
            <label>User Details</label>
            <TextArea
              placeholder="User Details"
              value={JSON.stringify(selectedUser)}
              onChange={(e) => setUserDetails(e.target.value)}
              className="custom-textarea" // Add a custom class
              style={{ marginBottom: 10, height: "100px", overflowY: "scroll" }}
              disabled
            />
          </div>
          <div>
            <label>Job Description</label>
            <TextArea
              placeholder="Job Description"
              rows={4}
              value={JSON.stringify(selectedJob)}
              onChange={(e) => setJobDescription(e.target.value)}
              className="custom-textarea" // Add a custom class
              style={{ marginBottom: 10, height: "100px", overflowY: "scroll" }}
              disabled
            />
          </div>
          {loading && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Spin size="large" />
            </div>
          )}
        </div>
      </Modal>

      {/* Modal for AI Analysis Result */}
      <Modal
        title="AI Analysis Result"
        open={isResultModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="download" onClick={() => downloadPDF()}>
            Download as PDF
          </Button>,
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
        ]}
        centered
        styles={{ textAlign: "center" }}
        width={1200}
      >
        {/* <div style={{ marginBottom: 20 }}>
            <Typewriter
              words={[aiResult]}
              loop={1}
              cursor
              cursorStyle="_"
              typeSpeed={5}
              // deleteSpeed={50}
              delaySpeed={100}
            />
          </div>
          {aiScore !== null && (
            <animated.div style={scoreProps} className="score-box">
              <span>Score:</span> {aiScore}
            </animated.div>
         )}*/}
        <Spin spinning={loading}>
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
                        { title: "Closest Match", dataIndex: "closest_match" },
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

                <label style={{ fontWeight: "bold" }}>Skills to Verify:</label>
                <Typography style={{ marginBottom: "20px" }}>
                  {aiResult?.skills_to_verify}
                </Typography>

                <label style={{ fontWeight: "bold" }}>
                  JD Skill Mapping Table:
                </label>
                <SkillTable
                  skillMatchingTable={aiResult?.jd_skill_mapping_table}
                />

                <label style={{ fontWeight: "bold" }}>Secondary Skills:</label>
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

      {isQuestionModalVisible && (
        <Modal
          title="Recruiter Questions"
          open={isQuestionModalVisible}
          onCancel={() => setIsQuestionModalVisible(false)}
          footer={false}
          centered
          styles={{ textAlign: "center" }}
        >
          <ul style={{ listStyleType: "circle" }}>
            {preCallQuestion?.map((question, index) => (
              <li key={index} style={{ paddingBottom: "10px" }}>
                {`${index + 1} . ${question}`}
              </li>
            ))}
          </ul>
        </Modal>
      )}
      <Modal
        title="Vendor Details"
        open={VendorModal}
        onCancel={() => handleVendorModalCancel()}
        footer={false}
        centered
        styles={{ textAlign: "center" }}
      >
        <ul style={{ listStyleType: "circle" }}>
          <li>Name : {VendorDetails.name}</li>
          <li>Email : {VendorDetails.email}</li>
          <li>Phone : {VendorDetails.phoneNumber}</li>
          <li>
            Location :
            {`${VendorDetails.city},${VendorDetails.state},${VendorDetails.country}`}
          </li>
        </ul>
      </Modal>
    </div>
  );
};

export default Applicants;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Skeleton, Modal, Input, Button, message, Spin } from "antd";
// import { Server } from "../../../App";
// import { useNavigate } from "react-router-dom";
// import {
//   EditOutlined,
//   DeleteOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import toast, { Toaster } from "react-hot-toast";
// import { Typewriter } from "react-simple-typewriter";
// import { motion } from "framer-motion";
// import { useSpring, animated } from "@react-spring/web";

// const { TextArea } = Input;

// const Applicants = () => {
//   const [applicants, setApplicants] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [filterApplicant, setFilterApplicant] = useState([]);
//   const [jobTitleFilter, setJobTitleFilter] = useState("All");
//   const [jobs, setJobs] = useState([]);
//   const [jobFilter, setJobFilter] = useState([]);

//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [userDetails, setUserDetails] = useState("");
//   const [jobDescription, setJobDescription] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [aiResult, setAiResult] = useState("");
//   const [aiScore, setAiScore] = useState(null);
//   const [selectedApplicant, setSelectedApplicant] = useState(null); // Track selected applicant

//   const scoreProps = useSpring({
//     opacity: aiScore !== null ? 1 : 0,
//     transform: aiScore !== null ? "scale(1)" : "scale(0.8)",
//     config: { duration: 500 },
//   });

//   const [isResultModalVisible, setIsResultModalVisible] = useState(false);

//   const getApplicants = async () => {
//     try {
//       let userId = localStorage.getItem("UserId");
//       const { data } = await axios.get(
//         `${Server}/api/v1/employer/jobs/allApplicants/${userId}`
//       );

//       setApplicants(data.allApplicants.jobs);
//       setFilterApplicant(data.allApplicants.jobs);
//       setJobs(data.allApplicants.jobs);
//       setJobFilter(data.allApplicants.jobs);
//       console.log(data.allApplicants.jobs);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const navigate = useNavigate();
//   let profileCompleted = localStorage.getItem("ProfileCompleted");
//   let role = localStorage.getItem("Role");

//   useEffect(() => {
//     if (profileCompleted === "false") {
//       if (role === "Candidate") {
//         navigate("/my-profile");
//       } else {
//         navigate("/company-profile");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const updateStatus = async (
//     JobTitle,
//     applicationStatus,
//     jobId,
//     candidateId
//   ) => {
//     try {
//       console.log(JobTitle, applicationStatus, jobId, candidateId);
//       let employerId = localStorage.getItem("UserId");
//       let jobDetails = {
//         applicationStatus,
//         JobTitle,
//       };
//       const { data } = await axios.post(
//         `${Server}/api/v1/employer/jobs/application/status/${employerId}/${candidateId}/${jobId}`,
//         jobDetails
//       );
//       console.log(data);
//       toast.success(`${applicationStatus}ed Successfully!`);
//       getApplicants();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const deleteApplicant = async (jobId, userId) => {
//     try {
//       let employerId = localStorage.getItem("UserId");
//       console.log(jobId, userId);
//       const { data } = await axios.delete(
//         `${Server}/api/v1/employer/jobs/applicants/delete/${employerId}/${jobId}/${userId}`
//       );
//       console.log(data);
//       toast.success("Deleted Successfully");
//       getApplicants();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getApplicants();
//   }, []);

//   const handleStatusFilterChange = (event) => {
//     setStatusFilter(event.target.value);
//   };

//   const handleJobTitleFilterChange = (event) => {
//     setJobTitleFilter(event.target.value);
//   };

//   useEffect(() => {
//     setApplicants(() =>
//       filterApplicant.map((job) => ({
//         ...job,
//         applicants: job.applicants.filter(
//           (applicant) =>
//             statusFilter === "All" ||
//             applicant.applicationStatus === statusFilter
//         ),
//       }))
//     );
//   }, [statusFilter]);

//   useEffect(() => {
//     const filteredApplicants = jobFilter.filter((job) => {
//       if (jobTitleFilter === "All") {
//         return true;
//       } else {
//         return job.JobTitle === jobTitleFilter;
//       }
//     });
//     setApplicants(filteredApplicants);
//     setFilterApplicant(filteredApplicants);
//   }, [jobTitleFilter]);

//   const handleAnalyzeAI = (applicant, job) => {
//     setUserDetails(applicant.name); // Set the user details with the applicant's name or any relevant info
//     setJobDescription(job.JobTitle); // Set job description with job title or any relevant job info
//     setSelectedApplicant(applicant); // Save selected applicant for later reference
//     setIsModalVisible(true);
//   };

//   const handleModalOk = async () => {
//     setLoading(true);
//     try {
//       const { result, score } = await simulateAiAnalysis(
//         userDetails,
//         jobDescription
//       );
//       setAiResult(result);
//       setAiScore(score); // Set the score in the state
//       setIsResultModalVisible(true);
//     } catch (error) {
//       console.log("Error analyzing with AI:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const simulateAiAnalysis = (userDetails, jobDescription) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const score = Math.floor(Math.random() * 100) + 1; // Generate a random score between 1 and 100
//         resolve({
//           result:
//             "AI analysis result for " + jobDescription + " and " + userDetails,
//           score: score,
//         });
//       }, 3000); // Simulate a 3-second loading time
//     });
//   };

//   const handleModalCancel = () => {
//     setIsModalVisible(false);
//     setUserDetails("");
//     setJobDescription("");
//     setAiResult("");
//   };

//   const handleResultModalCancel = () => {
//     Modal.confirm({
//       title: "Are you sure you want to close?",
//       content: "You will lose the result if you close now.",
//       okText: "Yes",
//       cancelText: "No",
//       onOk() {
//         setIsResultModalVisible(false);
//       },
//     });
//   };

//   const handleViewResult = (applicant) => {
//     if (selectedApplicant && selectedApplicant.userId === applicant.userId) {
//       setIsResultModalVisible(true);
//     } else {
//       toast.error("AI Analysis not performed for this applicant yet.");
//     }
//   };

//   return (
//     <div>
//       <section className="user-dashboard">
//         <div className="dashboard-outer">
//           <div className="upper-title-box">
//             <h3>All Applicants</h3>
//             <div className="text">Ready to jump back in?</div>
//           </div>
//           <Toaster position="top-center" reverseOrder={false} />
//           <div className="row">
//             <div className="col-lg-12">
//               <div className="ls-widget">
//                 <div className="tabs-box">
//                   <div className="widget-title">
//                     <h4>Applicant</h4>

//                     <div className="chosen-outer">
//                       <select
//                         className="chosen-select"
//                         value={jobTitleFilter}
//                         onChange={handleJobTitleFilterChange}
//                       >
//                         <option value="All">All Jobs</option>
//                         {jobs?.map((e, idx) => (
//                           <option key={idx} value={e?.JobTitle}>
//                             {e?.JobTitle}
//                           </option>
//                         ))}
//                       </select>

//                       <select
//                         className="chosen-select"
//                         value={statusFilter}
//                         onChange={handleStatusFilterChange}
//                       >
//                         <option value="All">All Status</option>
//                         <option value="pending">Pending</option>
//                         <option value="Approved">Approved</option>
//                         <option value="Rejected">Rejected</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="widget-content">
//                     <div className="table-outer">
//                       <table className="default-table manage-job-table">
//                         <thead>
//                           <tr>
//                             <th>Applicant Name</th>
//                             <th>Email Address</th>
//                             <th>Job Title</th>
//                             <th>Status</th>
//                             <th>AI Analysis</th>
//                             <th>Action</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {applicants?.map((job) =>
//                             job?.applicants?.map((applicant) => (
//                               <tr key={applicant.userId}>
//                                 <td>
//                                   <h6>{applicant.name}</h6>
//                                 </td>
//                                 <td>{applicant.email}</td>
//                                 <td>{job.JobTitle}</td>
//                                 <td>{applicant.applicationStatus}</td>
//                                 <td>
//                                   <button
//                                     className="btn btn-info"
//                                     onClick={() =>
//                                       handleAnalyzeAI(applicant, job)
//                                     }
//                                   >
//                                     Analyze with AI
//                                   </button>

//                                   {selectedApplicant &&
//                                     selectedApplicant.userId ===
//                                       applicant.userId && (
//                                       <button
//                                         className="btn btn-success"
//                                         onClick={() => handleViewResult(applicant)}
//                                         style={{ marginTop: "8px" }}
//                                       >
//                                         View Result
//                                       </button>
//                                     )}
//                                 </td>

//                                 <td>
//                                   <div className="action-buttons">
//                                     <button
//                                       className="btn btn-success"
//                                       onClick={() =>
//                                         updateStatus(
//                                           job.JobTitle,
//                                           "Approved",
//                                           job.jobId,
//                                           applicant.userId
//                                         )
//                                       }
//                                     >
//                                       <EditOutlined />
//                                       Approve
//                                     </button>
//                                     <button
//                                       className="btn btn-danger"
//                                       onClick={() =>
//                                         updateStatus(
//                                           job.JobTitle,
//                                           "Rejected",
//                                           job.jobId,
//                                           applicant.userId
//                                         )
//                                       }
//                                     >
//                                       <DeleteOutlined />
//                                       Reject
//                                     </button>
//                                     <button
//                                       className="btn btn-danger"
//                                       onClick={() =>
//                                         deleteApplicant(
//                                           job.jobId,
//                                           applicant.userId
//                                         )
//                                       }
//                                     >
//                                       <DeleteOutlined />
//                                       Delete
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))
//                           )}
//                         </tbody>
//                       </table>

//                       <Modal
//                         title="AI Analysis"
//                         visible={isModalVisible}
//                         onOk={handleModalOk}
//                         onCancel={handleModalCancel}
//                       >
//                         <Spin spinning={loading} tip="Analyzing...">
//                           <p>User Details: {userDetails}</p>
//                           <p>Job Description: {jobDescription}</p>
//                         </Spin>
//                       </Modal>

//                       <Modal
//                         title="AI Analysis Result"
//                         visible={isResultModalVisible}
//                         onCancel={handleResultModalCancel}
//                         footer={[
//                           <Button
//                             key="close"
//                             onClick={handleResultModalCancel}
//                             type="primary"
//                           >
//                             Close
//                           </Button>,
//                         ]}
//                       >
//                         <div style={{ textAlign: "center" }}>
//                           <motion.div
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ duration: 1 }}
//                           >
//                             <h3>{aiResult}</h3>
//                           </motion.div>
//                           <animated.div style={scoreProps}>
//                             {aiScore !== null && (
//                               <h4>
//                                 AI Score: <strong>{aiScore}</strong>
//                               </h4>
//                             )}
//                           </animated.div>
//                         </div>
//                       </Modal>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* End Row */}
//         </div>

//         {/* End Dashboard Outer */}
//       </section>
//     </div>
//   );
// };

// export default Applicants;
// if (jobTitle) {
//   if (isVendor) {
//     setMainTab("vendorApplicants");
//     if (tab === "myJobs") {
//       const filter = vendorPending
//         .filter((applicant) => {
//           return applicant.JobTitle === jobTitle;
//         })
//         .sort((a, b) => b.time - a.time);

//       setApplicants(pending);
//       setFilterApplicant(pending);
//       setJobs(pending);
//       setJobFilter(pending);

//       setVendorApplicants(filter);
//       setVendorFilterApplicant(vendorPending);
//       setVendorJobs(vendorPending);
//       setVendorJobFilter(vendorPending);

//       setActiveTab("myJobs");
//       setVendorJobTitleFilter(jobTitle);

//       setOtherApplicants(pendingOtherJobs);
//       setOtherUserFilterApplicant(pendingOtherJobs);
//       setOtherUserJobs(pendingOtherJobs);
//       setOtherUserJobFilter(pendingOtherJobs);

//       setVendorOtherApplicants(vendorPendingOtherJobs);
//       setVendorOtherUserFilterApplicant(vendorPendingOtherJobs);
//       setVendorOtherUserJobs(vendorPendingOtherJobs);
//       setVendorOtherUserJobFilter(vendorPendingOtherJobs);
//     } else if (tab === "otherJobs") {
//       const otherFilter = vendorPendingOtherJobs
//         .filter((applicant) => {
//           return applicant.JobTitle === jobTitle;
//         })
//         .sort((a, b) => b.time - a.time);

//       setApplicants(pending);
//       setFilterApplicant(pending);
//       setJobs(pending);
//       setJobFilter(pending);

//       setVendorApplicants(vendorPending);
//       setVendorFilterApplicant(vendorPending);
//       setVendorJobs(vendorPending);
//       setVendorJobFilter(vendorPending);

//       setOtherApplicants(pendingOtherJobs);
//       setOtherUserFilterApplicant(pendingOtherJobs);
//       setOtherUserJobs(pendingOtherJobs);
//       setOtherUserJobFilter(pendingOtherJobs);

//       setVendorOtherApplicants(otherFilter);
//       setVendorOtherUserFilterApplicant(vendorPendingOtherJobs);
//       setVendorOtherUserJobs(vendorPendingOtherJobs);
//       setVendorOtherUserJobFilter(vendorPendingOtherJobs);

//       setActiveTab("otherJobs");
//       setVendorOtherJobTitleFilter(jobTitle);
//     }
//   } else {
//     setMainTab("applicants");
//     if (tab === "myJobs") {
//       const filter = pending
//         .filter((applicant) => {
//           return applicant.JobTitle === jobTitle;
//         })
//         .sort((a, b) => b.time - a.time);

//       setApplicants(filter);
//       setFilterApplicant(pending);
//       setJobs(pending);
//       setJobFilter(pending);

//       setVendorApplicants(vendorPending);
//       setVendorFilterApplicant(vendorPending);
//       setVendorJobs(vendorPending);
//       setVendorJobFilter(vendorPending);

//       setActiveTab("myJobs");
//       setJobTitleFilter(jobTitle);

//       setOtherApplicants(pendingOtherJobs);
//       setOtherUserFilterApplicant(pendingOtherJobs);
//       setOtherUserJobs(pendingOtherJobs);
//       setOtherUserJobFilter(pendingOtherJobs);

//       setVendorOtherApplicants(vendorPendingOtherJobs);
//       setVendorOtherUserFilterApplicant(vendorPendingOtherJobs);
//       setVendorOtherUserJobs(vendorPendingOtherJobs);
//       setVendorOtherUserJobFilter(vendorPendingOtherJobs);
//     } else if (tab === "otherJobs") {
//       const otherFilter = pendingOtherJobs
//         .filter((applicant) => {
//           return applicant.JobTitle === jobTitle;
//         })
//         .sort((a, b) => b.time - a.time);

//       setApplicants(pending);
//       setFilterApplicant(pending);
//       setJobs(pending);
//       setJobFilter(pending);

//       setVendorApplicants(vendorPending);
//       setVendorFilterApplicant(vendorPending);
//       setVendorJobs(vendorPending);
//       setVendorJobFilter(vendorPending);

//       setOtherApplicants(otherFilter);
//       setOtherUserFilterApplicant(pendingOtherJobs);
//       setOtherUserJobs(pendingOtherJobs);
//       setOtherUserJobFilter(pendingOtherJobs);

//       setVendorOtherApplicants(vendorPendingOtherJobs);
//       setVendorOtherUserFilterApplicant(vendorPendingOtherJobs);
//       setVendorOtherUserJobs(vendorPendingOtherJobs);
//       setVendorOtherUserJobFilter(vendorPendingOtherJobs);

//       setActiveTab("otherJobs");
//       setOtherJobTitleFilter(jobTitle);
//     }
//   }

//   setLoader(false);
// } else {
//   setApplicants(pending);
//   setVendorApplicants(vendorPending);

//   setFilterApplicant(pending);
//   setVendorFilterApplicant(vendorPending);

//   setJobs(pending);
//   setVendorJobs(vendorPending);

//   setJobFilter(pending);
//   setVendorJobFilter(vendorPending);

//   setOtherUserFilterApplicant(pendingOtherJobs);
//   setVendorOtherUserFilterApplicant(vendorPendingOtherJobs);

//   setOtherApplicants(pendingOtherJobs);
//   setVendorOtherApplicants(vendorPendingOtherJobs);

//   setOtherUserJobs(pendingOtherJobs);
//   setVendorOtherUserJobs(vendorPendingOtherJobs);

//   setOtherUserJobFilter(pendingOtherJobs);
//   setVendorOtherUserJobFilter(vendorPendingOtherJobs);

//   // console.log(data.allApplicants.jobs);
// }
