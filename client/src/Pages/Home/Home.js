import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import $ from "jquery";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import employee from "../../assets/portal-1-1024x1024.png";
import candiate from "../../assets/candidate.png";
import hiring from "../../assets/wepik-export-20240209200028x6tk.png";
import torondo from "../../assets/Toronado.jpg";
import calcary from "../../assets/calcary.jpg";
import regina from "../../assets/regina.jpg";
import montreal from "../../assets/montreal.jpg";
import vancourer from "../../assets/vancourer.jpg";

const Home = () => {
  const config = {
    colors: [
      "#eddc01",
      "#f2b125",
      "#fd9407",
      "#ff7308",
      "#eb5508",
      "#fe1a17",
      "#e93702",
    ],
    sizes: [4, 6, 8],
    minimalDistance: 20,
    gravitation: 0.2,
    airResistance: 0.98,
    shrink: 0.1,
  };

  const prev = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const $body = $("body");
    const $document = $(document);

    const appendElement = (el) => $body.append(el);
    const removeElement = (el) => setTimeout(() => $(el).remove());

    const rand = (min, max) =>
      Math.floor(Math.random() * (max - min + 1) + min);
    const pickRandom = (arr) => arr[rand(0, arr.length - 1)];

    const calcDistance = (a, b) =>
      Math.floor(Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2));

    const calcAngleRadians = (startPoint, endPoint) =>
      Math.atan2(startPoint.y - endPoint.y, endPoint.x - startPoint.x);

    const updateCoords = (position) => {
      prev.current.x = last.current.x;
      prev.current.y = last.current.y;
      last.current.x = position.x;
      last.current.y = position.y;
    };

    const generateSpeed = () => {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const speed = Math.random() * 2 + 1;
      const addSpeed =
        (calcDistance(prev.current, last.current) / config.minimalDistance) * 2;
      const addSpeedY =
        addSpeed * Math.sin(calcAngleRadians(prev.current, last.current));
      const addSpeedX =
        addSpeed * Math.cos(calcAngleRadians(prev.current, last.current));
      const speedY = speed * Math.sin(angle) + addSpeedY;
      const speedX = speed * Math.cos(angle) + addSpeedX;
      return { speedX, speedY };
    };

    const animateSpark = (spark) => {
      let { speedX, speedY } = generateSpeed();
      const gravitation = config.gravitation;
      const airResistance = config.airResistance;
      const shrink = config.shrink;

      function animate() {
        $(spark).css({
          top: `-=${speedY}`,
          left: `+=${speedX}`,
          width: `-=${shrink}`,
          height: `-=${shrink}`,
        });
        speedY -= gravitation;
        speedX *= airResistance;

        if (
          $(spark).position().top > $(window).height() ||
          $(spark).position().left < 0 ||
          $(spark).width() <= 0
        ) {
          removeElement(spark);
        } else {
          requestAnimationFrame(animate);
        }
      }
      animate();
    };

    const createSpark = (position) => {
      const spark = $("<div></div>");
      const size = pickRandom(config.sizes);
      spark.addClass("spark");
      spark.append(`<div class="spark-glow"></div>`);
      $(spark).css({
        left: position.x,
        top: position.y,
        background: pickRandom(config.colors),
        width: size,
        height: size,
      });

      animateSpark(spark);
      appendElement(spark);

      updateCoords(position);
    };

    $document.mousemove((e) => {
      const position = {
        x: e.clientX,
        y: e.clientY,
      };
      if (calcDistance(last.current, position) > config.minimalDistance) {
        createSpark(position);
      }
    });

    // Cleanup
    return () => {
      $document.off("mousemove");
    };
  }, []);

  const options = {
    loop: true,
    nav: false,
    smartSpeed: 500,
    autoplay: true,
    autoplayTimeout: 10000,
    // navText: [
    //   '<span class="flaticon-back"></span>',
    //   '<span class="flaticon-next"></span>',
    // ],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      768: {
        items: 3,
      },
      1024: {
        items: 4,
      },
    },
  };

  const homeSection = {
    loop: true,
    nav: false,
    smartSpeed: 500,
    autoplay: true,
    autoplayTimeout: 8500,
    dots: false,
    navText: [
      '<span class="flaticon-back"></span>',
      '<span class="flaticon-next"></span>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1024: {
        items: 1,
      },
    },
  };
  const scrollToTargetRef = useRef(null);

  useEffect(() => {
    // Scroll to Target
    const handleScrollToTarget = () => {
      if (scrollToTargetRef.current) {
        const target = scrollToTargetRef.current.getAttribute("data-target");
        if (target) {
          document.querySelector(target).scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    // Attach event listener to elements with the class "scroll-to-target"
    document.querySelectorAll(".scroll-to-target").forEach((element) => {
      element.addEventListener("click", handleScrollToTarget);
    });

    // Clean up: Remove event listeners when the component is unmounted
    return () => {
      document.querySelectorAll(".scroll-to-target").forEach((element) => {
        element.removeEventListener("click", handleScrollToTarget);
      });
    };
  }, []);
  const navigate = useNavigate();
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, [navigate]);
  return (
    <div data-anm=".anm">
      <OwlCarousel
        className="candidates-carousel owl-carousel owl-theme default-dots"
        {...homeSection}
      >
        <section className="banner-section-two">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-7 col-md-12 col-sm-12">
                <div className="inner-column wow fadeInUp">
                  <div className="title-box">
                    <h1 className="head-home">Find Your Perfect Job Match</h1>
                    <div className="text-head">
                      Find Jobs, Employment & Career Opportunities
                    </div>
                  </div>

                  <div className="para-home">
                    {/* <form
                      method="post"
                      action="http://localhost:3000/find-jobs"
                    >
                      <div className="row">
                        <div className="form-group col-lg-5 col-md-12 col-sm-12">
                          <span className="icon flaticon-search-1"></span>
                          <input
                            type="text"
                            name="field_name"
                            placeholder="Job title, keywords, or company"
                          />
                        </div>

                        <div className="form-group col-lg-4 col-md-12 col-sm-12 location">
                          <span className="icon flaticon-map-locator"></span>
                          <input
                            type="text"
                            name="field_name"
                            placeholder="City or postcode"
                          />
                        </div>

                        <div className="form-group col-lg-3 col-md-12 col-sm-12 text-right">
                          <button
                            type="submit"
                            // onClick={()=>navigate("/job-list")}
                            className="theme-btn btn-style-one"
                          >
                            <span className="btn-title">Find Jobs</span>
                          </button>
                        </div>
                      </div>
                    </form> */}
                    Are you tired of searching through endless job listings,
                    hoping to find the perfect match for your skills and
                    aspirations? Look no further! At Skill Stream, we specialize
                    in connecting job seekers like you with opportunities that
                    align with your interests, qualifications, and career goals.
                  </div>

                  {/* <div className="popular-searches">
                    <span className="title">Popular Searches : </span>
                    <a href="#">Designer</a>,<a href="#">Developer</a>,
                    <a href="#">Web</a>,<a href="#">IOS</a>,<a href="#">PHP</a>,
                    <a href="#">Senior</a>,<a href="#">Engineer</a>,
                  </div> */}

                  {/* <div className="bottom-box">
                    <div className="count-employers">
                      <span className="title">10k+ Candidates</span>
                      <img
                        src="images/resource/user-strategy-and-innovation-1.png"
                        alt=""
                      />
                    </div>
                    <a href="#" className="upload-cv">
                      <span className="icon flaticon-file"></span> Upload your
                      CV
                    </a>
                  </div> */}
                </div>
              </div>

              <div className="image-column col-lg-5 col-md-12">
                <div className="image-box">
                  <figure
                    className="main-image anm"
                    data-wow-delay="1000ms"
                    data-speed-x="2"
                    data-speed-y="2"
                  >
                    <img className="img-home" src={employee} alt="" />
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="banner-section-two">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-7 col-md-12 col-sm-12">
                <div className="inner-column wow fadeInUp">
                  <div className="title-box">
                    <h1 className="head-home">
                      Discover Your Future at Skill Stream
                    </h1>
                    {/* <div className="text">
                      Find Jobs, Employment & Career Opportunities
                    </div> */}
                    <br />
                    <br />

                    <div className="text1">
                      Step into a realm of boundless opportunities and embark on
                      an enriching journey towards personal and professional
                      growth with Skill Stream, where your aspirations are
                      nurtured, your talents are celebrated, and your
                      contributions are valued as integral components of our
                      shared vision for a brighter future
                    </div>
                  </div>

                  {/* <div className="job-search-form">
                    <form
                      method="post"
                      action="http://localhost:3000/find-jobs"
                    >
                      <div className="row">
                        <div className="form-group col-lg-5 col-md-12 col-sm-12">
                          <span className="icon flaticon-search-1"></span>
                          <input
                            type="text"
                            name="field_name"
                            placeholder="Job title, keywords, or company"
                          />
                        </div>

                        <div className="form-group col-lg-4 col-md-12 col-sm-12 location">
                          <span className="icon flaticon-map-locator"></span>
                          <input
                            type="text"
                            name="field_name"
                            placeholder="City or postcode"
                          />
                        </div>

                        <div className="form-group col-lg-3 col-md-12 col-sm-12 text-right">
                          <button
                            type="submit"
                            // onClick={()=>navigate("/job-list")}
                            className="theme-btn btn-style-one"
                          >
                            <span className="btn-title">Find Jobs</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div> */}

                  {/* <div className="popular-searches">
                    <span className="title">Popular Searches : </span>
                    <a href="#">Designer</a>,<a href="#">Developer</a>,
                    <a href="#">Web</a>,<a href="#">IOS</a>,<a href="#">PHP</a>,
                    <a href="#">Senior</a>,<a href="#">Engineer</a>,
                  </div> */}

                  {/* <div className="bottom-box">
                      <div className="count-employers">
                        <span className="title">10k+ Candidates</span>
                        <img
                          src="images/resource/user-strategy-and-innovation-1.png"
                          alt=""
                        />
                      </div>
                      <a href="#" className="upload-cv">
                        <span className="icon flaticon-file"></span> Upload your
                        CV
                      </a>
                    </div> */}
                </div>
              </div>

              <div className="image-column col-lg-5 col-md-12">
                <div className="image-box">
                  <figure
                    className="main-image anm"
                    data-wow-delay="1000ms"
                    data-speed-x="2"
                    data-speed-y="2"
                  >
                    <img className="img-home" src={candiate} alt="" />
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="banner-section-two">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-7 col-md-12 col-sm-12">
                <div className="inner-column wow fadeInUp">
                  <div className="title-box">
                    <h1 className="head-home1">
                      Maximize Your Hiring Success
                      <br />
                      with Skill Stream
                    </h1>
                    <div className="text">
                      Are you tired of sifting through countless resumes and
                      struggling to find the perfect candidate for your job
                      openings? Look no further! With Skill Stream , we offer a
                      streamlined and effective solution to connect you with top
                      talent seamlessly.
                    </div>
                  </div>

                  <div>
                    {/* <form
                      method="post"
                      action="http://localhost:3000/find-jobs"
                    >
                      <div className="row">
                        <div className="form-group col-lg-5 col-md-12 col-sm-12">
                          <span className="icon flaticon-search-1"></span>
                          <input
                            type="text"
                            name="field_name"
                            placeholder="Job title, keywords, or company"
                          />
                        </div>

                        <div className="form-group col-lg-4 col-md-12 col-sm-12 location">
                          <span className="icon flaticon-map-locator"></span>
                          <input
                            type="text"
                            name="field_name"
                            placeholder="City or postcode"
                          />
                        </div>

                       
                      </div>
                    </form> */}
                    {/* <div className="form-group col-lg-3 col-md-12 col-sm-12 text-right"> */}
                    <button
                      // type="submit"
                      onClick={() => navigate("/find-jobs")}
                      className="theme-btn btn-style-one"
                    >
                      <span className="btn-title">Find Jobs</span>
                    </button>
                    {/* </div>
                     */}
                  </div>

                  {/* <div className="popular-searches">
                    <span className="title">Popular Searches : </span>
                    <a href="#">Designer</a>,<a href="#">Developer</a>,
                    <a href="#">Web</a>,<a href="#">IOS</a>,<a href="#">PHP</a>,
                    <a href="#">Senior</a>,<a href="#">Engineer</a>,
                  </div>

                  <div className="bottom-box">
                    <div className="count-employers">
                      <span className="title">10k+ Candidates</span>
                      <img
                        src="images/resource/user-strategy-and-innovation-1.png"
                        alt=""
                      />
                    </div>
                    <a href="#" className="upload-cv">
                      <span className="icon flaticon-file"></span> Upload your
                      CV
                    </a>
                  </div> */}
                </div>
              </div>

              <div className="image-column col-lg-3 col-md-8">
                <div className="image-box">
                  <figure
                    className="main-image anm"
                    data-wow-delay="1000ms"
                    data-speed-x="2"
                    data-speed-y="2"
                  >
                    <img className="img-home1" src={hiring} alt="" />
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </section>
      </OwlCarousel>

      <section className="work-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>How It Works?</h2>
            <div className="text">Job for anyone, anywhere</div>
          </div>
          {/* <div class="bubbles">
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
            <div class="bubble"></div>
          </div> */}
          <div id="background-wrap">
            <div class="bubble x1"></div>
            <div class="bubble x2"></div>
            <div class="bubble x3"></div>
            <div class="bubble x4"></div>
            <div class="bubble x5"></div>
            <div class="bubble x6"></div>
            <div class="bubble x7"></div>
            <div class="bubble x8"></div>
            <div class="bubble x9"></div>
            <div class="bubble x10"></div>
          </div>
          <div className="row wow fadeInUp">
            <div className="work-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <figure className="image">
                  <img src="images/resource/work-1.png" alt="" />
                </figure>
                <h5>Free Resume Assessments</h5>
                <p>
                  Employers on average spend 31 seconds scanning resumes to
                  identify potential matches.
                </p>
              </div>
            </div>

            <div className="work-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <figure className="image">
                  <img src="images/resource/work-2.png" alt="" />
                </figure>
                <h5>Job Fit Scoring</h5>
                <p>
                  Employers on average spend 31 seconds scanning resumes to
                  identify potential matches.
                </p>
              </div>
            </div>

            <div className="work-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <figure className="image">
                  <img src="images/resource/work-3.png" alt="" />
                </figure>
                <h5>Help Every Step of the Way</h5>
                <p>
                  Employers on average spend 31 seconds scanning resumes to
                  identify potential matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="job-section-two">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Featured Jobs</h2>
            <div className="text">
              Know your worth and find the job that qualify your life
            </div>
          </div>

          <div className="row wow fadeInUp">
            <div className="job-block-two col-lg-12">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img src="images/resource/company-logo/1-1.png" alt="" />
                  </span>
                  <h4>
                    <a href="#">Software Engineer (Android), Libraries</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span> Segment
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      London, UK
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span> 11 hours
                      ago
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span> $35k - $45k
                    </li>
                  </ul>
                </div>
                <ul className="job-other-info">
                  <li className="privacy">Private</li>
                  <li className="required">Urgent</li>
                  <li className="time">Full Time</li>
                </ul>
                <button className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>

            <div className="job-block-two col-lg-12 col-md-12 col-sm-12">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img src="images/resource/company-logo/1-2.png" alt="" />
                  </span>
                  <h4>
                    <a href="#">Recruiting Coordinator</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span> Segment
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      London, UK
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span> 11 hours
                      ago
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span> $35k - $45k
                    </li>
                  </ul>
                </div>
                <ul className="job-other-info">
                  <li className="privacy">Private</li>
                  <li className="time">Full Time</li>
                </ul>
                <button className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>

            <div className="job-block-two col-lg-12 col-md-12 col-sm-12">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img src="images/resource/company-logo/1-3.png" alt="" />
                  </span>
                  <h4>
                    <a href="#">Product Manager, Studio</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span> Segment
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      London, UK
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span> 11 hours
                      ago
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span> $35k - $45k
                    </li>
                  </ul>
                </div>
                <ul className="job-other-info">
                  <li className="required">Urgent</li>
                  <li className="time">Full Time</li>
                </ul>
                <button className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>

            <div className="job-block-two col-lg-12 col-md-12 col-sm-12">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img src="images/resource/company-logo/1-6.png" alt="" />
                  </span>
                  <h4>
                    <a href="#">Web Developer</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span> Segment
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      London, UK
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span> 11 hours
                      ago
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span> $35k - $45k
                    </li>
                  </ul>
                </div>
                <ul className="job-other-info">
                  <li className="time">Full Time</li>
                </ul>
                <button className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>

            <div className="job-block-two col-lg-12 col-md-12 col-sm-12">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img src="images/resource/company-logo/1-4.png" alt="" />
                  </span>
                  <h4>
                    <a href="#">Senior Product Designer</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-briefcase"></span> Segment
                    </li>
                    <li>
                      <span className="icon flaticon-map-locator"></span>{" "}
                      London, UK
                    </li>
                    <li>
                      <span className="icon flaticon-clock-3"></span> 11 hours
                      ago
                    </li>
                    <li>
                      <span className="icon flaticon-money"></span> $35k - $45k
                    </li>
                  </ul>
                </div>
                <ul className="job-other-info">
                  <li className="time">Full Time</li>
                </ul>
                <button className="bookmark-btn">
                  <span className="flaticon-bookmark"></span>
                </button>
              </div>
            </div>
          </div>

          <div className="btn-box">
            <a href="#" className="theme-btn btn-style-one bg-blue">
              <span className="btn-title">Load More Listing</span>
            </a>
          </div>
        </div>
      </section> */}

      {/* <div class="cloud cloud1">
            <div class="light1"></div>
            <img src="https://images.vexels.com/media/users/3/145795/isolated/preview/05cd33059a006bf49006097af4ccba98-plane-in-flight-by-vexels.png" />
          </div> */}
      <section className="features-section">
        <div className="auto-container">
          <div className="sec-title">
            <h2>Featured Cities</h2>
            <div className="text">
              Discover exciting career opportunities in our featured cities,
              where innovative companies are seeking talented individuals like
              you to join their teams
            </div>
          </div>

          <div className="row wow fadeInUp">
            <div className="column col-lg-4 col-md-6 col-sm-14">
              <div className="feature-block">
                <div className="inner-box">
                  <figure className="image">
                    <img className="toronto" src={torondo} alt="" />
                  </figure>
                  <div className="overlay-box">
                    <div className="content">
                      <h5>Toronto</h5>
                      <span className="total-jobs">12 Jobs</span>
                      <a href="job-list-v1.html" className="overlay-link"></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="column col-lg-4 col-md-4 col-sm-10">
              <div className="feature-block">
                <div className="inner-box">
                  <figure className="image">
                    <img className="regina" src={regina} alt="" />
                  </figure>
                  <div className="overlay-box">
                    <div className="content">
                      <h5>Regina</h5>
                      <span className="total-jobs">15 Jobs</span>
                      <a href="job-list-v1.html" className="overlay-link"></a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feature-block">
                <div className="inner-box">
                  <figure className="image">
                    <img className="regina" src={montreal} alt="" />
                  </figure>
                  <div className="overlay-box">
                    <div className="content">
                      <h5>Montreal</h5>
                      <span className="total-jobs">19 Jobs</span>
                      <a href="job-list-v1.html" className="overlay-link"></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-block col-lg-4 col-md-5 col-sm-12">
              <div className="feature-block">
                <div className="inner-box">
                  <figure className="image">
                    <img className="regina" src={vancourer} alt="" />
                  </figure>
                  <div className="overlay-box">
                    <div className="content">
                      <h5>Vancouver</h5>
                      <span className="total-jobs">12 Jobs</span>
                      <a href="job-list-v1.html" className="overlay-link"></a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="feature-block">
                <div className="inner-box">
                  <figure className="image">
                    <img className="regina" src={calcary} alt="" />
                  </figure>
                  <div className="overlay-box">
                    <div className="content">
                      <h5>Calgary</h5>
                      <span className="total-jobs">13 Jobs</span>
                      <a href="job-list-v1.html" className="overlay-link"></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="call-to-action-two bg-call-action"
        style={{ backgroundImage: "images/background/1.jpg" }}
      >
        {/* <video autoPlay muted loop>
          <source src={video} type="video/mp4" />
        </video> */}
        <div className="auto-container wow fadeInUp">
          <div className="sec-title light text-center">
            <div className="head-dream1">Your Dream Jobs Are Waiting</div>
            <div className="text1">
              Over 1 million interactions, 50,000 success stories Make yours
              now.
            </div>
          </div>

          <div className="btn-box">
            {/* <a href="#" className="theme-btn btn-style-three">
              Search Job
            </a> */}
            <button
              onClick={() => navigate("/find-jobs")}
              className="theme-btn btn-style-two"
            >
              Apply Job Now
            </button>
          </div>
        </div>
      </section>

      {/* <section className="candidates-section">
        <div className="auto-container">
          <div className="sec-title">
            <h2>Featured Candidates</h2>
            <div className="text">
              Lorem ipsum dolor sit amet elit, sed do eiusmod tempor
            </div>
          </div>

          <div className="carousel-outer wow fadeInUp">
            <OwlCarousel
              className="candidates-carousel owl-carousel owl-theme default-dots"
              {...options}
            >
              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-1.png" alt="" />
                  </figure>
                  <h4 className="name">Darlene Robertson</h4>
                  <span className="designation">UI Designer</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-2.png" alt="" />
                  </figure>
                  <h4 className="name">Wade Warren</h4>
                  <span className="designation">Developer</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-3.png" alt="" />
                  </figure>
                  <h4 className="name">Leslie Alexander</h4>
                  <span className="designation">Marketing Expert</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-4.png" alt="" />
                  </figure>
                  <h4 className="name">Floyd Miles</h4>
                  <span className="designation">Charted Accountant</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-1.png" alt="" />
                  </figure>
                  <h4 className="name">Darlene Robertson</h4>
                  <span className="designation">UI Designer</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-2.png" alt="" />
                  </figure>
                  <h4 className="name">Wade Warren</h4>
                  <span className="designation">Developer</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-3.png" alt="" />
                  </figure>
                  <h4 className="name">Leslie Alexander</h4>
                  <span className="designation">Marketing Expert</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-4.png" alt="" />
                  </figure>
                  <h4 className="name">Floyd Miles</h4>
                  <span className="designation">Charted Accountant</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-1.png" alt="" />
                  </figure>
                  <h4 className="name">Darlene Robertson</h4>
                  <span className="designation">UI Designer</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-2.png" alt="" />
                  </figure>
                  <h4 className="name">Wade Warren</h4>
                  <span className="designation">Developer</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-3.png" alt="" />
                  </figure>
                  <h4 className="name">Leslie Alexander</h4>
                  <span className="designation">Marketing Expert</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>

              <div className="candidate-block">
                <div className="inner-box">
                  <figure className="image">
                    <img src="images/resource/candidate-4.png" alt="" />
                  </figure>
                  <h4 className="name">Floyd Miles</h4>
                  <span className="designation">Charted Accountant</span>
                  <div className="location">
                    <i className="flaticon-map-locator"></i> London, UK
                  </div>
                  <a href="#" className="theme-btn btn-style-one">
                    <span className="btn-title">View Profile</span>
                  </a>
                </div>
              </div>
            </OwlCarousel>
          </div>
        </div>
      </section> */}

      <section className="news-section-two">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Recent News Articles</h2>
            <div className="text">
              Fresh job related news content posted each day.
            </div>
          </div>

          <div className="row wow fadeInUp">
            <div className="news-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <div className="image-box">
                  <figure className="image">
                    <img src="images/resource/news-1.jpg" alt="" />
                  </figure>
                </div>
                <div className="lower-content">
                  <ul className="post-meta">
                    <li>
                      <a href="#">August 31, 2021</a>
                    </li>
                    <li>
                      <a href="#">12 Comment</a>
                    </li>
                  </ul>
                  <h3>
                    <a href="/blog-details">Attract Sales And Profits</a>
                  </h3>
                </div>
              </div>
            </div>

            <div className="news-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <div className="image-box">
                  <figure className="image">
                    <img src="images/resource/news-2.jpg" alt="" />
                  </figure>
                </div>
                <div className="lower-content">
                  <ul className="post-meta">
                    <li>
                      <a href="#">August 31, 2021</a>
                    </li>
                    <li>
                      <a href="#">12 Comment</a>
                    </li>
                  </ul>
                  <h3>
                    <a href="/blog-details">5 Tips For Your Job Interviews</a>
                  </h3>
                </div>
              </div>
            </div>

            <div className="news-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <div className="image-box">
                  <figure className="image">
                    <img src="images/resource/news-3.jpg" alt="" />
                  </figure>
                </div>
                <div className="lower-content">
                  <ul className="post-meta">
                    <li>
                      <a href="#">August 31, 2021</a>
                    </li>
                    <li>
                      <a href="#">12 Comment</a>
                    </li>
                  </ul>
                  <h3>
                    <a href="/blog-details">An Overworked Newspaper Editor</a>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="glow-container">
        <div class="fire-glow fire-glow-1">
          <div class="container">
            <span class="inner-glow inner-glow-1"></span>
            <span class="inner-glow inner-glow-2"></span>
            <span class="inner-glow inner-glow-3"></span>
          </div>
        </div>
        <div class="fire-glow fire-glow-2">
          <div class="container">
            <span class="inner-glow inner-glow-1"></span>
            <span class="inner-glow inner-glow-2"></span>
            <span class="inner-glow inner-glow-3"></span>
          </div>
        </div>
        <div class="fire-glow fire-glow-3">
          <div class="container">
            <span class="inner-glow inner-glow-1"></span>
            <span class="inner-glow inner-glow-2"></span>
            <span class="inner-glow inner-glow-3"></span>
          </div>
        </div>
        <div class="fire-glow fire-glow-4">
          <div class="container">
            <span class="inner-glow inner-glow-1"></span>
            <span class="inner-glow inner-glow-2"></span>
            <span class="inner-glow inner-glow-3"></span>
          </div>
        </div>
        <div class="fire-glow fire-glow-5">
          <div class="container">
            <span class="inner-glow inner-glow-1"></span>
            <span class="inner-glow inner-glow-2"></span>
            <span class="inner-glow inner-glow-3"></span>
          </div>
        </div>
        <div class="fire-glow fire-glow-6">
          <div class="container">
            <span class="inner-glow inner-glow-1"></span>
            <span class="inner-glow inner-glow-2"></span>
            <span class="inner-glow inner-glow-3"></span>
          </div>
        </div>
      </div>

      <section className="call-to-action-three">
        <div className="auto-container">
          <div className="outer-box">
            <div className="sec-title">
              <div className="head-dream2">Let employers find you</div>
              <div className="text1">
                Advertise your jobs to millions of monthly users and search 15.8
                million CVs in our database.
              </div>
            </div>

            <div className="btn-box">
              <button
                onClick={() => navigate("/find-jobs")}
                className="theme-btn btn-style-one bg-blue"
              >
                <span className="btn-title">Search Job</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
