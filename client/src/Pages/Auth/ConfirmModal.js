import React, { useState } from "react";
import { Button, Modal, Spin } from "antd";
import { Server } from "../../App";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
const ConfirmModal = (confirmModal) => {
  const [loading, setloading] = useState(false);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    confirmModal.setConfirmModal(false);
  };
  let userId = localStorage.getItem("UserId");
  let storeRole = localStorage.getItem("Role");
  const handleResend = async (e) => {
    // e.preventDefault();
    try {
      let data = {
        userId: userId,
        role: storeRole,
        region: "United States",
      };
      setloading(true);
      const response = await axios.post(
        `${Server}/api/v1/auth/register/confirmation/resend`,
        data
      );
      // console.log(response);
      toast.success(response.data.message);
      setTimeout(() => {
        setloading(false);
        confirmModal.setConfirmModal(false);
      }, 1000);
    } catch (error) {
      console.log("Error: ", error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };
  return (
    <div>
      <Modal
        centered
        open={confirmModal}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div id="login-modal">
            <div class="login-form default-form">
              <div class="form-inner">
                <h3>Confirm Your Email </h3>
                <div style={{ textAlign: "center", paddingBottom: "20px" }}>
                  <h4
                    style={{
                      textAlign: "center",
                      paddingBottom: "20px",
                      fontWeight: "500",
                    }}
                  >
                    Welcome to Skill Stream!{" "}
                  </h4>
                  <h4
                    style={{
                      textAlign: "center",
                      paddingBottom: "20px",
                      fontWeight: "500",
                    }}
                  >
                    {" "}
                    We are happy to welcome you on board. Please confirm your
                    email.
                  </h4>
                  <h4
                    style={{
                      textAlign: "center",
                      paddingBottom: "20px",
                      fontWeight: "500",
                    }}
                  >
                    If Link expires, Click on the button below to resend
                    verification link
                  </h4>
                </div>
                <div class="form-group">
                  <button
                    class="theme-btn btn-style-one"
                    type="submit"
                    name="log-in"
                    onClick={() => handleResend()}
                    loading={loading}
                  >
                    {loading ? <Spin /> : "Resend Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConfirmModal;
