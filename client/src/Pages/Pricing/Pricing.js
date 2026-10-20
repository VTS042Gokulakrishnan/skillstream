import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import tw from "twin.macro";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { loadStripe } from "@stripe/stripe-js";
import { Server } from "App";

import {
  SectionHeading,
  Subheading as SubheadingBase,
} from "../../Components/misc/Headings";
import { SectionDescription } from "../../Components/misc/Typography";
import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
import { ContentWithPaddingXl } from "../../Components/misc/Layouts";
import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-6.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";

import Login from "../../Pages/Auth/Login";
import Register from "../../Pages/Auth/Register";
import ConfirmModal from "../../Pages/Auth/ConfirmModal";
import ForgotPassword from "../../Pages/Auth/ForgotPassword";

import bgImg from "../../assets/luxury-gradient-blue-background-blue-with-black-vignette-studio-banner-wallpaper-hd-images.jpg";
import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg";

/* ✅ safe twin classes only (no mt-14, no top-4 etc) */
const HeaderContainer = tw.div`w-full flex flex-col items-center`;
const Subheading = tw(SubheadingBase)`mb-4 text-blue-500`;
const Heading = tw(SectionHeading)`w-full text-gray-100`;
const Description = tw(SectionDescription)`w-full text-gray-100 text-center`;
const PlansContainer = tw.div`flex flex-wrap justify-center gap-10`;

const Container = styled.div`
  ${tw`relative`}
  background-image: url(${down});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
`;

const Plan = styled.div`
  ${tw`w-full max-w-80 mt-12 text-center px-8 rounded-2xl relative text-white flex flex-col`}
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;

  ${(props) =>
    props.disabled &&
    css`
      filter: grayscale(1);
      opacity: 0.6;
    `}

  background-image: url(${bgImg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const PlanHeader = styled.div`
  ${tw`flex flex-col leading-relaxed py-10 -mx-8 rounded-t-2xl relative`}
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(10px);

  .price {
    ${tw`font-bold text-4xl sm:text-5xl my-1`}
  }
  .duration {
    ${tw`lowercase text-gray-200 font-medium tracking-widest`}
  }
  .mainFeature {
    ${tw`text-gray-200 text-sm font-medium tracking-wide`} margin-top: 6px;
  }
