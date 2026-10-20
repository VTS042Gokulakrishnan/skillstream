import React, { useEffect, useState } from "react";
import img from "../../../assets/unnamedBlack.png";
import { useNavigate } from "react-router-dom";
import { Server } from "../../../App";
import axios from "axios";
import { Helmet } from "react-helmet";

const ProfileView = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState([]);
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
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
  let userId = localStorage.getItem("UserId");
  // console.log(candidate);

  const getallEmployers = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      setCandidate(data?.Candidate[0]);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(relativeTime);
  useEffect(() => {
    getallEmployers();
  }, []);
  return (
    <section className="candidate-detail-section">
      <Helmet>
        <meta
          name="Tech Candidate Profile | Detailed IT Talent  | Skillstream Jobs US"
          content="Explore detailed tech candidate profiles on SkillStream Jobs US. Discover in-depth IT talent information to make informed hiring decisions with ease."
        />
      </Helmet>
      <div className="candidate-detail-outer">
        <div className="auto-container">
          <div className="row">
            <div className="content-column col-lg-8 col-md-12 col-sm-12">
              {/* Candidate block Five */}
              <div className="candidate-block-five at-v4">
                <div className="inner-box">
                  <div className="content">
                    <figure className="image">
                      <img src={candidate?.image} alt="" />
                    </figure>
                    <h4 className="name">
                      <a href="#">{candidate?.name} </a>
                    </h4>
                    <ul className="candidate-info at-sv5">
                      <li className="designation">{candidate?.position} </li>
                      <li>
                        <span className="icon fal fa-location-dot"></span>{" "}
                        {candidate?.city} ,{candidate?.country}
                      </li>
                      <li>
                        <span className="icon fal fa-circle-dollar"></span>{" "}
                        $&nbsp;
                        {candidate?.currentSalary}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="btn-box d-block d-sm-flex mt20">
                  <a
                    href={candidate.resume}
                    className="theme-btn btn-style-one"
                    target="_blank"
                    style={{ marginTop: "20px", marginLeft: "20px" }}
                  >
                    View CV{" "}
                  </a>
                  <a
                    className="theme-btn btn-style-one"
                    style={{ marginTop: "20px", marginLeft: "20px" }}
                    onClick={() => navigate("/my-profile")}
                  >
                    Edit Profile
                  </a>
                </div>
              </div>
              <div className="job-detail">
                <h3 className="fz30 fw500 mb-4">About me</h3>
                <p>{candidate.description}</p>
                <hr className="opacity-100" />
                {/* Resume / Education */}
                <div className="resume-outer">
                  <div className="upper-title">
                    <h3 className="fz30 fw500 mb-4">Education</h3>
                  </div>
                  {/* Resume BLock */}
                  {candidate?.Education?.map((e, idx) => (
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name">
                          {e.college
                            ? e.college?.charAt(0).toUpperCase()
                            : e.Institution_Name
                            ? e.Institution_Name?.charAt(0).toUpperCase()
                            : null}
                        </span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>
                              {e.degree ? e.degree : e.Degree ? e.Degree : null}
                            </h3>
                            <span>
                              {e.college
                                ? e.college
                                : e.Institution_Name
                                ? e.Institution_Name
                                : null}
                            </span>
                          </div>
                          <div className="edit-box">
                            <span className="year">
                              {(() => {
                                if (e["Start_year-End_Year"]) {
                                  // Case 1: Start_year-End_Year is a single string
                                  const years =
                                    e["Start_year-End_Year"].split("-");
                                  const startYear = years[0] || "Unknown";
                                  const endYear =
                                    years[1] && years[1] !== "present"
                                      ? years[1]
                                      : "Present";
                                  return `${startYear} - ${endYear}`;
                                } else if (e.startYear) {
                                  // Case 2: startYear and endYear are separate fields
                                  return `${e.startYear} - ${
                                    e.endYear || "Present"
                                  }`;
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Resume BLock */}
                </div>
                <hr className="opacity-100" />
                {/* Resume / Work & Experience */}
                <div className="resume-outer theme-blue">
                  <div className="upper-title">
                    <h3 className="fz30 fw500 mb-4">Work & Experience</h3>
                  </div>
                  {/* Resume BLock */}
                  {candidate?.work_experience?.map((exp, subIdx) => (
                    <div className="resume-block at-sv5" key={subIdx}>
                      <div className="inner">
                        <span className="name">
                          {exp.companyName
                            ? exp.companyName.charAt(0).toUpperCase()
                            : exp.company
                            ? exp.company.charAt(0).toUpperCase()
                            : null}
                        </span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>
                              {exp.role
                                ? exp.role
                                : exp.job_title
                                ? exp.job_title
                                : null}
                            </h3>
                            <span>
                              {exp.companyName
                                ? exp.companyName
                                : exp.company
                                ? exp.company
                                : null}
                            </span>
                          </div>
                          <div className="edit-box">
                            <span className="year">
                            {(() => {
                              if (exp["Start_year-End_Year"]) {
                                // Case 1: Start_year-End_Year is a single string
                                const years =
                                  exp["Start_year-End_Year"].split("-");
                                const startYear = years[0] || "Unknown";
                                const endYear =
                                  years[1] && years[1] !== "present"
                                    ? years[1]
                                    : "Present";
                                return `${startYear} - ${endYear}`;
                              } else if (exp.startYear) {
                                // Case 2: startYear and endYear are separate fields
                                return `${exp.startYear} - ${
                                  exp.endYear || "Present"
                                }`;
                              }
                            })()}
                            </span>
                          </div>
                        </div>
                        {/*<div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                  </div>*/}
                      </div>
                    </div>
                  ))}

                  {/* Resume BLock */}
                </div>
                <hr className="opacity-100" />
                {/* Resume / Awards */}
                {candidate?.awards?.length === 0 ? null : (
                  <div className="resume-outer theme-yellow at-sv5">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Honors & awards</h3>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner">
                        <span className="name"></span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Perfect Attendance Programs</h3>
                            <p className="text fz15 mb-0">29 April 2023</p>
                            <span></span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">
                      <div className="inner pb-0 mb-0">
                        <span className="name"></span>
                        <div className="title-box">
                          <div className="info-box">
                            <h3>Top Performer Recognition</h3>
                            <p className="text fz15 mb-0">29 April 2023</p>
                            <span></span>
                          </div>
                        </div>
                        <div className="text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Proin a ipsum tellus. Interdum et malesuada
                          fames ac ante
                          <br /> ipsum primis in faucibus.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="opacity-100" />
              </div>
            </div>

            <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
              <aside className="sidebar">
                <div className="sidebar-widget">
                  <h4 className="widget-title">More Information</h4>
                  <div className="widget-content">
                    <ul className="job-overview at-sv5">
                      <li>
                        <i className="icon flaticon-exercise"></i>
                        {/* <i className="fa-solid fa-circle-dollar"></i> */}
                        {candidate?.expectedSalary ? (
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Expected Salary</h5>
                            <span>$ &nbsp;{candidate?.expectedSalary}</span>
                          </div>
                        ) : null}
                      </li>
                      <li>
                        <i className="icon flaticon-title"></i>
                        <div className="ml15" style={{ marginLeft: "15px" }}>
                          <h5>Experience</h5>
                          <span>{candidate?.experience}</span>
                        </div>
                      </li>

                      <li>
                        <i className="icon fal fa-language"></i>
                        <div className="ml15" style={{ marginLeft: "15px" }}>
                          {candidate?.language ? (
                            <>
                              <h5>Language:</h5>
                              <span>
                                {candidate?.language[0]},
                                {candidate?.language[1]}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </li>
                      <li>
                        <i className="icon flaticon-email-3"></i>
                        <div className="ml15" style={{ marginLeft: "15px" }}>
                          <h5>Email</h5>
                          <span>{candidate.email}</span>
                        </div>
                      </li>
                      <li>
                        <i className="icon flaticon-telephone-1"></i>
                        <div className="ml15" style={{ marginLeft: "15px" }}>
                          <h5>Phone Number</h5>
                          <span>{candidate.phone_number}</span>
                        </div>
                      </li>
                      <li>
                        <i className="icon flaticon-pin-1"></i>
                        <div className="ml15" style={{ marginLeft: "15px" }}>
                          <h5>Location</h5>
                          <span>{candidate.city}</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/*   <div className="text-center">
                    <div className="social-link-style1">
                      <a className="me-3" href="#">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a className="me-3" href="#">
                        <i class="fab fa-twitter-t"></i>
                      </a>
                      <a className="me-3" href="#">
                        <i className="fab fa-instagram"></i>
                      </a>
                      <a href="#">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </div>*/}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileView;
{
  /* Portfolio */
}
{
  /* <div className="portfolio-outer mb-0">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Projects</h3>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-6">
                    <figure className="image">
                      <a href="images/resource/portfolio-1.jpg" className="lightbox-image"><img src="images/resource/portfolio-1.jpg" alt="" /></a>
                      <span className="icon flaticon-plus"></span>
                    </figure>
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-6">
                    <figure className="image">
                      <a href="images/resource/portfolio-2.jpg" className="lightbox-image"><img src="images/resource/portfolio-2.jpg" alt="" /></a>
                      <span className="icon flaticon-plus"></span>
                    </figure>
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-6">
                    <figure className="image">
                      <a href="images/resource/portfolio-3.jpg" className="lightbox-image"><img src="images/resource/portfolio-3.jpg" alt="" /></a>
                      <span className="icon flaticon-plus"></span>
                    </figure>
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-6">
                    <figure className="image">
                      <a href="images/resource/portfolio-4.jpg" className="lightbox-image"><img src="images/resource/portfolio-4.jpg" alt="" /></a>
                      <span className="icon flaticon-plus"></span>
                    </figure>
                  </div>
                </div>
              </div> */
}

{
  /* Video Box */
}
{
  /* <div className="video-outer">
                <h3 className="fz30 fw500 mb-4">Video</h3>
                <div className="video-box">
                  <figure className="image">
                    <a href="https://www.youtube.com/watch?v=Fvae8nxzVz4" className="play-now" data-fancybox="gallery" data-caption="">
                      <img src="images/resource/video-img.jpg" alt="" />
                      <i className="icon flaticon-play-button-3" aria-hidden="true"></i>
                    </a>
                  </figure>
                </div>
              </div> */
}
