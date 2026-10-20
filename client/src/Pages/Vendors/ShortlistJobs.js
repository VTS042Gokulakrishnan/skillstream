import React, { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "App";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";

const ShortlistJobs = () => {
  const [data, setData] = useState([]);
  const params = useParams();
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
  let userId = localStorage.getItem("UserId");
  const getshortlistedResumes = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/candidate/shortlistJob/view/${userId}/${role}`
      );
      // console.log(data);
      setData(data.shortlisted);
    } catch (error) {
      // console.log("Error: ", error);
    }
  };
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    getshortlistedResumes();
  }, []);

  const deleteShortlisrted = async (Id) => {
    try {
      // console.log(Id);
      const { data } = await axios.delete(
        `${Server}/api/v1/candidate/shortlistJob/delete/${userId}/${Id}/${role}`
      );
      // console.log(data);
      toast.success("Deleted Successfully");
      setData((prevData) => prevData.filter((item) => item.jobId !== Id));
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Shorlisted Jobs</h3>
            <div class="text">Ready to jump back in?</div>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>My Favorite Jobs</h4>
                    <Toaster position="top-center" reverseOrder={false} />
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
                      {data?.length === 0 ? (
                        <p class="text-center">No Shortlisted Jobs</p>
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
                            {data?.map((e, idx) => (
                              <tr>
                                <td>
                                  <div class="job-block">
                                    <div class="inner-box">
                                      <div class="content">
                                        <span class="company-logo">
                                          <img src={e.logo} alt="" />
                                        </span>
                                        <h4>
                                          <a href="#">{e.jobTitle}</a>
                                        </h4>
                                        <ul class="job-info">
                                          <li>
                                            <span class="icon flaticon-briefcase"></span>{" "}
                                            {e.categories}
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
                                <td>{e.shortlistedTime}</td>
                                <td class="status">{e.active}</td>
                                <td>
                                  <div class="option-box">
                                    <ul class="option-list">
                                      <li>
                                        <button
                                          data-text="View Aplication"
                                          onClick={() =>
                                            navigate(
                                              `/job-detail/${e.empId}/${e.jobId}`
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
                                            deleteShortlisrted(e.jobId)
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

export default ShortlistJobs;
