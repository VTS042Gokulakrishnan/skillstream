import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Button, Upload, message } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import practiceApi from "./practiceApi";
import { Server } from "App";
import backgroundImage from "../../assets/abstract-design-background-smooth-flowing-lines.jpg";
import backgroundImageOne from "../../assets/down.jpeg";
import { Toaster, toast } from "react-hot-toast";

const SetupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { round } = location.state || {};

  const [showForm, setShowForm] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [mode, setMode] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [attachment, setAttachment] = useState([]);
  const [resume, setResume] = useState(null);
  const [resumeFetched, setResumeFetched] = useState(false);
  const [loader, setLoader] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [codingLevel, setCodingLevel] = useState(null);
  const [errors, setErrors] = useState({
    jobTitle: "",
    jobDescription: "",
    resume: "",
    codingLevel: "",
  });

  const isCoding = round?.toLowerCase() === "coding";
  const buttonText = isCoding
    ? "Start Coding Practice"
    : "Start Practice Video Interview";
  const submitText = isCoding
    ? "Generate Coding Questions"
    : "Generate Questions";

  const videoInstructions = [
    "Ensure your webcam and microphone are working properly.",
    "Enable screen recording permissions when prompted.",
    'Click "Next Question" for each question and answer thoroughly.',
    "Recording captures video and audio — choose a quiet, well-lit environment.",
    'Do not click "Stop Sharing" during the interview.',
  ];

  const codingInstructions = [
    "Ensure your webcam and microphone are working properly.",
    "Enable screen recording permissions when prompted.",
    'Write your code for each question, click "Run" to see output, then click "Submit".',
    "Recording captures video and audio — choose a quiet, well-lit environment.",
    'Do not click "Stop Sharing" during the session.',
  ];

  const props = {
    onChange({ file }) {
      setAttachment(file);
      setErrors((prev) => ({ ...prev, resume: "" }));
    },
    beforeUpload: (file) => {
      setAttachment(file);
      return false;
    },
    onRemove: () => {
      setAttachment([]);
    },
  };

  // Fetch applied jobs (for Applied Jobs mode)
  const fetchAppliedJobs = async () => {
    try {
      const userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/candidate/jobs/getJob/${userId}`
      );
      const jobs = data?.appliedJobs?.appliedJobs || [];
      setAppliedJobs(jobs);
      if (data?.resume) {
        setResume(data.resume);
        setResumeFetched(true);
      } else {
        setResume(null);
        setResumeFetched(false);
      }
    } catch (error) {
      toast.error("Failed to fetch applied jobs");
    }
  };
  useEffect(() => {
    practiceApi.get("/access").then(({ data }) => {
      if (!(isCoding ? data.access.canCoding : data.access.canVideo)) {
        navigate("/practiceInterview", { replace: true });
      } else fetchAppliedJobs();
    }).catch(() => navigate("/practiceInterview", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeSelect = async (type) => {
    setMode(type);
    if (type === "applied") await fetchAppliedJobs();
  };

  const findJobdetails = async (e) => {
    setErrors((prev) => ({ ...prev, jobTitle: "" }));
    const jobId = e.target.value;
    setSelectedJob(jobId);
    if (!jobId) return;
    try {
      const job = appliedJobs.find((j) => j.jobId === jobId);
      if (!job) return;

      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/singleJob/${job.employerId}/${job.jobId}`
      );

      setJobTitle(job?.JobTitle);
      console.log(data?.jobs[0]?.JobDescription);

      setJobDescription(data?.jobs[0]?.JobDescription || "");

      // Set resume if exists
    } catch (error) {
      toast.error("Failed to fetch job details");
    }
  };

  const handleResumeDelete = () => {
    setResume(null);
    setResumeFetched(false);
    toast.success("Resume removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(attachment);
    let valid = true;
    const newErrors = { jobTitle: "", jobDescription: "", resume: "" };

    if (!jobTitle) {
      newErrors.jobTitle = "Please enter a job title.";
      valid = false;
    }
    if (!jobDescription && mode === "manual") {
      newErrors.jobDescription = "Job description required.";
      valid = false;
    }

    if (!resumeFetched && attachment.length === 0) {
      newErrors.resume = "Please upload a resume.";
      valid = false;
    }
    if (isCoding && !codingLevel) {
      newErrors.codingLevel = "Coding Level is required";
      valid = false;
    }
    setErrors(newErrors);
    if (!valid) return;

    const requestId = uuidv4();
    try {
      setSubmitting(true);
      await practiceApi.post("/sessions", { type: isCoding ? "coding" : "video", requestId });
      const formData = new FormData();
      formData.append("file", resumeFetched ? resume : attachment);
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);
      if (isCoding) {
        formData.append("level", codingLevel);
      }

      // toast.success("Questions generated successfully");
      const { data } = await practiceApi.post("/upload", formData, {
        headers: { "X-Practice-Session": requestId },
      });
      console.log(data);
      setShowModeModal(false);
      setShowForm(false);
      setMode(null);
      setSubmitting(false);
      if (isCoding) {
        navigate("/coding-practice", {
          state: {
            practiceSessionId: requestId,
            jobTitle,
            resume_text: data?.resume_text,
            job_description_text: data?.job_description_text,
            level: codingLevel,
          },
        });
      } else {
        navigate("/practical-interview", {
          state: {
            practiceSessionId: requestId,
            jobTitle,
            resume_text: data?.resume_text,
            job_description_text: data?.job_description_text,
          },
        });
      }
    } catch (error) {
      console.log(error);
      await practiceApi.post(`/sessions/${requestId}/cancel`).catch(() => {});
      toast.error(error.response?.data?.message || "Error preparing your interview. Please try again.");
      if (error.response?.status === 402) navigate("/practiceInterview");
    } finally {
      setSubmitting(false);
    }
  };

  const completeAI = async () => {
    if (!jobTitle) {
      setErrors((prev) => ({ ...prev, jobTitle: "Please enter job title" }));
      return;
    }
    try {
      setLoader(true);
      const { data } = await axios.post(
        `${Server}/api/v1/parser/generate/description`,
        {
          jobTitle,
        }
      );
      setJobDescription(data?.jobDescription || "");
      toast.success("Job description generated");
    } catch {
      toast.error("Failed to generate job description");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Panel */}
      <div
        style={{
          flex: "1",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "20px",
            padding: "30px",
            maxWidth: "520px",
          }}
        >
          <h2 style={{ textAlign: "center", fontWeight: "bold" }}>
            {isCoding
              ? "Welcome to Coding Practice"
              : "Welcome to Video Practice Assessment"}
          </h2>
          <ul style={{ marginTop: "20px", fontWeight: "bold" }}>
            {(isCoding ? codingInstructions : videoInstructions).map(
              (line, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
                  {line}
                </li>
              )
            )}
          </ul>
          <p style={{ color: "blue", marginTop: "15px" }}>
            Get started and step into your next interview with confidence!
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: "1",
          backgroundImage: `url(${backgroundImageOne})`,
          backgroundSize: "cover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!showForm ? (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => setShowModeModal(true)}
              style={{
                backgroundColor: "#1d4ed8",
                color: "#fff",
                padding: "12px 25px",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {buttonText}
            </button>
          </div>
        ) : null}
      </div>

      {/* Mode Selection Modal */}
      <Modal
        title="Choose Practice Mode"
        open={showModeModal}
        onCancel={() => {
          setMode(null);
          setShowModeModal(false);
          setSelectedJob(null);
          setJobTitle(null);
          setErrors({
            jobTitle: "",
            jobDescription: "",
            resume: "",
            codingLevel: "",
          });
        }}
        footer={null}
        centered
      >
        {!mode ? (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Button type="primary" onClick={() => handleModeSelect("applied")}>
              Prepare for Applied Jobs
            </Button>
            <Button onClick={() => handleModeSelect("manual")}>
              Prepare Manually
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {mode === "applied" ? (
              <>
                <label style={{ fontWeight: 600 }}>Select Job</label>
                <select
                  value={selectedJob || ""}
                  onChange={(e) => findJobdetails(e)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginBottom: "15px",
                  }}
                >
                  <option value="">Select Job</option>
                  {appliedJobs.map((job) => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.JobTitle}
                    </option>
                  ))}
                </select>
                {errors.jobTitle && (
                  <p style={{ color: "#e74c3c", marginTop: "2px" }}>
                    {errors.jobTitle}
                  </p>
                )}
              </>
            ) : (
              <>
                <label style={{ fontWeight: 600 }}>Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, jobTitle: "" }));
                  }}
                  placeholder="Enter Job Title"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginBottom: "15px",
                  }}
                />
                {errors.jobTitle && (
                  <p style={{ color: "#e74c3c", marginTop: "2px" }}>
                    {errors.jobTitle}
                  </p>
                )}
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label style={{ fontWeight: 600 }}>Job Description</label>
                  <Button
                    type="primary"
                    onClick={completeAI}
                    disabled={loader}
                    style={{ marginBottom: "15px" }}
                  >
                    {loader ? "Fetching..." : "Complete with AI"}
                  </Button>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setErrors((prev) => ({ ...prev, jobDescription: "" }));
                  }}
                  placeholder="Enter Job Description"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    height: "100px",
                    marginBottom: "15px",
                  }}
                />
                {errors.jobDescription && (
                  <p style={{ color: "#e74c3c", marginTop: "2px" }}>
                    {errors.jobDescription}
                  </p>
                )}
              </>
            )}
            {isCoding && (
              <>
                {" "}
                <label style={{ fontWeight: 600 }}>Select level</label>
                <select
                  value={codingLevel || ""}
                  onChange={(e) => {
                    setCodingLevel(e.target.value);
                    setErrors((prev) => ({ ...prev, codingLevel: "" }));
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    marginBottom: "15px",
                  }}
                >
                  <option value="">Select Coding level</option>

                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {errors.codingLevel && (
                  <p style={{ color: "#e74c3c", marginTop: "2px" }}>
                    {errors.codingLevel}
                  </p>
                )}
              </>
            )}
            {/* Resume Section */}
            <label style={{ fontWeight: 600 }}>Resume</label>
            {resumeFetched && resume ? (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "8px",
                  background: "#f9f9f9",
                }}
              >
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1d4ed8", textDecoration: "underline" }}
                >
                  {resume.split("/").pop()}
                </a>
                <DeleteOutlined
                  onClick={handleResumeDelete}
                  style={{ color: "red", cursor: "pointer", fontSize: "16px" }}
                />
              </div>
            ) : (
              <Upload {...props}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            )}
            {errors.resume && (
              <p style={{ color: "#e74c3c", marginTop: "2px" }}>
                {errors.resume}
              </p>
            )}

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ width: "100%", marginTop: "20px" }}
            >
              {submitText}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SetupForm;

