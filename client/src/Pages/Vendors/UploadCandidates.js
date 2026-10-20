import React, { useState } from "react";
import { Upload, Button, message, Divider } from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { Server } from "App";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload;

const UploadCandidates = () => {
  const [resumes, setResumes] = useState([]);
  const [workAuthDocs, setWorkAuthDocs] = useState({});
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("UserId");

  const handleResumeChange = ({ fileList }) => {
    setResumes(fileList);
    setWorkAuthDocs({});
  };

  const handleWorkAuthUpload = (resumeUid, file) => {
    setWorkAuthDocs((prev) => ({
      ...prev,
      [resumeUid]: file,
    }));
    message.success("Work authorization uploaded.");
  };

  const handleFinalUpload = async () => {
    if (resumes.length === 0)
      return toast.error("Please upload at least one resume.");
    const allHaveWorkAuth = resumes.every((r) => workAuthDocs[r.uid]);
    if (!allHaveWorkAuth)
      return toast.error("Please upload work authorization for all resumes.");

    const formData = new FormData();
    resumes.forEach((resume) => {
      formData.append("resumes", resume.originFileObj);
      formData.append("workAuthDocs", workAuthDocs[resume.uid]);
    });

    try {
      setUploading(true);
      const { data } = await axios.post(
        `${Server}/api/v1/vendor/upload/candidates/${userId}`,
        formData
      );
      if (data.status) {
        toast.success("All files uploaded successfully!");
        setResumes([]);
        setWorkAuthDocs({});
        navigate("/vendor/manage/candidates");
      } else {
        toast.error(data.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading files.");
    } finally {
      setUploading(false);
    }
  };

  const resumeUploadProps = {
    multiple: true,
    accept: ".pdf,.docx",
    beforeUpload: (file) => {
      const isValidType = [
        "application/pdf",
        
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.type);
      if (!isValidType) {
        message.error(`${file.name} is not a valid resume format`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: ({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0),
    onChange: handleResumeChange,
    onRemove: (file) => {
      setWorkAuthDocs((prev) => {
        const newDocs = { ...prev };
        delete newDocs[file.uid];
        return newDocs;
      });
    },
  };

  const renderWorkAuthUploader = (resume) => (
    <div key={resume.uid} style={{ marginBottom: 16 }}>
      <p>
        <strong>Resume:</strong> {resume.name}
      </p>
      <Upload
        maxCount={1}
        showUploadList={false}
        accept=".pdf,.doc,.docx"
        beforeUpload={(file) => {
          handleWorkAuthUpload(resume.uid, file);
          return false; // prevent auto-upload
        }}
      >
        <Button icon={<UploadOutlined />}>
          {workAuthDocs[resume.uid]
            ? "Replace Work Auth"
            : "Upload Work Authorization"}
        </Button>
      </Upload>
      <Divider />
    </div>
  );

  return (
    <div className="container mt-5">
      <Toaster position="top-center" />
      <h2 className="mb-4">Upload Candidates</h2>

      <Dragger
        {...resumeUploadProps}
        fileList={resumes}
        style={{ padding: 24 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag resumes to upload</p>
        <p className="ant-upload-hint">Supported: .doc, .docx, .pdf</p>
      </Dragger>

      {resumes.length > 0 && (
        <div className="mt-4">
          <h4>Upload Work Authorization for Each Resume</h4>
          {resumes.map((resume) => renderWorkAuthUploader(resume))}
        </div>
      )}

      <div className="text-center mt-4">
        <Button
          type="primary"
          onClick={handleFinalUpload}
          disabled={
            uploading ||
            resumes.length === 0 ||
            resumes.some((r) => !workAuthDocs[r.uid])
          }
          loading={uploading}
        >
          {uploading ? "Uploading..." : "Upload All Files"}
        </Button>
      </div>
    </div>
  );
};

export default UploadCandidates;

// import React, { useState, useEffect } from "react";
// import { Upload, Button, message } from "antd";
// import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
// import { Toaster, toast } from "react-hot-toast";
// import axios from "axios";
// import { Server } from "App";
// import { useNavigate } from "react-router-dom";

// const { Dragger } = Upload;

// const UploadCandidates = () => {
//   const [fileList, setFileList] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const navigate = useNavigate();

//   const userId = localStorage.getItem("UserId");
//   const profileCompleted = localStorage.getItem("ProfileCompleted");
//   const role = localStorage.getItem("Role");

//   const handleUpload = async () => {
//     if (fileList.length === 0) return toast.error("No files to upload");
//     const formData = new FormData();
//     fileList.forEach((file) => {
//       formData.append("file", file.originFileObj);
//     });

//     try {
//       setUploading(true);
//       const { data } = await axios.post(
//         `${Server}/api/v1/vendor/upload/candidates/${userId}`,
//         formData
//       );

//       if (data.status) {
//         toast.success("Uploaded Successfully");
//         setFileList([]);
//         navigate("/vendor/manage/candidates");
//       } else {
//         toast.error(data.message || "Upload failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error uploading files");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const props = {
//     name: "file",
//     multiple: true,
//     accept: ".docx,.pdf",
//     beforeUpload: (file) => {
//       const isValid = [
//         "application/pdf",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ].includes(file.type);
//       if (!isValid) {
//         message.error(`${file.name} is not a supported file type`);
//         return Upload.LIST_IGNORE;
//       }
//       return true;
//     },
//     customRequest: ({ onSuccess }) => {
//       // Prevents actual upload, lets us handle it manually
//       setTimeout(() => {
//         onSuccess("ok");
//       }, 0);
//     },
//     onChange(info) {
//       setFileList(info.fileList);
//     },
//     onRemove(file) {
//       setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
//     },
//   };

//   return (
//     <div className="container mt-5">
//       <Toaster position="top-center" reverseOrder={false} />
//       <h2 className="mb-4">Upload Candidates</h2>
//       <Dragger {...props} style={{ padding: 24 }}>
//         <p className="ant-upload-drag-icon">
//           <InboxOutlined />
//         </p>
//         <p className="ant-upload-text">
//           Click or drag resumes to this area to upload
//         </p>
//         <p className="ant-upload-hint">
//           Supports .doc, .docx, .pdf files. Max size 5MB per file.
//         </p>
//       </Dragger>

//       <div className="text-center mt-4">
//         <Button
//           type="primary"
//           onClick={handleUpload}
//           disabled={fileList.length === 0 || uploading}
//           loading={uploading}
//         >
//           {uploading ? "Uploading..." : "Upload Resumes"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default UploadCandidates;
