import React, { useEffect, useState } from "react";
// import { useHistory } from 'react-router-dom';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Server } from "../../App";
import { Helmet } from "react-helmet";

const Contact = () => {
  // const history = useHistory();
  const navigate = useNavigate();
  useEffect(() => {
    // Scroll to the top when navigation occurs

    window.scrollTo(0, 0);
  }, []);
  // const [modalType, setModalType] = useState("login");
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [activePage, setActivePage] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [close, setClose] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [data, setData] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  let role = localStorage.getItem("Role");
  const [loader, setLoader] = useState(false);
  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    // if (type === "login") {
    //   // Your login logic goes here
    //   // Assuming login is successful, redirect to candidates-list
    //   navigate("/candidates-list");
    // }
  };
  // console.log(modalType);
  const handleSubmit = async (event) => {
    event.preventDefault();
    // console.log("hi");
    try {
      if (name.length === 0) {
        toast.error("All fields required");
      } else if (subject.length === 0) {
        toast.error("All fields required");
      } else if (email.length === 0) {
        toast.error("email required");
      } else if (message.length === 0) {
        toast.error("All fields required");
      } else {
        setLoader(true);
        let basicDetails = {
          name,
          email,
          subject,
          message,
          region: "United States",
        };
        const { data } = await axios.post(
          `${Server}/api/v1/contact/email/send/details`,
          basicDetails
        );
        // console.log(data);
        setLoader(false);

        toast.success(data.message);
      }
    } catch (error) {
      // console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }

      setLoader(false);
    }
  };
  return (
    <div>
      <Helmet>
        <meta
          name="Contact Us | Get in Touch with Skillstream Jobs | IT Job Portal Support"
          content="Contact SkillStream Jobs for IT job portal support. Get in touch with us for inquiries, assistance, or feedback to enhance your job  hiring experience."
        />
      </Helmet>
      <section class="map-section">
        <div class="map-outer">
          <div
            class="map-canvas"
            data-zoom="12"
            data-lat="-37.817085"
            data-lng="144.955631"
            data-type="roadmap"
            data-hue="#ffc400"
            data-title="Envato"
            data-icon-path="images/icons/contact-map-marker.png"
            data-content="Toronto Eaton center 220 Yonge st,Toronto<br><a href='info@skillstreamjobs.us'>info@skillstreamjobs.us</a>"
          >
            {" "}
            {/* <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.6984408353237!2d-79.38327432471108!3d43.65444205235178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34cb510746bd%3A0x8b89147b8cbbc837!2sCF%20Toronto%20Eaton%20Centre!5e0!3m2!1sen!2sin!4v1708970064248!5m2!1sen!2sin"
              width="100%"
              height="750"
              style={{ border: 0 }}
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe> */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2962.0881047892394!2d-88.03698532480782!3d42.062730853835674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fa561b794ef11%3A0xd17e12afdc8d402b!2s1827%20Walden%20Office%20Square%20%23260%2C%20Schaumburg%2C%20IL%2060173%2C%20USA!5e0!3m2!1sen!2sin!4v1748357619744!5m2!1sen!2sin"
             width="100%"
              height="750"
              style={{border:"0"}}
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
      <Toaster position="top-center" reverseOrder={false} />
      <section class="contact-section">
        <div class="auto-container">
          <div class="upper-box">
            <div class="row">
              <div class="contact-block col-lg-4 col-md-6 col-sm-12">
                <div class="inner-box">
                  <span class="icon">
                    <img src="images/icons/placeholder.svg" alt="" />
                  </span>
                  <h4 style={{ color: "#ffff" }}>Address</h4>
                </div>
                <div>
                  <p style={{ color: "#00aff0" }}>
                    1827 Walden office Sq Suite # 260 Schaumburg, IL 60173
                  </p>
                </div>
              </div>
              <div class="contact-block col-lg-4 col-md-6 col-sm-12">
                <div class="inner-box ">
                  <span class="icon">
                    <img src="images/icons/smartphone.svg" alt="" />
                  </span>
                  <h4 style={{ color: "#ffff" }}>Call Us</h4>
                </div>
                <div>
                  <p>
                    <a
                      style={{ color: "#00aff0" }}
                      href="tel:+1 (847) 598-1122"
                      class="phone"
                    >
                      +1 (847) 598-1122
                    </a>
                  </p>
                </div>
              </div>
              <div class="contact-block col-lg-4 col-md-6 col-sm-12">
                <div class="inner-box">
                  <span class="icon">
                    <img src="images/icons/letter.svg" alt="" />
                  </span>
                  <h4 style={{ color: "#ffff" }}>Email</h4>
                </div>
                <div>
                  <p>
                    <a
                      style={{ color: "#00aff0" }}
                      href="mailto:info@skillstreamjobs.us"
                      class="email"
                    >
                      info@skillstreamjobs.us
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="contact-form default-form">
            <h3>Leave A Message</h3>

            <form id="email-form">
              <div class="row">
                <div class="form-group col-lg-12 col-md-12 col-sm-12">
                  <div class="response"></div>
                </div>

                <div class="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="username"
                    class="username"
                    placeholder="Your Name*"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                </div>

                <div class="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Email</label>
                  <input
                    type="email"
                    name="email"
                    class="email"
                    placeholder="Your Email*"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>

                <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    class="subject"
                    placeholder="Subject *"
                    onChange={(e) => setSubject(e.target.value)}
                    value={subject}
                  />
                </div>

                <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Your Message</label>
                  <textarea
                    name="message"
                    placeholder="Write your message..."
                    required
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                  ></textarea>
                </div>

                <div class="col-lg-12 col-md-12 col-sm-12 form-group">
                  <button
                    class="theme-btn btn-style-one"
                    type="button"
                    id="submit"
                    name="submit-form"
                    onClick={handleSubmit}
                    disabled={loader}
                  >
                    {loader ? "Sending...." : "Send Message"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {role === "Candidate" ? null : (
        <section class="call-to-action style-two">
          <div class="auto-container">
            <div class="outer-box">
              <div class="content-column">
                <div class="sec-title">
                  <h2>Recruiting?</h2>
                  <div class="text">
                    Advertise your jobs to millions of monthly users and search
                    15.8 million
                    <br /> CVs in our database.
                  </div>
                  <button
                    className="theme-btn btn-style-one bg-blue"
                    onClick={() => showModal("login")}
                  >
                    <span className="btn-title">Start Recruiting Now</span>
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

              <div
                class="image-column contact-image "
                //   style="background-image: url(images/resource/image-1.png);"
              >
                <figure class="image">
                  <img src="images/resource/image-1.png" alt="" />
                </figure>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Contact;
