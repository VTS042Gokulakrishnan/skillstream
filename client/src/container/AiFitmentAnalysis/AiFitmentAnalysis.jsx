import React from "react";

import { SubHeading } from "../../Components";
import { images } from "../../constants";
import "./AiFitmentAnalysis.css";

const AiFitmentAnalysis = () => (
  <div className="app__bg app__wrapper section__padding">
    <div className="app__wrapper_img app__wrapper_img-reverse">
      <img src={images.fitment} alt="fitment_image" />
    </div>
    <div className="app__wrapper_info">
      <SubHeading title="AI Fitment Analysis" />
      <h1 className="headtext__cormorant">Optimize Your Talent Fit</h1>

      <div className="app__fitment-content">
        <div className="app__fitment-content_quote">
          <img src={images.quote} alt="quote_image" />
          <p className="p__opensans">
            Discover the perfect match for your team with AI-powered fitment analysis.
          </p>
        </div>
        <p className="p__opensans">
          Our AI Fitment Analysis tool evaluates candidates based on their skills, experience, and cultural fit, providing a comprehensive assessment to ensure they align with your organization's needs. This innovative solution streamlines the hiring process and enhances decision-making by offering data-driven insights and recommendations.
        </p>
      </div>

      {/* <div className="app__fitment-sign">
        <p>Jane Doe</p>
        <p className="p__opensans">Fitment Specialist</p>
        <img src={images.sign} alt="sign_image" />
      </div> */}
    </div>
  </div>
);

export default AiFitmentAnalysis;
