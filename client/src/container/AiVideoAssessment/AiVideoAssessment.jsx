import React from "react";

import { SubHeading } from "../../Components";
import { images } from "../../constants";
import "./AiVideoAssessment.css";

const AiVideoAssessment = () => (
  <div className="app__bg app__wrapper section__padding">
    <div className="app__wrapper_info">
      <SubHeading title="AI Video Assessment" />
      <h1 className="headtext__cormorant">Harness the Power of AI</h1>

      <div className="app__video-content">
        <div className="app__video-content_quote">
          <img src={images.quote} alt="quote_image" />
          <p className="p__opensans">
            Unlock valuable insights with our AI-driven video assessments.
          </p>
        </div>
        <p className="p__opensans">
          Our AI video assessment tool provides a comprehensive analysis of candidate responses, evaluating not only their verbal communication but also non-verbal cues. This advanced technology helps streamline the hiring process by delivering objective insights and recommendations, ensuring you find the right fit for your team efficiently.
        </p>
      </div>

      {/* <div className="app__video-sign">
        <p>Jane Doe</p>
        <p className="p__opensans">AI Specialist</p>
        <img src={images.sign} alt="sign_image" />
      </div> */}
    </div>
    <div className="app__wrapper_img app__wrapper_img-reverse">
      <img src={images.video} alt="video_image" />
    </div>
  </div>
);

export default AiVideoAssessment;
