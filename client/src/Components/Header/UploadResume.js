import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Modal, Spin } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import { Select, Space } from "antd";
import axios from "axios";
import uniqid from "uniqid";
import { Server } from "../../App";

const UploadResume = ({ uploadResume, setUploadResume }) => {
  const [resume, SetResume] = useState([]);
  const handleCancel = () => {
    setUploadResume(false);
  };
  const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const ResumeInputChange = (e) => {
    // console.log("hi");
    // --For Multiple File Input
    let resumes = [];
    for (let i = 0; i < e.target.files.length; i++) {
      resumes.push(e.target.files[i]);
      let reader = new FileReader();
      let file = e.target.files[i];
      reader.onloadend = () => {
        SetResume((preValue) => {
          return [
            ...preValue,
            {
              id: uniqid(),
              file: file,
              filename: e.target.files[i].name,
              fileimage: reader.result,
              datetime:
                e.target.files[i].lastModifiedDate.toLocaleString("en-IN"),
              filesize: filesizes(e.target.files[i].size),
            },
          ];
        });
      };
      if (e.target.files[i]) {
        reader.readAsDataURL(file);
      }
    }
  };

  const DeleteSelectResume = (id) => {
    if (window.confirm("Are you sure you want to delete this File?")) {
      const result = resume.filter((data) => data.id !== id);
      SetResume(result);
    } else {
      // alert('No');
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      resume.forEach((fileData) => {
        formData.append("file", fileData.file); // Append the file object
      });
      let userId = localStorage.getItem("UserId");
      const uploadResume = await axios.post(
        `${Server}/api/v1/upload/resume/candidate/${userId}`,
        formData
      );
      // console.log(uploadResume.data);

      // console.log(data);
      toast.success("Profile Updated Successfully");
      setTimeout(() => {
        setUploadResume(false);
      }, 300);
      //   window.location.reload();
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div>
      <Modal
        centered
        open={uploadResume}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {" "}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div className="resume-modal">
            <h2>Upload Resume</h2>
            <form className="form-resume" onSubmit={handleUpload}>
              <div>
                <label className="head-nav">Upload Resume</label>
                <div class="uploading-resume">
                  <div class="uploadButton">
                    <input
                      class="uploadButton-input"
                      type="file"
                      name="attachments[]"
                      accept="application/pdf"
                      id="upload"
                      onChange={ResumeInputChange}
                      multiple
                    />
                    <label class="cv-uploadButton" for="upload">
                      <span class="title">Drop files here to upload</span>
                      <span class="text">
                        To upload file size is (Max 5Mb) and allowed file types
                        are (.doc, .docx, .pdf)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div
                className="mob-order"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "20px",
                }}
              >
                <div class="files-outer">
                  {resume?.map((data, index) => {
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
                        <span class="title">{data.filename}</span>
                        <div class="edit-btns">
                          <button onClick={() => DeleteSelectResume(id)}>
                            <span class="la la-trash"></span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="theme-btn btn-style-two" type="submit">
                  <span className="submit-resume">Submit Resume</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UploadResume;
