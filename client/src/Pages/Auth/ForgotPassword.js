import React, { useState } from "react";
import { Button, Modal, Spin } from "antd";
import { Server } from "../../App";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ForgotPassword = (forgotModal) => {
  // console.log(forgotModal);
  const [loading, setloading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [CpasswordVisible, setCPasswordVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  // const [cPassword, setCPassword] = useState("");
  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };
  const toggleCPasswordVisibility = () => {
    setCPasswordVisible((prev) => !prev);
  };
  const handleCancel = () => {
    forgotModal.setForgotModal(false);
  };
  let userId = localStorage.getItem("UserId");
  // console.log(userId);
  // let storeRole = localStorage.setItem("Role", response.data.role);
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      let data = {
        password: password,
        securityCode: otp,
        region:"United States"
      };
      setloading(true);
      const response = await axios.post(
        `${Server}/api/v1/password/resetPassword/${userId}`,
        data
      );
      // console.log(response);
      toast.success(response.data.message);
      setTimeout(() => {
        setloading(false);
        forgotModal.setForgotModal(false);
        forgotModal.setIsModalOpen(true);
        forgotModal.setModalType("login");
      }, 300);
    } catch (error) {
      // console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
      setloading(false);
    }
  };
  return (
    <div>
      <Modal
        centered
        open={forgotModal}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div id="login-modal">
            <div class="login-form default-form">
              <div class="form-inner">
                <h3>Change Password</h3>

                <form onSubmit={handleReset}>
                  <div class="form-group">
                    <label>Enter OTP</label>
                    <input
                      type="text"
                      name="OTP"
                      placeholder="Enter OTP"
                      onChange={(e) => setOtp(e.target.value)}
                      value={otp}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-group">
                      <input
                        id="password-field"
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={passwordVisible ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-group">
                      <input
                        id="password-field"
                        type={CpasswordVisible ? "text" : "password"}
                        name="Confirm Password"
                        placeholder=" Confirm Password"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={toggleCPasswordVisibility}
                      >
                        <FontAwesomeIcon
                          icon={CpasswordVisible ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>

                  <div class="form-group">
                    <div class="field-outer">
                      <div class="input-group checkboxes square"></div>
                    </div>
                  </div>

                  <div class="form-group">
                    <button
                      class="theme-btn btn-style-one"
                      type="submit"
                      name="Change Password"
                      onClick={handleReset}
                      loading={loading}
                    >
                      {loading ? <Spin /> : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
