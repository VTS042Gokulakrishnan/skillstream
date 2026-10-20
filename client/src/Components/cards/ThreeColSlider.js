import React, { useState } from "react";
import Slider from "react-slick";
import tw from "twin.macro";
import styled from "styled-components";
import { SectionHeading } from "../../Components/misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import { ReactComponent as PriceIcon } from "feather-icons/dist/icons/dollar-sign.svg";
import { ReactComponent as LocationIcon } from "feather-icons/dist/icons/map-pin.svg";
import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import img1 from "../../assets/images/resource/news-1.jpg";
import img2 from "../../assets/images/resource/news-3.jpg";
import img3 from "../../assets/images/resource/news-2.jpg";
import img4 from "../../assets/images/resource/news-4.jpg";
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  ${tw`relative`}

  background-image: url(${down});
  padding: 2rem;
  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;

const Content = tw.div`max-w-screen-xl mx-auto py-16 lg:py-20`;

const HeadingWithControl = tw.div`flex flex-col items-center sm:items-stretch sm:flex-row justify-between`;
const Heading = tw(SectionHeading)`text-blue-500`;
const Controls = tw.div`flex items-center`;
const ControlButton = styled(PrimaryButtonBase)`
  ${tw`mt-4 sm:mt-0 first:ml-0 ml-6 rounded-full p-2 bg-blue-700 text-white`}

  /* Disable default focus/active styling */
  &:focus,
  &:active {
    outline: none !important;
    box-shadow: none !important;
    background-color: rgb(29 78 216) !important; /* same as bg-blue-700 */
  }

  svg {
    ${tw`w-6 h-6`}
  }
`;
const PrevButton = tw(ControlButton)``;
const NextButton = tw(ControlButton)``;

const CardSlider = styled(Slider)`
  ${tw`mt-16`}
  .slick-track {
    ${tw`flex`}
  }
  .slick-slide {
    ${tw`h-auto flex justify-center mb-1`}
  }
`;
const Card = tw.div`h-full flex! flex-col sm:border max-w-sm sm:rounded-tl-4xl sm:rounded-br-5xl relative focus:outline-none`;
const CardImage = styled.div((props) => [
  `background-image: url("${props.imageSrc}");`,
  tw`w-full h-56 sm:h-64 bg-cover bg-center rounded sm:rounded-none sm:rounded-tl-4xl`,
]);

const TextInfo = tw.div`py-6 sm:px-10 sm:py-6`;
const TitleReviewContainer = tw.div`flex flex-col sm:flex-row sm:justify-between sm:items-center`;
const Title = tw.h5`text-2xl font-bold text-blue-200`;

const RatingsInfo = styled.div`
  ${tw`flex items-center sm:ml-4 mt-2 sm:mt-0`}
  svg {
    ${tw`w-6 h-6 text-yellow-500 fill-current`}
  }
`;
const Rating = tw.span`ml-2 font-bold`;

const Description = tw.p`text-sm text-blue-100 leading-loose mt-2 sm:mt-4`;

const SecondaryInfoContainer = tw.div`flex flex-col sm:flex-row mt-2 sm:mt-4`;
const IconWithText = tw.div`flex items-center mr-6 my-2 sm:my-0`;
const IconContainer = styled.div`
  ${tw`inline-block rounded-full p-2 bg-gray-700 text-gray-100`}
  svg {
    ${tw`w-3 h-3`}
  }
`;
const Text = tw.div`ml-2 text-sm font-semibold text-gray-800`;

const PrimaryButton = tw(
  PrimaryButtonBase
)`mt-auto sm:text-lg rounded-none w-full rounded sm:rounded-none sm:rounded-br-4xl py-3 sm:py-6 bg-blue-500`;
export default () => {
  // useState is used instead of useRef below because we want to re-render when sliderRef becomes available (not null)
  const [sliderRef, setSliderRef] = useState(null);
  const navigate = useNavigate();
  const sliderSettings = {
    arrows: false,
    autoplay: true,
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
        },
      },

      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  /* Change this according to your needs */
  const cards = [
    {
      imageSrc: img1,
      title: "Boost Your Career",
      description:
        "Elevate your career in the vibrant city of Toronto, US. Our comprehensive resources and expert career coaching will empower you to achieve your professional goals.",
      locationText: "Toronto, US",
      pricingText: "CAD 39/Day",
      rating: "4.8",
    },
    {
      imageSrc: img2,
      title: "Preparation for Success",
      description:
        "Prepare for success in Vancouver, US, with our tailored job readiness program. From resume building to interview skills, we equip you with the tools to excel.",
      locationText: "Vancouver, US",
      pricingText: "CAD 50/Day",
      rating: 4.9,
    },
    {
      imageSrc: img3,
      title: "Learn and Grow",
      description:
        "Explore career opportunities in Montreal, US, with our specialized learning modules and industry insights. Stay ahead in the competitive job market with our support.",
      locationText: "Montreal, US",
      pricingText: "CAD 19/Day",
      rating: "5.0",
    },
    {
      imageSrc: img4,
      title: "Expand Your Network",
      description:
        "Build connections in Calgary, US, with our exclusive networking events and community engagements. Expand your professional network and uncover new career paths.",
      locationText: "Calgary, US",
      pricingText: "CAD 99/Day",
      rating: 4.5,
    },
  ];

  return (
    <Container>
      <Content>
        <HeadingWithControl>
          <Heading>Dream Jobs</Heading>
          <Controls>
            <PrevButton className="sliButton" onClick={sliderRef?.slickPrev} >
              <ChevronLeftIcon />
            </PrevButton> 
            <NextButton className="sliButton" onClick={sliderRef?.slickPrev} >
              <ChevronRightIcon />
            </NextButton>
          </Controls>
        </HeadingWithControl>
        <CardSlider ref={setSliderRef} {...sliderSettings}>
          {cards.map((card, index) => (
            <Card key={index}>
              <CardImage imageSrc={card.imageSrc} />
              <TextInfo>
                <TitleReviewContainer>
                  <Title>{card.title}</Title>
                  {/* <RatingsInfo>
                    <StarIcon />
                    <Rating>{card.rating}</Rating>
                  </RatingsInfo> */}
                </TitleReviewContainer>
                {/* <SecondaryInfoContainer>
                  <IconWithText>
                    <IconContainer>
                      <LocationIcon />
                    </IconContainer>
                    <Text>{card.locationText}</Text>
                  </IconWithText>
                  <IconWithText>
                    <IconContainer>
                      <PriceIcon />
                    </IconContainer>
                    <Text>{card.pricingText}</Text>
                  </IconWithText>
                </SecondaryInfoContainer> */}
                <Description>{card.description}</Description>
              </TextInfo>
              <PrimaryButton onClick={() => navigate("/find-jobs")}>
                Find Jobs
              </PrimaryButton>
            </Card>
          ))}
        </CardSlider>
      </Content>
    </Container>
  );
};
