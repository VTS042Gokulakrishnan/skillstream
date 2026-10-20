import React, { useState, useEffect } from "react";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../../App";
import { useNavigate, Link } from "react-router-dom";
const ResumesAlerts = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  let token = localStorage.getItem("token");

  const getData = async () => {
    try {
      let userId = localStorage.getItem("UserId");

      const { data } = await axios.get(`${Server}/api/v1/employer/${userId}`);
      const sort = data?.Employer[0]?.notifications?.sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      setNotifications(sort);
      await axios.post(
        `${Server}/api/v1/employer/read/notifications/${userId}`,
        {}, // empty body (since you're just updating read status)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data?.Employer[0]?.notifications);
      // countJobsByMonth(data.Employer[0].jobs);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Notifications</h3>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>My Notifications</h4>
                  </div>
                  {notifications?.length === 0 ? (
                    <p style={{ textAlign: "center" }}>No Notifications</p>
                  ) : (
                    <div class="widget-content">
                      <div class="table-outer">
                        <table class="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Alerts</th>
                              {/**
        <th>Alert Query</th>
        <th>Number Jobs</th>
        <th>Times</th> */}
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {notifications?.map((alerts, idx) => (
                              <>
                                {alerts?.type === "Shortlist Job" ? (
                                  <tr key={idx}>
                                    <td>
                                      <a
                                      // onClick={() =>
                                      //   navigate(
                                      //     `/candidates-single/${alerts.userId}`
                                      //   )
                                      // }
                                      >
                                        <strong>{alerts.name}</strong>
                                      </a>{" "}
                                      shortlisted your job{" "}
                                      <a
                                        onClick={() => navigate(`/applicants`)}
                                      >
                                        <strong>{alerts?.JobTitle}</strong>
                                      </a>{" "}
                                    </td>

                                    <td>
                                      <div class="option-box">
                                        <ul class="option-list">
                                          <li>
                                            <button
                                              data-text="View Application"
                                              onClick={() =>
                                                navigate(`/applicants`)
                                              }
                                            >
                                              <span class="la la-eye"></span>
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={idx}>
                                    <td>
                                      <a
                                      // onClick={() =>
                                      //   navigate(
                                      //     `/candidates-single/${alerts.userId}`
                                      //   )
                                      // }
                                      >
                                        <strong>{alerts.name}</strong>
                                      </a>{" "}
                                      applied for a Job{" "}
                                      <a
                                        onClick={() => navigate(`/applicants`)}
                                      >
                                        <strong>{alerts?.JobTitle}</strong>
                                      </a>{" "}
                                    </td>

                                    <td>
                                      <div class="option-box">
                                        <ul class="option-list">
                                          <li>
                                            <button
                                              data-text="View Application"
                                              onClick={() =>
                                                navigate(`/applicants`)
                                              }
                                            >
                                              <span class="la la-eye"></span>
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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

export default ResumesAlerts;