`;

const PlanBadge = styled.div`
  ${tw`absolute left-1/2 px-4 py-2 rounded-full text-xs font-bold shadow-lg`}
  transform: translateX(-50%);
  top: 14px;
  background: linear-gradient(to right, #4299e1, #0070f3);
  color: white;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const CurrentPill = styled.div`
  ${tw`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold`}
  background: rgba(16,185,129,0.18);
  color: #d1fae5;
  border: 1px solid rgba(16, 185, 129, 0.25);
`;

const PlanFeatures = styled.div`
  ${tw`flex flex-col -mx-8 px-8 py-8 flex-1 text-sm`}
  background: rgba(0,0,0,0.22);

  .feature {
    ${tw`mt-5 first:mt-0 font-semibold text-gray-100`} opacity: 0.95;
  }
`;

const PlanAction = tw.div`px-4 pb-8`;

const BuyNowButton = styled(PrimaryButtonBase)`
  ${tw`rounded-xl tracking-wider py-4 w-full text-sm font-bold`}
`;

const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-64 w-64 opacity-25 transform -translate-x-2/3 -translate-y-1/2`}
`;
const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
  ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-25 transform translate-x-2/3 translate-y-1/2 fill-current text-teal-300`}
`;

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
const safeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export default ({
  subheading = "Pricing",
  heading = "Plans",
  description = "Choose Monthly or Yearly. Free Trial is available once for 14 days.",
  primaryButtonText = "Subscribe",
}) => {
  const navigate = useNavigate();

  // auth modals (keep your flow)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [confirmModal, setConfirmModal] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("Role");
  const userId = localStorage.getItem("UserId");

  // ✅ pricing
  const MONTHLY_PRICE = 249;
  const YEARLY_PRICE = MONTHLY_PRICE * 12;

  // ✅ stripe recurring price ids
  const STRIPE_PRICE_ID_MONTHLY = "price_1PdWn2P218aRnkr8eMEL98xa";
  const STRIPE_PRICE_ID_YEARLY = "price_REPLACE_WITH_YEARLY_PRICE_ID";

  // status
  const [statusLoading, setStatusLoading] = useState(true);
  const [billingStatus, setBillingStatus] = useState("Unknown"); // Trial | Subscribed | Not Subscribed
  const [currentPlanLabel, setCurrentPlanLabel] = useState("");
  const [trialEnds, setTrialEnds] = useState(null);
  const [subscriptionEnds, setSubscriptionEnds] = useState(null);
  const recruiterDomains = useMemo(
    () => ["@hrpundits.com", "@vivatechsolutions.io", "@growthiq.net"],
    [],
  );
  const recruiterEmails = useMemo(() => ["nischalakrishna@gmail.com"], []);

  const isRecruiterAccessEmail = (email = "") => {
    const lower = String(email).toLowerCase().trim();
    if (!lower) return false;
    if (recruiterEmails.includes(lower)) return true;
    return recruiterDomains.some((d) => lower.endsWith(d));
  };

  // status
  const [isRecruiterAccess, setIsRecruiterAccess] = useState(false);
  const showModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const fetchEmployerStatus = async () => {
    try {
      if (!token) {
        setBillingStatus("Not Subscribed");
        setCurrentPlanLabel("");
        setTrialEnds(null);
        setSubscriptionEnds(null);
        setIsRecruiterAccess(false);
        setStatusLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const res = await axios.get(
        `${Server}/api/v1/employer/${decoded?.userId}`,
      );
      const employer = res?.data?.Employer?.[0];

      const email =
        employer?.email ||
        employer?.companyEmail ||
        employer?.employerEmail ||
        "";

      // ✅ Recruiter Access (override everything)
      if (isRecruiterAccessEmail(email)) {
        setIsRecruiterAccess(true);
        setBillingStatus("Recruiter Access");
        setCurrentPlanLabel("Recruiter Access");
        setTrialEnds(null);
        setSubscriptionEnds(null);
        setStatusLoading(false);
        return;
      }

      setIsRecruiterAccess(false);

      const now = new Date();

      const tStart = safeDate(employer?.trialStart); // (if your schema is trialStarts, change here)
      const tEnd = safeDate(employer?.trialEnds);
      const sEnd = safeDate(employer?.subscriptionEnds);

      setTrialEnds(tEnd);
      setSubscriptionEnds(sEnd);

      const trialActive = !!tStart && !!tEnd && now >= tStart && now <= tEnd;
      const subscribedActive = !!sEnd && now <= sEnd && !!employer?.subscribed;

      if (subscribedActive) {
        setBillingStatus("Subscribed");
        setCurrentPlanLabel(employer?.plan || "Recommended");
      } else if (trialActive) {
        setBillingStatus("Trial");
        setCurrentPlanLabel("Free Trial");
      } else {
        setBillingStatus("Not Subscribed");
        setCurrentPlanLabel("");
      }

      setStatusLoading(false);
    } catch (e) {
      console.error(e);
      setBillingStatus("Not Subscribed");
      setCurrentPlanLabel("");
      setIsRecruiterAccess(false);
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = async (planLabel, amount, priceId, period) => {
    try {
      if (!token) {
        showModal("login");
        return;
      }

      if (
        period === "yearly" &&
        (!priceId || String(priceId).includes("REPLACE_WITH_YEARLY_PRICE_ID"))
      ) {
        toast.error("Please add the yearly Stripe priceId.");
        return;
      }

      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_API_KEY);

      const body = {
        plan: planLabel,
        amount,
        userId,
        product: "Recommended Full Access",
        priceId,
        role: role || "Employer",
        period,
      };

      const { data } = await axios.post(
        `${Server}/api/v1/subscribe/US/create/checkout-session`,
        body,
      );

      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.log(error);
      toast.error("Subscription failed. Please try again.");
    }
  };

  const featuresCommon = useMemo(
    () => [
      "Unlimited Job Postings",
      "Unlimited access to Database",
      "AI Resume Search",
      "AI Fitment Analysis",
      "AI Video Interview",
      "Email Support",
    ],
    [],
  );

  const now = new Date();
  const isTrialExpired = !!trialEnds && now > new Date(trialEnds);

  // ✅ Free trial disabled rules (as you asked)
  const freeTrialDisabled =
    isRecruiterAccess ||
    billingStatus === "Subscribed" ||
    (isTrialExpired && billingStatus !== "Trial");

  const cards = useMemo(() => {
    return [
      {
        key: "trial",
        type: "trial",
        badge: "Free Trial (14 Days)",
        priceText: "$0",
        durationText: "/trial",
        subtitle:
          billingStatus === "Trial"
            ? `Trial ends on ${formatDate(trialEnds)}`
            : isTrialExpired
            ? `Trial expired on ${formatDate(trialEnds)}`
            : "One-time trial access for 14 days",
        features: featuresCommon,
      },
      {
        key: "monthly",
        type: "monthly",
        badge: "Recommended (Monthly)",
        priceText: `$${MONTHLY_PRICE}`,
        durationText: "/month",
        subtitle: "Full access • billed monthly",
        features: featuresCommon,
        amount: MONTHLY_PRICE,
        period: "monthly",
        priceId: STRIPE_PRICE_ID_MONTHLY,
      },
      {
        key: "yearly",
        type: "yearly",
        badge: "Recommended (Yearly)",
        priceText: `$${YEARLY_PRICE}`,
        durationText: "/year",
        subtitle: "Full access • billed yearly",
        features: featuresCommon,
        amount: YEARLY_PRICE,
        period: "yearly",
        priceId: STRIPE_PRICE_ID_YEARLY,
      },
    ];
  }, [
    MONTHLY_PRICE,
    YEARLY_PRICE,
    billingStatus,
    trialEnds,
    isTrialExpired,
    featuresCommon,
  ]);

  const isCurrentCard = (type) => {
    if (billingStatus === "Trial") return type === "trial";
    if (billingStatus === "Subscribed") {
      const planLower = String(currentPlanLabel || "").toLowerCase();
      if (planLower.includes("year")) return type === "yearly";
      if (planLower.includes("month")) return type === "monthly";
      return type === "monthly"; // fallback
    }
    return false;
  };

  const renderButton = (c) => {
    // ✅ Recruiter access: disable everything
    if (isRecruiterAccess) {
      return (
        <BuyNowButton
          disabled
          style={{
            background: "rgba(255,255,255,0.18)",
            color: "#fff",
            cursor: "not-allowed",
            borderRadius: 14,
          }}
        >
          Not Needed
        </BuyNowButton>
      );
    }

    // Trial: no subscribe button
    if (c.type === "trial") {
      const label =
        billingStatus === "Trial"
          ? "Current Plan"
          : freeTrialDisabled
          ? "Not Available"
          : "Trial Provided Automatically";

      return (
        <BuyNowButton
          disabled
          style={{
            background: "rgba(255,255,255,0.18)",
            color: "#fff",
            cursor: "not-allowed",
            borderRadius: 14,
          }}
        >
          {label}
        </BuyNowButton>
      );
    }

    // Monthly/Yearly subscribe
    return (
      <BuyNowButton
        disabled={isCurrentCard(c.type)} // optional: disable current plan button
        style={{
          borderRadius: 14,
          background: "linear-gradient(to right, #4299e1, #0070f3)",
          color: "#fff",
          cursor: isCurrentCard(c.type) ? "not-allowed" : "pointer",
          opacity: isCurrentCard(c.type) ? 0.75 : 1,
        }}
        onClick={() => {
          if (!isCurrentCard(c.type))
            subscribe(c.badge, c.amount, c.priceId, c.period);
        }}
      >
        {isCurrentCard(c.type) ? "Current Plan" : primaryButtonText}
      </BuyNowButton>
    );
  };

  if (statusLoading)
    return <div style={{ padding: 18, color: "#fff" }}>Loading...</div>;

  return (
    <Container>
      <Toaster position="top-center" reverseOrder={false} />

      <ContentWithPaddingXl>
        <HeaderContainer>
          <Subheading>{subheading}</Subheading>
          <Heading>{heading}</Heading>
          <Description>{description}</Description>

          {/* ✅ Current plan summary */}
          {isRecruiterAccess && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(0,0,0,0.28)",
                color: "#fff",
                fontWeight: 800,
                maxWidth: 760,
                width: "100%",
                textAlign: "center",
              }}
            >
              ✅ You have <strong>full access</strong> (Recruiter Access).
              Subscription is not needed.
            </div>
          )}
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(0,0,0,0.28)",
              color: "#fff",
              fontWeight: 800,
              maxWidth: 760,
              width: "100%",
              textAlign: "center",
            }}
          >
            <span style={{ opacity: 0.9 }}>Current Plan: </span>
            <span style={{ fontWeight: 950 }}>
              {billingStatus === "Recruiter Access"
                ? "Recruiter Access"
                : billingStatus === "Trial"
                ? "Free Trial"
                : billingStatus === "Subscribed"
                ? currentPlanLabel || "Recommended"
                : "No Active Subscription"}
            </span>
            {billingStatus === "Trial" && trialEnds ? (
              <span style={{ marginLeft: 10, opacity: 0.9 }}>
                • Ends on {formatDate(trialEnds)}
              </span>
            ) : null}
            {billingStatus === "Subscribed" && subscriptionEnds ? (
              <span style={{ marginLeft: 10, opacity: 0.9 }}>
                • Ends on {formatDate(subscriptionEnds)}
              </span>
            ) : null}
          </div>
        </HeaderContainer>

        <PlansContainer>
          {cards.map((c) => {
            const disabled = isRecruiterAccess
              ? true
              : c.type === "trial"
              ? freeTrialDisabled
              : false;
            const current = isCurrentCard(c.type);

            return (
              <Plan key={c.key} disabled={disabled}>
                <PlanHeader>
                  <PlanBadge>{c.badge}</PlanBadge>

                  <span className="priceAndDuration" style={{ marginTop: 18 }}>
                    <span className="price">{c.priceText}</span>
                    <span className="duration"> {c.durationText}</span>
                  </span>

                  <span className="mainFeature">{c.subtitle}</span>

                  {current && (
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <CurrentPill>✅ Current Plan</CurrentPill>
                    </div>
                  )}
                </PlanHeader>

                <PlanFeatures>
                  {c.features.map((feature, idx) => (
                    <span key={idx} className="feature">
                      {feature}
                    </span>
                  ))}
                </PlanFeatures>

                <PlanAction style={{ position: "relative" }}>
                  {renderButton(c)}

                  {/* 🔒 One lock overlay (only for disabled trial) */}
                  {c.type === "trial" && disabled && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 14,
                          background: "rgba(15, 23, 42, 0.80)",
                          border: "1px solid rgba(255,255,255,0.14)",
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: 13,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>🔒</span>
                        Free Trial Not Available
                      </div>
                    </div>
                  )}
                </PlanAction>
              </Plan>
            );
          })}
        </PlansContainer>
      </ContentWithPaddingXl>

      <DecoratorBlob1 />
      <DecoratorBlob2 />

      {/* Auth modals */}
      {forgotModal && (
        <ForgotPassword
          forgotModal={forgotModal}
          setForgotModal={setForgotModal}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setModalType={setModalType}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          confirmModal={confirmModal}
          setConfirmModal={setConfirmModal}
        />
      )}

      {isModalOpen && (
        <div>
          {modalType === "login" ? (
            <Login
              isModalOpen={isModalOpen}
              modalType={modalType}
              setIsModalOpen={setIsModalOpen}
              setModalType={setModalType}
              showModal={showModal}
              confirmModal={confirmModal}
              setConfirmModal={setConfirmModal}
              forgotModal={forgotModal}
              setForgotModal={setForgotModal}
            />
          ) : (
            <Register
              isModalOpen={isModalOpen}
              modalType={modalType}
              setIsModalOpen={setIsModalOpen}
              setModalType={setModalType}
            />
          )}
        </div>
      )}
    </Container>
  );
};

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import styled, { keyframes, css } from "styled-components";
// import tw from "twin.macro";
// import {
//   SectionHeading,
//   Subheading as SubheadingBase,
// } from "../../Components/misc/Headings";
// import { SectionDescription } from "../../Components/misc/Typography";
// import { PrimaryButton as PrimaryButtonBase } from "../../Components/misc/Buttons";
// import { ContentWithPaddingXl } from "../../Components/misc/Layouts";
// import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-6.svg";
// import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";
// import Login from "../../Pages/Auth/Login";
// import Register from "../../Pages/Auth/Register";
// import ConfirmModal from "../../Pages/Auth/ConfirmModal";
// import ForgotPassword from "../../Pages/Auth/ForgotPassword";
// import bgImg from "../../assets/luxury-gradient-blue-background-blue-with-black-vignette-studio-banner-wallpaper-hd-images.jpg";
// import down from "../../assets/artistic-blurry-colorful-wallpaper-background-blue.jpg";
// import { loadStripe } from "@stripe/stripe-js";
// import { Content } from "antd/es/layout/layout";
// import axios from "axios";
// import { Server } from "App";

