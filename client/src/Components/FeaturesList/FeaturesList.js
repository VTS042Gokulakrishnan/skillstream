import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { Link } from "react-router-dom"; // Still importing Link for internal links
import Rocket from "images/rocket_launch_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.png";
import Book from "images/menu_book_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.png";
import Cap from "images/school_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.png";
import Network from "images/icons8-internal-network-48.png";
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg";

// const Container = tw.div`relative bg-white py-10 px-5`;
const Container = styled.div`
  ${tw`relative`}

  background-image: url(${down});
  padding: 2rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;
const Heading = tw.h2` text-xl font-semibold mb-8 text-blue-500`;
const FourColumn = tw.div`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`;
const CardContainer = tw.div`relative overflow-hidden rounded-lg shadow-md bg-green-100 p-6`;
const Card = styled.div`
  ${tw`relative flex flex-col items-center`}
  background-color: ${(props) => props.bgColor || "white"};
`;
const CornerCircleTopRight = tw.div`absolute top-0 right-0 w-5 h-5 bg-purple-300 rounded-full transform translate-x-2 -translate-y-2`;
const CornerCircleBottomLeft = tw.div`absolute bottom-0 left-0 w-5 h-5 bg-purple-300 rounded-full transform -translate-x-2 translate-y-2`;

const IconContainer = styled.div((props) => [
  `background-color: ${props.bgColor};`,
  tw`flex items-center justify-center h-16 w-16 rounded-full mb-4 z-10`,
]);
const Icon = styled.img`
  ${tw`h-5 w-5`}
`;
const Title = tw.h3`text-lg font-medium mb-2 z-10`;
const Description = tw.p`text-center z-10`;

const FeaturesList = ({
  subheading = "Say Skill Stream every step of the way",
  features = [
    {
      title: "Boost",
      description: "Build visibility for yourself",
      icon: Rocket,
      cardBgColor: "#4299e1",
      iconBgColor: "#90cdf4",
      externalLink: "https://resume.careeriq.ai", // Internal link
    },
    {
      title: "Prep",
      description: "Up your interview success rate",
      icon: Book,
      cardBgColor: "#B4D8FF",
      iconBgColor: "rgba(64, 159, 255, 0.2)",
      link: "/practiceInterviewLanding", // Internal link
    },
    {
      title: "Learn",
      description: "Upskill to get ahead",
      icon: Cap,
      cardBgColor: "#2986CC",
      iconBgColor: "#B4D8FF",
      externalLink: "https://upskillgenius.com/", // External link for Learn
    },
    // {
    //   title: "Network",
    //   description: "Grow with peers & mentors",
    //   icon: Network,
    //   cardBgColor: "#FFB4D8",
    //   iconBgColor: "rgba(255, 64, 159, 0.2)",
    //   link: "/network", // Internal link
    // },
  ],
}) => {
  return (
    <Container>
      <Heading>
        {subheading.split(" ").map((word, index) =>
          word === "Skill Stream" ? (
            <span key={index} tw="text-blue-500">
              {word}{" "}
            </span>
          ) : (
            `${word} `
          )
        )}
      </Heading>

      <FourColumn>
        {features.map((feature, index) =>
          feature.externalLink ? (
            <a
              key={index}
              href={feature.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }} // Styling for external link
            >
              <CardContainer>
                <Card bgColor={feature.cardBgColor}>
                  {/* <CornerCircleTopRight />
                  <CornerCircleBottomLeft /> */}
                  <IconContainer bgColor={feature.iconBgColor}>
                    <Icon src={feature.icon} alt={`${feature.title} Icon`} />
                  </IconContainer>
                  <Title>{feature.title}</Title>
                  <Description>{feature.description}</Description>
                </Card>
              </CardContainer>
            </a>
          ) : (
            <Link key={index} to={feature.link} style={{ textDecoration: "none" }}>
              {/* Internal Links */}
              <CardContainer>
                <Card bgColor={feature.cardBgColor}>
                  {/* <CornerCircleTopRight />
                  <CornerCircleBottomLeft /> */}
                  <IconContainer bgColor={feature.iconBgColor}>
                    <Icon src={feature.icon} alt={`${feature.title} Icon`} />
                  </IconContainer>
                  <Title>{feature.title}</Title>
                  <Description>{feature.description}</Description>
                </Card>
              </CardContainer>
            </Link>
          )
        )}
      </FourColumn>
    </Container>
  );
};

export default FeaturesList;
