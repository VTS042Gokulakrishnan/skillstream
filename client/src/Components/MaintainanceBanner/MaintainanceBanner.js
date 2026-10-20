import React from "react";
import "./MaintainanceBanner.css";
import NewLogo from "../../assets/logo-twos.png";
import ClickGame from "Components/ClickGame";
import maintainance from "../../assets/Animation - 1751029355629.gif"


const MaintainanceBanner = () => {
  return (
    <div className="maintenance">
      <div className="maintenance_contain">
        <img
          src={NewLogo}
          style={{ height: "100px" }}
          className="logo-images"
          alt="Normal Logo"
        />
        {/* <img
          src="https://demo.wpbeaveraddons.com/wp-content/uploads/2018/02/main-vector.png"
          alt="maintenance"
        /> */}
          <img
          src={maintainance}
          style={{ height: "280px" }}
          // className="logo-images"
          alt="Normal Logo"
        />
        {/* <ClickGame/> */}
        {/* <span className="pp-infobox-title-prefix">WE ARE COMING SOON</span> */}
        <div className="pp-infobox-title-wrapper">
          <h3 className="pp-infobox-title">
            The website is under maintenance!
          </h3>
        </div>
        <div className="pp-infobox-description">
          <p>
            🚨 Our servers are currently experiencing downtime. <br /> some
            features may be unavailable. Please check back soon 🚨
          </p>
        </div>
        <span className="title-text pp-primary-title">We are social</span>
        <div className="pp-social-icons pp-social-icons-center pp-responsive-center">
          <span className="pp-social-icon">
            <a href="#" target="_blank" aria-label="Facebook" role="button">
              <i className="fa fa-facebook"></i>
            </a>
          </span>
          <span className="pp-social-icon">
            <a href="#" target="_blank" aria-label="Twitter" role="button">
              <i className="fa fa-twitter"></i>
            </a>
          </span>
          <span className="pp-social-icon">
            <a href="#" target="_blank" aria-label="Google Plus" role="button">
              <i className="fa fa-google-plus"></i>
            </a>
          </span>
          <span className="pp-social-icon">
            <a href="#" target="_blank" aria-label="LinkedIn" role="button">
              <i className="fa fa-linkedin"></i>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaintainanceBanner;
