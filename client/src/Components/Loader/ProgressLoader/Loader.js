import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="page-loader-wrapper">
      <div className="combined-loader">
        <p className="search-text">Searching...</p>
        <div className="progress-bar"></div>
      </div>
    </div>
  );
};

export default Loader;
