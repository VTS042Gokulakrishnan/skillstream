// CVManagerFull.jsx
import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const s = localStorage.getItem("selectedFiles");
    return s ? JSON.parse(s) : [];
  });

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
              <div className="text">Manage Resumes Here !</div>
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

            {/* ORIGINAL UI (hidden when aiMode true) */}
            {!aiMode && !showUpload && (
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <h4>CV Manager</h4>
                </div>

                {loader ? (
                  <div style={{ textAlign: "center", padding: 36 }}>
                    <Spin />
                    <div style={{ marginTop: 12 }}>Loading your resume...</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    <Row gutter={[16, 16]}>
                      {/* If resume present, show it as a card in grid */}
                      {resume ? (
                        resumeDataType === "Array" ? (
                          resume
                            ?.slice() // prevent mutating original array
                            .sort((a, b) => {
                              if (a.type === "Primary") return -1;
                              if (b.type === "Primary") return 1;
                              return 0;
                            })
                            ?.map((res, idx) => (
                              <Col xs={24} sm={24} md={24} lg={24}>
                                <Card
                                  className="card-hover"
                                  hoverable
                                  style={{
                                    borderRadius: 12,
                                    padding: 16,
                                    // display: "flex",
                                    // alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      gap: 12,
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <FileIcon
                                      ext={res.resumeUrl
                                        .split(".")
                                        .pop()
                                        .toLowerCase()}
                                      style={{ marginRight: 12 }}
                                    />

                                    {/* FILENAME */}
                                    <div
                                      style={{
                                        flex: 1,
                                        fontWeight: 600,
                                        fontSize: 15,
                                      }}
                                    >
                                      {decodeURIComponent(
                                        res.resumeUrl.split("/").pop()
                                      )}
                                      {res.type === "Primary" && (
                                        <Tag
                                          color="geekblue"
                                          style={{ marginLeft: 8 }}
                                        >
                                          {res.type}
                                        </Tag>
                                      )}
                                    </div>

                                    {/* BUTTONS IN SAME LINE */}
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        gap: 8,
                                      }}
                                    >
                                      <Button
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                          openDrawerWith(res.resumeUrl)
                                        }
                                      >
                                        View
                                      </Button>

                                      <Button
                                        type="primary"
                                        onClick={() =>
                                          handleTryWithAI(res.resumeUrl)
                                        }
                                      >
                                        Enhance with AI
                                      </Button>
                                      {res.type !== "Primary" && (
                                        <Button
                                          loading={primaryLoader}
                                          onClick={() =>
                                            handleMakePrimary(res._id)
                                          }
                                        >
                                          Make primary
                                        </Button>
                                      )}

                                      <Button
                                        danger
                                        onClick={() => deleteResume(res._id)}
                                        icon={<DeleteOutlined />}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </Col>
                            ))
                        ) : (
                          <Col xs={24} sm={24} md={24} lg={24}>
                            <Card
                              className="card-hover"
                              hoverable
                              style={{
                                borderRadius: 12,
                                padding: 16,
                                // display: "flex",
                                // alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: 12,
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <FileIcon
                                  ext={resume.split(".").pop().toLowerCase()}
                                  style={{ marginRight: 12 }}
                                />

                                {/* FILENAME */}
                                <div
                                  style={{
                                    flex: 1,
                                    fontWeight: 600,
                                    fontSize: 15,
                                  }}
                                >
                                  {decodeURIComponent(resume.split("/").pop())}
                                </div>

                                {/* BUTTONS IN SAME LINE */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    gap: 8,
                                  }}
                                >
                                  <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => openDrawerWith(resume)}
                                  >
                                    View
                                  </Button>

                                  <Button
                                    type="primary"
                                    onClick={() => handleTryWithAI(resume)}
                                  >
                                    Try with AI
                                  </Button>

                                  <Button onClick={() => setShowUpload(true)}>
                                    Update
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        )
                      ) : (
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#999" }}>
                            No resume uploaded yet.
                          </div>
                          <Button
                            onClick={() => setShowUpload(true)}
                            style={{ marginTop: 8 }}
                          >
                            Upload
                          </Button>
                        </div>
                      )}
                    </Row>
                  </div>
                )}
              </div>
            )}
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

// AI generate flow (single-file)
// const handleTryWithAI = async () => {
//   if (!resume) {
//     toast.error("Upload a resume first to generate AI version");
//     return;
//   }

