import React, { useEffect } from "react";
import OwlCarousel from "react-owl-carousel";
import tw from "twin.macro";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import img1 from "../../assets/executives-working-hard-with-tablet.jpg";
import img2 from "../../assets/executives-paying-attention-digital-tablet.jpg";
import img3 from "../../assets/group-business-partners-looking-camera.jpg";
import img4 from "../../assets/group-business-people-stacking-each-other-s-hand-desk.jpg";
import img5 from "../../assets/professional-employees-collaborating-medium-shot.jpg";
import img6 from "../../assets/front-view-smiley-woman-desk-giving-thumbs-up.jpg";
// import video from "../../assets/giphy.mp4";
import { Helmet } from "react-helmet";
import Testimonial from "../../Components/testimonials/TwoColumnWithImageAndProfilePictureReview.js";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const HighlightedText = tw.span`text-blue-600`;

const About = () => {
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  const options = {
    loop: true,
    margin: 15,
    items: 1,
    nav: true,
    dots: false,
    smartSpeed: 500,
    autoplay: true,
    autoplayTimeout: 10000,
    navText: [
      '<span class="flaticon-back"></span>',
      '<span class="flaticon-next"></span>',
    ],
    // animateOut: "fadeOut",
    // animateIn: "fadeIn",
    // autoplay: true,
    // autoplayTimeout: 2000,
    // dots: false,
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
    },
    // responsive: {
    //   0: {
    //     items: 1,
    //   },
    //   600: {
    //     items: 3,
    //   },
    //   1000: {
    //     items: 5,
    //   },
    // },
  };
  const navigate = useNavigate();
  let token = localStorage.getItem("token");
  let role = localStorage.getItem("Role");
  // console.log(token);

  // useEffect(() => {
  //   if (token === null) {
  //     toast.error("Please login")
  //     // setTimeout(() => {
  //       navigate("/");
  //     // }, 200);
  //   }
  // },[]);
  const options1 = {
    loop: true,
    nav: false,
    smartSpeed: 500,
    autoplay: true,
    autoplayTimeout: 10000,
    navText: [
      '<span class="flaticon-back"></span>',
      '<span class="flaticon-next"></span>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      480: {
        items: 2,
      },
      600: {
        items: 3,
      },
      768: {
        items: 4,
      },
      1024: {
        items: 5,
      },
      1400: {
        items: 6,
      },
      1800: {
        items: 7,
      },
    },
  };

  return (
    <div>
      <Helmet>
        <meta
          name="Your Trusted IT Job Portal in US | Connecting Top Talent & Employers"
          content="SkillStream Jobs is your trusted IT job portal in US, connecting top talent with leading employers. Discover how we streamline job searches and hiring"
        />
      </Helmet>
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>About Us</h1>
            <ul className="page-breadcrumb">
              <li>
                <a href="#">Home</a>
              </li>
              <li>About Us</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section-three">
        <div className="auto-container">
          <div className="text-box">
            <h4>About Skill Stream</h4>
            <p>
              Welcome to Skill Stream, your go-to source for top talent and
              great job opportunities. Our aim is simple: connect people with
              their ideal jobs and companies with outstanding employees.
              Cutting-edge technology on our user-friendly platform simplifies
              your job hunt or talent search.Committed to excellence and
              innovation, Skill Stream is changing the job search game for
              professionals and businesses. Find your next challenge or your
              dream team with us – we're here to make it happen.
            </p>
            <p>
              Our team passionately curates a smart platform for job matches,
              offering tailored job picks and live updates for a smooth
              experience. At Skill Stream, trust and transparency are key; our
              detailed profiles and open communication channels ensure informed
              choices for all. We champion a workforce rich in diversity and
              inclusion, ensuring every voice is heard and every person has a
              fair chance to thrive. With Skill Stream, unlock opportunities and
              achieve your ambitions.
            </p>
          </div>

          {/* <div className="fun-fact-section">
            <div className="row">
              <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp">
                <div className="count-box">
                  <span className="count-text" data-speed="3000" data-stop="4">
                    0
                  </span>
                  M
                </div>
                <h4 className="counter-title">4 million daily active users</h4>
              </div>

              <div
                className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp"
                data-wow-delay="400ms"
              >
                <div className="count-box">
                  <span className="count-text" data-speed="3000" data-stop="12">
                    0
                  </span>
                  k
                </div>
                <h4 className="counter-title">Over 12k open job positions</h4>
              </div>

              <div
                className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp"
                data-wow-delay="800ms"
              >
                <div className="count-box">
                  <span className="count-text" data-speed="3000" data-stop="20">
                    0
                  </span>
                  M
                </div>
                <h4 className="counter-title">
                  Over 20 million stories shared
                </h4>
              </div>
            </div>
          </div> */}

          <div className="images-box">
            <div className="row">
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img className="about-section1" src={img1} alt="" />
                </figure>
              </div>
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img src={img2} alt="" />
                </figure>
                <figure className="image">
                  <img src={img3} alt="" />
                </figure>
              </div>
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img src={img4} alt="" />
                </figure>
                <figure className="image">
                  <img src={img6} alt="" />
                </figure>
              </div>
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img className="about-section1" src={img5} alt="" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section
        className="call-to-action-two bg-call-action"
        
      >
      
        <div className="auto-container wow fadeInUp">
          <div className="sec-title light text-center">
            <div className="head-dream">Your Dream Jobs Are Waiting</div>
            <div className="text1">
              Over 1 million interactions, 50,000 success stories Make yours
              now.
            </div>
          </div>

          <div className="btn-box">
           
            <button
              onClick={() => navigate("/find-jobs")}
              className="theme-btn btn-style-two"
            >
              Apply Job Now
            </button>
          </div>
        </div>
      </section> */}

      {/* <section className="testimonial-section-two">
    <div className="container-fluid">
        <div className="testimonial-left">
            <img src="images/resource/testimonial-left.png" alt="" />
        </div>
        <div className="testimonial-right">
            <img src="images/resource/testimonial-right.png" alt="" />
        </div>

        <div className="sec-title text-center">
            <h2>Testimonials From Our Customers</h2>
            <div className="text">
                Hear what our satisfied clients have to say about Skill Stream
            </div>
        </div>

        <div className="carousel-outer">
            <OwlCarousel
                className="owl-theme owl-carousel testimonial-carousel default-dots"
                {...options}
            >
                <div className="testimonial-block-two">
                    <div className="inner-box">
                        <div className="thumb">
                            <img src="images/resource/candidate-8.png" alt="John Doe" />
                        </div>
                        <h4 className="title">Exceptional Service!</h4>
                        <div className="text">
                            Skill Stream helped me land my dream job effortlessly. Their support and resources were invaluable.
                        </div>
                        <div className="info-box">
                            <h4 className="name">John Doe</h4>
                            <span className="designation">Software Engineer</span>
                        </div>
                    </div>
                </div>

                <div className="testimonial-block-two">
                    <div className="inner-box">
                        <div className="thumb">
                            <img src="images/resource/candidate-5.png" alt="Jane Smith" />
                        </div>
                        <h4 className="title">Highly Recommend!</h4>
                        <div className="text">
                            The team at Skill Stream is fantastic! They provided excellent guidance and support throughout my job search.
                        </div>
                        <div className="info-box">
                            <h4 className="name">Jane Smith</h4>
                            <span className="designation">Project Manager</span>
                        </div>
                    </div>
                </div>

                <div className="testimonial-block-two">
                    <div className="inner-box">
                        <div className="thumb">
                            <img src="images/resource/candidate-4.png" alt="Michael Johnson" />
                        </div>
                        <h4 className="title">Top-Notch Quality!</h4>
                        <div className="text">
                            Thanks to Skill Stream, I found a position that perfectly matches my skills and career goals. Couldn't be happier!
                        </div>
                        <div className="info-box">
                            <h4 className="name">Michael Johnson</h4>
                            <span className="designation">Graphic Designer</span>
                        </div>
                    </div>
                </div>

                <div className="testimonial-block-two">
                    <div className="inner-box">
                        <div className="thumb">
                            <img src="images/resource/candidate-4.png" alt="Emily Davis" />
                        </div>
                        <h4 className="title">Fantastic Experience!</h4>
                        <div className="text">
                            I highly recommend Skill Stream for anyone looking for a new job. Their service is outstanding and very effective.
                        </div>
                        <div className="info-box">
                            <h4 className="name">Emily Davis</h4>
                            <span className="designation">Marketing Specialist</span>
                        </div>
                    </div>
                </div>

                <div className="testimonial-block-two">
                    <div className="inner-box">
                        <div className="thumb">
                            <img src="images/resource/candidate-1.png" alt="Chris Lee" />
                        </div>
                        <h4 className="title">Very Professional!</h4>
                        <div className="text">
                            The support I received from Skill Stream was beyond my expectations. They truly care about their clients.
                        </div>
                        <div className="info-box">
                            <h4 className="name">Chris Lee</h4>
                            <span className="designation">Data Analyst</span>
                        </div>
                    </div>
                </div>

                <div className="testimonial-block-two">
                    <div className="inner-box">
                        <div className="thumb">
                            <img src="images/resource/candidate-2.png" alt="Sarah Wilson" />
                        </div>
                        <h4 className="title">Outstanding Support!</h4>
                        <div className="text">
                            Skill Stream made my job search seamless and stress-free. Their resources are top-notch.
                        </div>
                        <div className="info-box">
                            <h4 className="name">Sarah Wilson</h4>
                            <span className="designation">HR Manager</span>
                        </div>
                    </div>
                </div>
            </OwlCarousel>
        </div>
    </div>
</section> */}
      <Testimonial
        heading={
          <>
            Our Clients <HighlightedText>Love Us</HighlightedText>
          </>
        }
      />
      {/* <section className="work-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>How It Works?</h2>
            <div className="text">Job for anyone, anywhere</div>
          </div>
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
          <div className="row">
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
      </section> */}

      {/* <section className="clients-section">
        <div className="sponsors-outer">
        <OwlCarousel className="owl-carousel owl-theme" {...options1}>
          <ul className="sponsors-carousel ">
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-1.png" alt="" />
                </a>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-2.png" alt="" />
                </a>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-3.png" alt="" />
                </a>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-4.png" alt="" />
                </a>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-5.png" alt="" />
                </a>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-6.png" alt="" />
                </a>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <a href="#">
                  <img src="images/clients/1-7.png" alt="" />
                </a>
              </figure>
            </li>
          </ul>
          </OwlCarousel>
        </div>
  </section>*/}

      <section className="clients-section">
        <div className="sponsors-outer">
          <OwlCarousel className="owl-carousel owl-theme " {...options1}>
            <figure className="image-box slide-item">
              <a href="#">
                <img src="images/clients/1-1.png" alt="" />
              </a>
            </figure>
            <figure className="image-box slide-item">
              <a href="#">
                <img src="images/clients/1-2.png" alt="" />
              </a>
            </figure>
            <figure className="image-box slide-item">
              <a href="#">
                <img src="images/clients/1-3.png" alt="" />
              </a>
            </figure>
            <figure className="image-box slide-item">
              <a href="#">
                <img src="images/clients/1-5.png" alt="" />
              </a>
            </figure>
            <figure className="image-box slide-item">
              <a href="#">
                <img src="images/clients/1-6.png" alt="" />
              </a>
            </figure>
            <figure className="image-box slide-item">
              <a href="#">
                <img src="images/clients/1-7.png" alt="" />
              </a>
            </figure>
          </OwlCarousel>
        </div>
      </section>
    </div>
  );
};

export default About;
{
  /* <ul className="sponsors-carousel ">
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-1.png" alt="" />
          </a>
        </figure>
      </li>
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-2.png" alt="" />
          </a>
        </figure>
      </li>
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-3.png" alt="" />
          </a>
        </figure>
      </li>
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-4.png" alt="" />
          </a>
        </figure>
      </li>
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-5.png" alt="" />
          </a>
        </figure>
      </li>
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-6.png" alt="" />
          </a>
        </figure>
      </li>
      <li className="slide-item">
        <figure className="image-box">
          <a href="#">
            <img src="images/clients/1-7.png" alt="" />
          </a>
        </figure>
      </li>
    </ul> */
}
