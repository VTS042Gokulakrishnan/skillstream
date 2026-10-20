import React, { useState } from "react";
// import Modal from "react-modal";
import { Button, Modal } from "antd";
// Modal.setAppElement("#root");
const TermsAndConditionsModal = ({
  showTermsModal,
  setShowTermsModal,
  setTermsAccepted,
  setShowPrivacyModal,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Modal
      open={showTermsModal}
      width={1200} // in pixels
      onCancel={() => setShowTermsModal(false)}
      footer={false}
    >
      <div className="privacy-container">
        <h1>Privacy Policy (GDPR, HIPAA, PIPEDA Compliant)</h1>
        <p>
          <strong>Effective Date:</strong> [Insert Date]
        </p>

        <h2>1. Introduction</h2>
        <p>
          SkillStreamJobs.us (“SkillStream”, “we”, “our”, “us”) is committed to
          protecting your privacy. This Privacy Policy outlines how we collect,
          use, disclose, and safeguard your personal data, and your rights under
          applicable privacy laws, including the GDPR, HIPAA (if and where
          applicable), and PIPEDA.
        </p>

        <h2>2. Scope</h2>
        <ul>
          <li>Provide personal information directly via our platform.</li>
          <li>
            Are located in the U.S., US, or the European Economic Area
            (EEA).
          </li>
          <li>
            Interact with our AI-powered job matching and scoring services.
          </li>
        </ul>

        <h2>3. Categories of Personal Data Collected</h2>
        <ul>
          <li>
            <strong>Identity Data:</strong> Full name, date of birth (if
            provided).
          </li>
          <li>
            <strong>Contact Data:</strong> Email address, phone number, city,
            and country.
          </li>
          <li>
            <strong>Employment Data:</strong> Current and past employment
            history.
          </li>
          <li>
            <strong>Educational Data:</strong> Degrees, institutions,
            certifications.
          </li>
          <li>
            <strong>Usage Data:</strong> IP address, device information,
            interaction logs.
          </li>
          <li>
            <strong>Inference Data:</strong> Candidate scores, skill
            classification, and job match suggestions generated via OpenAI-based
            analysis.
          </li>
        </ul>
        <p>
          <em>Note:</em> SkillStream does not collect or process protected
          health information (PHI) under HIPAA unless explicitly authorized and
          necessary. If any PHI is collected, it will be handled in accordance
          with HIPAA’s Privacy and Security Rules.
        </p>

        <h2>4. Purpose and Legal Basis for Processing</h2>
        <ul>
          <li>
            To provide job-matching services – <em>Contractual necessity</em>
          </li>
          <li>
            To communicate with users – <em>Legitimate interest / Consent</em>
          </li>
          <li>
            To analyze and improve services – <em>Legitimate interest</em>
          </li>
          <li>
            To comply with legal obligations – <em>Legal obligation</em>
          </li>
          <li>
            To conduct AI-based analysis on user data –{" "}
            <em>Consent (GDPR Art. 6.1.a)</em>
          </li>
        </ul>
        <p>
          For Canadian users, we adhere to PIPEDA’s fair information principles,
          including obtaining meaningful consent before or at the time of data
          collection.
        </p>

        <h2>5. Data Sharing and Disclosure</h2>
        <ul>
          <li>
            <strong>Employers:</strong> When matching candidates to job
            opportunities.
          </li>
          <li>
            <strong>Service Providers:</strong> Including OpenAI for data
            analysis.
          </li>
          <li>
            <strong>Regulators or Law Enforcement:</strong> Where legally
            required.
          </li>
          <li>
            <strong>International Transfers:</strong> Where applicable (e.g., EU
            to U.S.), we implement safeguards such as Standard Contractual
            Clauses (SCCs).
          </li>
        </ul>

        <h2>6. Your Rights</h2>
        <p>
          <strong>Under GDPR (EEA users)</strong>
        </p>
        <ul>
          <li>Access, rectify, or erase your data.</li>
          <li>Restrict or object to processing.</li>
          <li>Port your data to another service.</li>
          <li>Lodge a complaint with a supervisory authority.</li>
          <li>Withdraw consent at any time.</li>
        </ul>
        <p>
          <strong>Under PIPEDA (Canadian users)</strong>
        </p>
        <ul>
          <li>Know what personal data is collected and why.</li>
          <li>Access and correct your information.</li>
          <li>
            Challenge compliance via the Office of the Privacy Commissioner of
            US.
          </li>
        </ul>
        <p>
          <strong>Under U.S. Laws</strong>
        </p>
        <p>
          While there is no federal comprehensive data privacy law,
          state-specific laws (e.g., CCPA in California) may apply:
        </p>
        <ul>
          <li>You may have rights to access, delete, or restrict data use.</li>
        </ul>
        <p>
          To exercise any of the above rights, contact:{" "}
          <a href="mailto:info@skillstreamjobs.us">info@skillstreamjobs.us</a>
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your data only for as long as necessary to fulfill the
          purposes for which it was collected and to comply with legal,
          contractual, and regulatory obligations.
        </p>

        <h2>8. Data Security</h2>
        <p>
          We use administrative, technical, and physical security controls
          aligned with industry standards to protect your data from unauthorized
          access, use, or disclosure.
        </p>

        <h2>9. Children's Privacy</h2>
        <p>
          Our platform is not intended for children under 16 years old. We do
          not knowingly collect data from children.
        </p>

        <h2>10. Updates to This Policy</h2>
        <p>
          We may update this policy periodically. Changes will be posted on this
          page with a new effective date.
        </p>

        <h2>11. ​​Use of ChatGPT for Data Processing</h2>
        <p>
          SkillStreamJobs.us utilizes ChatGPT, developed by OpenAI, to analyze
          user-provided information such as resumes, employment history, and
          educational background. This analysis aids in generating candidate
          scores and matching users with suitable job opportunities.
        </p>
        <p>
          <strong>Data Handling and Protection</strong>
        </p>
        <ul>
          <li>
            <strong>Data Transmission:</strong> Information is transmitted
            securely using industry-standard encryption protocols.
          </li>
          <li>
            <strong>Data Minimization:</strong> Only the necessary data required
            for analysis is shared with ChatGPT.
          </li>
          <li>
            <strong>No Storage of Personal Data:</strong> OpenAI does not store
            personal data shared during these interactions.
          </li>
        </ul>
        <p>
          By using our services, you consent to the processing of your data
          through ChatGPT as described.
        </p>

        <div className="checkbox-container" style={{ marginTop: "1em" }}>
          <input
            type="checkbox"
            id="acceptPrivacyCheckbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="acceptPrivacyCheckbox">
            I accept the Privacy Policy
          </label>
        </div>

        <button
          className="Accept-button"
          onClick={() => {
            setTermsAccepted(true);
            setShowPrivacyModal(true);
            setShowTermsModal(false);
          }}
          disabled={!isChecked}
        >
          Accept
        </button>
      </div>
    </Modal>
  );
};

