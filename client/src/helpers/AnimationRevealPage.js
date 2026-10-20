import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import BackgroundImage from "../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg"; 

/* framer-motion and useInView here are used to animate the sections in when we reach them in the viewport
 */
import { motion } from "framer-motion";
import useInView from "helpers/useInView";

// const StyledDiv = tw.div`w-full min-h-screen font-display text-secondary-500 bg-black overflow-hidden lg:overflow-auto lg:px-16 lg:py-16`;
const StyledDiv = styled.div`
  ${tw`w-full min-h-screen font-display text-secondary-500 bg-white overflow-hidden  lg:px-0 lg:py-0`}
  // background-image: url(${BackgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;


  @media (max-width: 768px) {
    background-size: contain; /* Changes to contain for smaller screens */
  }
`;

function AnimationReveal({ disabled, children }) {
  if (disabled) {
    return <>{children}</>;
  }

  if (!Array.isArray(children)) children = [children];

  const directions = ["left", "right"];
  const childrenWithAnimation = children.map((child, i) => {
    return (
      <AnimatedSlideInComponent key={i} direction={directions[i % directions.length]}>
        {child}
      </AnimatedSlideInComponent>
    );
  });
  return <>{childrenWithAnimation}</>;
}

function AnimatedSlideInComponent({ direction = "left", offset = 30, children }) {
  const [ref, inView] = useInView({ margin: `-${offset}px 0px 0px 0px`});

  const x = { target: "0%" };

  if (direction === "left") x.initial = "-150%";
  else x.initial = "150%";

  return (
    <div ref={ref}>
      <motion.section
        initial={{ x: x.initial }}
        animate={{ 
          x: inView && x.target,
          transitionEnd:{
            x: inView && 0
          }
        }}
        transition={{ type: "spring", damping: 19 }}
      >
        {children}
      </motion.section>
    </div>
  );
}

export default props => (
  <StyledDiv className="App">
    <AnimationReveal {...props} />
  </StyledDiv>
);
