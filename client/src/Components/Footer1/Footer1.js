import React, { useEffect, useState } from "react";
import logo1 from "../../assets/unnamedBlack.png";

const Footer1 = () => {
  useEffect(() => {
    const scrollButton = document.querySelector(".scroll-to-top");

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Show/hide the scroll-to-top button based on scroll position
      if (scrollY > 300) {
        scrollButton.style.display = "block";
      } else {
        scrollButton.style.display = "none";
      }
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Attach event listeners
    window.addEventListener("scroll", handleScroll);
    scrollButton.addEventListener("click", scrollToTop);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollButton.removeEventListener("click", scrollToTop);
    };
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

  return (
    <footer class="main-footer">
      <div class="auto-container">
        <div class="widgets-section wow fadeInUp">
          <div class="row">
            <div class="big-column col-xl-4 col-lg-3 col-md-12">
              <div class="footer-column about-widget">
                <div className="logo-footer">
                  <a href="/">
                    {/* <img
                      src={logo1}
                      style={{ height: "80px" }}
                      className="logo-images"
                      alt=""
                      title=""
                    /> */}
                    <span
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
                    </span>
                  </a>
                </div>
                <br />
                <p class="phone-num">
                  <span>Reach us </span>
                  {/* <a href="thebeehost%40support.html">123 456 7890</a> */}
                  <a href="mailto:info@skillstreamjobs.us" class="email">
                    info@skillstreamjobs.us
                  </a>
                </p>
                <p class="address">
                  Toronto Eaton center 220 Yonge st,
                  <br /> Toronto
                  {/* <a href="mailto:info@skillstreamjobs.us" class="email">
                    sinfo@skillstreamjobs.us
                  </a> */}
                </p>
              </div>
            </div>

            <div class="big-column col-xl-8 col-lg-9 col-md-12">
              <div class="row">
                <div class="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div class="footer-widget links-widget">
                    <h4 class="widget-title">For Candidates</h4>
                    <div class="widget-content">
                      <ul class="list">
                        <li>
                          <a href="/find-jobs">Find Jobs</a>
                        </li>
                        {/* <li>
                          <a href="#">Find Categories</a>
                        </li> */}
                        {/* <li>
                          <a href="#">Candidate Dashboard</a>
                        </li> */}
                        <li>
                          <a href="/job-alerts">Job Alerts</a>
                        </li>
                        {/* <li>
                          <a href="#">My Bookmarks</a>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* <div class="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div class="footer-widget links-widget">
                    <h4 class="widget-title">For Employers</h4>
                    <div class="widget-content">
                      <ul class="list">
                        <li>
                          <a href="/applicants">Find Candidates</a>
                        </li>
                        <li>
                          <a href="/post-Job">Post a Job</a>
                        </li>
                       
                      </ul>
                    </div>
                  </div>
                </div> */}

                <div class="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div class="footer-widget links-widget">
                    <h4 class="widget-title">About Us</h4>
                    <div class="widget-content">
                      <ul class="list">
                        {/* <li>
                          <a href="#">Job Page</a>
                        </li>
                        <li>
                          <a href="#">Job Page Alternative</a>
                        </li> */}
                        {/* <li>
                          <a href="#">Resume Page</a>
                        </li> */}
                        <li>
                          <a href="#">Blog</a>
                        </li>
                        <li>
                          <a href="/contact">Contact</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div class="footer-widget links-widget">
                    <h4 class="widget-title">Helpful Resources</h4>
                    <div class="widget-content">
                      <ul class="list">
                        <li>
                          <a href="/contact">Site Map</a>
                        </li>
                        <li>
                          <a href="/termsAndCondition">Terms of Use</a>
                        </li>
                        <li>
                          <a href="/privacyCenter">Privacy Center</a>
                        </li>
                        <li>
                          <a href="/securityCenter">Security Center</a>
                        </li>
                        {/* <li>
                          <a href="#">Accessibility Center</a>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="auto-container">
          <div class="outer-box">
            <div class="copyright-text">
              © 2024 <a href="#">Skill Stream</a>. All Right Reserved.
            </div>
            <div class="social-links">
              <a href="#">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#">
                <i class="fab fa-twitter-t"></i>
              </a>
              <a href="#">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/company/viva-tech-solutions/mycompany/">
                <i class="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="scroll-to-top scroll-to-target" data-target="html">
        <span class="fa fa-angle-up"></span>
      </div>
    </footer>
  );
};

export default Footer1;
