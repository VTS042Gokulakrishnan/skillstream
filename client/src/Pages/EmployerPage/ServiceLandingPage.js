import React, { useEffect } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import serverRedundancyIllustrationImageSrc from "../../assets/developers-inside-ss.webp";
import serverSecureIllustrationImageSrc from "../../assets/executives-paying-attention-digital-tablet.jpg";
import serverSecureIllustrationImageSrc1 from "../../assets/cheerful-business-people-coworking-laptop.jpg";
import Hero from "../../Components/hero/TwoColumnWithFeaturesAndTestimonial.js";
import Features from "../../Components/features/ThreeColWithSideImage.js";
import MainFeature from "../../Components/features/TwoColWithTwoHorizontalFeaturesAndButton.js";
import MainFeatureOne from "../../Components/features/TwoColWithButton.js";
import FeatureStats from "../../Components/features/ThreeColCenteredStatsPrimaryBackground.js";
import Pricing from "../../Components/pricing/TwoPlansWithDurationSwitcher.js";
import Testimonial from "../../Components/testimonials/TwoColumnWithImageAndProfilePictureReview.js";
import FAQ from "../../Components/faqs/SingleCol.js";
import GetStarted from "../../Components/cta/GetStartedLight.js";
import SkillDelivers from "Components/SkillDelivers/SkillDelivers";
// import bgImg from "../../assets/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner (1).jpg"
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";
import { Helmet } from "react-helmet";
// Styled component with a background image
const BackgroundContainer = styled.div`w-full h-full bg-cover bg-center bg-white`;
//   ${tw`w-full h-full bg-cover bg-center`}
//   background-image: url('../../assets/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner (1).jpg');
// `;

const HighlightedText = tw.span`text-blue-600`;
const Heading = tw.h1`mt-4 font-black text-left text-3xl sm:text-4xl lg:text-5xl text-center md:text-left leading-tight text-green-900`;
const SubHeading = tw.h2`mt-4 font-bold text-2xl sm:text-3xl lg:text-4xl text-center md:text-left leading-tight text-green-800`;

export default () => {
  let token = localStorage.getItem("token");
  let role = localStorage.getItem("Role");
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      // console.log("token");

      if (role === "Employer") {
        navigate("/employer-dashboard");
      } else if (role === "Candidate") {
        navigate("/candidate-dashboard");
      }
    }
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <AnimationRevealPage>
      <Helmet>
        <meta
          name="IT Job Portal | Job Search US | Latest IT Vacancies | Skillstream"
          content="SkillStream is US's top IT job portal. Find the latest IT vacancies and connect with leading companies. Simplify your job search and land at your dream job."
        />
      </Helmet>
      <Hero />
      <SkillDelivers
        heading={
          <>
            Skill Stream <HighlightedText>Delivers</HighlightedText>
          </>
        }
      />
      <MainFeature
        heading={
          <>
            Designed for{" "}
            <HighlightedText>Employers and Job Seekers</HighlightedText>
          </>
        }
      />
      <Features
        heading={
          <>
            Amazing <HighlightedText>Features</HighlightedText>
          </>
        }
      />

      <Testimonial
        heading={
          <>
            Our Clients <HighlightedText>Love Us</HighlightedText>
          </>
        }
      />
      <Pricing
        id="pricing-section"
        //  ref={pricingRef} // Assign the ref to the Pricing component
        heading={
          <>
            Flexible <HighlightedText>Plans</HighlightedText>
          </>
        }
      />
      <FAQ
        heading={
          <>
            Any <HighlightedText>Questions?</HighlightedText>
          </>
        }
      />

      <FeatureStats />
      <GetStarted />
    </AnimationRevealPage>
  );
};
