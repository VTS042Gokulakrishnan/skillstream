import React from "react";
import { useNavigate } from "react-router-dom";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Result, Typography } from "antd";
const { Paragraph, Text } = Typography;
const Cancel = () => {
  const navigate = useNavigate();
  let role = localStorage.getItem("Role");

  return (
    <div style={{ paddingTop: "100px" }}>
      {" "}
      <Result
        status="error"
        title="Payment Failed"
        subTitle="Please check the payment details & try again."
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => {
              if (role === "employer") {
                navigate("/pricing");
              } else if (role === "Candidate") {
                navigate("/practiceInterview");
              }
            }}
          >
            Try again
          </Button>,
        ]}
      ></Result>
    </div>
  );
};

export default Cancel;