{
  /* <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "20px",
                textAlign:"center",
              }}
            >
              Ace your next interview
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "20px",
                color: "#000",
              }}
            >
              Prepare for your next big opportunity with confidence! Our
              AI-powered platform helps you simulate real-world interview
              scenarios, providing you with instant feedback and personalized
              tips to sharpen your skills. Whether you're prepping for your
              first interview or a seasoned professional aiming to refine your
              responses, we’ve got you covered.
            </p>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              What can you expect?
            </p>
            <ul
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              <li>
                <b>Realistic Interview Questions:</b> Practice with commonly
                asked questions tailored to your industry or role.
              </li>
              <li>
                <b>AI-Powered Feedback:</b> Receive instant insights on your
                communication, body language, and overall performance.
              </li>
              <li>
                <b>Customizable Sessions:</b> Choose your difficulty level,
                interview type, and time limits to match your needs.
              </li>
              <li>
                <b>Track Your Progress:</b> Review your performance over time
                and identify areas for improvement.
              </li>
            </ul>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              Get started today and step into your next interview feeling
              confident, prepared, and polished!
            </p> */
}

{
  /* <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "700",
                }}
              >
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max={poolQuestions.length}
                value={numQuestions}
                onChange={(e) => {
                  setNumQuestions(parseInt(e.target.value, 10));
                  setErrors((prev) => ({ ...prev, numQuestions: "" }));
                }}
                placeholder={`1-${poolQuestions.length}`}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: `1px solid ${
                    errors.numQuestions ? "#e74c3c" : "#ccc"
                  }`,
                }}
              />
              {errors.numQuestions && (
                <p style={{ color: "#e74c3c", marginTop: "5px" }}>
                  {errors.numQuestions}
                </p>
              )}
            </div> */
}