export default TermsAndConditionsModal;

// import React, { useState } from "react";
// // import Modal from "react-modal";
// import { Button, Modal } from "antd";
// // Modal.setAppElement("#root");
// const TermsAndConditionsModal = ({
//   showTermsModal,
//   setShowTermsModal,
//   setTermsAccepted,
//   setShowPrivacyModal,
// }) => {
//   const [isChecked, setIsChecked] = useState(false);
//   const handleCheckboxChange = () => {
//     setIsChecked(!isChecked);
//   };

//   return (
//     <Modal
//       open={showTermsModal}
//       width={1200} // in pixels
//       onCancel={() => setShowTermsModal(false)}
//       footer={false}
//     >
//       <div className="terms-container">
//         <h1>Terms and Conditions</h1>
//         <ol>
//           <li>
//             <strong>Acceptance of Terms</strong>
//             <p>
//               By accessing or using the Skill Stream job board ("Service"), you
//               agree to be bound by these Terms of Use. If you do not agree to
//               these terms, you may not access or use the Service.
//             </p>
//           </li>
//           <li>
//             <strong>Description of Service</strong>
//             <p>
//               Skill Stream provides a platform for job seekers and employers to
//               connect. Job seekers can search for job listings, create profiles,
//               and apply for positions. Employers can post job listings, search
//               for candidates, and manage their hiring process.
//             </p>
//           </li>
//           <li>
//             <strong>User Accounts</strong>

