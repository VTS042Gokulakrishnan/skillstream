import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import Slider from "react-slick"; // Import Slider from react-slick
// import { css } from "styled-components/macro";  //eslint-disable-line
import { SectionHeading, Subheading as SubheadingBase } from "../../Components/misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import StatsIllustrationSrc from "images/stats-illustration.svg";
import PracticeInterviewImageSrc from "../../assets/front-view-smiley-woman-desk-giving-thumbs-up.jpg"; // Ensure you have this image
import { ReactComponent as SvgDotPattern } from "images/dot-pattern.svg";
import up from "../../assets/image.png";
// Import in your component file
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";


// Styled Components
const Container = styled.div`
  ${tw`relative`}
  background-image: url(${up});
  padding: 2rem;
  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;

const TwoColumn = tw.div`flex flex-col md:flex-row justify-between max-w-screen-xl mx-auto py-20 md:py-24`;
const Column = tw.div`w-full max-w-md mx-auto md:max-w-none md:mx-0`;
const ImageColumn = tw(Column)`md:w-5/12 flex-shrink-0 h-80 md:h-auto relative`;
const TextColumn = styled(Column)((props) => [
  tw`md:w-7/12 mt-16 md:mt-0`,
  props.textOnLeft
    ? tw`md:mr-12 lg:mr-16 md:order-first`
    : tw`md:ml-12 lg:ml-16 md:order-last`,
]);

const Image = styled.div((props) => [
  `background-image: url("${props.imageSrc}");`,
  tw`rounded bg-contain bg-no-repeat bg-center h-full`,
]);

const TextContent = tw.div`lg:py-8 text-center md:text-left`;

const Subheading = tw(SubheadingBase)`text-center md:text-left text-blue-200`;
const Heading = tw(SectionHeading)`mt-4 font-black text-blue-500 text-left text-3xl sm:text-4xl lg:text-5xl text-center md:text-left leading-tight`;
const Description = tw.p`mt-4 text-center md:text-left text-sm md:text-base lg:text-lg font-medium leading-relaxed text-blue-100`;

const Statistics = tw.div`flex flex-col items-center sm:block text-center md:text-left mt-4`;
const Statistic = tw.div`text-left sm:inline-block sm:mr-12 last:mr-0 mt-4`;
const Value = tw.div`font-bold text-lg sm:text-xl lg:text-2xl text-blue-500 tracking-wide`;
const Key = tw.div`font-medium text-blue-700`;

const PrimaryButton = tw(PrimaryButtonBase)`mt-8 md:mt-10 text-sm inline-block mx-auto md:mx-0 bg-blue-500`;

const DecoratorBlob = styled(SvgDotPattern)((props) => [
  tw`w-20 h-20 absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 fill-current text-blue-500 -z-10`,
]);

// Slider Container
const  SliderContainer = tw.div`relative bg-white `;

// Slider Settings
const carouselSettings = {
  // dots: true,
  infinite: true,
  speed: 500,
  // arrows: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000, // 5 seconds
};

// Main Component
export default ({
  slides = [
    {
      subheading: "Our Track Record",
      heading: (
        <>
          Discover Your Future <wbr /> at <span tw="text-primary-500">Skill Stream.</span>
        </>
      ),
      description:
        "Are you tired of searching through endless job listings, hoping to find the perfect match for your skills and aspirations? Look no further! At Skill Stream, we specialize in connecting job seekers like you with opportunities that align with your interests, qualifications, and career goals.",
      primaryButtonText: "Find Jobs",
      primaryButtonUrl: "/find-jobs",
      imageSrc: StatsIllustrationSrc,
      textOnLeft: false,
      statistics: [
        { key: "Jobs", value: "2282+" },
        { key: "Candidates", value: "3891+" },
        { key: "Country", value: "50+" },
      ],
      imageDecoratorBlob: true,
    },
    {
      subheading: "Practice Interview",
      heading: (
        <>
          Prepare for Success <wbr /> with <span tw="text-primary-500">Skill Stream.</span>
        </>
      ),
      description:
        "Boost your confidence and improve your interview skills with our comprehensive practice interview sessions. Get feedback from experts and refine your techniques to ace your next job interview.Elevate your confidence and sharpen your interview skills with our in-depth practice sessions.",
      primaryButtonText: "Start Practicing",
      primaryButtonUrl: "/practiceInterviewLanding",
      imageSrc: PracticeInterviewImageSrc, // Ensure this image exists
      textOnLeft: true,
      statistics: [
        { key: "Sessions", value: "120+" },
        { key: "Users", value: "4500+" },
        { key: "Success Rate", value: "95%" },
      ],
      imageDecoratorBlob: false, // Adjust based on your design preference
    },
  ],
}) => {
  return (
    <SliderContainer>
      <Slider {...carouselSettings}>
        {slides.map((slide, index) => (
          <Container key={index}>
            <TwoColumn css={!slide.imageInsideDiv && tw`md:items-center`}>
              <ImageColumn css={slide.imageContainerCss}>
                {slide.imageInsideDiv ? (
                  <Image imageSrc={slide.imageSrc} css={slide.imageCss} />
                ) : (
                  <img src={slide.imageSrc} css={slide.imageCss} alt="" />
                )}
                {slide.imageDecoratorBlob && <DecoratorBlob css={slide.imageDecoratorBlobCss} />}
              </ImageColumn>
              <TextColumn textOnLeft={slide.textOnLeft}>
                <TextContent>
                  {slide.subheading && <Subheading>{slide.subheading}</Subheading>}
                  <Heading>{slide.heading}</Heading>
                  <Description>{slide.description}</Description>
                  <Statistics>
                    {slide.statistics.map((statistic, idx) => (
                      <Statistic key={idx}>
                        <Value>{statistic.value}</Value>
                        <Key>{statistic.key}</Key>
                      </Statistic>
                    ))}
                  </Statistics>
                  <PrimaryButton as="a" href={slide.primaryButtonUrl}>
                    {slide.primaryButtonText}
                  </PrimaryButton>
                </TextContent>
              </TextColumn>
            </TwoColumn>
          </Container>
        ))}
      </Slider>
    </SliderContainer>
  );
};
