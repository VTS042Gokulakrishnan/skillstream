import React, { useState, useEffect } from "react";
import $ from "jquery";
import { Button } from "antd";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
// import Resume from "../../Components/Header/Resume";
import "mmenu-js";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space, Menu, Drawer } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import logo from "../../assets/Blue (1).png";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import { CloseOutlined } from "@ant-design/icons";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";
// import logo from "../../assets/generate-a-logo-with--S------Use-Green-and-White-color-combination-removebg-preview.png";
// import avatar from "../../assets/images/resource/company-6.png";
// import { googleLogout } from "@react-oauth/google";
import logo2 from "../../assets/logo-white-new.png";
import NewLogo from "../../assets/logo-twos.png";
// import name from "../../assets/logo-name.jpg";
import axios from "axios";
import { Server } from "App";
import { useScroll } from "../../Components/ScrollContext"; // Import the hook
import { jwtDecode } from "jwt-decode";
import "./Header.css";

// import logo1 from "../../assets/generate-a-logo-with--S------Use-Green-and-White-color-combination-removebg-preview.png";
const HeaderEmp = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [activePage, setActivePage] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
  // const showResumeModal = () => {
  //   setModalOpen(true);
  // };
  const { scrollToPricing } = useScroll(); // Get the function from context
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
  const handleOk = () => {
    setModalOpen(false);
  };

  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  // console.log(modalType);
  let token = localStorage.getItem("token");
  let access = "";
  if (token) {
    let decodedtoken = jwtDecode(token);
    access = decodedtoken.access;
  }
  let role = localStorage.getItem("Role");
  const handleNavigationClick = (page) => {
    setActivePage(page);
    // Add any additional logic you want to perform when a navigation link is clicked
  };
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
      } else {
        const empData = await axios.get(`${Server}/api/v1/employer/${userId}`);
        setData(empData.data.Employer);
        // console.log("hello", empData);
        // const isProfileCompleted = empData?.data?.Employer[0]?.profileCompleted;
        // if (!isProfileCompleted && !profileToastShown) {
        //   console.log("hi", empData?.data?.Employer[0]?.profileComplete);
        //   navigate("/my-profile");
        //   // toast.error("Please update your profile");
        //   // setProfileToastShown(true);
        // }
      }
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (token) {
      getData();
    }
  }, []);
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
    // const modalContent = '<div class="modal">Your modal content here</div>';
    // $(modalContent).appendTo('body').modal('show');
    // Cleanup the event listener when the component unmounts
    return () => {
      $(window).off("scroll", headerStyle);
    };
  }, []);

  useEffect(() => {
    // Update the current path whenever the location changes
    setCurrentPath(location.pathname);
  }, [location]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen); // Toggle mobile menu state
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  function clearAllCookies() {
    const cookiesArray = document.cookie.split(";");

    for (let i = 0; i < cookiesArray.length; i++) {
      const cookie = cookiesArray[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

      // Clear the cookie by setting an empty value and the same path
      document.cookie = name + "=;path=/";
    }
  }

  // Call the function to clear all cookies
  const handleLogout = () => {
    let role = localStorage.getItem("Role");
    if (role === "Candidate") {
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

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50); // Change 50 to your desired scroll threshold
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
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

  // const [showLogo, setShowLogo] = useState(true);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setShowLogo((prevShowLogo) => !prevShowLogo);
  //   }, 3000); // Adjust the interval time as needed (in milliseconds)

  //   return () => clearInterval(interval);
  // }, []);
  // useEffect(() => {

  //   const openModal = (event) => {
  //     event.preventDefault();
  //     event.currentTarget.blur();

  //     $.get(event.currentTarget.href, function (html) {
  //       $(html).appendTo("body").modal({
  //         closeExisting: true,
  //         fadeDuration: 300,
  //         fadeDelay: 0.15,
  //       });
  //     });
  //   };

  //   // Attach the click event to elements with the "call-modal" class
  //   $(".call-modal").on("click", openModal);

  //   // Cleanup the event listener when the component unmounts
  //   return () => {
  //     $(".call-modal").off("click", openModal);
  //   };
  // }, []);

  const accountMenu = (
    <Menu className="user-sidebar navigation">
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

  const employerMenu = (
    <Menu className="user-sidebar navigation">
      <Menu.Item key="1">
        <Link className="link-option" to="/employer-dashboard">
          {" "}
          <i class="la la-home design"></i> Dashboard
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
      </Menu.Item>
      <Menu.Item key="7">
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
      </Menu.Item>
      <Menu.Item key="10">
        <Link className="link-option" to="/resume-alerts">
          <i class="la la-bell design"></i>Notifications
        </Link>
      </Menu.Item> */}
      {/*    <Menu.Item key="10">
        <Link className="link-option" to="/employer-change-password">
          <i class="la la-lock design"></i>Change Password
        </Link>
  </Menu.Item>*/}
      <Menu.Item key="11">
        <Link className="link-option" to="/employer-profile-view">
          <i class="la la-user-alt design"></i>View Profile
        </Link>
      </Menu.Item>
      {/* <Menu.Item key="12">
        <Link className="link-option" to="/aiFitment">
          <i class="la la-robot design"></i>AI Fitment Analysis
        </Link>
      </Menu.Item> */}

      <Menu.Item key="13">
        <a className="link-option" onClick={() => handleLogout()}>
          <i class="la la-sign-out design"></i>Logout
        </a>
      </Menu.Item>
      {access === "Admin" ? (
        <Menu.Item key="14">
          <Link className="link-option" to="/allusers">
            <i class="la la-user"></i>All Users
          </Link>
        </Menu.Item>
      ) : null}
    </Menu>
  );
  // useEffect(() => {
  //   if (token === null) {
  //     showModal("login");
  //   }
  // }, []);
  return (
    <div>
      <header className="main-header header-style-two">
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

        <div className="auto-container">
          <div className="main-box">
            <div className="nav-outer">
              {/* <div className="logo-box">
               
                <div className="logo" style={{ marginTop: "10px" }}>
                  <a href="/">
                    <img
                      src={NewLogo}
                      style={{ height: "70px" }}
                      className="logo-images"
                      alt=""
                      title=""
                    />
                    
                  </a>
                </div>
             
              </div> */}
              <div className="logo-box">
                <div className="logo" style={{ marginTop: "10px" }}>
                  <a href="/">
                    {!isSticky ? (
                      <img
                        src={logo2}
                        style={{ height: "65px" }}
                        className="logo-images"
                        alt="Normal Logo"
                      />
                    ) : (
                      <img
                        src={NewLogo}
                        style={{ height: "65px" }}
                        className="logo-images"
                        alt="Sticky Logo"
                      />
                    )}
                  </a>
                </div>
              </div>

              {token === null ? (
                <div>
                  <nav className="nav main-menu">
                    <ul className="navigation" id="navbar">
                      <div className="header-navigation">
                        {/* <li className="current dropdown">
                          <a href="/find-jobs">
                            <span className="nav-link3">Find Jobs</span>
                          </a>
                        </li> */}

                        <li className="dropdown">
                          <a href="/pricing" style={{ textDecoration: "none" }}>
                            <span
                              style={{
                                display:
                                  "inline-block" /* Ensures proper spacing and hover effects */,
                                marginTop:
                                  "1.7rem" /* Equivalent to Tailwind's mt-6 */,
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
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(to right, #4299e1, #0070f3)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 15px rgba(66, 153, 225, 0.5)";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              Pricing{" "}
                            </span>
                          </a>
                        </li>
                        <li className="dropdown">
                          <div className="custom-dropdown">
                            <Dropdown overlay={menu}>
                              <div className="custom-dropdown-header">
                                <span>Blogs</span>
                                <DownOutlined className="dropdown-icon" />
                              </div>
                            </Dropdown>
                          </div>
                        </li>
                        <li className="dropdown">
                          <a href="/about" style={{ textDecoration: "none" }}>
                            <span
                              style={{
                                display:
                                  "inline-block" /* Ensures proper spacing and hover effects */,
                                marginTop:
                                  "1.7rem" /* Equivalent to Tailwind's mt-6 */,
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
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(to right, #4299e1, #0070f3)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 15px rgba(66, 153, 225, 0.5)";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              About
                            </span>
                          </a>
                        </li>

                        <li className="dropdown">
                          <a href="/contact">
                            <span
                              style={{
                                display: "inline-block",
                                marginTop: "1.7rem",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                                padding: "0.5rem 1rem",
                                boxShadow: "0 4px 15px rgba(66, 153, 225, 0.5)",
                                transition: "all 0.3s ease-in-out",
                                borderRadius: "10px",
                                background:
                                  "linear-gradient(to right, #4299e1, #0070f3)",
                                color: "#fff",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(to right, #4299e1, #0056a1)";
                                e.currentTarget.style.boxShadow =
                                  "0 6px 20px rgba(66, 153, 225, 0.7)";
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(to right, #4299e1, #0070f3)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 15px rgba(66, 153, 225, 0.5)";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              Contact
                            </span>
                          </a>
                        </li>
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
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(to right, #4299e1, #0070f3)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(66, 153, 225, 0.5)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <span className="submit-resume">For Job Seekers</span>
                        </button>
                      </div>

                      <li className="mm-add-listing">
                        <a href="job-post" className="theme-btn btn-style-one">
                          Job Post
                        </a>
                        <span>
                          <span className="contact-info">
                            <span className="phone-num">
                              <span>Call us</span>
                              <a href="tel: +1 289 499 2348">
                                {" "}
                                +1 289 499 2348
                              </a>
                            </span>
                            <span className="address">
                              Toronto Eaton center 220 Yonge st,
                              <br /> Toronto
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
                  </nav>

                  {/* {modalOpen && (
                    <div>
                      
                      <Resume
                        modalOpen={modalOpen}
                        setModalOpen={setModalOpen}
                        showResumeModal={showResumeModal}
                      />
                    </div>
                  )} */}
                </div>
              ) : (
                <nav className="nav main-menu">
                  {role === "Candidate" ? (
                    <ul className="navigation" id="navbar">
                      <div className="header-navigation">
                        <li className="current dropdown">
                          <a href="/">
                            <span className="nav-link3">Home</span>
                          </a>
                        </li>
                        <li
                          className="dropdown has-mega-menu"
                          id="has-mega-menu"
                        >
                          <a href="/find-jobs">
                            <span className="nav-link3">Find Jobs</span>
                          </a>
                        </li>

                        <li className="dropdown">
                          <a href="/employers-list">
                            <span className="nav-link3">Companies</span>
                          </a>
                        </li>
                        {/* <li className="dropdown">
                          <a href="/aiJobSearch">
                            <span className="nav-link3">AI Job Search</span>
                          </a>
                        </li> */}
                        <li className="dropdown">
                          <a href="/candidate-dashboard">
                            <span className="nav-link3">Dashboard</span>
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
                              <a
                                href="tel:+1 289 499 2348
"
                              >
                                +1 289 499 2348
                              </a>
                            </span>
                            <span className="address">
                              Toronto Eaton center 220 Yonge st,
                              <br /> Toronto
                            </span>
                            <a
                              href="mailto:info@skillstreamjobs.us"
                              className="email"
                            >
                              info@skillstreamjobs.us
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
                      {/* <li className="current dropdown">
                        <a href="/">
                          <span className="nav-link1">Home</span>
                        </a>
                      </li> */}
                      {}
                      {data[0]?.plan === "Recommended" ? (
                        <>
                          <li className="dropdown">
                            <a href="/candidates-list">
                              <span className="nav-link1">Resume Search</span>
                            </a>
                          </li>

                          <li className="current dropdown">
                            <a href="/aiSearch">
                              <span className="nav-link1">
                                AI Resume Search
                              </span>
                            </a>
                          </li>
                        </>
                      ) : null}

                      <li className="dropdown">
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
                              <a href="tel:1234567890"> +1 289 499 2348</a>
                            </span>
                            <span className="address">
                              Toronto Eaton center 220 Yonge st,
                              <br /> Toronto
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
                  )}
                </nav>
              )}
            </div>

            {token === null ? (
              <div className="outer-box">
                <div className="btn-box">
                  <button
                    className="theme-btn btn-style-nine call-modal"
                    // href="/login"
                    onClick={() => showModal("login")}
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
                    <button
                      class="menu-btn"
                      onClick={() => navigate("/shortlisted-jobs")}
                    >
                      {/*<span class="count">1</span>*/}
                      <span class="icon la la-heart-o"></span>
                    </button>

                    <button
                      class="menu-btn"
                      onClick={() => navigate("/job-alerts")}
                    >
                      <span class="icon la la-bell"></span>
                    </button>
                    <div className="dropdown dashboard-option">
                      <Dropdown overlay={accountMenu} trigger={["click"]}>
                        <a className="dropdown-toggle" role="button">
                          <img
                            src={data[0]?.image}
                            alt="avatar"
                            className="thumb"
                            style={{ width: "145px" }}
                          />
                          <span className="name">My Account</span>
                        </a>
                      </Dropdown>
                    </div>
                  </div>
                ) : (
                  <div className="outer-box">
                    <button
                      class="menu-btn"
                      onClick={() => navigate("/savedResume")}
                    >
                      {/*<span class="count">1</span>*/}
                      <span class="icon la la-heart-o"></span>
                    </button>

                    <button
                      class="menu-btn"
                      onClick={() => navigate("/resume-alerts")}
                    >
                      <span class="icon la la-bell"></span>
                    </button>
                    <div className="dropdown dashboard-option">
                      <Dropdown overlay={employerMenu} trigger={["click"]}>
                        <a className="dropdown-toggle" role="button">
                          <img
                            src={data[0]?.image}
                            alt="avatar"
                            className="thumb"
                            style={{ width: "145px" }}
                          />
                          <span className="name">My Account</span>
                        </a>
                      </Dropdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mobile-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
            }}
          >
            <a href="/">
              {!isSticky ? (
                <img
                  src={logo2}
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
            <button className="navbar-trigger" onClick={toggleMobileMenu}>
              <span className="flaticon-menu-1"></span>
            </button>
          </div>

          <div className="login-box">
            <button
              onClick={() => showModal("login")}
              className="call-modal"
            ></button>
          </div>
        </div>

        {/* <div id="nav-mobile"></div> */}

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
                    style={{ height: "55px" }}
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
              {/* <div className="skills-logo2">{text}</div> */}
            </div>

            <div className="mobile-dropdown" id="navbar">
              {token === null ? (
                <>
                  <div className="current dropdown">
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
                  <div className=" dropdown">
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
                      // className="theme-btn btn-style-two"
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
                      <span className="submit-resume">For Job Seekers</span>
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
                      {/* Add more menu items for candidates */}
                    </>
                  ) : (
                    <>
                      <div className="current dropdown">
                        {data[0]?.plan === "Recommended" ? (
                          <a href="/candidates-list">
                            <span className="mob-nav">Resume Search</span>
                          </a>
                        ) : null}
                      </div>
                      <div className="current dropdown">
                        <a href="/aiSearch">
                          <span className="mob-nav">AI Resume Search</span>
                        </a>
                      </div>

                      <div className="current dropdown">
                        <a href="/employer-dashboard">
                          <span className="mob-nav">Dashboard</span>
                        </a>
                      </div>
                      {/* Add more menu items for employers */}
                    </>
                  )}
                </>
              )}
            </div>
          </nav>
          {token === null && (
            <div className="login-register-button">
              <button className="btn-login" onClick={() => showModal("login")}>
                Login / Register
              </button>
            </div>
          )}
        </Drawer>
      </header>
      {/* {popup &&
        <Login/> 
        }*/}
    </div>
  );
};

export default HeaderEmp;

{
  /*<ul>
                    <li className="dropdown">
                      <span>Shop</span>
                      <ul>
                        <li>
                          <a href="shop.html">Shop List</a>
                        </li>
                        <li>
                          <a href="shop-single.html">Shop Single</a>
                        </li>
                        <li>
                          <a href="shopping-cart.html">Shopping Cart</a>
                        </li>
                        <li>
                          <a href="shop-checkout.html">Checkout</a>
                        </li>
                        <li>
                          <a href="order-completed.html">Order Completed</a>
                        </li>
                        <li>
                          <a href="login.html">Login</a>
                        </li>
                        <li>
                          <a href="register.html">Register</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="about.html">About</a>
                    </li>
                    <li>
                      <a href="pricing.html">Pricing</a>
                    </li>
                    <li>
                      <a href="faqs.html">FAQ's</a>
                    </li>
                    <li>
                      <a href="terms.html">Terms</a>
                    </li>
                    <li>
                      <a href="invoice.html">Invoice</a>
                    </li>
                    <li>
                      <a href="elements.html">Ui Elements</a>
                    </li>
                    <li>
                      <a href="contact.html">Contact</a>
                    </li>
</ul>*/
}
