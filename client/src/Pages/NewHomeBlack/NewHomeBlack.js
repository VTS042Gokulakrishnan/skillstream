import React, { useEffect } from "react";

import {
  AboutUs,
  Chef,
  FindUs,
  //   Footer,
  Gallery,
  Header,
  Intro,
  Laurels,
  SpecialMenu,
  AiVideoAssessment,
  AiFitmentAnalysis,
} from "../../container";
import Pricing from "../../Components/pricing/TwoPlansWithDurationSwitcher";
import { useNavigate } from "react-router-dom";
// import { Navbar } from "./components";
import "./NewHomeBlack.css";


const NewHomeBlack = () => {
 
  
  return (
    <div>
      {/* <Navbar /> */}
      <Header />
      <AboutUs />
      <SpecialMenu />
      <Chef />
      <AiVideoAssessment />
      <AiFitmentAnalysis />
      {/* <Chef /> */}
      <Pricing />
      <Intro />
      <Laurels />
      <Gallery />
      <FindUs />
      {/* <Footer /> */}
    </div>
  );
};

export default NewHomeBlack;
