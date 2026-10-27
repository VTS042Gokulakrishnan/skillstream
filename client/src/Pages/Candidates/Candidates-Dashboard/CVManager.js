// CVManagerFull.jsx
import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { PageHeading } from "../../../Components/CandidateUI/PortalUI";
import uniqid from "uniqid";
import axios from "axios";
import { Server } from "../../../App";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Modal,
  Spin,
  Drawer,
  Row,
  Col,
  Skeleton,
  Progress,
  Tag,
} from "antd";
import {
  LoadingOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";

/*
  Full-featured CVManager with:
  - modern dropzone card upload (grid)
  - two-column responsive cards
  - PDF thumbnail preview (iframe-clipped)
  - Drawer view (right)
  - Confirm modal on "Use"
  - AI flow with stepper text messages & animation
  - Skeleton loaders & glow hover effect
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const CVManager = () => {
  // uploaded files stored locally before upload
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [previewResume, setPreviewResume] = useState("");
  const [resume, setResume] = useState("");
  const [allResume, setAllResume] = useState(null); // candidate current stored resume (S3 URL)
  // candidate current stored resume (S3 URL)
  const [loader, setLoader] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // AI states
  const [aiMode, setAiMode] = useState(false); // when AI flow active (hides original UI)
  const [aiLoading, setAiLoading] = useState(false); // during generation
  const [aiStepIndex, setAiStepIndex] = useState(0); // 0..n stepper
  const [stepText, setStepText] = useState("");
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null); // blob url of returned PDF
  const [selectedResumeType, setSelectedResumeType] = useState(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [resumeDataType, setResumeDataType] = useState("");
  // Drawer for viewing any file
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerUrl, setDrawerUrl] = useState(null);
  const [deleteFileId, setDeleteFileId] = useState(false);
  const [aiBasicPreview, setAiBasicPreview] = useState(null);
  const [aiTraditionalPreview, setAiTraditionalPreview] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(true);
  const [uploadingLoad, setUploadingLoad] = useState(false);
  const [primaryLoader, setPrimaryLoader] = useState(false);

  // const
  const navigate = useNavigate();
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  let userId = localStorage.getItem("UserId");

  // step messages for AI flow
  const AI_STEPS = [
    "Extracting resume content...",
    "Generating improved format...",
    "Finalizing your AI resume...",
  ];

  useEffect(() => {
    if (profileCompleted === "false") {
      if (role === "Candidate") navigate("/my-profile");
      else navigate("/company-profile");
    }
  }, []); // eslint-disable-line
  const handleTryWithAI = async (resumeUrl) => {
    if (!resume) {
      toast.error("Upload a resume first to generate AI version");
      return;
    }

    setAiMode(true);
    setAiLoading(true);
    setAiStepIndex(0);
    setAiBasicPreview(null);
    setAiTraditionalPreview(null);
    setAiProgress(5);
    setStepText("Extracting resume content...");

    let progressInterval = null;
    let stepInterval = null;

    try {
      // 🟦 Step text rotation
      stepInterval = setInterval(() => {
        setAiStepIndex((prev) =>
          prev < AI_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 2000);

      // 🟩 REALISTIC PROGRESS ENGINE (40s–60s total)
      progressInterval = setInterval(() => {
        setAiProgress((prev) => {
          // Fast initial growth to 40%
          if (prev < 40) return prev + 3;

          // Medium speed 40 → 70
          if (prev < 70) return prev + 1;

          // Very slow 70 → 85
          if (prev < 85) return prev + 0.3;

          return prev; // hold at 85 until API finishes
        });
      }, 500);

      // ----------------------------
      // 🔥 CALL YOUR API
      // ----------------------------
      setStepText("Generating improved format…");

      const resp = await axios.post(
        `${Server}/api/v1/contact/email/resume/writting`,
        { resumeUrl }
        // { timeout: 120000 }
      );

      // API has finished → stop progress engine
      clearInterval(progressInterval);
      clearInterval(stepInterval);

      // Finish progress
      setAiProgress(100);
      setStepText("Finalizing your AI resume…");

      await new Promise((r) => setTimeout(r, 1200));

      // ----------------------------
      // 🔥 Convert Buffer → Blob
      // ----------------------------
      const makeUrl = (base64, mime) => {
        const byteChars = atob(base64);
        const byteNumbers = Array.from(byteChars).map((c) => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        return URL.createObjectURL(new Blob([byteArray], { type: mime }));
      };

      const { basicResume, traditionalResume } = resp.data;

      if (basicResume)
        setAiBasicPreview(makeUrl(basicResume.base64, basicResume.mimeType));

      if (traditionalResume)
        setAiTraditionalPreview(
          makeUrl(traditionalResume.base64, traditionalResume.mimeType)
        );

      setAiLoading(false);

      setTimeout(() => {
        setAiStepIndex(0);
        setAiProgress(0);
      }, 800);
    } catch (err) {
      console.error("AI generation failed", err);

      clearInterval(progressInterval);
      clearInterval(stepInterval);

      setAiLoading(false);
      setAiMode(false);
      setAiStepIndex(0);
      setAiProgress(0);

      toast.error("AI generation failed");
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, []); // eslint-disable-line
  const deleteResume = async (resumeId) => {
    Modal.confirm({
      title: "Delete this resume?",
      onOk: async () => {
        try {
          const { data } = await axios.delete(
            `${Server}/api/v1/upload/delete/resume/${userId}`,
            { data: { resumeId } }
          );

          // setAllResumes(data.allResumes);
          setResume(data.allResumes);
          fetchCandidate();
          toast.success("Resume deleted");
        } catch (err) {
          toast.error("Failed to delete");
        }
      },
    });
  };
  const handleMakePrimary = async (resumeId) => {
    try {
      setPrimaryLoader(true);
      const { data } = await axios.post(
        `${Server}/api/v1/upload/make/primary/${userId}`,
        { resumeId: resumeId }
      );
      toast.success("Primary Resume Changed");
      fetchCandidate();
      setPrimaryLoader(false);
    } catch (error) {
      console.log(error);
      setPrimaryLoader(false);
      toast.error("Error in making resume primary");
    }
  };
  useEffect(() => {
    localStorage.setItem("selectedFiles", JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const fetchCandidate = async () => {
    setLoader(true);
    try {
      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      console.log(data?.Candidate?.[0].resume);

      if (
        data?.Candidate?.[0]?.allResumes &&
        data?.Candidate?.[0]?.allResumes.length !== 0
      ) {
        setResume(data.Candidate[0].allResumes);
        setShowUpload(false);
        setResumeDataType("Array");
      } else if (data?.Candidate?.[0]?.resume) {
        console.log(data?.Candidate?.[0]?.resume);

        setResume(data.Candidate[0].resume);
        setShowUpload(false);
        setResumeDataType("String");
      } else {
        setResume("");
        setShowUpload(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoader(false);
    }
  };

  // helper: readable size
  const humanSize = (bytes) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
  };

  // file input/change (dropzone sim)
  const fileInputRef = useRef(null);
  const onSelectFiles = (e) => {
    const files = e.target.files;
    handleFiles(files);
    e.target.value = null;
  };

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList);
    const next = [];
    for (const f of arr) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!["pdf", "docx", "doc"].includes(ext)) {
        toast.error(`${f.name}: unsupported file type`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: exceeds 5MB`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: uniqid(),
            file: f,
            name: f.name,
            size: f.size,
            dataUrl: ev.target.result,
            ext,
          },
        ]);
      };
      reader.readAsDataURL(f);
    }
  };

  const removeUploadedFile = (id) => {
    // if (!window.confirm("Remove this file?")) return;
    setUploadedFiles((p) => p.filter((x) => x.id !== id));
  };
  const handleShowDeleteModal = (id) => {
    setDeleteConfirmVisible(true);
    setDeleteFileId(id);
  };
  // upload selected files to your server
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }
    const form = new FormData();
    uploadedFiles.forEach((f) => form.append("file", f.file));
    try {
      setUploadingLoad(true);
      const { data } = await axios.post(
        `${Server}/api/v1/upload/resume/candidate/${userId}`,
        form
      );
      if (data?.message) {
        toast.success("Uploaded successfully");
        setUploadedFiles([]);
        fetchCandidate();
        setShowUpload(false);
        setUploadingLoad();
      } else {
        toast.error("Upload failed");
        setUploadingLoad(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploadingLoad(false);
    } finally {
      setUploadingLoad(false);
    }
  };

  // opens drawer to view URL
  const openDrawerWith = (url) => {
    setDrawerUrl(url);
    setDrawerLoading(true);
    setDrawerOpen(true);
  };

  // Save AI resume (example: send blob to server or inform backend to persist)
  const handleUseAi = async () => {
    try {
      setLoader(true);
      const selectedUrl =
        selectedResumeType === "basic" ? aiBasicPreview : aiTraditionalPreview;
      // 1️⃣ Fetch blob
      const blob = await fetch(selectedUrl).then((res) => res.blob());

      // 2️⃣ Convert to File
      const file = new File([blob], "resume_ai.pdf", {
        type: "application/pdf",
      });

      // 3️⃣ Prepare FormData for Formidable backend
      const formData = new FormData();
      formData.append("file", file);

      // 4️⃣ Send to backend
      const { data } = await axios.post(
        `${Server}/api/v1/upload/store/enhance/resume/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.success) {
        toast.success("AI resume saved");

        // Close modal AFTER upload success
        setConfirmVisible(false);

        setAiMode(false);
        setAiPreviewUrl(null);
        setLoader(false);

        fetchCandidate(); // reload list
      } else {
        toast.error("Save failed");
        setLoader(false);
      }
    } catch (err) {
      console.error(err);
      setLoader(false);

      toast.error("Save failed");
    } finally {
      // END loader → Modal auto closes because confirmLoading reads this
      setLoader(false);
    }
  };

  // const handleUseAi = async () => {
  //   // you may want to send base64 or re-fetch blob and upload
  //   // For demo, we'll call your save endpoint expecting it to accept resumeUrl or base64
  //   try {
  //     setLoader(true);
  //     // Option A: send blob as arrayBuffer -> base64
  //     const resBlob = await fetch(aiPreviewUrl).then((r) => r.arrayBuffer());
  //     const b64 = btoa(
  //       new Uint8Array(resBlob).reduce(
  //         (data, byte) => data + String.fromCharCode(byte),
  //         ""
  //       )
  //     );

  //     const payload = {
  //       fileBase64: b64,
  //       fileName: "resume_ai.pdf",
  //       contentType: "application/pdf",
  //     };

  //     const { data } = await axios.post(
  //       `${Server}/api/v1/contact/email/store/enhance/resume/${userId}`,
  //       payload
  //     );

  //     if (data?.success) {
  //       toast.success("AI resume saved");
  //       setConfirmVisible(false);
  //       setLoader(false);
  //       setAiMode(false);
  //       setAiPreviewUrl(null);
  //       fetchCandidate();
  //     } else {
  //       toast.error("Save failed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Save failed");
  //   } finally {
  //     setLoader(false);
  //     setConfirmVisible(false);
  //   }
  // };

  // helper: show icon by ext
  const FileIcon = ({ ext }) => {
    if (!ext) return <FilePdfOutlined style={{ fontSize: 36 }} />;
    if (ext === "pdf")
      return <FilePdfOutlined style={{ fontSize: 36, color: "#cf1322" }} />;
    return <FileWordOutlined style={{ fontSize: 36, color: "#1677ff" }} />;
  };

  // styles for animation (fade+slide)
  const animatedEnter = {
    animation: "fadeSlideIn 400ms ease forwards",
  };

  // CSS keyframes injected via style tag (component-level)
  const Keyframes = () => (
    <style>{`
      @keyframes fadeSlideIn {
        0% { opacity: 0; transform: translateY(10px) translateX(-6px); }
        100% { opacity: 1; transform: translateY(0) translateX(0); }
      }
      .card-hover {
        transition: box-shadow 0.25s, transform 0.15s;
      }
      .card-hover:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 30px rgba(24,144,255,0.15);
      }
      .thumb-frame {
        width: 100%;
        height: 140px;
        border: none;
        overflow: hidden;
      }
      .thumb-clip {
        width: 100%;
        height: 140px;
        border-radius: 6px;
        overflow: hidden;
        background: #fff;
        border: 1px solid #eee;
      }
      .dropzone {
        border: 2px dashed #e6f7ff;
        padding: 18px;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: box-shadow .2s, border-color .2s;
      }
      .dropzone:hover {
        box-shadow: 0 6px 20px rgba(24,144,255,0.06);
        border-color: #91d5ff;
      }
    `}</style>
  );

  return (
    <>
      <Keyframes />
      <div>
        <section className="user-dashboard">
          <div className="dashboard-outer" style={{ paddingBottom: "80px" }}>
            <div className="upper-title-box">
              <Toaster />
              <h3>CV Manager</h3>
              <div className="text">
                Keep your saved resume ready for your next opportunity.
              </div>
            </div>

            {/* AI loader screen     AI_STEPS[aiStepIndex] */}
            {aiMode && aiLoading && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 60,
                  paddingTop: "80px",
                  paddingBottom: "80px",
                }}
              >
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 44 }} spin />}
                />

                <h3 style={{ marginTop: 18 }}>{stepText}</h3>
                <div style={{ width: 320, margin: "18px auto" }}>
                  {/*<Progress
                    percent={Math.round(
                      ((aiStepIndex + 1) / AI_STEPS.length) * 100
                    )}
                  />
                 */}
                  <Progress
                    percent={Math.floor(aiProgress)}
                    status={aiProgress === 100 ? "success" : "active"}
                    strokeWidth={10}
                  />
                </div>
              </div>
            )}

            {/* AI result card small preview (centered) */}
            {aiMode &&
              !aiLoading &&
              (aiBasicPreview || aiTraditionalPreview) && (
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: 12,
                    }}
                  >
                    <Button
                      danger
                      onClick={() => {
                        setAiMode(false);
                        setAiBasicPreview(null);
                        setAiTraditionalPreview(null);
                      }}
                    >
                      Back
                    </Button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      justifyContent: "center",
                    }}
                  >
                    {/* BASIC RESUME */}
                    {aiBasicPreview && (
                      <Card
                        className="card-hover"
                        hoverable
                        style={{
                          width: 300,
                          textAlign: "center",
                          borderRadius: 12,
                          ...animatedEnter,
                        }}
                      >
                        <div style={{ marginBottom: 12 }}>
                          <FileIcon ext={"pdf"} />
                        </div>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                          ATS Basic Resume
                        </div>

                        <div
                          className="thumb-clip"
                          style={{ marginBottom: 12 }}
                        >
                          <iframe
                            className="thumb-frame"
                            src={aiBasicPreview + "#page=1&zoom=auto"}
                            title="basicThumb"
                          ></iframe>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                          <Button
                            block
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setAiPreviewUrl(aiBasicPreview);
                              setAiDrawerOpen(true);
                            }}
                          >
                            View
                          </Button>

                          <Button
                            block
                            type="primary"
                            onClick={() => {
                              setSelectedResumeType("basic");
                              setConfirmVisible(true);
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* TRADITIONAL RESUME */}
                    {aiTraditionalPreview && (
                      <Card
                        className="card-hover"
                        hoverable
                        style={{
                          width: 300,
                          textAlign: "center",
                          borderRadius: 12,
                          ...animatedEnter,
                        }}
                      >
                        <div style={{ marginBottom: 12 }}>
                          <FileIcon ext={"pdf"} />
                        </div>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                          ATS Traditional Resume
                        </div>

                        <div
                          className="thumb-clip"
                          style={{ marginBottom: 12 }}
                        >
                          <iframe
                            className="thumb-frame"
                            src={aiTraditionalPreview + "#page=1&zoom=auto"}
                            title="tradThumb"
                          ></iframe>
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                          <Button
                            block
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setAiPreviewUrl(aiTraditionalPreview);
                              setAiDrawerOpen(true);
                            }}
                          >
                            View
                          </Button>

                          <Button
                            block
                            type="primary"
                            onClick={() => {
                              setSelectedResumeType("traditional");
                              setConfirmVisible(true);
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Drawer for preview */}
                  <Drawer
                    title="AI Enhanced Resume"
                    placement="right"
                    width="70%"
                    open={aiDrawerOpen}
                    onClose={() => setAiDrawerOpen(false)}
                    bodyStyle={{ padding: 0 }}
                  >
                    <iframe
                      src={aiPreviewUrl}
                      style={{ width: "100%", height: "100vh", border: "none" }}
                    />
                  </Drawer>
                </div>
              )}

            {!aiMode &&
              !showUpload &&
              (loader ? (
                <div className="ss-card ss-card-padding">
                  <Skeleton active />
                </div>
              ) : (
                <div className="ss-resume-grid">
                  <section className="ss-card ss-card-padding">
                    <div
                      className="ss-toolbar"
                      style={{ padding: 0, marginBottom: 20 }}
                    >
                      <h2>My resumes</h2>
                      <Button onClick={() => setShowUpload(true)}>
                        {resume ? "Change resume" : "Upload resume"}
                      </Button>
                    </div>
                    {(Array.isArray(resume)
                      ? [...resume].sort(
                          (a, b) =>
                            (b.type === "Primary") - (a.type === "Primary")
                        )
                      : resume
                      ? [{ resumeUrl: resume, type: "Primary" }]
                      : []
                    ).map((res, idx) => (
                      <article className="ss-resume-row" key={res._id || idx}>
                        <div className="ss-job-identity">
                          <FilePdfOutlined
                            style={{ fontSize: 30, color: "#1478ed" }}
                          />
                          <div style={{ overflowWrap: "anywhere" }}>
                            <strong>
                              {res.resumeUrl?.split("/").pop()?.split("?")[0] ||
                                "Saved resume"}
                            </strong>
                            {res.type === "Primary" && (
                              <Tag color="blue">Primary</Tag>
                            )}
                          </div>
                        </div>
                        <div className="ss-actions">
                          <Button
                            onClick={() => setPreviewResume(res.resumeUrl)}
                          >
                            Preview
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => handleTryWithAI(res.resumeUrl)}
                          >
                            Try with AI
                          </Button>
                          {res._id && res.type !== "Primary" && (
                            <Button
                              loading={primaryLoader}
                              onClick={() => handleMakePrimary(res._id)}
                            >
                              Make primary
                            </Button>
                          )}
                          {res._id && (
                            <Button
                              danger
                              aria-label="Delete resume"
                              icon={<DeleteOutlined />}
                              onClick={() => deleteResume(res._id)}
                            />
                          )}
                        </div>
                      </article>
                    ))}
                    <p
                      style={{ color: "#6c7e96", fontSize: 13, marginTop: 20 }}
                    >
                      Your primary resume is used for practice interviews.
                      Choose Change resume when you want to upload an updated
                      file.
                    </p>
                  </section>
                  <section className="ss-card ss-card-padding">
                    <h2>Resume preview</h2>
                    {(() => {
                      const url =
                        previewResume ||
                        (Array.isArray(resume)
                          ? (
                              resume.find((r) => r.type === "Primary") ||
                              resume[0]
                            )?.resumeUrl
                          : resume);
                      return url ? (
                        <>
                          <iframe
                            title="Saved resume preview"
                            className="ss-resume-preview"
                            src={
                              /\.pdf(?:[?#]|$)/i.test(url)
                                ? url
                                : "https://docs.google.com/gview?embedded=true&url=" +
                                  encodeURIComponent(url)
                            }
                          />
                          <a className="ss-button ss-resume-open" href={url} target="_blank" rel="noreferrer">
                            Open resume in a new tab ↗
                          </a>
                        </>
                      ) : (
                        <p>Select a resume to preview it here.</p>
                      );
                    })()}
                  </section>
                </div>
              ))}
            {/* upload dropzone + grid of uploaded files */}
            {showUpload && (
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 12,
                  }}
                >
                  <Button
                    danger
                    onClick={() => {
                      setShowUpload(false);
                    }}
                  >
                    Back
                  </Button>
                </div>
                <div
                  className="dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    style={{ display: "none" }}
                    onChange={onSelectFiles}
                  />
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    <UploadOutlined /> &nbsp; Drop or click to upload
                  </div>
                  <div style={{ color: "#666" }}>
                    Max 5MB per file. Allowed: .pdf, .doc, .docx
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Row gutter={[12, 12]}>
                      {uploadedFiles.map((f) => (
                        <Col xs={24} sm={12} md={12} lg={12} key={f.id}>
                          <Card className="card-hover" hoverable>
                            <div style={{ display: "flex", gap: 12 }}>
                              <div>
                                <FileIcon ext={f.ext} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{f.name}</div>
                                <div
                                  style={{
                                    color: "#777",
                                    fontSize: 13,
                                  }}
                                >
                                  {humanSize(f.size)}
                                </div>
                                <div
                                  style={{
                                    marginTop: 8,
                                    display: "flex",
                                    gap: 8,
                                  }}
                                >
                                  <Button
                                    size="small"
                                    onClick={() => openDrawerWith(f.dataUrl)}
                                    icon={<EyeOutlined />}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="small"
                                    danger
                                    onClick={() => handleShowDeleteModal(f.id)}
                                    icon={<DeleteOutlined />}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <Button
                        type="primary"
                        onClick={handleUpload}
                        loading={uploadingLoad}
                        disabled={uploadingLoad}
                      >
                        Upload Selected
                      </Button>
                      <Button onClick={() => setUploadedFiles([])}>
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
        {/* drawer for general viewing */}
        <Drawer
          title="Resume Preview"
          placement="right"
          width="70%"
          open={drawerOpen}
          onClose={() => {
            setDrawerUrl(null);
            setDrawerOpen(false);
          }}
          bodyStyle={{ padding: 0 }}
        >
          {drawerUrl ? (
            drawerUrl.startsWith("data:") ? (
              // local dataUrl
              <iframe
                src={drawerUrl}
                style={{ width: "100%", height: "100vh", border: "none" }}
              />
            ) : (
              <iframe
                src={drawerUrl}
                style={{ width: "100%", height: "100vh", border: "none" }}
              />
            )
          ) : (
            <div style={{ padding: 20 }}>
              <Skeleton active />
            </div>
          )}
        </Drawer>
        <Modal
          title="Delete Resume"
          open={deleteConfirmVisible}
          onOk={() => {
            setDeleteConfirmVisible(false);
            removeUploadedFile(deleteFileId);
          }}
          onCancel={() => setDeleteConfirmVisible(false)}
          okText="Delete"
        >
          <p>Are you sure you want to delete the uploaded file</p>
        </Modal>
        <Modal
          title="Use this Resume?"
          open={confirmVisible}
          confirmLoading={loader} // loader from handleUseAi
          onOk={async () => {
            setLoader(true); // start loading
            await handleUseAi(); // call your function
            // ❗ DO NOT close modal here — handleUseAi() closes it after loader false
          }}
          onCancel={() => setConfirmVisible(false)}
          okText="Yes, Use It"
        />
      </div>
    </>
  );
};

export default CVManager;
