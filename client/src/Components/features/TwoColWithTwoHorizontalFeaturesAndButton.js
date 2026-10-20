import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
// // import { css } from "styled-components/macro";  //eslint-disable-line
import { SectionHeading, Subheading as SubheadingBase } from "../../Components/misc/Headings";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import TeamIllustrationSrc from "images/team-illustration-2.svg";
import { ReactComponent as SvgDotPattern } from "images/dot-pattern.svg";
import { ReactComponent as BriefcaseIcon } from "feather-icons/dist/icons/briefcase.svg";
import { ReactComponent as MoneyIcon } from "feather-icons/dist/icons/dollar-sign.svg";
import imageone from "../../assets/man-woman-smiling-colleagues-celebrate-business-victory.jpg";
import up from "../../assets/image.png"

// const Container = tw.div`relative`;
const TwoColumn = tw.div`flex flex-col md:flex-row justify-between max-w-screen-xl mx-auto py-20 md:py-24 items-center`;
const Column = tw.div`w-full max-w-md mx-auto md:max-w-none md:mx-0`;
const ImageColumn = tw(Column)`md:w-6/12 flex-shrink-0 relative`;
const TextColumn = styled(Column)(props => [
  tw`md:w-6/12 mt-16 md:mt-0`,
  props.textOnLeft ? tw`md:mr-12 lg:mr-16 md:order-first` : tw`md:ml-12 lg:ml-16 md:order-last`
]);

const Image = styled.img(props => [
  props.imageRounded && tw`rounded`,
  props.imageBorder && tw`border`,
  props.imageShadow && tw`shadow`
]);
const Container = styled.div`
  ${tw`relative`}

       background-image: url(${up});
  padding: 2rem;
  background-size: cover; /* Ensure the image covers the whole container */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent repeating */
`;
const DecoratorBlob = tw(
  SvgDotPattern
)`w-20 h-20 absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 fill-current text-blue-500 -z-10`;

const TextContent = tw.div`lg:py-8 text-center md:text-left`;

const Subheading = tw(SubheadingBase)`text-center text-blue-100 md:text-left`;
const Heading = tw(
  SectionHeading
)`mt-4 font-black text-left text-3xl sm:text-4xl text-blue-600 lg:text-5xl text-center md:text-left leading-tight`;
const Description = tw.p`mt-8 text-center md:text-left text-sm md:text-base lg:text-lg font-medium leading-relaxed text-blue-100`;

const Features = tw.div`mx-auto md:mx-0 flex flex-col lg:flex-row max-w-xs lg:max-w-none`;
const Feature = tw.div`mt-10 lg:mt-8 flex items-center md:items-start flex-col md:mr-8 last:mr-0`;

const FeatureHeadingContainer = tw.div`flex items-center`;
const FeatureIconContainer = styled.div`
  ${tw`mx-auto inline-block border border-blue-500 text-blue-500 text-center rounded p-2 flex-shrink-0`}
  ${props => [
    props.iconRoundedFull && tw`rounded-full`,
    props.iconFilled && tw`border-0 bg-blue-500 text-gray-100`
  ]}
  svg {
    ${tw`w-5 h-5`}
  }
`;
const FeatureHeading = tw.div`ml-3 font-bold text-xl`;

const FeatureDescription = tw.div`mt-4 text-center md:text-left text-blue-500 leading-relaxed`;

const PrimaryButton = styled(PrimaryButtonBase)(props => [
  tw`mt-12 text-sm inline-block mx-auto md:mx-0 bg-blue-500`,
  props.buttonRounded && tw`rounded-full`
]);

export default ({
  subheading = "Our Expertise",
  heading = (
    <>
      Designed for <span tw="text-blue-700">Employers and Job Seekers.</span>
    </>
  ),
  description = "Our platform is built to cater to the needs of both tech startups and employers. Whether you're looking for tech professionals or IT specialists, our AI-driven platform ensures a smooth and efficient hiring process. By leveraging the power of AI, we help you find the perfect match for your tech jobs, saving time and effort.",
  primaryButtonText = "Find Now",
  primaryButtonUrl = "/candidates-list",
  imageSrc = TeamIllustrationSrc,
  buttonRounded = true,
  imageRounded = true,
  imageBorder = false,
  imageShadow = false,
  showDecoratorBlob = false,
  textOnLeft = true,
  features = null,
  iconRoundedFull = true,
  iconFilled = true,
  iconContainerCss = null
}) => {
  // The textOnLeft boolean prop can be used to display either the text on left or right side of the image.

  /*
   * Change the features variable as you like, add or delete objects
   * `icon` must be a React SVG component. See how BriefcaseIcon is imported above. For a full list of available icons, see Feather Icons.
   */
  const defaultFeatures = [
    {
      Icon: BriefcaseIcon,
      title: "Professionalism",
      description: "Our team consists of industry experts dedicated to providing professional and reliable services to meet your hiring needs.",
      iconContainerCss: tw`bg-teal-300 text-teal-800`
    },
    {
      Icon: MoneyIcon,
      title: "Affordable",
      description: "We offer competitive pricing that aligns with industry standards, ensuring you get the best value for your recruitment efforts.",
      iconContainerCss: tw`bg-red-300 text-red-800`
    }
  ];

  if (!features) features = defaultFeatures;

  return (
    <Container>
      <TwoColumn>
        <ImageColumn>
          <Image src={imageone} imageBorder={imageBorder} imageShadow={imageShadow} imageRounded={imageRounded} />
          {showDecoratorBlob && <DecoratorBlob />}
        </ImageColumn>
        <TextColumn textOnLeft={textOnLeft}>
          <TextContent>
            <Subheading>{subheading}</Subheading>
            <Heading>{heading}</Heading>
            <Description>{description}</Description>
            {/* <Features>
              {features.map((feature, index) => (
                <Feature key={index}>
                  <FeatureHeadingContainer>
                    <FeatureIconContainer
                      iconFilled={iconFilled}
                      iconRoundedFull={iconRoundedFull}
                      css={feature.iconContainerCss || iconContainerCss}
                    >
                      {<feature.Icon />}
                    </FeatureIconContainer>
                    <FeatureHeading>{feature.title}</FeatureHeading>
                  </FeatureHeadingContainer>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </Feature>
              ))}
            </Features> */}

            <PrimaryButton buttonRounded={buttonRounded} as="a" href={primaryButtonUrl}>
              {primaryButtonText}
            </PrimaryButton>
          </TextContent>
        </TextColumn>
      </TwoColumn>
    </Container>
  );
};
