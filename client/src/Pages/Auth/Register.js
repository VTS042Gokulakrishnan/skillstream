import React, { useState, useEffect } from "react";
import { Button, Modal, Spin } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Password from "antd/es/input/Password";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import toast, { Toaster } from "react-hot-toast";
import { Server } from "../../App";
import Googlelogin from "./Googlelogin";
import { Helmet } from "react-helmet";
import MicrosoftLogin from "./MicrosoftLogin";
import TermsAndConditionsModal from "../../Components/Modals/TermsAndConditionsModal";
import PrivacyPolicyModal from "Components/Modals/PrivacyPolicyModal";
const Register = (isModalOpen) => {
  const [loading, setloading] = useState(false);
  const [userType, setUserType] = useState("Candidate");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [CpasswordVisible, setCPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [showCandidate, setShowCandidate] = useState(true);
  const [showEmployer, setShowEmployer] = useState(true);
  const location = useLocation();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [agreedToTermsCheckbox, setAgreedToTermsCheckbox] = useState(false);
  const [loginTrigger, setLoginTrigger] = useState(null); // "google" or "microsoft"
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
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleCPasswordVisibility = () => {
    setCPasswordVisible((prev) => !prev);
  };

  // console.log(userType);
  const handleCancel = () => {
    isModalOpen.setIsModalOpen(false);
  };

  const handleTypeToggle = (type) => {
    setUserType(type);
  };
  // console.log(email, password, userType);
  const Register = async (e) => {
    e.preventDefault();
    // console.log(email);

    if (email.length === 0 || password.length === 0 || name.length === 0) {
      return toast.error("All fields are mandatory");
    }
    if (password !== confirmPassword) {
      return toast.error("Password does not match");
    }
    // console.log("modal showing");

    // Show modal instead of registering immediately
    setShowTermsModal(true);
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      let data = {
        email,
        password,
        name,
        role: userType,
        region: "United States",
      };
      if (email.length === 0) {
        toast.error("All Field are mandatory");
        setloading(false);
      } else if (password.length === 0) {
        toast.error("All Field are mandatory");
        setloading(false);
      } else if (password != confirmPassword) {
        toast.error("Password does not match");
        setloading(false);
      } else {
        setloading(true);
        const response = await axios.post(
          `${Server}/api/v1/auth/register`,
          data
        );
        // console.log(response);
        if (response.data.message === "Please Confirm your email") {
          toast.success("Registered Successfully! Confirm your email");
          setTimeout(() => {
            setloading(false);
            isModalOpen.setModalType("login");
          }, 300);
        }
      }
    } catch (error) {
      // console.log(error);
      if (error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Internal Server Error");
      }
      setloading(false);
    }
  };
  const responseGoogle = async (response) => {
    try {
      // Send the Google response to your server for verification and user creation
      const googleResponse = await axios.post(
        `${Server}/api/v1/auth/googleLogin`,
        {
          tokenId: response.tokenId,
          role: userType,
        }
      );

      // Handle the response from your server
      // console.log(googleResponse);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (termsAccepted && privacyAccepted) {
      setAgreedToTermsCheckbox(true);
    }
  }, [termsAccepted, privacyAccepted]);
  // useEffect(() => {
  //   if (termsAccepted && privacyAccepted && loginTrigger) {
  //     if (loginTrigger === "google") {
  //       // Trigger Google login manually
  //       document.querySelector("#custom-google-btn")?.click(); // or use a ref/callback
  //     } else if (loginTrigger === "microsoft") {
  //       document.querySelector("#custom-microsoft-btn")?.click(); // or use a ref
  //     }

  //     // Reset trigger to prevent double fire
  //     setLoginTrigger(null);
  //   }
  // }, [termsAccepted, privacyAccepted, loginTrigger]);
  return (
    <div>
      <Helmet>
        <meta
          name="Sign Up for Free | Join Skillstream Jobs | Top IT Opportunities in US"
          content="Sign up for free on SkillStream Jobs to access top IT opportunities in US. Join now to connect with leading employers and advance your tech career."
        />
      </Helmet>
      <Modal
        centered
        open={isModalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {confirmModal && (
          <ConfirmModal
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
          />
        )}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div id="login-modal">
            <div class="login-form default-form">
              <div class="form-inner">
                <h3>Create a Account</h3>

                <form onSubmit={handleRegister}>
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
                            Candidate Registration
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
                            Employer Registration
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
                            Vendor Registration
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      // required
                    />
                  </div>
                  {userType === "Candidate" ? (
                    <div class="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="Name"
                        placeholder="Enter Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        // required
                      />
                    </div>
                  ) : (
                    <div class="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        name="Name"
                        placeholder="Enter Your Company Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        // required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-group">
                      <input
                        id="password-field"
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
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
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-group">
                      <input
                        id="password-field"
                        type={CpasswordVisible ? "text" : "password"}
                        name="Confirm Password"
                        placeholder=" Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={toggleCPasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={CpasswordVisible ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>
                  <div class="form-group">
                    <div class="field-outer">
                      <div class="input-group checkboxes ">
                        <input
                          type="checkbox"
                          id="remember"
                          checked={privacyAccepted && termsAccepted}
                          readOnly
                          onClick={() => {
                            if (!privacyAccepted && !termsAccepted) {
                              setShowTermsModal(true);
                            }
                          }}
                        />
                        <label for="remember" class="remember">
                          <span class="custom-checkbox"></span> I agree to the
                          Terms & Conditions and Privacy Policy
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <button
                      class="theme-btn btn-style-one "
                      type="submit"
                      name="Register"
                      loading={loading}
                      disabled={
                        !agreedToTermsCheckbox ||
                        !termsAccepted ||
                        !privacyAccepted ||
                        loading
                      }
                      style={{
                        opacity:
                          !agreedToTermsCheckbox ||
                          !termsAccepted ||
                          !privacyAccepted ||
                          loading
                            ? 0.6
                            : 1,
                        cursor:
                          !agreedToTermsCheckbox ||
                          !termsAccepted ||
                          !privacyAccepted ||
                          loading
                            ? "not-allowed"
                            : "pointer",
                        pointerEvents:
                          !agreedToTermsCheckbox ||
                          !termsAccepted ||
                          !privacyAccepted ||
                          loading
                            ? "none"
                            : "auto",
                      }}
                    >
                      {loading ? <Spin /> : "Register"}
                    </button>
                  </div>
                </form>

                <div class="bottom-box">
                  <div class="text">
                    Already have an account?{" "}
                    <button
                      class="call-modal signup"
                      onClick={() => {
                        isModalOpen.setModalType("login");
                      }}
                    >
                      Signin
                    </button>
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
                      <a
                        class="theme-btn  facebook-btn"
                        // onClick={() => {
                        //   setLoginTrigger("microsoft");
                        //   setShowTermsModal(true);
                        // }}
                      >
                        <MicrosoftLogin
                          role={userType}
                          region="United States"
                          // disabled
                        />
                      </a>
                    </div>
                    <div class="col-lg-12 col-md-12">
                      <a
                        // href="#"
                        class="theme-btn  facebook-btn"
                        // onClick={() => {
                        //   setLoginTrigger("google");
                        //   setShowTermsModal(true);
                        // }}
                      >
                        <Googlelogin userType={userType} />
                      </a>
                    </div>
                    <TermsAndConditionsModal
                      showTermsModal={showTermsModal}
                      setShowTermsModal={setShowTermsModal}
                      setTermsAccepted={setTermsAccepted}
                      setShowPrivacyModal={setShowPrivacyModal}
                    />
                    <PrivacyPolicyModal
                      showPrivacyModal={showPrivacyModal}
                      setShowPrivacyModal={setShowPrivacyModal}
                      setPrivacyAccepted={setPrivacyAccepted}
                    />
                    {/* <div class="col-lg-6 col-md-12">
                      <a href="#" class="theme-btn social-btn-two facebook-btn">
                        <i class="fab fa-facebook-f"></i> Log In via Facebook
                      </a>
                    </div>
                    <div class="col-lg-6 col-md-12">
                    
                    </div>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Register;
