import React, { useEffect } from "react";
import NewLogo from "../../assets/logo-twos.png";

const Footer = () => {
  useEffect(() => {
    const scrollButton = document.querySelector(".scroll-to-top");

    const handleScroll = () => {
      const scrollY = window.scrollY;
      scrollButton.style.display = scrollY > 300 ? "block" : "none";
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("scroll", handleScroll);
    scrollButton.addEventListener("click", scrollToTop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollButton.removeEventListener("click", scrollToTop);
    };
  }, []);

  return (
    <footer className="main-footer">
      <div className="auto-container">
        <div className="widgets-section wow fadeInUp">
          <div className="row">
            {/* Logo Section */}
            <div className="big-column col-xl-4 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo-footer">
                  <a href="/">
                    <img
                      src={NewLogo}
                      alt="Skill Stream Logo"
                      style={{ height: "100px" }}
                      className="logo-images"
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Links Section */}
            <div className="big-column col-xl-8 col-lg-9 col-md-12">
              <div className="row">
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">About Us</h4>
                    <ul className="list">
                      <li><a href="/about">About</a></li>
                      <li><a href="/pricing">Pricing</a></li>
                      <li><a href="/blog">Blog</a></li>
                      <li><a href="/contact">Contact</a></li>
                    </ul>
                  </div>
                </div>

                <div className="footer-column col-lg-4 col-md-6 col-sm-8">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">Helpful Resources</h4>
                    <ul className="list">
                      <li><a href="/contact">Site Map</a></li>
                      <li><a href="/termsAndCondition">Terms of Use</a></li>
                      <li><a href="/privacyCenter">Privacy Center</a></li>
                      <li><a href="/securityCenter">Security Center</a></li>
                    </ul>
                  </div>
                </div>

                <div className="footer-column col-lg-5 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">Reach Us</h4>
                    <ul className="list" style={{ lineHeight: "1.8" }}>
                      <li>
                        <i className="fas fa-envelope" style={{ marginRight: "8px" }}></i>
                        <a href="mailto:info@skillstreamjobs.us">info@skillstreamjobs.us</a>
                      </li>
                      <li>
                        <i className="fas fa-phone" style={{ marginRight: "8px" }}></i>
                        <a href="tel:+18475981122">+1 (847) 598-1122</a>
                      </li>
                      <li>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: "8px" }}></i>
                        <a>1827 Walden Office Sq Suite #260</a><br />
                        Schaumburg, IL 60173
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="outer-box d-flex justify-content-between align-items-center flex-wrap">
            <div className="copyright-text">
              © 2024 <a href="/">Skill Stream</a>. All Rights Reserved.
            </div>
            <div className="social-links">
              <a href="https://www.facebook.com/profile.php?id=61563887762159" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/skillstream_jobs/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/company/104131262/admin/dashboard/" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="scroll-to-top scroll-to-target" data-target="html">
          <span className="fa fa-angle-up"></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
