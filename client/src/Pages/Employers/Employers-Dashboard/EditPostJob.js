import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../../App";
import { PlusOutlined } from "@ant-design/icons";
import {
  Divider,
  Input,
  Select,
  Space,
  Button,
  Spin,
  ConfigProvider,
} from "antd";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { LoaderIcon, Toaster, toast } from "react-hot-toast";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import CSS for the editor

const EditPostJob = () => {
  const params = useParams();
  const [loading, setloading] = useState(false);
  const [responsibilities, setResponsibilities] = useState([""]);
  const [SkillExperience, setSkillExperience] = useState([""]);
  const [JobTitle, setJobTitle] = useState("");
  const [JobDescription, setJobDescription] = useState("");
  const [EmailAddress, setEmailAddress] = useState("");
  const [Industry, setIndustry] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  // const [JobType, setJobType] = useState("");
  const [offeredSalary, setOfferedSalary] = useState("");
  const [jobSkills, setJobSkills] = useState([]);
  // const [carrerlevel, setCarrerlevel] = useState("");
  const [Experience, setExperience] = useState("");
  const [Qualification, setQualification] = useState("");
  const [ApplicationDeadlineDate, setApplicationDeadlineDate] = useState("");
  const [Country, setCountry] = useState("United States");
  const [City, setCity] = useState("");
  const [rate, setRate] = useState("");
  const [skillData, SetSkillData] = useState([]);
  const [countryData, SetCountryData] = useState([]);
  const [cityData, SetCityData] = useState([]);
  const [industryData, SetIndustryData] = useState([]);
  const [State, setState] = useState("");
  const [stateData, setStateData] = useState([]);
  const [jobType, setJobType] = useState(""); // Set initial state to 'Contract'
  const [addSkills, setAddSkills] = useState(""); // Set initial state to 'Contract'
  // const [industry, setIndustry] = useState(null);
  const [showOtherField, setShowOtherField] = useState(false);
  const [loader, setLoader] = useState(false);

  const [otherFieldValue, setOtherFieldValue] = useState("");
  const [otherOption, setOtherOption] = useState(false);

  const [otherInput, setOtherInput] = useState(""); // State for other input value
  const [showInput, setShowInput] = useState(false); // State to manage whether to show input or dropdown
  const [salaryPreference, setSalaryPreference] = useState("");

  // Add state variables for other form fields
  const [jobTitleError, setJobTitleError] = useState("");
  const [jobDescriptionError, setJobDescriptionError] = useState("");
  const [emailAddressError, setEmailAddressError] = useState("");
  const [jobTypeError, setJobTypeError] = useState("");
  const [offeredSalaryError, setOfferedSalaryError] = useState("");
  const [salaryPreferenceError, setSalaryPreferenceError] = useState("");
  const [IndustryError, setIndustryError] = useState("");
  const [QualificationError, setQualificationError] = useState("");
  const [ExperienceError, setExperienceError] = useState("");
  const [ApplicationDeadlineDateError, setApplicationDeadlineDateError] =
    useState("");
  const [CountryError, setCountryError] = useState("");
  const [CityError, setCityError] = useState("");
  const [StateError, setStateError] = useState("");
  const [keySkillsError, setKeySkillsError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  // const [jobSkillsError, setJobSkillsError] = useState("");
  // const [responsibilitiesError, setresponsibilitiesError] = useState("");
  const [employmentTypeError, setEmploymentTypeError] = useState("");
  const [jobId, setJobId] = useState("");
  const [allErr, setAllErr] = useState("");
  let token = localStorage.getItem("token");

  // Add state variables for other form field errors

  const validateForm = () => {
    let isValid = true;

    // Validate Job Title
    if (JobTitle.trim() === "") {
      setJobTitleError("Job title is required");
      setloading(false);
      isValid = false;
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
    } else {
      setJobTitleError("");
      setAllErr("");
    }

    // Validate Job Description
    if (JobDescription.trim() === "") {
      setJobDescriptionError("Job description is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setJobDescriptionError("");
      setAllErr("");
    }

    // Validate Email Address
    if (EmailAddress.trim() === "") {
      setEmailAddressError("Email address is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      // You can add email format validation here if needed
      setEmailAddressError("");
      setAllErr("");
    }

    // Validate Job Type
    // if (jobType.trim() === "") {
    //   setloading(false);
    //   setJobTypeError("Job type is required");
    //   isValid = false;
    // } else {
    //   setJobTypeError("");
    // }

    // if (jobType !== "Contract" && offeredSalary.trim() === "") {
    //   setOfferedSalaryError("OfferedSalary is required");
    //   setloading(false);
    //   isValid = false;
    // } else {
    //   setOfferedSalaryError("");
    // }

    if (Industry.trim() === "") {
      setIndustryError("Industry is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setIndustryError("");
      setAllErr("");
    }

    // if (Qualification.trim() === "") {
    //   setQualificationError("Qualification is required");
    //   setloading(false);
    //   isValid = false;
    // } else {
    //   setQualificationError("");
    // }

    // if (Experience.trim() === "") {
    //   setExperienceError("Experience is required");
    //   setloading(false);
    //   isValid = false;
    // } else {
    //   setExperienceError("");
    // }

    if (ApplicationDeadlineDate.trim() === "") {
      setApplicationDeadlineDateError("ApplicationDeadlineDate is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setApplicationDeadlineDateError("");
      setAllErr("");
    }

    // if (employmentType.trim() === "") {
    //   setEmploymentTypeError("EmploymentType is required");
    //   setloading(false);
    //   isValid = false;
    // } else {
    //   setEmploymentTypeError("");
    // }

    if (Country.trim() === "") {
      setCountryError("Country is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setCountryError("");
      setAllErr("");
    }

    if (City.trim() === "") {
      setCityError("City is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setCityError("");
      setAllErr("");
    }

    if (State.trim() === "") {
      setStateError("State is required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setStateError("");
      setAllErr("");
    }

    // Validate Key Skills
    if (jobSkills.length === 0) {
      setKeySkillsError("Key skills are required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setKeySkillsError("");
      setAllErr("");
    }

    // Validate Skills
    if (jobSkills.length === 0) {
      setSkillsError("Skills are required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setSkillsError("");
      setAllErr("");
    }
    if (salaryPreference.length === 0) {
      setSalaryPreferenceError("Salary preferences are required");
      setloading(false);
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      isValid = false;
    } else {
      setSalaryPreferenceError("");
      setAllErr("");
    }
    // if (jobSkills.trim() === "") {
    //   setJobSkillsError("JobSkills is required");
    //   isValid = false;
    // } else {
    //   setJobSkillsError("");
    // }

    // if (responsibilities.trim() === "") {
    //   setresponsibilitiesError("Key Responsibilities is required");
    //   isValid = false;
    // } else {
    //   setresponsibilitiesError("");
    // }

    // Add more specific validations as needed for other fields

    return isValid;
  };
  const handleSalaryPreferenceChange = (value) => {
    setSalaryPreference(value);
    // console.log(value);
  };
  const getData = async () => {
    try {
      // console.log("fetching");

      let userId = localStorage.getItem("UserId");
      console.log(userId);

      let { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/singleJob/${params.userId}/${params.jobId}`
      );
      // console.log(data);

      data = data.jobs[0];
      // console.log("fetched");

      setJobId(data?.jobId);
      setResponsibilities(data?.Responsibilties);
      setJobTitle(data?.JobTitle);
      setJobDescription(data?.JobDescription);
      setEmailAddress(data?.EmailAddress);
      setIndustry(data?.Industry);
      setEmploymentType(data?.employmentType);
      setJobSkills(data?.jobSkills);
      setExperience(data?.Experience);
      setQualification(data?.Qualification);
      setApplicationDeadlineDate(data?.ApplicationDeadlineDate);
      setCountry(data?.Country);
      setCity(data?.City);
      setRate(data?.rate?.split(" ")[3]);
      setState(data?.State);
      setJobType(data?.JobType);
      setAddSkills(data?.jobSkills);
      if (data?.offeredSalary) {
        const rawSalary = data?.offeredSalary.trim();
        if (rawSalary === "Depends on Experience (DOE)") {
          setSalaryPreference("Depends on Experience (DOE)");
        } else if (rawSalary === "Not Mention") {
          setSalaryPreference("Not Mention");
        } else {
          // Extract currency prefix from a real salary string (e.g., ₹50,000 or $60k)
          const currency1 = data?.offeredSalary;
          let currencyPrefix = currency1.substring(0, 5);
          // salaryPreference = data.jobs[0].offeredSalary.trim().substring(0, 5);
          setOfferedSalary(data?.offeredSalary?.split(" ")[3]);
          setSelectedCurrency(currencyPrefix);
          setSalaryPreference("Enter Salary");
        }
      } else {
        setSalaryPreference("Not Mention");
      }

      // console.log(selectedCurrency);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(jobId);

  useEffect(() => {
    console.log("hi");
    getData();
  }, []);

  const handleOthersCheckboxChange = (checked) => {
    setShowOtherField(checked);
    if (!checked) {
      setOtherFieldValue(""); // Reset the value of the other field if checkbox is unchecked
    }
  };

  const handleJobTypeChange = (value) => {
    setJobType(value);
  };
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  const options = [
    { value: "HTML" },
    { value: "CSS" },
    { value: "JavaScript" },
    { value: "React" },
    { value: "Node.js" },
    { value: "Python" },
    { value: "Java" },
    { value: "SQL" },
    { value: "MongoDB" },
  ];
  // console.log(jobSkills);

  // const optionValues=
  const navigate = useNavigate();
  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  useEffect(() => {
    if (profileCompleted === "false") {
      // console.log(typeof profileCompleted);
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []);
  const addResponsibility = () => {
    setResponsibilities([...responsibilities, ""]);
  };

  const removeResponsibility = (index) => {
    const updatedResponsibilities = [...responsibilities];
    updatedResponsibilities.splice(index, 1);
    setResponsibilities(updatedResponsibilities);
  };

  const handleResponsibilityChange = (index, value) => {
    const updatedResponsibilities = [...responsibilities];
    updatedResponsibilities[index] = value;
    setResponsibilities(updatedResponsibilities);
  };

  const addSkillExperience = () => {
    setSkillExperience([...SkillExperience, ""]);
  };

  const removeSkillExperience = (index) => {
    const updatedSkillExperience = [...SkillExperience];
    updatedSkillExperience.splice(index, 1);
    setSkillExperience(updatedSkillExperience);
  };

  const handleSkillExperienceChange = (index, value) => {
    const updatedSkillExperience = [...SkillExperience];
    updatedSkillExperience[index] = value;
    setSkillExperience(updatedSkillExperience);
  };
  // console.log(jobType);
  const handlePostJob = async (e) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      setAllErr(
        "Some required fields are missing. Please complete all fields before submitting."
      );
      return; // Exit early if form validation fails
    }
    setloading(true);
    setAllErr("");
    try {
      // Construct formData object based on jobType
      let formData;
      if (jobType === "Contract") {
        formData = {
          jobId: params.jobId,
          Responsibilties: responsibilities,
          // skill_Experience: SkillExperience,
          JobTitle,
          JobDescription,
          EmailAddress,
          Industry,
          employmentType,
          JobType: jobType,
          rate:
            salaryPreference === "Enter Salary"
              ? `${selectedCurrency} ${rate}`
              : salaryPreference,
          jobSkills,
          Experience,
          Qualification,
          ApplicationDeadlineDate,
          Country,
          City,
          State,
          region: "United States",
        };
      } else {
        formData = {
          Responsibilties: responsibilities,
          // skill_Experience: SkillExperience,
          JobTitle,
          JobDescription,
          EmailAddress,
          Industry,
          employmentType,
          JobType: jobType,
          offeredSalary:
            salaryPreference === "Enter Salary"
              ? `${selectedCurrency}  ${offeredSalary}`
              : salaryPreference,
          jobSkills,
          Experience,
          Qualification,
          ApplicationDeadlineDate,
          Country,
          City,
          State,
          region: "United States",
          jobId: params.jobId,
        };
      }
      // console.log(formData);
      // Make API call
      let userId = localStorage.getItem("UserId");

      const { data } = await axios.post(
        `${Server}/api/v1/employer/jobs/post/edit/${params.userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      setloading(false);
      toast.success("JOB Updated Successfully");
      navigate(`/job-detail/${params.userId}/${data.jobId}`);
      // Reload the page after successful submission
    } catch (error) {
      setloading(false);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Internal Server Error");
      }
    }
  };
  // console.log(jobSkills);

  useEffect(() => {
    fetchCountries();
    fetchSkills();
    fetchIndustries();
  }, []);

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/countries`);
      // console.log(data);
      SetCountryData(data.countries);
    } catch (error) {
      // console.log(error);
    }
  };
  // Fetch states based on selected country
  const fetchStates = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/data/states/${Country}`
      );
      setStateData(data.states); // Set state data
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (Country) {
      fetchStates(); // Fetch states when country changes
    }
  }, [Country]);
  useEffect(() => {
    if (State) {
      fetchCities(); // Fetch states when country changes
    }
  }, [State]);
  const fetchCities = async () => {
    try {
      const { data } = await axios.get(
        `${Server}/api/v1/data/cities/${Country}/${State}`
      );
      // console.log(data.country_city);
      SetCityData(data.cities);
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchSkills = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/skills`);
      // console.log(data.country_city);
      SetSkillData(data.skills);
    } catch (error) {
      // console.log(error);
    }
  };
  const fetchIndustries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/industries`);
      // console.log(data.industries);
      SetIndustryData(data.industries);
    } catch (error) {
      // console.log(error);
    }
  };
  // Filter `option.label` match the user type `input`
  const stateOptions = Country
    ? stateData?.map((e, idx) => ({ value: e, label: e }))
    : [{ value: null, label: "Select Country First" }];

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const countryOptions = countryData?.map((e, idx) => ({
    value: e,
    label: e,
  }));

  const cityOptions = State
    ? cityData.map((e, idx) => ({ value: e, label: e }))
    : [{ value: null, label: "Select State First" }];
  const skillOptions = skillData?.map((e, idx) => ({ value: e, label: e }));

  const industryOptions = [
    { value: "other", label: "Other" }, // Add an "Other" option
    ...industryData?.map((e, idx) => ({
      value: e,
      label: e,
    })),
  ];
  // console.log(Qualification);

  const [selectedCurrency, setSelectedCurrency] = useState("CAD $"); // Default currency is USD
  // console.log(selectedCurrency);

  // Function to handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  // Handler for selecting an option from the dropdown
  const handleIndustryChange = (selectedOption) => {
    if (selectedOption === "other") {
      // If "Other" is selected, set Industry to "other"
      setIndustry("other");
    } else {
      // If other industry is selected, set the selected industry state
      setIndustry(selectedOption);
    }
  };

  // Handler for input field change
  const handleInputChange = (e) => {
    setOtherInput(e.target.value);
  };

  const addSkill = async () => {
    try {
      const { data } = await axios.post(`${Server}/api/v1/data/addSkills`, {
        jobSkills: addSkills,
      });
      // console.log(data);
      fetchSkills();
    } catch (error) {
      // console.log(error);
    }
  };
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }], // Text color and background color
      // [{ 'font': [] }], // Font selection
      [{ size: ["small", false, "large", "huge"] }], // Font size
      // [{ lineHeight: ["1", "1.5", "2"] }], // Line height
      ["link", "image"],
      ["clean"], // Remove formatting button
    ],
  };
  const handleJobDescriptionChange = (value) => {
    setJobDescription(value); // Update state with the editor's value
  };
  const completeAI = async () => {
    try {
      if (JobTitle) {
        setJobTitleError("");
        setLoader(true);
        let formData = { jobTitle: JobTitle };
        const { data } = await axios.post(
          `${Server}/api/v1/parser/generate/description`,
          formData
        );
        // console.log(data);
        setJobDescription(data?.jobDescription);
        setResponsibilities(data?.keySkills_responsibilities);
        // setJobSkills(data?.skills);
        setLoader(false);
      } else {
        toast.error("Please select a job title");
        setJobTitleError("Job title is required");
      }
    } catch (error) {
      // console.log(error);
      setLoader(false);
      toast.error("Internal Server Error");
    }
  };
  // console.log(offeredSalary);
  return (
    <div>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Edit Job</h3>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>Update Job Details</h4>
                  </div>
                  <Toaster position="top-center" reverseOrder={false} />

                  <div class="widget-content">
                    {/* <div class="post-job-steps">
                      <div class="step">
                        <span class="icon flaticon-briefcase"></span>
                        <h5>Job Detail</h5>
                      </div>

                      <div class="step">
                        <span class="icon flaticon-money"></span>
                        <h5>Package & Payments</h5>
                      </div>

                      <div class="step">
                        <span class="icon flaticon-checked"></span>
                        <h5>Confirmation</h5>
                      </div>
                    </div>*/}

                    <form class="default-form" onSubmit={handlePostJob}>
                      <div class="row">
                        <div class="form-group col-lg-12 col-md-12">
                          <label>Job Title</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Title"
                            value={JobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                          />
                          {jobTitleError && (
                            <div className="error-message">{jobTitleError}</div>
                          )}
                        </div>
                        <div class="form-group col-lg-12 col-md-12">
                          <label>Job Description</label>
                          <div class="d-flex justify-content-end mb-4">
                            {loader ? (
                              <Spin colorPrimary="black" />
                            ) : (
                              <Button
                                style={{
                                  backgroundColor: "#007bff", // Primary blue color
                                  color: "white",
                                  padding: "10px 20px",
                                  borderRadius: "5px",
                                  border: "none",
                                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                  transition:
                                    "background-color 0.3s, transform 0.3s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.backgroundColor = "#0056b3")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.backgroundColor = "#007bff")
                                }
                                onClick={() => completeAI()}
                              >
                                Complete with AI
                              </Button>
                            )}
                          </div>
                          <ReactQuill
                            value={JobDescription}
                            onChange={handleJobDescriptionChange}
                            class="scroll-black"
                            modules={quillModules} // Use the updated modules
                            style={{
                              height: "auto",
                              maxHeight: "300px",
                              overflow: "scroll",
                              overflowX: "hidden",
                            }}
                          />
                          {jobDescriptionError && (
                            <div className="error-message">
                              {jobDescriptionError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Email Address</label>
                          <input
                            type="email"
                            name="name"
                            placeholder="Enter Email Address"
                            value={EmailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                          />
                          {emailAddressError && (
                            <div className="error-message">
                              {emailAddressError}
                            </div>
                          )}
                        </div>
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Job Type</label>
                          <Select
                            style={{ width: "100%" }}
                            virtual={false}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="Select Job Type"
                            className="custom-select"
                            value={jobType}
                            onChange={handleJobTypeChange}
                          >
                            <option value="Full Time">Full Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Contract">Contract</option>
                          </Select>
                          {jobTypeError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {jobTypeError}
                            </div>
                          )}
                        </div>

                        <div className="form-group  col-lg-12 col-md-12">
                          <label>Salary Preference</label>
                          <Select
                            style={{ width: "100%" }}
                            placeholder="Select Job Type"
                            className="custom-select"
                            value={salaryPreference}
                            onChange={handleSalaryPreferenceChange}
                            virtual={false}
                          >
                            <option value="Enter Salary">Enter Salary</option>
                            <option value="Depends on Experience (DOE)">
                              Depends on Experience (DOE)
                            </option>
                            <option value="Not Mention">Not Mention</option>
                          </Select>
                        </div>
                        {salaryPreferenceError && (
                          <div
                            className="error-message"
                            style={{ marginTop: "12px" }}
                          >
                            {salaryPreferenceError}
                          </div>
                        )}
                        {salaryPreference === "Enter Salary" ? (
                          jobType === "Contract" ? (
                            <div class="form-group  col-lg-12 col-md-12">
                              <label>Hours/Rate</label>
                              <div class="input-group1">
                                <div class="input-group-prepend">
                                  <select
                                    id="currencyDropdown"
                                    class="custom-select"
                                    value={selectedCurrency} // Bind selected currency here
                                    onChange={(e) =>
                                      handleCurrencyChange(e.target.value)
                                    }
                                  >
                                    <option value="AED إ.د">AED</option>
                                    <option value="AFN ؋">AFN</option>
                                    <option value="ALL Lek">ALL</option>
                                    <option value="AMD ֏">AMD</option>
                                    <option value="ANG ƒ">ANG</option>
                                    <option value="AOA Kz">AOA</option>
                                    <option value="ARS $">ARS</option>
                                    <option value="AUD $">AUD</option>
                                    <option value="AWG ƒ">AWG</option>
                                    <option value="AZN m">AZN</option>
                                    <option value="BAM KM">BAM</option>
                                    <option value="BBD Bds$">BBD</option>
                                    <option value="BDT ৳">BDT</option>
                                    <option value="BGN Лв.">BGN</option>
                                    <option value="BHD .د.ب">BHD</option>
                                    <option value="BIF FBu">BIF</option>
                                    <option value="BMD $">BMD</option>
                                    <option value="BND B$">BND</option>
                                    <option value="BOB Bs.">BOB</option>
                                    <option value="BRL R$">BRL</option>
                                    <option value="BSD B$">BSD</option>
                                    <option value="BTN Nu.">BTN</option>
                                    <option value="BWP P">BWP</option>
                                    <option value="BYR Br">BYR</option>
                                    <option value="BZD $">BZD</option>
                                    <option value="CAD $">CAD</option>
                                    <option value="CDF FC">CDF</option>
                                    <option value="CHF CHf">CHF</option>
                                    <option value="CLP $">CLP</option>
                                    <option value="CNY ¥">CNY</option>
                                    <option value="COP $">COP</option>
                                    <option value="CRC ₡">CRC</option>
                                    <option value="CUC $, CUC">CUC</option>
                                    <option value="CUP $">CUP</option>
                                    <option value="CVE $">CVE</option>
                                    <option value="CZK Kč">CZK</option>
                                    <option value="DEM DM">DEM</option>
                                    <option value="DJF Fdj">DJF</option>
                                    <option value="DKK Kr.">DKK</option>
                                    <option value="DOP $">DOP</option>
                                    <option value="DZD دج">DZD</option>
                                    <option value="EGP ج.م">EGP</option>
                                    <option value="ERN Nfk">ERN</option>
                                    <option value="ETB Nkf">ETB</option>
                                    <option value="EUR €">EUR</option>
                                    <option value="FJD FJ$">FJD</option>
                                    <option value="FKP £">FKP</option>
                                    <option value="FRF fr">FRF</option>
                                    <option value="GBP £">GBP</option>
                                    <option value="GEL ლ">GEL</option>
                                    <option value="GHS GH₵">GHS</option>
                                    <option value="GIP £">GIP</option>
                                    <option value="GMD D">GMD</option>
                                    <option value="GNF FG">GNF</option>
                                    <option value="GTQ Q">GTQ</option>
                                    <option value="GYD $">GYD</option>
                                    <option value="HKD $">HKD</option>
                                    <option value="HNL L">HNL</option>
                                    <option value="HRK kn">HRK</option>
                                    <option value="HTG G">HTG</option>
                                    <option value="HUF Ft">HUF</option>
                                    <option value="IDR Rp">IDR</option>
                                    <option value="ILS ₪">ILS</option>
                                    <option value="INR ₹">INR</option>
                                    <option value="IQD د.ع">IQD</option>
                                    <option value="IRR ﷼">IRR</option>
                                    <option value="ISK kr">ISK</option>
                                    <option value="ITL L,£">ITL</option>
                                    <option value="JMD J$">JMD</option>
                                    <option value="JOD ا.د">JOD</option>
                                    <option value="JPY ¥">JPY</option>
                                    <option value="KES KSh">KES</option>
                                    <option value="KGS лв">KGS</option>
                                    <option value="KHR KHR">KHR</option>
                                    <option value="KMF CF">KMF</option>
                                    <option value="KPW ₩">KPW</option>
                                    <option value="KRW ₩">KRW</option>
                                    <option value="KWD ك.د">KWD</option>
                                    <option value="KYD $">KYD</option>
                                    <option value="KZT лв">KZT</option>
                                    <option value="LAK ₭">LAK</option>
                                    <option value="LBP £">LBP</option>
                                    <option value="LKR Rs">LKR</option>
                                    <option value="LRD $">LRD</option>
                                    <option value="LSL L">LSL</option>
                                    <option value="LTL Lt">LTL</option>
                                    <option value="LVL Ls">LVL</option>
                                    <option value="LYD د.ل">LYD</option>
                                    <option value="MAD MAD">MAD</option>
                                    <option value="MDL L">MDL</option>
                                    <option value="MGA Ar">MGA</option>
                                    <option value="MKD ден">MKD</option>
                                    <option value="MMK K">MMK</option>
                                    <option value="MNT ₮">MNT</option>
                                    <option value="MOP $">MOP</option>
                                    <option value="MRO MRU">MRO</option>
                                    <option value="MUR ₨">MUR</option>
                                    <option value="MVR Rf">MVR</option>
                                    <option value="MWK MK">MWK</option>
                                    <option value="MXN $">MXN</option>
                                    <option value="MYR RM">MYR</option>
                                    <option value="MZN MT">MZN</option>
                                    <option value="NAD $">NAD</option>
                                    <option value="NGN ₦">NGN</option>
                                    <option value="NIO C$">NIO</option>
                                    <option value="NOK kr">NOK</option>
                                    <option value="NPR ₨">NPR</option>
                                    <option value="NZD $">NZD</option>
                                    <option value="OMR .ع.ر">OMR</option>
                                    <option value="PAB B/.">PAB</option>
                                    <option value="PEN S/.">PEN</option>
                                    <option value="PGK K">PGK</option>
                                    <option value="PHP ₱">PHP</option>
                                    <option value="PKR ₨">PKR</option>
                                    <option value="PLN zł">PLN</option>
                                    <option value="PYG ₲">PYG</option>
                                    <option value="QAR ق.ر">QAR</option>
                                    <option value="RON lei">RON</option>
                                    <option value="RSD din">RSD</option>
                                    <option value="RUB ₽">RUB</option>
                                    <option value="RWF FRw">RWF</option>
                                    <option value="SAR ﷼">SAR</option>
                                    <option value="SBD Si$">SBD</option>
                                    <option value="SCR SRe">SCR</option>
                                    <option value="SDG .س.ج">SDG</option>
                                    <option value="SEK kr">SEK</option>
                                    <option value="SGD $">SGD</option>
                                    <option value="SHP £">SHP</option>
                                    <option value="SLL Le">SLL</option>
                                    <option value="SOS Sh.so.">SOS</option>
                                    <option value="SRD $">SRD</option>
                                    <option value="SSP £">SSP</option>
                                    <option value="STD Db">STD</option>
                                    <option value="SVC ₡">SVC</option>
                                    <option value="SYP LS">SYP</option>
                                    <option value="SZL E">SZL</option>
                                    <option value="THB ฿">THB</option>
                                    <option value="TJS SM">TJS</option>
                                    <option value="TMT T">TMT</option>
                                    <option value="TND ت.د">TND</option>
                                    <option value="TOP $">TOP</option>
                                    <option value="TRY ₺">TRY</option>
                                    <option value="TTD $">TTD</option>
                                    <option value="TWD $">TWD</option>
                                    <option value="TZS TSh">TZS</option>
                                    <option value="UAH ₴">UAH</option>
                                    <option value="UGX USh">UGX</option>
                                    <option value="USD $">USD</option>
                                    <option value="UYU $">UYU</option>
                                    <option value="UZS лв">UZS</option>
                                    <option value="VEF Bs">VEF</option>
                                    <option value="VND ₫">VND</option>
                                    <option value="VUV VT">VUV</option>
                                    <option value="WST SAT">WST</option>
                                    <option value="XAF FCFA">XAF</option>
                                    <option value="XCD $">XCD</option>
                                    <option value="XOF CFA">XOF</option>
                                    <option value="XPF ₣">XPF</option>
                                    <option value="YER ﷼">YER</option>
                                    <option value="ZAR R">ZAR</option>
                                    <option value="ZMK ZK">ZMK</option>
                                    <option value="ZMW ZK">ZMW</option>
                                  </select>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Rate/Hr"
                                  value={rate} // Only salary value is shown
                                  onChange={(e) => setRate(e.target.value)}
                                  style={{ width: "100%" }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div class="form-group  col-lg-12 col-md-12">
                              <label>Offered Salary</label>
                              <div class="input-group1">
                                <div class="form-group col-lg-3 col-md-12">
                                  <select
                                    id="currencyDropdown"
                                    class={`custom-select ${
                                      jobType === "Contract"
                                        ? "disabled-input"
                                        : ""
                                    }`}
                                    value={selectedCurrency} // Bind selected currency here
                                    onChange={(e) => {
                                      handleCurrencyChange(e.target.value);
                                    }}
                                    disabled={jobType === "Contract"}
                                  >
                                    <option value="AED إ.د">AED</option>
                                    <option value="AFN ؋">AFN</option>
                                    <option value="ALL Lek">ALL</option>
                                    <option value="AMD ֏">AMD</option>
                                    <option value="ANG ƒ">ANG</option>
                                    <option value="AOA Kz">AOA</option>
                                    <option value="ARS $">ARS</option>
                                    <option value="AUD $">AUD</option>
                                    <option value="AWG ƒ">AWG</option>
                                    <option value="AZN m">AZN</option>
                                    <option value="BAM KM">BAM</option>
                                    <option value="BBD Bds$">BBD</option>
                                    <option value="BDT ৳">BDT</option>
                                    <option value="BGN Лв.">BGN</option>
                                    <option value="BHD .د.ب">BHD</option>
                                    <option value="BIF FBu">BIF</option>
                                    <option value="BMD $">BMD</option>
                                    <option value="BND B$">BND</option>
                                    <option value="BOB Bs.">BOB</option>
                                    <option value="BRL R$">BRL</option>
                                    <option value="BSD B$">BSD</option>
                                    <option value="BTN Nu.">BTN</option>
                                    <option value="BWP P">BWP</option>
                                    <option value="BYR Br">BYR</option>
                                    <option value="BZD $">BZD</option>
                                    <option value="CAD $">CAD</option>
                                    <option value="CDF FC">CDF</option>
                                    <option value="CHF CHf">CHF</option>
                                    <option value="CLP $">CLP</option>
                                    <option value="CNY ¥">CNY</option>
                                    <option value="COP $">COP</option>
                                    <option value="CRC ₡">CRC</option>
                                    <option value="CUC $, CUC">CUC</option>
                                    <option value="CUP $">CUP</option>
                                    <option value="CVE $">CVE</option>
                                    <option value="CZK Kč">CZK</option>
                                    <option value="DEM DM">DEM</option>
                                    <option value="DJF Fdj">DJF</option>
                                    <option value="DKK Kr.">DKK</option>
                                    <option value="DOP $">DOP</option>
                                    <option value="DZD دج">DZD</option>
                                    <option value="EGP ج.م">EGP</option>
                                    <option value="ERN Nfk">ERN</option>
                                    <option value="ETB Nkf">ETB</option>
                                    <option value="EUR €">EUR</option>
                                    <option value="FJD FJ$">FJD</option>
                                    <option value="FKP £">FKP</option>
                                    <option value="FRF fr">FRF</option>
                                    <option value="GBP £">GBP</option>
                                    <option value="GEL ლ">GEL</option>
                                    <option value="GHS GH₵">GHS</option>
                                    <option value="GIP £">GIP</option>
                                    <option value="GMD D">GMD</option>
                                    <option value="GNF FG">GNF</option>
                                    <option value="GTQ Q">GTQ</option>
                                    <option value="GYD $">GYD</option>
                                    <option value="HKD $">HKD</option>
                                    <option value="HNL L">HNL</option>
                                    <option value="HRK kn">HRK</option>
                                    <option value="HTG G">HTG</option>
                                    <option value="HUF Ft">HUF</option>
                                    <option value="IDR Rp">IDR</option>
                                    <option value="ILS ₪">ILS</option>
                                    <option value="INR ₹">INR</option>
                                    <option value="IQD د.ع">IQD</option>
                                    <option value="IRR ﷼">IRR</option>
                                    <option value="ISK kr">ISK</option>
                                    <option value="ITL L,£">ITL</option>
                                    <option value="JMD J$">JMD</option>
                                    <option value="JOD ا.د">JOD</option>
                                    <option value="JPY ¥">JPY</option>
                                    <option value="KES KSh">KES</option>
                                    <option value="KGS лв">KGS</option>
                                    <option value="KHR KHR">KHR</option>
                                    <option value="KMF CF">KMF</option>
                                    <option value="KPW ₩">KPW</option>
                                    <option value="KRW ₩">KRW</option>
                                    <option value="KWD ك.د">KWD</option>
                                    <option value="KYD $">KYD</option>
                                    <option value="KZT лв">KZT</option>
                                    <option value="LAK ₭">LAK</option>
                                    <option value="LBP £">LBP</option>
                                    <option value="LKR Rs">LKR</option>
                                    <option value="LRD $">LRD</option>
                                    <option value="LSL L">LSL</option>
                                    <option value="LTL Lt">LTL</option>
                                    <option value="LVL Ls">LVL</option>
                                    <option value="LYD د.ل">LYD</option>
                                    <option value="MAD MAD">MAD</option>
                                    <option value="MDL L">MDL</option>
                                    <option value="MGA Ar">MGA</option>
                                    <option value="MKD ден">MKD</option>
                                    <option value="MMK K">MMK</option>
                                    <option value="MNT ₮">MNT</option>
                                    <option value="MOP $">MOP</option>
                                    <option value="MRO MRU">MRO</option>
                                    <option value="MUR ₨">MUR</option>
                                    <option value="MVR Rf">MVR</option>
                                    <option value="MWK MK">MWK</option>
                                    <option value="MXN $">MXN</option>
                                    <option value="MYR RM">MYR</option>
                                    <option value="MZN MT">MZN</option>
                                    <option value="NAD $">NAD</option>
                                    <option value="NGN ₦">NGN</option>
                                    <option value="NIO C$">NIO</option>
                                    <option value="NOK kr">NOK</option>
                                    <option value="NPR ₨">NPR</option>
                                    <option value="NZD $">NZD</option>
                                    <option value="OMR .ع.ر">OMR</option>
                                    <option value="PAB B/.">PAB</option>
                                    <option value="PEN S/.">PEN</option>
                                    <option value="PGK K">PGK</option>
                                    <option value="PHP ₱">PHP</option>
                                    <option value="PKR ₨">PKR</option>
                                    <option value="PLN zł">PLN</option>
                                    <option value="PYG ₲">PYG</option>
                                    <option value="QAR ق.ر">QAR</option>
                                    <option value="RON lei">RON</option>
                                    <option value="RSD din">RSD</option>
                                    <option value="RUB ₽">RUB</option>
                                    <option value="RWF FRw">RWF</option>
                                    <option value="SAR ﷼">SAR</option>
                                    <option value="SBD Si$">SBD</option>
                                    <option value="SCR SRe">SCR</option>
                                    <option value="SDG .س.ج">SDG</option>
                                    <option value="SEK kr">SEK</option>
                                    <option value="SGD $">SGD</option>
                                    <option value="SHP £">SHP</option>
                                    <option value="SLL Le">SLL</option>
                                    <option value="SOS Sh.so.">SOS</option>
                                    <option value="SRD $">SRD</option>
                                    <option value="SSP £">SSP</option>
                                    <option value="STD Db">STD</option>
                                    <option value="SVC ₡">SVC</option>
                                    <option value="SYP LS">SYP</option>
                                    <option value="SZL E">SZL</option>
                                    <option value="THB ฿">THB</option>
                                    <option value="TJS SM">TJS</option>
                                    <option value="TMT T">TMT</option>
                                    <option value="TND ت.د">TND</option>
                                    <option value="TOP $">TOP</option>
                                    <option value="TRY ₺">TRY</option>
                                    <option value="TTD $">TTD</option>
                                    <option value="TWD $">TWD</option>
                                    <option value="TZS TSh">TZS</option>
                                    <option value="UAH ₴">UAH</option>
                                    <option value="UGX USh">UGX</option>
                                    <option value="USD $">USD</option>
                                    <option value="UYU $">UYU</option>
                                    <option value="UZS лв">UZS</option>
                                    <option value="VEF Bs">VEF</option>
                                    <option value="VND ₫">VND</option>
                                    <option value="VUV VT">VUV</option>
                                    <option value="WST SAT">WST</option>
                                    <option value="XAF FCFA">XAF</option>
                                    <option value="XCD $">XCD</option>
                                    <option value="XOF CFA">XOF</option>
                                    <option value="XPF ₣">XPF</option>
                                    <option value="YER ﷼">YER</option>
                                    <option value="ZAR R">ZAR</option>
                                    <option value="ZMK ZK">ZMK</option>
                                    <option value="ZMW ZK">ZMW</option>
                                  </select>
                                </div>
                                <input
                                  type="text"
                                  name="name"
                                  id="selectedCurrency"
                                  class={`form-control ${
                                    jobType === "Contract"
                                      ? "disabled-input"
                                      : ""
                                  }`}
                                  placeholder="Enter Offered Salary"
                                  value={offeredSalary} // Only salary value is shown
                                  onChange={(e) => {
                                    setOfferedSalary(e.target.value);
                                    setOfferedSalaryError("");
                                  }}
                                  disabled={jobType === "Contract"}
                                />
                              </div>
                              {offeredSalaryError && (
                                <div className="error-message">
                                  {offeredSalaryError}
                                </div>
                              )}
                            </div>
                          )
                        ) : null}
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Experience</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Experience"
                            value={Experience}
                            onChange={(e) => setExperience(e.target.value)}
                          />
                          {ExperienceError && (
                            <div className="error-message">
                              {ExperienceError}
                            </div>
                          )}
                        </div>
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Industry</label>
                          {Industry === "other" || otherInput !== "" ? (
                            // If "Other" is selected or input field has a value, show input field and dropdown
                            <>
                              <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Enter Other Industry"
                                value={otherInput}
                                onChange={handleInputChange}
                              />
                              <select
                                style={{ width: "100%" }}
                                className="custom-select"
                                placeholder="Select Industry"
                                onChange={(e) =>
                                  handleIndustryChange(e.target.value)
                                }
                                value={Industry}
                              >
                                <option value="">Select an industry</option>
                                {industryData((industry) => (
                                  <option key={industry} value={industry}>
                                    {industry}
                                  </option>
                                ))}
                                <option value="other">Other</option>
                              </select>
                            </>
                          ) : (
                            // Otherwise, only show the dropdown
                            <select
                              style={{ width: "100%" }}
                              className="custom-select"
                              placeholder="Select Industry"
                              onChange={(e) =>
                                handleIndustryChange(e.target.value)
                              }
                              value={Industry}
                            >
                              <option value="">Select an industry</option>
                              {industryData?.map((industry) => (
                                <option key={industry} value={industry}>
                                  {industry}
                                </option>
                              ))}
                              <option value="other">Other</option>
                            </select>
                          )}
                          {IndustryError && (
                            <div className="error-message">{IndustryError}</div>
                          )}
                        </div>
                        {/* <div className="form-group col-lg-6 col-md-12">
                        <label>Industry</label>
                        <Select
                          style={{ width: "100%" }}
                          optionFilterProp="children"
                          filterOption={filterOption}
                          className="custom-select"
                          placeholder="Select Industry"
                          options={industryOptions}
                          onChange={(e) => setIndustry(e)}
                        />

                        <div
                          className="form-group-5"
                          style={{
                            display: "flex",
                            marginTop: "20px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <label>
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                handleOthersCheckboxChange(e.target.checked)
                              }
                            />
                            Others
                          </label>
                        </div>
                      </div>

                      {showOtherField && (
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Others</label>
                          <input
                            type="text"
                            className="form-control"
                            value={otherFieldValue}
                            onChange={(e) =>
                              setOtherFieldValue(e.target.value)
                            }
                          />
                        </div>
                      )} */}
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Qualification</label>
                          <Select
                            style={{ width: "100%" }}
                            optionFilterProp="children"
                            virtual={false}
                            filterOption={filterOption}
                            placeholder="Select Job Type"
                            className="custom-select"
                            options={[
                              { value: "Graduate", label: "Graduate" },
                              {
                                value: "Post-Graduate",
                                label: "Post-Graduate",
                              },
                              { value: "Student", label: "Student" },
                            ]}
                            value={Qualification}
                            onChange={(e) => {
                              setQualification(e);
                            }}
                          />
                          {QualificationError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {QualificationError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Application Deadline Date</label>
                          <input
                            type="date"
                            name="name"
                            placeholder="06.04.2020"
                            value={ApplicationDeadlineDate}
                            onChange={(e) =>
                              setApplicationDeadlineDate(e.target.value)
                            }
                          />
                          {ApplicationDeadlineDateError && (
                            <div className="error-message">
                              {ApplicationDeadlineDateError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Employment Type</label>

                          <Select
                            style={{ width: "100%" }}
                            optionFilterProp="children"
                            virtual={false}
                            filterOption={filterOption}
                            placeholder="Select Employment Type"
                            className="custom-select"
                            options={[
                              { value: "Permanent", label: "Permanent" },
                              {
                                value: "Temporary",
                                label: "Temporary",
                              },
                              { value: "Intern", label: "Intern" },
                              { value: "Contract", label: "Contract" },
                            ]}
                            value={employmentType}
                            onChange={(e) => {
                              setEmploymentType(e);
                            }}
                          />
                          {employmentTypeError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {employmentTypeError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Country</label>

                          <Select
                            showSearch
                            style={{ width: "100%" }}
                            optionFilterProp="children"
                            virtual={false}
                            filterOption={filterOption}
                            className="custom-select"
                            placeholder="Select Country"
                            options={countryOptions}
                            value={Country}
                            disabled
                            // value={primaryIndustry}
                            onChange={(e) => setCountry(e)}
                          />
                          {CountryError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {CountryError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
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
                            value={State}
                            onChange={(e) => setState(e)}
                          />
                          {StateError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {StateError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
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
                            value={City}
                            // value={primaryIndustry}
                            onChange={(e) => setCity(e)}
                          />
                          {CityError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {CityError}
                            </div>
                          )}
                        </div>
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Key Skills</label>
                          {responsibilities?.map((responsibility, index) => (
                            <div key={index} className="responsibility-input">
                              <div className="responsibility-field">
                                <input
                                  type="text"
                                  placeholder="Responsibility"
                                  value={responsibility}
                                  onChange={(e) =>
                                    handleResponsibilityChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                />

                                {index === 0 && ( // Show the "+" icon only for the first input field
                                  <button
                                    type="button"
                                    className="add-icon"
                                    onClick={addResponsibility}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </button>
                                )}
                                {index > 0 && ( // Show the "trash" icon for subsequent input fields
                                  <button
                                    type="button"
                                    className="delete-icon"
                                    onClick={() => removeResponsibility(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                )}
                              </div>
                              <br />
                            </div>
                          ))}
                          {keySkillsError && (
                            <div className="error-message">
                              {keySkillsError}
                            </div>
                          )}
                        </div>
                        {/* <div className="form-group col-lg-12 col-md-12">
                        <label>Skill & Experience</label>
                        {SkillExperience.map((SkillExperience, index) => (
                          <div key={index} className="responsibility-input">
                            <div className="responsibility-field">
                              <input
                                type="text"
                                placeholder="Skill & Experience"
                                value={SkillExperience}
                                onChange={(e) =>
                                  handleSkillExperienceChange(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                              {index === 0 && ( // Show the "+" icon only for the first input field
                                <button
                                  type="button"
                                  className="add-icon"
                                  onClick={addSkillExperience}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </button>
                              )}
                              {index > 0 && ( // Show the "trash" icon for subsequent input fields
                                <button
                                  type="button"
                                  className="delete-icon"
                                  onClick={() => removeSkillExperience(index)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              )}
                            </div>
                            <br />
                          </div>
                        ))}
                      </div> */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Skills</label>
                          <Select
                            showSearch
                            mode="multiple"
                            style={{ width: "100%" }}
                            optionFilterProp="children"
                            virtual={false}
                            filterOption={filterOption}
                            className="custom-select"
                            placeholder="Select Skills"
                            options={skillOptions}
                            value={jobSkills}
                            onChange={(e) => {
                              setJobSkills(e);
                            }}
                            dropdownRender={(menu) => (
                              <>
                                {menu}
                                <Divider
                                  style={{
                                    margin: "8px 0",
                                  }}
                                />
                                <Space
                                  style={{
                                    padding: "0 8px 4px",
                                  }}
                                >
                                  <Input
                                    placeholder="Please enter Skill"
                                    // ref={inputRef}
                                    value={addSkills}
                                    onChange={(e) =>
                                      setAddSkills(e.target.value)
                                    }
                                    onKeyDown={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    type="text"
                                    icon={<PlusOutlined />}
                                    onClick={addSkill}
                                  >
                                    Add Skill
                                  </Button>
                                </Space>
                              </>
                            )}
                          />
                          {skillsError && (
                            <div className="error-message">{skillsError}</div>
                          )}
                        </div>
                        <div class="form-group col-lg-12 col-md-12 text-right">
                          <button class="theme-btn btn-style-one">
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
                              "Save"
                            )}
                          </button>
                          {allErr && (
                            <div
                              style={{
                                color: "red",
                                fontSize: "15px",
                                marginTop: "25px",
                              }}
                            >
                              {allErr}
                            </div>
                          )}
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

export default EditPostJob;
