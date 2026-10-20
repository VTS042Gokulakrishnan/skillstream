import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Server } from "../../../App";
import { Skeleton } from "antd";
import moment from "moment";
import { Toaster, toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import img from "../../../assets/unnamedBlack.png";

const EmployerProfileView = () => {
  const [employers, setEmployers] = useState([]);
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
  const navigate = useNavigate();
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  // const demo = formatDistanceToNow(new Date(time), {
  //   addSuffix: true,
  // });
  let userId = localStorage.getItem("UserId");

  const getallEmployers = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/employer/${userId}`);
      // console.log(data);
      setEmployers(data.Employer);
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
      <div className="candidate-detail-outer">
        <div className="auto-container">
          {employers?.map((e, idx) => (
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                {/* Candidate block Five */}
                <div className="candidate-block-five at-v4">
                  <div className="inner-box">
                    <div className="content">
                      <figure className="image">
                        <img src={e?.image} alt="" />
                      </figure>
                      <h4 className="name">
                        <a href="#">{e?.companyName}</a>
                      </h4>
                      <ul className="candidate-info at-sv5">
                        <li className="designation">{e?.primaryIndustry}</li>
                        <li>
                          <span className="icon fal fa-location-dot"></span>{" "}
                          {e?.city}, {e?.country}
                        </li>
                      </ul>
                    </div>
                    {/* <button className="bookmark-btn"><i className="flaticon-bookmark"></i></button> */}
                  </div>

                  <div className="btn-box d-block d-sm-flex mt20">
                    {/* <a href="" className="theme-btn btn-style-one">Follow <i className="fal fa-long-arrow-right"></i></a> */}
                    {/* <a href="#" className="theme-btn btn-style-one" style={{marginTop: "20px",marginLeft:"20px"}}>Download CV <i className="fal fa-long-arrow-right text-white d-block ml15"></i></a> */}
                    <button
                      className="theme-btn btn-style-one"
                      style={{ marginTop: "20px", marginLeft: "20px" }}
                      onClick={() => navigate("/company-profile")}
                    >
                      Edit Profile 
                    </button>
                  </div>
                </div>
                <div className="job-detail">
                  <h3 className="fz30 fw500 mb-4">About Company</h3>
                  <p>{e.description}</p>
                  <hr className="opacity-100" />
                  {/* Resume / Education */}
                  <div className="resume-outer">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Website</h3>
                    </div>
                    {/* Resume BLock */}
                    {/* <div className="resume-block at-sv5">
                <div className="inner">
                  <span className="name">M</span>
                  <div className="title-box">
                    <div className="info-box">
                      <h3>Bachlors in Fine Arts</h3>
                      <span>Modern College</span>
                    </div>
                    <div className="edit-box">
                      <span className="year">2012 - 2014</span>
                    </div>
                  </div>
                  <div className="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante <br className="d-none d-lg-block" /> ipsum primis in faucibus.</div>
                </div>
              </div> */}
                    <div className="resume-block at-sv5">
                      <a href={e?.website}>{e?.website}</a>
                    </div>
                    {/* Resume BLock */}
                    {/* <div className="resume-block at-sv5">
                <div className="inner pb-0 mb-0">
                  <span className="name">H</span>
                  <div className="title-box">
                    <div className="info-box">
                      <h3>Computer Science</h3>
                      <span>Harvard University</span>
                    </div>
                    <div className="edit-box">
                      <span className="year">2008 - 2012</span>
                    </div>
                  </div>
                  <div className="text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante <br className="d-none d-lg-block" /> ipsum primis in faucibus.</div>
                </div>
              </div> */}
                  </div>
                  <hr className="opacity-100" />

                  <div className="resume-outer theme-yellow at-sv5">
                    <div className="upper-title">
                      <h3 className="fz30 fw500 mb-4">Complete Address</h3>
                    </div>
                    {/* Resume BLock */}
                    <div className="resume-block at-sv5">{e?.address} </div>
                    {/* Resume BLock */}
                  </div>
                  <div class="related-jobs">
                    <div class="title-box">
                      <h3>
                        {e?.jobs?.length} jobs at {e?.companyName}
                      </h3>
                      <div class="text"></div>
                    </div>
                    {e?.jobs?.map((e, idx) => (
                      <div class="job-block" key={idx}>
                        <div class="inner-box">
                          <div class="content">
                            <span class="company-logo">
                              <img src={employers[0].image} alt="" />
                            </span>
                            <h4>
                              <button
                                onClick={() =>
                                  navigate(`/job-detail/${userId}/${e.jobId}`)
                                }
                              >
                                {e?.JobTitle}, {employers[0]?.companyName}
                              </button>
                            </h4>
                            <ul class="job-info">
                              <li>
                                <span class="icon flaticon-briefcase"></span>{" "}
                                {e?.primaryIndustry}
                              </li>
                              <li>
                                <span class="icon flaticon-map-locator"></span>{" "}
                                {e?.City}, {e?.Country}
                              </li>
                              <li>
                                <span class="icon flaticon-clock-3"></span>{" "}
                                {formatDistanceToNow(new Date(e.time), {
                                  addSuffix: true,
                                })}
                              </li>
                              <li>
                                <span class="icon flaticon-money"></span>
                                {e.offeredSalary}
                              </li>
                            </ul>
                            <ul class="job-other-info">
                              <li class="time">{e?.JobType}</li>
                              <li class="required">{e?.employmentType}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <hr className="opacity-100" />

                  <hr className="opacity-100" />
                  {/* Portfolio */}
                  {/* <div className="portfolio-outer mb-0">
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
            </div> */}

                  {/* Video Box */}
                  {/* <div className="video-outer">
              <h3 className="fz30 fw500 mb-4">Video</h3>
              <div className="video-box">
                <figure className="image">
                  <a href="https://www.youtube.com/watch?v=Fvae8nxzVz4" className="play-now" data-fancybox="gallery" data-caption="">
                    <img src="images/resource/video-img.jpg" alt="" />
                    <i className="icon flaticon-play-button-3" aria-hidden="true"></i>
                  </a>
                </figure>
              </div>
            </div> */}
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
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Founded In</h5>
                            <span>{e?.foundedIn}</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-title"></i>
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Team Size</h5>
                            <span>{e?.teamSize}</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon far fa-user"></i>
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Primary Industry</h5>
                            <span>{e?.primaryIndustry}</span>
                          </div>
                        </li>
                        
                        <li>
                          <i className="icon flaticon-email-3"></i>
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Email</h5>
                            <span>{e?.email}</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-telephone-1"></i>
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Phone Number</h5>
                            <span>{e?.phone}</span>
                          </div>
                        </li>
                        <li>
                          <i className="icon flaticon-pin-1"></i>
                          <div className="ml15" style={{ marginLeft: "15px" }}>
                            <h5>Location</h5>
                            <span>{e.city},{e.country}</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                   
                    <div className="text-center">
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
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmployerProfileView;
