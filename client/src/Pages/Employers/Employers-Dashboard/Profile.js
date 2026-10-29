import "Components/EmployerUI/ProfileEditor.css";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../../App";
import { Select, Space, Spin, ConfigProvider } from "antd";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { LoaderIcon, Toaster, toast } from "react-hot-toast";
import uniqid from "uniqid";

const Profile = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setloading] = useState(false);
  const [selectedfile, SetSelectedFile] = useState([]);
  const [Files, SetFiles] = useState([]);
  const [companyName, SetCompanyName] = useState("");
  const [phone, SetPhone] = useState("");
  const [website, SetWebsite] = useState("");
  const [foundedIn, SetFoundedIn] = useState("");
  const [teamSize, SetTeamSize] = useState("");
  const [description, SetDescription] = useState("");
  const [primaryIndustry, SetprimaryIndustry] = useState("");
  const [city, SetCity] = useState("");
  const [address, SetAddress] = useState("");
  const [country, SetCountry] = useState("United States");
  const [Social, SetSocials] = useState("");
  const [Facebook, SetFacebook] = useState("");
  const [linkedin, Setlinkedin] = useState("");
  const [Instagram, SetInstagram] = useState("");
  const [twitter, Settwitter] = useState("");
  const [skillData, SetSkillData] = useState([]);
  const [countryData, SetCountryData] = useState([]);
  const [industryData, SetIndustryData] = useState([]);
  const [cityData, SetCityData] = useState([]);
  const [state, setState] = useState(""); // Add state
  const [stateData, setStateData] = useState([]); // Add state data

  const [companyNameError, SetCompanyNameError] = useState("");
  const [phoneError, SetPhoneError] = useState("");
  const [websiteError, SetWebsiteError] = useState("");
  const [foundedInError, SetFoundedInError] = useState("");
  const [teamSizeError, SetTeamSizeError] = useState("");
  const [descriptionError, SetDescriptionError] = useState("");
  const [primaryIndustryError, SetprimaryIndustryError] = useState("");
  const [cityError, SetCityError] = useState("");
  const [stateError, SetStateError] = useState("");
  const [linkedinError, SetlinkedinError] = useState("");
  const [addressError, SetAddressError] = useState("");
  const [countryError, SetCountryError] = useState("");
  let token = localStorage.getItem("token");
  const navigate = useNavigate();
  const validateForm = () => {
    let isValid = true;

    // Validate Job Title
    if (phone.trim() === "") {
      SetPhoneError("Phone Number is required");
      setloading(false);
      isValid = false;
    } else {
      SetPhoneError("");
    }

    // Validate Job Description
    if (website.trim() === "") {
      SetWebsiteError("Website is required");
      setloading(false);
      isValid = false;
    } else {
      SetWebsiteError("");
    }

    // Validate Email Address
    if (foundedIn.trim() === "") {
      SetFoundedInError("Since is required");
      setloading(false);
      isValid = false;
    } else {
      // You can add email format validation here if needed
      SetFoundedInError("");
    }

    // Validate Job Type
    if (teamSize.trim() === "") {
      SetTeamSizeError("Team Size is required");
      setloading(false);
      isValid = false;
    } else {
      SetTeamSizeError("");
    }

    if (description.trim() === "") {
      SetDescriptionError("Description is required");
      setloading(false);
      isValid = false;
    } else {
      SetDescriptionError("");
    }

    if (primaryIndustry.trim() === "") {
      SetprimaryIndustryError("Primary Industry is required");
      setloading(false);
      isValid = false;
    } else {
      SetprimaryIndustryError("");
    }

    // if (city.trim() === "") {
    //   SetCityError("City is required");
    //   isValid = false;
    // } else {
    //   SetCityError("");
    // }

    // if (state.trim() === "") {
    //   SetStateError("State is required");
    //   isValid = false;
    // } else {
    //   SetStateError("");
    // }

    // if (country.trim() === "") {
    //   SetCountryError("Country is required");
    //   isValid = false;
    // } else {
    //   SetCountryError("");
    // }

    // if (address.trim() === "") {
    //   SetAddressError("Address is required");
    //   isValid = false;
    // } else {
    //   SetAddressError("");
    // }
    // if (linkedin.trim() === "") {
    //   SetlinkedinError("LinkedIn is required");
    //   isValid = false;
    // } else {
    //   SetlinkedinError("");
    // }

    return isValid;
  };
  const validateSocialForm = () => {
    let isValid = true;

    if (linkedin.trim() === "") {
      SetlinkedinError("LinkedIn is required");
      setloading(false);
      isValid = false;
    } else {
      SetlinkedinError("");
    }

    return isValid;
  };
  const validateLocationForm = () => {
    let isValid = true;
    if (city.trim() === "") {
      SetCityError("City is required");
      setloading(false);
      isValid = false;
    } else {
      SetCityError("");
    }

    if (state.trim() === "") {
      SetStateError("State is required");
      setloading(false);
      isValid = false;
    } else {
      SetStateError("");
    }

    if (country.trim() === "") {
      SetCountryError("Country is required");
      setloading(false);
      isValid = false;
    } else {
      SetCountryError("");
    }

    if (address.trim() === "") {
      SetAddressError("Address is required");
      setloading(false);
      isValid = false;
    } else {
      SetAddressError("");
    }

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
  const DeleteSelectFile = (id) => {
    if (window.confirm("Are you sure you want to delete this Image?")) {
      const result = selectedfile.filter((data) => data.id !== id);
      SetSelectedFile(result);
    } else {
      // alert('No');
    }
  };
  const DeleteFile = async (id) => {
    if (window.confirm("Are you sure you want to delete this Image?")) {
      const result = Files.filter((data) => data.id !== id);
      SetFiles(result);
    } else {
      // alert('No');
    }
  };

  let userId = localStorage.getItem("UserId");
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

      let basicDetails = {
        companyName,
        phone,
        website,
        foundedIn,
        teamSize,
        description,
        primaryIndustry,
        profileCompleted: true,
      };
      if (selectedfile.length != 0) {
        const imageUpload = await axios.post(
          `${Server}/api/v1/upload/image/employer/${userId}`,
          formData
        );
      }

      const { data } = await axios.post(
        `${Server}/api/v1/employer/update/${userId}`,
        basicDetails,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(imageUpload.data);
      // console.log(data);
      toast.success("Profile Successfully");
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      setloading(false);
      navigate("/employer-profile-view");
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };
  const handleSocialNetwork = async (e) => {
    e.preventDefault();
    const isFormValid = validateSocialForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      return; // Exit early if form validation fails
    }
    setloading(true);
    try {
      let basicDetails = [
        {
          Facebook: Facebook,
          Instagram: Instagram,
          linkedin: linkedin,
          twitter: twitter,
          profileCompleted: true,
        },
      ];

      // console.log(basicDetails);
      const { data } = await axios.post(
        `${Server}/api/v1/employer/update/${userId}`,
        { social: basicDetails },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(data);
      toast.success("Profile updated Successfully");
      setloading(false);
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/employer-profile-view");
    } catch (error) {
      // console.log(error);
      toast.error(error.response.data.message);
      setloading(false);
    }
  };
  const handleContact = async (e) => {
    e.preventDefault();
    const isFormValid = validateLocationForm();
    if (!isFormValid) {
      // console.log("Form validation failed. Please check the fields.");
      return; // Exit early if form validation fails
    }
    setloading(true);
    try {
      let basicDetails = {
        country: country,
        city: city,
        address,
        profileCompleted: true,
        state,
      };
      // console.log(basicDetails);

      const { data } = await axios.post(
        `${Server}/api/v1/employer/update/${userId}`,
        basicDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Profile updated Successfully");
      setloading(false);
      // console.log(data);
      let profileCompleted = localStorage.setItem("ProfileCompleted", "true");
      navigate("/employer-profile-view");
    } catch (error) {
      // console.log(error);
      setloading(false);
      toast.error(error.response.data.message);
    }
  };

  const getEmployerDetails = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/employer/${userId}`);
      setEmployers(data?.Employer[0]);
      SetCompanyName(data?.Employer[0]?.companyName);
      SetPhone(data?.Employer[0]?.phone);
      SetWebsite(data?.Employer[0]?.website);
      SetFoundedIn(data?.Employer[0]?.foundedIn);
      SetTeamSize(data?.Employer[0]?.teamSize);
      SetDescription(data?.Employer[0]?.description);
      SetprimaryIndustry(data?.Employer[0]?.primaryIndustry);
      SetCity(data?.Employer[0]?.city || "");
      setState(data?.Employer[0]?.state || "");
      SetAddress(data?.Employer[0]?.address);
      SetCountry(data?.Employer[0]?.country);
      SetFacebook(data?.Employer[0]?.social[0]?.facebook);
      Setlinkedin(data?.Employer[0]?.social[0]?.linkedin);
      SetInstagram(data?.Employer[0]?.social[0]?.instagram);
      Settwitter(data?.Employer[0]?.social[0]?.twitter);
      // console.log(employers);
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(relativeTime);
  useEffect(() => {
    getEmployerDetails();
  }, []);
  useEffect(() => {
    fetchCountries();
    fetchSkills();
    fetchIndustries();

    let profileCompleted = localStorage.getItem("ProfileCompleted");
    if (profileCompleted === "false") {
      toast.error("Please Update profile");
    }
  }, []);
  // useEffect(() => {
  //   if (country) {
  //     fetchStates();
  //     console.log(stateData);
  //   }
  // }, [country]);
 const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/countries`);
      // console.log(data);
      SetCountryData(data.countries);
    } catch (error) {
      // console.log(error);
    }
  };
  // Ignore responses for a previous country or state after the selection changes.
  useEffect(() => {
    let active = true;
    setStateData([]);
    if (country) {
      axios.get(`${Server}/api/v1/data/states/${encodeURIComponent(country)}`)
        .then(({ data }) => { if (active) setStateData(data.states || []); })
        .catch(() => { if (active) setStateData([]); });
    }
    return () => { active = false; };
  }, [country]);
  useEffect(() => {
    let active = true;
    SetCityData([]);
    if (country && state) {
      axios.get(`${Server}/api/v1/data/cities/${encodeURIComponent(country)}/${encodeURIComponent(state)}`)
        .then(({ data }) => { if (active) SetCityData(data.cities || []); })
        .catch(() => { if (active) SetCityData([]); });
    }
    return () => { active = false; };
  }, [country, state]);
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
      // console.log(data.country_city);
      SetIndustryData(data.industries);
    } catch (error) {
      // console.log(error);
    }
  };
  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const industryOptions = industryData?.map((e, idx) => ({
    value: e,
    label: e,
  }));
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
  const teamOptions = [
    { value: "1 -20", label: "1 -20" },
    { value: "21-200", label: "21-200" },
    { value: "201 - 500", label: "201 - 500" },
    { value: "501 - 1000", label: "501 - 1000" },
    { value: "1001- 5000", label: "1001- 5000" },
    { value: "5000 +", label: "5000 +" },
  ];
  // console.log(industryData);
  // console.log(skillData);
  // console.log(countryData);
  // console.log(primaryIndustry);
  // console.log(cityData);
  // console.log(country.length, city);
  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <section className="user-dashboard ss-profile-editor">
        <div class="dashboard-outer">
          <div class="upper-title-box">
            <h3>Edit company profile</h3>
            <div class="text">Help candidates get to know your company. Keep your details, links and location up to date.</div>
          </div>

          <div class="row">
            <div class="col-lg-12">
              <div class="ls-widget">
                <div class="tabs-box">
                  <div class="widget-title">
                    <h4><span className="ss-profile-section-number">01</span>Company details</h4>
                  </div>
                  <Toaster position="top-center" reverseOrder={false} />
                  <div class="widget-content">
                    <div class="uploading-outer">
                      <div class="uploadButton">
                        <input
                          class="uploadButton-input"
                          type="file"
                          name="attachments[]"
                          accept="image/*, application/pdf"
                          id="upload"
                          onChange={InputChange}
                          multiple
                        />
                        <label
                          class="uploadButton-button ripple-effect"
                          for="upload"
                        >
                          Browse Logo
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

                    {/* <div class="uploading-outer">
                      <div class="uploadButton">
                        <input
                          class="uploadButton-input"
                          type="file"
                          name="attachments[]"
                          accept="image/*, application/pdf"
                          id="upload_cover"
                          multiple
                        />
                        <label
                          class="uploadButton-button ripple-effect"
                          for="upload"
                        >
                          Browse Cover
                        </label>
                        <span class="uploadButton-file-name"></span>
                      </div>
                      <div class="text">
                        Max file size is 1MB, Minimum dimension: 330x300 And
                        Suitable files are .jpg & .png
                      </div>
  </div>*/}

                    <form class="default-form" onSubmit={handleUpload}>
                      <div class="row">
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Company name (optional)</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Company Name"
                            value={companyName}
                            onChange={(e) => SetCompanyName(e.target.value)}
                          />
                        </div>
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input
                            type="number"
                            name="name"
                            placeholder="0 123 456 7890"
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
                            placeholder="Enter your Comapny Website"
                            value={website}
                            onChange={(e) => SetWebsite(e.target.value)}
                          />
                          {websiteError && (
                            <div className="error-message">{websiteError}</div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Est. Since</label>
                          <input
                            type="date"
                            name="name"
                            placeholder="06.04.2020"
                            value={foundedIn}
                            onChange={(e) => SetFoundedIn(e.target.value)}
                          />
                          {foundedInError && (
                            <div className="error-message">
                              {foundedInError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Team Size</label>

                          <Select
                            style={{ width: "100%" }}
                            optionFilterProp="children"
                            virtual={false}
                            filterOption={filterOption}
                            className="custom-select"
                            placeholder="Select Your Time Size"
                            options={teamOptions}
                            value={teamSize}
                            // value={primaryIndustry}
                            onChange={(e) => SetTeamSize(e)}
                            // disabled={primaryIndustry !== null}
                          />
                          {teamSizeError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {teamSizeError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-6 col-md-12">
                          <label>Primary Industry </label>
                          <Select
                            showSearch
                            mode="single"
                            style={{ width: "100%" }}
                            optionFilterProp="children"
                            filterOption={filterOption}
                            className="custom-select"
                            placeholder="Select Industry"
                            options={industryOptions}
                            value={primaryIndustry}
                            // value={primaryIndustry}
                            onChange={(e) => SetprimaryIndustry(e)}
                            virtual={false}

                            // disabled={primaryIndustry !== null}
                          />
                          {primaryIndustryError && (
                            <div
                              className="error-message"
                              style={{ marginTop: "12px" }}
                            >
                              {primaryIndustryError}
                            </div>
                          )}
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          <label>About Company</label>
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
                              "Save Details"
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
                    <h4><span className="ss-profile-section-number">02</span>Social links</h4>
                  </div>

                  <div class="widget-content">
                    <form class="default-form" onSubmit={handleSocialNetwork}>
                      <div class="row">
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Facebook</label>
                          <input
                            type="text"
                            name="name"
                            value={Facebook}
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
                              "Save Details"
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
                    <h4><span className="ss-profile-section-number">03</span>Contact & location</h4>
                  </div>

                  <div class="widget-content">
                    <form class="default-form" onSubmit={handleContact}>
                      <div class="row">
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Country</label>
                          <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={filterOption}
                            style={{ width: "100%" }}
                            className="custom-select"
                            placeholder="Select Country"
                            options={countryOptions}
                            value={country}
                            virtual={false}
                            disabled
                            onChange={(e) => {
                              SetCountry(e);
                              setState("");
                              SetCity("");
                              setStateData([]);
                              SetCityData([]);
                              SetCountryError("");
                              SetStateError("");
                              SetCityError("");
                            }}
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
                            filterOption={filterOption}
                            className="custom-select"
                            placeholder="Select State"
                            options={stateOptions}
                            value={state || undefined}
                            disabled={!country}
                            virtual={false}
                            onChange={(e) => {
                              setState(e);
                              SetCity("");
                              SetCityData([]);
                              SetStateError("");
                              SetCityError("");
                            }}
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
                            filterOption={filterOption}
                            className="custom-select"
                            placeholder="Select City"
                            options={cityOptions}
                            value={city || undefined}
                            disabled={!country || !state}
                            virtual={false}
                            // value={primaryIndustry}
                            onChange={(e) => { SetCity(e); SetCityError(""); }}
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
                        {/* 
                        <div class="form-group col-lg-6 col-md-12">
                          <label>Find On Map</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                          />
                        </div>

                        <div class="form-group col-lg-3 col-md-12">
                          <label>Latitude</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Melbourne"
                          />
                        </div>

                        <div class="form-group col-lg-3 col-md-12">
                          <label>Longitude</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Melbourne"
                          />
                        </div>
            <div class="form-group col-lg-12 col-md-12">
                          <button class="theme-btn btn-style-three">
                            Search Location
                          </button>
                        </div>

                        <div class="form-group col-lg-12 col-md-12">
                          <div class="map-outer">
                            <div
                              class="map-canvas map-height"
                              data-zoom="12"
                              data-lat="-37.817085"
                              data-lng="144.955631"
                              data-type="roadmap"
                              data-hue="#ffc400"
                              data-title="Envato"
                              data-icon-path="images/resource/map-marker.png"
                              data-content="Melbourne VIC 3000, Australia<br><a href='mailto:info@youremail.com'>info@youremail.com</a>"
                            ></div>
                          </div>
</div>*/}

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
                              "Save Details"
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
