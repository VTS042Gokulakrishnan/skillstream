import React, { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Server } from "../../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
const Googlelogin = ({ userType, setIsModalOpen = () => {}, policyAcceptance }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const clientId =
    "791901156890-cfquc9uvchhtq3ve65nmqh03vo5r7ulc.apps.googleusercontent.com";
  // console.log(setIsModalOpen);
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      let body = {
        credential: credentialResponse.credential,
        policyAcceptance,
        clientId: credentialResponse.clientId,
        role: userType,
        region: "United States",
      };
      // console.log(body);

      const { data } = await axios.post(
        `${Server}/api/v1/auth/googleLogin`,
        body
      );
      if (data.message === "Login Successfully") {
        // console.log("login", data);

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

            setIsModalOpen(false);
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
            if (
              location.pathname === "/" ||
              location.pathname === "/contact" ||
              location.pathname === "/employers"
            ) {
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
            setIsModalOpen(false);
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
            if (location.pathname === "/" || location.pathname === "/contact") {
              if (!data.profileCompleted) {
                navigate(`/update-profile/${data.accessToken}`);
              } else {
                navigate("/vendor/dashboard");
              }
            } else {
              navigate(location.pathname);
              window.location.reload();
            }
            let storeToken = localStorage.setItem("token", data.accessToken);
            let storeRole = localStorage.setItem("Role", data.role);
            let userId = localStorage.setItem("UserId", data.userId);
            let profileCompleted = localStorage.setItem(
              "ProfileCompleted",
              data.profileCompleted
            );
            setIsModalOpen(false);
          }, 200);
        }
      } else if (data.message === "Registered Successfully") {
        // console.log("registered", data);

        if (data.role === "Candidate") {
          if (!data.profileCompleted || !data.isResumeUploaded) {
            navigate(`/update-profile/${data.accessToken}`);
          } else {
            navigate("/candidate-dashboard");
          }
          let storeToken = localStorage.setItem("token", data.accessToken);
          let storeRole = localStorage.setItem("Role", data.role);
          let userId = localStorage.setItem("UserId", data.userId);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            data.profileCompleted
          );
        } else if (data.role === "Employer") {
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
          let storeToken = localStorage.setItem("token", data.accessToken);
          let storeRole = localStorage.setItem("Role", data.role);
          let userId = localStorage.setItem("UserId", data.userId);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            data.profileCompleted
          );
          // }, 300);
        } else if (data.role === "Vendor") {
          if (!data.profileCompleted) {
            navigate(`/update-profile/${data.accessToken}`);
          } else {
            navigate("/vendor/dashboard");
          }
          let storeToken = localStorage.setItem("token", data.accessToken);
          let storeRole = localStorage.setItem("Role", data.role);
          let userId = localStorage.setItem("UserId", data.userId);
          let profileCompleted = localStorage.setItem(
            "ProfileCompleted",
            data.profileCompleted
          );
        }
        setIsModalOpen(false);
      }
    } catch (error) {
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
    <GoogleOAuthProvider clientId={clientId}>
      <Toaster position="top-center" reverseOrder={false} />
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // console.log(credentialResponse);

          handleGoogleLogin(credentialResponse);
        }}
        onError={() => {
          navigate(userType === "Employer" ? "/employers" : "/");
          // console.log("Login Failed");
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default Googlelogin;
