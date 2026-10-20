import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import {
  FaUniversity, FaHome, FaUserTie, FaShoppingBag,
  FaCalculator, FaHeadset, FaCalendarCheck, FaLaptop,
  FaDatabase, FaPalette, FaBullhorn
} from 'react-icons/fa';
import { SectionHeading } from "../../Components/misc/Headings";
import { ReactComponent as SvgDecoratorBlob3 } from "../../images/svg-decorator-blob-3.svg";
import up from "../../assets/image.png";

const Container = styled.div`
  ${tw`relative px-5 py-10`}
  background-image: url(${up});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const SixColumnContainer = styled.div`
  ${tw`grid gap-4 max-w-screen-xl mx-auto py-10`}
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(140px, 1fr));
  }
`;

const Heading = tw(SectionHeading)`w-full text-blue-500 text-center`;

const Column = styled.div`
  ${tw`flex justify-center`}
`;

const Card = styled.div`
  ${tw`flex flex-col items-center justify-center p-6 border-2 border-blue-300 rounded-lg shadow-lg transition-transform`}
  height: 140px;
  width: 100%;
  max-width: 180px;
  background: rgba(255, 255, 255, 0.8);
  text-align: center;

  .icon {
    ${tw`text-blue-500 text-3xl mb-3`}
  }
  
  .textContainer {
    ${tw`text-sm font-semibold text-gray-700`}
  }

  &:hover {
    transform: scale(1.05);
    background: rgba(255, 255, 255, 1);
  }
`;

const DecoratorBlob = styled(SvgDecoratorBlob3)`
  ${tw`pointer-events-none absolute right-0 bottom-0 w-64 opacity-25 transform translate-x-32 translate-y-48`}
`;

const cards = [
  { name: 'Banking', icon: <FaUniversity /> },
  { name: 'Work From Home', icon: <FaHome /> },
  { name: 'HR', icon: <FaUserTie /> },
  { name: 'Sales', icon: <FaShoppingBag /> },
  { name: 'Accounting', icon: <FaCalculator /> },
  { name: 'Customer Support', icon: <FaHeadset /> },
  { name: 'Event Management', icon: <FaCalendarCheck /> },
  { name: 'IT', icon: <FaLaptop /> },
  { name: 'SQL', icon: <FaDatabase /> },
  { name: 'Oracle', icon: <FaDatabase /> },
  { name: 'Graphic Design', icon: <FaPalette /> },
  { name: 'Digital Marketing', icon: <FaBullhorn /> },
];

const ServicesSection = () => {
  return (
    <Container>
      <Heading>Popular <span tw="text-blue-500">Categories</span></Heading>
      <SixColumnContainer>
        {cards.map((card, i) => (
          <Column key={i}>
            <Card>
              <div className="icon">{card.icon}</div>
              <div className="textContainer">{card.name}</div>
            </Card>
          </Column>
        ))}
      </SixColumnContainer>
      
    </Container>
  );
};

export default ServicesSection;
