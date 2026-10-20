import React, { useState } from "react";
// import Modal from "react-modal";
import { Button, Modal } from "antd";

const DataPrivacyModal = ({
  showDataPrivacyModal,
  setShowDataPrivacyModal,
  handleSubmit,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  return (
    <Modal
      open={showDataPrivacyModal}
      width={1200} // in pixels
      onCancel={() => setShowDataPrivacyModal(false)}
      footer={false}
    >
      {" "}
      <div className="security-container">
        <h1>Security Center - Skill Stream Job Board</h1>
        <p>
          Welcome to the Security Center of Skill Stream, where we prioritize
          the protection of your data and the security of our platform. This
          page outlines the measures we take to safeguard your information and
          ensure a secure experience when using our job board platform.
        </p>
        <ol>
          <li>
            <strong>Data Encryption</strong>
            <p>
              We use industry-standard encryption protocols to protect your data
              during transmission between your device and our servers. This
              ensures that your information remains confidential and secure when
              you interact with our platform.
            </p>
          </li>
          <li>
            <strong>Secure Access Controls</strong>
            <p>
              Access to our platform is restricted to authorized users only. We
              implement secure access controls, including strong password
              requirements, multi-factor authentication, and role-based access
              permissions, to prevent unauthorized access to sensitive
              information.
            </p>
          </li>
          <li>
            <strong>Regular Security Audits</strong>
            <p>
              We conduct regular security audits and assessments to identify and
              address potential vulnerabilities in our systems and
              infrastructure. This helps us maintain the integrity of our
              platform and protect against security threats.
            </p>
          </li>
          <li>
            <strong>Data Backup and Disaster Recovery</strong>
            <p>
              We maintain regular backups of your data to ensure its integrity
              and availability in the event of a system failure or data loss
              incident. Additionally, we have robust disaster recovery
              procedures in place to minimize downtime and restore services
              quickly in the event of a disaster.
            </p>
          </li>
          <li>
            <strong>Secure Payment Processing</strong>
            <p>
              If you choose to make payments through our platform, we use
              trusted payment processors and encryption technologies to secure
              your financial transactions and protect your payment information
              from unauthorized access.
            </p>
          </li>
          <li>
            <strong>Security Awareness Training</strong>
            <p>
              We provide ongoing security awareness training to our employees to
              ensure they are knowledgeable about best practices for data
              security and privacy. This helps mitigate the risk of human error
              and strengthens our overall security posture.
            </p>
          </li>
          <li>
            <strong>Incident Response Plan</strong>
            <p>
              In the event of a security incident or data breach, we have a
              documented incident response plan in place to quickly detect,
              contain, and mitigate the impact of the incident. We also notify
              affected users promptly and take appropriate steps to address any
              vulnerabilities that may have contributed to the incident.
            </p>
          </li>
          <li>
            <strong>Compliance with Regulations</strong>
            <p>
              We comply with applicable data protection laws and regulations,
              including GDPR, CCPA, and others, to ensure that your data is
              handled in accordance with legal requirements and industry best
              practices.
            </p>
          </li>
          <li>
            <strong>Reporting Security Concerns</strong>
            <p>
              If you believe you have discovered a security vulnerability or
              have concerns about the security of our platform, please report it
              to us immediately so that we can investigate and take appropriate
              action. You can contact us at{" "}
              <a href="mailto:info@skillstreamjobs.us">
                info@skillstreamjobs.us
              </a>
              .
            </p>
          </li>
        </ol>
        <p>
          Thank you for trusting Skill Stream with your job search. We are
          committed to maintaining the highest standards of security to protect
          your data and provide you with a safe and secure experience on our
          platform.
        </p>
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="acceptTermsCheckbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="acceptTermsCheckbox">
            I accept the Security Center
          </label>
        </div>
        <button
          className="Accept-button"
          onClick={(e) => {
            setShowDataPrivacyModal(false);
            handleSubmit(e);
          }}
          disabled={!isChecked}
        >
          Accept
        </button>
      </div>
    </Modal>
  );
};

export default DataPrivacyModal;
