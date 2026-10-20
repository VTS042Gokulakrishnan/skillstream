import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import $ from "jquery";
import { jwtDecode } from "jwt-decode";
const EmployerSidebar = () => {
  const location = useLocation();
  let token = localStorage.getItem("token");
  let access = "";
  if (token) {
    let decodedtoken = jwtDecode(token);
    access = decodedtoken.access;
  }

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  useEffect(() => {
    function makeContentSticky() {
      // Make Content Sticky
      if ($(".sticky-sidebar").length) {
        $(".sidebar-side").theiaStickySidebar({
          // Settings
          additionalMarginTop: 90,
        });
      }
      if ($("#toggle-user-sidebar").length) {
        $("#toggle-user-sidebar, .dashboard-option a").on("click", function () {
          $("body").toggleClass("user-sidebar-active");
        });

        $(".sidebar-backdrop").on("click", function () {
          $("body").removeClass("user-sidebar-active");
        });
      }
    }

    // Initial call
    makeContentSticky();

    // Scroll event listener
    $(window).scroll(() => {
      makeContentSticky();
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      $(window).off("scroll", makeContentSticky);
    };
  }, []);

  return (
    <div>
      <div class="sidebar-backdrop"></div>

      <div class="user-sidebar">
        <div class="sidebar-inner">
          <ul class="navigation">
            <li class={isActive("/employer-dashboard")}>
              <Link to="/employer-dashboard">
                {" "}
                <i class="la la-dashboard"></i> Dashboard
              </Link>
            </li>

            {/*    <li class={isActive("/company-profile")}>
              <Link to="/company-profile">
                <i class="la la-user-tie"></i>Company Profile
              </Link>
  </li>*/}
            <li class={isActive("/post-job")}>
              <Link to="/post-job">
                <i class="la la-paper-plane"></i>Post a New Job
              </Link>
            </li>
            <li class={isActive("/manage-jobs")}>
              <Link to="/manage-jobs">
                <i class="la la-briefcase"></i> Manage Jobs{" "}
              </Link>
            </li>
            <li class={isActive("/savedResume")}>
              <Link to="/savedResume">
                <i class="la la-heart-o"></i>Saved Resumes
              </Link>
            </li>
            <li class={isActive("/applicants")}>
              <Link to="/applicants">
                <i class="la la la-user-tie"></i> All Applicants
              </Link>
            </li>
            <li class={isActive("/shortlisted-resumes")}>
              <Link to="/shortlisted-resumes">
                <i class="la la-bookmark-o"></i>Shortlisted Resumes
              </Link>
            </li>
            <li class={isActive("/interview-candidates")}>
              <Link to="/interview-candidates">
                <i class="la la-user-check"></i> Interviewed Candidates
              </Link>
            </li>
            <li class={isActive("/aiFitment")}>
              <Link to="/aiFitment">
                <i class="la la-robot"></i>AI Fitment Analysis
              </Link>
            </li>
            <li class={isActive("/employer-profile-view")}>
              <Link to="/employer-profile-view">
                <i class="la la-user-alt"></i>View Profile
              </Link>
            </li>
            {/* 
            <li class={isActive("/employer-packages")}>
              <Link to="/employer-packages">
                <i class="la la-box"></i>Packages
              </Link>
            </li>*/}
            <li class={isActive("/employer-messages")}>
              <Link to="/employer-messages">
                <i class="la la-comment-o"></i>Messages
              </Link>
            </li>
            <li class={isActive("/employer-billing")}>
              <Link to="/employer-billing">
                <i class="la la-file-invoice-dollar"></i>Billing
              </Link>
            </li>
            {access === "Admin" ? (
              <li class={isActive("/allusers")}>
                <Link to="/allusers">
                  <i class="la la-user"></i>All Users
                </Link>
              </li>
            ) : null}
            <li class={isActive("/resume-alerts")}>
              <Link to="/resume-alerts">
                <i class="la la-bell"></i>Notifications
              </Link>
            </li>
            {/* <li class={isActive("/")}>
              <Link to="/">
                <i class="la la-sign-out design"></i>Logout
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployerSidebar;

//  <li>
// // <Link  to="/employer-change-password">
// //   <i class="la la-lock"></i>Change Password
// // </Link>
// // </li>
// <li>
// <Link to="/employer-view-profile">
//   <i class="la la-user-alt"></i>View Profile
// </Link>
// </li>
// <li>
// <Link to="/logout">
//   <i class="la la-sign-out"></i>Logout
// </Link>
// </li>
// <li>
// <Link to="/delete">
//   <i class="la la-trash"></i>Delete Profile
// </Link>
// </li>
