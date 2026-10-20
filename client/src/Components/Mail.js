import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Modal, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import { Select, Space } from "antd";
import { Server } from "App";
// import { LoaderIcon, Toaster, toast } from "react-hot-toast";

import axios from "axios";
const Mail = (modalOpen) => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [message, setMessage] = useState("");
  const handleCancel = () => {
    modalOpen.setModalOpen(false);
  };
  const props = {
    onChange({ file }) {
      // When the file is selected, update the state with the file details
      // console.log("File selected:", file);
      setAttachment(file); // Store the file locally
    },
    beforeUpload: (file) => {
      // This prevents the automatic upload
      setAttachment(file); // Store the file in state
      return false; // Prevent the file from being uploaded automatically
    },
  };
  // console.log(subject, message);
  let token = localStorage.getItem("token");
  const templates = {
    job_alert: {
      label: "Job Opportunity Alert",
      subject: "Exciting Job Opportunity for You!",
      message: `Dear Candidate,\n\nWe found a job that matches your profile. Please check it out here:\n[JOB_URL]`,
    },

    custom: {
      label: "Custom",
      subject: "",
      message: "",
    },
  };
  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    // console.log(attachment);

    try {
      // let body = {

      //   from: modalOpen.fromEmail,
      //   emails: modalOpen.selectedEmails,
      //   subject: subject,
      //   message: message,
      //   attachment: attachment,
      // };
      const formData = new FormData();
      formData.append("from", modalOpen.fromEmail);
      formData.append("emails", JSON.stringify(modalOpen.selectedEmails)); // Stringify the array
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("region", "United States");

      // Attach the file
      if (attachment) {
        formData.append("attachment", attachment);
      }
      const { data } = await axios.post(
        `${Server}/api/v1/employer/send/email`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      setLoading(false);
      toast.success("Email Sent");
      setTimeout(() => {
        modalOpen.setModalOpen(false);
      }, 1000);
    } catch (error) {
      // console.log(error);
      setLoading(false);
      toast.error("Internal Server Error");
    }
  };
  return (
    <div>
      {" "}
      <Modal
        centered
        open={modalOpen.modalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {" "}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="modal-body">
          <form role="form" class="form-horizontal" onSubmit={sendEmail}>
            <div class="form-group">
              <label class="col-lg-2 control-label">From</label>
              <div class="col-lg-12">
                <input
                  type="text"
                  placeholder=""
                  id="inputEmail1"
                  class="form-control"
                  value={modalOpen.fromEmail}
                />
              </div>
            </div>
            <div class="form-group">
              <label class="col-lg-2 control-label">To</label>
              <div class="col-lg-12">
                <input
                  type="text"
                  placeholder=""
                  id="inputEmail1"
                  class="form-control"
                  value={modalOpen.selectedEmails}
                />
              </div>
            </div>
            {/* <div class="form-group">
              <label class="col-lg-2 control-label">Cc / Bcc</label>
              <div class="col-lg-12">
                <input
                  type="text"
                  placeholder=""
                  id="cc"
                  class="form-control"
                />
              </div>
            </div> */}
            <div className="form-group">
              <label className="col-lg-2 control-label">Template</label>
              <div className="col-lg-12">
                <Select
                  placeholder="Select a template"
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    const selected = templates[value];
                    setSubject(selected.subject);
                    setMessage(selected.message);
                  }}
                >
                  {Object.entries(templates).map(([key, tpl]) => (
                    <Select.Option key={key} value={key}>
                      {tpl.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <div class="form-group">
              <label class="col-lg-2 control-label">Subject</label>
              <div class="col-lg-12">
                <input
                  type="text"
                  placeholder=""
                  id="inputPassword1"
                  class="form-control"
                  onChange={(e) => setSubject(e.target.value)}
                  value={subject}
                />
              </div>
            </div>
            <div class="form-group">
              <label class="col-lg-2 control-label">Message</label>
              <div class="col-lg-12">
                <textarea
                  rows="10"
                  cols="30"
                  class="form-control"
                  id=""
                  name=""
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                ></textarea>
              </div>
            </div>

            <div class="form-group">
              <div className="col-lg-offset-2 col-lg-12 mail-send">
                <span
                  className="btn green fileinput-button"
                  // style={{
                  //   backgroundColor: "#28a745",
                  //   color: "white",
                  //   padding: "10px 20px",
                  //   borderRadius: "5px",
                  //   // cursor: "pointer",
                  //   display: "inline-block",
                  // }}
                >
                  {/*<i className="fa fa-plus fa-white"></i>
                  <span>Attachment</span>
                  <input
                    type="file"
                    name="files"
                    multiple
                    style={{ cursor: "pointer" }}
                  />*/}
                  <Upload {...props}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<UploadOutlined />}
                    >
                      Attachment
                    </Button>
                  </Upload>
                </span>
                <div>
                  <button
                    className="btn btn-send"
                    type="submit"
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Mail;
