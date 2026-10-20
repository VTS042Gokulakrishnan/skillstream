import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Server } from "App";
import { Button, Result } from "antd";
const PricingSuccess = () => {
  let userId = localStorage.getItem("UserId");
  const params = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get("session_id");
  const plan = query.get("plan");
  const navigate = useNavigate();
  let role = localStorage.getItem("Role");

  // useEffect(() => {
  //   updateDetails();
  // }, [sessionId]);
  // const updateDetails = async () => {
  //   try {
  //     let body = {
  //       plan: plan,
  //     };
  //     console.log(plan);

  //     const { data } = await axios.post(
  //       `${Server}/api/v1/subscribe/new/${userId}`,
  //       body
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  return (
    <div style={{ paddingTop: "100px" }}>
      {" "}
      <Result
        status="success"
        title="You subscription has been successfully completed"
        // subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => {
              if (role === "employer") {
                navigate("/employer-dashboard");
              } else if (role === "Candidate") {
                navigate("/practiceInterview");
              }
            }}
          >
            {role === "employer"
              ? "Go to Dashboard"
              : "Back to Practice Assessment"}
          </Button>,
        ]}
      />
    </div>
  );
};

export default PricingSuccess;
