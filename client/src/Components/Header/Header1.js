import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import Resume from "../../Components/Header/Resume";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";
import { Button, Drawer } from "antd";

import logo2 from "../../assets/logo-white-new.png";
import NewLogo from "../../assets/logo-twos.png";
import { io } from "socket.io-client";
// import "popper.js";
// import "bootstrap";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu, Typography, Input } from "antd";
import { googleLogout } from "@react-oauth/google";
import logo from "../../assets/generate-a-logo-with--S------Use-Green-and-White-color-combination-removebg-preview.png";

import avatar from "../../assets/images/resource/company-6.png";
import axios from "axios";
import { Server } from "../../App";
import toast, { Toaster } from "react-hot-toast";
import UploadResume from "./UploadResume";
import { jwtDecode } from "jwt-decode";
import "./Header.css";
import PublicHeader from "../PublicSite/PublicHeader";
import { SearchOutlined } from "@ant-design/icons";
const Header3 = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [isVendor, setIsVendor] = useState(false);
  const [activePage, setActivePage] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [uploadResume, setUploadResume] = useState(false);
  const [close, setClose] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [data, setData] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileToastShown, setProfileToastShown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchRef = useRef(null);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    navigate(`/globalSearch?keyword=${encodeURIComponent(keyword)}`);
    setShowSearch(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const maintenance = async () => {
      try {
        const repsonse = await axios.get(
          `${Server}/api/v1/data/maintenance/status`
        );
        setMaintenanceMode(repsonse.data.data);
      } catch (error) {}
    };
    maintenance();
  }, []);
  const socket = io(Server, {
    // withCredentials: true,
  });
  const location = useLocation();
  let token = localStorage.getItem("token");
  const menu = (
    <Menu className="custom-menu" style={{ padding: "8px" }}>
      <Menu.Item
        key="1"
        className="custom-menu-item"
        style={{ marginBottom: "10px" }}
        onClick={() => navigate("/blog")}
      >
        Blog
      </Menu.Item>
      <Menu.Item
        key="2"
        className="custom-menu-item"
        style={{ marginBottom: "10px" }}
        onClick={() => navigate("/postBlog")}
      >
        Post Blog
      </Menu.Item>
      <Menu.Item
        key="3"
        className="custom-menu-item"
        onClick={() => navigate("/community")}
      >
        Community
      </Menu.Item>
    </Menu>
  );
  let userId = localStorage.getItem("UserId");

  useEffect(() => {
    if (userId) {
      // register user with backend
      socket.emit("add-user", userId);
      // listen for notifications
      socket.on("newNotification", (notification) => {
        console.log("📩 New notification received:", notification);

        // update state
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // show toast
        toast.custom((t) => (
          <div
            className={`toast show align-items-center text-bg-light border-0 shadow ${
              t.visible ? "fade show" : "fade"
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{
              minWidth: "300px",
              borderRadius: "10px",
            }}
          >
            <div className="d-flex">
              <div className="toast-body">
                <strong className="me-auto">🔔 Notification</strong>
                <div>
                  {notification.message || "You have a new notification"}
                </div>
              </div>
              <button
                type="button"
                className="btn-close me-2 m-auto"
                aria-label="Close"
                onClick={() => toast.dismiss(t.id)}
              ></button>
            </div>
          </div>
        ));
      });
    }

    // cleanup on unmount
    return () => {
      socket.off("newNotification");
    };
  }, [userId]);
  const getData = async () => {
    try {
      let userId = localStorage.getItem("UserId");
      // let role = localStorage.getItem("Role");
      if (role === "Candidate") {
        const userData = await axios.get(
          `${Server}/api/v1/candidate/${userId}`
        );
        setData(userData?.data?.Candidate);

        // console.log("hi", userData?.data?.Candidate[0]?.profileCompleted);
        // const isProfileCompleted =
        //   userData?.data?.Candidate[0]?.profileCompleted;
        // if (!isProfileCompleted && !profileToastShown) {
        //   console.log("hi", userData?.data?.Candidate[0]?.profileCompleted);
        //   navigate("/my-profile");
        //   // toast.error("Please update your profile");
        //   // setProfileToastShown(true);
        // }
      } else if (role === "Employer") {
        const empData = await axios.get(`${Server}/api/v1/employer/${userId}`);
        setData(empData.data.Employer);
        // const notifications = empData?.data?.Employer?.[0]?.notifications || [];
        // const unread = notifications.filter((n) => n.read === false).length;
        setUnreadCount(0); // since all marked as read
        // console.log("hello", empData);
        // const isProfileCompleted = empData?.data?.Employer[0]?.profileCompleted;
        // if (!isProfileCompleted && !profileToastShown) {
        //   console.log("hi", empData?.data?.Employer[0]?.profileComplete);
        //   navigate("/my-profile");
        //   // toast.error("Please update your profile");
        //   // setProfileToastShown(true);
        // }
      } else if (role === "Vendor") {
        const empData = await axios.get(
          `${Server}/api/v1/vendor/details/${userId}`
        );
        setData(empData.data.Vendor);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(data[0]?.plan);

  let access = "";
  if (token) {
    let decodedtoken = jwtDecode(token);
    access = decodedtoken.access;
  }
  // console.log(access);
  useEffect(() => {
    if (token) {
      getData();
    }
  }, []);

  useEffect(() => {
    if (
      role === "Candidate" &&
      data &&
      data.length > 0 &&
      data[0]?.profileCompleted
    ) {
      const isResumeUploaded = data[0].isResumeUploaded;
      // Show the modal only if isResumeUploaded is false
      setUploadResume(!isResumeUploaded);
    }
  }, [data]);
  useEffect(() => {
    // Update the current path whenever the location changes
    setCurrentPath(location.pathname);
  }, [location]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const drawer = document.getElementById("your-drawer-id"); // Replace 'your-drawer-id' with the actual ID of your Drawer component
  //     if (drawer && !drawer.contains(event.target)) {
  //       onClose();
  //     }
  //   };

  //   document.addEventListener("click", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen); // Toggle mobile menu state
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // const showResumeModal = () => {
  //   setModalOpen(true);
  // };

  const handleOk = () => {
    setModalOpen(false);
  };
  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  const showDrawer = () => {
    setOpen(true);
  };
  const closeDrawer = () => {
    setClose(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const handleNavigationClick = (page) => {
    setActivePage(page);
    // Add any additional logic you want to perform when a navigation link is clicked
  };
  let role = localStorage.getItem("Role");
  // useEffect(() => {
  //   if (token === null) {
  //     showModal("login");
  //   }
  // }, []);
  useEffect(() => {
    function headerStyle() {
      var windowpos = $(window).scrollTop();
      var siteHeader = $(".main-header");
      var scrollLink = $(".scroll-to-top");
      var sticky_header = $(".main-header");

      if (windowpos > 1) {
        siteHeader.addClass("fixed-header animated slideInDown");
        scrollLink.fadeIn(300);
      } else {
        siteHeader.removeClass("fixed-header animated slideInDown");
        scrollLink.fadeOut(300);
      }
    }

    // Initial call
    headerStyle();

    // Scroll event listener
    $(window).scroll(() => {
      headerStyle();
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      $(window).off("scroll", headerStyle);
    };
  }, []);
  // useEffect(() => {
  //   if ($("#toggle-user-sidebar").length) {
  //     $("#toggle-user-sidebar, .dashboard-option a").on("click", function () {
  //       $("body").toggleClass("user-sidebar-active");
  //     });

  //     $(".sidebar-backdrop").on("click", function () {
  //       $("body").removeClass("user-sidebar-active");
  //     });
  //   }
  // }, []);
  const [isSticky, setIsSticky] = useState(false);

  const handleLogout = () => {
    let role = localStorage.getItem("Role");
    if (role === "Candidate" || role === "Vendor") {
      navigate("/");
    } else if (role === "Employer") {
      navigate("/employers");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("UserId");
    localStorage.removeItem("Role");
    localStorage.removeItem("ProfileCompleted");
    localStorage.removeItem("Subscribed");
    localStorage.removeItem("linkedinAccessToken");
    localStorage.clear();

    // window.location.reload();
    setTimeout(() => {
      setIsModalOpen(true);
    }, 1000);
  };
  // const [text, setText] = useState("");
  // const fullText = "Where Skills and Opportunities align";

  // useEffect(() => {
  //   let currentIndex = 0;

  //   const interval = setInterval(() => {
  //     if (currentIndex <= fullText.length) {
  //       setText(fullText.substring(0, currentIndex));
  //       currentIndex++;
  //     } else {
  //       currentIndex = 0; // Reset currentIndex to restart typing animation
  //     }
  //   }, 100); // Adjust typing speed here (milliseconds)

  //   return () => clearInterval(interval);
  // }, []);

  const accountMenu = (
    <Menu className="ss-account-menu">
      <Menu.Item key="1">
        <Link className="link-option" to="/candidate-dashboard">
          {" "}
          <i class="la la-dashboard design"></i> Dashboard
        </Link>
      </Menu.Item>
      {/*<Menu.Item key="2">
        <Link className="link-option" to="/my-profile">
          <i class="la la-user-tie design"></i>My Profile
        </Link>
      </Menu.Item>*/}
      {/* <Menu.Item key="3">
        <Link className="link-option" to="/my-resume">
          <i class="la la-file-invoice design"></i>My Resume
        </Link>
    </Menu.Item>*/}
      {/* <Menu.Item key="2">
        <Link className="link-option" to="/practiceInterview">
          <i class="la la-file-invoice design"></i>Practice Video Assessment
        </Link>
      </Menu.Item>
      <Menu.Item key="4">
        <Link className="link-option" to="/applied-jobs">
          <i class="la la-briefcase design"></i> Applied Jobs{" "}
        </Link>
      </Menu.Item>

      <Menu.Item key="5">
        <Link className="link-option" to="/job-alerts">
          <i class="la la-bell design"></i>Job Alerts
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link className="link-option" to="/shortlisted-jobs">
          <i class="la la-bookmark-o design"></i>Shortlisted Jobs
        </Link>
      </Menu.Item>
      <Menu.Item key="7">
        <Link className="link-option" to="/cv-manager">
          <i class="la la-file-invoice design"></i> CV manager
        </Link>
      </Menu.Item> */}
      {/*<Menu.Item key="8">
        <Link className="link-option" to="/packages">
          <i class="la la-box design"></i>Packages
        </Link>
  </Menu.Item>*/}
      {/* <Menu.Item key="9">
        <Link className="link-option" to="/messages">
          <i class="la la-comment-o design"></i>Messages
        </Link>
      </Menu.Item> */}
      {/*    <Menu.Item key="10">
        <Link className="link-option" to="/change-password">
          <i class="la la-lock design"></i>Change Password
        </Link>
</Menu.Item>*/}
      <Menu.Item key="2">
        <Link className="link-option" to="/candidates-profile-view">
          <i class="la la-user-alt design"></i>View Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="3">
        <a className="link-option" onClick={() => handleLogout()}>
          <i class="la la-sign-out design"></i>Logout
        </a>
      </Menu.Item>
      {/* <Menu.Item key="13">
        <Link className="link-option" to="/delete">
          <i class="la la-trash design"></i>Delete Profile
        </Link>
  </Menu.Item>*/}
    </Menu>
  );
  const VendorMenu = (
    <Menu className="ss-account-menu">
      <Menu.Item key="1">
        <Link className="link-option" to="/vendor/dashboard">
          {" "}
          <i class="la la-dashboard design"></i> Dashboard
        </Link>
      </Menu.Item>
      <Menu.Item key="2">
        <a className="link-option" onClick={() => handleLogout()}>
          <i class="la la-sign-out design"></i>Logout
        </a>
      </Menu.Item>
    </Menu>
  );
  const employerMenu = (
    <Menu className="ss-account-menu">
      {/* style={{ maxHeight: '400px', overflowY: 'auto' }} */}
      <Menu.Item key="1">
        <Link className="link-option" to="/employer-dashboard">
          {" "}
          <i class="la la-dashboard design"></i> Dashboard
        </Link>
      </Menu.Item>
      {/*  <Menu.Item key="2">
        <Link className="link-option" to="/company-profile">
          <i class="la la-user-tie design"></i>Company Profile
        </Link>
      </Menu.Item>*/}
      {/* <Menu.Item key="3">
        <Link className="link-option" to="/post-job">
          <i class="la la-paper-plane design"></i>Post a New Job
        </Link>
      </Menu.Item>
      <Menu.Item key="4">
        <Link className="link-option" to="/manage-jobs">
          <i class="la la-briefcase design"></i> Manage Jobs{" "}
        </Link>
      </Menu.Item>
      <Menu.Item key="5">
        <Link className="link-option" to="/applicants">
          <i class="la la-file-invoice design"></i> All Applicants
        </Link>
      </Menu.Item>
      <Menu.Item key="6">
        <Link className="link-option" to="/shortlisted-resumes">
          <i class="la la-bookmark-o design"></i>Shortlisted Resumes
        </Link>
      </Menu.Item> */}
      {/* <Menu.Item key="7">
        <Link className="link-option" to="/savedResume">
          <i class="la la-heart-o design"></i>Saved Resumes
        </Link>
      </Menu.Item> */}
      {/*<Menu.Item key="7">
        <Link className="link-option" to="/employer-packages">
          <i class="la la-box design"></i>Packages
        </Link>
  </Menu.Item>*/}
      {/* <Menu.Item key="8">
        <Link className="link-option" to="/employer-messages">
          <i class="la la-comment-o design"></i>Messages
        </Link>
      </Menu.Item>
      <Menu.Item key="9">
        <Link className="link-option" to="/employer-billing">
          <i class="la la-file-invoice-dollar design"></i>Billing
        </Link>
      </Menu.Item> */}
      {/* <Menu.Item key="10">
        <Link className="link-option" to="/resume-alerts">
          <i class="la la-bell design"></i>Notifications
        </Link>
      </Menu.Item> */}
      {/*    <Menu.Item key="10">
        <Link className="link-option" to="/employer-change-password">
          <i class="la la-lock design"></i>Change Password
        </Link>
  </Menu.Item>*/}
      {/* <Menu.Item key="11">
        <Link className="link-option" to="/candidates-profile-view">
          <i class="la la-user-alt design"></i>View Profile
        </Link>
      </Menu.Item> */}
      {/* <Menu.Item key="12">
        <Link className="link-option" to="/aiFitment">
          <i class="la la-robot design"></i>AI Fitment Analysis
        </Link>
      </Menu.Item> */}
      <Menu.Item key="2">
        <Link className="link-option" to="/employer-profile-view">
          <i class="la la-user-alt design"></i>View Profile
        </Link>
      </Menu.Item>

      <Menu.Item key="3">
        <a className="link-option" onClick={() => handleLogout()}>
          <i class="la la-sign-out design"></i>Logout
        </a>
      </Menu.Item>

      {access === "Admin" ? (
        <Menu.Item key="14">
          <Link className="link-option" to="/allusers">
            <i class="la la-user design"></i>All Users
          </Link>
        </Menu.Item>
      ) : null}
      {/* <Menu.Item key="13">
        <Link className="link-option" to="/delete">
          <i class="la la-trash design"></i>Delete Profile
        </Link>
  </Menu.Item>*/}
    </Menu>
  );
  const items = [
    {
      key: "1",
      label: "Item 1",
    },
    {
      key: "2",
      label: "Item 2",
    },
    {
      key: "3",
      label: "Item 3",
    },
  ];
  if (!token) return <PublicHeader />;

  return (
    <div>
      <span class="header-span"></span>

      <header class="main-header">
        {/* <div className="relative w-full bg-gradient-to-r bg-white from-red-700 to-red-500 text-red py-1 overflow-hidden">

          <div className="absolute inset-0 flex items-center">
            <div className="animate-marquee whitespace-nowrap font-semibold text-sm sm:text-base">
              🚨 Our servers are currently experiencing downtime. Some features
              may be unavailable. Please check back soon 🚨
            </div>
          </div>
        </div> */}
        {maintenanceMode && (
          <div class="downtime-banner">
            <div class="marquee">
              ⚠️ We’re currently performing maintenance. Some features may be
              temporarily unavailable. Our team is actively working to restore
              full service soon. ⚠️
            </div>
          </div>
        )}
        <div class="container-fluid">
          <div class="main-box">
            <div class="nav-outer">
              <div className="logo-box">
                {/* <div className="logo">
                  <a href="/">
                    <img
                      src={logo1}
                      style={{ height: "80px", marginBottom: "-10px" }}
                      className="logo-images1"
                      alt=""
                      title=""
                    />
                  </a>
                </div> */}

                <div className="logo" style={{ marginTop: "10px" }}>
                  <a href="/">
                    <img
                      src={NewLogo}
                      style={{ height: "70px" }}
                      className="logo-images"
                      alt=""
                      title=""
                    />
                    {/* <span
                      style={{
                        color: "#1E90FF",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      SkillStreamJobs
                    </span>
                    <span
                      style={{
                        color: "#00d0ea",
                        fontSize: "20px",
                        fontWeight: "900",
                      }}
                    >
                      .AI
                    </span> */}
                  </a>
                </div>
                {/* <div className="skills-logo3">{text}</div> */}
              </div>
              {token === null ? (
                <nav className="nav main-menu ss-public-nav" aria-label="Main navigation">
                  <Link to="/find-jobs">Find Jobs</Link><Link to="/employers-list">Companies</Link>
                  <Dropdown overlay={menu}><button type="button">Blogs <DownOutlined /></button></Dropdown>
                  <Link to="/about">About</Link><Link to="/contact">Contact</Link>
                  <Link to="/employers">Employers Page</Link>
                  <button type="button" onClick={() => { setIsVendor(true); showModal("login"); }}>Login as Vendor</button>
                </nav>
              ) : (
                <nav className="nav main-menu">
                  {role === "Candidate" ? (
                    <ul className="navigation" id="navbar">
                      <div className="header-navigation">
                        {/* <li
                          className={`dropdown ${
                            currentPath === "/" ? "current" : ""
                          }`}
                        >
                          <Link to="/">
                            <span className="nav-link1">Home</span>
                          </Link>
                        </li>*/}

                        <li
                          className={`dropdown has-mega-menu ${
                            currentPath === "/find-jobs" ? "current" : ""
                          }`}
                          id="has-mega-menu"
                        >
                          <Link to="/find-jobs">
                            <span className="nav-link1">Find Jobs</span>
                          </Link>
                        </li>

                        <li
                          className={`dropdown ${
                            currentPath === "/employers-list" ? "current" : ""
                          }`}
                        >
                          <Link to="/employers-list">
                            <span className="nav-link1">Companies</span>
                          </Link>
                        </li>
                        {/* <li
                          className={`dropdown ${
                            currentPath === "/employers-list" ? "current" : ""
                          }`}
                        >
                          <Link to="/aiJobSearch">
                            <span className="nav-link1">AI Job Search</span>
                          </Link>
                        </li> */}
                        <li
                          className={`dropdown ${
                            currentPath === "/candidate-dashboard"
                              ? "current"
                              : ""
                          }`}
                        >
                          <Link to="/candidate-dashboard">
                            <span className="nav-link1">Dashboard</span>
                          </Link>
                        </li>
                        <li className="dropdown">
                          <a
                            href="/create-resume"
                          >
                            <span className="nav-link1">Create Resume</span>
                          </a>
                        </li>
                      </div>
                      <li className="mm-add-listing">
                        <a href="job-post" className="theme-btn btn-style-one">
                          Job Post
                        </a>
                        <span>
                          <span className="contact-info">
                            <span className="phone-num">
                              <span>Call us</span>
                              <a href="tel:1234567890">123 456 7890</a>
                            </span>
                            <span className="address">
                              329 Queensberry Street, North Melbourne VIC <br />
                              3051, Australia.
                            </span>
                            <a
                              href="mailto:support@Skill Stream.com"
                              className="email"
                            >
                              support@Skill Stream.com
                            </a>
                          </span>
                          <span className="social-links">
                            <a
                              href="https://www.facebook.com/profile.php?id=61563887762159"
                              target="_blank"
                            >
                              <span className="fab fa-facebook-f"></span>
                            </a>
                            {/*<a href="#">
                            <span className="fab fa-twitter"></span>
                          </a>*/}
                            <a
                              href="https://www.instagram.com/skillstream_jobs/"
                              target="_blank"
                            >
                              <span className="fab fa-instagram"></span>
                            </a>
                            <a
                              href="https://www.linkedin.com/company/104131262/admin/dashboard/"
                              target="_blank"
                            >
                              <span className="fab fa-linkedin-in"></span>
                            </a>
                          </span>
                        </span>
                      </li>
                    </ul>
                  ) : role === "Employer" ? (
                    <ul className="navigation" id="navbar">
                      {/*   <li className="current dropdown">
                      //   <a href="/">
                      //     <span>Home</span>
                      //   </a>
                  </li>*/}
                      {data[0]?.plan === "Recommended" ? (
                        <>
                          <li
                            className={`dropdown ${
                              currentPath === "/candidates-list"
                                ? "current"
                                : ""
                            }`}
                          >
                            <a href="/candidates-list">
                              <span className="nav-link1">Resume Search</span>
                            </a>
                          </li>
                          <li
                            className={`dropdown ${
                              currentPath === "/aiSearch" ? "current" : ""
                            }`}
                          >
                            <a href="/aiSearch">
                              <span className="nav-link1">
                                AI Resume Search
                              </span>
                            </a>
                          </li>

                          {data[0]?.allAccess && (
                            <li
                              className={`dropdown ${
                                currentPath === "/aiSearch" ? "current" : ""
                              }`}
                            >
                              <a href="/reports">
                                <span className="nav-link1">Reports</span>
                              </a>
                            </li>
                          )}
                        </>
                      ) : null}

                      <li
                        className={`dropdown ${
                          currentPath === "/employer-dashboard" ? "current" : ""
                        }`}
                      >
                        <a href="/employer-dashboard">
                          <span className="nav-link1">Dashboard</span>
                        </a>
                      </li>
                      <li className="mm-add-listing">
                        <a href="job-post" className="theme-btn btn-style-one">
                          Job Post
                        </a>
                        <span>
                          <span className="contact-info">
                            <span className="phone-num">
                              <span>Call us</span>
                              <a href="tel:1234567890">123 456 7890</a>
                            </span>
                            <span className="address">
                              329 Queensberry Street, North Melbourne VIC <br />
                              3051, Australia.
                            </span>
                            <a
                              href="mailto:support@Skill Stream.com"
                              className="email"
                            >
                              support@Skill Stream.com
                            </a>
                          </span>
                          <span className="social-links">
                            <a
                              href="https://www.facebook.com/profile.php?id=61563887762159"
                              target="_blank"
                            >
                              <span className="fab fa-facebook-f"></span>
                            </a>
                            {/*<a href="#">
                            <span className="fab fa-twitter"></span>
                          </a>*/}
                            <a
                              href="https://www.instagram.com/skillstream_jobs/"
                              target="_blank"
                            >
                              <span className="fab fa-instagram"></span>
                            </a>
                            <a
                              href="https://www.linkedin.com/company/104131262/admin/dashboard/"
                              target="_blank"
                            >
                              <span className="fab fa-linkedin-in"></span>
                            </a>
                          </span>
                        </span>
                      </li>
                    </ul>
                  ) : (
                    <ul className="navigation" id="navbar">
                      <li
                        className={`dropdown has-mega-menu ${
                          currentPath === "/find-jobs" ? "current" : ""
                        }`}
                        id="has-mega-menu"
                      >
                        <Link to="/find-jobs">
                          <span className="nav-link1">Find Jobs</span>
                        </Link>
                      </li>

                      <li
                        className={`dropdown ${
                          currentPath === "/vendor/dashboard" ? "current" : ""
                        }`}
                      >
                        <Link to="/vendor/dashboard">
                          <span className="nav-link1">Dashboard</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </nav>
              )}
            </div>

            {token === null ? (
              <div className="outer-box">
                <div className="btn-box">
                  <button
                    className="theme-btn 
                    btn-style-ffive call-modal"
                    // href="/login"
                    onClick={() => { setIsVendor(false); showModal("login"); }}
                  >
                    Login / Register
                  </button>
                  {forgotModal && (
                    <ForgotPassword
                      forgotModal={forgotModal}
                      setForgotModal={setForgotModal}
                      isModalOpen={isModalOpen}
                      setIsModalOpen={setIsModalOpen}
                      setModalType={setModalType}
                    />
                  )}
                  {confirmModal && (
                    <ConfirmModal
                      confirmModal={confirmModal}
                      setConfirmModal={setConfirmModal}
                    />
                  )}
                  {isModalOpen && (
                    <div>
                      {modalType === "login" ? (
                        <div>
                          <Login
                            isVendor={isVendor}
                            isModalOpen={isModalOpen}
                            modalType={modalType}
                            setIsModalOpen={setIsModalOpen}
                            setModalType={setModalType}
                            showModal={showModal}
                            confirmModal={confirmModal}
                            setConfirmModal={setConfirmModal}
                            forgotModal={forgotModal}
                            setForgotModal={setForgotModal}
                          />
                        </div>
                      ) : (
                        <Register
                          isModalOpen={isModalOpen}
                          modalType={modalType}
                          setIsModalOpen={setIsModalOpen}
                          setModalType={setModalType}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {role === "Candidate" ? (
                  <div className="outer-box">
                    {/* Resume Upload */}
                    {uploadResume && (
                      <UploadResume
                        uploadResume={uploadResume}
                        setUploadResume={setUploadResume}
                      />
                    )}

                    {/* Shortlisted Jobs */}
                    <button
                      className="menu-btn"
                      onClick={() => navigate("/shortlisted-jobs")}
                    >
                      <span className="icon la la-heart-o"></span>
                    </button>

                    {/* Job Alerts */}
                    <button
                      className="menu-btn"
                      onClick={() => navigate("/job-alerts")}
                    >
                      <span className="icon la la-bell"></span>
                    </button>

                    {/* Account Menu */}
                    <div className="dropdown dashboard-option">
                      <Dropdown overlay={accountMenu} overlayClassName="ss-account-popup" trigger={["click"]}>
                        <a className="dropdown-toggle" role="button">
                          <img
                            src={data[0]?.image || avatar}
                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }}
                            alt="avatar"
                            className="thumb"
                          />
                          <span className="name">My Account</span>
                        </a>
                      </Dropdown>
                    </div>
                  </div>
                ) : role === "Employer" ? (
                  <div className="outer-box">
                    {showSearch && (
                      <div
                        ref={searchRef}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.3s ease",
                          backgroundColor: "#fff",
                          borderRadius: "25px",
                          border: "1px solid #ddd",
                          padding: "4px 10px",
                          position: "absolute",
                          right: 0,
                          top: "-5px",
                          width: "250px",
                          zIndex: 999,
                        }}
                      >
                        <Input
                          placeholder="Search..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          onPressEnter={handleSearch}
                          style={{
                            border: "none",
                            boxShadow: "none",
                            outline: "none",
                          }}
                        />
                        <SearchOutlined
                          onClick={handleSearch}
                          style={{
                            color: "#1e90ff",
                            cursor: "pointer",
                            fontSize: "18px",
                            marginLeft: "5px",
                          }}
                        />
                      </div>
                    )}
                    {/* Post Job Button */}
                    <a href="/post-job" className="theme-btn btn-style-ffive">
                      <span className="btn-title">Job Post</span>
                    </a>

                    {/* Saved Resumes */}
                    <button
                      className="menu-btn"
                      onClick={() => navigate("/savedResume")}
                    >
                      <span className="icon la la-heart-o"></span>
                    </button>

                    {/* Resume Alerts */}
                    <button
                      className="menu-btn"
                      onClick={() => navigate("/resume-alerts")}
                    >
                      <span className="icon la la-bell"></span>
                      {unreadCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <div
                      className="header-search ms-3"
                      style={{ position: "relative" }}
                    >
                      {!showSearch && (
                        <SearchOutlined
                          onClick={() => setShowSearch(true)}
                          style={{
                            fontSize: "20px",
                            cursor: "pointer",
                            color: "#1e90ff",
                          }}
                        />
                      )}
                    </div>
                    {/* Employer Account Menu */}
                    <div className="dropdown dashboard-option">
                      <Dropdown overlay={employerMenu} trigger={["click"]}>
                        <a className="dropdown-toggle" role="button">
                          <img
                            src={data[0]?.image || avatar}
                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }}
                            alt="avatar"
                            className="thumb"
                          />
                          <span className="name">My Account</span>
                        </a>
                      </Dropdown>
                    </div>
                  </div>
                ) : role === "Vendor" ? (
                  <div className="outer-box">
                    {/* Saved Resumes */}
                    <button
                      className="menu-btn"
                      onClick={() => navigate("/vendor/shortlisted-jobs")}
                    >
                      <span className="icon la la-bookmark-o"></span>
                    </button>

                    {/* Job Alerts */}
                    <button
                      className="menu-btn"
                      onClick={() => navigate("/vendor/jobAlerts")}
                    >
                      <span className="icon la la-bell"></span>
                    </button>

                    {/* Employer Account Menu */}
                    <div className="dropdown dashboard-option">
                      <Dropdown overlay={VendorMenu} trigger={["click"]}>
                        <a className="dropdown-toggle" role="button">
                          <img
                            src={data[0]?.image || avatar}
                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }}
                            alt="avatar"
                            className="thumb"
                          />
                          <span className="name">My Account</span>
                        </a>
                      </Dropdown>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div class="mobile-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
            }}
          >
            {/* <div className="logo"> */}
            <a href="/">
              {!isSticky ? (
                <img
                  src={NewLogo}
                  style={{ height: "50px" }}
                  className="logo-images"
                  alt="Normal Logo"
                />
              ) : (
                <img
                  src={NewLogo}
                  style={{ height: "50px" }}
                  className="logo-images"
                  alt="Sticky Logo"
                />
              )}
            </a>
            {/* <div className="skills-logo">{text}</div> */}
            {/* </div> */}

            <div class="nav-outer clearfix">
              {token === null ? (
                <div className="outer-box">
                  <div className="login-box">
                    <button
                      className="call-modal"
                      // href="/login"
                      onClick={() => { setIsVendor(false); showModal("login"); }}
                    >
                      <span class="icon-user"></span>
                    </button>
                    {forgotModal && (
                      <ForgotPassword
                        forgotModal={forgotModal}
                        setForgotModal={setForgotModal}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                        setModalType={setModalType}
                      />
                    )}
                    {confirmModal && (
                      <ConfirmModal
                        confirmModal={confirmModal}
                        setConfirmModal={setConfirmModal}
                      />
                    )}
                    {isModalOpen && (
                      <div>
                        {modalType === "login" ? (
                          <div>
                            <Login
                            isVendor={isVendor}
                              isModalOpen={isModalOpen}
                              modalType={modalType}
                              setIsModalOpen={setIsModalOpen}
                              setModalType={setModalType}
                              showModal={showModal}
                              confirmModal={confirmModal}
                              setConfirmModal={setConfirmModal}
                              forgotModal={forgotModal}
                              setForgotModal={setForgotModal}
                            />
                          </div>
                        ) : (
                          <Register
                            isModalOpen={isModalOpen}
                            modalType={modalType}
                            setIsModalOpen={setIsModalOpen}
                            setModalType={setModalType}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {role === "Candidate" ? (
                    <div class="outer-box">
                      <Drawer
                        onClose={onClose}
                        open={open}
                        destroyOnClose={false}
                        overlay={employerMenu}
                      >
                        <ul class="navigation">
                          <li class="link-option">
                            <Link
                              to="/candidate-dashboard"
                              style={{ color: "black" }}
                            >
                              {" "}
                              <i class="la la-dashboard  design"></i> Dashboard
                            </Link>
                          </li>
                          {/*              <li className="link-option">
                          <Link to="/my-profile" style={{ color: "black" }}>
                            <i class="la la-user-tie  design"></i>My Profile
                          </Link>
                </li>*/}

                          <li className="link-option">
                            <Link
                              to="/practiceInterview"
                              style={{ color: "black" }}
                            >
                              <i class="la la-briefcase design"></i> Practice
                              Video Assessment
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link to="/applied-jobs" style={{ color: "black" }}>
                              <i class="la la-briefcase design"></i> Applied
                              Jobs
                            </Link>
                          </li>
                          <li className="link-option">
                            <button
                              onClick={() => navigate("/job-alerts")}
                              style={{ color: "black" }}
                            >
                              <i class="la la-bell  design"></i>Job Alerts
                            </button>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/shortlisted-jobs"
                              style={{ color: "black" }}
                            >
                              <i class="la la-bookmark-o  design"></i>
                              Shortlisted Jobs
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link to="/cv-manager" style={{ color: "black" }}>
                              <i class="la la-file-invoice  design"></i> CV
                              manager
                            </Link>
                          </li>

                          <li className="link-option">
                            <Link to="/messages" style={{ color: "black" }}>
                              <i class="la la-comment-o  design"></i>Messages
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/candidates-profile-view"
                              style={{ color: "black" }}
                            >
                              <i class="la la-user-o  design"></i>View Profile
                            </Link>
                          </li>
                          <li className="link-option">
                            <a
                              onClick={() => handleLogout()}
                              style={{ color: "black" }}
                            >
                              <i class="la la-sign-out design"></i>Logout
                            </a>
                          </li>
                        </ul>
                      </Drawer>
                      <button id="toggle-user-sidebar" onClick={showDrawer}>
                        <img src={data[0]?.image || avatar}
                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }} alt="avatar" class="thumb" />
                      </button>
                    </div>
                  ) : role === "Employer" ? (
                    <div class="outer-box">
                      <Drawer
                        onClose={onClose}
                        open={open}
                        destroyOnClose={false}
                      >
                        <ul class="navigation">
                          <li class="link-option">
                            <Link
                              to="/employer-dashboard"
                              style={{ color: "black" }}
                            >
                              {" "}
                              <i class="la la-dashboard  design"></i> Dashboard
                            </Link>
                          </li>

                          {/*  <li className="link-option">
                          <Link
                            to="/company-profile"
                            style={{ color: "black" }}
                          >
                            <i class="la la-user-tie  design"></i>Company
                            Profile
                          </Link>
                </li>*/}
                          <li className="link-option">
                            <Link to="/post-job" style={{ color: "black" }}>
                              <i class="la la-paper-plane design"></i>Post A New
                              Job
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link to="/manage-jobs" style={{ color: "black" }}>
                              <i class="la la-briefcase design"></i> Manage Jobs
                            </Link>
                          </li>
                          <li className="link-option">
                            <button
                              onClick={() => navigate("/resume-alerts")}
                              style={{ color: "black" }}
                            >
                              <i class="la la-bell  design"></i>Notifications
                            </button>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/shortlisted-resumes"
                              style={{ color: "black" }}
                            >
                              <i class="la la-bookmark-o  design"></i>
                              Shortlisted Resumes
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/interview-candidates"
                              style={{ color: "black" }}
                            >
                              <i class="la la-user-check  design"></i>
                              Interviewed Candidates
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link to="/savedResume" style={{ color: "black" }}>
                              <i class="la la-heart-o  design"></i>
                              Saved Resumes
                            </Link>
                          </li>

                          <li className="link-option">
                            <Link to="/applicants" style={{ color: "black" }}>
                              <i class="la la-file-invoice  design"></i> All
                              Applicants
                            </Link>
                          </li>
                          {/*  <li className="link-option">
                          <Link
                            to="/employer-packages"
                            style={{ color: "black" }}
                          >
                            <i class="la la-box  design"></i>Packages
                          </Link>
                        </li>*/}
                          <li className="link-option">
                            <Link
                              to="/employer-messages"
                              style={{ color: "black" }}
                            >
                              <i class="la la-comment-o  design"></i>Messages
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/employer-billing"
                              style={{ color: "black" }}
                            >
                              <i class="la la-file-invoice-dollar design"></i>
                              Billing
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/employer-profile-view"
                              style={{ color: "black" }}
                            >
                              <i class="la la-user-o  design"></i>View Profile
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link to="/aiFitment" style={{ color: "black" }}>
                              <i class="la la-robot  design"></i>
                              AI Fitment Analysis
                            </Link>
                          </li>
                          {access === "Admin" ? (
                            <li className="link-option">
                              <Link to="/allusers" style={{ color: "black" }}>
                                <i class="la la-user design"></i>
                                All Users
                              </Link>
                            </li>
                          ) : null}
                          <li className="link-option">
                            <a
                              onClick={() => handleLogout()}
                              style={{ color: "black" }}
                            >
                              <i class="la la-sign-out design"></i>Logout
                            </a>
                          </li>
                        </ul>
                      </Drawer>
                      <button id="toggle-user-sidebar" onClick={showDrawer}>
                        <img src={data[0]?.image || avatar}
                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }} alt="avatar" class="thumb" />
                      </button>
                    </div>
                  ) : role === "Vendor" ? (
                    <div class="outer-box">
                      <Drawer
                        onClose={onClose}
                        open={open}
                        destroyOnClose={false}
                        overlay={employerMenu}
                      >
                        <ul class="navigation">
                          <li class="link-option">
                            <Link
                              to="/vendor/dashboard"
                              style={{ color: "black" }}
                            >
                              {" "}
                              <i class="la la-dashboard  design"></i> Dashboard
                            </Link>
                          </li>

                          <li className="link-option">
                            <Link
                              to="/vendor/appliedJobs"
                              style={{ color: "black" }}
                            >
                              <i class="la la-check-circle design"></i> Applied
                              Jobs
                            </Link>
                          </li>

                          <li className="link-option">
                            <Link
                              to="/vendor/shortlisted-jobs"
                              style={{ color: "black" }}
                            >
                              <i class="la la-bookmark-o design"></i>
                              Shortlisted Jobs
                            </Link>
                          </li>
                          <li className="link-option">
                            <Link
                              to="/vendor/manage/candidates"
                              style={{ color: "black" }}
                            >
                              <i class="la la-users  design"></i>
                              Manage Candidates
                            </Link>
                          </li>
                          <li className="link-option">
                            <button
                              onClick={() => navigate("/vendor/jobAlerts")}
                              style={{ color: "black" }}
                            >
                              <i class="la la-bell design"></i>Job Alerts
                            </button>
                          </li>
                          <li className="link-option">
                            <a
                              onClick={() => handleLogout()}
                              style={{ color: "black" }}
                            >
                              <i class="la la-sign-out design"></i>Logout
                            </a>
                          </li>
                        </ul>
                      </Drawer>
                      <button id="toggle-user-sidebar" onClick={showDrawer}>
                        <img src={data[0]?.image || avatar}
                            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = avatar; }} alt="avatar" class="thumb" />
                      </button>
                    </div>
                  ) : null}
                </>
              )}
              <button
                className="navbar-trigger"
                onClick={toggleMobileMenu} // Toggle mobile menu state when clicked
              >
                <span className="flaticon-menu-1"></span>
              </button>
            </div>
          </div>
        </div>

        <Drawer
          placement="right"
          closable={true}
          onClose={closeMobileMenu}
          visible={isMobileMenuOpen}
          className="mobile-menu-drawer"
        >
          {/* Drawer content */}
          <nav className="nav main-menu1">
            {/* <div className="mobile-dropdown" id="navbar">
              <div className="current dropdown">
                <a href="/">
                  <span className="mob-nav">Home</span>
                </a>
              </div>
              <div className="dropdown">
                <a href="/about">
                  <span className="mob-nav">About</span>
                </a>
              </div>
              <div className="dropdown">
                <a href="/contact">
                  <span className="mob-nav">Contact</span>
                </a>
              </div>
            </div> */}
            <div className="logo-box1">
              <div className="logo">
                <a href="/">
                  <img
                    src={NewLogo}
                    style={{ height: "45px" }}
                    className="logo-images"
                    alt=""
                    title=""
                  />
                  {/* <span
                    style={{
                      color: "#1E90FF",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    SkillStreamJobs
                  </span>
                  <span
                    style={{
                      color: "#00d0ea",
                      fontSize: "20px",
                      fontWeight: "900",
                    }}
                  >
                    .AI
                  </span> */}
                </a>
                {/* <div className="skills-logo2">{text}</div> */}
              </div>
            </div>
            <div className="mobile-dropdown" id="navbar">
              {token === null ? (
                <>
                  <div className="current dropdown">
                    <a href="/">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Home
                      </span>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="/blog">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Blog
                      </span>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="/postBlog">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Post Blog
                      </span>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="/community">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Community
                      </span>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="/pricing">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Pricing
                      </span>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="/about">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        About
                      </span>
                    </a>
                  </div>

                  <div className="dropdown">
                    <a href="/contact">
                      <span
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          // marginTop:
                          //   "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          // marginBottom:
                          //   "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        Contact
                      </span>
                    </a>
                  </div>
                  <div className="resume-button">
                    <button
                      onClick={() => navigate("/")}
                      // className="theme-btn btn-style-two1"
                      style={{
                        display:
                          "inline-block" /* Ensures proper spacing and hover effects */,
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                        marginBottom:
                          "1rem" /* Equivalent to Tailwind's mb-4 */,
                        fontSize:
                          "0.875rem" /* Equivalent to Tailwind's text-sm */,
                        borderRadius:
                          "9999px" /* Equivalent to Tailwind's rounded-full */,
                        padding:
                          "0.5rem 1rem" /* Adding padding for better clickability */,
                        boxShadow:
                          "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                        transition:
                          "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                        borderRadius: "10px" /* Custom border radius */,
                        background:
                          "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                        color: "#fff" /* Text color */,
                        cursor: "pointer" /* Change cursor on hover */,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, #4299e1, #0056a1)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(66, 153, 225, 0.7)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, #4299e1, #0070f3)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(66, 153, 225, 0.5)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <span
                        className="submit-resume"
                        style={{
                          display:
                            "inline-block" /* Ensures proper spacing and hover effects */,
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop:
                            "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                          marginBottom:
                            "1rem" /* Equivalent to Tailwind's mb-4 */,
                          fontSize:
                            "0.875rem" /* Equivalent to Tailwind's text-sm */,
                          borderRadius:
                            "9999px" /* Equivalent to Tailwind's rounded-full */,
                          padding:
                            "0.5rem 1rem" /* Adding padding for better clickability */,
                          boxShadow:
                            "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                          transition:
                            "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                          borderRadius: "10px" /* Custom border radius */,
                          background:
                            "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                          color: "#fff" /* Text color */,
                          cursor: "pointer" /* Change cursor on hover */,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0056a1)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(66, 153, 225, 0.7)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(to right, #4299e1, #0070f3)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(66, 153, 225, 0.5)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        For Job Seekers
                      </span>
                    </button>
                  </div>
                  {/* 
                  <div className="mm-add-listing">
                    <a href="job-post" className="theme-btn btn-style-one">
                      Job Post
                    </a>
                    <span></span>
                  </div> */}
                </>
              ) : (
                <>
                  {role === "Candidate" ? (
                    <>
                      <div
                        className="dropdown has-mega-menu"
                        id="has-mega-menu"
                      >
                        <a href="/find-jobs">
                          <span className="mob-nav">Find Jobs</span>
                        </a>
                      </div>

                      <div className="dropdown">
                        <a href="/employers-list">
                          <span className="mob-nav">Companies</span>
                        </a>
                      </div>
                      {/* <div className="dropdown">
                        <a href="/aiJobSearch">
                          <span className="mob-nav">AI Job Search</span>
                        </a>
                      </div> */}
                      <div className="dropdown">
                        <a href="/candidate-dashboard">
                          <span className="mob-nav">Dashboard</span>
                        </a>
                      </div>
                      <div className="dropdown">
                        <a
                          href="/create-resume"
                        >
                          <span className="mob-nav">Create Resume</span>
                        </a>
                      </div>
                      {uploadResume && (
                        <UploadResume
                          uploadResume={uploadResume}
                          setUploadResume={setUploadResume}
                        />
                      )}
                      {/* Add more menu items for candidates */}
                    </>
                  ) : role === "Employer" ? (
                    <>
                      <div className="current dropdown">
                        {data[0]?.plan === "Recommended" ? (
                          <a href="/candidates-list">
                            <span className="mob-nav">Resume Search</span>
                          </a>
                        ) : null}
                      </div>
                      {data[0]?.plan === "Recommended" ? (
                        <div className="current dropdown">
                          <a href="/aiSearch">
                            <span className="mob-nav">AI Resume Search</span>
                          </a>
                        </div>
                      ) : null}

                      <div className="current dropdown">
                        <a href="/employer-dashboard">
                          <span className="mob-nav">Dashboard</span>
                        </a>
                      </div>
                      {/* Add more menu items for employers */}
                    </>
                  ) : role === "Vendor" ? (
                    <>
                      <div
                        className="dropdown has-mega-menu"
                        id="has-mega-menu"
                      >
                        <a href="/find-jobs">
                          <span className="mob-nav">Find Jobs</span>
                        </a>
                      </div>

                      <div className="current dropdown">
                        <a href="/vendor/dashboard">
                          <span className="mob-nav">Dashboard</span>
                        </a>
                      </div>
                      {/* Add more menu items for employers */}
                    </>
                  ) : null}
                </>
              )}
            </div>
          </nav>
          <Toaster position="top-center" reverseOrder={false} />
          {token === null && (
            <div className="login-register-button">
              <a href="/employers">Employers Page</a>
              <button className="btn-login" onClick={() => { setIsMobileMenuOpen(false); setIsVendor(true); showModal("login"); }}>Login as Vendor</button>
              <button className="btn-login" onClick={() => { setIsVendor(false); showModal("login"); }}>
                Login / Register
              </button>
            </div>
          )}
        </Drawer>
      </header>
    </div>
  );
};

export default Header3;
