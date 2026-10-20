import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Modal } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import { Select, Space, Spin, ConfigProvider } from "antd";
import axios from "axios";
import { Server } from "../../App";
import { getSkeletonUtilityClass } from "@mui/material";
const { Dragger } = Upload;

const Resume = (modalOpen) => {
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
  const [resumeData, setResumeData] = useState([]);
  const [loading, setloading] = useState(false);

  const props = {
    name: "file",
    accept: ".pdf,.doc,.docx ",
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
        // console.log(info?.fileList[0]?.response?.resumeData);
        setResume(info?.fileList[0]?.response?.location);
        setResumeData(info?.fileList[0]?.response?.skills);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      // console.log("Dropped files", e.dataTransfer.files);
    },
  };
  useEffect(() => {
    fetchCountries();
  }, []);
  useEffect(() => {
    if (country) {
      fetchCities();
    }
  }, [country]);
  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/countries`);
      // console.log(data);
      SetCountryData(data.countries);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(resumeData);
  // const InputChange = (e) => {
  //   let documents = [];
  //   let unsupportedFiles = [];

  //   for (let i = 0; i < e.target.files.length; i++) {
  //     const file = e.target.files[i];
  //     const extension = file.name.split('.').pop().toLowerCase();
  //     if (['doc', 'docx', 'pdf'].includes(extension)) {
  //       documents.push(file);
  //       let reader = new FileReader();
  //       reader.onloadend = () => {
  //         setSelectedFile((prevFiles) => {
  //           return [
  //             ...prevFiles,
  //             {
  //               id: uniqid(),
  //               file: file,
  //               filename: file.name,
  //               fileimage: reader.result,
  //               datetime: file.lastModifiedDate.toLocaleString("en-IN"),
  //               filesize: filesizes(file.size),
  //             },
  //           ];
  //         });
  //       };
  //       reader.readAsDataURL(file);
  //     } else {
  //       unsupportedFiles.push(file);
  //     }
  //   }

  //   if (unsupportedFiles.length > 0) {
  //     console.log("Unsupported files:", unsupportedFiles);
  //     alert("The following files are not supported: " + unsupportedFiles.map(file => file.name).join(", "));
  //   }
  // };
  // Fetch states based on selected country
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
    modalOpen.setModalOpen(false);
  };
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

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
      } else {
        setloading(true);
        let basicDetails = {
          firstName,
          lastName,
          email,
          phoneNumber,
          country,
          city,
          resume,
          skills: resumeData,
          region: "United States",
        };
        // console.log(modalOpen.modalOpen);
        const { data } = await axios.post(
          `${Server}/api/v1/contact/email/add/details`,
          basicDetails
        );
        // console.log(data);
        // toast.success(data.message);
        if (data.message === "Resume & details added") {
          toast.success(data.message);
          setloading(false);
          setTimeout(() => {
            modalOpen.setModalOpen(false);
          }, 800);
        } else {
          toast.success(data.message);
          setTimeout(() => {
            modalOpen.setModalOpen(false);
          }, 800);
        }
      }
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };

  return (
    <div>
      <Modal
        centered
        open={modalOpen.modalOpen}
        // onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        {" "}
        <Toaster position="top-center" reverseOrder={false} />
        <div class="model">
          <div className="resume-modal">
            <h2>Upload Resume</h2>
            <form className="form-resume" onSubmit={handleSubmit}>
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
                      // value={jobSkills}
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
                      virtual={false}
                      filterOption={filterOption}
                      className="custom-select"
                      placeholder="Select State"
                      options={stateOptions}
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
                      // value={jobSkills}
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
                  loading={loading}
                  disabled={loading}
                >
                  <span className="submit-resume">
                    {" "}
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
                      "Submit Resume"
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
export default Resume;
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Resume;
