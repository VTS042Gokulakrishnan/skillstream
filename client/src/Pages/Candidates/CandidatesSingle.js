import React, { useState, useEffect } from "react";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";

const CandidatesSingle = () => {
  const [candidate, setCandidate] = useState([]);
  const params = useParams();
  const [loading, setLoading] = useState(false);
  let userId = localStorage.getItem("UserId");
  let token = localStorage.getItem("token");
  const getallCandidates = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/candidate/${params.id}?employerId=${userId}`
      );
      const addViews = await axios.post(
        `${Server}/api/v1/candidate/profileViews/${params.id}?employerId=${userId}`
      );
      // console.log(data);
      setCandidate(data.Candidate);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  // console.log(e.education);
  useEffect(() => {
    getallCandidates();
  }, []);


  const ShortlistedResumes = async () => {
    try {
      const body = {
        userId: params.id,
        position: candidate[0].position,
        name: candidate[0].name,
        city: candidate[0].city,
        country: candidate[0].country,
        image: candidate[0].image,
        expectedSalary: candidate[0].expectedSalary,
        resume: candidate[0].resume,
        email: candidate[0].email,
      };
      // console.log(body);

      const { data } = await axios.post(
        `${Server}/api/v1/employer/shortlistResume/add/${userId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      toast.success(data.message);
    } catch (error) {
      if (error.response.data.message === "Resume already shortlisted") {
        toast.error("Already  Shortlisted!");
      } else {
        // console.log(error);
        toast.error("Internal Server Error");
      }
    }
  };
  const navigate = useNavigate();
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
  return (
    <div>
      {candidate.length === 0 ? (
        <Skeleton active />
      ) : (
        candidate?.map((e, idx) => (
          <section class="candidate-detail-section style-three" key={e._id}>
            <Toaster position="top-center" reverseOrder={false} />
            <div class="upper-box">
              <div class="auto-container">
                <div class="candidate-block-six">
                  <div class="inner-box">
                    <figure class="image">
                      <img src={e.image} alt="" />
                    </figure>
                    <h4 class="name">
                      <a>{e.name}</a>
                    </h4>
                    <span class="designation">{e.position}</span>
                    <div class="content">
                      <ul class="post-tags">
                        <li>
                          <a href="#">App</a>
                        </li>
                        <li>
                          <a href="#">Design</a>
                        </li>
                        <li>
                          <a href="#">Digital</a>
                        </li>
                      </ul>

                      <ul class="candidate-info">
                        <li>
                          <span class="icon flaticon-map-locator"></span>
                          {e.city},{e.country}
                        </li>
                        <li>
                          <span class="icon flaticon-money"></span>{" "}
                          {e.currentSalary}
                        </li>
                        <li>
                          <span class="icon flaticon-clock"></span> Member
                          Since,
                          {moment(e.createdAt).format("MMM DD, YYYY")}
                        </li>
                      </ul>

                      <div class="btn-box">
                        {e?.resume ? (
                          <a
                            href={e.resume}
                            class="theme-btn btn-style-one"
                            download
                            target="_blank"
                          >
                            View CV
                          </a>
                        ) : null}

                        <button
                          class="bookmark-btn"
                          onClick={ShortlistedResumes}
                        >
                          <i class="flaticon-bookmark"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="candidate-detail-outer">
              <div class="auto-container">
                <div class="row">
                  <div class="content-column col-lg-8 col-md-12 col-sm-12 order-2">
                    <div class="job-detail">
                      <h4>About</h4>
                      <p>{e.description}</p>

                      <div class="resume-outer">
                        <div class="upper-title">
                          <h4>Education</h4>
                        </div>

                        {e.education?.map((e, index) => (
                          <div class="resume-block" key={index}>
                            <div class="inner">
                              <span class="name">
                                {e.college.charAt(0).toUpperCase()}
                              </span>
                              <div class="title-box">
                                <div class="info-box">
                                  <h3>{e.degree}</h3>
                                  <span>{e.college}</span>
                                </div>
                                <div class="edit-box">
                                  <span class="year">
                                    {e.startYear}-{e.endYear}
                                  </span>
                                </div>
                              </div>
                              <div class="text">{e.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div class="resume-outer theme-blue">
                        <div class="upper-title">
                          <h4>Work & Experience</h4>
                        </div>

                        {e.work_experience?.map((e, idx) => (
                          <div class="resume-block">
                            <div class="inner">
                              <span class="name">
                                {e.companyName.charAt(0).toUpperCase()}
                              </span>
                              <div class="title-box">
                                <div class="info-box">
                                  <h3>{e.role}</h3>
                                  <span>{e.companyName}</span>
                                </div>
                                <div class="edit-box">
                                  <span class="year">
                                    {e.startYear}-{e.endYear}
                                  </span>
                                </div>
                              </div>
                              {/*<div class="text">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Proin a ipsum tellus. Interdum
                                et malesuada fames ac ante
                                <br /> ipsum primis in faucibus.
                        </div>*/}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div class="portfolio-outer">
                        <div class="row">
                          <div class="col-lg-3 col-md-3 col-sm-6">
                            <figure class="image">
                              <a
                                href="images/resource/portfolio-1.jpg"
                                class="lightbox-image"
                              >
                                <img
                                  src="images/resource/portfolio-1.jpg"
                                  alt=""
                                />
                              </a>
                              <span class="icon flaticon-plus"></span>
                            </figure>
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-6">
                            <figure class="image">
                              <a
                                href="images/resource/portfolio-2.jpg"
                                class="lightbox-image"
                              >
                                <img
                                  src="images/resource/portfolio-2.jpg"
                                  alt=""
                                />
                              </a>
                              <span class="icon flaticon-plus"></span>
                            </figure>
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-6">
                            <figure class="image">
                              <a
                                href="images/resource/portfolio-3.jpg"
                                class="lightbox-image"
                              >
                                <img
                                  src="images/resource/portfolio-3.jpg"
                                  alt=""
                                />
                              </a>
                              <span class="icon flaticon-plus"></span>
                            </figure>
                          </div>
                          <div class="col-lg-3 col-md-3 col-sm-6">
                            <figure class="image">
                              <a
                                href="images/resource/portfolio-4.jpg"
                                class="lightbox-image"
                              >
                                <img
                                  src="images/resource/portfolio-4.jpg"
                                  alt=""
                                />
                              </a>
                              <span class="icon flaticon-plus"></span>
                            </figure>
                          </div>
                        </div>
                      </div>
                      {e.awards.length === 0 ? null : (
                        <div class="resume-outer theme-yellow">
                          <div class="upper-title">
                            <h4>Awards</h4>
                          </div>
                          {e.awards?.map((e, idx) => (
                            <div class="resume-block">
                              <div class="inner">
                                <span class="name"></span>
                                <div class="title-box">
                                  <div class="info-box">
                                    <h3>{e.certificateName}</h3>
                                    <span></span>
                                  </div>
                                  <div class="edit-box">
                                    <span class="year">{e.duration}</span>
                                  </div>
                                </div>
                                <div class="text">{e.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* <div class="video-outer">
                  <h4>Candidates About</h4>
                  <div class="video-box">
                    <figure class="image">
                      <a
                        href="https://www.youtube.com/watch?v=Fvae8nxzVz4"
                        class="play-now"
                        data-fancybox="gallery"
                        data-caption=""
                      >
                        <img src="images/resource/video-img.jpg" alt="" />
                        <i
                          class="icon flaticon-play-button-3"
                          aria-hidden="true"
                        ></i>
                      </a>
                    </figure>
                  </div>
  </div>*/}
                    </div>
                  </div>

                  <div class="sidebar-column col-lg-4 col-md-12 col-sm-12">
                    <aside class="sidebar">
                      <div class="sidebar-widget">
                        <div class="widget-content">
                          <ul class="job-overview">
                            <li>
                              <i class="icon icon-calendar"></i>
                              <h5>Experience:</h5>
                              <span>{e.experienceYears}</span>
                            </li>

                            <li>
                              <i class="icon icon-rate"></i>
                              <h5>Current Salary:</h5>
                              <span>{e.currentSalary}</span>
                            </li>

                            <li>
                              <i class="icon icon-salary"></i>
                              <h5>Expected Salary:</h5>
                              <span>{e.expectedSalary}</span>
                            </li>

                            <li>
                              <i class="icon icon-language"></i>
                              <h5>Language:</h5>

                              {e.language?.map((e, idx) => (
                                <span
                                  style={{ textTransform: "capitalize" }}
                                  key={idx}
                                >
                                  {idx > 0 ? ", " : ""}
                                  {e}
                                </span>
                              ))}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div class="sidebar-widget social-media-widget">
                        <h4 class="widget-title">Social media</h4>
                        <div class="widget-content">
                          <div class="social-links">
                            <a href="#">
                              <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="#">
                              <i class="fab fa-twitter-t"></i>
                            </a>
                            <a href="#">
                              <i class="fab fa-instagram"></i>
                            </a>
                            <a href="#">
                              <i class="fab fa-linkedin-in"></i>
                            </a>
                          </div>
                        </div>
                      </div>

                      <div class="sidebar-widget">
                        <h4 class="widget-title">Professional Skills</h4>
                        <div class="widget-content">
                          <ul class="job-skills">
                            {e.skills?.map((e, idx) => (
                              <li>
                                <a href="#">{e}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* <div class="sidebar-widget contact-widget">
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
                      </div> */}
                    </aside>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default CandidatesSingle;
{
  /*
<li>
  <i class="icon icon-expiry"></i>
  <h5>Age:</h5>
  <span>28-33 Years</span>
</li>
<li>
<i class="icon icon-user-2"></i>
<h5>Gender:</h5>
<span>Female</span>
</li>
 */
}
