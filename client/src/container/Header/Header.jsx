import React from "react";

import { SubHeading } from "../../Components";
import { images } from "../../constants";
// import images from "../../assets/developers-inside-ss.webp"
import "./Header.css";

const Header = () => (
  <div className="app__header app__wrapper section__padding" id="home">
    {/* <div class="wrapper">
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </div> */}
    {/* <a href='#black' id='black'></a> */}
    <div className="app__wrapper_info">
      <SubHeading title="Premium Hiring Candidates" />
      <h1 className="app__header-h1">
        Maximize Your Hiring Process with Skill Stream
      </h1>
      <p className="p__opensans" style={{ margin: "2rem 0" }}>
        Are you tired of sifting through countless resumes and struggling to
        find the perfect candidate for your job openings? Look no further! With
        Skill Stream , we offer a streamlined and effective solution to connect
        you with top talent seamlessly.
      </p>
      <button type="button" className="custom__button">
        Find Candidates
      </button>
    </div>

    <div className="app__wrapper_img">
      <img src={images.headImg} alt="header_img" />
    </div>
  </div>
);

export default Header;
