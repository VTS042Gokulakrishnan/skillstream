import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Modal, Spin } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import { Select, Space } from "antd";
import { Skeleton } from "antd";
import { Server } from "../../App";
import Cookies from "universal-cookie";
import axios from "axios";
import { useCookies } from "react-cookie";
import Loader from "loaders/Loader";
const LinkedInPost = ({
  linkedInModal,
  setLinkedInModal,
  jobData,
  showModal,
}) => {
  //   const cookies = new Cookies(null, { path: "/" });
  let userId = localStorage.getItem("UserId");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState(window.location.href);
  const [cookies, setCookie, removeCookie] = useCookies(["cookieName"]);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [generateLoader, setGenerateLoader] = useState(false);
  // console.log(cookies.linkedinAccessToken);
  const handleCancel = () => {
    setLinkedInModal(false);
  };
  const linkedInPost = async (e) => {
    e.preventDefault();
    try {
      setButtonLoader(true);
      let token = localStorage.getItem("token");
      let linkedinAccessToken = localStorage.getItem("linkedinAccessToken");

      if (token) {
        // const cookieValue = cookies.get("linkedinAccessToken");
        // console.log(cookieValue);
        // cookies.remove("linkedinAccessToken");
        // deleteCookie("linkedinAccessToken");

        let formData = {
          jwtToken: linkedinAccessToken,
          post: message,
          JobTitle: jobData[0]?.JobTitle,
          jobUrl: url,
          region: "United States",
        };
        // console.log(formData);
        const { data } = await axios.post(
          `${Server}/api/v1/linkedIn/post/job/${userId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${linkedinAccessToken}`,
            },
          }
        );
        // console.log(data);
        if (data?.message === "Posted Successfully") {
          setButtonLoader(true);
          toast.success("Job shared Successfully!");
          setTimeout(() => {
            setLinkedInModal(false);
          }, 300);
        }
      } else {
        toast.error("Please login");
        showModal("login");
        setButtonLoader(false);
      }
    } catch (error) {
      // console.log(error);
      setButtonLoader(false);

      if (
        error?.response?.data?.error?.message ===
        "Request failed with status code 422"
      ) {
        toast.error("Job Shared Already");
      } else if (
        error?.response?.data?.error?.message ===
        "Request failed with status code 401"
      ) {
        toast.error("Invalid LinkedIn Access Token! Please Login Again");
        localStorage.removeItem("linkedinAccessToken");
      } else {
        toast.error("Error in share the job");
        localStorage.removeItem("linkedinAccessToken");
      }
    } finally {
      localStorage.setItem("linkedinAccessToken", "Verified");
      localStorage.removeItem("Path");
    }
  };
  const generateLinkedInPost = async () => {
    setGenerateLoader(true);
    try {
      let payload = {
        JobTitle: jobData[0]?.JobTitle,
        companyName: jobData[0]?.companyName,
        city: jobData[0]?.City,
        country: jobData[0]?.Country,
        state: jobData[0]?.State,
        jobUrl: url,
      };
      const { data } = await axios.post(
        `${Server}/api/v1/parser/generate/linkedin`,
        payload
      );
      console.log(data);

      setMessage(data.text);
      setGenerateLoader(false);
    } catch (error) {
      console.log(error);
      setGenerateLoader(false);
    }
  };
  return (
    <div>
      {" "}
      <Modal
        centered
        open={linkedInModal}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {" "}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="modal-body">
          <h3 style={{ paddingBottom: "10px" }}>Share Job </h3>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {" "}
            <Button
              type="primary"
              onClick={() => generateLinkedInPost()}
              loading={generateLoader}
              disabled={generateLoader}
            >
              {" "}
              Generate{" "}
            </Button>
          </div>

          <form role="form" class="form-horizontal" onSubmit={linkedInPost}>
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

            <div class="form-group">
              {/*<label class="col-lg-2 control-label">LinkedIn Post</label>*/}
              <div class="col-lg-12">
                <textarea
                  rows="10"
                  cols="30"
                  class="form-control"
                  id=""
                  name="Message"
                  placeholder="Enter the message you want to post in LinkedIn"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ overflowY: "auto", resize: "vertical" }}
                  required
                ></textarea>
              </div>
            </div>
            <div class="form-group">
              <label class="col-lg-2 control-label">Job Url</label>
              <div class="col-lg-12">
                <input
                  type="text"
                  placeholder=""
                  id="cc"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="col-lg-offset-2 col-lg-12 mail-send">
                <div>
                  <button
                    class="btn btn-send"
                    style={{
                      backgroundColor: "#007bff", // Primary blue color
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      border: "none",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "background-color 0.3s, transform 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#0056b3")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#007bff")
                    }
                    type="submit"
                  >
                    {buttonLoader ? <Loader /> : "Share Job"}
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

export default LinkedInPost;
