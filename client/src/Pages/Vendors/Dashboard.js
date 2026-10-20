import React, { useEffect, useState } from "react";

import Chart from "chart.js/auto";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "App";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
// import ThreeDPieChart from "../../../Components/ThreeDPieChart";
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobsByMonth, setJobsByMonth] = useState({});
  const [applicantsByMonth, setApplicantsByMonth] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState("All");
  const [applicantSelectedTimeframe, setApplicantSelectedTimeframe] =
    useState("All");

  const [notifications, setNotifications] = useState([]);
  const [application, setApplication] = useState([]);
  const [shortlisted, setShortilsted] = useState([]);
  const navigate = useNavigate();

  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  let userId = localStorage.getItem("UserId");
  let token = localStorage.getItem("token");

  useEffect(() => {
    if (profileCompleted === "false") {
      navigate(`/update-profile/${token}`);
    }
  }, []);

  const getData = async () => {
    try {
      let userId = localStorage.getItem("UserId");

      const { data } = await axios.get(
        `${Server}/api/v1/vendor/details/${userId}`
      );
      setData(data?.Vendor);
      console.log(data?.Vendor);
      countJobsByTimeframe(data?.Vendor[0]?.appliedJobs, selectedTimeframe);
      countApplicantsByTimeframe(
        data?.Vendor[0]?.appliedJobs,
        applicantSelectedTimeframe
      );
      // const applied = data?.Employer[0]?.jobs.flatMap((job) =>
      //   job.applicants.filter(
      //     (applicant) => applicant.applicationStatus === "pending"
      //   )
      // );

      // setApplication(applied);

      // const shortlistedApplicants = data?.Employer[0]?.jobs.flatMap((job) =>
      //   job.applicants.filter(
      //     (applicant) => applicant.applicationStatus === "Approved"
      //   )
      // );
      // setShortilsted(shortlistedApplicants);
      // RecentApplicants(data?.Employer[0]?.allApplicants);
      // countJobsByTimeframe(data?.Employer[0]?.jobs, selectedTimeframe);
      // countApplicantsByTimeframe(data?.Employer[0]?.jobs, selectedTimeframe);
      initializeChart();
      ApplicantsChart();
      // recentNotificaions(data?.Employer[0]?.notifications);
      // countJobsByMonth(data.Employer[0].jobs);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(application);
  const options = {
    theme: "light1",
    animationEnabled: true,
    // exportFileName: "New Year Resolutions",
    // exportEnabled: true,
    // title: {
    //   text: "Top Categories of New Year's Resolution"
    // },
    data: [
      {
        type: "pie",
        showInLegend: true,
        legendText: "{label}",
        toolTipContent: "{label}: <strong>{y}%</strong>",
        indexLabel: "{y}%",
        indexLabelPlacement: "inside",
        dataPoints: [
          { y: 32, label: "Health" },
          { y: 22, label: "Finance" },
          { y: 15, label: "Education" },
          { y: 19, label: "Career" },
          { y: 5, label: "Family" },
          { y: 7, label: "Real Estate" },
        ],
      },
    ],
  };

  const addSymbols = (e) => {
    const suffixes = ["", "K", "M", "B"];
    let order = Math.max(
      Math.floor(Math.log(Math.abs(e.value)) / Math.log(1000)),
      0
    );
    if (order > suffixes.length - 1) order = suffixes.length - 1;
    const suffix = suffixes[order];
    return (
      CanvasJSReact.CanvasJS.formatNumber(e.value / Math.pow(1000, order)) +
      suffix
    );
  };

  const optionsOne = {
    // title: {
    //   text: "Basic Column Chart"
    // },
    data: [
      {
        type: "column",
        dataPoints: [
          { label: "Apple", y: 10 },
          { label: "Orange", y: 15 },
          { label: "Banana", y: 25 },
          { label: "Mango", y: 30 },
          { label: "Grape", y: 28 },
        ],
      },
    ],
  };

  const optionsTwo = {
    // exportEnabled: true,
    animationEnabled: true,
    theme: "light1",
    // title: {
    //   text: "Developer Work Week"
    // },
    // subtitles: [{
    //   text: "Median hours/week"
    // }],
    data: [
      {
        type: "doughnut",
        startAngle: 90,
        // indexLabel: "{name} ({y})",
        yValueFormatString: '#,##0.0#"%"',
        showInLegend: true,
        legendText: "{label}",
        toolTipContent: "{label}: <strong>{y}%</strong>",
        indexLabel: "{y}%",
        indexLabelPlacement: "inside",
        dataPoints: [
          { y: 32, label: "Health" },
          { y: 22, label: "Finance" },
          { y: 15, label: "Education" },
          { y: 19, label: "Career" },
          { y: 5, label: "Family" },
          { y: 7, label: "Real Estate" },
        ],
      },
    ],
  };

  const dataPoints = [
    { y: 32, label: "Health" },
    { y: 22, label: "Finance" },
    { y: 15, label: "Education" },
    { y: 19, label: "Career" },
    { y: 5, label: "Family" },
    { y: 7, label: "Real Estate" },
  ];

  const total = dataPoints[0].y;

  // Calculate percentage for each data point
  const updatedDataPoints = dataPoints.map((point, index) => ({
    ...point,
    percentage: index === 0 ? 100 : ((point.y / total) * 100).toFixed(2),
  }));

  const optionsThree = {
    animationEnabled: true,
    // title: {
    //   text: "Sales via Advertisement"
    // },
    legend: {
      horizontalAlign: "right",
      verticalAlign: "center",
      reversed: true,
    },
    data: [
      {
        type: "pyramid",
        showInLegend: true,
        // legendText: "{label}",
        // indexLabel: "{label} - {y}",
        toolTipContent: "<b>{label}</b>: {y} <b>({percentage}%)</b>",
        dataPoints: updatedDataPoints,
        // indexLabelPlacement: "inside",
      },
    ],
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
        // Filter the jobs a24pplied within the last  hours
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

  const countJobsByTimeframe = (appliedJobs, timeframe) => {
    const jobCounts = {};
    const currentDate = new Date();
    let startDate;

    switch (timeframe) {
      case "Last 7 Days":
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case "Last 15 Days":
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 15);
        break;
      case "Last 1 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        break;
      case "Last 2 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 2,
          1
        );
        break;
      case "Last 3 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 3,
          1
        );
        break;
      case "Above 6 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 6,
          1
        );
        break;
      default:
        startDate = null;
    }

    appliedJobs?.forEach((job) => {
      const jobDate = new Date(job.time);
      if (!startDate || jobDate >= startDate) {
        const monthYear = `${jobDate.toLocaleString("default", {
          month: "long",
        })}-${jobDate.getFullYear()}`;
        jobCounts[monthYear] = (jobCounts[monthYear] || 0) + 1;
      }
    });

    setJobsByMonth(jobCounts);
  };

  const countApplicantsByTimeframe = (appliedJobs, timeframe) => {
    const applicantCounts = {};
    const currentDate = new Date();
    let startDate;

    switch (timeframe) {
      case "Last 7 Days":
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case "Last 15 Days":
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 15);
        break;
      case "Last 1 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        break;
      case "Last 2 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 2,
          1
        );
        break;
      case "Last 3 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 3,
          1
        );
        break;
      case "Above 6 Months":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 6,
          1
        );
        break;
      default:
        startDate = new Date(2000, 0, 1); // Show all
    }

    appliedJobs?.forEach((job) => {
      const filteredApplicants = job?.applicants?.filter((app) => {
        const appliedDate = new Date(app.time);
        return appliedDate >= startDate;
      });

      if (filteredApplicants?.length > 0) {
        const jobLabel = job.JobTitle || "Untitled Job";
        applicantCounts[jobLabel] =
          (applicantCounts[jobLabel] || 0) + filteredApplicants.length;
      }
    });

    setApplicantsByMonth(applicantCounts);
  };
  const handleTimeframeChange = async (event) => {
    setSelectedTimeframe(event.target.value);

    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/vendor/details/${userId}`
      );
      countJobsByTimeframe(data?.Vendor[0]?.appliedJobs, event.target.value);
      // countJobsByTimeframe(data.Employer[0].jobs, selectedTimeframe);
    } catch (error) {
      // console.log(error);
    }
  };
  const handleApplicantTimeframeChange = async (event) => {
    const timeframe = event.target.value;
    setApplicantSelectedTimeframe(timeframe);

    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/vendor/details/${userId}`
      );
      countApplicantsByTimeframe(data?.Vendor[0]?.appliedJobs, timeframe);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };
  // console.log(applicants);
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    getData();
  }, []);

  // Dynamically update both charts when data changes
  useEffect(() => {
    initializeChart();
  }, [jobsByMonth]);

  useEffect(() => {
    ApplicantsChart();
  }, [applicantsByMonth]);

  const initializeChart = () => {
    const ctx = document.getElementById("chart").getContext("2d");
    const labels = Object.keys(jobsByMonth);
    const dataValues = Object.values(jobsByMonth);

    // Destroy any existing Chart instance
    if (window.jobsChart !== undefined) {
      window.jobsChart.destroy();
    }

    // Create a new Chart instance
    window.jobsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Jobs by Month",
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
  const ApplicantsChart = () => {
    const ctx = document.getElementById("applicant-chart").getContext("2d");
    const labels = Object.keys(applicantsByMonth);
    const dataValues = Object.values(applicantsByMonth);

    // Destroy any existing Chart instance
    if (window.applicantsChart !== undefined) {
      window.applicantsChart.destroy();
    }

    // Create a new Chart instance
    window.applicantsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Applicants Count",
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
  console.log(notifications);
  //  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 1 Months");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // const handleApplicantTimeframeChange = (e) => {
  //   setSelectedTimeframe(e.target.value);
  // };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const RecentApplicants = (applicants) => {
    try {
      // Sort the appliedJobs array based on the time property in descending order
      const sort = applicants.sort(
        (a, b) => new Date(b.time) - new Date(a.time)
      );
      // console.log(sort);

      let recentApplicants;

      if (sort?.length <= 6) {
        // If three or fewer jobs, return the array as it is
        // console.log("hello");

        recentApplicants = applicants;
      } else {
        // Filter the jobs applied within the last 24 hours
        recentApplicants = sort?.slice(0, 6);
        // const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        // recentAppliedJobs = data?.appliedJobs?.filter(
        //   (job) => new Date(job.time) > cutoffTime
        // );
      }
      setApplicants(recentApplicants);
      // console.log(recentApplicants);
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <div>
      <Helmet>
        <meta
          name="IT Job Portal | Job Search Canada | Latest IT Vacancies | Skillstream"
          content="SkillStream is Canada's top IT job portal. Find the latest IT vacancies and connect with leading companies. Simplify your job search and land at your dream job."
        />
      </Helmet>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Howdy, {data[0]?.name} !</h3>
          </div>
          <div className="row">
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/vendor/appliedJobs">
                <div className="ui-item">
                  <div className="left">
                    <i className="icon la la-briefcase"></i>
                  </div>
                  <div className="right">
                    <h4>
                      {data[0] && data[0].appliedJobs
                        ? data[0].appliedJobs.length
                        : 0}
                    </h4>
                    <p>Applied Jobs</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/vendor/manage/candidates">
                <div className="ui-item ui-red">
                  <div className="left">
                    <i className="icon la la-users"></i>
                  </div>
                  <div className="right">
                    <h4>
                      {data[0] && data[0]?.candidates
                        ? data[0]?.candidates?.length
                        : 0}
                    </h4>
                    <p>Total Candidates</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/vendor/jobAlerts">
                <div className="ui-item ui-yellow">
                  <div className="left">
                    <i className="icon la la-bell"></i>
                  </div>
                  <div className="right">
                    <h4>
                      {data[0] && data[0]?.jobAlerts
                        ? data[0]?.jobAlerts?.length
                        : 0}
                    </h4>
                    <p>Job Alerts</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <Link to="/vendor/shortlisted-jobs">
                <div className="ui-item ui-green">
                  <div className="left">
                    <i className="icon la la-bookmark-o"></i>
                  </div>
                  <div className="right">
                    <h4>
                      {data[0] && data[0]?.shortlistedJobs
                        ? data[0]?.shortlistedJobs?.length
                        : 0}
                    </h4>
                    <p>Shortlist Jobs</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div class="row">
            <div class="col-xl-6 col-lg-3">
              <div class="graph-widget ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>Applied Jobs</h4>
                    <div className="chosen-outer">
                      <select
                        className="chosen-select"
                        value={selectedTimeframe}
                        onChange={handleTimeframeChange}
                      >
                        <option>Last 7 Days</option>
                        <option>Last 15 Days</option>
                        <option>Last 1 Months</option>
                        <option>Last 2 Months</option>
                        <option>Last 3 Months</option>
                        <option>Above 6 Months</option>
                        {/* <option>Select Range</option>*/}
                      </select>
                    </div>
                  </div>
                  {/*selectedTimeframe === "Select Range" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        padding: "20px",
                      }}
                      className="flex justify-center align-center border-b border-t border-gray-300"
                    >
                     
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 ">
                          From
                        </label>
                        <br />
                        <input
                          type="date"
                          value={startDate}
                          onChange={handleStartDateChange}
                          className="border border-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 ">
                          To
                        </label>
                        <br />
                        <input
                          type="date"
                          value={endDate}
                          onChange={handleEndDateChange}
                          className="border border-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )*/}
                  <div class="widget-content">
                    <canvas
                      id="chart"
                      // width="50"
                      style={{ width: "100%", height: "200px" }}
                      // height="20"
                      className="pie-mob"
                    ></canvas>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-3">
              <div className="graph-widget ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Applied Jobs with Applicants </h4>
                    <div className="chosen-outer">
                      <select
                        className="chosen-select"
                        value={applicantSelectedTimeframe}
                        onChange={handleApplicantTimeframeChange}
                      >
                        <option>Last 7 Days</option>
                        <option>Last 15 Days</option>
                        <option>Last 1 Months</option>
                        <option>Last 2 Months</option>
                        <option>Last 3 Months</option>
                        <option>Above 6 Months</option>
                        {/* <option>Select Range</option>*/}
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <canvas
                      className="pie-mob"
                      id="applicant-chart"
                      width="100"
                      height="45"
                    ></canvas>
                    {/* <CanvasJSChart
                      options={options}
                      containerProps={{ width: "100%", height: "200px" }}
                    /> */}
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

export default Dashboard;
{
  /* <div class="col-lg-12">
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
                          {e?.type === "Shortlist Job" ? (
                            <li>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              <a
                              // onClick={() =>
                              //   navigate(`/candidates-single/${e.userId}`)
                              // }
                              >
                                <strong>{e?.name}</strong>
                              </a>{" "}
                              shortlisted your job{" "}
                              <a
                                onClick={() =>
                                  navigate(`/job-detail/${userId}/${e.jobId}`)
                                }
                              >
                                <span class="colored">{e?.JobTitle}</span>
                              </a>
                            </li>
                          ) : (
                            <li>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              <a onClick={() => navigate(`/applicants`)}>
                                <strong>{e?.name}</strong>
                              </a>{" "}
                              applied for a job{" "}
                              <a
                                onClick={() =>
                                  navigate(`/job-detail/${userId}/${e.jobId}`)
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
            </div>*/
}
