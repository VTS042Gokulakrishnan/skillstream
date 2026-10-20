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
} from "antd";
import { Server } from "App";
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
// import "./Applicants.css";
import { blue } from "@mui/material/colors";
import { useLocation } from "react-router-dom";
import { CaretRightOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { Tabs } from "antd";
import { jwtDecode } from "jwt-decode";
import { use } from "react";

const AppliedJobs = () => {
  const [applicants, setApplicants] = useState([]);

  const [loader, setLoader] = useState(false);

  let token = localStorage.getItem("token");

  let userId = localStorage.getItem("UserId");
  useEffect(() => {
    getApplicants("fetch");
  }, []);
  const getApplicants = async (fetching) => {
    try {
      // console.log(fetching === "fetch");
      if (fetching === "fetch") {
        setLoader(true);
      }

      const { data } = await axios.get(
        `${Server}/api/v1/vendor/get/appliedJobs/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApplicants(data?.appliedJobs);
      setLoader(false);
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

  const deleteApplicant = async (jobId, userId, candidateId) => {
    try {
      // let employerId = localStorage.getItem("UserId");
      // console.log(jobId, userId);/delete/applicants/:vendorId/:jobId/:candidateId
      const { data } = await axios.delete(
        `${Server}/api/v1/vendor/delete/applicants/${userId}/${jobId}/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      toast.success("Deleted Successfully");
      getApplicants("update");
    } catch (error) {
      // console.log(error);
    }
  };

  const ApplicantLayout = (givenApplicants) => {
    return (
      <>
        {loader ? (
          <p
            style={{
              paddingBottom: "80px",
              fontSize: "22px",
              fontweight: "800",
              color: "#000",
              textAlign: "center",
            }}
          >
            Fetching Applicants...
          </p>
        ) : givenApplicants.length === 0 ? (
          <Empty description="No Applicants Applied" />
        ) : (
          givenApplicants?.map((e, idx) => (
            <Collapse bordered={false}>
              <Collapse.Panel
                header={`${e.JobTitle} - ${e.EmailAddress} - ${
                  e.applicants.length
                } Applicant${e.applicants.length > 1 ? "s" : ""}`}
                key={idx}
              >
                <div className="tabs-box" key={idx}>
                  <div className="aplicants-upper-bar">
                    <h6>{e.JobTitle}</h6>
                    <ul className="aplicantion-status tab-buttons clearfix">
                      <li
                        className="tab-btn active-btn totals"
                        data-tab="#totals"
                      >
                        Total(s):
                        {e?.applicants ? e?.applicants?.length : 0}
                      </li>
                    </ul>
                  </div>

                  <div className="tabs-content">
                    <div className="tab active-tab" id="totals">
                      <div className="row">
                        {e.applicants ? (
                          e.applicants?.length !== 0 ? (
                            e?.applicants?.map((i, idx) => (
                              <div className="widget-content" key={idx}>
                                <div className="row">
                                  <div className="col-lg-12">
                                    <div className="candidate-block-three">
                                      <div className="inner-box">
                                        <div className="content">
                                          <div>
                                            <figure className="image">
                                              <img
                                                src={
                                                  i?.image ||
                                                  "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png"
                                                }
                                                alt="User"
                                                style={{
                                                  width: "80px",
                                                  height: "80px",
                                                }}
                                              />
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
                                              {/* <li>
                                              
                                                <a
                                                  href={`mailto:${i?.email}`}
                                                >
                                                  {i?.email}
                                                </a>
                                                </li>
                                              <li>
                                              {i?.mobile}
                                              </li> */}
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
                                            <a href={i?.resume} target="_blank">
                                              <Button
                                                icon={<EyeOutlined />}
                                                type="primary"
                                                style={{
                                                  backgroundColor: "#1E88E5",
                                                }}
                                              >
                                                View Resume
                                              </Button>
                                            </a>
                                            <Button
                                              icon={<DeleteOutlined />}
                                              type="default"
                                              onClick={() =>
                                                deleteApplicant(
                                                  i?.jobId,
                                                  userId,
                                                  i?.id
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
                                          <div className="button-container"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <Empty description="No Applicants Applied" />
                          )
                        ) : (
                          <Empty description="No Applicants Applied" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          ))
        )}
      </>
    );
  };
  return (
    <div>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Applied Jobs</h3>
          </div>
          <Toaster position="top-center" reverseOrder={false} />
          <div className="row">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>All Applied jobs with Applicants</h4>

                    <div className="chosen-outer">
                      {/* <select
                          className="chosen-select"
                          value={jobTitleFilter}
                          onChange={handleJobTitleFilterChange}
                        >
                          <option value="All">All Jobs</option>
                          
                            <option key={idx} value={e?.JobTitle}>
                              {e?.JobTitle}
                            </option>
                       
                        </select>*/}
                    </div>
                  </div>

                  <div className="widget-content">
                    <>{ApplicantLayout(applicants)}</>
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
    </div>
  );
};

export default AppliedJobs;
