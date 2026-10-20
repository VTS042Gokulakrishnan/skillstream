import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import tw from "twin.macro";
import {
  SectionHeading,
  Subheading as SubheadingBase,
} from "../../Components/misc/Headings";
import { SectionDescription } from "../../Components/misc/Typography";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import { ContentWithPaddingXl } from "../../Components/misc/Layouts";
import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-6.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";
import bgImg from "../../assets/luxury-gradient-blue-background-blue-with-black-vignette-studio-banner-wallpaper-hd-images.jpg";
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg";
// Keyframes for jumping animation
const jumpAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Styled-components
const HeaderContainer = tw.div`w-full flex flex-col items-center`;
const Subheading = tw(SubheadingBase)`mb-4 text-blue-500`;
const Heading = tw(SectionHeading)`w-full text-gray-100`;
const Description = tw(SectionDescription)`w-full text-gray-100 text-center`;

const DurationSwitcherContainer = styled.div`
  ${tw`block w-full max-w-xl sm:inline-block sm:w-auto border-2 rounded-full px-1 py-1 mt-8 relative flex items-center justify-between`}
  position: relative;
  overflow: hidden;
  border-color: #4299e1; /* Match border color with button */
  background: rgba(0, 0, 255, 0.1); /* Light blue background */
`;

const Slider = styled.div`
  ${tw`absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full transition-transform duration-300 ease-out`}
  width: 50%;
  transform: ${(props) =>
    props.activeDurationIndex === 0 ? "translateX(0)" : "translateX(100%)"};
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Smooth elastic transition */
  box-shadow: 0 0 20px #4299e1; /* Box shadow for depth */
  z-index: 1;
`;

const SwitchButton = styled.button`
  ${tw`w-full sm:w-auto px-4 sm:px-8 py-3 rounded-full focus:outline-none text-sm font-bold text-gray-700 transition duration-300 relative z-10`}
  ${(props) =>
    props.active
      ? css`
          ${tw`text-white`}
          color: #ffffff; /* Active text color */
        `
      : css`
          ${tw`hover:text-gray-900`}
          color: #4299e1;
        `}
`;
const Arrow = styled.div`
  ${tw`absolute top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ease-out`}
  ${(props) =>
    props.activeDurationIndex === 0
      ? `right: 8px; transform: rotate(180deg);`
      : `left: 8px;`}

  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff; /* Ensures the color is white */
  z-index: 2;

  /* Apply jumping animation */
  animation: ${jumpAnimation} 1s infinite;
`;

const Plan = styled.div`
  ${tw`w-full max-w-72 mt-16 md:mr-12 md:last:mr-0 text-center px-8 rounded-lg relative text-white  flex flex-col shadow-raised`}
  ${(props) =>
    props.featured &&
    css`
      ${tw`border-2 border-gray-200 shadow-none`}
    `}

     background-image: url(${bgImg});

  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
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
  background-image: url(${bgImg});

  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;

const PlanFeatures = styled.div`
  ${tw`flex flex-col -mx-8 px-8 py-8 flex-1 text-sm`}
  .feature {
    ${tw`mt-5 first:mt-0 font-semibold text-gray-500`}
  }
`;

const PlanAction = tw.div`px-4 pb-8`;
const BuyNowButton = styled(PrimaryButtonBase)`
  ${tw`rounded-full tracking-wider py-4 w-full text-sm hover:shadow-xl transform hocus:translate-x-px hocus:-translate-y-px focus:shadow-outline bg-blue-500`}
`;

const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-64 w-64 opacity-25 transform -translate-x-2/3 -translate-y-1/2`}
`;

const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
  ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-25 transform translate-x-2/3 translate-y-1/2 fill-current text-teal-300`}
`;

// Adding missing PlansContainer styled component
const PlansContainer = tw.div`flex flex-wrap justify-center`;

const Container = styled.div`
  ${tw`relative`}
  background-image: url(${down});

  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
  min-height: 100vh; /* Ensure the container covers full viewport height */
