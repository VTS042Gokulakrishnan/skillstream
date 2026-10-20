import React, { useState } from "react";
import tw from "twin.macro";
import styled, { css } from "styled-components";
import {
  SectionHeading,
  Subheading as SubheadingBase,
} from "../../Components/misc/Headings";
import { SectionDescription } from "../../Components/misc/Typography";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import { ContentWithPaddingXl } from "../../Components/misc/Layouts";
import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-6.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";
import TeamIllustrationSrc from "../../assets/group-business-people-discussing-questions-meeting-modern-office-managers-negotiation-brainstorm-teamwork-partnership-business-concept.jpg";
import serverRedundancyIllustrationImageSrc from "../../assets/coworkers-brainstorming-office.jpg";
import serverSecureIllustrationImageSrc from "../../assets/businesswoman-discussing-with-colleagues-digital-tablet.jpg";
import serverSecureIllustrationImageSrc1 from "../../assets/cheerful-man-shows-documents-woman-boss-office.jpg";
import { ReactComponent as SvgDotPattern } from "images/dot-pattern.svg";
import video from "../../assets/woman-wearing-headphones-sits-desk-dark-room-working-intently-computer-displaying-video-audio-editing-software.jpg";
import Resume from "../../assets/hand-holding-holographic-digital-interface-displaying-cyber-security-technology.jpg";
import analysis from "../../assets/online-technology-aids-job-search-ai-generative-recruitment.jpg";
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg";
const TwoColumn = tw.div`flex flex-col md:flex-row justify-between max-w-screen-xl mx-auto py-20 md:py-24 items-center`;
const Column = tw.div`w-full max-w-md mx-auto md:max-w-none md:mx-0`;
const ImageColumn = tw(Column)`md:w-6/12 flex-shrink-0 relative`;
const TextColumn = styled(Column)((props) => [
  tw`md:w-6/12 mt-16 md:mt-0`,
  props.textOnLeft
    ? tw`md:mr-12 lg:mr-16 md:order-first`
    : tw`md:ml-12 lg:ml-16 md:order-last`,
]);

const Image = styled.img((props) => [
  props.imageRounded && tw`rounded`,
  props.imageBorder && tw`border`,
  props.imageShadow && tw`shadow`,
]);

const DecoratorBlob = styled(SvgDotPattern)((props) => [
  tw`w-20 h-20 absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 fill-current text-primary-500 -z-10`,
]);

const TextContent = tw.div`lg:py-8 text-center md:text-left`;

const Subheading = tw(SubheadingBase)`text-center md:text-left text-blue-500`;
const Heading = tw(
  SectionHeading
)`mt-4 font-black text-left text-3xl sm:text-4xl lg:text-5xl text-center md:text-left leading-tight text-blue-300`;
const Description = tw.p`mt-4 text-center text-white font-bold md:text-left text-sm md:text-base lg:text-lg font-medium leading-relaxed`;

const PrimaryButton = styled(PrimaryButtonBase)((props) => [
  tw`mt-8 md:mt-8 text-sm inline-block mx-auto md:mx-0 bg-blue-500`,
  props.buttonRounded && tw`rounded-full`,
]);

const HeaderContainer = tw.div`w-full flex flex-col items-center`;

const PlanDurationSwitcher = tw.div`
  relative block w-full max-w-5xl sm:inline-block sm:w-auto border-2 border-blue-500 rounded-full px-1 py-1 mt-8
`;

const SwitchButton = styled.button`
  ${tw`w-auto sm:w-auto px-4 sm:px-8 py-3 rounded-full focus:outline-none text-sm font-bold text-blue-100 transition duration-300 relative z-10`}
 ${(props) => props.active && tw`font-extrabold text-white`}
`;

const PlansContainer = tw.div`flex justify-center flex-col md:flex-row items-center md:items-start relative`;
const Plan = styled.div`
  ${tw`w-full max-w-72 mt-16 md:mr-12 md:last:mr-0 text-center px-8 rounded-lg relative text-gray-100 bg-white flex flex-col shadow-raised`}
  ${(props) =>
    props.featured &&
    css`
      ${tw`border-2 border-gray-200 shadow-none`}
    `}
`;