//   // start AI mode
//   setAiMode(true);
//   setAiLoading(true);
//   setAiStepIndex(0);
//   setAiPreviewUrl(null);

//   // animate stepper messages while awaiting backend:
//   // we'll advance steps every ~2s until response arrives
//   const stepInterval = 1800;
//   let intervalId = null;

//   try {
//     intervalId = setInterval(() => {
//       setAiStepIndex((prev) =>
//         prev < AI_STEPS.length - 1 ? prev + 1 : prev
//       );
//     }, stepInterval);

//     // call backend -> returns PDF bytes (arraybuffer)
//     const resp = await axios.post(
//       `${Server}/api/v1/contact/email/resume/writting`,
//       { resumeUrl: resume },
//       { responseType: "arraybuffer", timeout: 120000 }
//     );

//     // stop stepper
//     if (intervalId) {
//       clearInterval(intervalId);
//       intervalId = null;
//     }

//     // convert buffer to blob URL
//     const blob = new Blob([resp.data], {
//       type: resp.headers["content-type"] || "application/pdf",
//     });
//     const url = URL.createObjectURL(blob);

//     // finalize step
//     setAiStepIndex(AI_STEPS.length - 1);
//     // small delay to let the final message show
//     await new Promise((r) => setTimeout(r, 600));

//     setAiPreviewUrl(url);
//     setAiLoading(false);
//     setAiStepIndex(0);
//   } catch (err) {
//     console.error("AI generation error", err);
//     if (intervalId) clearInterval(intervalId);
//     setAiLoading(false);
//     setAiMode(false);
//     setAiStepIndex(0);
//     toast.error("AI generation failed");
//   }
// };
// const handleTryWithAI = async (resumeUrl) => {
//   if (!resume) {
//     toast.error("Upload a resume first to generate AI version");
//     return;
//   }

//   setAiMode(true);
//   setAiLoading(true);
//   setAiStepIndex(0);
//   setAiBasicPreview(null);
//   setAiTraditionalPreview(null);
//   setAiProgress(5);

//   let progressInterval, stepInterval;
//   setStepText("Extracting resume content...");
//   try {
//     stepInterval = setInterval(() => {
//       setAiStepIndex((prev) =>
//         prev < AI_STEPS.length - 1 ? prev + 1 : prev
//       );
//     }, 1800);
//     progressInterval = setInterval(() => {
//       setAiProgress((prev) => {
//         if (prev >= 95) return prev;
//         return prev + Math.floor(Math.random() * 5) + 3;
//       });
//     }, 600);
//     setStepText("Generating improved format...");
//     // ⬇⬇ NEW API CALL EXPECTING JSON ⬇⬇
//     const resp = await axios.post(
//       `${Server}/api/v1/contact/email/resume/writting`,
//       { resumeUrl }
//       // { timeout: 120000 }
//     );

//     clearInterval(progressInterval);
//     clearInterval(stepInterval);

//     setStepText("Finalizing your AI resume...");
//     await new Promise((r) => setTimeout(r, 1000));

//     // Convert base64 to Blob URL
//     const makeUrl = (base64, mime) => {
//       const byteChars = atob(base64);
//       const byteNumbers = Array.from(byteChars).map((c) => c.charCodeAt(0));
//       const byteArray = new Uint8Array(byteNumbers);
//       return URL.createObjectURL(new Blob([byteArray], { type: mime }));
//     };

//     const { basicResume, traditionalResume } = resp.data;
//     setAiProgress(100);
//     setStepText("Finalizing your AI resume...");

//     if (basicResume)
//       setAiBasicPreview(makeUrl(basicResume.base64, basicResume.mimeType));

//     if (traditionalResume)
//       setAiTraditionalPreview(
//         makeUrl(traditionalResume.base64, traditionalResume.mimeType)
//       );

//     setAiLoading(false);

//     setTimeout(() => {
//       setAiStepIndex(0);
//       setAiProgress(0);
//     }, 600);
//   } catch (err) {
//     console.error("AI generation failed", err);

//     clearInterval(progressInterval);
//     clearInterval(stepInterval);

//     setAiLoading(false);
//     setAiMode(false);
//     setAiStepIndex(0);
//     setAiProgress(0);

//     toast.error("AI generation failed");
//   }
// };

