import React, { useState } from "react";
import "./PracticeInterviewLanding.css";
import heroImage from "../../../assets/businessman-showing-virtual-graphic-human-icon-hr-human-resources-recruitment-team-staff-management-business-concept.jpg"; // Replace with actual image path
import featureImage1 from "../../../assets/businesswoman-discussing-with-colleagues-digital-tablet.jpg"; // Replace with actual image path
import featureImage2 from "../../../assets/cheerful-business-people-coworking-laptop.jpg"; // Replace with actual image path
import featureImage3 from "../../../assets/executives-paying-attention-digital-tablet.jpg"; // Replace with actual image path
import roboImg from "../../../assets/Animation - 1725479389232.gif";
import userImg from "../../../assets/Animation - 1725482128206.gif";
import { useNavigate } from "react-router-dom";
import Login from "../../../Pages/Auth/Login";
import Register from "../../../Pages/Auth/Register";
import ConfirmModal from "../../../Pages/Auth/ConfirmModal";
import ForgotPassword from "../../../Pages/Auth/ForgotPassword";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Server } from "App";
const PracticeInterviewLanding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const navigate = useNavigate();
  const navigateToPracticePage = async (type) => {
    let token = localStorage.getItem("token");
    if (token) {
      navigate("/practiceInterview");
    } else {
      showModal(type);
    }
  };
  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    // if (type === "login") {
    //   // Your login logic goes here
    //   // Assuming login is successful, redirect to candidates-list
    //   navigate("/candidates-list");
    // }
  };
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <img src={heroImage} alt="Hero" className="hero-image" />
        <h1 className="hero-title slide-in-bottom">
          Master Your Video Interview Skills
        </h1>
        <p className="hero-description fade-in">
          Elevate your chances of success with our interactive video assessment
          practice.
        </p>
        <button
          className="hero-button"
          //   onClick={() => navigate("/practicalAssessment")}
        >
          Develop your skills with AI Video Practice Assessment
        </button>
      </section>
      <img src={roboImg} alt="img-robo" style={{ marginBottom: "10px" }} />
      <button className="hero-button" onClick={() => navigateToPracticePage()}>
        Start Practicing
      </button>
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-container">
          <div className="feature-item">
            <img
              src={featureImage1}
              alt="Feature 1"
              className="feature-image zoom-in"
            />
            <h3 className="feature-title">Real Interview Questions</h3>
            <p className="feature-description">
              Get accustomed to real-time interview questions and scenarios.
            </p>
          </div>
          <div className="feature-item">
            <img
              src={featureImage2}
              alt="Feature 2"
              className="feature-image zoom-in"
            />
            <h3 className="feature-title">AI Feedback</h3>
            <p className="feature-description">
              Receive AI-powered feedback to improve your performance.
            </p>
          </div>
          <div className="feature-item">
            <img
              src={featureImage3}
              alt="Feature 3"
              className="feature-image zoom-in"
            />
            <h3 className="feature-title">Unlimited Practice</h3>
            <p className="feature-description">
              Choose a paid practice pack or a one-month unlimited pass to build your confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">What Users Say</h2>
        <div className="testimonials-container" style={{marginTop:"40px"}}>
          <div className="testimonial-item flip-in">
            <p className="testimonial-text">
              "This platform really helped me improve my interview skills.
              Highly recommend it!"
            </p>
            <h4 className="testimonial-author">- John Doe</h4>
          </div>
          <div className="testimonial-item flip-in">
            <p className="testimonial-text">
              "The feedback I received was spot on. I landed my dream job!"
            </p>
            <h4 className="testimonial-author">- Jane Smith</h4>
          </div>
        </div>
      </section>
      <img src={userImg} alt="img-robo" />
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
      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step-item rotate-in">
            <h3 className="step-number">1</h3>
            <p className="step-description">Choose a practice set</p>
          </div>
          <div className="step-item rotate-in">
            <h3 className="step-number">2</h3>
            <p className="step-description">Record your answers</p>
          </div>
          <div className="step-item rotate-in">
            <h3 className="step-number">3</h3>
            <p className="step-description">Get instant feedback</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PracticeInterviewLanding;
