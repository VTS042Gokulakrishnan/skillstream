import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Server } from "App";
import { Skeleton } from "antd";
import { Helmet } from "react-helmet";

const JobAlerts = () => {
  const navigate = useNavigate();
  const [jobAlerts, SetJobAlerts] = useState([]);
  let userId = localStorage.getItem("UserId");
  let role = localStorage.getItem("Role");
  const getApplicants = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/candidate/jobAlerts/get/${userId}/${role}`
      );

      SetJobAlerts(data.jobAlerts.jobAlerts);
      // console.log(data.jobAlerts.jobAlerts);
    } catch (error) {
      // console.log(error);
    }
  };
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
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    getApplicants();
    // console.log(jobAlerts);
  }, []);

  const deletejobAlerts = async (Id) => {
    try {
      // console.log(Id, userId);
      const { data } = await axios.delete(
        `${Server}/api/v1/candidate/jobAlerts/delete/${userId}/${Id}/${role}`
      );
      // console.log(data);
      SetJobAlerts((prevAppliedJobs) =>
        prevAppliedJobs.filter((job) => job.jobId !== Id)
      );
      toast.success("Deleted Successfully");
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <div>
      <Helmet>
        <meta
          name="IT Job Alerts US| Stay Updated on the Latest Tech Opportunities | Skillstream"
          content="Stay updated with IT job alerts from SkillStream Jobs. Get the latest tech opportunities in US delivered straight to you and never miss a chance."
        />
      </Helmet>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Job Alerts</h3>
            <div class="text">Ready to jump back in?</div>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>My Job Alerts</h4>

                    <div class="chosen-outer">
                      <select class="chosen-select">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div class="widget-content">
                    <div class="table-outer">
                      {jobAlerts.length === 0 ? (
                        <p className="text-center">No Job Alerts</p>
                      ) : (
                        <table class="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Job Title</th>
                              <th>Company Name</th>
                              <th>Created</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {jobAlerts?.map((e, subIdx) => (
                              <tr key={subIdx}>
                                <td>
                                  <h6>{e.JobTitle}</h6>
                                  <span class="info">
                                    <i class="icon flaticon-map-locator"></i>{" "}
                                    {e.City}, {e.Country}
                                  </span>
                                </td>
                                <td>{e.companyName}</td>
                                <td>{e.postedTime}</td>
                                <td>
                                  <div class="option-box">
                                    <ul class="option-list">
                                      <li>
                                        <button
                                          data-text="View Aplication"
                                          onClick={() =>
                                            navigate(
                                              `/job-detail/${e.employerId}/${e.jobId}`
                                            )
                                          }
                                        >
                                          <span class="la la-eye"></span>
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          data-text="Delete Aplication"
                                          onClick={() =>
                                            deletejobAlerts(e.jobId)
                                          }
                                        >
                                          <span class="la la-trash"></span>
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="copyright-text">
        <p>© 2024 Skill Stream. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default JobAlerts;
