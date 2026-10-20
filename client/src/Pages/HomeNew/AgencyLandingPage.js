import React, { useEffect, useState } from "react";
import tw from "twin.macro"; //eslint-disable-line
// // import { css } from "styled-components/macro";  //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";

import Hero from "../../Components/hero/BackgroundAsImage.js";
import Features from "../../Components/features/DashedBorderSixFeatures";
import MainFeature from "../../Components/features/TwoColSingleFeatureWithStats2.js";
import MainFeature2 from "../../Components/features/TwoColWithTwoFeaturesAndButtons.js";
import Portfolio from "../../Components/cards/PortfolioTwoCardsWithImage.js";
import Blog from "../../Components/blogs/ThreeColSimpleWithImageAndDashedBorder.js";
import Testimonial from "../../Components/testimonials/TwoColumnWithImageAndProfilePictureReview.js";
import FAQ from "../../Components/faqs/SimpleWithSideImage.js";
import ContactUsForm from "../../Components/forms/TwoColContactUsWithIllustration.js";
import Footer from "../../Components/footers/MiniCenteredFooter.js";
import customerSupportIllustrationSrc from "images/customer-support-illustration.svg";
import CategoryGrid from "Components/CatogoryGrid/CategoryGrid.js";
import Slider from "../../Components/cards/ThreeColSlider.js";
import FeautersList from "../../Components/FeaturesList/FeaturesList.js";
import { useNavigate } from "react-router-dom";

const CandidatePage = () => {
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
      } else if (role === "Vendor") {
        navigate("/vendor/dashboard");
      }
    }
  }, []);
  return (
    <AnimationRevealPage>
      <Hero />

      <FeautersList />
      <MainFeature />
      <Slider />
      <Features />

      <FAQ
        imageSrc={customerSupportIllustrationSrc}
        imageContain={true}
        imageShadow={false}
        subheading="FAQs"
        heading={
          <>
            Do you have <span tw="text-primary-500">Questions ?</span>
          </>
        }
      />

      <ContactUsForm />
    </AnimationRevealPage>
  );
};
export default CandidatePage;

{
  /* <CategoryGrid /> */
}
{
  /* <MainFeature2 /> */
}
{
  /* <Portfolio /> */
}
{
  /* <Testimonial
      subheading="Testimonials"
      heading={
        <>
          Our Clients <span tw="text-primary-500">Love Us.</span>
        </>
      }
      description="Here are what some of our amazing customers are saying about our marketing professionals. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      testimonials={[
        {
          imageSrc:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1024&q=80",
          profileImageSrc:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3.25&w=512&h=512&q=80",
          quote:
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
          customerName: "Charlotte Hale",
          customerTitle: "CEO, Tesla Inc."
        },
        {
          imageSrc:
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80",
          profileImageSrc:
            "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=512&h=512&q=80",
          quote:
            "Sinor Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
          customerName: "Adam Cuppy",
          customerTitle: "Founder, Nestle"
        }
      ]}
      textOnLeft={true}
    /> */
}