// // Keyframes for jumping animation
// const jumpAnimation = keyframes`
//   0%, 100% {
//     transform: translateY(0);
//   }
//   50% {
//     transform: translateY(-10px);
//   }
// `;

// // Styled-components
// const HeaderContainer = tw.div`w-full flex flex-col items-center`;
// const Subheading = tw(SubheadingBase)`mb-4 text-blue-500`;
// const Heading = tw(SectionHeading)`w-full text-gray-100`;
// const Description = tw(SectionDescription)`w-full text-gray-100 text-center`;

// // const DurationSwitcherContainer = styled.div`
// //   ${tw`block w-full max-w-xl sm:inline-block sm:w-auto border-2 rounded-full px-1 py-1 mt-8 relative flex items-center justify-between`}
// //   position: relative;
// //   overflow: hidden;
// //   border-color: #4299e1; /* Match border color with button */
// //   background: rgba(0, 0, 255, 0.1); /* Light blue background */
// // `;

// const DurationSwitcherContainer = styled.div`
//   ${tw`block w-full max-w-xl sm:inline-block mt-8 border-2 rounded-full flex items-center justify-center gap-2`}

//   position: relative;
//   background: rgba(0, 0, 255, 0.1);
//   border-color: #4299e1;
//   overflow: hidden;
//   white-space: nowrap;
// `;

