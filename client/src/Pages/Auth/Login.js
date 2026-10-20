import React, { useState, useEffect } from "react";
import $ from "jquery";
import { Button, Modal, Spin, ConfigProvider } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import Register from "./Register";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";
import toast, { Toaster } from "react-hot-toast";
import { Server } from "../../App";
import Googlelogin from "./Googlelogin";
import ForgotPassword from "./ForgotPassword";
import MicrosoftLogin from "./MicrosoftLogin";
import ReCAPTCHA from "react-google-recaptcha";
const Login = (isModalOpen) => {
  const [loading, setloading] = useState(false);
  const [userType, setUserType] = useState("Candidate");
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [close, setClose] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [showCandidate, setShowCandidate] = useState(true);
  const [showEmployer, setShowEmployer] = useState(true);
  const [forgotLoader, setForgotLoader] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const handleCaptcha = (value) => {
    setCaptchaValue(value);
  };

  const location = useLocation();
  useEffect(() => {
    // console.log(isModalOpen.isVendor === true);
    if (
      (location.pathname === "/" && !isModalOpen.isVendor) ||
      location.pathname === "/practiceInterviewLanding"
    ) {
      setShowCandidate(true);
      setShowEmployer(false);
      setUserType("Candidate");
    } else if (
      location.pathname === "/employers" ||
      (location.pathname === "/pricing" && !isModalOpen.isVendor)
    ) {
      setShowCandidate(false);
      setShowEmployer(true);
      setUserType("Employer");
    } else if (isModalOpen.isVendor === true) {
      setShowCandidate(false);
      setShowEmployer(false);
      setUserType("Vendor");
    } else {
      setShowCandidate(true);
      setShowEmployer(true);
    }
  }, [location.pathname]);

  // const [confirmModal, setConfirmModal] = useState(false);
  // const [signUpModalOpen, setsignUpModalOpen] = useState(false);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const showModal = () => {
  //   setIsModalOpen(true);

  // };

  // console.log(location.pathname);
  const showModal = (type) => {
    setModalType(type);
    isModalOpen.setIsModalOpen(true);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleCancel = () => {
    isModalOpen.setIsModalOpen(false);
  };
  const handleTypeToggle = (type) => {
    setUserType(type);
  };
  // console.log(isModalOpen.setModalType);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let data = {
        email,
        password,
        role: userType,
        region: "United States",
        captcha: captchaValue,
      };
      if (email.length === 0) {
        toast.error("Email Required");
        setloading(false);
        return;
      } else if (password.length === 0) {
        toast.error("Password Required");
        setloading(false);
        return;
      } else if (!captchaValue) {
        toast.error("Please verify the CAPTCHA");
        setloading(false);
        return;
      } else {
        setloading(true);
        const response = await axios.post(`${Server}/api/v1/auth/login`, data);
        // console.log(response);
        if (response.data.message === "Login Successfully") {
          toast.success(response.data.message);
          if (response.data.role === "Candidate") {
            setTimeout(() => {
              if (
                location.pathname === "/" ||
                location.pathname === "/contact"
              ) {
                if (
                  !response.data.profileCompleted ||
                  !response.data.isResumeUploaded
                ) {
                  navigate(`/update-profile/${response.data.accessToken}`);
                } else {
                  navigate("/candidate-dashboard");
                }
              } else {
                navigate(location.pathname);
                window.location.reload();
              }
              let storeToken = localStorage.setItem(
                "token",
                response.data.accessToken
              );
              let storeRole = localStorage.setItem("Role", response.data.role);
              let userId = localStorage.setItem("UserId", response.data.userId);
              let profileCompleted = localStorage.setItem(
                "ProfileCompleted",
                response.data.profileCompleted
              );
              isModalOpen.setIsModalOpen(false);
            }, 200);
          } else if (response.data.role === "Employer") {
            setTimeout(() => {
              if (
                location.pathname === "/" ||
                location.pathname === "/contact"
              ) {
                if (!response.data.profileCompleted) {
                  navigate(`/update-profile/${response.data.accessToken}`);
                } else if (!response.data.subscribed) {
                  navigate("/pricing");
                } else {
                  navigate("/employer-dashboard");
                }
              } else {
                navigate(location.pathname);
                window.location.reload();
              }
              isModalOpen.setIsModalOpen(false);
              let storeToken = localStorage.setItem(
                "token",
                response.data.accessToken
              );
              let storeRole = localStorage.setItem("Role", response.data.role);
              let userId = localStorage.setItem("UserId", response.data.userId);
              let profileCompleted = localStorage.setItem(
                "ProfileCompleted",
                response.data.profileCompleted
              );
              let Subscribed = localStorage.setItem(
                "Subscribed",
                response.data.subscribed
              );
              let linkedInloggedIn = localStorage.setItem(
                "linkedinAccessToken",
                response.data.linkedInloggedIn
              );
            }, 200);
          } else if (response.data.role === "Vendor") {
            setTimeout(() => {
              if (
                location.pathname === "/" ||
                location.pathname === "/contact"
              ) {
                if (!response.data.profileCompleted) {
                  navigate(`/update-profile/${response.data.accessToken}`);
                } else {
                  navigate("/vendor/dashboard");
                }
              } else {
                navigate(location.pathname);
                window.location.reload();
              }
              let storeToken = localStorage.setItem(
                "token",
                response.data.accessToken
              );
              let storeRole = localStorage.setItem("Role", response.data.role);
              let userId = localStorage.setItem("UserId", response.data.userId);
              let profileCompleted = localStorage.setItem(
                "ProfileCompleted",
                response.data.profileCompleted
              );
              isModalOpen.setIsModalOpen(false);
            }, 200);
          }
        } else if (response.data.message === "Email Verification Pending") {
          toast.error(response.data.message);
          setTimeout(() => {
            isModalOpen.setIsModalOpen(false);
            isModalOpen.setConfirmModal(true);
          }, 300);

          let userId = localStorage.setItem("UserId", response.data.userId);
          let storeRole = localStorage.setItem("Role", response.data.role);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            response.data.profileCompleted
          );
        }
      }
      setloading(false);

      // isModalOpen.setModalType("login");
    } catch (error) {
      // console.log(error);
      if (error.response) {
        if (
          error.response.data.message ===
          "Profile Incomplete. Please update your profile."
        ) {
          toast.error(error.response.data.message);
          if (error.response.data.role === "Candidate") {
            localStorage.setItem(
              "ResumeUploaded",
              error.response.data.isResumeUploaded
            );
          } else if (error.response.data.role === "Employer") {
            let linkedInloggedIn = localStorage.setItem(
              "linkedinAccessToken",
              error.response.data.linkedInloggedIn
            );
            let Subscribed = localStorage.setItem(
              "Subscribed",
              error.response.data.subscribed
            );
          }
          let storeToken = localStorage.setItem(
            "token",
            error.response.data.accessToken
          );
          let storeRole = localStorage.setItem(
            "Role",
            error.response.data.role
          );
          let userId = localStorage.setItem(
            "UserId",
            error.response.data.userId
          );
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            error.response.data.profileCompleted
          );
          navigate(`/update-profile/${error.response.data.accessToken}`);
          setloading(false);
        } else {
          toast(error.response.data.message, {
            icon: "❌",
          });
          setloading(false);
        }
      } else {
        toast.error("Internal server error");
        setloading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    try {
      setForgotLoader(true);
      // console.log(email);
      let data = {
        email: email,
        role: userType,
        region: "United States",
      };
      if (email.length === 0) {
        toast.error("Enter Registered Email");
      } else {
        // setloading(true);
        const response = await axios.post(
          `${Server}/api/v1/password/forgotPassword`,
          data
        );
        // console.log(response);
        if (response.data.message === "Password Reset LinK Sent to your Mail") {
          toast.success("OTP has sent to your mail");
          let userId = localStorage.setItem("UserId", response.data.userId);
          let storeRole = localStorage.setItem("Role", response.data.role);
          setTimeout(() => {
            setForgotLoader(false);
            isModalOpen.setIsModalOpen(false);
            isModalOpen.setForgotModal(true);
          }, 300);
        }
      }
    } catch (error) {
      // console.log(error);
      setForgotLoader(false);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Internal server error");
      }
    }
  };
  const { setIsModalOpen } = isModalOpen;
  // console.log(setIsModalOpen);
  return (
    <div>
      <Modal
        centered
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {" "}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div id="login-modal">
            <div class="login-form default-form">
              <div class="form-inner">
                <h3>Login </h3>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <div
                      className="btn-box row"
                      style={{ justifyContent: "center" }}
                    >
                      {showCandidate && !showEmployer && (
                        <div className="col-12" style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: " #000",
                              fontSize: "20px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              padding: "10px 20px",
                              borderRadius: "5px",
                            }}
                            className={`plain-btn ${
                              userType === "Candidate" ? "active" : ""
                            }`}
                            onClick={() => handleTypeToggle("Candidate")}
                          >
                            Candidate Login
                          </button>
                        </div>
                      )}
                      {!showCandidate && !showEmployer && (
                        <div className="col-12" style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: " #000",
                              fontSize: "20px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              padding: "10px 20px",
                              borderRadius: "5px",
                            }}
                            className={`plain-btn ${
                              userType === "Vendor" ? "active" : ""
                            }`}
                            onClick={() => handleTypeToggle("Vendor")}
                          >
                            Vendor Login
                          </button>
                        </div>
                      )}
                      {showEmployer && !showCandidate && (
                        <div className="col-12" style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: " #000",
                              fontSize: "20px",
                              fontWeight: "bold",
                              cursor: "pointer",
                              padding: "10px 20px",
                              borderRadius: "5px",
                            }}
                            className={`plain-btn ${
                              userType === "Employer" ? "active" : ""
                            }`}
                            onClick={() => handleTypeToggle("Employer")}
                          >
                            Employer Login
                          </button>
                        </div>
                      )}

                      {showCandidate && showEmployer && (
                        <>
                          <div className="col-lg-6 col-md-12">
                            <button
                              type="button"
                              className={`theme-btn btn-style-four ${
                                userType === "Candidate" ? "active" : ""
                              }`}
                              onClick={() => handleTypeToggle("Candidate")}
                            >
                              <i className="la la-user"></i> Candidate
                            </button>
                          </div>
                          <div className="col-lg-6 col-md-12">
                            <button
                              type="button"
                              className={`theme-btn btn-style-four ${
                                userType === "Employer" ? "active" : ""
                              }`}
                              onClick={() => handleTypeToggle("Employer")}
                            >
                              <i className="la la-briefcase"></i> Employer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      // required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-group">
                      <input
                        id="password-field"
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="field-outer">
                      <div class="input-group checkboxes ">
                        <div
                          style={{
                            transform: "scale(0.90)",
                            transformOrigin: "0 0",
                          }}
                        >
                          {" "}
                          <ReCAPTCHA
                            sitekey="6LcxaGYrAAAAAGEbS0IuB200lZKYBBbh4af426yP" // Replace with your real site key
                            onChange={handleCaptcha}
                          />
                        </div>

                        {/*<input
                          type="checkbox"
                          name="remember-me"
                          value=""
                          id="remember"
                        />*/}
                        {/*<label for="remember" class="remember">
                          <span class="custom-checkbox"></span> Remember me
                        </label>*/}
                      </div>
                      <a class="pwd" onClick={handleForgotPassword}>
                        {forgotLoader ? <Spin /> : "Forgot Password ?"}
                      </a>
                    </div>
                  </div>

                  <div class="form-group">
                    <button
                      class="theme-btn btn-style-one"
                      type="submit"
                      // onClick={handleLogin}
                      name="log-in"
                      loading={loading}
                      disabled={loading}
                      style={{
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                        pointerEvents: loading ? "none" : "auto",
                      }}
                    >
                      {loading ? (
                        <ConfigProvider
                          theme={{
                            token: {
                              colorPrimary: "black",
                            },
                          }}
                        >
                          <Spin />
                        </ConfigProvider>
                      ) : (
                        "Login"
                      )}
                    </button>
                  </div>
                </form>

                <div class="bottom-box">
                  <div class="text">
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        isModalOpen.setModalType("register");
                      }}
                      class="call-modal signup"
                    >
                      Signup
                    </button>
                    {forgotModal && (
                      <ForgotPassword
                        forgotModal={forgotModal}
                        setForgotModal={setForgotModal}
                        isModalOpen={isModalOpen.isModalOpen}
                        setIsModalOpen={isModalOpen.setIsModalOpen}
                        setModalType={setModalType}
                      />
                    )}
                    {confirmModal && (
                      <ConfirmModal
                        confirmModal={confirmModal}
                        setConfirmModal={setConfirmModal}
                      />
                    )}
                  </div>
                  <div class="divider">
                    <span>or</span>
                  </div>
                  <div class="btn-box row">
                    <div
                      class="col-lg-12 col-md-12"
                      style={{ paddingBottom: "12px" }}
                    >
                      {" "}
                      <a class="theme-btn  facebook-btn">
                        <MicrosoftLogin
                          role={userType}
                          region="United States"
                        />
                      </a>
                    </div>
                    <div class="col-lg-12 col-md-12">
                      <a class="theme-btn  facebook-btn">
                        <Googlelogin
                          userType={userType}
                          setIsModalOpen={isModalOpen.setIsModalOpen}
                        />
                      </a>
                    </div>
                  </div>
                  {/*   <div class="btn-box row">
                    <div class="col-lg-6 col-md-12">
                      <a href="#" class="theme-btn social-btn-two facebook-btn">
                        <i class="fab fa-facebook-f"></i> Log In via Facebook
                      </a>
                    </div>
                    <div class="col-lg-6 col-md-12">
                      <a href="#" class="theme-btn social-btn-two google-btn">
                        <i class="fab fa-google"></i> Log In via Gmail
                      </a>
                    </div>
                    </div>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
