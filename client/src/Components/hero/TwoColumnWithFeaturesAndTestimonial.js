import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import tw from "twin.macro";
import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import HeaderBase, {
  NavLinks,
  NavLink,
  PrimaryLink,
} from "../../Components/headers/light";
import { SectionHeading } from "../../Components/misc/Headings";
import { SectionDescription } from "../../Components/misc/Typography";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import { ContentWithVerticalPadding } from "../../Components/misc/Layouts";
import { ReactComponent as CheckboxIcon } from "feather-icons/dist/icons/check-circle.svg";
import { ReactComponent as QuotesLeftIconBase } from "images/quotes-l.svg";
import { ReactComponent as SvgDecoratorBlob1 } from "images/dot-pattern.svg";
import sideImg from "../../assets/businessman-showing-virtual-graphic-human-icon-hr-human-resources-recruitment-team-staff-management-business-concept.jpg";
import bgImg from "../../assets/luxury-gradient-blue-background-blue-with-black-vignette-studio-banner-wallpaper-hd-images.jpg";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";
import up from "../../assets/3314891.jpg";

const GlobalStyle = createGlobalStyle`
  :root {
    --size: 120px;
    --speed: 2s;
  }

  .loader {
    width: var(--size);
    height: var(--size);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .loader__inner {
    position: absolute;
    display: block;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    box-shadow: 0 -20px 0 0 rgba(0, 123, 255, 0.9),
                -15px 10px 0 0 rgba(0, 159, 255, 0.6),
                15px 10px 0 0 rgba(0, 191, 255, 0.9);
    animation: rotate var(--speed) linear infinite;
  }
  .loader__inner:nth-child(2) {
    box-shadow: 15px -10px 0 0 rgba(0, 191, 255, 0.6),
                -15px -10px 0 0 rgba(0, 123, 255, 0.6),
                0 20px 0 0 rgba(0, 191, 255, 0.6);
    animation: rotate__other var(--speed) linear infinite;
  }
  @keyframes rotate {
    50% {
      transform: scale(1.1) rotate(360deg);
    }
    100% {
      transform: scale(1) rotate(720deg);
    }
  }

  @keyframes rotate__other {
    50% {
      transform: scale(1.2) rotate(-360deg);
    }
    100% {
      transform: scale(1) rotate(-720deg);
    }
  }

  .loader::after {
    content: "AI";
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--size);
    height: var(--size);
    color: #fff;
    font-size: 2rem;
    font-weight: bold;
    border-radius: 50%;
    text-align: center;
    line-height: var(--size);
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  }
`;

const Header = tw(HeaderBase)`max-w-none`;
const Row = tw.div`flex flex-col lg:flex-row justify-between items-center lg:pt-16 max-w-screen-2xl mx-auto sm:px-8`;
const Column = tw.div``;
const TextColumn = tw(
  Column
)`mr-auto lg:mr-0 max-w-lg lg:max-w-xl xl:max-w-2xl`;
const Heading = tw(
  SectionHeading
)`text-left text-blue-200 leading-snug xl:text-4xl`;
const Description = tw(
  SectionDescription
)`mt-4 lg:text-base text-white max-w-lg`;
const PrimaryButton = tw(
  PrimaryButtonBase
)`mt-8 inline-block w-56 tracking-wide text-center py-5 bg-blue-500`;
const FeatureList = tw.ul`mt-12 leading-loose`;
const Feature = tw.li`flex items-center`;
const FeatureIcon = tw(CheckboxIcon)`w-5 h-5 text-blue-500`;
const FeatureText = tw.p`ml-2 font-medium text-gray-100`;
const ImageColumn = tw(Column)`ml-auto lg:mr-0 relative mt-16 lg:mt-0 lg:ml-32`;
const ImageContainer = tw.div`relative z-40 transform xl:-translate-x-24 xl:-translate-y-5`;
const Image = tw.img`max-w-full w-88 rounded-t sm:rounded relative z-20`;
const Offsetbackground = tw.div`absolute inset-0 bg-gray-300 rounded xl:-mb-8`;
const ImageDecoratorBlob = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none z-10 absolute right-0 bottom-0 transform translate-x-10 translate-y-10 h-32 w-32 opacity-25 text-gray-900 fill-current`}
`;
const Testimonial = tw.div`max-w-sm rounded-b md:rounded-none relative sm:absolute bottom-0 inset-x-0 z-20 px-8 py-6 sm:px-10 sm:py-8 bg-blue-900 text-gray-400 font-medium transform md:-translate-x-32 text-sm leading-relaxed md:-mr-16 xl:mr-0`;
const QuotesLeftIcon = tw(
  QuotesLeftIconBase
)`w-16 h-16 md:w-12 md:h-12 absolute top-0 left-0 text-gray-100 md:text-red-500 transform translate-x-1 md:-translate-x-1/2 md:-translate-y-5 opacity-10 md:opacity-100`;
const Quote = tw.blockquote``;
const CustomerName = tw.p`mt-4 font-bold text-blue-500`;
const CustomerCompany = tw.p`mt-1 text-sm text-gray-500`;