{
  /*
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import uniqid from "uniqid";
import axios from "axios";
import { Server } from "../../../App";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

// Keep your original styles or add CSS to match your app
const CVManager = () => {
  // existing states
  const [selectedfile, setSelectedFile] = useState(() => {
    const storedFiles = localStorage.getItem("selectedFiles");
    return storedFiles ? JSON.parse(storedFiles) : [];
  });
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [resume, setResume] = useState("");
  const [loader, setLoader] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // AI states
  const [aiLoading, setAiLoading] = useState(false); // generating
  const [aiResumes, setAiResumes] = useState([]); // [{ fileBase64, fileName, contentType, blobUrl }]
  const [expandedIndex, setExpandedIndex] = useState(null); // which card is expanded
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAiIndex, setSelectedAiIndex] = useState(null);

  const navigate = useNavigate();
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  let userId = localStorage.getItem("UserId");

  useEffect(() => {
    if (profileCompleted === "false") {
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    getallEmployers();
  }, []); // eslint-disable-line

  // fetch candidate data / resume URL
  const getallEmployers = async () => {
    setLoader(true);
    try {
      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      if (data?.Candidate && data.Candidate[0]?.resume) {
        setResume(data.Candidate[0].resume);
        setShowUpload(false);
      } else {
        setResume("");
        setShowUpload(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  // helper: pretty file size
  const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedFiles", JSON.stringify(selectedfile));
  }, [selectedfile]);

  // file input change
  const InputChange = (e) => {
    let documents = [];
    let unsupportedFiles = [];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const extension = file.name.split(".").pop().toLowerCase();
      if (["docx", "pdf", "doc"].includes(extension)) {
        documents.push(file);
        let reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFile((prevFiles) => {
            return [
              ...prevFiles,
              {
                id: uniqid(),
                file: file,
                filename: file.name,
                fileimage: reader.result,
                datetime: file.lastModifiedDate
                  ? file.lastModifiedDate.toLocaleString("en-IN")
                  : new Date().toLocaleString(),
                filesize: filesizes(file.size),
              },
            ];
          });
        };
        reader.readAsDataURL(file);
      } else {
        unsupportedFiles.push(file);
      }
    }

    if (unsupportedFiles.length > 0) {
      alert(
        "The following files are not supported: " +
          unsupportedFiles.map((file) => file.name).join(", ")
      );
    }
  };

  const DeleteSelectFile = (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const result = selectedfile.filter((data) => data.id !== id);
      setSelectedFile(result);
      setFilesUploaded(false);
    }
  };

  // existing handleUpload (upload original resume files to your server)
  const handleUpload = async (e) => {
    try {
      const formData = new FormData();
      selectedfile.forEach((fileData) => {
        formData.append("file", fileData.file);
      });
      const { data } = await axios.post(
        `${Server}/api/v1/upload/resume/candidate/${userId}`,
        formData
      );
      if (data.message === "Successfully updated profile") {
        toast.success("Uploaded Successfully");
        setFilesUploaded(true);
        getallEmployers();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error in Uploading Resume");
    }
  };

  const getFileTypeIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const fileTypes = {
      doc: "fa fa-file-word-o",
      docx: "fa fa-file-word-o",
      pdf: "fa fa-file-pdf-o",
    };
    return fileTypes[extension] || "fa fa-file-o";
  };

  // ---------- AI Flow ----------
  // helper: convert base64 string to blob url
  const base64ToBlobUrl = (base64, contentType = "application/pdf") => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    return URL.createObjectURL(blob);
  };

  // When user clicks Try with AI
  const handleTryWithAI = async () => {
    if (!resume) {
      toast.error("No resume found to use as input. Please upload one first.");
      return;
    }

    try {
      setAiLoading(true);
      setAiResumes([]);
      setExpandedIndex(null);
      setSelectedAiIndex(null);

      // send S3 URL to your backend
      const { data } = await axios.post(`${Server}/api/v1/ai/generate-resume`, {
        resumeUrl: resume,
        userId,
      }, {
        // server may take time; long timeout
        timeout: 120000,
      });

      // expecting data.files = [{ fileBase64, fileName, contentType }]
      if (!data || !Array.isArray(data.files) || data.files.length === 0) {
        toast.error("No AI resumes returned");
        setAiLoading(false);
        return;
      }

      // convert to blob URLs for preview
      const processed = data.files.map((f, idx) => {
        const contentType = f.contentType || "application/pdf";
        const blobUrl = base64ToBlobUrl(f.fileBase64, contentType);
        return {
          id: idx,
          fileBase64: f.fileBase64,
          fileName: f.fileName || `resume_ai_${idx + 1}.pdf`,
          contentType,
          blobUrl,
        };
      });

      setAiResumes(processed);
    } catch (err) {
      console.error("AI generate error", err);
      toast.error("AI resume generation failed. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Select -> open confirm modal
  const handleSelectAi = (index) => {
    setSelectedAiIndex(index);
    setConfirmModalOpen(true);
  };

  // Confirm & save to server
  const handleConfirmSave = async () => {
    if (selectedAiIndex === null) return;
    const file = aiResumes[selectedAiIndex];

    try {
      setLoader(true);
      // send base64 to server to save (backend should decode & upload to S3 & update candidate resume)
      const { data } = await axios.post(`${Server}/api/v1/ai/save-resume`, {
        userId,
        fileBase64: file.fileBase64,
        fileName: file.fileName,
        contentType: file.contentType,
      });

      if (data?.success) {
        toast.success("Resume saved successfully");
        setAiResumes([]);
        setSelectedAiIndex(null);
        setConfirmModalOpen(false);
        // refresh profile/resume
        await getallEmployers();
      } else {
        toast.error("Failed to save resume");
      }
    } catch (err) {
      console.error("Save AI resume error", err);
      toast.error("Failed to save resume");
    } finally {
      setLoader(false);
    }
  };

  // download chosen AI file
  const handleDownloadAi = (file) => {
    const a = document.createElement("a");
    a.href = file.blobUrl;
    a.download = file.fileName;
    a.click();
  };

  // ---------- Render ----------
  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <Toaster position="top-center" reverseOrder={false} />
            <h3>Cv Manager</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="cv-manager-widget ls-widget">
                <div className="widget-title">
                  <h4>Cv Manager</h4>
                </div>

                {loader ? (
                  <div className="text-center py-5">
                    <h5>Loading your resume...</h5>
                  </div>
                ) : (
                  <div className="widget-content">
              
                    {resume && !showUpload && (
                      <div className="existing-resume d-flex align-items-center justify-content-between border p-3 rounded bg-light">
                        <div className="d-flex align-items-center gap-2">
                          <i
                            className={getFileTypeIcon(resume)}
                            style={{ fontSize: "20px" }}
                          />
                          <span className="fw-semibold text-dark">
                            {resume.split("/").pop()}
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <a
                            href={resume}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button>View</Button>
                          </a>

                          <Button
                            type="primary"
                            onClick={() => setShowUpload(true)}
                          >
                            Update
                          </Button>

                      
                          <Button
                            onClick={handleTryWithAI}
                            style={{
                              background: "#722ed1",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            Try with AI
                          </Button>
                        </div>
                      </div>
                    )}

                 
                    {showUpload && (
                      <div className="uploading-resume">
                        <div className="uploadButton">
                          <input
                            className="uploadButton-input"
                            type="file"
                            name="attachments[]"
                            accept=".doc,.docx,application/pdf"
                            id="upload"
                            onChange={InputChange}
                            multiple
                          />
                          <label className="cv-uploadButton" htmlFor="upload">
                            <span className="title">Drop files here to upload</span>
                            <span className="text">
                              To upload file size is (Max 5Mb) and allowed file
                              types are (.doc, .docx, .pdf)
                            </span>
                            {selectedfile.length !== 0 && (
                              <button
                                className="theme-btn btn-style-one"
                                onClick={() => handleUpload()}
                              >
                                Upload Resume
                              </button>
                            )}
                          </label>
                        </div>
                      </div>
                    )}

            
                    <div className="files-outer">
                      {selectedfile?.map((data) => {
                        const {
                          id,
                          filename,
                          filetype,
                          fileimage,
                          datetime,
                          filesize,
                        } = data;
                        return (
                          <div className="file-edit-box" key={id}>
                            <span className="title">{filename}</span>
                            <span className="file-icon">
                              <i className={getFileTypeIcon(filename)} />
                            </span>
                            <div className="edit-btns">
                              <button onClick={() => DeleteSelectFile(id)}>
                                <span className="la la-trash" />
                              </button>
                              <button>
                                <span className="la la-edit" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                 
                    {aiLoading && (
                      <div className="my-4 text-center">
                        <Spin size="large" />
                        <h5 className="mt-3">Generating ATS-friendly resumes...</h5>
                        <p>Please wait — this may take a few moments.</p>
                      </div>
                    )}

                    {aiResumes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-3">AI Generated Resumes</h4>

                        <div className="row">
                          {aiResumes.map((file, idx) => {
                            const isExpanded = expandedIndex === idx;
                            const isSelected = selectedAiIndex === idx;
                            return (
                              <div className="col-md-4 mb-3" key={file.id || idx}>
                                <div
                                  className="card p-2 shadow-sm"
                                  style={{
                                    border: isSelected
                                      ? "2px solid #722ed1"
                                      : "1px solid #ddd",
                                    cursor: "pointer",
                                    borderRadius: 10,
                                    minHeight: 380,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                  }}
                                  onClick={() => {
                                    // toggle expand
                                    setExpandedIndex(isExpanded ? null : idx);
                                  }}
                                >
                                  <div>
                                    <h6 className="text-center">Resume {idx + 1}</h6>

                                  
                                    <div
                                      style={{
                                        width: "100%",
                                        height: isExpanded ? 380 : 240,
                                        overflow: "hidden",
                                        border: "1px solid #eee",
                                        borderRadius: 8,
                                        background: "#fff",
                                      }}
                                    >
                                      {file.contentType?.includes("pdf") ? (
                                        <iframe
                                          title={`ai-resume-${idx}`}
                                          src={file.blobUrl}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                          }}
                                        />
                                      ) : file.contentType?.includes("word")
                                        ? (
                                          <div
                                            style={{
                                              padding: 12,
                                              display: "flex",
                                              flexDirection: "column",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              height: "100%",
                                            }}
                                          >
                                            <p>
                                              Preview for DOCX is not available inline.
                                            </p>
                                            <Button
                                              icon={<DownloadOutlined />}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadAi(file);
                                              }}
                                            >
                                              Download
                                            </Button>
                                          </div>
                                        ) : (
                                          <div
                                            style={{
                                              padding: 12,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              height: "100%",
                                            }}
                                          >
                                            <p>Cannot preview this file type.</p>
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  <div style={{ marginTop: 12 }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <small>{file.fileName}</small>
                                      <div style={{ display: "flex", gap: 8 }}>
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadAi(file);
                                          }}
                                        >
                                          Download
                                        </Button>

                                        <Button
                                          type="primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAiIndex(idx);
                                            setConfirmModalOpen(true);
                                          }}
                                        >
                                          Select Resume
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="copyright-text">
        <p>© 2024 Skill Stream. All Right Reserved.</p>
      </div>


      <Modal
        title="Confirm Selection"
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        onOk={handleConfirmSave}
        okText="Use this Resume"
        okButtonProps={{ style: { background: "#722ed1", border: "none" } }}
      >
        <p>Are you sure you want to use this AI generated resume as your profile resume?</p>
      </Modal>
    </div>
  );
};

export default CVManager;*/
}