const PlanHeader = styled.div`
  ${tw`flex flex-col leading-relaxed py-8 -mx-8 bg-gray-100 rounded-t-lg`}
  .name {
    ${tw`font-bold text-xl`}
  }
  .price {
    ${tw`font-bold text-4xl sm:text-5xl my-1`}
  }
  .slash {
    ${tw`text-xl text-gray-500`}
  }
  .duration {
    ${tw`lowercase text-gray-500 font-medium tracking-widest`}
  }
  .mainFeature {
    ${tw`text-gray-500 text-sm font-medium tracking-wide`}
  }
`;

const PlanFeatures = styled.div`
  ${tw`flex flex-col -mx-8 px-8 py-8 flex-1 text-sm`}
  .feature {
    ${tw`mt-5 first:mt-0 font-semibold text-gray-500`}
  }
`;

// export const Container = styled.div`
//   ${tw`relative p-20`}
//   // margin: 2rem;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: auto;
//   // overflow: hidden;

//     background: linear-gradient(
//   45deg, /* Diagonal direction */
//   #0A0A23, /* Dark Navy Blue */
//   #000000 80%, /* Black at 40% */
//   #1E90FF 40% /* Vibrant Blue at 80% */
// );
// );
// `;

const Container = styled.div`
  ${tw`relative`}

  background-image: url(${down});
  padding: 2rem;
  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;

const PlanAction = tw.div`px-4 pb-8`;
const BuyNowButton = styled(PrimaryButtonBase)`
  ${tw`rounded-full tracking-wider py-4 w-full text-sm hover:shadow-xl transform hocus:translate-x-px hocus:-translate-y-px focus:shadow-outline bg-blue-500 `}
`;

const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-64 w-64 opacity-25 transform -translate-x-2/3 -translate-y-1/2`}
`;
const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
  ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-25 transform translate-x-2/3 translate-y-1/2 fill-current text-teal-300`}
`;
const Slider = styled.div`
  ${tw`absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full transition-transform duration-300 ease-out`}
  width: 25%; /* 100% / 4 buttons */
  transform: ${({ activeDurationIndex }) =>
    `translateX(${activeDurationIndex * 100}%)`};
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 0 20px #4299e1;
  z-index: 1;
