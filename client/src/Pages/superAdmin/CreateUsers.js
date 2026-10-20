import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import { Server } from "App";
import toast, { Toaster } from "react-hot-toast";

import axios from "axios";
const CreateUsers = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [loader, setLoader] = useState(false);
  // const [passwordVisible, setPasswordVisible] = useState(false);
  let token = localStorage.getItem("token");
  let deocded = jwtDecode(token);

  // console.log(admin);

  const navigate = useNavigate();
  const generatePassword = () => {
    const password = [...Array(8)]
      .map(() => Math.random().toString(36)[2])
      .join("");
    setPassword(password);
    // console.log(password);
  };
  // const togglePasswordVisibility = () => {
  //   setPasswordVisible((prev) => !prev);
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      let payload = {
        email,
        adminEmail: deocded.email,
        password,
        role: deocded.role,
        region: "United States",
        userType,
      };
      // console.log(payload);
      const { data } = await axios.post(
        `${Server}/api/v1/superAdmin/create/users`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      setLoader(false);
      toast.success("User Created Successfully");
      setTimeout(() => {
        navigate("/allusers");
      }, 2000);
    } catch (error) {
      // console.log(error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went Wrong");
      }
      setLoader(false);
    }
  };
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Create Users </h3>
          </div>
          {/* <Toaster position="top-center" reverseOrder={false} />*/}
          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>Create with access to the users</h4>
                    <Button
                      type="primary"
                      onClick={() => navigate("/allusers")}
                    >
                      Back
                    </Button>
                  </div>

                  <div class="widget-content">
                    <form class="default-form" onSubmit={handleSubmit}>
                      <div class="row">
                        <div class="form-group col-lg-12 col-md-12">
                          <label htmlFor="jobTitle">
                            Email <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="text"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              // setErrors((prev) => ({
                              //   ...prev,
                              //   jobTitle: "",
                              // }));
                            }}
                          />
                          {/*errors.jobTitle && (
                              <p style={{ color: "#e74c3c", marginTop: "5px" }}>
                                {errors.jobTitle}
                              </p>
                            )*/}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          {" "}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              paddingBottom: "15px",
                            }}
                          >
                            <label htmlFor="jobDescription">
                              Password
                              <span style={{ color: "red" }}>*</span>
                            </label>{" "}
                            <Button
                              type="primary"
                              onClick={generatePassword}
                              // loading={loader}
                              // disabled={loader}
                            >
                              Generate Password
                            </Button>
                          </div>
                          <input
                            type="text"
                            id="password"
                            name="Password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              // setErrors((prev) => ({
                              //   ...prev,
                              //   jobDescription: "",
                              // }));
                            }}
                          />
                          {/*errors.jobDescription && (
                              <p style={{ color: "#e74c3c", marginTop: "5px" }}>
                                {errors.jobDescription}
                              </p>
                            )*/}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          <label htmlFor="resumeUpload">
                            User Type
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <select
                            onChange={(e) => {
                              setUserType(e.target.value);
                            }}
                            value={userType}
                          >
                            <option value="">Select User Type</option>
                            <option value="Admin">Admin</option>
                            {/*<option value="Admin">Admin</option>*/}
                            <option value="User">User</option>
                          </select>
                          {/*errors.file && (
                              <p style={{ color: "#e74c3c", marginTop: "5px" }}>
                                {errors.file}
                              </p>
                            )*/}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          <button
                            type="primary"
                            // size="large"
                            class="theme-btn btn-style-one"
                            disabled={loader}
                            // onClick={() => handleSubmit()}
                          >
                            {loader ? "Creating..." : "Create User"}
                          </button>
                          {/*errors.file && (
                              <p style={{ color: "#e74c3c", marginTop: "5px" }}>
                                Mandatory fields Required
                              </p>
                            )*/}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="copyright-text">
        <p>© 2024 Skill Stream. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default CreateUsers;