// const Slider = styled.div`
//   ${tw`absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full transition-transform duration-300 ease-out`}
//   width: 50%;
//   transform: ${(props) =>
//     props.activeDurationIndex === 0 ? "translateX(0)" : "translateX(100%)"};
//   transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Smooth elastic transition */
//   box-shadow: 0 0 20px #4299e1; /* Box shadow for depth */
//   z-index: 1;
// `;

// const SwitchButton = styled.button`
//   ${tw`w-full sm:w-auto px-4 sm:px-8 py-3 rounded-full focus:outline-none text-sm font-bold text-gray-700 transition duration-300 relative z-10`}
//   ${(props) =>
//     props.active
//       ? css`
//           ${tw`text-white`}
//           color: #ffffff; /* Active text color */
//         `
//       : css`
//           ${tw`hover:text-gray-900`}
//           color: #4299e1;
//         `}
// `;

// // const SwitchButton = styled.button`
// //   ${tw`flex-1 sm:flex-none text-center px-4 sm:px-8 py-3 rounded-full focus:outline-none text-sm font-bold transition duration-300 z-10`}

// //   ${(props) =>
// //     props.active
// //       ? css`
// //           ${tw`text-white bg-blue-500`}
// //         `
// //       : css`
// //           color: #4299e1;
// //           ${tw`hover:text-blue-600`}
// //         `}
// // `;

// const Arrow = styled.div`
//   ${tw`absolute top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ease-out`}
//   ${(props) =>
//     props.activeDurationIndex === 0
//       ? `right: 8px; transform: rotate(180deg);`
//       : `left: 8px;`}

//   width: 24px;
//   height: 24px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #ffffff; /* Ensures the color is white */
//   z-index: 2;

//   /* Apply jumping animation */
//   animation: ${jumpAnimation} 1s infinite;
// `;

// const Plan = styled.div`
//   ${tw`w-full max-w-72 mt-16 md:mr-12 md:last:mr-0 text-center px-8 rounded-lg relative text-white  flex flex-col shadow-raised`}
//   ${(props) =>
//     props.featured &&
//     css`
//       ${tw`border-2 border-gray-200 shadow-none`}
//     `}

//      background-image: url(${bgImg});

//   background-size: cover; /* Ensure the image covers the whole container */
//   background-position: center; /* Center the image */
//   background-repeat: no-repeat; /* Prevent repeating */
// `;

// const PlanHeader = styled.div`
//   ${tw`flex flex-col leading-relaxed py-8 -mx-8 bg-gray-100 rounded-t-lg`}
//   .name {
//     ${tw`font-bold text-xl`}
//   }
//   .price {
//     ${tw`font-bold text-4xl sm:text-5xl my-1`}
//   }
//   .slash {
//     ${tw`text-xl text-gray-500`}
//   }
//   .duration {
//     ${tw`lowercase text-gray-500 font-medium tracking-widest`}
//   }
//   .mainFeature {
//     ${tw`text-gray-500 text-sm font-medium tracking-wide`}
//   }
//   background-image: url(${bgImg});

//   background-size: cover; /* Ensure the image covers the whole container */
//   background-position: center; /* Center the image */
//   background-repeat: no-repeat; /* Prevent repeating */
// `;

// const PlanFeatures = styled.div`
//   ${tw`flex flex-col -mx-8 px-8 py-8 flex-1 text-sm`}
//   .feature {
//     ${tw`mt-5 first:mt-0 font-semibold text-gray-500`}
//   }
// `;

// const PlanAction = tw.div`px-4 pb-8`;
// const BuyNowButton = styled(PrimaryButtonBase)`
//   ${tw`rounded-full tracking-wider py-4 w-full text-sm hover:shadow-xl transform hocus:translate-x-px hocus:-translate-y-px focus:shadow-outline bg-blue-500`}
// `;

// const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
//   ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-64 w-64 opacity-25 transform -translate-x-2/3 -translate-y-1/2`}
// `;

// const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
//   ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-25 transform translate-x-2/3 translate-y-1/2 fill-current text-teal-300`}
// `;

// // Adding missing PlansContainer styled component
// const PlansContainer = tw.div`flex flex-wrap justify-center`;

// const Container = styled.div`
//   ${tw`relative`}
//   background-image: url(${down});

//   background-size: cover; /* Ensure the image covers the whole container */
//   background-position: center; /* Center the image */
//   background-repeat: no-repeat; /* Prevent repeating */
//   min-height: 100vh; /* Ensure the container covers full viewport height */
// `;
// // New Styled Component for the Free Trial Button
// const FreeTrialButton = styled(PrimaryButtonBase)`
//   ${tw`mt-6 mb-4 rounded text-sm rounded-full shadow-lg transform transition-all duration-300 ease-in-out`}
//   background: linear-gradient(to right, #4299e1, #0070f3); /* Custom Gradient */
//   box-shadow: 0 4px 15px rgba(66, 153, 225, 0.5); /* Shadow for emphasis */
//   transition: all 0.3s ease-in-out; /* Smooth transition for hover effects */
//   border-radius: 10px;

//   &:hover {
//     background: linear-gradient(
//       to right,
//       #4299e1,
//       #0056a1
//     ); /* Darker Gradient */
//     box-shadow: 0 6px 20px rgba(66, 153, 225, 0.7); /* Enhanced Shadow */
//     transform: translateY(-2px); /* Slight lift on hover */
//   }
// `;

