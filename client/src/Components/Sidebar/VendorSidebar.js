import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import $ from "jquery";
import { jwtDecode } from "jwt-decode";

const VendorSidebar = () => {
  const location = useLocation();
  //   let token = localStorage.getItem("token");
  // //   let access = "";
  // //   if (token) {
  // //     let decodedtoken = jwtDecode(token);
  // //     access = decodedtoken.access;
  // //   }
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
            <li className={isActive("/vendor/dashboard")}>
              <Link to="/vendor/dashboard">
                <i className="la la-tachometer-alt"></i> Dashboard
              </Link>
            </li>

            <li className={isActive("/vendor/appliedJobs")}>
              <Link to="/vendor/appliedJobs">
                <i className="la la-check-circle"></i> Applied Jobs
              </Link>
            </li>

            <li className={isActive("/vendor/shortlisted-jobs")}>
              <Link to="/vendor/shortlisted-jobs">
                <i className="la la-bookmark-o"></i> Shortlisted Jobs
              </Link>
            </li>

            <li className={isActive("/vendor/manage/candidates")}>
              <Link to="/vendor/manage/candidates">
                <i className="la la-users"></i> Manage Candidates
              </Link>
            </li>
            <li className={isActive("/vendor/jobAlerts")}>
              <Link to="/vendor/jobAlerts">
                <i className="la la-bell"></i> Job Alerts
              </Link>
            </li>
            {/* Uncomment if needed later:
  <li className={isActive("/vendor/upload/candidates")}>
    <Link to="/vendor/upload/candidates">
      <i className="la la-user-plus"></i> Add Candidates
    </Link>
  </li>
  */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VendorSidebar;
