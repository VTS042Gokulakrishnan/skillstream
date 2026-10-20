import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import JobSearchBar from "../JobSearchBar/JobSearchBar";
// import { css } from "styled-components/macro";  //eslint-disable-line
import sideImg from "../../assets/artificial-intelligence-chipset-circuit-board-futuristic-concept-five.jpg";
import { ReactComponent as SvgDecoratorBlob1 } from "images/dot-pattern.svg";
import Header, { NavLink, NavLinks, PrimaryLink, LogoLink, NavToggle, DesktopNavLinks } from "../headers/light.js";
import ResponsiveVideoEmbed from "../../helpers/ResponsiveVideoEmbed.js";
import bgImage from '../../assets/f3498c13-479b-4353-a965-6419fbf6f241.jpg';
// import bgImage from '../../assets/1d238ca6-f888-4260-b4b4-c01420a5e83a.jpg';

// import bgImage from '../../assets/codioful-formerly-gradienta-bKESVqfxass-unsplash.jpg';


const StyledHeader = styled(Header)`
  ${tw`pt-24 max-w-none`}
  ${'' /* , ${LogoLink} {
    ${tw`text-gray-100 hover:border-gray-300 hover:text-gray-300`}
  }
  ${NavToggle}.closed {
    ${tw`text-gray-100 hover:text-primary-500`}
  } */}
`;
// const Container = styled.div`
//   ${tw`relative -mx-8 -mt-8 bg-center bg-cover`}
//   background-image: url("https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
// `;

const Container = styled.div`
  ${tw`relative -mx-8 -mt-8 bg-center bg-cover`}
  background-image: url(${bgImage});
`;
const Column = tw.div``;
const OpacityOverlay = tw.div`z-10 absolute inset-0 bg-blue-500 opacity-25`;
const ImageColumn = tw(Column)`ml-auto lg:mr-0 relative mt-16 lg:mt-0 lg:ml-32`;
const ImageContainer = tw.div`relative z-40 transform xl:-translate-x-24 xl:-translate-y-5`;
const Image = tw.img`max-w-full w-128 rounded-t sm:rounded relative z-20`;
const HeroContainer = tw.div`z-20 relative px-4 sm:px-8 max-w-screen-xl mx-auto`;
const TwoColumn = tw.div`pt-24 pb-32 px-4 flex justify-between items-center flex-col lg:flex-row`;
const LeftColumn = tw.div`flex flex-col items-center lg:block`;
const RightColumn = tw.div`w-full sm:w-5/6 lg:w-1/2 mt-16 lg:mt-0 lg:pl-8`;

const Heading = styled.h1`
  ${tw`text-3xl text-center lg:text-left sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-100 leading-none`}
  span {
    ${tw`inline-block mt-2`}
  }
`;

const SlantedBackground = styled.span`
  ${tw`relative text-primary-500 px-4 -mx-4 py-2`}
  &::before {
    content: "";
    ${tw`absolute inset-0 bg-gray-100 transform -skew-x-12 -z-10`}
  }
`;

const Notification = tw.span`inline-block my-4 pl-3 py-1 text-gray-100 border-l-4 border-blue-500 font-medium text-sm`;

const PrimaryAction = tw.span`inline-block px-8 py-3 mt-10 text-sm sm:text-base sm:mt-16 sm:px-8 sm:py-4 bg-gray-100 text-primary-500 font-bold rounded shadow transition duration-300 hocus:bg-primary-500 hocus:text-gray-100 focus:shadow-outline`;

const StyledResponsiveVideoEmbed = styled(ResponsiveVideoEmbed)`
  padding-bottom: 56.25% !important;
  padding-top: 0px !important;
  ${tw`rounded`}
  iframe {
    ${tw`rounded bg-black shadow-xl`}
  }
`;

const JobSearchBarWrapper = styled.div`
  ${tw`mt-20`} // Adjust this margin value to increase or decrease the gap
`;

export default () => {
  // const navLinks = [
  //   <NavLinks key={1}>
  //     <NavLink href="#">
  //       About
  //     </NavLink>
  //     <NavLink href="#">
  //       Blog
  //     </NavLink>
  //     <NavLink href="#">
  //       Locations
  //     </NavLink>
  //     <NavLink href="#">
  //       Pricing
  //     </NavLink>
  //   </NavLinks>,
  //   <NavLinks key={2}>
  //     <PrimaryLink href="/#">
  //       Hire Us
  //     </PrimaryLink>
  //   </NavLinks>
  // ];

  return (
    <Container>
      <OpacityOverlay />
      <HeroContainer>
        <StyledHeader/>
        <JobSearchBarWrapper>
          <JobSearchBar />
        </JobSearchBarWrapper>
        <TwoColumn>
          <LeftColumn>
            <Notification>We have now launched operations in US.</Notification>
            <Heading>
              <span>Find your Perfect</span>
              <br />
              <SlantedBackground>Job Match</SlantedBackground>
            </Heading>
            <PrimaryAction>Over 60000+ jobs to explore</PrimaryAction>
          </LeftColumn>
          <RightColumn>
          {/* <StyledResponsiveVideoEmbed
        url="https://www.youtube.com/embed/AjjgOhtJ4ZI"
        background="transparent"
      /> */}
       <ImageColumn>
              <ImageContainer>
                <Image src={sideImg} />
                {/* {imageDecoratorBlob && <ImageDecoratorBlob />} */}
              </ImageContainer>
              {/* <Testimonial>
                <QuotesLeftIcon />
                <Quote>{testimonial.quote}</Quote>
                <CustomerName>{testimonial.customerName}</CustomerName>
                <CustomerCompany>{testimonial.customerCompany}</CustomerCompany>
              </Testimonial> */}
            </ImageColumn>
          </RightColumn>
        </TwoColumn>
       
      </HeroContainer>
    </Container>
  );
};