// const DurationSwitcher = ({
//   durationIndex,
//   setDurationIndex,
//   planDurations,
// }) => (
//   <DurationSwitcherContainer>
//     <Slider activeDurationIndex={durationIndex} />
//     <SwitchButton
//       active={durationIndex === 0}
//       onClick={() => setDurationIndex(0)}
//     >
//       {planDurations[0].switcherText}
//     </SwitchButton>
//     <SwitchButton
//       active={durationIndex === 1}
//       onClick={() => setDurationIndex(1)}
//     >
//       {planDurations[1].switcherText}
//     </SwitchButton>
//   </DurationSwitcherContainer>
// );

// // Main component
// export default ({
//   subheading = "Pricing",
//   heading = "Flexible Plans",
//   description = "Choose the best package to post your job openings and attract the best candidates.",
//   plans = null,
//   primaryButtonText = "Subscribe",
//   primaryButtonText1 = "Free Trial",
//   planDurations = [
//     {
//       text: "month",
//       switcherText: "Job Posting And Resume Search",
//     },
//     {
//       text: "per Job",
//       switcherText: "Job Advertising Package",
//     },
//   ],
// }) => {
//   const [plan, setPlan] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState("login");
//   const [confirmModal, setConfirmModal] = useState(false);
//   const [forgotModal, setForgotModal] = useState(false);
//   const navigate = useNavigate();
//   let role = localStorage.getItem("Role");
//   const showModal = (type) => {
//     setModalType(type);
//     setIsModalOpen(true);
//     // if (type === "login") {
//     //   // Your login logic goes here
//     //   // Assuming login is successful, redirect to candidates-list
//     //   navigate("/candidates-list");
//     // }
//   };
//   // console.log(process.env.REACT_APP_STRIPE_API_KEY);
//   let token = localStorage.getItem("token");
//   let userId = localStorage.getItem("UserId");
//   // let role = localStorage.getItem("Role");

//   const subscribe = async (plan, price, priceId) => {
//     try {
//       if (token) {
//         if (plan === "Free-trial") {
//           let body = {
//             plan: plan,
//           };
//           console.log(plan);

//           const { data } = await axios.post(
//             `${Server}/api/v1/subscribe/new/${userId}`,
//             body
//           );
//           navigate("/employer-dashboard");
//         } else {
//           const stripe = await loadStripe(process.env.REACT_APP_STRIPE_API_KEY);
//           const body = {
//             plan: plan,
//             amount: price,
//             priceId: priceId,
//             userId: userId,
//             role: role,
//           };
//           const headers = {
//             Content: "application/json",
//           };
//           const { data } = await axios.post(
//             `${Server}/api/v1/subscribe/US/create/checkout-session`,
//             body,
//             {
//               Headers: headers,
//             }
//           );
//           // console.log(response);
//           // const session = await response.json();
//           // localStorage.setItem("ses", data);
//           const result = stripe.redirectToCheckout({
//             sessionId: data.id,
//           });
//         }
//       } else {
//         showModal("login");
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };

//   const defaultPlans = [
//     {
//       name: "Try With AI",
//       durationPrices: ["$249"],
//       mainFeature: "Jobs with AI Search",
//       features: [
//         "Unlimited Job Postings",
//         "Unlimited access to our Database",
//         "(Available only for US)",
//         "AI Resume Search",
//         "AI Fitment Analysis",
//         "AI Video Interview",
//       ],
//       featured: true,

//       stripe_price_id: "price_1RUTGaIZxOCLpw3QJO2jXarM",
//     },
//     // {
//     //   name: "Recommended",
//     //   durationPrices: ["$299"],
//     //   mainFeature: "Job Posting And Resume Search",
//     //   features: [
//     //     "Unlimited access to Database",
//     //     "Unlimited job posting",
//     //     "Email Support",
//     //   ],
//     //   featured: true,
//     // },
//   ];

//   const yearlyPlans = [
//     {
//       name: "Start Free Trail",
//       durationPrices: ["0"],
//       mainFeature: "Premium Plan",
//       features: [
//         "1 Job Posting",
//         "14 days applicable on AI Premium Package , Standard and Premium Package",
//         // "AI Video Interview",
//         "7 Days Visibility",
//         // "Sourcing support from Skillstream team",
//         "Email Support",
//       ],
//       featured: true,
//       stripe_price_id: "price_1QNHHPE6AeqDfCrWh3ieZBwI",
//     },
//     {
//       name: "Basic",
//       durationPrices: ["$49"],
//       mainFeature: "Recommended",
//       features: [
//         "1 Job Posting",
//         " AI Fitment Analysis",
//         "AI Video Interview",
//         "30 Days Visibility",
//         "Sourcing support from Skillstream team",
//         "Email Support",
//       ],
//       featured: true,
//       stripe_price_id: "price_1RUTF5IZxOCLpw3QXJO5rCLH",
//     },
//     {
//       name: "Standard",
//       durationPrices: ["$99"],
//       mainFeature: "Standard Plan",
//       features: [
//         "3 Job Posting",
//         "30 Days Visibility",
//         " AI Fitment Analysis",
//         "AI Video Interview",
//         "Sourcing support from Skillstream team ",
//         "Email Support",
//       ],
//       featured: true,
//       stripe_price_id: "price_1RUTFgIZxOCLpw3QseyPvgiC",
//     },
//     {
//       name: "Premium",
//       durationPrices: ["$189"],
//       mainFeature: "Premium Plan",
//       features: [
//         "5 Job Posting",
//         " AI Fitment Analysis",
//         "AI Video Interview",
//         "30 Days Visibility",
//         "Sourcing support from Skillstream team",
//         "Phone Support",
//       ],
//       featured: true,
//       stripe_price_id: "price_1RUTG7IZxOCLpw3QhfBmFu0G",
//     },
//   ];

//   const [activeDurationIndex, setActiveDurationIndex] = useState(0);
//   const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
//   const [modalState, setModalState] = useState("login"); // Options: "login", "register", "forgotPassword"

//   const handleFreeTrialClick = () => {
//     setIsConfirmModalOpen(true);
//     setModalState("register"); // Automatically open the register modal
//   };

