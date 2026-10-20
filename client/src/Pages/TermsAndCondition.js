import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const TermsAndCondition = () => {
  const navigate = useNavigate();

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div>
      <Helmet>
        <meta
          name="Terms and Conditions | User Agreement & Policies | Skillstream Jobs US"
          content="Review the Terms and Conditions for SkillStream Jobs US. Understand our user agreement, policies, and your rights when using our IT job portal and services."
        />
      </Helmet>
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Terms and Condition</h1>
            {/* <ul className="page-breadcrumb">
              <li>
                <a href="#">Footer</a>
              </li>
              <li>Terms and Condition</li>
            </ul> */}
          </div>
        </div>
      </section>
      <div className="terms-container">
        <h1>Terms and Conditions</h1>
        <ol>
          <li>
            <strong>Acceptance of Terms</strong>
            <p>
              By accessing or using the Skill Stream job board ("Service"), you
              agree to be bound by these Terms of Use. If you do not agree to
              these terms, you may not access or use the Service.
            </p>
          </li>
          <li>
            <strong>Description of Service</strong>
            <p>
              Skill Stream provides a platform for job seekers and employers to
              connect. Job seekers can search for job listings, create profiles,
              and apply for positions. Employers can post job listings, search
              for candidates, and manage their hiring process.
            </p>
          </li>
          <li>
            <strong>User Accounts</strong>

            <li>
              <strong>Job Seekers:</strong>
              <p>
                You must create an account to access certain features of the
                Service. You are responsible for maintaining the confidentiality
                of your account information and for all activities that occur
                under your account.
              </p>
            </li>
            <li>
              <strong>Employers:</strong>
              <p>
                You must create an account and agree to our separate Employer
                Terms and Conditions to post job listings and access employer
                features.
              </p>
            </li>
          </li>
          <li>
            <strong>User Conduct</strong>
            <p>
              You agree not to use the Service for any unlawful purposes or in a
              manner that violates these Terms of Use.
            </p>
            <p>
              You agree not to upload, post, or transmit any content that is
              unlawful, harmful, threatening, abusive, harassing, defamatory,
              vulgar, obscene, libelous, invasive of another's privacy, or
              otherwise objectionable.
            </p>
            <p>
              You agree not to upload, post, or transmit any content that
              infringes upon the intellectual property rights of others.
            </p>
          </li>
          <li>
            <strong>Content</strong>
            <p>
              Skill Stream does not guarantee the accuracy, completeness, or
              reliability of any content posted on the Service.
            </p>
            <p>
              Skill Stream reserves the right to remove any content that
              violates these Terms of Use or is otherwise objectionable.
            </p>
          </li>
          <li>
            <strong>Privacy</strong>
            <p>
              Skill Stream's Privacy Policy governs the collection, use, and
              disclosure of personal information on the Service.
            </p>
          </li>
          <li>
            <strong>Disclaimer of Warranties</strong>
            <p>
              The Service is provided on an "as is" and "as available" basis
              without warranties of any kind, either express or implied. Skill
              Stream disclaims all warranties, including, but not limited to,
              the implied warranties of merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
          </li>
          <li>
            <strong>Limitation of Liability</strong>
            <p>
              Skill Stream shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of
              profits or revenues, whether incurred directly or indirectly, or
              any loss of data, use, goodwill, or other intangible losses
              resulting from:
            </p>

            <li>
              Your access to or use of or inability to access or use the
              Service.
            </li>
            <li>Any conduct or content of any third party on the Service.</li>
          </li>
          <li>
            <strong>Indemnification</strong>
            <p>
              You agree to indemnify and hold Skill Stream and its affiliates,
              officers, agents, employees, and partners harmless from and
              against any claims, liabilities, damages, losses, and expenses,
              including, without limitation, reasonable legal and accounting
              fees, arising out of or in any way connected with:
            </p>

            <li>Your access to or use of the Service.</li>
            <li>Your violation of these Terms of Use.</li>
          </li>
          <li>
            <strong>Modifications to Terms of Use</strong>
            <p>
              Skill Stream reserves the right to modify these Terms of Use at
              any time. If we make material changes to these terms, we will
              notify you by email or by posting a notice on the Service.
            </p>
          </li>
          <li>
            <strong>Governing Law</strong>
            <p>
              These Terms of Use shall be governed by and construed in
              accordance with the Ontario provincial law, without regard to its
              conflict of law provisions.
            </p>
          </li>
          <li>
            <strong>Contact Us</strong>
            <p>
              If you have any questions about these Terms of Use, please contact
              us at{" "}
              <a href="mailto:info@skillstreamjobs.us">
                info@skillstreamjobs.us
              </a>
              .
            </p>
          </li>
          <p>
            By using the Skill Stream job board, you agree to abide by these
            Terms of Use. Thank you for choosing Skill Stream.
          </p>

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="acceptTermsCheckbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="acceptTermsCheckbox">
              I accept the Terms and Conditions
            </label>
          </div>
          <button
            className="Accept-button"
            onClick={() => navigate("/")}
            disabled={!isChecked}
          >
            Accept
          </button>
        </ol>
      </div>
    </div>
  );
};

export default TermsAndCondition;
