import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import $ from "jquery";
// import '@fortawesome/fontawesome-free/css/all.min.css';
import "jquery-knob/js/jquery.knob.js";
import "jquery.appear";

const CandidatesSidebar = () => {
  const location = useLocation();

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

  useEffect(() => {
    const handleListingNavClick = function () {
      var target = $(this).attr("data-target");
      $(this).addClass("active").siblings("li").removeClass("active");
      $(target).appear(function () {
        $(this).addClass("active");
      });
      // animate
      $("html, body").animate(
        {
          scrollTop: $(target).offset().top - 90,
        },
        1000
      );
    };

    // Attach the click event to elements with the "listing-nav li" selector
    $(".listing-nav li").on("click", handleListingNavClick);

    // Cleanup the event listener when the component unmounts
    return () => {
      $(".listing-nav li").off("click", handleListingNavClick);
    };
  }, []);

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

  return (
    <div>
      <div class="sidebar-backdrop"></div>

      <div class="user-sidebar">
        <div class="sidebar-inner">
          <ul class="navigation">
            <li className={isActive("/candidate-dashboard")}>
              <Link to="/candidate-dashboard">
                <i class="la la-dashboard"></i> Dashboard
              </Link>
            </li>

            {/* <li class={isActive("/my-profile")}>
              <Link to="/my-profile">
                <i class="la la-user-tie"></i>My Profile
              </Link>
            </li>*/}
            {/*<li class={isActive("/my-resume")}>
              <Link to="/my-resume">
                <i class="la la-file-invoice"></i>My Resume
              </Link>
  </li>*/}
            <li class={isActive("/practiceInterview")}>
              <Link to="/practiceInterview">
                <i class="la la-paper-plane"></i> Practice Assessment{" "}
              </Link>
            </li>
            <li class={isActive("/applied-jobs")}>
              <Link to="/applied-jobs">
                <i class="la la-briefcase"></i> Applied Jobs{" "}
              </Link>
            </li>
            <li class={isActive("/job-alerts")}>
              <Link to="/job-alerts">
                <i class="la la-bell"></i>Job Alerts
              </Link>
            </li>
            <li class={isActive("/shortlisted-jobs")}>
              <Link to="/shortlisted-jobs">
                <i class="la la-bookmark-o"></i>Shortlisted Jobs
              </Link>
            </li>
            <li class={isActive("/cv-manager")}>
              <Link to="/cv-manager">
                <i class="la la-file-invoice"></i> CV manager
              </Link>
            </li>

            <li class={isActive("/candidates-profile-view")}>
              <Link to="/candidates-profile-view">
                <i class="la la-user-alt"></i>View Profile
              </Link>
            </li>

            {/*<li class={isActive('/packages')}>
              <Link  to="/packages">
                <i class="la la-box"></i>Packages
              </Link>
  </li>*/}
            <li class={isActive("/messages")}>
              <Link to="/messages">
                <i class="la la-comment-o"></i>Messages
              </Link>
            </li>
          </ul>

          {/* <div class="skills-percentage">
            <h4>Skills Percentage</h4>
            <p>
              Put value for "Cover Image" field to increase your skill up to
              "85%"
            </p>

            <div class="pie-graph">
              <div class="graph-outer">
                <input
                  type="text"
                  class="dial"
                  data-fgColor="#7367F0"
                  data-bgColor="transparent"
                  data-width="234"
                  data-height="234"
                  data-linecap="normal"
                  value="30"
                />
                <div class="inner-text count-box">
                  <span
                    class="count-text txt"
                    data-stop="30"
                    data-speed="2000"
                  ></span>
                  %
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CandidatesSidebar;

//  <li>
// // <Link  to="/change-password">
// //   <i class="la la-lock"></i>Change Password
// // </Link>
// // </li>
// <li>
// <Link  to="candidates-profile-view">
//   <i class="la la-user-alt"></i>View Profile
// </Link>
// </li>
// <li>
// <Link  to="/logout">
//   <i class="la la-sign-out"></i>Logout
// </Link>
// </li>
// <li>
// <Link  to="/delete-profile">
//   <i class="la la-trash"></i>Delete Profile
// </Link>
// </li>