//   return (
//     <Container>
//       <ContentWithPaddingXl>
//         <HeaderContainer>
//           <Subheading>{subheading}</Subheading>
//           <Heading>{heading}</Heading>
//           <Description>{description}</Description>

//           {/* Free Trial Button */}
//           {/* <FreeTrialButton>
//             Start Free Trial
//           </FreeTrialButton> */}
//           <br />
//           <DurationSwitcher
//             durationIndex={activeDurationIndex}
//             setDurationIndex={setActiveDurationIndex}
//             planDurations={planDurations}
//           />
//         </HeaderContainer>
//         <PlansContainer>
//           {(activeDurationIndex === 0 ? defaultPlans : yearlyPlans).map(
//             (plan, index) => (
//               <Plan key={index} featured={plan.featured}>
//                 <PlanHeader>
//                   <span className="priceAndDuration">
//                     <span className="price">{plan.durationPrices[0]}</span>
//                     {/* <span className="slash"> / </span>
//                     <span className="duration">
//                       {planDurations[activeDurationIndex].text}
//                     </span> */}
//                   </span>
//                   <span className="name">{plan.name}</span>
//                   <span className="mainFeature">{plan.mainFeature}</span>
//                 </PlanHeader>
//                 <PlanFeatures>
//                   {plan.features.map((feature, index) => (
//                     <span key={index} className="feature">
//                       {feature}
//                     </span>
//                   ))}
//                 </PlanFeatures>
//                 <PlanAction>
//                   <BuyNowButton
//                     style={{
//                       display:
//                         "inline-block" /* Ensures proper spacing and hover effects */,
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       marginTop: "1.5rem" /* Equivalent to Tailwind's mt-6 */,
//                       marginBottom: "1rem" /* Equivalent to Tailwind's mb-4 */,
//                       fontSize:
//                         "0.875rem" /* Equivalent to Tailwind's text-sm */,
//                       borderRadius:
//                         "9999px" /* Equivalent to Tailwind's rounded-full */,
//                       padding:
//                         "0.5rem 1rem" /* Adding padding for better clickability */,
//                       boxShadow:
//                         "0 4px 15px rgba(66, 153, 225, 0.5)" /* Custom Shadow */,
//                       transition:
//                         "all 0.3s ease-in-out" /* Smooth transition for hover effects */,
//                       borderRadius: "10px" /* Custom border radius */,
//                       background:
//                         "linear-gradient(to right, #4299e1, #0070f3)" /* Custom Gradient */,
//                       color: "#fff" /* Text color */,
//                       cursor: "pointer" /* Change cursor on hover */,
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background =
//                         "linear-gradient(to right, #4299e1, #0056a1)";
//                       e.currentTarget.style.boxShadow =
//                         "0 6px 20px rgba(66, 153, 225, 0.7)";
//                       e.currentTarget.style.transform = "translateY(-2px)";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background =
//                         "linear-gradient(to right, #4299e1, #0070f3)";
//                       e.currentTarget.style.boxShadow =
//                         "0 4px 15px rgba(66, 153, 225, 0.5)";
//                       e.currentTarget.style.transform = "translateY(0)";
//                     }}
//                     // onClick={() => openModal()}
//                     onClick={() =>
//                       subscribe(
//                         plan.name,
//                         plan.durationPrices[0],
//                         plan.stripe_price_id
//                       )
//                     }
//                   >
//                     {primaryButtonText}
//                   </BuyNowButton>
//                 </PlanAction>
//               </Plan>
//             )
//           )}
//         </PlansContainer>
//       </ContentWithPaddingXl>
//       <DecoratorBlob1 />
//       <DecoratorBlob2 />
//       {forgotModal && (
//         <ForgotPassword
//           forgotModal={forgotModal}
//           setForgotModal={setForgotModal}
//           isModalOpen={isModalOpen}
//           setIsModalOpen={setIsModalOpen}
//           setModalType={setModalType}
//         />
//       )}
//       {confirmModal && (
//         <ConfirmModal
//           confirmModal={confirmModal}
//           setConfirmModal={setConfirmModal}
//         />
//       )}
//       {isModalOpen && (
//         <div>
//           {modalType === "login" ? (
//             <div>
//               <Login
//                 isModalOpen={isModalOpen}
//                 modalType={modalType}
//                 setIsModalOpen={setIsModalOpen}
//                 setModalType={setModalType}
//                 showModal={showModal}
//                 confirmModal={confirmModal}
//                 setConfirmModal={setConfirmModal}
//                 forgotModal={forgotModal}
//                 setForgotModal={setForgotModal}
//               />
//             </div>
//           ) : (
//             <Register
//               isModalOpen={isModalOpen}
//               modalType={modalType}
//               setIsModalOpen={setIsModalOpen}
//               setModalType={setModalType}
//             />
//           )}
//         </div>
//       )}
//     </Container>
//   );
// };
// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./Pricing.css"; // Assuming you save the CSS separately
// import { loadStripe } from "@stripe/stripe-js";
// import { Content } from "antd/es/layout/layout";
// import Login from "../../Pages/Auth/Login";
// import Register from "../../Pages/Auth/Register";
// import ConfirmModal from "../../Pages/Auth/ConfirmModal";
// import ForgotPassword from "../../Pages/Auth/ForgotPassword";
// import axios from "axios";
// import { Server } from "App";
// import { useNavigate } from "react-router-dom";
// import { Helmet } from "react-helmet";
// // price_1QNHHPE6AeqDfCrWh3ieZBwI
// const Pricing = () => {
//   const [plan, setPlan] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState("login");
//   const [confirmModal, setConfirmModal] = useState(false);
//   const [forgotModal, setForgotModal] = useState(false);
//   const navigate = useNavigate();
//   let role = localStorage.getItem("Role");
//   const showModal = (type) => {
//     setModalType(type);
//     setIsModalOpen(true);
//     // if (type === "login") {
//     //   // Your login logic goes here
//     //   // Assuming login is successful, redirect to candidates-list
//     //   navigate("/candidates-list");
//     // }
//   };
//   // console.log(process.env.REACT_APP_STRIPE_API_KEY);
//   let token = localStorage.getItem("token");
//   let userId = localStorage.getItem("UserId");
//   // let role = localStorage.getItem("Role");

