import "Components/EmployerUI/ProfileEditor.css";
import React, { useState, useEffect } from "react";
import uniqid from "uniqid";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";
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

// import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
const Profile = () => {
  const [selectedfile, SetSelectedFile] = useState([]);
  const [loading, setloading] = useState(false);
  const [Files, SetFiles] = useState([]);
  const [resume, SetResume] = useState([]);
  const [workExperienceFields, setWorkExperienceFields] = useState([
    { id: uniqid(), companyName: "", startYear: "", endYear: "", role: "" },
  ]);
  const [educationFields, setEducationFields] = useState([
    { id: uniqid(), college: "", startYear: "", endYear: "", degree: "" },
  ]);
  const [phone, SetPhone] = useState("");
  const [name, SetName] = useState("");
  const [designation, SetDesignation] = useState("");
  const [website, SetWebsite] = useState("");
  const [CurrentSalary, SetCurrentSalary] = useState("");
  const [expectedSalary, SetExpectedSalary] = useState("");
  const [description, SetDescription] = useState("");
  const [Experience, SetExperience] = useState("");
  const [city, SetCity] = useState("");
  const [address, SetAddress] = useState("");
  const [country, SetCountry] = useState("");
  const [languages, SetLanguages] = useState([]);
  const [skills, SetSkills] = useState("");
  const [facebook, SetFacebook] = useState("");
  const [linkedin, Setlinkedin] = useState("");
  const [Instagram, SetInstagram] = useState("");
  const [twitter, Settwitter] = useState("");
  const [skillData, SetSkillData] = useState([]);
  const [countryData, SetCountryData] = useState([]);
  const [languageData, SetlanguageData] = useState([]);
  const [cityData, SetCityData] = useState([]);
  const [state, setState] = useState(""); // Add state
  const [stateData, setStateData] = useState([]); // Add state data
  const [addSkills, setAddSkills] = useState(""); // Set initial state to 'Contract'

  const [phoneError, SetPhoneError] = useState("");
  const [nameError, SetNameError] = useState("");
  const [designationError, SetDesignationError] = useState("");
  const [websiteError, SetWebsiteError] = useState("");
  const [CurrentSalaryError, SetCurrentSalaryError] = useState("");
  const [expectedSalaryError, SetExpectedSalaryError] = useState("");
  const [descriptionError, SetDescriptionError] = useState("");
  const [ExperienceError, SetExperienceError] = useState("");
  const [cityError, SetCityError] = useState("");
  const [addressError, SetAddressError] = useState("");
  const [countryError, SetCountryError] = useState("");
  const [languagesError, SetLanguagesError] = useState([]);
  const [skillsError, SetSkillsError] = useState("");
  const [facebookError, SetFacebookError] = useState("");
  const [linkedinError, SetlinkedinError] = useState("");
  const [InstagramError, SetInstagramError] = useState("");
  const [twitterError, SettwitterError] = useState("");
  const [stateError, setStateError] = useState([]);
  const [educationErrors, setEducationErrors] = useState({});
  const [workExperienceErrors, setWorkExperienceErrors] = useState({});
  let userId = localStorage.getItem("UserId");
  const getallEmployers = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/candidate/${userId}`);
      // console.log(data?.Candidate[0]);
      const candidateDetail = data?.Candidate[0];
      SetPhone(candidateDetail?.phone);
      SetName(candidateDetail?.name);
      SetDesignation(candidateDetail.position);
      SetWebsite(candidateDetail.website);
      SetCurrentSalary(candidateDetail.currentSalary);
      SetExpectedSalary(candidateDetail.expectedSalary);
      SetDescription(candidateDetail.description);
      SetExperience(candidateDetail.experienceYears);
      SetCity(candidateDetail.city);
      SetAddress(candidateDetail.address);
      SetCountry(candidateDetail.country);
      SetLanguages(candidateDetail.language);
      SetSkills(candidateDetail.skills);
      setState(candidateDetail.state);
      if (candidateDetail.work_experience) {
        const normalizedExperience = candidateDetail.work_experience.map(
          (exp) => {
            let startYear = exp.startYear || "";
            let endYear = exp.endYear || "";

            if (!startYear && exp["Start_year-End_Year"]) {
              const years = exp["Start_year-End_Year"].split(" – "); // Handle different dash types
              startYear = years[0] || "";
              endYear =
                years[1] && years[1].toLowerCase() !== "present"
                  ? years[1]
                  : "Present";
            }

            return {
              companyName: exp.company || exp.companyName || "",
              startYear,
              endYear,
              role: exp.job_title || exp.role || "",
            };
          }
        );
        setWorkExperienceFields(normalizedExperience);
      }

      // ✅ Normalize Education Data
      if (candidateDetail.Education) {
        const normalizedEducation = candidateDetail.Education.map((edu) => {
          let startYear = edu.startYear || "";
          let endYear = edu.endYear || "";

          if (!startYear && edu["Start_year-End_Year"]) {
            const years = edu["Start_year-End_Year"].split(" - ");
            startYear = years[0] || "";
            endYear =
              years[1] && years[1].toLowerCase() !== "present"
                ? years[1]
                : "Present";
          }

          return {
            college: edu.Institution_Name || edu.college || "",
            startYear,
            endYear,
            degree: edu.Degree || edu.degree || "",
          };
        });
        setEducationFields(normalizedEducation);
      }

      // SetFacebook(candidateDetail?.socials[0]?.facebook);
      // Setlinkedin(candidateDetail.socials[0]?.linkedin);
      // SetInstagram(candidateDetail.socials[0]?.instagram);
      // Settwitter(candidateDetail.socials[0]?.twitter);
      // setWorkExperienceFields(candidateDetail.experience)
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(relativeTime);
  useEffect(() => {
    getallEmployers();
  }, []);
  const validateForm = () => {
    let isValid = true;

    // Validate Job Title
    if (phone.trim() === "") {
      SetPhoneError("Phone is required");
      setloading(false);
      isValid = false;
    } else {
      SetPhoneError("");
    }

    // Validate Job Description
    if (name.trim() === "") {
      SetNameError("Name is required");
      setloading(false);
      isValid = false;
    } else {
      SetNameError("");
    }

    // Validate Email Address
    if (designation.trim() === "") {
      SetDesignationError("Designation is required");
      setloading(false);
      isValid = false;
    } else {
      // You can add email format validation here if needed
      SetDesignationError("");
    }

    // Validate Job Type
    // if (website.trim() === "") {
    //   SetWebsiteError("Website is required");
    //   isValid = false;
    // } else {
    //   SetWebsiteError("");
    // }

    if (CurrentSalary.trim() === "") {
      SetCurrentSalaryError("Current Salary is required");
      setloading(false);
      isValid = false;
    } else {
      SetCurrentSalaryError("");
    }

    if (expectedSalary.trim() === "") {
      SetExpectedSalaryError("Expected Salary is required");
      setloading(false);
      isValid = false;
    } else {
      SetExpectedSalaryError("");
    }

    if (description.trim() === "") {
      SetDescriptionError("Description is required");
      setloading(false);
      isValid = false;
    } else {
      SetDescriptionError("");
    }

    if (skills.length === 0) {
      SetSkillsError("Skills is required");
      setloading(false);
      isValid = false;
    } else {
      SetSkillsError("");
    }

    if (languages.length === 0) {
      SetLanguagesError("Languages is required");
      setloading(false);
      isValid = false;
    } else {
      SetLanguagesError("");
    }
    if (Experience.trim() === "") {
      SetExperienceError("Experience is required");
      setloading(false);
      isValid = false;
    } else {
      SetExperienceError("");
    }

    return isValid;
  };
  const validateEducationForm = () => {
    let isValid = true;

    // if (Experience.trim() === "") {
    //   SetExperienceError("Experience is required");
    //   isValid = false;
    // } else {
    //   SetExperienceError("");
    // }

    return isValid;
  };
  const validateExperienceForm = () => {
    let isValid = true;

    // if (Experience.trim() === "") {
    //   SetExperienceError("Experience is required");
    //   isValid = false;
    // } else {
    //   SetExperienceError("");
    // }

    return isValid;
  };
  const validateContactForm = () => {
    let isValid = true;

    if (city.trim() === "") {
      SetCityError("City is required");
      setloading(false);
      isValid = false;
    } else {
      SetCityError("");
    }

    if (address.trim() === "") {
      SetAddressError("Address is required");
      setloading(false);
      isValid = false;
    } else {
      SetAddressError("");
    }

    if (country.trim() === "") {
      SetCountryError("Country is required");
      setloading(false);
      isValid = false;
    } else {
      SetCountryError("");
    }

    if (state.trim() === "") {
      setStateError("State is required");
      setloading(false);
      isValid = false;
    } else {
      setStateError("");
    }

    // Add more specific validations as needed for other fields

    return isValid;
  };
  const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };
  const InputChange = (e) => {
    // console.log("hello");
    // --For Multiple File Input
    let images = [];
    for (let i = 0; i < e.target.files.length; i++) {
      images.push(e.target.files[i]);
      let reader = new FileReader();
      let file = e.target.files[i];
      reader.onloadend = () => {
        SetSelectedFile((preValue) => {
          return [
            ...preValue,
            {
              id: uniqid(),
              file: file,
              filename: e.target.files[i].name,
              fileimage: reader.result,
              datetime:
                e.target.files[i].lastModifiedDate.toLocaleString("en-IN"),
              filesize: filesizes(e.target.files[i].size),
            },
          ];
        });
      };
      if (e.target.files[i]) {
        reader.readAsDataURL(file);
      }
    }
  };
  const ResumeInputChange = (e) => {
    // console.log("hi");
    // --For Multiple File Input
    let resumes = [];
    for (let i = 0; i < e.target.files.length; i++) {
      resumes.push(e.target.files[i]);
      let reader = new FileReader();
      let file = e.target.files[i];
      reader.onloadend = () => {
        SetResume((preValue) => {
          return [
            ...preValue,
            {
              id: uniqid(),
              file: file,
              filename: e.target.files[i].name,
              fileimage: reader.result,
              datetime:
                e.target.files[i].lastModifiedDate.toLocaleString("en-IN"),
              filesize: filesizes(e.target.files[i].size),
            },
          ];
        });
      };
      if (e.target.files[i]) {
        reader.readAsDataURL(file);
      }
    }
  };
  const DeleteSelectFile = (id) => {
    if (window.confirm("Are you sure you want to delete this Image?")) {
      const result = selectedfile.filter((data) => data.id !== id);
      SetSelectedFile(result);
    } else {
      // alert('No');
    }
  };
  const DeleteSelectResume = (id) => {
    if (window.confirm("Are you sure you want to delete this File?")) {
      const result = resume.filter((data) => data.id !== id);
      SetResume(result);
    } else {
      // alert('No');
    }
  };
  // const DeleteFile = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this Image?")) {
  //     const result = Files.filter((data) => data.id !== id);
  //     SetFiles(result);
  //   } else {
  //     // alert('No');
  //   }
  // };

  {
    /* Education */
  }
  const handleAddEducationField = () => {
    setEducationFields([
      ...educationFields,
      { id: uniqid(), college: "", startYear: "", endYear: "", degree: "" },
    ]);
  };

  const handleDeleteEducationField = (id) => {
    setEducationFields(educationFields.filter((field) => field.id !== id));
    // Remove error message for the deleted field
    setEducationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleEducationFieldChange = (id, field, value) => {
    setEducationFields((prevFields) =>
      prevFields?.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    // Clear the error message when the field is updated
    setEducationErrors((prevErrors) => ({
      ...prevErrors,
      [id]: { ...prevErrors[id], [field]: null },
    }));
  };

  {
    /*Work Experience */
  }
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default currency is USD

  // Function to handle currency change
  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
  };

  const handleAddWorkExperienceField = () => {
    setWorkExperienceFields([
      ...workExperienceFields,
      { id: uniqid(), companyName: "", startYear: "", endYear: "", role: "" },
    ]);
  };

  const handleDeleteWorkExperienceField = (id) => {
    setWorkExperienceFields(
      workExperienceFields.filter((field) => field.id !== id)
    );
    // Remove error message for the deleted field
    setWorkExperienceErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleWorkExperienceFieldChange = (id, field, value) => {
    setWorkExperienceFields((prevFields) =>
      prevFields?.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    // Clear the error message when the field is updated
    setWorkExperienceErrors((prevErrors) => ({
      ...prevErrors,
      [id]: { ...prevErrors[id], [field]: null },
    }));
  };

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
      const { data } = await axios.get(`${Server}/api/v1/data/languages`);
      // console.log(data.country_city);
      SetlanguageData(data.allLanguages.sort());
    } catch (error) {
      // console.log(error);
    }
  };
  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const countryOptions = countryData?.map((e, idx) => ({
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
    ? cityData?.map((e, idx) => ({ value: e, label: e }))
    : [{ value: null, label: "Select State First" }];

  const options = skillData?.map((e, idx) => ({ value: e, label: e }));
  const languagOoptions = languageData.map((e, idx) => ({
    value: e,
    label: e,
  }));

  const handleUpload = async (e) => {
    e.preventDefault();
    const isFormValid = validateForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      return; // Exit early if form validation fails
    }
    setloading(true);
    try {
      const formData = new FormData();
      selectedfile.forEach((fileData) => {
        formData.append("file", fileData.file); // Append the file object
      });
      const formData1 = new FormData();
      resume.forEach((fileData) => {
        formData1.append("file", fileData.file);
      });

      let basicDetails = {
        phone_number: phone,
        name: name,
        position: designation,
        jobTitle: designation,
        website: website,
        currentSalary: CurrentSalary,
        expectedSalary: expectedSalary,
        description: description,
        experience: Experience,
        language: languages,
        skills: skills,
        profileCompleted: true,
      };
      // console.log(basicDetails);
      if (selectedfile.length != 0) {
        const imageUpload = await axios.post(
          `${Server}/api/v1/upload/image/candidate/${userId}`,
          formData
        );
        // console.log(imageUpload.data);
        toast.success("Image Upload Successfully");
      }
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/update/${userId}`,
        basicDetails
      );
      if (resume.length != 0) {
        const uploadResume = await axios.post(
          `${Server}/api/v1/upload/resume/candidate/${userId}`,
          formData1
        );
        // console.log(uploadResume.data);
      }

      // console.log(data);
      toast.success("Profile Updated Successfully");
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/candidates-profile-view");
      setloading(false);
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };

  const handleExperience = async (e) => {
    e.preventDefault();
    setloading(true);
    // Function to validate the form
    const validateExperienceForm = () => {
      const errors = {};
      let isValid = true;

      workExperienceFields.forEach((field) => {
        if (!field.companyName) {
          errors[field.id] = {
            ...errors[field.id],
            companyName: "Company Name is required",
          };
          isValid = false;
        }
        if (!field.startYear || !field.endYear) {
          errors[field.id] = {
            ...errors[field.id],
            startYear: "Start year and End year are required",
          };
          isValid = false;
        } else if (parseInt(field.endYear) < parseInt(field.startYear)) {
          errors[field.id] = {
            ...errors[field.id],
            endYear: "End year must be greater than Start year",
          };
          isValid = false;
        }
        if (!field.role) {
          errors[field.id] = { ...errors[field.id], role: "Role is required" };
          isValid = false;
        }
      });

      setWorkExperienceErrors(errors);
      setloading(false);
      return isValid;
    };

    const isFormValid = validateExperienceForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      return; // Exit early if form validation fails
    }
    try {
      // console.log(workExperienceFields);
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/update/${userId}`,
        { work_experience: workExperienceFields, profileCompleted: true }
      );

      // console.log(data);
      toast.success("Profile Updated Successfully");
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/candidates-profile-view");
      setloading(false);
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };

  const handleEducation = async (e) => {
    e.preventDefault();
    setloading(true);

    // Function to validate the form
    const validateEducationForm = () => {
      const errors = {};
      let isValid = true;

      educationFields.forEach((field) => {
        if (!field.college) {
          errors[field.id] = {
            ...errors[field.id],
            college: "College is required",
          };
          isValid = false;
        }
        if (!field.startYear || !field.endYear) {
          errors[field.id] = {
            ...errors[field.id],
            startYear: "Start year and End year are required",
          };
          isValid = false;
        } else if (parseInt(field.endYear) < parseInt(field.startYear)) {
          errors[field.id] = {
            ...errors[field.id],
            endYear: "End year must be greater than Start year",
          };
          isValid = false;
        }
        if (!field.degree) {
          errors[field.id] = {
            ...errors[field.id],
            degree: "Degree is required",
          };
          isValid = false;
        }
      });

      setEducationErrors(errors);
      setloading(false);

      return isValid;
    };

    const isFormValid = validateEducationForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      return; // Exit early if form validation fails
    }

    try {
      // console.log(educationFields);
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/update/${userId}`,
        { Education: educationFields, profileCompleted: true }
      );
      toast.success("Profile Updated Successfully");
      // console.log(data);
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/candidates-profile-view");
      setloading(false);
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };
  const handleSocialNetwork = async (e) => {
    e.preventDefault();
    setloading(true);

    try {
      let basicDetails = [
        {
          Facebook: facebook,
          Instagram: Instagram,
          linkedin: linkedin,
          twitter: twitter,
        },
      ];

      // console.log(basicDetails);
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/update/${userId}`,
        { social: basicDetails, profileCompleted: true }
      );

      // console.log(data);
      toast.success("Profile Updated Successfully");
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/candidates-profile-view");
      setloading(false);
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };
  const handleContact = async (e) => {
    setloading(true);

    e.preventDefault();
    const isFormValid = validateContactForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      return; // Exit early if form validation fails
    }
    try {
      let basicDetails = {
        country: country,
        city: city,
        state,
        address,
      };
      // console.log(basicDetails);

      const { data } = await axios.post(
        `${Server}/api/v1/candidate/update/${userId}`,
        basicDetails
      );

      // console.log(data);
      toast.success("Profile Updated Successfully");
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/candidates-profile-view");
      setloading(false);
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
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
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 50; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div>
      <section className="user-dashboard ss-profile-editor">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Edit candidate profile</h3>
            <div class="text">Tell employers about your skills and experience. Keep your profile and contact details up to date.</div>
          </div>
          <Toaster position="top-center" reverseOrder={false} />

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4><span className="ss-profile-section-number">01</span>Personal details</h4>
                  </div>

                  <div class="widget-content">
                    <label>Upload Image</label>
                    <div class="uploading-outer">
                      <div class="uploadButton">
                        <input
                          class="uploadButton-input"
                          type="file"
                          name="attachments[]"
                          accept="image/*, application/pdf"
                          id="upload"
                          onChange={InputChange}
                        />
                        <label
                          class="uploadButton-button ripple-effect"
                          for="upload"
                        >
                          Browse Image
                        </label>
                        <span class="uploadButton-file-name"></span>
                      </div>
                      <div class="text">
                        Max file size is 1MB, Minimum dimension: 330x300 And
                        Suitable files are .jpg & .png
                      </div>
                    </div>
                    <div class="files-outer">
                      {selectedfile?.map((data, index) => {
                        const {
                          id,
                          filename,
                          filetype,
                          fileimage,
                          datetime,
                          filesize,
                        } = data;

                        return (
                          <div class="file-edit-box" key={id}>
                            <span class="title">{data.filename}</span>
                            <div class="edit-btns">
                              <button onClick={() => DeleteSelectFile(id)}>
                                <span class="la la-trash"></span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <label>Upload Resume</label>
                    <div class="uploading-resume">
                      <div class="uploadButton">
                        <input
                          class="uploadButton-input"
                          type="file"
                          name="resumeAttachments[]"
                          accept="image/*, application/pdf"
                          id="uploadResume" // Unique id for resume upload input
                          onChange={ResumeInputChange} // Attach ResumeInputChange here
                          multiple
                        />
                        <label class="cv-uploadButton" for="uploadResume">
                          <span class="title">Drop files here to upload</span>
                          <span class="text">
                            To upload file size is (Max 5Mb) and allowed file
                            types are (.doc, .docx, .pdf)
                          </span>
                        </label>
                        <span class="uploadButton-file-name"></span>
                      </div>
                    </div>
                    <div class="files-outer">
                      {resume?.map((data, index) => {
                        const {
                          id,
                          filename,
                          filetype,
                          fileimage,
                          datetime,
                          filesize,
                        } = data;

                        return (
                          <div class="file-edit-box" key={id}>
                            <span class="title">{data.filename}</span>
                            <div class="edit-btns">
                              <button onClick={() => DeleteSelectResume(id)}>
                                <span class="la la-trash"></span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <br />

                    <form class="default-form" onSubmit={handleUpload}>
                      <div class="row">
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter Full Name"
                            value={name}
                            onChange={(e) => SetName(e.target.value)}
                          />
                          {nameError && (
                            <div className="error-message">{nameError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Current Designation</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter designation"
                            value={designation}
                            onChange={(e) => SetDesignation(e.target.value)}
                          />
                          {designationError && (
                            <div className="error-message">
                              {designationError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input
                            type="number"
                            name="name"
                            placeholder="Enter Phone Number"
                            value={phone}
                            onChange={(e) => SetPhone(e.target.value)}
                          />
                          {phoneError && (
                            <div className="error-message">{phoneError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Website</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter your Website"
                            value={website}
                            onChange={(e) => SetWebsite(e.target.value)}
                          />
                          {websiteError && (
                            <div className="error-message">{websiteError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-6  col-md-12">
                          <label>Current Salary</label>
                          <div class="input-group1">
                            <div class="form-group col-lg-3 col-md-12">
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
                              type="number"
                              name="name"
                              id="selectedCurrency"
                              class="form-control "
                              placeholder="Enter Current Salary"
                              value={CurrentSalary} // Only salary value is shown
                              onChange={(e) => SetCurrentSalary(e.target.value)}
                            />
                          </div>
                          {CurrentSalaryError && (
                            <div className="error-message">
                              {CurrentSalaryError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6  col-md-12">
                          <label>Expected Salary</label>
                          <div class="input-group1">
                            <div class="form-group col-lg-3 col-md-12">
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
                              type="number"
                              name="name"
                              id="selectedCurrency"
                              class="form-control "
                              placeholder="Enter Expected Salary"
                              value={expectedSalary} // Only salary value is shown
                              onChange={(e) =>
                                SetExpectedSalary(e.target.value)
                              }
                            />
                          </div>
                          {expectedSalaryError && (
                            <div className="error-message">
                              {expectedSalaryError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Experience</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter Work Experience"
                            value={Experience}
                            onChange={(e) => SetExperience(e.target.value)}
                          />
                          {ExperienceError && (
                            <div className="error-message">
                              {ExperienceError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Languages</label>
                          <Select
                            mode="multiple"
                            style={{ width: "100%" }}
                            className="custom-select"
                            placeholder="Select Languages"
                            options={languagOoptions}
                            value={languages}
                            onChange={(e) => {
                              SetLanguages(e);
                            }}
                          />
                          {languagesError && (
                            <div className="error-message">
                              {languagesError}
                            </div>
                          )}
                        </div>

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
                            options={options}
                            value={skills}
                            onChange={(e) => {
                              SetSkills(e);
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
                          {/* <Select
                            mode="multiple"
                            style={{ width: "100%" }}
                            className="custom-select"
                            placeholder="Select Skills"
                            options={options}
                            // value={jobSkills}
                            onChange={(e) => {
                              SetSkills(e);
                            }}
                          />*/}
                          {skillsError && (
                            <div className="error-message">{skillsError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          <label>Description</label>
                          <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => SetDescription(e.target.value)}
                          ></textarea>
                          {descriptionError && (
                            <div className="error-message">
                              {descriptionError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
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
                              "Save Details"
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4><span className="ss-profile-section-number">02</span>Education</h4>
                    <button
                      className="add-education-field theme-btn btn-style-one"
                      onClick={handleAddEducationField}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>

                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleEducation}>
                      {educationFields?.map((field, index) => (
                        <div className="row" key={field.id}>
                          <div className="form-group col-lg-4 col-md-12">
                            <label>College</label>
                            <input
                              type="text"
                              value={field.college}
                              onChange={(e) =>
                                handleEducationFieldChange(
                                  field.id,
                                  "college",
                                  e.target.value
                                )
                              }
                            />
                            {educationErrors[field.id] &&
                              educationErrors[field.id].college && (
                                <div className="error-message">
                                  {educationErrors[field.id].college}
                                </div>
                              )}
                          </div>

                          <div className="form-group col-lg-2 col-md-12">
                            <label>From</label>
                            <select
                              value={field.startYear}
                              onChange={(e) =>
                                handleEducationFieldChange(
                                  field.id,
                                  "startYear",
                                  e.target.value
                                )
                              }
                            >
                              <option> Select Start Year</option>
                              {generateYears().map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                            {educationErrors[field.id] &&
                              educationErrors[field.id].startYear && (
                                <div className="error-message">
                                  {educationErrors[field.id].startYear}
                                </div>
                              )}
                          </div>

                          <div className="form-group col-lg-2 col-md-12">
                            <label>To</label>
                            <select
                              value={field.endYear}
                              onChange={(e) =>
                                handleEducationFieldChange(
                                  field.id,
                                  "endYear",
                                  e.target.value
                                )
                              }
                            >
                              <option> select End Year</option>
                              {generateYears().map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                            {educationErrors[field.id] &&
                              educationErrors[field.id].endYear && (
                                <div className="error-message">
                                  {educationErrors[field.id].endYear}
                                </div>
                              )}
                          </div>

                          <div className="form-group col-lg-3 col-md-12">
                            <label>Degree</label>
                            <input
                              type="text"
                              value={field.degree}
                              onChange={(e) =>
                                handleEducationFieldChange(
                                  field.id,
                                  "degree",
                                  e.target.value
                                )
                              }
                            />
                            {educationErrors[field.id] &&
                              educationErrors[field.id].degree && (
                                <div className="error-message">
                                  {educationErrors[field.id].degree}
                                </div>
                              )}
                          </div>

                          {index > 0 && (
                            <div className="form-group col-lg-1 col-md-12">
                              <div className="delete-icon-wrapper">
                                <button
                                  className="delete-education-field"
                                  onClick={() =>
                                    handleDeleteEducationField(field.id)
                                  }
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="form-group col-lg-12 col-md-12">
                        <button className="theme-btn btn-style-one">
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
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4><span className="ss-profile-section-number">03</span>Work experience</h4>
                    <button
                      className="add-education-field theme-btn btn-style-one"
                      onClick={handleAddWorkExperienceField}
                    >
                      <FaPlus /> Add
                    </button>
                  </div>

                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleExperience}>
                      {workExperienceFields?.map((field, index) => (
                        <div className="row" key={field.id}>
                          <div className="form-group col-lg-4 col-md-12">
                            <label>Company Name</label>
                            <input
                              type="text"
                              value={field.companyName}
                              onChange={(e) =>
                                handleWorkExperienceFieldChange(
                                  field.id,
                                  "companyName",
                                  e.target.value
                                )
                              }
                            />
                            {workExperienceErrors[field.id] &&
                              workExperienceErrors[field.id].companyName && (
                                <div className="error-message">
                                  {workExperienceErrors[field.id].companyName}
                                </div>
                              )}
                          </div>

                          <div className="form-group col-lg-3 col-md-12">
                            <label>Role</label>
                            <input
                              type="text"
                              value={field.role}
                              onChange={(e) =>
                                handleWorkExperienceFieldChange(
                                  field.id,
                                  "role",
                                  e.target.value
                                )
                              }
                            />
                            {workExperienceErrors[field.id] &&
                              workExperienceErrors[field.id].role && (
                                <div className="error-message">
                                  {workExperienceErrors[field.id].role}
                                </div>
                              )}
                          </div>
                          <div className="form-group col-lg-2 col-md-12">
                            <label>From</label>
                            <select
                              value={field.startYear}
                              onChange={(e) =>
                                handleWorkExperienceFieldChange(
                                  field.id,
                                  "startYear",
                                  e.target.value
                                )
                              }
                            >
                              <option> Start</option>
                              {generateYears().map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                            {workExperienceErrors[field.id] &&
                              workExperienceErrors[field.id].startYear && (
                                <div className="error-message">
                                  {workExperienceErrors[field.id].startYear}
                                </div>
                              )}
                          </div>

                          <div className="form-group col-lg-2 col-md-12">
                            <label>To</label>
                            <select
                              value={field.endYear}
                              onChange={(e) =>
                                handleWorkExperienceFieldChange(
                                  field.id,
                                  "endYear",
                                  e.target.value
                                )
                              }
                            >
                              <option> End </option>

                              {generateYears().map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                            {workExperienceErrors[field.id] &&
                              workExperienceErrors[field.id].endYear && (
                                <div className="error-message">
                                  {workExperienceErrors[field.id].endYear}
                                </div>
                              )}
                          </div>
                          {index > 0 && (
                            <div className="form-group col-lg-1 col-md-12">
                              <div className="delete-icon-wrapper">
                                <button
                                  className="delete-education-field"
                                  onClick={() =>
                                    handleDeleteWorkExperienceField(field.id)
                                  }
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="form-group col-lg-12 col-md-12">
                        <button className="theme-btn btn-style-one">
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
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4><span className="ss-profile-section-number">04</span>Social links</h4>
                  </div>

                  <div class="widget-content">
                    <form class="default-form" onSubmit={handleSocialNetwork}>
                      <div class="row">
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Facebook</label>
                          <input
                            type="text"
                            name="name"
                            value={facebook}
                            onChange={(e) => SetFacebook(e.target.value)}
                          />
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Twitter</label>
                          <input
                            type="text"
                            name="name"
                            placeholder=""
                            value={twitter}
                            onChange={(e) => Settwitter(e.target.value)}
                          />
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Linkedin</label>
                          <input
                            type="text"
                            name="name"
                            placeholder=""
                            value={linkedin}
                            onChange={(e) => Setlinkedin(e.target.value)}
                          />
                          {linkedinError && (
                            <div className="error-message">{linkedinError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Instagram</label>
                          <input
                            type="text"
                            name="name"
                            placeholder=""
                            value={Instagram}
                            onChange={(e) => SetInstagram(e.target.value)}
                          />
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
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
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4><span className="ss-profile-section-number">05</span>Contact & location</h4>
                  </div>

                  <div class="widget-content">
                    <form class="default-form" onSubmit={handleContact}>
                      <div class="row">
                        <div class="form-group col-lg-6 col-md-12">
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
                          {countryError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {countryError}
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
                            onChange={(e) => setState(e)}
                            value={state}
                          />
                          {stateError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {stateError}
                            </div>
                          )}
                        </div>
                        <div class="form-group col-lg-12 col-md-12">
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
                          {cityError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {cityError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          <label>Complete Address</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => SetAddress(e.target.value)}
                          />
                          {addressError && (
                            <div className="error-message">{addressError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
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

export default Profile;
