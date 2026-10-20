import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
// // import { css } from "styled-components/macro";  //eslint-disable-line
import { SectionHeading, Subheading as SubheadingBase } from "../../Components/misc/Headings";
import { Container as ContainerBase, ContentWithPaddingXl } from "../../Components/misc/Layouts";
import { SectionDescription } from "../../Components/misc/Typography";
import bgImg from "../../assets/luxury-gradient-blue-background-blue-with-black-vignette-studio-banner-wallpaper-hd-images.jpg"
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg"
// const Container = tw(ContainerBase)`my-8 lg:my-10 bg-blue-900 text-gray-100 -mx-8 px-8`;
export const Container = styled.div`
  ${tw`relative`}

       background-image: url(${down});
 
  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;

const HeadingContainer = tw.div``;
const Heading = tw(SectionHeading)`text-blue-200 sm:text-3xl md:text-4xl lg:text-5xl`;
const Subheading = tw(SubheadingBase)`text-gray-100 text-center`;
const Description = tw(SectionDescription)`text-gray-400 text-center mx-auto max-w-screen-md`;

const StatsContainer = tw.div`mt-8 flex flex-col sm:flex-row items-center justify-center flex-wrap max-w-screen-md justify-between mx-auto`
const Stat = tw.div`flex flex-col text-center p-4 tracking-wide`
const StatKey = tw.div`text-xl text-white font-medium`
const StatValue = tw.div`text-4xl text-blue-200 sm:text-3xl md:text-4xl lg:text-5xl font-black`

export default ({
  subheading = "",
  heading = "Over 9000 Successful Placements",
  description = "We have a proven track record of connecting employers with the right candidates.",
  stats = [
    {
      key: "Satisfied Employers",
      value: "2500+",
    },
    {
      key: "Revenue Generated",
      value: "$100M+",
    },
    {
      key: "Dedicated Team Members",
      value: "150+",
    },
  ]
}) => {
  return (
    <Container>
      <ContentWithPaddingXl>
        <HeadingContainer>
          {subheading && <Subheading>{subheading}</Subheading>}
          <Heading>{heading}</Heading>
          {description && <Description>{description}</Description>}
        </HeadingContainer>
        <StatsContainer>
          {stats.map((stat, index) => (
            <Stat key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatKey>{stat.key}</StatKey>
            </Stat>
          ))}
        </StatsContainer>
      </ContentWithPaddingXl>
    </Container>
  );
};
