import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Server } from "../../App";
import { Skeleton } from "antd";
import image from "../../assets/images/resource/company-logo/5-1.png";
import moment from "moment";
import TimeDifference from "../../Components/TimeDifference";
import { Toaster, toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import "./EmployerSingle.css";
const EmployersSingle = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [employers, setEmployers] = useState([]);
  const [relativeTime, setRelativeTime] = useState("");
  const [company, setCompany] = useState("");
  const [time, setTime] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(3); // Number of jobs per page
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);

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
  // const demo = formatDistanceToNow(new Date(time), {
  //   addSuffix: true,
  // });
  const getallEmployers = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/employer/${params.id}`
      );
      // console.log(data);
      setEmployers(data.Employer);
      setCompany(data.Employer.companyName);
    } catch (error) {
      // console.log(error);
    }
  };
  const jobStartIndex = (currentPage - 1) * jobsPerPage;
  const jobEndIndex = jobStartIndex + jobsPerPage;
  const jobsOnPage = employers[0]?.jobs.slice(jobStartIndex, jobEndIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // console.log(relativeTime);
  useEffect(() => {
    getallEmployers();
  }, []);
  let userId = localStorage.getItem("UserId");

  const handleShortlistJob = async (e) => {
    try {
      console.log(employers[0]);
      let jobDetails = {
        jobId: e.jobId,
        jobTitle: e.JobTitle,
        companyName: employers[0]?.companyName,
        categories: e.Industry,
        city: employers[0]?.city,
        country: employers[0]?.country,
        logo: employers[0]?.image,
        empId: e.userId,
        email: e.EmailAddress,
        role: role,
        region: "United States",
      };
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/shortlistJob/add/${userId}`,
        jobDetails
      );
      // console.log(data);
      toast.success("Shortlisted Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Error in Shortlisting the job");
    }
  };
  const renderValue = (value) => (value ? value : "N/A");
  return (
    <div>
      {employers?.length === 0 ? (
        <Skeleton>
          <div></div>
          <div></div>
          <div></div>
        </Skeleton>
      ) : (
        employers?.map((e, idx) => (
          <section class="job-detail-section">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="upper-box">
              <div className="auto-container">
                <div className="job-block-seven">
                  <div className="inner-box">
                    <div className="content">
                      <span className="company-logo">
                        <img src={e.image || image} alt="" />
                      </span>
                      <h4>
                        <a href="#">{renderValue(e.companyName)}</a>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-map-locator"></span>{" "}
                          {renderValue(e.city)}, {renderValue(e.country)}
                        </li>
                        <li>
                          <span className="icon flaticon-briefcase"></span>{" "}
                          {renderValue(e.primaryIndustry)}
                        </li>
                        <li>
                          <span className="icon flaticon-telephone-1"></span>{" "}
                          {renderValue(e.phone)}
                        </li>
                        <li>
                          <span className="icon flaticon-mail"></span>{" "}
                          {renderValue(e.email)}
                        </li>
                      </ul>
                      <ul className="job-other-info">
                        <li className="time">Open Jobs – {e.jobs.length}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="job-detail-outer">
              <div class="auto-container">
                <div class="row">
                  <div class="content-column col-lg-8 col-md-12 col-sm-12">
                    <div class="job-detail">
                      <h4>About Company</h4>
                      <p>{e.description}</p>
                    </div>

                    <div class="related-jobs">
                      <div class="title-box">
                        <h3>
                          {e.jobs.length} jobs at {e.companyName}
                        </h3>
                        <div class="text"></div>
                      </div>
                      {jobsOnPage?.map((job, idx) => (
                        <div className="job-block" key={idx}>
                          <div className="inner-box">
                            <div className="content">
                              <span className="company-logo">
                                <img
                                  src={employers[0]?.image || image}
                                  alt=""
                                />
                              </span>
                              <h4>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/job-detail/${params.id}/${job.jobId}`
                                    )
                                  }
                                >
                                  {renderValue(job.JobTitle)},{" "}
                                  {renderValue(e.companyName)}
                                </button>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-briefcase"></span>{" "}
                                  {renderValue(job.Industry)}
                                </li>
                                <li>
                                  <span className="icon flaticon-map-locator"></span>{" "}
                                  {renderValue(job.City)},{" "}
                                  {renderValue(job.Country)}
                                </li>
                                <li>
                                  <span className="icon flaticon-clock-3"></span>{" "}
                                  {formatDistanceToNow(new Date(job.time), {
                                    addSuffix: true,
                                  })}
                                </li>
                                <li>
                                  <span className="icon flaticon-money"></span>
                                  {renderValue(job.offeredSalary)}
                                </li>
                              </ul>
                              <ul className="job-other-info">
                                <li className="time">
                                  {renderValue(job.JobType)}
                                </li>
                                <li className="required">
                                  {renderValue(job.employmentType)}
                                </li>
                              </ul>
                              <button
                                className="bookmark-btn"
                                onClick={() => handleShortlistJob(job)}
                              >
                                <span className="flaticon-bookmark"></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pagination">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </button>
                        <button
                          disabled={
                            currentPage ===
                            Math.ceil(e.jobs.length / jobsPerPage)
                          }
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="sidebar-column col-lg-4 col-md-12 col-sm-12">
                    <aside class="sidebar">
                      <div class="sidebar-widget company-widget">
                        <div class="widget-content">
                          <ul class="company-info mt-0">
                            <li>
                              Primary industry:{" "}
                              <span>{renderValue(e.primaryIndustry)}</span>
                            </li>
                            <li>
                              Company size:{" "}
                              <span>{renderValue(e.teamSize)}</span>
                            </li>
                            <li>
                              Founded in:{" "}
                              <span>{renderValue(e.foundedIn)}</span>
                            </li>
                            <li>
                              Phone: <span>{renderValue(e.phone)}</span>
                            </li>
                            <li>
                              Email: <span>{renderValue(e.email)}</span>
                            </li>
                            <li>
                              Location:{" "}
                              <span>
                                {renderValue(e.city)}, {renderValue(e.country)}
                              </span>
                            </li>
                            {e.social.length != 0 && (
                              <li>
                                Social media:
                                {e.social?.map((social, idx) => (
                                  <div class="social-links">
                                    <a href={e.Facebook}>
                                      <i class="fab fa-facebook-f"></i>
                                    </a>
                                    <a href={e.twitter}>
                                      <i class="fab fa-twitter-t"></i>
                                    </a>
                                    <a href={e.Instagram}>
                                      <i class="fab fa-instagram"></i>
                                    </a>
                                    <a href={e.linkedIn}>
                                      <i class="fab fa-linkedin-in"></i>
                                    </a>
                                  </div>
                                ))}
                              </li>
                            )}
                          </ul>

                          {e.website && (
                            <div class="btn-box">
                              <a
                                href={e.website}
                                class="theme-btn btn-style-three"
                              >
                                {e.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
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

export default EmployersSingle;

{
  /*<div class="row images-outer">
                        <div class="col-lg-3 col-md-3 col-sm-6">
                          <figure class="image">
                            <a
                              href="images/resource/employers-single-1.png"
                              class="lightbox-image"
                              data-fancybox="gallery"
                            >
                              <img
                                src="images/resource/employers-single-1.png"
                                alt=""
                              />
                            </a>
                          </figure>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                          <figure class="image">
                            <a
                              href="images/resource/employers-single-2.png"
                              class="lightbox-image"
                              data-fancybox="gallery"
                            >
                              <img
                                src="images/resource/employers-single-2.png"
                                alt=""
                              />
                            </a>
                          </figure>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                          <figure class="image">
                            <a
                              href="images/resource/employers-single-3.png"
                              class="lightbox-image"
                              data-fancybox="gallery"
                            >
                              <img
                                src="images/resource/employers-single-3.png"
                                alt=""
                              />
                            </a>
                          </figure>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                          <figure class="image">
                            <a
                              href="images/resource/employers-single-4.png"
                              class="lightbox-image"
                              data-fancybox="gallery"
                            >
                              <img
                                src="images/resource/employers-single-4.png"
                                alt=""
                              />
                            </a>
                          </figure>
                        </div>
                      </div>
                      <p>
                        Moody’s Corporation, often referred to as Moody’s, is an
                        American business and financial services company. It is
                        the holding company for Moody’s Investors Service (MIS),
                        an American credit rating agency, and Moody’s Analytics
                        (MA), an American provider of financial analysis
                        software and services.
                      </p>
                      <p>
                        Moody’s was founded by John Moody in 1909 to produce
                        manuals of statistics related to stocks and bonds and
                        bond ratings. Moody’s was acquired by Dun & Bradstreet
                        in 1962. In 2000, Dun & Bradstreet spun off Moody’s
                        Corporation as a separate company that was listed on the
                        NYSE under MCO. In 2007, Moody’s Corporation was split
                        into two operating divisions, Moody’s Investors Service,
                        the rating agency, and Moody’s Analytics, with all of
                        its other products.
                </p>*/
}
{
  /*
                      <div class="sidebar-widget">
                        <h4 class="widget-title">Job Location</h4>
                        <div class="widget-content">
                          <div class="map-outer mb-0">
                            <div
                              class="map-canvas"
                              data-zoom="12"
                              data-lat="-37.817085"
                              data-lng="144.955631"
                              data-type="roadmap"
                              data-hue="#ffc400"
                              data-title="Envato"
                              data-icon-path="images/resource/map-marker.png"
                              data-content="Melbourne VIC 3000, Australia<br><a href='mailto:info@youremail.com'>info@youremail.com</a>"
                            ></div>
                          </div>
                        </div>
                              </div>*/
}
