import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Modal, Spin, ConfigProvider } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import { Select, Space } from "antd";
import axios from "axios";
import { Server } from "../../App";
const { Dragger } = Upload;

const Job = (jobModalOpen) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, SetCity] = useState("");
  const [country, SetCountry] = useState("");
  const [countryData, SetCountryData] = useState([]);
  const [cityData, SetCityData] = useState([]);
  const [state, setState] = useState(""); // Add state
  const [stateData, setStateData] = useState([]); // Add state data
  const [resume, setResume] = useState("");
  const [jobTitle, setjobTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [workAuthorization, setWorkAuthorization] = useState("");

  const [applied, setApplied] = useState("");
  const [resumeData, setResumeData] = useState([]);
  const [loading, setloading] = useState(false);

  // console.log(jobModalOpen.jobData);
  const props = {
    name: "file",
    multiple: true,
    action: `${Server}/api/v1/contact/email/submit/resume`,
    // Restrict file types before upload
    beforeUpload(file) {
      const isAllowed =
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isAllowed) {
        message.error("You can only upload PDF or DOCX files!");
      }
      return isAllowed || Upload.LIST_IGNORE; // prevent upload if invalid
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        // console.log(info.file, info.fileList);
        // console.log(info?.fileList[0]?.response?.location);
      }
      if (status === "done") {
        setResume(info?.fileList[0]?.response?.location);
        setResumeData(info?.fileList[0]?.response?.data);
        setExperience(
          info?.fileList[0]?.response?.data?.basic_info?.Experience_in_Years
        );
        setjobTitle(info?.fileList[0]?.response?.data?.basic_info?.Job_Title);
        setEmail(info?.fileList[0]?.response?.data?.basic_info?.email);
        // setPhoneNumber(Number(info?.fileList[0]?.response?.data?.basic_info.phone_number));
        SetCountry(info?.fileList[0]?.response?.data?.basic_info?.Country);
        SetCity(info?.fileList[0]?.response?.data?.basic_info?.City);
        setState?.basic_info?.(
          info?.fileList[0]?.response?.data?.basic_info?.Province
        );
        // console.log(info?.fileList[0]?.response?.data?.basic_info);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      // console.log("Dropped files", e.dataTransfer.files);
    },
  };
  // console.log(resumeData);
  const location = window.location.href;
  const employerId = location.split("/")[4];
  const jobId = location.split("/")[5];
  // console.log(location.split("/"));
  // console.log("hi");
  useEffect(() => {
    fetchCountries();
  }, []);
  useEffect(() => {
    if (country) {
      fetchCities();
    }
  }, [country]);
  // console.log(resume);
  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/countries`);
      // console.log(data);
      SetCountryData(data.countries);
    } catch (error) {
      // console.log(error);
    }
  };
  const fetchStates = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/data/states/${country}`
      );
      setStateData(data.states); // Set state data
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (country) {
      fetchStates(); // Fetch states when country changes
    }
  }, [country]);
  useEffect(() => {
    if (state) {
      fetchCities(); // Fetch states when country changes
    }
  }, [state]);
  const fetchCities = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/data/cities/${country}/${state}`
      );
      // console.log(data.country_city);
      SetCityData(data.cities);
    } catch (error) {
      // console.log(error);
    }
  }; // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const countryOptions = countryData.map((e, idx) => ({
    value: e,
    label: e,
  }));

  const stateOptions = country
    ? stateData?.map((e, idx) => ({
        value: e,
        label: e,
      }))
    : [{ value: null, label: "Select Country First" }];

  const cityOptions = state
    ? cityData.map((e, idx) => ({ value: e, label: e }))
    : [{ value: null, label: "Select State First" }];

  const handleCancel = () => {
    jobModalOpen.setJobModalOpen(false);
  };
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  //  console.log(jobModalOpen.jobModalOpen);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (resume.length === 0) {
        toast.error("Upload Resume");
        setloading(false);
      } else if (firstName.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (lastName.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (email.length === 0) {
        toast.error("email required");
        setloading(false);
      } else if (phoneNumber.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (country.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (city.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (state.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (jobTitle.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (experience.length === 0) {
        toast.error("All fields required");
        setloading(false);
      } else if (workAuthorization.length === 0) {
        toast.error("Work Authorization required");
        setloading(false);
      } else {
        setloading(true);

        let basicDetails = {
          firstName,
          lastName,
          email,
          phoneNumber,
          country,
          city,
          state,
          jobTitle,
          experience,
          resume,
          empEmail: jobModalOpen.jobData.EmailAddress,
          postedJobTitle: jobModalOpen.jobData.JobTitle,
          workAuthorization,
          skills: resumeData.skills,
          Education: resumeData.Education,
          work_experience: resumeData.work_experience,
          Experience_level: resumeData.basic_info.Experience_level,
          linkedin_url: resumeData.basic_info.linkedin_url,
          technical_expertise_in_skills:
            resumeData.basic_info.technical_expertise_in_skills,
          employerId,
          jobId,
          region: "United States",
        };
        // console.log(basicDetails);
        const { data } = await axios.post(
          `${Server}/api/v1/contact/email/apply/job`,
          basicDetails
        );
        // console.log(data);
        toast.success(data.message);
        if (data.message === "Job Application has been sumbitted") {
          setloading(false);
          // toast.success(data.message);
          setTimeout(() => {
            jobModalOpen.setJobModalOpen(false);
          }, 500);
        } else {
          setloading(false);
          toast.success(data.message);
          setTimeout(() => {
            jobModalOpen.setJobModalOpen(false);
          }, 500);
        }
      }
    } catch (error) {
      // console.log(error);
      if (error?.response) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Something Went Wrong");
      }
      setloading(false);
    }
  };
  const workAuthorizationOptions = [
    "U.S. Citizen",
    "Green Card Holder",
    "H1B",
    "L1",
    "L2",
    "TN",
    "OPT EAD",
    "CPT",
    "H4 EAD",
    // "Other",
  ];
  // console.log(phoneNumber);
  return (
    <div>
      <Modal
        centered
        open={jobModalOpen.jobModalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {" "}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div className="resume-modal">
            <h2>Job Apply</h2>
            <form className="form-resume">
              <div>
                <Dragger {...props}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibited
                    from uploading company data or other banned files.
                  </p>
                </Dragger>
                {/* <div class="uploading-resume" {...props}>
                  <div class="uploadButton">
                    <input
                      class="uploadButton-input"
                      type="file"
                      name="attachments[]"
                      accept="image/*, application/pdf"
                      id="upload"
                      // onChange={InputChange}
                      multiple
                    />
                    <label class="cv-uploadButton" for="upload">
                      <span class="title">Drop files here to upload</span>
                      <span class="text">
                        To upload file size is (Max 5Mb) and allowed file types
                        are (.doc, .docx, .pdf)
                      </span>
                    </label>
                  </div>
                </div> */}
              </div>
              <div
                className="mob-order"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "20px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "20px" }}
                  className="mob-order1"
                >
                  <div class="">
                    <label className="head-nav">First Name</label>
                    <input
                      type="text"
                      name="text"
                      placeholder="First Name"
                      className="form-group1"
                      onChange={(e) => setFirstName(e.target.value)}
                      value={firstName}
                      // required
                    />
                  </div>

                  <div class="">
                    <label className="head-nav">Last Name</label>
                    <input
                      type="text"
                      name="text"
                      placeholder="Last Name"
                      className="form-group1"
                      onChange={(e) => setLastName(e.target.value)}
                      value={lastName}
                      //   // required
                    />
                  </div>
                </div>
                <div class="">
                  <label className="head-nav">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="form-group1"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    // required
                  />
                </div>

                {/* <div class="">
                  <label className="head-nav">Applied For</label>
                  <input
                    type="applied"
                    name="applied"
                    placeholder="Which role applied for"
                    className="form-group1"
                    onChange={(e) => setApplied(e.target.value)}
                    value={applied}
                    // required
                  />
                </div> */}

                <div class="">
                  <label className="head-nav">Job Title</label>
                  <input
                    type="jobTitle"
                    name="jobTitle"
                    placeholder="Job Title"
                    className="form-group1"
                    onChange={(e) => setjobTitle(e.target.value)}
                    value={jobTitle}
                    // required
                  />
                </div>

                <div class="">
                  <label className="head-nav">Total Experience</label>
                  <input
                    type="experience"
                    name="experience"
                    placeholder="Total Years of Experience (eg. 1yr 2months)"
                    className="form-group1"
                    onChange={(e) => setExperience(e.target.value)}
                    value={experience}
                    // required
                  />
                </div>

                <div class="">
                  <label className="head-nav">Phone Number</label>
                  <input
                    type="number"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    className="form-group1"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    value={phoneNumber}
                    // required
                  />
                </div>
                <div className="">
                  <label className="head-nav">Work Authorization</label>
                  <Select
                    showSearch
                    className="custom-select"
                    placeholder="Select Work Authorization"
                    style={{ width: "100%" }}
                    options={workAuthorizationOptions.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    value={workAuthorization}
                    onChange={(value) => setWorkAuthorization(value)}
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "10px" }}
                  className="mob-order1"
                >
                  <div class="form-group col-lg-4 col-md-12">
                    <label>Country</label>
                    <Select
                      showSearch
                      optionFilterProp="children"
                      virtual={false}
                      filterOption={filterOption}
                      style={{ width: "100%" }}
                      className="custom-select"
                      placeholder="Select Country"
                      options={countryOptions}
                      value={country}
                      // value={primaryIndustry}
                      onChange={(e) => SetCountry(e)}
                    />
                  </div>
                  <div class="form-group col-lg-4 col-md-12">
                    <label>State</label>
                    <Select
                      showSearch
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      filterOption={filterOption}
                      virtual={false}
                      className="custom-select"
                      placeholder="Select State"
                      options={stateOptions}
                      value={state}
                      onChange={(e) => setState(e)}
                    />
                  </div>
                  <div class="form-group col-lg-4 col-md-12">
                    <label>City</label>
                    <Select
                      showSearch
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      virtual={false}
                      filterOption={filterOption}
                      className="custom-select"
                      placeholder="Select City"
                      options={cityOptions}
                      value={city}
                      // value={primaryIndustry}
                      onChange={(e) => SetCity(e)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <button
                  className="theme-btn btn-style-two"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <span className="submit-resume">
                    {loading ? (
                      <ConfigProvider
                        theme={{
                          token: {
                            colorPrimary: "#ffff",
                          },
                        }}
                      >
                        <Spin />
                      </ConfigProvider>
                    ) : (
                      "Apply"
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Job;
