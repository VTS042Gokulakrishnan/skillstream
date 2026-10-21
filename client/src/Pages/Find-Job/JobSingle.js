import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Server } from "../../App";
import { Skeleton, Result, Button } from "antd";
import { Modal, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Toaster, toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import Job from "../../Components/Header/Job";
import Login from "../Auth/Login";
// import { parseISO, format } from "date-fns";
import Register from "../Auth/Register";
// import Cookies from "universal-cookie";
import LinkedInPost from "../../Components/Modals/LinkedInPost";
// import { useCookies } from "react-cookie";

const JobSingle = () => {
  const [jobData, setJobData] = useState([]);
  const [data, setData] = useState([]);
  const [time, setTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  // const [authorise, setAuthorise] = useState(false);
  const [linkedInModal, setLinkedInModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [vendorModalVisible, setVendorModalVisible] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [vendorCandidates, setVendorCandidates] = useState([]);
  const [status, setStatus] = useState("Pending");
  const [isVendor, setIsVendor] = useState(false);
  let token = localStorage.getItem("token");

  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const fetchVendorCandidates = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/vendor/get/candidates/${userId}`
      );
      setVendorCandidates(data.candidates || []);
    } catch (err) {
      toast.error("Failed to fetch candidates");
    }
  };

  const handleVendorApply = () => {
    fetchVendorCandidates();
    setVendorModalVisible(true);
  };
  // const [cookies] = useCookies(["cookieName"]);
  // console.log(cookies.linkedinAccessToken);
  let navigate = useNavigate();
  // const [modalType, setModalType] = useState("login");
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const client_id = "778mazj65ph3nn";
  const redirect_uri = `${Server}/api/v1/linkedIn/us/auth/linkedin/callback`;
  const scope = "email profile w_member_social openid";
  const showJobModal = () => {
    setJobModalOpen(true);
  };
  // const cookies = new Cookies(null, { path: "/" });
  // const handleOk = () => {
  //   setJobModalOpen(false);
  // };
  const showLinkedInModal = () => {
    setLinkedInModal(true);
  };
  const params = useParams();
  // Fetch job data on component mount
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  // let linkedinAccessToken = localStorage.getItem("linkedinAccessToken");
  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const options = { month: "short", day: "numeric", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    // const day = date.getDate();
    // const suffix = getDaySuffix(day);0

    return formattedDate;
  }

  const getJobDetails = async () => {
    try {
      setStatus("Fetching");
      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/public/${params.userId}/${params.jobId}`
      );
      // console.log(data);
      setStatus("Completed");
      setJobData(data.jobs);
      const demo = formatDistanceToNow(new Date(data?.jobs[0]?.time), {
        addSuffix: true,
      });
      // console.log(demo);
      setTime(demo);
    } catch (error) {
      // console.log(error);
      if ([404, 410].includes(error.response?.status) || error.response?.data?.message === "No Jobs Posted") {
        setStatus("Not-FOund");
      } else {
        toast.error("Internal Server Error");
        setStatus("ERROR");
      }
    }
  };
  useEffect(() => {
    getJobDetails();
    // console.log(jobData);
  }, []);
  // check html tags
  const hasHtmlTags = (str) => /<\/?[a-z][\s\S]*>/i.test(str);

  const removeHtmlTags = (htmlString) => {
    if (hasHtmlTags(htmlString)) {
      return (
        <>
          <div dangerouslySetInnerHTML={{ __html: htmlString }} />
        </>
      );
    } else {
      return htmlString;
    }
  };
  let userId = localStorage.getItem("UserId");
  let role = localStorage.getItem("Role");

  const applyJob = async () => {
    try {
      if (token) {
        setLoader(true);
        const { data } = await axios.post(
          `${Server}/api/v1/candidate/jobs/applyJob/${userId}/${params.userId}`,
          {
            jobId: params.jobId,
            JobTitle: jobData[0]?.JobTitle,
            role: jobData[0]?.JobTitle,
            companyName: jobData[0]?.companyName,
            status: jobData[0]?.status,
            city: jobData[0]?.City,
            State: jobData[0]?.State,
            Industry: jobData[0]?.Industry,
            offeredSalary: jobData[0]?.offeredSalary,
            employmentType: jobData[0]?.employmentType,
            jobType: jobData[0]?.JobType,
            email: jobData[0]?.EmailAddress,
            region: "United States",
          }
        );
        // console.log(data);
        toast.success(" Application Sent Successfully ");
        setLoader(false);
      } else {
        toast.error("Please login");
        showModal("login");
      }
    } catch (error) {
      // console.log(error);
      if (error.response.data.message === "Job already Applied") {
        toast.error("Already applied for this job");
        setLoader(false);
      } else {
        toast.error("Failed to Apply for the job!");
        setLoader(false);
      }

      // Job already Applied
    }
  };
  const getData = async () => {
    try {
      let userId = localStorage.getItem("UserId");

      const { data } = await axios.get(`${Server}/api/v1/employer/${userId}`);
      setData(data.Employer[0]);
      // console.log(data);
      // countJobsByMonth(data.Employer[0].jobs);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(data.linkedInToken ? "available" : "not available");

  useEffect(() => {
    if (role === "Employer") {
      getData();
    }
  }, []);

  let profileCompleted = localStorage.getItem("ProfileCompleted");
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
  const submitVendorApplication = async () => {
    if (!selectedCandidateId && !resumeFile) {
      toast.error("Please upload a resume or select a candidate");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", params.jobId);
    formData.append("JobTitle", jobData[0]?.JobTitle);
    formData.append("companyName", jobData[0]?.companyName);
    formData.append("status", jobData[0]?.status);
    formData.append("city", jobData[0]?.City);
    formData.append("State", jobData[0]?.State);
    formData.append("Industry", jobData[0]?.Industry);
    formData.append("offeredSalary", jobData[0]?.offeredSalary);
    formData.append("employmentType", jobData[0]?.employmentType);
    formData.append("jobType", jobData[0]?.JobType);
    formData.append("email", jobData[0]?.EmailAddress);
    formData.append("region", "United States");
    formData.append("isVendorApplicant", true);
    if (resumeFile) formData.append("resume", resumeFile);
    if (selectedCandidateId)
      selectedCandidateId.forEach((id) => {
        formData.append("candidateIds", id);
      });

    try {
      setLoader(true);
      await axios.post(
        `${Server}/api/v1/vendor/applyJob/${userId}/${params.userId}`,
        formData
      );
      toast.success("Application sent successfully");
      setVendorModalVisible(false);
      setLoader(false);
      setSelectedCandidateId();
    } catch (err) {
      console.log(err);
      toast.error("Failed to apply");
      setLoader(false);
    }
  };
  console.log(selectedCandidateId);
  return (
    <div>
      <section class="job-detail-section">
        {status === "Fetching" && <Skeleton />}
        {status === "Not-FOund" && (
          <Result
            status="404"
            title="This job is no longer available"
            subTitle="The employer may have closed or removed this position."
            extra={
              <Button type="primary" onClick={() => navigate("/find-jobs")}>
                Back to Find Jobs
              </Button>
            }
          />
        )}

        {status === "Completed" && (
          <div class="job-detail-outer">
            <div class="auto-container">
              <Toaster position="top-center" reverseOrder={false} />
              <div class="row">
                <div class="content-column col-lg-8 col-md-12 col-sm-12">
                  <div class="job-block-outer">
                    <div class="job-block-seven">
                      <div class="inner-box">
                        <div class="content">
                          <span class="company-logo">
                            <img src={jobData[0]?.image} alt="" />
                          </span>
                          <h4>
                            <a href="#">{jobData[0]?.JobTitle}</a>
                          </h4>
                          <ul class="job-info">
                            {jobData[0]?.Industry ? (
                              <li>
                                <span class="icon flaticon-briefcase"></span>{" "}
                                {jobData[0]?.Industry}
                              </li>
                            ) : null}
                            {(jobData[0].City || jobData[0].Country) && (
                              <li>
                                <span class="icon flaticon-map-locator"></span>{" "}
                                {jobData[0].City && jobData[0].Country
                                  ? `${jobData[0].City}, ${jobData[0].Country}`
                                  : jobData[0].City || jobData[0].Country}
                              </li>
                            )}
                            <li>
                              {/*console.log(time)*/}
                              <span class="icon flaticon-clock-3"></span>
                              {time}
                            </li>
                            {jobData[0]?.offeredSalary && (
                              <li>
                                <span class="icon flaticon-money"></span>{" "}
                                {jobData[0]?.offeredSalary}
                              </li>
                            )}
                          </ul>
                          <ul class="job-other-info">
                            {jobData[0]?.JobType && (
                              <li class="time"> {jobData[0]?.JobType}</li>
                            )}
                            {jobData[0]?.employmentType && (
                              <li class="privacy">
                                {" "}
                                {jobData[0]?.employmentType}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="job-detail" style={{ paddingTop: "20px" }}>
                    <h4>Job Description</h4>
                    {/* <p>{jobData[0]?.JobDescription}</p> */}
                    <ul>
                      {" "}
                      {jobData[0]?.JobDescription?.split("\n").map(
                        (item, index) => (
                          <li key={index}>{removeHtmlTags(item)}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div class="job-detail">
                    {jobData[0]?.Responsibilties ? (
                      <>
                        <h4>Key Skills</h4>
                        <ul class="list-style-three">
                          {jobData[0]?.Responsibilties?.map((e, idx) => (
                            <li>{e}</li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>

                  {role === "Employer" && (
                    <div class="other-options">
                      <div class="social-share">
                        <h5>Share this job</h5>
                        {data?.linkedInloggedIn ? (
                          <a
                            onClick={() => showLinkedInModal()}
                            class="facebook"
                          >
                            <FontAwesomeIcon icon={faLinkedinIn} />{" "}
                            <span style={{ marginLeft: "5px" }}>LinkedIn</span>
                          </a>
                        ) : (
                          <a
                            href={encodeURI(
                              `https://www.linkedin.com/oauth/v2/authorization?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirect_uri}`
                            )}
                            onClick={() =>
                              localStorage.setItem("Path", window.location.href)
                            }
                            class="facebook"
                            // target={`https://www.linkedin.com/oauth/v2/authorization?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirect_uri}`}
                          >
                            <FontAwesomeIcon icon={faLinkedinIn} />{" "}
                            <span style={{ marginLeft: "5px" }}>LinkedIn</span>
                          </a>
                        )}
                        {data?.twitterToken ? (
                          <a class="twitter">
                            <FontAwesomeIcon icon={faXTwitter} />
                            <span style={{ marginLeft: "5px" }}>Twitter</span>
                          </a>
                        ) : null}
                        {linkedInModal && (
                          <LinkedInPost
                            showLinkedInModal={showLinkedInModal}
                            linkedInModal={linkedInModal}
                            setLinkedInModal={setLinkedInModal}
                            showModal={showModal}
                            jobData={jobData}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div class="sidebar-column col-lg-4 col-md-12 col-sm-12">
                  <aside class="sidebar">
                    {role === "Employer" ? null : (
                      <div className="btn-box">
                        {/* If token not present (unauthenticated user) */}
                        {!token && (
                          <>
                            <button
                              onClick={() => {
                                showModal("login");
                              }}
                              className="theme-btn btn-style-one"
                            >
                              Apply For Job
                            </button>
                            {console.log(jobData[0]?.isVendor === true)}
                            {jobData[0]?.isVendor === true && (
                              <button
                                onClick={() => {
                                  setIsVendor(true);
                                  showModal("login");
                                }}
                                className="theme-btn btn-style-one"
                                style={{ marginLeft: "10px" }}
                              >
                                Apply As Vendor
                              </button>
                            )}

                            <button
                              onClick={showJobModal}
                              className="theme-btn btn-style-one"
                              style={{ marginLeft: "10px" }}
                            >
                              Easy Apply
                            </button>
                          </>
                        )}

                        {/* If logged-in candidate */}
                        {token && role === "Candidate" && (
                          <button
                            onClick={() => applyJob()}
                            className="theme-btn btn-style-one"
                            disabled={loader}
                          >
                            {loader ? "Applying ..." : "Apply For Job"}
                          </button>
                        )}

                        {/* If logged-in vendor */}
                        {token && role === "Vendor" && (
                          <>
                            <button
                              onClick={() => handleVendorApply()}
                              className="theme-btn btn-style-one"
                              disabled={loader}
                            >
                              Apply As Vendor
                            </button>
                            <Modal
                              title="Apply as Vendor"
                              open={vendorModalVisible}
                              onCancel={() => {
                                setVendorModalVisible(false);
                                setSelectedCandidateId();
                              }}
                              onOk={submitVendorApplication}
                              okText="Apply"
                            >
                              <h3>
                                If no candidates are listed, please upload
                                resumes via{" "}
                                <a
                                  href="/vendor/manage/candidates"
                                  style={{
                                    color: "#1e90ff",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                  target="_blank"
                                >
                                  Manage Candidates
                                </a>
                                .
                              </h3>
                              <p>Select a Candidate:</p>
                              <Select
                                mode="multiple"
                                style={{ width: "100%", marginBottom: "10px" }}
                                onChange={(value) =>
                                  setSelectedCandidateId(value)
                                }
                                placeholder="Choose from stored candidates"
                                value={selectedCandidateId}
                              >
                                {vendorCandidates.map((c) => (
                                  <Select.Option key={c._id} value={c._id}>
                                    {c.name} - {c.email}
                                  </Select.Option>
                                ))}
                              </Select>

                              {/*  <p>Or Upload Resume:</p>
                              <Upload
                                beforeUpload={(file) => {
                                  setResumeFile(file);
                                  return false; // prevent auto upload
                                }}
                                fileList={resumeFile ? [resumeFile] : []}
                                onRemove={() => setResumeFile(null)}
                              >
                                <Button icon={<UploadOutlined />}>
                                  Upload Resume
                                </Button>
                              </Upload>*/}
                            </Modal>
                          </>
                        )}
                      </div>
                    )}
                    {jobModalOpen && (
                      <div>
                        {/* {console.log(modalType)} */}
                        <Job
                          jobModalOpen={jobModalOpen}
                          setJobModalOpen={setJobModalOpen}
                          showJobModal={showJobModal}
                          jobData={jobData[0]}
                        />
                      </div>
                    )}
                    {isModalOpen && (
                      <div>
                        {modalType === "login" ? (
                          <div>
                            <Login
                              isModalOpen={isModalOpen}
                              modalType={modalType}
                              setIsModalOpen={setIsModalOpen}
                              setModalType={setModalType}
                              showModal={showModal}
                              confirmModal={confirmModal}
                              setConfirmModal={setConfirmModal}
                              forgotModal={forgotModal}
                              setForgotModal={setForgotModal}
                              isVendor={isVendor}
                            />
                          </div>
                        ) : (
                          <Register
                            isModalOpen={isModalOpen}
                            modalType={modalType}
                            setIsModalOpen={setIsModalOpen}
                            setModalType={setModalType}
                            isVendor={isVendor}
                          />
                        )}
                      </div>
                    )}
                    <div class="sidebar-widget">
                      <h4 class="widget-title">Job Overview</h4>
                      <div class="widget-content">
                        <ul class="job-overview">
                          <li>
                            <i class="icon icon-calendar"></i>
                            <h5>Date Posted:</h5>
                            <span>{jobData[0]?.postedTime || "N/A"}</span>
                          </li>
                          <li>
                            <i class="icon icon-expiry"></i>
                            <h5>Expiration date:</h5>
                            <span>
                              {jobData[0]?.ApplicationDeadlineDate
                                ? formatDate(
                                    jobData[0]?.ApplicationDeadlineDate
                                  )
                                : "N/A"}
                            </span>
                          </li>
                          <li>
                            <i
                              class="icon flaticon-pin-1"
                              style={{
                                color: "#1967d2",
                                fontSize: "20px",
                                marginLeft: "5px",
                                fontWeight: "bold",
                              }}
                            ></i>
                            <h5>Location:</h5>
                            <span>
                              {jobData[0]?.Country && jobData[0]?.City
                                ? `${jobData[0]?.Country}, ${jobData[0]?.City}`
                                : "N/A"}
                            </span>
                          </li>
                          <li>
                            <i class="icon icon-user-2"></i>
                            <h5>Job Title:</h5>
                            <span>{jobData[0]?.JobTitle || "N/A"}</span>
                          </li>
                          <li>
                            <i class="icon icon-salary"></i>
                            <h5>Salary:</h5>
                            <span>{jobData[0]?.offeredSalary || "N/A"}</span>
                          </li>
                        </ul>
                      </div>

                      <h4 class="widget-title">Job Skills</h4>
                      <div class="widget-content">
                        <ul class="job-skills">
                          {jobData[0]?.jobSkills?.length ? (
                            jobData[0]?.jobSkills.map((e, idx) => (
                              <li key={idx}>
                                <a href="#">{e}</a>
                              </li>
                            ))
                          ) : (
                            <li>
                              <span>N/A</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div class="sidebar-widget company-widget">
                      <div class="widget-content">
                        <div class="company-title">
                          <div class="company-logo">
                            <img src={jobData[0]?.image} alt="" />
                          </div>
                          <h5 class="company-name">
                            {jobData[0]?.companyName}
                          </h5>
                          <button
                            onClick={() =>
                              navigate(`/employers/${jobData[0]?.userId}`)
                            }
                            class="profile-link"
                          >
                            View company profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobSingle;

// function deleteCookie(name) {
//   document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
// }
// function getCookie(name) {
//   const cookies = document.cookie.split(";");
//   for (let i = 0; i < cookies.length; i++) {
//     const cookie = cookies[i].trim();
//     if (cookie.startsWith(name + "=")) {
//       return decodeURIComponent(cookie.substring(name.length + 1));
//     }
//   }
//   return null;
// }

// // Usage
// const cookieValue = getCookie("linkedinAccessToken");
// console.log(cookieValue);
// deleteCookie("linkedinAccessToken");
// const cookieValue = cookies.get("linkedinAccessToken");
// console.log(cookieValue);
// const currentURL = window.location.href;
// console.log(currentURL);
// const cookieValue = cookies.get("linkedinAccessToken");
// console.log(cookieValue);

// const linkedInPost = async () => {
//   try {
//     let token = localStorage.getItem("token");

//     if (token) {
//       const cookieValue = cookies.get("linkedinAccessToken");
//       // cookies.remove("linkedinAccessToken");
//       // deleteCookie("linkedinAccessToken");

//       const post = "Hi good evening all!";
//       const { data } = await axios.post(
//         `${Server}/api/v1/linkedIn/post/job/${userId}`,
//         {
//           accessToken: cookieValue,
//           post,
//           JobTitle: jobData[0]?.JobTitle,
//           jobUrl: window.location.href,
//           headers: {
//             Authorization: `Bearer ${cookieValue}`,
//           },
//         }
//       );
//       // console.log(data);
//       if (data?.message === "Posted Successfully") {
//         toast.success("Job shared Successfully!");
//       }
//     } else {
//       toast.error("Please login");
//       showModal("login");
//     }
//   } catch (error) {
//     // console.log(error);
//     toast.error();
//   } finally {
//     // removeCookie("linkedinAccessToken");
//   }
// };
// const shortlistedJob = async () => {
//   try {
//     if (token) {
//       let jobDetails = {
//         jobId: params.jobId,
//         jobTitle: jobData[0]?.JobTitle,
//         companyName: jobData[0]?.companyName,
//         categories: jobData[0]?.Industry,
//         city: jobData[0]?.City,
//         country: jobData[0]?.Country,
//         logo: jobData[0]?.image,
//         empId: params.userId,
//         status: jobData[0]?.status,
//         email: jobData[0]?.EmailAddress,
//         region: "United States",
//       };
//       const { data } = await axios.post(
//         `${Server}/api/v1/candidate/shortlistJob/add/${userId}`,
//         jobDetails
//       );
//       // console.log(data);
//       toast.success("Shortlisted Successfully");
//     } else {
//       toast.error("Please login");
//       showModal("login");
//     }
//   } catch (error) {
//     if (error.response.data.message === "Job already shortlisted") {
//       toast.error("Already shortlisted");
//     } else {
//       // console.log(error.response.data.message);
//       toast.error("Error in Shortlisting the job");
//     }
//   }
// };
{
  /* <div class="sidebar-widget contact-widget">
                    <h4 class="widget-title">Contact Us</h4>
                    <div class="widget-content">
                      <div class="default-form">
                        <form>
                          <div class="row clearfix">
                            <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                              <input
                                type="text"
                                name="username"
                                placeholder="Your Name"
                                required
                              />
                            </div>
                            <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                              <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                required
                              />
                            </div>
                            <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                              <textarea
                                class="darma"
                                name="message"
                                placeholder="Message"
                              ></textarea>
                            </div>
                            <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                              <button
                                class="theme-btn btn-style-one"
                                type="submit"
                                name="submit-form"
                              >
                                Send Message
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div> */
}