//             <li>
//               <strong>Job Seekers:</strong>
//               <p>
//                 You must create an account to access certain features of the
//                 Service. You are responsible for maintaining the confidentiality
//                 of your account information and for all activities that occur
//                 under your account.
//               </p>
//             </li>
//             <li>
//               <strong>Employers:</strong>
//               <p>
//                 You must create an account and agree to our separate Employer
//                 Terms and Conditions to post job listings and access employer
//                 features.
//               </p>
//             </li>
//           </li>
//           <li>
//             <strong>User Conduct</strong>
//             <p>
//               You agree not to use the Service for any unlawful purposes or in a
//               manner that violates these Terms of Use.
//             </p>
//             <p>
//               You agree not to upload, post, or transmit any content that is
//               unlawful, harmful, threatening, abusive, harassing, defamatory,
//               vulgar, obscene, libelous, invasive of another's privacy, or
//               otherwise objectionable.
//             </p>
//             <p>
//               You agree not to upload, post, or transmit any content that
//               infringes upon the intellectual property rights of others.
//             </p>
//           </li>
//           <li>
//             <strong>Content</strong>
//             <p>
//               Skill Stream does not guarantee the accuracy, completeness, or
//               reliability of any content posted on the Service.
//             </p>
//             <p>
//               Skill Stream reserves the right to remove any content that
//               violates these Terms of Use or is otherwise objectionable.
//             </p>
//           </li>
//           <li>
//             <strong>Privacy</strong>
//             <p>
//               Skill Stream's Privacy Policy governs the collection, use, and
//               disclosure of personal information on the Service.
//             </p>
//           </li>
//           <li>
//             <strong>Disclaimer of Warranties</strong>
//             <p>
//               The Service is provided on an "as is" and "as available" basis
//               without warranties of any kind, either express or implied. Skill
//               Stream disclaims all warranties, including, but not limited to,
//               the implied warranties of merchantability, fitness for a
//               particular purpose, and non-infringement.
//             </p>
//           </li>
//           <li>
//             <strong>Limitation of Liability</strong>
//             <p>
//               Skill Stream shall not be liable for any indirect, incidental,
//               special, consequential, or punitive damages, or any loss of
//               profits or revenues, whether incurred directly or indirectly, or
//               any loss of data, use, goodwill, or other intangible losses
//               resulting from:
//             </p>

//             <li>
//               Your access to or use of or inability to access or use the
//               Service.
//             </li>
//             <li>Any conduct or content of any third party on the Service.</li>
//           </li>
//           <li>
//             <strong>Indemnification</strong>
//             <p>
//               You agree to indemnify and hold Skill Stream and its affiliates,
//               officers, agents, employees, and partners harmless from and
//               against any claims, liabilities, damages, losses, and expenses,
//               including, without limitation, reasonable legal and accounting
//               fees, arising out of or in any way connected with:
//             </p>

//             <li>Your access to or use of the Service.</li>
//             <li>Your violation of these Terms of Use.</li>
//           </li>
//           <li>
//             <strong>Modifications to Terms of Use</strong>
//             <p>
//               Skill Stream reserves the right to modify these Terms of Use at
//               any time. If we make material changes to these terms, we will
//               notify you by email or by posting a notice on the Service.
//             </p>
//           </li>
//           <li>
//             <strong>Governing Law</strong>
//             <p>
//               These Terms of Use shall be governed by and construed in
//               accordance with the Ontario provincial law, without regard to its
//               conflict of law provisions.
//             </p>
//           </li>
//           <li>
//             <strong>Contact Us</strong>
//             <p>
//               If you have any questions about these Terms of Use, please contact
//               us at{" "}
//               <a href="mailto:info@skillstreamjobs.us">
//                 info@skillstreamjobs.us
//               </a>
//               .
//             </p>
//           </li>
//           <p>
//             By using the Skill Stream job board, you agree to abide by these
//             Terms of Use. Thank you for choosing Skill Stream.
//           </p>

//           <div className="checkbox-container">
//             <input
//               type="checkbox"
//               id="acceptTermsCheckbox"
//               checked={isChecked}
//               onChange={handleCheckboxChange}
//             />
//             <label htmlFor="acceptTermsCheckbox">
//               I accept the Terms and Conditions
//             </label>
//           </div>
//           <button
//             className="Accept-button"
//             onClick={async () => {
//               setTermsAccepted(true);
//               setShowTermsModal(false); // open privacy modal next
//               setShowPrivacyModal(true);
//             }}
//             disabled={!isChecked}
//           >
//             Accept
//           </button>
//         </ol>
//       </div>
//     </Modal>
//   );
// };

// export default TermsAndConditionsModal;
