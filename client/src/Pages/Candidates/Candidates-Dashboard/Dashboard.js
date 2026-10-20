import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "jquery-knob/js/jquery.knob.js";
import "jquery.appear";
import Chart from "chart.js/auto";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../../App";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  const [viewsByMonth, setViewsByMonth] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState("All Time");

  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let token = localStorage.getItem("token");

  let role = localStorage.getItem("Role");
  useEffect(() => {
    if (profileCompleted === "false") {
      navigate(`/update-profile/${token}`);
    }
  }, []);
  const chartRef = useRef(null);
  useEffect(() => {
    // Dial/Knob
    if ($(".dial").length) {
      var elm = $(".dial");
      var color = elm.attr("data-fgColor");
      var perc = elm.attr("value");

      elm.knob({
        value: 0,
        min: 0,
        max: 100,
        skin: "tron",
        readOnly: true,
        thickness: 0.45,
        dynamicDraw: true,
        displayInput: false,
      });

      $({ value: 0 }).animate(
        { value: perc },
        {
          duration: 2000,
          easing: "swing",
          progress: function () {
            elm.val(Math.ceil(this.value)).trigger("change");
          },
        }
      );

      var $t = $(".pie-graph .count-box"),
        n = $t.find(".count-text").attr("data-stop"),
        r = parseInt($t.find(".count-text").attr("data-speed"), 10);

      if (!$t.hasClass("counted")) {
        $t.addClass("counted");
        $({
          countNum: $t.find(".count-text").text(),
        }).animate(
          {
            countNum: n,
          },
          {
            duration: r,
            easing: "linear",
            step: function () {
              $t.find(".count-text").text(Math.floor(this.countNum));
            },
            complete: function () {
              $t.find(".count-text").text(this.countNum);
            },
          }
        );
      }
    }
  }, []);

  const [data, setData] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const getData = async () => {
    try {
      let userId = localStorage.getItem("UserId");

      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      setData(data?.Candidate[0]);
      // console.log(data?.Candidate[0]);
      RecentAppliedJobs(data?.Candidate[0]);
      recentNotificaions(data?.Candidate[0]?.notifications);
      countJobsByTimeframe(data?.Candidate[0]?.profileViews, selectedTimeframe);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    getData();
    RecentAppliedJobs();
  }, []);
  // useEffect(() => {
  //   if (token === null) {
  //     toast.error("Please login")
  //     // setTimeout(() => {
  //       navigate("/");
  //     // }, 200);
  //   }
  // },[]);
  const countJobsByTimeframe = (profileViews, timeframe) => {
    const profileViewsCounts = {};
    const currentDate = new Date();
    let startDate;

    switch (timeframe) {
      case "Last 6 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 5,
          1
        );
        break;
      case "Last 12 Months":
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          1
        );
        break;
      case "Last 16 Months":
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth() - 3,
          1
        );
        break;
      case "Last 24 Months":
        startDate = new Date(
          currentDate.getFullYear() - 2,
          currentDate.getMonth(),
          1
        );
        break;
      case "Last 5 year":
        startDate = new Date(
          currentDate.getFullYear() - 5,
          currentDate.getMonth(),
          1
        );
        break;
      default:
        startDate = null; // For "All Time"
    }

    profileViews.forEach((profileViews) => {
      const jobDate = new Date(profileViews.time);
      if (jobDate >= startDate) {
        const monthYear = `${jobDate.toLocaleString("default", {
          month: "long",
        })}-${jobDate.getFullYear()}`;
        profileViewsCounts[monthYear] =
          (profileViewsCounts[monthYear] || 0) + 1;
      }
    });

    setViewsByMonth(profileViewsCounts);
  };

  const handleTimeframeChange = async (event) => {
    setSelectedTimeframe(event.target.value);

    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      countJobsByTimeframe(
        data?.Candidate[0]?.profileViews,
        event.target.value
      );
      // countJobsByTimeframe(data.Employer[0].jobs, selectedTimeframe);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(viewsByMonth);

  useEffect(() => {
    const initializeChart = () => {
      if (Chart.defaults.global === undefined) {
        Chart.defaults.global = {};
      }
      const labels = Object.keys(viewsByMonth);
      const dataValues = Object.values(viewsByMonth);
      // Set default font properties for Chart.js
      Chart.defaults.global.defaultFontFamily = "Sofia Pro";
      Chart.defaults.global.defaultFontColor = "#888";
      Chart.defaults.global.defaultFontSize = 14;

      var ctx = document.getElementById("chart1").getContext("2d");
      // Show a message if no data is available
      // if (dataValues.length === 0) {
      //   document.getElementById("chart-container").innerHTML =
      //     "<p style='text-align: center;'>No profile views</p>";
      //   return;
      // }

      // Destroy any existing Chart instance
      if (window.myChart !== undefined) {
        window.myChart.destroy();
      }

      // Create a new Chart instance
      window.myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Views by Month",
              data: dataValues,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9966",
              ],
            },
          ],
        },
        options: {
          layout: {
            padding: 10,
          },
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
      });
    };

    // Initialize the chart when the component mounts
    initializeChart();

    // Clean up the Chart instance when the component unmounts
    return () => {
      if (window.myChart !== undefined) {
        window.myChart.destroy();
      }
    };
  }, [viewsByMonth]);
  // useEffect(() => {
  //   initializeChart();
  // }, [viewsByMonth]);
  const initializeChart = () => {
    const ctx = document.getElementById("chart").getContext("2d");
    const labels = Object.keys(viewsByMonth);
    const dataValues = Object.values(viewsByMonth);

    // console.log(dataValues);

    // Destroy any existing Chart instance
    if (window.myChart !== undefined) {
      window.myChart.destroy();
    }

    // Create a new Chart instance
    window.myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Views by Month",
            data: dataValues,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9966",
            ],
          },
        ],
      },
      options: {
        layout: {
          padding: 10,
        },
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
    });
  };
  const recentNotificaions = (notification) => {
    try {
      const sort = notification?.sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      // console.log(sort);
      let recentNotifications;
      if (sort?.length <= 6) {
        // If three or fewer jobs, return the array as it is
        // console.log("hello");

        recentNotifications = notification;
      } else {
        // Filter the jobs applied within the last 24 hours
        recentNotifications = sort?.slice(0, 6);
        // const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        // recentAppliedJobs = data?.appliedJobs?.filter(
        //   (job) => new Date(job.time) > cutoffTime
        // );
      }
      setNotifications(recentNotifications);
    } catch (error) {
      // console.log(error.response.data.message);
    }
  };
  const RecentAppliedJobs = (jobs) => {
    try {
      // Sort the appliedJobs array based on the time property in descending order
      const sort = jobs?.appliedJobs?.sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      // console.log(sort);

      let recentAppliedJobs;

      if (sort?.length <= 6) {
        // If three or fewer jobs, return the array as it is
        // console.log("hello");

        recentAppliedJobs = jobs?.appliedJobs;
      } else {
        // Filter the jobs applied within the last 24 hours
        recentAppliedJobs = sort?.slice(0, 6);
        // const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        // recentAppliedJobs = data?.appliedJobs?.filter(
        //   (job) => new Date(job.time) > cutoffTime
        // );
      }
      setAppliedJobs(recentAppliedJobs);
      // console.log(recentAppliedJobs);
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Howdy, {data?.name}!</h3>
            <div class="text">Ready to jump back in?</div>
          </div>
          <div class="row">
            <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/applied-jobs">
                <div class="ui-item">
                  <div class="left">
                    <i class="icon flaticon-briefcase"></i>
                  </div>
                  <div class="right">
                    <h4>
                      {data && data?.appliedJobs ? data.appliedJobs.length : 0}
                    </h4>
                    <p>Applied Jobs</p>
                  </div>
                </div>
              </Link>
            </div>

            <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/job-alerts">
                <div class="ui-item ui-red">
                  <div class="left">
                    <i class="icon la la-file-invoice"></i>
                  </div>
                  <div class="right">
                    <h4>
                      {data && data?.jobAlerts ? data?.jobAlerts?.length : 0}
                    </h4>
                    <p>Job Alerts</p>
                  </div>
                </div>
              </Link>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/messages">
                <div class="ui-item ui-yellow">
                  <div class="left">
                    <i class="icon la la-comment-o"></i>
                  </div>
                  <div class="right">
                    <h4>
                      {data && data?.messages ? data?.messages.length : 0}
                    </h4>
                    <p>Messages</p>
                  </div>
                </div>
              </Link>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/shortlisted-jobs">
                <div class="ui-item ui-green">
                  <div class="left">
                    <i class="icon la la-bookmark-o"></i>
                  </div>
                  <div class="right">
                    <h4>
                      {" "}
                      {data && data?.shortlistedJobs
                        ? data?.shortlistedJobs?.length
                        : 0}
                    </h4>
                    <p>Shortlist</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-7">
              <div class="graph-widget ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>Your Profile Views</h4>
                    <div class="chosen-outer">
                      <select
                        class="chosen-select"
                        value={selectedTimeframe}
                        onChange={handleTimeframeChange}
                      >
                        <option>All</option>
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div class="widget-content">
                    <canvas
                      id="chart1"
                      width="100"
                      height="45"
                      className="pie-mob"
                    ></canvas>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-5">
              <div class="notification-widget ls-widget">
                <div class="widget-title">
                  <h4>Notifications</h4>
                </div>
                <div class="widget-content">
                  <ul class="notification-list">
                    {notifications?.length === 0 ? (
                      <p style={{ textAlign: "center" }}>No Notifications</p>
                    ) : (
                      notifications?.map((e, idx) => (
                        <>
                          {e?.type === "Resume Shorlist" ? (
                            <li key={idx}>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              <strong>{e?.companyName}</strong> shortlisted your
                              resume{" "}
                              <a
                                onClick={() =>
                                  navigate(`/employers/${e?.employerId}`)
                                }
                              >
                                <span class="colored">{e?.JobTitle}</span>
                              </a>
                            </li>
                          ) : e?.type === "Job Approval" ? (
                            <li key={idx}>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              <strong>{e?.companyName}</strong> accepted your
                              application{" "}
                              <a
                                onClick={() =>
                                  navigate(
                                    `/job-detail/${e?.employerId}/${e?.jobId}`
                                  )
                                }
                              >
                                <span class="colored">{e?.JobTitle}</span>
                              </a>
                            </li>
                          ) : e?.type === "Job Reject" ? (
                            <li key={idx}>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              <strong>{e.companyName}</strong> rejected your
                              application{" "}
                              <a
                                onClick={() =>
                                  navigate(
                                    `/job-detail/${e?.employerId}/${e?.jobId}`
                                  )
                                }
                              >
                                <span class="colored">{e?.JobTitle}</span>
                              </a>
                            </li>
                          ) : (
                            <li key={idx}>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              <strong>{e.companyName}</strong> posted a job{" "}
                              <a
                                onClick={() =>
                                  navigate(
                                    `/job-detail/${e?.employerId}/${e?.jobId}`
                                  )
                                }
                              >
                                <span class="colored">{e?.JobTitle}</span>
                              </a>
                            </li>
                          )}
                        </>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* <div class="col-lg-12">
              <div class="applicants-widget ls-widget">
                <div class="widget-title">
                  <h4>Jobs Applied Recently</h4>
                </div>
                <div class="widget-content">
                  <div class="row">
                    {appliedJobs?.map((e, idx) => (
                      <div
                        class="job-block col-lg-6 col-md-12 col-sm-12"
                        key={idx}
                      >
                        <a
                          onClick={() =>
                            navigate(`/job-detail/${e?.employerId}/${e?.jobId}`)
                          }
                        >
                          <div class="inner-box">
                            <div class="content">
                              <span class="company-logo">
                                <img src={e?.image} alt="" />
                              </span>
                              <h4>
                                <a
                                  onClick={() =>
                                    navigate(
                                      `/job-detail/${e?.employerId}/${e?.jobId}`
                                    )
                                  }
                                >
                                  {e?.JobTitle}
                                </a>
                              </h4>
                              <ul class="job-info">
                                <li>
                                  <span class="icon flaticon-briefcase"></span>{" "}
                                  {e?.Industry}
                                </li>
                                <li>
                                  <span class="icon flaticon-map-locator"></span>{" "}
                                  {e?.city}, {e?.country}
                                </li>
                                <li>
                                  <span class="icon flaticon-clock-3"></span>{" "}
                                  {formatDistanceToNow(new Date(e?.time), {
                                    addSuffix: true,
                                  })}
                                </li>
                                <li>
                                  <span class="icon flaticon-money"></span>
                                  {e?.offeredSalary}
                                </li>
                              </ul>
                              <ul class="job-other-info">
                                <li class="time">{e?.jobType}</li>
                                <li class="privacy">{e?.employmentType}</li>
                              </ul>
                            </div>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>*/}
          </div>
        </div>

        <div class="copyright-text">
          <p>© 2024 Skill Stream. All Right Reserved.</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
