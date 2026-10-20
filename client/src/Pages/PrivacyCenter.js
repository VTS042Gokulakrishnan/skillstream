import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const PrivacyCenter = () => {
  const navigate = useNavigate();

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  return (
    <div>
      <Helmet>
        <meta
          name="Privacy Center | Safeguarding Your Data | Skillstream Jobs US"
          content="Visit SkillStream Jobs Privacy Center to learn how we safeguard your data. Discover our commitment to protecting your privacy and securing your information."
        />
      </Helmet>
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Privacy Center</h1>
            {/* <ul className="page-breadcrumb">
              <li>
                <a href="#">Footer</a>
              </li>
              <li>Privacy Center</li>
            </ul> */}
          </div>
        </div>
      </section>

      <div className="privacy-container">
        <h1>Welcome to the Privacy Center of Skill Stream</h1>
        <p>
          Here at Skill Stream, we are committed to protecting your privacy and
          ensuring the security of your personal information. This page outlines
          how we collect, use, and safeguard your data when you use our job
          board platform.
        </p>
        <h2>1. Information We Collect</h2>
        <ol>
          <li>
            <strong>Personal Information:</strong> When you create an account or
            use our services, we may collect personal information such as your
            name, email address, contact information, and resume.
          </li>
          <li>
            <strong>Usage Information:</strong> We collect information about
            your interactions with our platform, including your search queries,
            job applications, and interactions with other users.
          </li>
          <li>
            <strong>Device and Log Information:</strong> We may collect
            information about your device, such as your IP address, browser
            type, and operating system, as well as log information about your
            use of our services.
          </li>
        </ol>
        <h2>2. How We Use Your Information</h2>
        <ol>
          <li>
            <strong>Providing Services:</strong> We use your information to
            provide, maintain, and improve our job board platform, including
            facilitating job searches, matching candidates with employers, and
            communicating with users.
          </li>
          <li>
            <strong>Personalization:</strong> We may use your information to
            personalize your experience on our platform, such as recommending
            job listings or tailoring content to your interests.
          </li>
          <li>
            <strong>Communication:</strong> We may use your contact information
            to send you updates, notifications, and promotional messages related
            to our services.
          </li>
        </ol>
        <h2>3. Data Sharing and Disclosure</h2>
        <ol>
          <li>
            <strong>With Your Consent:</strong> We may share your information
            with third parties when you give us consent to do so, such as when
            you apply for a job or opt-in to receive communications from our
            partners.
          </li>
          <li>
            <strong>Service Providers:</strong> We may share your information
            with third-party service providers who help us operate our platform,
            process payments, or provide other services on our behalf.
          </li>
          <li>
            <strong>Legal Compliance:</strong> We may disclose your information
            when required by law, such as in response to a court order or legal
            process, or to protect the rights, property, or safety of Skill
            Stream, our users, or others.
          </li>
        </ol>
        <h2>4. Data Security</h2>
        <p>
          We implement technical, administrative, and physical security measures
          to protect your information from unauthorized access, disclosure,
          alteration, or destruction. However, please be aware that no security
          measures are completely foolproof, and we cannot guarantee the
          security of your data.
        </p>
        <h2>5. Your Rights and Choices</h2>
        <ol>
          <li>
            <strong>Access and Correction:</strong> You have the right to access
            and correct your personal information stored on our platform. You
            can update your account information or contact us to request access
            to your data.
          </li>
          <li>
            <strong>Opt-Out:</strong> You can opt-out of receiving promotional
            communications from us by following the unsubscribe instructions
            provided in the communication or by contacting us directly.
          </li>
        </ol>
        <h2>6. Privacy Policy Updates</h2>
        <p>
          We may update this Privacy Center from time to time to reflect changes
          in our privacy practices or legal requirements. We will notify you of
          any material changes by posting a notice on our website or sending you
          a notification.
        </p>
        <h2>7. Contact Us</h2>
        <p>
          If you have any questions or concerns about our privacy practices or
          this Privacy Center, please contact us at{" "}
          <a href="mailto:info@skillstreamjobs.us">
            info@skillstreamjobs.us
          </a>
          .
        </p>
        <p>
          Thank you for trusting Skill Stream with your job search. We are
          committed to protecting your privacy and providing a secure and
          transparent experience on our platform.
        </p>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="acceptTermsCheckbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="acceptTermsCheckbox">
            I accept the Privacy Center
          </label>
        </div>
        <button
          className="Accept-button"
          onClick={() => navigate("/")}
          disabled={!isChecked}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default PrivacyCenter;
