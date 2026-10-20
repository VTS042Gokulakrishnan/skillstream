import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
//eslint-disable-next-line
// import { css } from "styled-components/macro"; 
import { SectionHeading, Subheading as SubheadingBase } from "../../Components/misc/Headings";
import { SectionDescription } from "../../Components/misc/Typography";

import defaultCardImage from "images/shield-icon.svg";

import { ReactComponent as SvgDecoratorBlob3 } from "images/svg-decorator-blob-3.svg";

import SupportIconImage from "images/support-icon.svg";
import ShieldIconImage from "images/shield-icon.svg";
import CustomizeIconImage from "images/customize-icon.svg";
import FastIconImage from "images/fast-icon.svg";
import ReliableIconImage from "images/reliable-icon.svg";
import SimpleIconImage from "images/simple-icon.svg";
import bgImg from "../../assets/luxury-gradient-blue-background-blue-with-black-vignette-studio-banner-wallpaper-hd-images.jpg"
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg"
// const Container = tw.div`relative`;

const ThreeColumnContainer = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center max-w-screen-lg mx-auto py-20 md:py-24`}
`;
const Subheading = tw(SubheadingBase)`mb-4 text-blue-500`;
const Heading = tw(SectionHeading)`w-full text-gray-100 `;
const Description = tw(SectionDescription)`w-full text-gray-100 text-center `;

const VerticalSpacer = tw.div`mt-10 w-full`

const Column = styled.div`
  ${tw`md:w-1/2 lg:w-1/3 max-w-sm`}
`;

const Card = styled.div`
  ${tw`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left h-full mx-4 px-2 py-8`}
  .imageContainer {
    ${tw`border text-center rounded-full p-5 flex-shrink-0`}
    img {
      ${tw`w-6 text-blue-500 h-6`}
    }
  }

  .textContainer {
    ${tw`sm:ml-4 mt-4 sm:mt-2`}
  }

  .title {
    ${tw`mt-4 tracking-wide text-blue-500 font-bold text-2xl leading-none`}
  }

  .description {
    ${tw`mt-1 sm:mt-4 font-medium text-gray-100 leading-loose`}
  }
`;
 const Container = styled.div`
  ${tw`relative`}

       background-image: url(${down});
  padding: 2rem;
  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;
const DecoratorBlob = styled(SvgDecoratorBlob3)`
  ${tw`pointer-events-none absolute right-0 bottom-0 w-64 opacity-25 transform translate-x-32 translate-y-48 `}
`;



export default ({ cards = null, heading = "Amazing Features", subheading = "Features", description = "Discover the unique benefits of using our job board for hiring candidates and posting jobs." }) => {
  /*
   * This componets has an array of object denoting the cards defined below. Each object in the cards array can have the key (Change it according to your need, you can also add more objects to have more cards in this feature component) or you can directly pass this using the cards prop:
   *  1) imageSrc - the image shown at the top of the card
   *  2) title - the title of the card
   *  3) description - the description of the card
   *  If a key for a particular card is not provided, a default value is used
   */

  const defaultCards = [
    {
      imageSrc: ShieldIconImage,
      title: "Secure",
      description: "We prioritize your safety by partnering only with vendors that offer top-notch security measures."
    },
    { imageSrc: SupportIconImage, title: "24/7 Support",
    description: "Our support team is available around the clock to assist you with any issues or questions."

     },
    { imageSrc: CustomizeIconImage, title: "Customizable",
    description: "Tailor your job listings and candidate searches to meet your specific needs and preferences."

     },
    { imageSrc: ReliableIconImage, title: "Reliable" ,
    description: "Count on our platform to be up and running whenever you need it, ensuring a seamless hiring process."

    },
    { imageSrc: FastIconImage, title: "Fast",
    description: "Experience quick and job postings and candidate applications, speed up your hiring timeline."

     },
    { imageSrc: SimpleIconImage, title: "Easy",
    description: "Our user-friendly interface makes it simple to navigate, post jobs, and find the right candidates effortlessly."

     }
  ];

  if (!cards) cards = defaultCards;

  return (
    <Container>
      <ThreeColumnContainer>
        {subheading && <Subheading>{subheading}</Subheading>}
        <Heading>{heading}</Heading>
        {description && <Description>{description}</Description>}
        <VerticalSpacer />
        {cards.map((card, i) => (
          <Column key={i}>
            <Card>
              <span className="imageContainer">
                <img src={card.imageSrc || defaultCardImage} alt="" />
              </span>
              <span className="textContainer">
                <span className="title">{card.title || "Fully Secure"}</span>
                <p className="description">
                  {card.description || "Lorem ipsum donor amet siti ceali ut enim ad minim veniam, quis nostrud."}
                </p>
              </span>
            </Card>
          </Column>
        ))}
      </ThreeColumnContainer>
      <DecoratorBlob />
    </Container>
  );
};