`;


export default ({
  subheading = "Delivers",
  heading = "Skill Stream Delivers.",
  description = "",
  plans = null,
  primaryButtonText = "Post Job",
  planDurations = [
    {
      text: "per Job",
      switcherText: "AI Matchmaking",
    },
    {
      text: "month",
      switcherText: "AI Resume Search",
    },
    {
      text: "month",
      switcherText: "AI Fitment Analysis",
    },
    {
      text: "month",
      switcherText: "AI Video Assessment",
    },
  ],
}) => {
  const defaultPlans = [
    {
      subheading: "What We Offer",
      heading: (
        <>
          Discover top talent quickly.<span tw="text-blue-700"></span>
        </>
      ),
      description:
        "Employers spend an average of 31 seconds scanning resumes to identify potential matches. Streamline your hiring process and connect effortlessly with high-quality candidates using Skill Stream’s advanced AI capabilities.",
      primaryButtonText: "About Us",
      primaryButtonUrl: "/about",
      imageSrc: serverRedundancyIllustrationImageSrc,
      buttonRounded: true,
      imageRounded: true,
      imageBorder: false,
      imageShadow: false,
      imageCss: null,
      imageDecoratorBlob: false,
      imageDecoratorBlobCss: null,
      textOnLeft: true,
    },
  ];

  const yearlyPlans = [
    {
      subheading: "Fast-Track Recruitment Success",
      heading: (
        <>
          Optimize Your Recruitment with AI-Powered Resume Search
          <span tw="text-blue-700"></span>
        </>
      ),
      description:
        "Enhance your hiring process through advanced AI insights that streamline candidate selection. Our innovative AI Resume Search tool helps you quickly identify the ideal candidates, significantly cutting down on resume review time and enabling you to build your team efficiently and confidently.",
      imageSrc: Resume,
      buttonRounded: false,
      primaryButtonText: "Contact Us",
      primaryButtonUrl: "/contact",
      buttonRounded: true,
      imageRounded: true,
      imageBorder: false,
      imageShadow: false,
      imageCss: null,
      imageDecoratorBlob: false,
      imageDecoratorBlobCss: null,
      textOnLeft: false,
    },
  ];

  const expandReachPlans = [
    {
      subheading: "Optimize Your Talent Fit",
      heading: (
        <>
          AI Fitment Analysis<span tw="text-blue-700"></span>
        </>
      ),
      description:
        "Find the ideal candidates for your team with our AI-powered Fitment Analysis tool. This advanced solution assesses applicants based on their skills, experience, delivering a thorough evaluation to ensure alignment with your organizational or client needs. Streamline your hiring process and improve decision-making with actionable, data-driven insights and recommendations.",
      imageSrc: analysis,
      buttonRounded: true,
      primaryButtonText: "About Us",
      primaryButtonUrl: "/about",
      buttonRounded: true,
      imageRounded: true,
      imageBorder: false,
      imageShadow: false,
      imageCss: null,
      imageDecoratorBlob: false,
      imageDecoratorBlobCss: null,
      textOnLeft: true,
    },
  ];

  const accelerateHiringPlans = [
    {
      subheading: "Harness the Power of AI",
      heading: (
        <>
          AI Video Assessment<span tw="text-blue-700"></span>
        </>
      ),
      description:
        "Gain invaluable insights using our cutting-edge AI video assessment tool. This technology offers a thorough analysis of candidate responses, examining both verbal communication and technical cues. Streamline your hiring process with objective insights and recommendations,ensuring you efficiently identify the best fit for your team.",
      imageSrc: video,
      buttonRounded: true,
      primaryButtonText: "Contact Us",
      primaryButtonUrl: "/contact",
      buttonRounded: true,
      imageRounded: true,
      imageBorder: false,
      imageShadow: false,
      imageCss: null,
      imageDecoratorBlob: false,
      imageDecoratorBlobCss: null,
      textOnLeft: false,
    },
  ];

  const plansList = [
    defaultPlans,
    yearlyPlans,
    expandReachPlans,
    accelerateHiringPlans,
  ];

  const [activeDurationIndex, setActiveDurationIndex] = useState(0);

  return (
    <Container>
      <ContentWithPaddingXl>
        <HeaderContainer>
          {subheading && <Subheading>{subheading}</Subheading>}
          <Heading>{heading}</Heading>
          {description && <Description>{description}</Description>}
          <PlanDurationSwitcher>
            <Slider activeDurationIndex={activeDurationIndex} />
            {planDurations.map((planDuration, index) => (
              <SwitchButton
                active={activeDurationIndex === index}
                key={index}
                onClick={() => setActiveDurationIndex(index)}
              >
                {planDuration.switcherText}
              </SwitchButton>
            ))}
          </PlanDurationSwitcher>
        </HeaderContainer>
        <PlansContainer>
          {plansList[activeDurationIndex].map((plan, index) => (
            <TwoColumn key={index}>
              <ImageColumn>
                <Image
                  css={plan.imageCss}
                  src={plan.imageSrc}
                  imageBorder={plan.imageBorder}
                  imageShadow={plan.imageShadow}
                  imageRounded={plan.imageRounded}
                />
                {plan.imageDecoratorBlob && (
                  <DecoratorBlob css={plan.imageDecoratorBlobCss} />
                )}
              </ImageColumn>
              <TextColumn textOnLeft={plan.textOnLeft}>
                <TextContent>
                  <Subheading>{plan.subheading}</Subheading>
                  <Heading>{plan.heading}</Heading>
                  <Description>{plan.description}</Description>
                  <PrimaryButton
                    buttonRounded={plan.buttonRounded}
                    as="a"
                    href={plan.primaryButtonUrl}
                  >
                    {plan.primaryButtonText}
                  </PrimaryButton>
                </TextContent>
              </TextColumn>
            </TwoColumn>
          ))}
        </PlansContainer>
      </ContentWithPaddingXl>
      <DecoratorBlob1 />
      <DecoratorBlob2 />
    </Container>
  );
};
