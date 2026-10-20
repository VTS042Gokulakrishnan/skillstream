import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Server } from "../../../App";
import { Skeleton } from "antd";
const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);

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
  const getApplicants = async () => {
    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/candidate/jobs/getJob/${userId}`
      );

      setAppliedJobs(data.appliedJobs.appliedJobs);
      // console.log(data.appliedJobs.appliedJobs);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    getApplicants();
  }, []);
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  let userId = localStorage.getItem("UserId");
  const deleteAppliedJobs = async (Id) => {
    try {
      // console.log(Id, userId);
      const { data } = await axios.delete(
        `${Server}/api/v1/candidate/jobs/delete/${userId}/${Id}`
      );
      // console.log(data);
      setAppliedJobs((prevAppliedJobs) =>
        prevAppliedJobs.filter((job) => job.jobId !== Id)
      );
      toast.success("Deleted Successfully");
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Applied Jobs</h3>
            <div class="text">Ready to jump back in?</div>
          </div>
          <Toaster position="top-center" reverseOrder={false} />
          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>My Applied Jobs</h4>

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
                      {appliedJobs.length === 0 ? (
                        <p class="text-center">No Applied Jobs</p>
                      ) : (
                        <table class="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Job Title</th>
                              <th>Date Applied</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appliedJobs?.map((e, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div class="job-block">
                                    <div class="inner-box">
                                      <div class="content">
                                        <span class="company-logo">
                                          <img src={e.image} alt="" />
                                        </span>
                                        <h4>
                                          <a href="#">{e.JobTitle}</a>
                                        </h4>
                                        <ul class="job-info">
                                          <li>
                                            <span class="icon flaticon-briefcase"></span>{" "}
                                            {e.Industry}
                                          </li>
                                          <li>
                                            <span class="icon flaticon-map-locator"></span>{" "}
                                            {e.city}, {e.country}
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>{e.appliedTime}</td>
                                <td class="status">{e.status}</td>
                            
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
                                          onClick={() =>
                                            deleteAppliedJobs(e.jobId)
                                          }
                                          data-text="Delete Aplication"
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

export default AppliedJobs;