//   const subscribe = async (plan, price, priceId) => {
//     try {
//       if (token) {
//         if (plan === "Free-trial") {
//           let body = {
//             plan: plan,
//           };
//           console.log(plan);

//           const { data } = await axios.post(
//             `${Server}/api/v1/subscribe/new/${userId}`,
//             body
//           );
//           navigate("/employer-dashboard");
//         } else {
//           const stripe = await loadStripe(process.env.REACT_APP_STRIPE_API_KEY);
//           const body = {
//             plan: plan,
//             amount: price,
//             priceId: priceId,
//             userId: userId,
//             role: role,
//           };
//           const headers = {
//             Content: "application/json",
//           };
//           const { data } = await axios.post(
//             `${Server}/api/v1/subscribe/US/create/checkout-session`,
//             body,
//             {
//               Headers: headers,
//             }
//           );
//           // console.log(response);
//           // const session = await response.json();
//           // localStorage.setItem("ses", data);
//           const result = stripe.redirectToCheckout({
//             sessionId: data.id,
//           });
//         }
//       } else {
//         showModal("login");
//       }
//     } catch (error) {
//       // console.log(error);
//     }
//   };
//   return (
//     <div>
//       <Helmet>
//         <meta
//           name="Job Posting Pricing | Start from $49 | Free Trial Available | Skillstream Jobs"
//           content="Explore SkillStream Jobs pricing for job postings starting from $49. Enjoy a free trial and see how our affordable plans can streamline your hiring process."
//         />
//       </Helmet>
//       <section className="page-title">
//         <div className="auto-container">
//           <div className="title-outer">
//             <h1>Pricing</h1>
//             <ul className="page-breadcrumb">
//               <li>
//                 <a href="#">Home</a>
//               </li>
//               <li>Pricing</li>
//             </ul>
//           </div>
//         </div>
//       </section>
//       <section id="pricing" className="pricing-content section-padding">
//         <div className="container">
//           <div className="section-title text-center">
//             <h2 style={{ color: "#1E90FF" }}>Job Advertising package</h2>
//             <p style={{ color: "#1E90FF" }}>
//               Choose the best package to post your job openings and attract the
//               best candidates.
//             </p>
//           </div>
//           <div className="row text-center">
//             <div
//               className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp"
//               data-wow-duration="1s"
//               data-wow-delay="0.1s"
//               data-wow-offset="0"
//             >
//               <div className="pricing_design">
//                 <div className="single-pricing">
//                   <div className="price-head">
//                     <h2>Free Trail</h2>
//                     <h1>$0</h1>
//                     {/* <span>/Per Job</span> */}
//                   </div>
//                   <ul>
//                     <li>
//                       <b>1</b> Job Posting
//                     </li>

//                     <li>
//                       <b>7</b> Days Visibility
//                     </li>

//                     <li>
//                       14 days applicable on AI Premium Package , Standard and
//                       Premium Package
//                     </li>
//                     <li>
//                       <b>Email</b> Support
//                     </li>
//                   </ul>
//                   <div className="pricing-price"></div>
//                   <button
//                     // href="#"
//                     className="price_btn"
//                     // onClick={() =>
//                     //   setPlan([
//                     //     {
//                     //       plan: "Free Trail",
//                     //       price: "0",
//                     //     },
//                     //   ])
//                     // }
//                     onClick={() =>
//                       subscribe(
//                         "Free-trial",
//                         "0",
//                         "price_1QNHHPE6AeqDfCrWh3ieZBwI"
//                       )
//                     }
//                   >
//                     Subscribe
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp"
//               data-wow-duration="1s"
//               data-wow-delay="0.1s"
//               data-wow-offset="0"
//             >
//               <div className="pricing_design">
//                 <div className="single-pricing">
//                   <div className="price-head">
//                     <h2>Basic</h2>
//                     <h1>$49</h1>
//                     {/* <span>/Per Job</span> */}
//                   </div>
//                   <ul>
//                     <li>
//                       <b>1</b> Job Posting
//                     </li>
//                     <li>
//                       <b>30</b> Days Visibility
//                     </li>
//                     <li>
//                       <b>AI</b> Fitment Analysis
//                     </li>
//                     <li>
//                       <b>AI</b> Video Assesments
//                     </li>
//                     <li>
//                       <b>Sourcing support </b> from Skillstream team
//                     </li>
//                     {/* <li>
//                       <b>Email</b> Support
//                     </li> */}
//                   </ul>
//                   <div className="pricing-price"></div>
//                   <button
//                     // href="#"
//                     className="price_btn"
//                     // onClick={() =>
//                     //   setPlan([
//                     //     {
//                     //       plan: "Basic",
//                     //       price: "49",
//                     //     },
//                     //   ])
//                     // }
//                     onClick={() =>
//                       subscribe("Basic", "49", "price_1RUTF5IZxOCLpw3QXJO5rCLH")
//                     }
//                   >
//                     Subscribe
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp"
//               data-wow-duration="1s"
//               data-wow-delay="0.2s"
//               data-wow-offset="0"
//             >
//               <div className="pricing_design">
//                 <div className="single-pricing">
//                   <div className="price-head">
//                     <h2>Standard</h2>
//                     <h1 className="price">$99</h1>
//                     {/* <span>/Per Job</span> */}
//                   </div>
//                   <ul>
//                     <li>
//                       <b>3</b> Job Postings
//                     </li>
//                     <li>
//                       <b>30</b> Days Visibility
//                     </li>
//                     <li>
//                       <b>AI</b> Fitment Analysis
//                     </li>
//                     <li>
//                       <b>AI</b> Video Assesments
//                     </li>
//                     <li>
//                       <b>Sourcing support </b> from Skillstream team
//                     </li>
//                     {/* <li>
//                       <b>Email</b> Support
//                     </li> */}
//                   </ul>
//                   <div className="pricing-price"></div>
//                   <button
//                     // href="#"
//                     className="price_btn"
//                     // onClick={() =>
//                     //   setPlan([
//                     //     {
//                     //       plan: "Standard",
//                     //       price: "129",
//                     //     },
//                     //   ])
//                     // }
//                     onClick={() =>
//                       subscribe(
//                         "Standard",
//                         "99",
//                         "price_1RUTFgIZxOCLpw3QseyPvgiC"
//                       )
//                     }
//                   >
//                     Subscribe
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="col-lg-4 col-sm-6 col-xs-12 mt-5 wow fadeInUp"
//               data-wow-duration="1s"
//               data-wow-delay="0.3s"
//               data-wow-offset="0"
//             >
//               <div className="pricing_design">
//                 <div className="single-pricing">
//                   <div className="price-head">
//                     <h2>Premium</h2>
//                     <h1 className="price">$189</h1>
//                     {/* <span>/Per Job</span> */}
//                   </div>
//                   <ul>
//                     <li>
//                       <b>Unlimited</b> Job Postings
//                     </li>
//                     <li>
//                       <b>Unlimited</b> Access to the Database
//                     </li>
//                     <li>
//                       <b>Resume Search</b>{" "}
//                     </li>
//                     <li>
//                       <b>AI</b> Fitment Analysis
//                     </li>
//                     <li>
//                       <b>AI</b> Video Assesments
//                     </li>
//                     <li>
//                       <b>30</b> Days Visibility
//                     </li>

