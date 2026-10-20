import React, { useEffect, useState } from "react";
import "./AiFitmentAnalysis.css"; // Import the CSS file for styling
import img from "../../assets/executives-working-hard-with-tablet.jpg";
import { Toaster, toast } from "react-hot-toast";
import {
  Upload,
  Button,
  Select,
  Space,
  Divider,
  Spin,
  Input,
  ConfigProvider,
  Modal,
  Table,
  Card,
  List,
  Tag,
  Typography,
  Result,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import { Server } from "App";
import { FaSlidersH } from "react-icons/fa";
import SubscriptionGuard from "Components/SubscriberCheckWrapper/SubscriptionGuard";

const { Title, Text, Paragraph } = Typography;

const parseTable = (tableString) => {
  // Split rows and columns, ignoring dashed lines
  const rows = tableString
    .trim()
    .split("\n")
    .filter((row) => !row.startsWith("|---"))
    .map((row) => row.split("|").map((cell) => cell.trim()));

  return rows;
};
const SkillTable = ({ skillMatchingTable }) => {
  console.log(skillMatchingTable);

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
const AiFitmentAnalysis = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [SkillExperience, setSkillExperience] = useState([" "]);
  const [loader, setLoader] = useState(false);
  const [addSkills, setAddSkills] = useState("");
  const [skillData, SetSkillData] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [aiScore, setAiScore] = useState(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [isAnalysed, setIsAnalysed] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  let token = localStorage.getItem("token");
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
  // handle input fields for key and responsibilities
  const handleSkillExperienceChange = (index, value) => {
    const updatedSkillExperience = [...SkillExperience];
    updatedSkillExperience[index] = value;
    setSkillExperience(updatedSkillExperience);
  };
  // add input fields for key and responsibilities
  const addSkillExperience = () => {
    setSkillExperience([...SkillExperience, ""]);
  };
  // to remove input fields for key and responsibilities
  const removeSkillExperience = (index) => {
    const updatedSkillExperience = [...SkillExperience];
    updatedSkillExperience.splice(index, 1);
    setSkillExperience(updatedSkillExperience);
  };

  // filter option for skills
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  // mapping the values in skill options to show values
  const skillOptions = skillData?.map((e, idx) => ({ value: e, label: e }));

  // fetching skills using api
  const fetchSkills = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/skills`);
      // console.log(data.country_city);
      let skills = data.skills.filter((skill) => skill.trim() !== ""); // Remove empty values
      skills = skills?.map((skill) => skill.toUpperCase());
      const uniqueSkills = [...new Set(skills)];
      SetSkillData(uniqueSkills.sort());
    } catch (error) {
      // console.log(error);
    }
  };
  // upload configuration for file upload
  const props = {
    onChange({ file }) {
      // When the file is selected, update the state with the file details
      // console.log("File selected:", file);
      // setErrors((prev) => ({ ...prev, resume: "" }));
      setFile(file); // Store the file locally
      setErrors((prev) => ({ ...prev, file: "" }));
    },
    beforeUpload: (file) => {
      // This prevents the automatic upload
      setFile(file); // Store the file in state
      setErrors((prev) => ({ ...prev, file: "" }));
      return false; // Prevent the file from being uploaded automatically
    },
    onRemove: (file) => {
      // This prevents the automatic upload
      // console.log("removed");
      setFile([]); // Store the file in state
    },
  };

  // AI Job description generation
  const completeAI = async () => {
    try {
      if (jobTitle) {
        setLoader(true);
        let formData = { jobTitle: jobTitle };
        const { data } = await axios.post(
          `${Server}/api/v1/parser/generate/description`,
          formData,
        );
        // console.log(data);
        setJobDescription(data?.jobDescription);
        setSkillExperience(data?.keySkills_responsibilities);
        setJobSkills(data?.skills);
        setErrors((prev) => ({
          ...prev,
          jobDescription: "",
          jobSkills: "",
          SkillExperience: "",
        }));
        setLoader(false);
      } else {
        toast.error("Please Enter  job title");
      }
    } catch (error) {
      // console.log(error);
      setLoader(false);
      toast.error("Internal Server Error");
    }
  };
  // adding skills if not stored in db
  const addSkill = async () => {
    try {
      const { data } = await axios.post(`${Server}/api/v1/data/addSkills`, {
        jobSkills: addSkills,
      });
      // console.log(data);
      setJobSkills([...jobSkills, addSkills]);
      fetchSkills();
      toast.success("skills added");
      setAddSkills("");
    } catch (error) {
      // console.log(error);
    }
  };
  // fetch skills at initial loading of the page
  useEffect(() => {
    fetchSkills();
  }, []);
  // fitment analyse Api
  const analyse = async (e) => {
    e.preventDefault();
    try {
      setSuccess(true);
      // console.log(SkillExperience);

      let isValid = true;
      const newErrors = {
        jobTitle: "",
        jobDescription: "",
        file: "",
        jobSkills: "",
        SkillExperience: "",
        errorCount: 0,
      };

      if (!jobTitle) {
        newErrors.jobTitle = "Job title Required.";
        newErrors.errorCount += 1;
        isValid = false;
      }
      if (!jobDescription) {
        newErrors.jobDescription = "Job description Required.";
        newErrors.errorCount += 1; // Increment error count
        isValid = false;
      }
      if (jobSkills.length === 0) {
        newErrors.jobSkills = "Skills Required";
        newErrors.errorCount += 1; // Increment error count
        isValid = false;
      }
      if (SkillExperience.length === 0) {
        newErrors.SkillExperience = "Key skills Required";

        newErrors.errorCount += 1; // Increment error count
        isValid = false;
      }
      if (!file) {
        newErrors.file = "Please Upload Resume";
        newErrors.errorCount += 1; // Increment error count
        isValid = false;
      }
      if (isValid) {
        const formData = new FormData();
        let jobDetails = {
          jobTitle: jobTitle,
          jobDescription: jobDescription,
          jobSkills: jobSkills,
          keySkills_responsibilities: SkillExperience,
        };
        formData.append("file", file);
        formData.append("jobDetails", JSON.stringify(jobDetails)); // Stringify the array
        // console.log(formData);
        const { data } = await axios.post(
          `${Server}/api/v1/ai/analyse/fitemnt`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // console.log(data);
        setSuccess(false);
        setAiResult(data.data);
        setAiScore(data.data.fitment_score);
        setIsAnalysed(true);
      } else {
        // console.log("new errors", newErrors);
        setSuccess(false);
        setErrors(newErrors);
        setIsAnalysed(false);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Internal server error");
      }
      // console.log(error);
      setSuccess(false);
      setIsAnalysed(false);
    }
  };
  // to show ai matching score
  const scoreProps = useSpring({
    opacity: aiScore !== null ? 1 : 0,
    transform: aiScore !== null ? "scale(1)" : "scale(0.8)",
    config: { duration: 500 },
  });

  // to show skill matching table in file
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

  // convert AI result to file  with download option
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

  // cancel Modal
  const handleModalCancel = () => {
    setIsResultModalVisible(false);
  };
  const reset = () => {
    setIsAnalysed(false);
    setFile(null);
    setJobSkills([]);
    setJobTitle("");
    setJobDescription("");
    setSkillExperience([" "]);
  };
  return (
    <SubscriptionGuard>
      {" "}
      <div>
        <section class="user-dashboard">
          <div class="dashboard-outer">
            <div class="upper-title-box">
              <h3>AI Fitment Analysis </h3>
            </div>
            <Toaster position="top-center" reverseOrder={false} />
            <div class="row">
              <div class="col-lg-12">
                <div class="ls-widget">
                  <div class="tabs-box">
                    <div class="widget-title">
                      <h4>Analyse resume with AI</h4>
                    </div>
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
                                ⚠️ We’re currently performing maintenance. This
                                features is temporarily unavailable. Our team is
                                actively working to restore full service soon.
                              </p>
                            </div>
                          }
                        />
                      </>
                    ) : isAnalysed ? (
                      <div>
                        <div>
                          <h1
                            style={{
                              textAlign: "center",
                              marginBottom: "18px",
                              fontSize: "30px",
                              fontWeight: "bold",
                            }}
                          >
                            Fitment Analysis Completed
                          </h1>
                          <h1
                            style={{
                              textAlign: "center",
                              marginBottom: "18px",
                              fontSize: "25px",
                              fontWeight: "bold",
                            }}
                          >
                            Matching Score : {`${aiScore}%`}
                          </h1>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            paddingBottom: "50px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            // style={{ }}
                            onClick={downloadPDF}
                            // className="blue-button"
                            style={{
                              background:
                                "linear-gradient(to right, #2563eb, #000000)",
                              color: "#ffffff",
                              marginRight: "15px",
                              marginTop: "15px",
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
                            Download Result
                          </Button>
                          <Button
                            // style={{ }}
                            onClick={() => setIsResultModalVisible(true)}
                            // className="blue-button"
                            style={{
                              background:
                                "linear-gradient(to right, #2563eb, #000000)",
                              color: "#ffffff",
                              fontWeight: 600,
                              padding: "8px 20px",
                              marginRight: "15px",
                              marginTop: "15px",
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
                            View Result
                          </Button>
                          <Button
                            // style={{  }}
                            onClick={reset}
                            // className="blue-button"
                            style={{
                              background:
                                "linear-gradient(to right, #2563eb, #000000)",
                              color: "#ffffff",
                              fontWeight: 600,
                              marginRight: "15px",
                              marginTop: "15px",
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
                            Back
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div class="widget-content">
                        <form class="default-form" onSubmit={analyse}>
                          <div class="row">
                            <div class="form-group col-lg-12 col-md-12">
                              <label htmlFor="jobTitle">
                                Job Title{" "}
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                id="jobTitle"
                                name="jobTitle"
                                value={jobTitle}
                                onChange={(e) => {
                                  setJobTitle(e.target.value);
                                  setErrors((prev) => ({
                                    ...prev,
                                    jobTitle: "",
                                  }));
                                }}
                              />
                              {errors.jobTitle && (
                                <p
                                  style={{ color: "#e74c3c", marginTop: "5px" }}
                                >
                                  {errors.jobTitle}
                                </p>
                              )}
                            </div>

                            <div class="form-group col-lg-12 col-md-12">
                              {" "}
                              <label htmlFor="jobDescription">
                                Job Description
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                {" "}
                                <Button
                                  type="primary"
                                  onClick={completeAI}
                                  loading={loader}
                                  disabled={loader}
                                >
                                  {loader
                                    ? "Generating..."
                                    : "Complete with AI"}
                                </Button>
                              </div>
                              <textarea
                                id="jobDescription"
                                name="jobDescription"
                                rows="4"
                                value={jobDescription}
                                onChange={(e) => {
                                  setJobDescription(e.target.value);
                                  setErrors((prev) => ({
                                    ...prev,
                                    jobDescription: "",
                                  }));
                                }}
                              ></textarea>
                              {errors.jobDescription && (
                                <p
                                  style={{ color: "#e74c3c", marginTop: "5px" }}
                                >
                                  {errors.jobDescription}
                                </p>
                              )}
                            </div>
                            <div className="form-group col-lg-12 col-md-12">
                              <label>
                                Key Skills
                                {/*<span style={{ color: "red" }}>*</span>*/}
                              </label>
                              {SkillExperience?.map(
                                (SkillExperience, index) => (
                                  <div
                                    key={index}
                                    className="responsibility-input"
                                  >
                                    <div className="responsibility-field">
                                      <input
                                        type="text"
                                        placeholder="Key Skills"
                                        value={SkillExperience}
                                        onChange={(e) =>
                                          handleSkillExperienceChange(
                                            index,
                                            e.target.value,
                                          )
                                        }
                                      />

                                      {index === 0 && ( // Show the "+" icon only for the first input field
                                        <button
                                          type="button"
                                          className="add-icon"
                                          onClick={addSkillExperience}
                                        >
                                          <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                      )}
                                      {index > 0 && ( // Show the "trash" icon for subsequent input fields
                                        <button
                                          type="button"
                                          className="delete-icon"
                                          onClick={() =>
                                            removeSkillExperience(index)
                                          }
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      )}
                                    </div>
                                    <br />
                                  </div>
                                ),
                              )}
                              {errors.SkillExperience && (
                                <p
                                  style={{ color: "#e74c3c", marginTop: "5px" }}
                                >
                                  {errors.SkillExperience}
                                </p>
                              )}
                            </div>
                            <div className="form-group col-lg-12 col-md-12">
                              <label>
                                Skills <span style={{ color: "red" }}>*</span>{" "}
                              </label>

                              <Select
                                showSearch
                                mode="multiple"
                                style={{ width: "100%", overflow: "scroll" }}
                                optionFilterProp="children"
                                virtual={false}
                                filterOption={filterOption}
                                className="custom-select"
                                placeholder="Select Skills"
                                options={skillOptions}
                                value={jobSkills}
                                onChange={(e) => {
                                  setJobSkills(e);
                                  setErrors((prev) => ({
                                    ...prev,
                                    jobSkills: "",
                                  }));
                                }}
                                dropdownRender={(menu) => (
                                  <>
                                    {menu}
                                    <Divider
                                      style={{
                                        margin: "8px 0",
                                      }}
                                    />
                                    <Space
                                      style={{
                                        padding: "0 8px 4px",
                                      }}
                                    >
                                      <Input
                                        placeholder="Please enter Skill"
                                        value={addSkills}
                                        // style={{height:"auto"}}
                                        onChange={(e) =>
                                          setAddSkills(e.target.value)
                                        }
                                        onKeyDown={(e) => e.stopPropagation()}
                                      />
                                      <Button
                                        type="text"
                                        icon={<PlusOutlined />}
                                        onClick={addSkill}
                                      >
                                        Add Skill
                                      </Button>
                                    </Space>
                                  </>
                                )}
                              />
                              {errors.jobSkills && (
                                <p
                                  style={{ color: "#e74c3c", marginTop: "5px" }}
                                >
                                  {errors.jobSkills}
                                </p>
                              )}
                            </div>

                            <div class="form-group col-lg-12 col-md-12">
                              <label
                                htmlFor="resumeUpload"
                                style={{
                                  display: "block",
                                  marginBottom: "20px",
                                }}
                              >
                                Upload Resume
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <Upload {...props}>
                                <Button
                                  size="large"
                                  icon={<UploadOutlined />}
                                  type="primary"
                                  // className="custom-upload-btn"
                                  // disabled={attachment.length !== 0}
                                >
                                  Upload
                                </Button>
                              </Upload>

                              {errors.file && (
                                <p
                                  style={{ color: "#e74c3c", marginTop: "5px" }}
                                >
                                  {errors.file}
                                </p>
                              )}
                            </div>

                            <div class="form-group col-lg-12 col-md-12"></div>
                            <div class="form-group col-lg-12 col-md-12">
                              <Button
                                type="primary"
                                size="large"
                                class="theme-btn btn-style-one"
                                loading={success}
                                disabled={success}
                                onClick={analyse}
                              >
                                {success ? "Analysing" : "Analyse"}
                              </Button>
                              {errors.file && (
                                <p
                                  style={{ color: "#e74c3c", marginTop: "5px" }}
                                >
                                  Mandatory fields Required
                                </p>
                              )}
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Modal
          title="AI Analysis Result"
          open={isResultModalVisible}
          onCancel={handleModalCancel}
          centered
          styles={{ textAlign: "center" }}
          width={1200}
          footer={[
            <Button
              key="download"
              onClick={downloadPDF}
              // className="custom-download-btn"
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
              // className="custom-cancel-btn"
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
        >
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
        </Modal>
        <div class="copyright-text">
          <p>© 2024 Skill Stream. All Right Reserved.</p>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default AiFitmentAnalysis;
{
  /*<div className="fitment-analysis-form">
       <div className="form-image">
        <img src={img} alt="Fitment Analysis" />
      </div>
      <div className="form-container">
        <h2>AI Fitment Analysis</h2>
        <form>
          <label htmlFor="jobTitle" style={{ color: "white" }}>
            Job Title
          </label>
          <input type="text" id="jobTitle" name="jobTitle" required />

          <label htmlFor="jobDescription" style={{ color: "white" }}>
            Job Description
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows="4"
            required
          ></textarea>

          <label htmlFor="keyResponsibilities" style={{ color: "white" }}>
            Key Responsibilities
          </label>
          <textarea
            id="keyResponsibilities"
            name="keyResponsibilities"
            rows="4"
            required
          ></textarea>

          <label htmlFor="resumeUpload" style={{ color: "white" }}>
            Upload Resume
          </label>
          <input
            type="file"
            id="resumeUpload"
            name="resumeUpload"
            accept=".pdf,.doc,.docx"
            style={{ color: "white" }}
            required
          />

          <button
            style={{
              display:
                "inline-block",
              marginTop: "1.5rem" ,
              marginBottom: "1rem" ,
              fontSize: "0.875rem" ,
              borderRadius:
                "9999px" ,
              padding:
                "0.5rem 1rem" ,
              boxShadow:
                "0 4px 15px rgba(66, 153, 225, 0.5)",
              transition:
                "all 0.3s ease-in-out" ,
              borderRadius: "10px" ,
              background:
                "linear-gradient(to right, #4299e1, #0070f3)" ,
              color: "#fff",
              cursor: "pointer" ,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to right, #4299e1, #0056a1)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(66, 153, 225, 0.7)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to right, #4299e1, #0070f3)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(66, 153, 225, 0.5)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>*/
}
{
  /**  const downloadPDF = async () => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text("AI Analysis Result", margin, yPosition);
    yPosition += 10;

    const sections = [
      {
        title: "Sales Pitch & Alignment",
        text: aiResult.sales_pitch_and_alignment,
      },
      { title: "Recommendation", text: aiResult.recommendation },
      {
        title: "Experience or Education Gaps",
        text: aiResult.experience_or_education_gaps,
      },
      { title: "Skills To Verify", text: aiResult.skills_to_verify },
    ];

    // Add Brief Summary with Heading
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Brief Summary:", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const briefSummary = aiResult.brief_summary;
    const briefLines = doc.splitTextToSize(briefSummary, pageWidth);
    briefLines.forEach((line) => {
      if (yPosition + 10 > doc.internal.pageSize.height) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 10;
    });

    // Add Short Summary with Heading
    if (yPosition + 10 > doc.internal.pageSize.height) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Short Summary:", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const shortSummary = aiResult.short_summary;
    const shortLines = doc.splitTextToSize(shortSummary, pageWidth);
    shortLines.forEach((line) => {
      if (yPosition + 10 > doc.internal.pageSize.height) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 10;
    });

    // Add Matching Score with Heading
    if (yPosition + 10 > doc.internal.pageSize.height) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Matching Score:", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const aiScore = aiResult.matching_score;
    doc.text(`Score: ${aiScore}`, margin, yPosition);
    yPosition += 10;

    // Add Skill Matching Table with Heading
    const skillMatchingTableMarkdown = aiResult.skill_matching_table;
    const skillMatchingTable = parseTableMarkdown(skillMatchingTableMarkdown);

    if (Array.isArray(skillMatchingTable) && skillMatchingTable.length > 0) {
      if (yPosition + 10 > doc.internal.pageSize.height) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Skill Matching Table:", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.autoTable({
        startY: yPosition,
        head: [skillMatchingTable[0]], // Header
        body: skillMatchingTable.slice(1), // Rows
        margin: { top: 10 },
      });
    } else {
      console.error("Invalid skill matching table data:", skillMatchingTable);
    }

    // Save the PDF
    doc.save(`analysis-result.pdf`);
  }; */
}
