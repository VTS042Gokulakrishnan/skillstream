import React, { useState } from "react";
// import Modal from "react-modal";
import { Button, Modal } from "antd";
const PrivacyPolicyModal = ({
  showPrivacyModal,
  setShowPrivacyModal,
  setPrivacyAccepted,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  return (
    <Modal
      open={showPrivacyModal}
      width={1200} // in pixels
      onCancel={() => setShowPrivacyModal(false)}
      footer={false}
    >
      <div className="privacy-container">
        <h1>Security Center – SkillStreamJobs.us</h1>
        <p>
          At SkillStreamJobs.us, we prioritize the security and privacy of our
          users' data. Our commitment is to implement and maintain robust
          security measures that protect your information against unauthorized
          access, disclosure, alteration, and destruction. Below is an overview
          of our security practices:
        </p>

        <h2>1. Data Encryption</h2>
        <ul>
          <li>
            <strong>In Transit:</strong> All data transmitted between your
            device and our servers is encrypted using Transport Layer Security
            (TLS) to prevent interception.
          </li>
          <li>
            <strong>At Rest:</strong> Sensitive data stored on our servers is
            encrypted using Advanced Encryption Standard (AES) to ensure its
            confidentiality.
          </li>
        </ul>

        <h2>2. Access Controls</h2>
        <ul>
          <li>
            <strong>Role-Based Access Control (RBAC):</strong> Ensuring users
            have access only to the data necessary for their role.
          </li>
          <li>
            <strong>Multi-Factor Authentication (MFA):</strong> Adding an extra
            layer of security for administrative access.
          </li>
        </ul>

        <h2>3. Regular Security Audits</h2>
        <ul>
          <li>
            <strong>Internal Audits:</strong> Regular reviews of our systems and
            processes.
          </li>
          <li>
            <strong>Third-Party Penetration Testing:</strong> Engaging external
            experts to test our defenses and provide recommendations.
          </li>
        </ul>

        <h2>4. Secure Development Practices</h2>
        <ul>
          <li>
            <strong>Code Reviews:</strong> Ensuring code quality and security
            before deployment.
          </li>
          <li>
            <strong>Automated Testing:</strong> Utilizing tools to detect and
            fix vulnerabilities early in the development process.
          </li>
        </ul>

        <h2>5. Incident Response Plan</h2>
        <ul>
          <li>
            <strong>Identify and Contain:</strong> Quickly detect and isolate
            the issue.
          </li>
          <li>
            <strong>Notify Affected Parties:</strong> Inform users and
            authorities as required by applicable laws.
          </li>
          <li>
            <strong>Remediate and Prevent:</strong> Address the root cause and
            implement measures to prevent recurrence.
          </li>
        </ul>

        <h2>6. Compliance with Legal Standards</h2>
        <ul>
          <li>
            <strong>General Data Protection Regulation (GDPR):</strong> For
            users in the European Economic Area.
          </li>
          <li>
            <strong>
              Health Insurance Portability and Accountability Act (HIPAA):
            </strong>{" "}
            Where applicable.
          </li>
          <li>
            <strong>
              Personal Information Protection and Electronic Documents Act
              (PIPEDA):
            </strong>{" "}
            For Canadian users.
          </li>
        </ul>

        <h2>7. User Responsibilities</h2>
        <ul>
          <li>
            <strong>Account Security:</strong> Keep your login credentials
            confidential and use strong, unique passwords.
          </li>
          <li>
            <strong>Phishing Awareness:</strong> Be cautious of unsolicited
            communications requesting personal information.
          </li>
        </ul>

        <h2>8. Reporting Security Concerns</h2>
        <p>
          If you identify any security vulnerabilities or have concerns, please
          contact us immediately at
          <a href="mailto:security@skillstreamjobs.us">
            {" "}
            security@skillstreamjobs.us
          </a>
          .
        </p>

        <h2>9. Integration with ChatGPT</h2>
        <p>
          Our platform integrates ChatGPT to enhance the analysis of user data
          for improved job matching and candidate evaluation.
        </p>
        <h3>Security Measures</h3>
        <ul>
          <li>
            <strong>Secure APIs:</strong> All interactions with ChatGPT occur
            through secure API connections.
          </li>
          <li>
            <strong>Access Controls:</strong> Strict access controls are in
            place to prevent unauthorized access to data during processing.
          </li>
          <li>
            <strong>Compliance Monitoring:</strong> Regular audits are conducted
            to ensure compliance with data protection regulations.
          </li>
        </ul>
        <p>
          These measures align with our commitment to maintaining the
          confidentiality and integrity of user data.
        </p>

        <p>
          For more detailed information on our security practices or to request
          a copy of our security policies, please reach out to our support team.
        </p>
        <div className="checkbox-container" style={{ marginTop: "1em" }}>
          <input
            type="checkbox"
            id="acceptPrivacyCheckbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="acceptPrivacyCheckbox">
            I accept the Security Policy
          </label>
        </div>
        <button
          className="Accept-button"
          onClick={() => {
            setShowPrivacyModal(false);
            setPrivacyAccepted(true);
          }}
          disabled={!isChecked}
        >
          Accept
        </button>
      </div>
    </Modal>
  );
};

export default PrivacyPolicyModal;
// setShowPrivacyModal(false);
// setPrivacyAccepted(true);
//  <button
//           className="Accept-button"
//           onClick={() => {
//             // setShowPrivacyModal(false);
//             // setPrivacyAccepted(true);
//           }}
//           disabled={!isChecked}
//         >
//           Accept
//         </button>
