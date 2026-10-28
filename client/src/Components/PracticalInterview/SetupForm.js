import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import practiceApi from "./practiceApi";
import { Server } from "App";
import { Toaster, toast } from "react-hot-toast";
import logo from "../../assets/logo-twos.png";

const SetupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { round } = location.state || {};

  const [mode, setMode] = useState("manual");
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
  const props = {
    onChange({ file }) {
      setAttachment(file.originFileObj || file);
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
    practiceApi
      .get("/access")
      .then(({ data }) => {
        if (!(isCoding ? data.access.canCoding : data.access.canVideo)) {
          navigate("/practiceInterview", { replace: true });
        } else fetchAppliedJobs();
      })
      .catch(() => navigate("/practiceInterview", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findJobdetails = async (e) => {
    setErrors((prev) => ({ ...prev, jobTitle: "" }));
    const jobId = e.target.value;
    setSelectedJob(jobId);
    setJobTitle("");
    setJobDescription("");
    if (!jobId) return;
    try {
      const job = appliedJobs.find((j) => j.jobId === jobId);
      if (!job) return;

      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/singleJob/${job.employerId}/${job.jobId}`
      );

      setJobTitle(job?.JobTitle);

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

    if (!resumeFetched && !(attachment instanceof File)) {
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
      await practiceApi.post("/sessions", {
        type: isCoding ? "coding" : "video",
        requestId,
      });
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
      toast.error(
        error.response?.data?.message ||
          "Error preparing your interview. Please try again."
      );
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
    <main className="ss-setup">
      <Toaster position="top-center" />
      <button
        className="ss-back"
        onClick={() => navigate("/practiceInterview")}
      >
        ← Back to practice
      </button>
      <section className="ss-card">
        <header className="ss-setup-top">
          <div className="ss-setup-brand"><img src={logo} alt="SkillStream" /><span>{isCoding ? "Coding practice" : "Video practice"}</span></div>
          <ol className="ss-steps">
            <li className="active">
              1 <span>Setup</span>
            </li>
            <li>
              2 <span>Device check</span>
            </li>
            <li>
              3 <span>Interview</span>
            </li>
            <li>
              4 <span>Results</span>
            </li>
          </ol>
        </header>
        <form onSubmit={handleSubmit} className="ss-setup-form">
          <h1>Set up {isCoding ? "coding" : "video"} practice</h1>
          <p>
            Tell us about the role you want to practise. We’ll tailor your
            interview to the job and your resume.
          </p>
          <div className="ss-segment" role="group" aria-label="Job source">
            {[
              ["applied", "Applied job"],
              ["manual", "Enter manually"],
            ].map(([value, label]) => (
              <button
                type="button"
                className={mode === value ? "active" : ""}
                key={value}
                onClick={() => {
                  setMode(value);
                  setJobTitle("");
                  setJobDescription("");
                  setSelectedJob("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ss-setup-fields">
            <div className="ss-setup-details">
          {mode === "applied" ? (
            <label className="ss-field">
              Select applied job
              <select value={selectedJob || ""} onChange={findJobdetails}>
                <option value="">Choose a job</option>
                {appliedJobs.map((job) => (
                  <option key={job.jobId} value={job.jobId}>
                    {job.JobTitle}
                  </option>
                ))}
              </select>
              {!appliedJobs.length && (
                <small>
                  No applied jobs yet. Choose Enter manually to continue.
                </small>
              )}
            </label>
          ) : (
            <label className="ss-field">
              Job title
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
              />
            </label>
          )}
          {errors.jobTitle && (
            <p className="ss-field-error" role="alert">
              {errors.jobTitle}
            </p>
          )}
          {isCoding && (
            <fieldset className="ss-difficulty">
              <legend>Difficulty level</legend>
              <div className="ss-segment">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={codingLevel === level ? "active" : ""}
                    onClick={() => setCodingLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {errors.codingLevel && (
                <p className="ss-field-error">{errors.codingLevel}</p>
              )}
            </fieldset>
          )}
          <div className="ss-field">
            <span>Your resume</span>
            {resumeFetched && resume ? (
              <div className="ss-saved-resume">
                <span>
                  ▤ Saved resume <b>Primary</b>
                </span>
                <div className="ss-actions">
                  <a href={resume} target="_blank" rel="noreferrer">
                    Preview ↗
                  </a>
                  <button
                    type="button"
                    className="ss-ai-link"
                    onClick={handleResumeDelete}
                  >
                    Change resume
                  </button>
                </div>
              </div>
            ) : (
              <Upload {...props} accept=".pdf,.doc,.docx" maxCount={1}>
                <Button icon={<UploadOutlined />}>Choose resume</Button>
              </Upload>
            )}
            {errors.resume && <p className="ss-field-error">{errors.resume}</p>}
          </div>
            </div>
            <div className="ss-setup-description">
          <label className="ss-field">
            Role description
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe the responsibilities and skills for this role."
            />
          </label>
          {mode === "manual" && (
            <button
              className="ss-ai-link"
              type="button"
              disabled={loader || submitting}
              onClick={completeAI}
            >
              {loader ? "Generating description…" : "✧ Complete with AI"}
            </button>
          )}
          {errors.jobDescription && (
            <p className="ss-field-error" role="alert">
              {errors.jobDescription}
            </p>
          )}
            </div>
          </div>
          <div className="ss-setup-actions">
          <div className="ss-info">
            ⓘ Your camera, microphone and screen will be recorded during
            practice.
          </div>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={submitting}
            disabled={loader}
          >
            {submitting
              ? "Preparing your interview…"
              : "Continue to device check →"}
          </Button>
          {submitting && (
            <p role="status" className="ss-preparing-note">
              Preparing your role and resume. Please keep this tab open.
            </p>
          )}
          </div>
        </form>
      </section>
    </main>
  );
};
export default SetupForm;