{
  /*import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import uniqid from "uniqid";
import axios from "axios";
import { Server } from "../../../App";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
// import "./CVManager.css"; // Import your CSS file for styling

const CVManager = () => {
  const [selectedfile, setSelectedFile] = useState(() => {
    const storedFiles = localStorage.getItem("selectedFiles");
    return storedFiles ? JSON.parse(storedFiles) : [];
  });
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [resume, setResume] = useState("");
  const [loader, setLoader] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  let userId = localStorage.getItem("UserId");

  useEffect(() => {
    if (profileCompleted === "false") {
      // console.log(typeof profileCompleted);
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []);
  useEffect(() => {
    getallEmployers();
  }, []);
  const getallEmployers = async () => {
    setLoader(true);
    try {
      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      if (data?.Candidate[0].resume) {
        console.log(data?.Candidate[0].resume);
        setResume(data?.Candidate[0].resume);
        setShowUpload(false);
      } else {
        setResume("");
        setShowUpload(true);
      }
      setLoader(false);
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };
  const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedFiles", JSON.stringify(selectedfile));
  }, [selectedfile]);

  const InputChange = (e) => {
    let documents = [];
    let unsupportedFiles = [];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const extension = file.name.split(".").pop().toLowerCase();
      if (["docx", "pdf"].includes(extension)) {
        documents.push(file);
        let reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFile((prevFiles) => {
            return [
              ...prevFiles,
              {
                id: uniqid(),
                file: file,
                filename: file.name,
                fileimage: reader.result,
                datetime: file.lastModifiedDate.toLocaleString("en-IN"),
                filesize: filesizes(file.size),
              },
            ];
          });
        };
        reader.readAsDataURL(file);
      } else {
        unsupportedFiles.push(file);
      }
    }

    if (unsupportedFiles.length > 0) {
      // console.log("Unsupported files:", unsupportedFiles);
      alert(
        "The following files are not supported: " +
          unsupportedFiles.map((file) => file.name).join(", ")
      );
    }
  };

  const DeleteSelectFile = (id) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const result = selectedfile.filter((data) => data.id !== id);
      setSelectedFile(result);
      setFilesUploaded(false);
    }
  };

  // console.log(selectedfile);
  // console.log(userId);

  const handleUpload = async (e) => {
    try {
      const formData = new FormData();
      selectedfile.forEach((fileData) => {
        formData.append("file", fileData.file);
      });
      const { data } = await axios.post(
        `${Server}/api/v1/upload/resume/candidate/${userId}`,
        formData
      );
      // console.log(data);
      if (data.message === "Successfully updated profile") {
        toast.success("Uploaded Successfully");
        setFilesUploaded(true);
      }
    } catch (error) {
      // console.log(error);
      toast.error("Error in Uploading Resume");
    }
  };

  const getFileTypeIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const fileTypes = {
      doc: "fa fa-file-word-o",
      docx: "fa fa-file-word-o",
      pdf: "fa fa-file-pdf-o",
    };
    return fileTypes[extension] || "fa fa-file-o";
  };

  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <Toaster position="top-center" reverseOrder={false} />
            <h3>Cv Manager</h3>
            <div class="text">Ready to jump back in?</div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <div class="cv-manager-widget ls-widget">
                <div class="widget-title">
                  <h4>Cv Manager</h4>
                </div>
                {loader ? (
                  <div className="text-center py-5">
                    <h5>Loading your resume...</h5>
                  </div>
                ) : (
                  <div class="widget-content">
                    {resume && !showUpload && (
                      <div className="existing-resume d-flex align-items-center justify-content-between border p-3 rounded bg-light">
                        <div className="d-flex align-items-center gap-2">
                          <i
                            className={getFileTypeIcon(resume)}
                            style={{ fontSize: "20px" }}
                          ></i>
                          <span className="fw-semibold text-dark">
                            {resume.split("/").pop()}{" "}
                            
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <a
                            href={resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            // className="theme-btn btn-style-one btn-sm"
                          >
                            <Button color="purple" variant="solid">
                              View
                            </Button>
                          </a>
                          <Button
                            type="primary"
                            // className="theme-btn btn-style-two btn-sm"
                            onClick={() => setShowUpload(true)}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    )}

                    {showUpload && (
                      <div class="uploading-resume">
                        <div class="uploadButton">
                          <input
                            class="uploadButton-input"
                            type="file"
                            name="attachments[]"
                            accept="image/*, application/pdf"
                            id="upload"
                            onChange={InputChange}
                            multiple
                          />
                          <label class="cv-uploadButton" for="upload">
                            <span class="title">Drop files here to upload</span>
                            <span class="text">
                              To upload file size is (Max 5Mb) and allowed file
                              types are (.doc, .docx, .pdf)
                            </span>
                            {selectedfile.length !== 0 && (
                              <button
                                class="theme-btn btn-style-one"
                                onClick={() => handleUpload()}
                              >
                                Upload Resume
                              </button>
                            )}
                          </label>
                          <span class="uploadButton-file-name"></span>
                        </div>
                      </div>
                    )}

                    <div class="files-outer">
                      {selectedfile?.map((data, index) => {
                        const {
                          id,
                          filename,
                          filetype,
                          fileimage,
                          datetime,
                          filesize,
                        } = data;

                        return (
                          <div class="file-edit-box" key={id}>
                            <span class="title">{filename}</span>
                            <span class="file-icon">
                              <i className={getFileTypeIcon(filename)}></i>
                            </span>
                            <div class="edit-btns">
                              <button onClick={() => DeleteSelectFile(id)}>
                                <span class="la la-trash"></span>
                              </button>
                              <button>
                                <span class="la la-edit"></span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="copyright-text">
        <p>© 2024 Skill Stream. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default CVManager;
*/
}