`;
// New Styled Component for the Free Trial Button
const FreeTrialButton = styled(PrimaryButtonBase)`
  ${tw`mt-6 mb-4 rounded text-sm rounded-full shadow-lg transform transition-all duration-300 ease-in-out`}
  background: linear-gradient(to right, #4299e1, #0070f3); /* Custom Gradient */
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.5); /* Shadow for emphasis */
  transition: all 0.3s ease-in-out; /* Smooth transition for hover effects */
  border-radius: 10px;

  &:hover {
    background: linear-gradient(
      to right,
      #4299e1,
      #0056a1
    ); /* Darker Gradient */
    box-shadow: 0 6px 20px rgba(66, 153, 225, 0.7); /* Enhanced Shadow */
    transform: translateY(-2px); /* Slight lift on hover */
  }
`;

const DurationSwitcher = ({
  durationIndex,
  setDurationIndex,
  planDurations,
}) => (
  <DurationSwitcherContainer>
    <Slider activeDurationIndex={durationIndex} />
    <SwitchButton
      active={durationIndex === 0}
      onClick={() => setDurationIndex(0)}
    >
      {planDurations[0].switcherText}
    </SwitchButton>
    <SwitchButton
      active={durationIndex === 1}
      onClick={() => setDurationIndex(1)}
    >
      {planDurations[1].switcherText}
    </SwitchButton>
  </DurationSwitcherContainer>
);

// Main component
export default ({
  subheading = "Pricing",
  heading = "Flexible Plans.",
  description = "Choose the best package to post your job openings and attract the best candidates.",
  plans = null,
  primaryButtonText = "Post Job",
  primaryButtonText1 = "Free Trial",
  planDurations = [
    {
      text: "month",
      switcherText: "Job Posting And Resume Search",
    },
    {
      text: "per Job",
      switcherText: "Job Advertising Package",
    },
  ],
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  let role = localStorage.getItem("Role");
  let token = localStorage.getItem("token");

  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const openModal = () => {
    if (!token) {
      showModal("login");
    } else {
      navigate("/pricing");
    }
  };

  const defaultPlans = [
    {
      name: "Try With AI",
      durationPrices: ["$249"],
      mainFeature: "Jobs with AI Search",
      features: [
        "Unlimited Job Postings",
        "Unlimited access to our Database",
        "(Available only for US)",
        "AI Resume Search",
        "AI Fitment Analysis",
        "AI Video Interview",
      ],
      featured: true,
    },
    // {
    //   name: "Recommended",
    //   durationPrices: ["$299"],
    //   mainFeature: "Job Posting And Resume Search",
    //   features: [
    //     "Unlimited access to Database",
    //     "Unlimited job posting",
    //     "Email Support",
    //   ],
    //   featured: true,
    // },
  ];

  const yearlyPlans = [
    {
      name: "Basic",
      durationPrices: ["$49"],
      mainFeature: "Recommended",
      features: [
        "1 Job Posting",
        " AI Fitment Analysis",
        "AI Video Interview",
        "30 Days Visibility",
        "Sourcing support from Skillstream team",
        "Email Support",
      ],
      featured: true,
    },
    {
      name: "Standard",
      durationPrices: ["$99"],
      mainFeature: "Standard Plan",
      features: [
        "3 Job Posting",
        "30 Days Visibility",
        " AI Fitment Analysis",
        "AI Video Interview",
        "Sourcing support from Skillstream team ",
        "Email Support",
      ],
      featured: true,
    },
    {
      name: "Premium",
      durationPrices: ["$189"],
      mainFeature: "Premium Plan",
      features: [
        "5 Job Posting",
        " AI Fitment Analysis",
        "AI Video Interview",
        "30 Days Visibility",
        "Sourcing support from Skillstream team",
        "Phone Support",
      ],
      featured: true,
    },
  ];

  const [activeDurationIndex, setActiveDurationIndex] = useState(0);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalState, setModalState] = useState("login"); // Options: "login", "register", "forgotPassword"

  const handleFreeTrialClick = () => {
    setIsConfirmModalOpen(true);
    setModalState("register"); // Automatically open the register modal
  };

  return (
    <Container>
      <ContentWithPaddingXl>
        <HeaderContainer>
          <Subheading>{subheading}</Subheading>
          <Heading>{heading}</Heading>
          <Description>{description}</Description>

          {/* Free Trial Button */}
          <FreeTrialButton onClick={() => openModal()}>
            Start Free Trial
          </FreeTrialButton>

          <DurationSwitcher
            durationIndex={activeDurationIndex}
            setDurationIndex={setActiveDurationIndex}
            planDurations={planDurations}
          />
        </HeaderContainer>
        <PlansContainer>
          {(activeDurationIndex === 0 ? defaultPlans : yearlyPlans).map(
            (plan, index) => (
              <Plan key={index} featured={plan.featured}>
                <PlanHeader>
                  <span className="priceAndDuration">
                    <span className="price">{plan.durationPrices[0]}</span>
                    {/* <span className="slash"> / </span>
                    <span className="duration">
                      {planDurations[activeDurationIndex].text}
                    </span> */}
                  </span>
                  <span className="name">{plan.name}</span>
                  <span className="mainFeature">{plan.mainFeature}</span>
                </PlanHeader>
                <PlanFeatures>
                  {plan.features.map((feature, index) => (
                    <span key={index} className="feature">
                      {feature}
                    </span>
                  ))}
                </PlanFeatures>
                <PlanAction>
                  <BuyNowButton
                    style={{
                      display:
                        "inline-block" /* Ensures proper spacing and hover effects */,
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "1.5rem" /* Equivalent to Tailwind's mt-6 */,
                      marginBottom: "1rem" /* Equivalent to Tailwind's mb-4 */,
                      fontSize:
                        "0.875rem" /* Equivalent to Tailwind's text-sm */,
                      borderRadius:
                        "9999px" /* Equivalent to Tailwind's rounded-full */,
                      padding:
                        "0.5rem 1rem" /* Adding padding for better clickability */,
                      boxShadow:
                        "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
                      transition:
                        "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
                      borderRadius: "10px" /* Custom border radius */,
                      background:
                        "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
                      color: "#fff" /* Text color */,
                      cursor: "pointer" /* Change cursor on hover */,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(to right, #4299e1, #0056a1)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(66, 153, 225, 0.7)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "linear-gradient(to right, #4299e1, #0070f3)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 15px rgba(66, 153, 225, 0.5)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                   
                    onClick={() => openModal()}
                  >
                    {primaryButtonText}
                  </BuyNowButton>
                </PlanAction>
              </Plan>
            )
          )}
        </PlansContainer>
      </ContentWithPaddingXl>
      <DecoratorBlob1 />
      <DecoratorBlob2 />
      {forgotModal && (
        <ForgotPassword
          forgotModal={forgotModal}
          setForgotModal={setForgotModal}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setModalType={setModalType}
        />
      )}
      {confirmModal && (
        <ConfirmModal
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
        />
      )}
      {isModalOpen && (
        <div>
          {modalType === "login" ? (
            <div>
              <Login
                isModalOpen={isModalOpen}
                modalType={modalType}
                setIsModalOpen={setIsModalOpen}
                setModalType={setModalType}
                showModal={showModal}
                confirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                forgotModal={forgotModal}
                setForgotModal={setForgotModal}
              />
            </div>
          ) : (
            <Register
              isModalOpen={isModalOpen}
              modalType={modalType}
              setIsModalOpen={setIsModalOpen}
              setModalType={setModalType}
            />
          )}
        </div>
      )}
    </Container>
  );
};
