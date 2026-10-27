import "./EasyApply.css";
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
          String(info?.fileList[0]?.response?.data?.basic_info?.Experience_in_Years ?? "")
        );
        setjobTitle((info?.fileList[0]?.response?.data?.basic_info?.Job_Title || ""));
        setEmail((info?.fileList[0]?.response?.data?.basic_info?.email || ""));
        // setPhoneNumber(Number(info?.fileList[0]?.response?.data?.basic_info.phone_number));
        SetCountry((info?.fileList[0]?.response?.data?.basic_info?.Country || ""));
        SetCity((info?.fileList[0]?.response?.data?.basic_info?.City || ""));
        setState(
          info?.fileList[0]?.response?.data?.basic_info?.Province || ""
        );
        // console.log(info?.fileList[0]?.response?.data?.basic_info);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove() { setResume(""); setResumeData([]); },
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
    if (loading) return;
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
    <Modal className="easy-apply-modal" width={780} centered open={jobModalOpen.jobModalOpen}
      onCancel={() => !loading && handleCancel()} footer={null} closable={!loading} maskClosable={!loading}>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="ea-heading"><h2>Easy Apply</h2><p>Apply without signing in</p></div>
      <div className="ea-job"><strong>{jobModalOpen.jobData?.JobTitle}</strong><span>{[jobModalOpen.jobData?.companyName, jobModalOpen.jobData?.City, jobModalOpen.jobData?.employmentType].filter(Boolean).join(" · ")}</span></div>
      <form className="ea-form" onSubmit={handleSubmit}>
        <h3>Your resume</h3>
        <Dragger {...props} maxCount={1} multiple={false} disabled={loading} accept=".pdf,.docx">
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Drop your resume here or browse files</p>
          <p className="ant-upload-hint">PDF or DOCX</p>
        </Dragger>
        <p className="ea-note">We’ll fill in available details from your resume. Please review them.</p>
        <h3>Personal details</h3>
        <div className="ea-grid">
          <label>First name *<input required autoComplete="given-name" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} /></label>
          <label>Last name *<input required autoComplete="family-name" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} /></label>
          <label>Email address *<input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Phone number *<input required type="tel" autoComplete="tel" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} /></label>
        </div>
        <h3>Location &amp; experience</h3>
        <div className="ea-grid ea-location">
          <label>Country *<Select aria-label="Country" showSearch filterOption={filterOption} placeholder="Choose country" options={countryOptions} value={country || undefined} onChange={value => { SetCountry(value); setState(""); SetCity(""); }} /></label>
          <label>State *<Select aria-label="State" showSearch disabled={!country} filterOption={filterOption} placeholder="Choose state" options={stateOptions} value={state || undefined} onChange={value => { setState(value); SetCity(""); }} /></label>
          <label>City *<Select aria-label="City" showSearch disabled={!state} filterOption={filterOption} placeholder="Choose city" options={cityOptions} value={city || undefined} onChange={SetCity} /></label>
        </div>
        <div className="ea-grid">
          <label>Current job title *<input required placeholder="e.g. Java Developer" value={jobTitle} onChange={e => setjobTitle(e.target.value)} /></label>
          <label>Experience (years) *<input required placeholder="e.g. 5" value={experience} onChange={e => setExperience(e.target.value)} /></label>
        </div>
        <label>Work authorization *<Select aria-label="Work authorization" showSearch placeholder="Select work authorization" options={workAuthorizationOptions.map(value => ({value, label:value}))} value={workAuthorization || undefined} onChange={setWorkAuthorization} /></label>
        <div className="ea-footer">
          {jobModalOpen.onSignIn ? <button type="button" className="ea-signin" disabled={loading} onClick={jobModalOpen.onSignIn}>Already have an account? Sign in</button> : <span />}
          <div><Button disabled={loading} onClick={handleCancel}>Cancel</Button><Button type="primary" htmlType="submit" loading={loading}>Submit application →</Button></div>
        </div>
      </form>
    </Modal>
  );
};
export default Job;
