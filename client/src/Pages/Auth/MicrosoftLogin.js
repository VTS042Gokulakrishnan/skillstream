import React, { useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Server } from "App";
const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "https://www.skillstreamjobs.us", // frontend
    // frontend
  },
};

const msalInstance = new PublicClientApplication(msalConfig);
const MicrosoftLogin = ({ role, region, policyAcceptance }) => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const handleLogin = async () => {
    try {
      await msalInstance.initialize();

      const loginResponse = await msalInstance.loginPopup({
        scopes: ["User.Read"],
      });

      const accessToken = loginResponse.accessToken;
      setLoader(true);
      // Send access token + role + region to backend
      const { data } = await axios.post(
        `${Server}/api/v1/auth/microsoft/login`,
        {
          token: accessToken,
          policyAcceptance,
          role,
          region,
        }
      );

      // console.log("Login Response:", data);

      if (data.message === "Login Successfully") {
        toast.success(data.message);
        if (data.role === "Candidate") {
          setTimeout(() => {
            if (location.pathname === "/" || location.pathname === "/contact") {
              if (!data.profileCompleted || !data.isResumeUploaded) {
                navigate(`/update-profile/${data.accessToken}`);
              } else {
                navigate("/candidate-dashboard");
              }
            } else {
              navigate(location.pathname);
              window.location.reload();
            }
          }, 200);
          let storeToken = localStorage.setItem("token", data.accessToken);
          let storeRole = localStorage.setItem("Role", data.role);
          let userId = localStorage.setItem("UserId", data.userId);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            data.profileCompleted
          );
        } else if (data.role === "Employer") {
          setTimeout(() => {
            if (location.pathname === "/" || location.pathname === "/contact") {
              if (!data.profileCompleted) {
                navigate(`/update-profile/${data.accessToken}`);
              } else if (!data.subscribed) {
                navigate("/pricing");
              } else {
                navigate("/employer-dashboard");
              }
            } else {
              navigate(location.pathname);
              window.location.reload();
            }
          }, 200);
          let storeToken = localStorage.setItem("token", data.accessToken);
          let storeRole = localStorage.setItem("Role", data.role);
          let userId = localStorage.setItem("UserId", data.userId);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            data.profileCompleted
          );
          let Subscribed = localStorage.setItem("Subscribed", data.subscribed);
          let linkedInloggedIn = localStorage.setItem(
            "linkedinAccessToken",
            data.linkedInloggedIn
          );
        } else if (data.role === "Vendor") {
          setTimeout(() => {
            if (!data.profileCompleted) {
              navigate(`/update-profile/${data.accessToken}`);
            } else {
              navigate("/candidate-dashboard");
            }
          }, 200);
          let storeToken = localStorage.setItem("token", data.accessToken);
          let storeRole = localStorage.setItem("Role", data.role);
          let userId = localStorage.setItem("UserId", data.userId);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            data.profileCompleted
          );
        }
      } else if (data.message === "Registered Successfully") {
        if (data.role === "Candidate") {
          if (!data.profileCompleted || !data.isResumeUploaded) {
            navigate(`/update-profile/${data.accessToken}`);
          } else {
            navigate("/candidate-dashboard");
          }
        } else {
          // setTimeout(() => {
          if (!data.profileCompleted) {
            navigate(`/update-profile/${data.accessToken}`);
          } else if (!data.subscribed) {
            navigate("/pricing");
          } else {
            navigate("/employer-dashboard");
          }
          let linkedInloggedIn = localStorage.setItem(
            "linkedinAccessToken",
            data.linkedInloggedIn
          );
          let Subscribed = localStorage.setItem("Subscribed", data.subscribed);
          // }, 300);
        }
        let storeToken = localStorage.setItem("token", data.accessToken);
        let storeRole = localStorage.setItem("Role", data.role);
        let userId = localStorage.setItem("UserId", data.userId);
        let profileCompleted = localStorage.setItem(
          "ProfileCompleted",
          data.profileCompleted
        );
      }
      setLoader(false);

      // Store token / redirect as needed
    } catch (error) {
      setLoader(false);
      if (error.response) {
        if (
          error.response.data.message ===
          "Profile Incomplete. Please update your profile."
        ) {
          toast.error(error.response.data.message);
          if (error.response.data.role === "Candidate") {
            localStorage.setItem(
              "ResumeUploaded",
              error.response.data.isResumeUploaded
            );
          } else if (error.response.data.role === "Employer") {
            let linkedInloggedIn = localStorage.setItem(
              "linkedinAccessToken",
              error.response.data.linkedInloggedIn
            );
            let Subscribed = localStorage.setItem(
              "Subscribed",
              error.response.data.subscribed
            );
          }
          let storeToken = localStorage.setItem(
            "token",
            error.response.data.accessToken
          );
          let storeRole = localStorage.setItem(
            "Role",
            error.response.data.role
          );
          let userId = localStorage.setItem(
            "UserId",
            error.response.data.userId
          );
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            error.response.data.profileCompleted
          );
          navigate(`/update-profile/${error.response.data.accessToken}`);
        } else {
          toast(error.response.data.message, {
            icon: "❌",
          });
        }
      } else {
        toast.error("Internal server error");
      }
    }
  };
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <button
        onClick={() => handleLogin()}
        style={{
          backgroundColor: "#fff",
          color: "black",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img
          src="https://img.icons8.com/color/48/000000/microsoft.png"
          alt="Microsoft"
          style={{ width: "24px", height: "24px" }}
        />
        {loader ? "Signing in ....." : "Sign in with Microsoft"}
      </button>
    </div>
  );
};

export default MicrosoftLogin;