const Container = styled.div`
  ${tw`relative`}
  background-image: url(${up});
  padding: 4rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export default function TwoColumnWithFeaturesAndTestimonial({
  heading = "Maximize Your Hiring Process with Skill Stream",
  description = "Struggling to find the right candidate? Skill Stream’s AI resume search simplifies hiring by matching you with top talent. Our technology analyzes resumes to ensure you get the best candidates. Save time, cut costs, and boost recruitment efficiency with Skill Stream AI. Build a team of exceptional professionals.",
  imageSrc = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
  imageDecoratorBlob = true,
  primaryButtonUrl = "/candidates-list",
  primaryButtonText = "Find Candidates",
  buttonRounded = true,
  features = [
    "AI Resume Search",
    "AI Video Assessments",
    "AI Fitment Analysis",
  ],
  testimonial = {
    quote:
      "Visit Skill Stream to discover more exciting opportunities and find your perfect job match today.",
    customerName: "Emily Johnson",
    customerCompany: "Innovate Corp",
  },
}) {
  const [modalType, setModalType] = useState("login");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const buttonRoundedCss = buttonRounded && tw`rounded-full`;
  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="/#">About</NavLink>
      <NavLink href="/#">Blog</NavLink>
      <NavLink href="/#">Pricing</NavLink>
      <NavLink href="/#">Contact Us</NavLink>
      <NavLink href="/#">Testimonials</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      <NavLink href="/#" tw="lg:ml-12!">
        Login
      </NavLink>
      <PrimaryLink css={buttonRoundedCss} href="/#">
        Sign Up
      </PrimaryLink>
    </NavLinks>,
  ];

  return (
    <>
      <GlobalStyle />
      <Header />
      <Container>
        <div className="loader">
          <span className="loader__inner"></span>
          <span className="loader__inner"></span>
        </div>
        <ContentWithVerticalPadding>
          <Row>
            <TextColumn>
              <Heading>{heading}</Heading>
              <Description>{description}</Description>
              <PrimaryButton
                as="a"
                href={primaryButtonUrl}
                css={buttonRoundedCss}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  showModal("findCandidates"); // Use a different type if needed
                }}
              >
                {primaryButtonText}
              </PrimaryButton>

              <FeatureList>
                {features.map((feature, index) => (
                  <Feature key={index}>
                    <FeatureIcon />
                    <FeatureText>{feature}</FeatureText>
                  </Feature>
                ))}
              </FeatureList>
            </TextColumn>
            <ImageColumn>
              <ImageContainer>
                <Image src={sideImg} />
                {imageDecoratorBlob && <ImageDecoratorBlob />}
              </ImageContainer>
              {/* <Testimonial>
                <QuotesLeftIcon />
                <Quote>{testimonial.quote}</Quote>
                <CustomerName>{testimonial.customerName}</CustomerName>
                <CustomerCompany>{testimonial.customerCompany}</CustomerCompany>
              </Testimonial> */}
            </ImageColumn>
          </Row>
        </ContentWithVerticalPadding>
      </Container>
      {isModalOpen && (
        <>
          {modalType === "findCandidates" && (
            <Login
              modalType={modalType}
              setModalType={setModalType}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              showModal={showModal}
            />
          )}
          {modalType === "register" && (
            <Register
              modalType={modalType}
              setModalType={setModalType}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              showModal={showModal}
            />
          )}
          {confirmModal && (
            <ConfirmModal
              confirmModal={confirmModal}
              setConfirmModal={setConfirmModal}
              showModal={showModal}
            />
          )}
          {forgotModal && (
            <ForgotPassword
              forgotModal={forgotModal}
              setForgotModal={setForgotModal}
              showModal={showModal}
            />
          )}
        </>
      )}
    </>
  );
}
