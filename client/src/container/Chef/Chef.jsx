import React from "react";

import { SubHeading } from "../../Components";
import { images } from "../../constants";
import "./Chef.css";

const JobSeekers = () => (
  <div className="app__bg app__wrapper section__padding">
    <div className="app__wrapper_img app__wrapper_img-reverse">
      <img src={images.find} alt="job_seekers_image" />
    </div>
    <div className="app__wrapper_info">
      <SubHeading title="Finding Quality Job Seekers" />
      <h1 className="headtext__cormorant">What We Offer</h1>

      <div className="app__chef-content">
        <div className="app__chef-content_quote">
          <img src={images.quote} alt="quote_image" />
          <p className="p__opensans">
            Discover top talent with our expert recruitment solutions.
          </p>
        </div>
        <p className="p__opensans">
          We connect you with qualified job seekers who have the skills and experience you need. Our tailored approach ensures that you find the right candidates to fit your organizational needs. From initial screening to final placement, we are here to support you every step of the way.
        </p>
        
      </div>

      {/* <div className="app__chef-sign">
        <p>Jane Doe</p>
        <p className="p__opensans">Recruitment Specialist</p>
        <img src={images.sign} alt="sign_image" />
      </div> */}
    </div>
  </div>
);

export default JobSeekers;