//                     <li>
//                       <b>Sourcing support </b>
//                       from Skillstream team
//                     </li>
//                     {/* <li>
//                       <b>Email</b> Support
//                     </li> */}
//                   </ul>
//                   <div className="pricing-price"></div>

//                   <button
//                     // href="#"
//                     className="price_btn"
//                     onClick={() =>
//                       subscribe(
//                         "Premium",
//                         "189",
//                         "price_1RUTG7IZxOCLpw3QhfBmFu0G"
//                       )
//                     }
//                   >
//                     Subscribe
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//       {forgotModal && (
//         <ForgotPassword
//           forgotModal={forgotModal}
//           setForgotModal={setForgotModal}
//           isModalOpen={isModalOpen}
//           setIsModalOpen={setIsModalOpen}
//           setModalType={setModalType}
//         />
//       )}
//       {confirmModal && (
//         <ConfirmModal
//           confirmModal={confirmModal}
//           setConfirmModal={setConfirmModal}
//         />
//       )}
//       {isModalOpen && (
//         <div>
//           {modalType === "login" ? (
//             <div>
//               {/*console.log(modalType)*/}
//               <Login
//                 isModalOpen={isModalOpen}
//                 modalType={modalType}
//                 setIsModalOpen={setIsModalOpen}
//                 setModalType={setModalType}
//                 showModal={showModal}
//                 confirmModal={confirmModal}
//                 setConfirmModal={setConfirmModal}
//                 forgotModal={forgotModal}
//                 setForgotModal={setForgotModal}
//               />
//             </div>
//           ) : (
//             <Register
//               isModalOpen={isModalOpen}
//               modalType={modalType}
//               setIsModalOpen={setIsModalOpen}
//               setModalType={setModalType}
//             />
//           )}
//         </div>
//       )}
//       <section id="pricing" className="pricing-content section-padding">
//         <div className="container">
//           <div className="section-title text-center">
//             <h2 style={{ color: "1E90FF" }}>Job posting and Resume Search</h2>
//             <p style={{ color: "#1E90FF" }}>
//               Choose the best package to post your job openings and attract the
//               best candidates.
//             </p>
//           </div>
//           <div className="row justify-content-center text-center">
//             <div
//               className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp"
//               data-wow-duration="1s"
//               data-wow-delay="0.2s"
//               data-wow-offset="0"
//             >
//               <div className="pricing_design">
//                 <div className="single-pricing">
//                   <div className="price-head">
//                     <h2>Jobs with AI Search</h2>
//                     <h1 className="price">$249</h1>
//                     <span>/Per Month</span>
//                   </div>
//                   <ul>
//                     <li>Unlimited Job Postings</li>
//                     <li>
//                       Unlimited access to our Database <br /> (Available only
//                       for US)
//                     </li>
//                     <li>AI Video Interview</li>
//                     <li>AI Resume Search</li>
//                     <li>AI Fitment Analysis</li>
//                   </ul>
//                   <div className="pricing-price"></div>
//                   <button
//                     // href="#"
//                     className="price_btn"
//                     onClick={() =>
//                       subscribe(
//                         "Recommended",
//                         "249",
//                         "price_1RUTGaIZxOCLpw3QJO2jXarM"
//                       )
//                     }
//                   >
//                     Subscribe
//                   </button>
//                 </div>
//               </div>
//             </div>
//             {/*
//             <div
//               className="col-lg-4 col-sm-6 col-xs-12 wow fadeInUp"
//               data-wow-duration="1s"
//               data-wow-delay="0.2s"
//               data-wow-offset="0"
//             >
//               <div className="pricing_design">
//                 <div className="single-pricing">
//                   <div className="price-head">
//                     <h2>Recommended</h2>
//                     <h1 className="price">$299</h1>
//                     <span>/Per Month</span>
//                   </div>
//                   <ul>
//                     <li>
//                       <b>Unlimited</b> access to Database
//                     </li>
//                     <li>
//                       <b>Unlimited</b> job posting
//                     </li>
//                     <li>
//                       {" "}
//                       <b>Unlimited</b> Resume Search
//                     </li>

//                     <li>
//                       <b>Email</b> Support
//                     </li>
//                   </ul>
//                   <div className="pricing-price"></div>
//                   <a
//                     onClick={() =>
//                       subscribe(
//                         "Recommended",
//                         "299",
//                         "price_1PdWn2P218aRnkr8eMEL98xa"
//                       )
//                     }
//                     className="price_btn"
//                   >
//                     Subscribe
//                   </a>
//                 </div>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Pricing;
