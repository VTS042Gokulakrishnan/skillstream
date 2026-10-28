import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Skeleton, Tooltip } from "antd";
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
import { Helmet } from "react-helmet";
import { htmlToText } from "html-to-text";

const deltaToFormattedText = (delta) => {
  let formattedText = "";
  delta.ops.forEach((op) => {
    if (op.insert) {
      // Handle text insertions
      if (typeof op.insert === "string") {
        let text = op.insert;

        // Apply formatting
        if (op.attributes) {
          if (op.attributes.bold) {
            text = `**${text}**`; // Bold text
          }
          if (op.attributes.italic) {
            text = `_${text}_`; // Italic text
          }
          if (op.attributes.underline) {
            text = `${text}`; // Underline (custom handling if needed)
          }
          if (op.attributes.fontSize) {
            text = `${text}`; // Font size (custom handling if needed)
          }
          if (op.attributes.header) {
            text = `\n${"#".repeat(op.attributes.header)} ${text}\n`; // Headers
          }
        }

        formattedText += text;
      } else if (op.insert.list) {
        formattedText +=
          "\n" +
          (op.insert.list === "ordered" ? "1." : "*") +
          " " +
          op.insert.content +
          "\n"; // Lists
      }
    }
    // Add new lines if needed
    if (op.insert === "\n") {
      formattedText += "\n";
    }
  });
  return formattedText.trim();
};
const PostJob = () => {
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
  const [otherFieldValue, setOtherFieldValue] = useState("");
  const [otherOption, setOtherOption] = useState(false);
  const [salaryPreference, setSalaryPreference] = useState("");

  const [otherInput, setOtherInput] = useState(""); // State for other input value
  const [showInput, setShowInput] = useState(false); // State to manage whether to show input or dropdown
  const dateInputRef = useRef(null);

  // Add state variables for other form fields
  const [jobTitleError, setJobTitleError] = useState("");
  const [jobDescriptionError, setJobDescriptionError] = useState("");
  const [emailAddressError, setEmailAddressError] = useState("");
  const [jobTypeError, setJobTypeError] = useState("");
  const [offeredSalaryError, setOfferedSalaryError] = useState("");
  const [IndustryError, setIndustryError] = useState("");
  const [QualificationError, setQualificationError] = useState("");
  const [ExperienceError, setExperienceError] = useState("");
  const [ApplicationDeadlineDateError, setApplicationDeadlineDateError] =
    useState("");
  const [salaryPreferenceError, setSalaryPreferenceError] = useState("");
  const [CountryError, setCountryError] = useState("");
  const [CityError, setCityError] = useState("");
  const [StateError, setStateError] = useState("");
  const [keySkillsError, setKeySkillsError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  // const [jobSkillsError, setJobSkillsError] = useState("");
  // const [responsibilitiesError, setresponsibilitiesError] = useState("");
  const [employmentTypeError, setEmploymentTypeError] = useState("");
  const [isGeneratewithAI, setIsGenrateWithAI] = useState(false);
  const [loader, setLoader] = useState(false);
  const [skillGenLoader, setSkillGenLoader] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Add state variables for other form field errors
  const [allErr, setAllErr] = useState("");
  const [isVendor, setIsVendor] = useState(false);
  const jobDetailRef = useRef(null);
  const packagePaymentsRef = useRef(null);
  const confirmationRef = useRef(null);

  const [activeSection, setActiveSection] = useState("jobDetail");
  let token = localStorage.getItem("token");
  const handleScroll = (ref, section) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
    setActiveSection(section);
  };
  const quillRef = useRef(null);
  const handleScrollEvent = () => {
    const jobDetailTop = jobDetailRef.current.getBoundingClientRect().top;
    const packagePaymentsTop =
      packagePaymentsRef.current.getBoundingClientRect().top;
    const confirmationTop = confirmationRef.current.getBoundingClientRect().top;

    const offset = 100; // Adjust this offset based on your layout

    // Check which section is currently in view
    if (jobDetailTop < offset && jobDetailTop > -offset) {
      setActiveSection("jobDetail");
    } else if (packagePaymentsTop < offset && packagePaymentsTop > -offset) {
      setActiveSection("packagePayments");
    } else if (confirmationTop < offset && confirmationTop > -offset) {
      setActiveSection("confirmation");
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollEvent);
    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, []);
  useEffect(() => {
    const maintenance = async () => {
      try {
        const repsonse = await axios.get(
          `${Server}/api/v1/data/maintenance/status`
        );
        setMaintenanceMode(repsonse.data.data);
      } catch (error) {}
    };
    maintenance();
  }, []);
  useEffect(() => {
    // Scroll to the Job Detail section on initial load
    jobDetailRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

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

    // if (ApplicationDeadlineDate.trim() === "") {
    //   setApplicationDeadlineDateError("ApplicationDeadlineDate is required");
    //   setloading(false);
    //   setAllErr(
    //     "Some required fields are missing. Please complete all fields before submitting."
    //   );
    //   isValid = false;
    // } else {
    //   setApplicationDeadlineDateError("");
    //   setAllErr("");
    // }

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

  const handleOthersCheckboxChange = (checked) => {
    setShowOtherField(checked);
    if (!checked) {
      setOtherFieldValue(""); // Reset the value of the other field if checkbox is unchecked
    }
  };

  const handleJobTypeChange = (value) => {
    setJobType(value);
    setJobTypeError("");
    setIsVendor(false);
  };
  const handleSalaryPreferenceChange = (value) => {
    setSalaryPreference(value);
    // console.log(value);
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
    setResponsibilities([]);
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
          Responsibilties: SkillExperience,
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
          isVendor,
        };
      } else {
        formData = {
          Responsibilties: SkillExperience,
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
          isVendor: false,
        };
      }
      // console.log(formData);
      // Make API call
      let userId = localStorage.getItem("UserId");

      const { data } = await axios.post(
        `${Server}/api/v1/employer/jobs/post/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      setloading(false);
      toast.success("JOB Added Successfully");
      navigate(`/job-detail/${userId}/${data.jobId}`);
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
  // console.log(JobDescription);

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
      let skills = data.skills.filter((skill) => skill.trim() !== ""); // Remove empty values
      skills = skills?.map((skill) => skill.toUpperCase());
      const uniqueSkills = [...new Set(skills)];
      SetSkillData(uniqueSkills.sort());
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
    ? cityData?.map((e, idx) => ({ value: e, label: e }))
    : [{ value: null, label: "Select State First" }];
  const skillOptions = skillData?.map((e, idx) => ({ value: e, label: e }));
  // console.log(skillOptions);

  const industryOptions = [
    { value: "other", label: "Other" }, // Add an "Other" option
    ...industryData?.map((e, idx) => ({
      value: e,
      label: e,
    })),
  ];
  // console.log(Qualification);

  const [selectedCurrency, setSelectedCurrency] = useState("CAD $"); // Default currency is USD

  // Function to handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  // Handler for selecting an option from the dropdown
  const handleIndustryChange = (selectedOption) => {
    setIndustryError("");

    if (selectedOption === "other") {
      // If "Other" is selected, set Industry to "other"
      setIndustry("other");
      setIndustryError("");
    } else {
      // If other industry is selected, set the selected industry state
      setIndustry(selectedOption);
      setIndustryError("");
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
      setJobSkills([...jobSkills, addSkills]);
      fetchSkills();
      toast.success("skills added");
      setAddSkills("");
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(jobSkills);

  // const [jobDescriptionError, setJobDescriptionError] = useState('');
  //  const [jobDescription, setJobDescription] = useState("");
  const handleJobDescriptionChange = (value) => {
    setJobDescription(value);
    setJobDescriptionError("");
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
        setSkillExperience(data?.keySkills_responsibilities);
        setJobSkills(data?.skills?.map((skill) => skill.toUpperCase()));
        setLoader(false);
        setIsGenrateWithAI(true);
      } else {
        toast.error("Please select a job title");
        setJobTitleError("Job title is required");
      }
    } catch (error) {
      // console.log(error);
      setLoader(false);
      toast.error("Internal Serer Error");
    }
  };
  const genrateSkills = async () => {
    try {
      if (JobTitle) {
        setJobTitleError("");
        if (JobDescription) {
          setJobDescriptionError("");
          setSkillGenLoader(true);
          let formData = { jobTitle: JobTitle, jobDescription: JobDescription };
          const { data } = await axios.post(
            `${Server}/api/v1/parser/generate/skills`,
            formData
          );
          // console.log(data);
          setJobSkills(data?.skills?.map((skill) => skill.toUpperCase()));
          setSkillGenLoader(false);
        } else {
          toast.error("Please Enter Job Description");
          setJobDescriptionError("Job Description is required");
        }
      } else {
        toast.error("Please Enter Job title & Job Description");
        setJobTitleError("Job title is required");
      }
    } catch (error) {
      // console.log(error);
      setSkillGenLoader(false);
      toast.error("Internal Serer Error");
    }
  };
  // console.log(responsibilities);
  // console.log("Date", ApplicationDeadlineDate);

  return (
    <div>
      <Helmet>
        <meta
          name="Post a  Free Job | Hire Top IT Talent in US | Skillstream Jobs"
          content="Post a free job on SkillStream Jobs to hire top IT talent in US. Connect with qualified candidates and streamline your recruitment process effortlessly."
        />
      </Helmet>
      <section class="user-dashboard">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Post a New Job!</h3>
            <div class="text">Ready to jump back in?</div>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4>Post Job</h4>
                  </div>
                  <Toaster position="top-center" reverseOrder={false} />

                  <div class="widget-content em-post-content">
                    <aside id="em-job-preview" className="em-job-preview em-card"><h2>Live job summary</h2><p>This is how your job will appear to candidates.</p><span className="em-preview-label">AUTO-UPDATING</span><h2>{JobTitle || "Your job title"}</h2><p>{[City, State, Country].filter(Boolean).join(", ")}</p><div className="em-resume-skills">{[jobType,employmentType,Experience].filter(Boolean).map((value,i)=><span key={i}>{value}</span>)}</div>{offeredSalary && <p><strong>{offeredSalary}</strong> {rate}</p>}<hr/><h3>About the role</h3><p className="em-preview-description">{JobDescription.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g," ").slice(0,600) || "Your description will appear here as you write."}</p><h3>Skills</h3><div className="em-resume-skills">{jobSkills.map((skill,i)=><span key={i}>{skill}</span>)}</div>{ApplicationDeadlineDate && <p>Apply by {ApplicationDeadlineDate}</p>}</aside>
                    <div
                      className="post-job-steps"
                      style={{ position: "relative", marginBottom: "15px" }}
                    >
                      <div className="step">
                        <button
                          className={`tab-button ${
                            activeSection === "jobDetail" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleScroll(jobDetailRef, "jobDetail")
                          }
                        >
                          <span
                            className="em-step-number"
                            style={{ color: "#000" }}
                          ></span>
                          <h5>Job details<small>Basic information</small></h5>
                        </button>
                      </div>

                      <div className="step">
                        <button
                          className={`tab-button ${
                            activeSection === "packagePayments" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleScroll(packagePaymentsRef, "packagePayments")
                          }
                        >
                          <span
                            className="em-step-number"
                            style={{ color: "#000" }}
                          ></span>
                          <h5>Requirements<small>Compensation & experience</small></h5>
                        </button>
                      </div>

                      <div className="step">
                        <button
                          className={`tab-button ${
                            activeSection === "confirmation" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleScroll(confirmationRef, "confirmation")
                          }
                        >
                          <span
                            className="em-step-number"
                            style={{ color: "#000" }}
                          ></span>
                          <h5>Location & skills<small>Candidate requirements</small></h5>
                        </button>
                      </div>
                    </div>

                    <form
                      class="default-form scroll-black"
                      // style={{
                      //   height: "500px",
                      //   overflow: "scroll",
                      //   overflowX: "hidden",
                      // }}
                      onSubmit={handlePostJob}
                    >
                      <div class="row">
                        <div ref={jobDetailRef} className="em-job-fields"><h2>Job details</h2><p className="em-form-help">Provide the basic information about the role.</p>
                          <div class="form-group col-lg-12 col-md-12">
                            <label>Job Title</label>
                            <input
                              type="text"
                              name="name"
                              placeholder="Title"
                              value={JobTitle}
                              onChange={(e) => {
                                setJobTitle(e.target.value);
                                setJobTitleError("");
                              }}
                            />
                            {jobTitleError && (
                              <div className="error-message">
                                {jobTitleError}
                              </div>
                            )}
                          </div>
                          <div class="form-group col-lg-12 col-md-12">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                              <label>Job Description</label>
                              <Tooltip
                                title={
                                  // maintenanceMode
                                  //   ? "Temporarily Unavailable"
                                  //   :
                                  !JobTitle
                                    ? "Enter Jobtitle"
                                    : loader
                                    ? "loading"
                                    : "Complete Job Description with AI"
                                }
                              >
                                <Button
                                  type="primary"
                                  onClick={() => completeAI()}
                                  loading={loader}
                                  disabled={!JobTitle || loader}
                                >
                                  Complete with AI
                                </Button>
                              </Tooltip>
                            </div>
                            <ReactQuill
                              ref={quillRef}
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
                          {/*<div className="form-group col-lg-12 col-md-12 ">
                        <label>Job Description</label>
                        <ReactQuill
                          value={JobDescription}
                          onChange={(e) => setJobDescription(e)}
                          class="scroll-black"
                          modules={quillModules} // Use the updated modules
                          style={{
                            height: "auto",
                            maxHeight: "300px",
                            overflow: "scroll",
                            overflowX: "hidden",
                          }}
                        /></div>*/}
                          <div class="form-group  col-lg-12 col-md-12">
                            <label>Email Address</label>
                            <input
                              type="email"
                              name="email"
                              placeholder="Enter Email Address"
                              value={EmailAddress}
                              onChange={(e) => {
                                setEmailAddress(e.target.value);
                                setEmailAddressError("");
                              }}
                            />
                            {emailAddressError && (
                              <div className="error-message">
                                {emailAddressError}
                              </div>
                            )}
                          </div>
                          <div className="form-group  col-lg-12 col-md-12">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                              <label>Job Type</label>
                              {jobType === "Contract" &&
                                Country === "United States" && (
                                  <Tooltip
                                    title={
                                      isVendor
                                        ? "Vendor selected"
                                        : "Click to add vendor job"
                                    }
                                  >
                                    <Button
                                      type="primary"
                                      onClick={() => setIsVendor(true)}
                                      disabled={!jobType || isVendor}
                                    >
                                      Add to Vendor Job
                                    </Button>
                                  </Tooltip>
                                )}
                            </div>
                            <Select
                              style={{ width: "100%" }}
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
                              virtual={false}
                            >
                              <option value="Full Time">Full Time</option>
                              <option value="Part-Time">Part-Time</option>
                              <option value="Temporary">Temporary</option>
                              <option value="Internship">Internship</option>
                              <option value="Freelance">Freelance</option>
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
                        </div>

                        <div ref={packagePaymentsRef} className="em-job-fields"><h2>Compensation & requirements</h2>
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

                          <div class="form-group  col-lg-12 col-md-12">
                            <label>Experience</label>
                            <input
                              type="text"
                              name="name"
                              placeholder="Experience"
                              value={Experience}
                              onChange={(e) => {
                                setExperience(e.target.value);
                                setExperienceError("");
                              }}
                            />
                            {ExperienceError && (
                              <div className="error-message">
                                {ExperienceError}
                              </div>
                            )}
                          </div>
                          <div className="form-group  col-lg-12 col-md-12">
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
                                  {industryData?.map((industry) => (
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
                              <div className="error-message">
                                {IndustryError}
                              </div>
                            )}
                          </div>
                          {/* <div className="form-group  col-lg-12 col-md-12">
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
                          <div className="form-group  col-lg-12 col-md-12">
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
                          <div class="form-group  col-lg-12 col-md-12">
                            <label>Qualification</label>
                            <Select
                              style={{ width: "100%" }}
                              virtual={false}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              placeholder="Select Qualification"
                              className="custom-select"
                              options={[
                                { value: "Graduate", label: "Graduate" },
                                {
                                  value: "Post-Graduate",
                                  label: "Post-Graduate",
                                },
                                { value: "Student", label: "Student" },
                              ]}
                              // value={jobSkills}
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
                          <div class="form-group  col-lg-12 col-md-12">
                            <label>Application Deadline Date</label>
                            <input
                              ref={dateInputRef}
                              type="date"
                              name="name"
                              placeholder="06.04.2020"
                              value={ApplicationDeadlineDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                setApplicationDeadlineDate(e.target.value);
                                setApplicationDeadlineDateError("");
                              }}
                              onClick={() => {
                                // On click anywhere inside the input, show the calendar
                                dateInputRef.current?.showPicker?.(); // Works in modern browsers
                              }}
                              style={{ cursor: "pointer" }} // Optional: makes it feel clickable
                            />

                            {ApplicationDeadlineDateError && (
                              <div className="error-message">
                                {ApplicationDeadlineDateError}
                              </div>
                            )}
                          </div>
                          <div class="form-group  col-lg-12 col-md-12">
                            <label>Employment Type</label>

                            <Select
                              style={{ width: "100%" }}
                              virtual={false}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              placeholder="Select Employment Type"
                              className="custom-select"
                              options={[
                                { value: "Onsite", label: "Onsite" },
                                {
                                  value: "Hybrid",
                                  label: "Hybrid",
                                },
                                { value: "Remote", label: "Remote" },
                                // { value: "Contract", label: "Contract" },
                              ]}
                              // value={jobSkills}
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
                        </div>
                        <div ref={confirmationRef} className="em-job-fields"><h2>Location & skills</h2>
                          <div class="form-group  col-lg-12 col-md-12">
                            <label>Country</label>

                            <Select
                              showSearch
                              virtual={false}
                              style={{ width: "100%" }}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              className="custom-select"
                              placeholder="Select Country"
                              options={countryOptions}
                              value={Country}
                              // value={primaryIndustry}
                              disabled
                              onChange={(e) => {
                                setCountry(e);
                                setCountryError("");
                              }}
                            />
                          </div>
                          {CountryError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {CountryError}
                            </div>
                          )}
                          <div class="form-group  col-lg-12 col-md-12">
                            <label>State</label>
                            <Select
                              showSearch
                              style={{ width: "100%" }}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              className="custom-select"
                              placeholder="Select State"
                              options={stateOptions}
                              virtual={false}
                              // value={State}
                              onChange={(e) => {
                                setState(e);
                                setStateError("");
                              }}
                            />
                          </div>
                          {StateError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {StateError}
                            </div>
                          )}
                          <div class="form-group col-lg-12 col-md-12">
                            <label>City</label>
                            <Select
                              showSearch
                              style={{ width: "100%" }}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              className="custom-select"
                              placeholder="Select City"
                              options={cityOptions}
                              // value={jobSkills}
                              // value={primaryIndustry}
                              onChange={(e) => {
                                setCity(e);
                                setCityError("");
                              }}
                              virtual={false}
                            />
                          </div>
                          {CityError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {CityError}
                            </div>
                          )}
                          {/*  <div className="form-group col-lg-12 col-md-12">
                            
                            
                            {responsibilities.map((responsibility, index) => (
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
                                  {index === 0 && (
                                    <button
                                      type="button"
                                      className="add-icon"
                                      onClick={addResponsibility}
                                    >
                                      <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                  )}
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      className="delete-icon"
                                      onClick={() =>
                                        removeResponsibility(index)
                                      }
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
                          </div>*/}

                          <div className="form-group col-lg-12 col-md-12">
                            <label>Key Skills</label>
                            {SkillExperience?.map((SkillExperience, index) => (
                              <div key={index} className="responsibility-input">
                                <div className="responsibility-field">
                                  <input
                                    type="text"
                                    placeholder="Key Skills"
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
                                      onClick={() =>
                                        removeSkillExperience(index)
                                      }
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  )}
                                </div>
                                <br />
                              </div>
                            ))}
                          </div>
                          <div className="form-group col-lg-12 col-md-12">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                              <label>Skills</label>
                              <Button
                                type="primary"
                                onClick={() => genrateSkills()}
                                loading={skillGenLoader}
                                disabled={
                                  !JobTitle ||
                                  !JobDescription ||
                                  loader ||
                                  isGeneratewithAI
                                }
                              >
                                Generate Skills
                              </Button>
                            </div>
                            <Select
                              showSearch
                              mode="multiple"
                              style={{ width: "100%", overflow: "scroll" }}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              className="custom-select"
                              placeholder="Select Skills"
                              options={skillOptions}
                              value={jobSkills}
                              virtual={false}
                              onChange={(e) => {
                                setJobSkills(e);
                                setSkillsError("");
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
                              "Post"
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

export default PostJob;
