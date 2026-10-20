import React, { useEffect, useState } from "react";
import $ from "jquery";
import "jquery-ui/ui/widgets/slider";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Server } from "../../App";
import { Skeleton, Spin } from "antd";
import { formatDistanceToNow } from "date-fns";
import { Helmet } from "react-helmet";
// import Select from "react-select";
import { Select, Space, Tooltip, Button } from "antd";

// const options = [];
const { Option } = Select;
const JobList = () => {
  const navigate = useNavigate();
  const [sliderValues, setSliderValues] = useState([0, 1500]);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("New Jobs");
  const [industryData, SetIndustryData] = useState([]);
  const [countryData, SetCountryData] = useState([]);
  const [skillData, SetSkillData] = useState([]);
  const [cities, setCities] = useState([]); // array of selected cities
  const [cityData, SetCityData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [keyword, setKeyword] = useState([]);
  const [city, SetCity] = useState("");
  const [state, Setstate] = useState("");
  const [skills, setSkills] = useState([]);
  const [companyName, SetCompanyName] = useState("");
  const [country, setCountry] = useState("United States");
  const [industry, SetIndustry] = useState("");
  const [jobTitle, SetjobTitle] = useState([]);
  const [loader, setLoader] = useState(false);
  const [kewywordData, setKeywordData] = useState(false);
  const location = useLocation();
  const [jobType, setJobType] = useState(""); // New State for Job Type Filter
  const [experience, setExperience] = useState(""); // Experience Level Filter
  const [datePosted, setDatePosted] = useState(""); // Date Posted Filter
  const { City, job, Industry, State } = location.state || {};
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [shortlistLoader, setShortlistLoader] = useState(false);
  const [jobTitleError, setJobTitleError] = useState("");
  const [isPreferredLocations, setIsPreferredLocations] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const validateJobTitle = (value) => {
    const allowedPattern = /^[A-Za-z,_\- ]+$/; // allow space in between
    const hasLetter = /[A-Za-z]/.test(value);

    if (!value.trim()) return "Job title cannot be empty or only spaces.";
    if (value.length < 3) return "Minimum 3 characters required.";
    if (value.length > 30) return "Maximum 30 characters allowed.";
    if (value.startsWith(" ")) return "First character cannot be a space.";
    if (!allowedPattern.test(value))
      return "Only letters, commas, hyphens, underscores, and spaces are allowed.";
    if (!hasLetter) return "Must contain at least one letter.";

    return "";
  };
  useEffect(() => {
    if (location.state) {
      LocationKeyword();
    } else {
      // console.log("no state");
      getAllJobs();
      // Fetch states when country changes
      setKeywordData(false);
      // setLoader(false);
    }
  }, []);

  const stateOptions = country
    ? [
        ...stateData?.map((e) => ({
          value: e,
          label: e,
        })),
      ]
    : [{ value: null, label: "Select Country First" }];
  // console.log(stateOptions);
  const cityOptions = state
    ? [...cityData.map((e, idx) => ({ value: e, label: e }))]
    : [{ value: null, label: "Select State First" }];
  const handleCityChange = (e) => {
    setCities(e);
  };
  const LocationKeyword = async () => {
    SetjobTitle(job);
    setCountry("United States");
    SetIndustry(Industry);
    setLoader(true);

    try {
      let keywordData = {};

      // Push job title(s) to the keywordData array if available
      if (job) {
        keywordData.jobTitle = job;
        SetjobTitle(job);
      }

      // Push city to the keywordData array if available
      if (country) {
        keywordData.country = country;
        Setstate(State);
      }

      // Push categories to the keywordData array if available
      if (Industry) {
        keywordData.industry = Industry;
        SetIndustry(Industry);
      }
      if (State) {
        keywordData.state = State;
      }
      if (City) {
        keywordData.city = City;
        SetCity(City);
      }
      const { data } = await axios.post(
        `${Server}/api/v1/search/keyword/employer/jobs/`,

        keywordData
      );
      // console.log(data);
      // Update the job list with search results
      setJobs(data.results);
      setFilteredJobs(data.results);

      setKeywordData(true);
      SetjobTitle("");
      SetCity("");
      SetIndustry("");
      setLoader(false);
    } catch (error) {
      // console.log(error);
      // toast.error("Error");
      // setJobs([]);
      setFilteredJobs([]);
      setLoader(false);
    }
  };
  useEffect(() => {
    fetchCountries();
    fetchIndustries();
    fetchSkills();
    fetchStates();
  }, []);
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);

  let token = localStorage.getItem("token");
  let role = localStorage.getItem("Role");
  // console.log(token);
  const params = useParams();
  const getAllJobs = async () => {
    try {
      setLoader(true);
      let link = "";
      let preferred_locations = ["Dallas", "Plano"];
      const locationQuery =
        preferred_locations && preferred_locations.length > 0
          ? `&${preferred_locations
              .map((loc) => `locations=${encodeURIComponent(loc)}`)
              .join("&")}`
          : "";
      if (userId) {
        link = `${Server}/api/v1/employer/jobs/all-jobs/United-States?id=${userId}`;
      } else {
        link = `${Server}/api/v1/employer/jobs/all-jobs/United-States`;
      }
      const { data } = await axios.get(link);
      // console.log({ data: data.jobs });
      console.log(data.getAllJobs);
      setIsPreferredLocations(data?.preferred_locations);
      if (role === "Vendor") {
        console.log(data.getAllJobs);
        const sortedjobs = data.getAllJobs
          .filter((job) => job.isVendor === true)
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        setFilteredJobs(sortedjobs);
        setJobs(sortedjobs);
      } else {
        setJobs(data.getAllJobs);
        const sortedjobs = data.getAllJobs.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setFilteredJobs(sortedjobs);
      }
      setLoader(false);
    } catch (error) {
      // console.log(error);
      setLoader(false);
    }
  };
  let userId = localStorage.getItem("UserId");
  const keywordSearch = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      let keywordData = {};

      // Push job title(s) to the keywordData array if available
      if (jobTitle.length != 0) {
        keywordData.jobTitle = jobTitle;
      }

      // Push city to the keywordData array if available
      if (country.length != 0) {
        keywordData.country = country;
      }
      // Push city to the keywordData array if available
      if (city.length != 0) {
        keywordData.city = city;
      } // Push city to the keywordData array if available
      if (state.length != 0) {
        keywordData.state = state;
      } // Push city to the keywordData array if available
      if (companyName.length != 0) {
        keywordData.companyName = companyName;
      }
      if (skills.length != 0) {
        keywordData.skills = skills;
      }
      // Push categories to the keywordData array if available
      if (industry.length != 0 || industry === "All Categories") {
        keywordData.industry = industry;
      }

      const { data } = await axios.post(
        `${Server}/api/v1/search/keyword/employer/jobs`,

        keywordData
      );
      // console.log(data);
      // console.log(keywordData);
      // const jobsArray = data.results.reduce(
      //   (acc, curr) => acc.concat(curr.jobs),
      //   []
      // );

      // Update the job list with search results
      // setJobs(data.results);
      if (role === "Vendor") {
        const sortedjobs = data.results
          .filter((job) => job.isVendor === true)
          .sort((a, b) => new Date(b.time) - new Date(a.time));
        setFilteredJobs(sortedjobs);
      } else {
        const sortedjobs = data.results.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setFilteredJobs(sortedjobs);
      }

      setKeywordData(true);
      setLoader(false);
    } catch (error) {
      // console.log(error);
      setLoader(false);

      // setJobs([]);
      setFilteredJobs([]);
    }
  };

  const shortlistedJob = async (job) => {
    try {
      setShortlistLoader((prev) => ({ ...prev, [job.jobId]: true }));

      let jobDetails = {
        jobId: job.jobId,
        jobTitle: job.JobTitle,
        companyName: job.companyName,
        categories: job.Industry,
        city: job.City,
        country: job.Country,
        logo: job.image,
        empId: job.userId,
        status: job.status,
        email: job.EmailAddress,
        region: "United States",
        role: role,
      };
      // console.log(jobDetails);
      const { data } = await axios.post(
        `${Server}/api/v1/candidate/shortlistJob/add/${userId}`,
        jobDetails
      );
      // console.log(data);
      toast.success("Shortlisted Successfully");
      setShortlistLoader((prev) => ({ ...prev, [job.jobId]: false }));
    } catch (error) {
      // console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error in Shortlisting the job");
      }
      setShortlistLoader((prev) => ({ ...prev, [job.jobId]: false }));
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
      const Country = "United States";
      const { data } = await axios.get(
        `${Server}/api/v1/data/states/${Country}`
      );
      console.log(data.states);

      setStateData(data.states); // Set state data
    } catch (error) {
      // console.log(error);
    }
  };

  // useEffect(() => {

  // }, []);
  const handleSubmitCities = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoader(true);
      const res = await axios.post(
        `${Server}/api/v1/candidate/update/${userId}`,
        {
          preferred_locations: cities,
        }
      );
      setSubmitLoader(false);
      getAllJobs();
      console.log(res);
    } catch (error) {
      console.error(error);
      setSubmitLoader(false);
    }
  };
  useEffect(() => {
    if (state) {
      fetchCities(); // Fetch states when country changes
    }
  }, [state]);
  // useEffect(() => {

  // }, []);
  const fetchCities = async () => {
    try {
      const Country = "United States";

      const { data } = await axios.get(
        `${Server}/api/v1/data/cities/${Country}/${state}`
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
  useEffect(() => {
    // Slider for salary range
    if ($(".salary-range-slider").length) {
      $(".salary-range-slider").slider({
        range: true,
        min: 0,
        max: 20000,
        values: sliderValues,
        slide: function (event, ui) {
          setSliderValues(ui.values);
        },
      });

      // Initial values
      $(".salary-amount .min").text(sliderValues[0]);
      $(".salary-amount .max").text(sliderValues[1]);
    }
  }, [sliderValues]);

  const sortJobs = (jobs) => {
    // Implement sorting logic based on sortBy state
    // For example, you can sort by job title, salary, etc.
    let sortedJobs = [...jobs];
    if (sortBy === "New Jobs") {
      sortedJobs.sort((a, b) => new Date(b.time) - new Date(a.time));
    } else if (sortBy === "Freelance") {
      sortedJobs = sortedJobs.filter((job) => job.JobType === "Freelance");
    } else if (sortBy === "Full Time") {
      sortedJobs = sortedJobs.filter((job) => job.JobType === "Full Time");
    } else if (sortBy === "Internship") {
      sortedJobs = sortedJobs.filter((job) => job.JobType === "Internship");
    } else if (sortBy === "Part Time") {
      sortedJobs = sortedJobs.filter((job) => job.JobType === "Part Time");
    } else if (sortBy === "Temporary") {
      sortedJobs = sortedJobs.filter((job) => job.JobType === "Temporary");
    }
    return sortedJobs;
  };

  const filterAndPaginateJobs = () => {
    let sortedJobs = sortJobs(jobs);
    return sortedJobs;
  };
  let currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );
  const applyFilters = () => {
    let filtered = jobs.filter((job) => {
      const matchesJobType =
        jobType.length === 0 || jobType.includes(job.JobType);

      // Convert job time to a Date object for comparison
      const jobDate = new Date(job.time); // job.time is the stored date-time string
      const now = new Date();
      const timeDiffInMs = now - jobDate; // Time difference in milliseconds

      // Check if the selected date filter matches the job's posted date
      const matchesDatePosted =
        datePosted.length === 0 || checkDatePostedFilter(timeDiffInMs);

      const matchesExperience =
        experience === "" || checkExperienceFilter(job.Experience);

      return matchesJobType && matchesDatePosted && matchesExperience;
    });

    setFilteredJobs(filtered);
  };
  const checkExperienceFilter = (jobExperience) => {
    if (experience === "0-1") {
      return jobExperience >= 0 && jobExperience <= 1;
    } else if (experience === "1-2") {
      return jobExperience >= 1 && jobExperience <= 2;
    } else if (experience === "2-3") {
      return jobExperience >= 2 && jobExperience <= 3;
    } else if (experience === "3-4") {
      return jobExperience >= 3 && jobExperience <= 4;
    } else if (experience === "5+") {
      return jobExperience >= 5; // If "5+" is selected, check for job experience 5 years or more
    }
    return true; // If no experience filter is selected, show all jobs
  };
  // Function to check if the job matches the selected "Date Posted" filter
  const checkDatePostedFilter = (timeDiffInMs) => {
    switch (datePosted) {
      case "Last Hour":
        return timeDiffInMs <= 60 * 60 * 1000; // 1 hour in milliseconds
      case "Last 24 Hours":
        return timeDiffInMs <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      case "Last 7 Days":
        return timeDiffInMs <= 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      case "Last 14 Days":
        return timeDiffInMs <= 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
      case "Last 30 Days":
        return timeDiffInMs <= 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      case "All":
      default:
        return true; // Show all if "All" is selected
    }
  };
  useEffect(() => {
    applyFilters();
  }, [jobType, datePosted, experience]);

  const handleFilterChange = (filterType, value, checked) => {
    if (filterType === "jobType") {
      setJobType(
        checked ? [...jobType, value] : jobType.filter((type) => type !== value)
      );
    } else if (filterType === "datePosted") {
      setDatePosted(
        checked
          ? [...datePosted, value]
          : datePosted.filter((date) => date !== value)
      );
    } else if (filterType === "experience") {
      setExperience(
        checked
          ? [...experience, value]
          : experience.filter((exp) => exp !== value)
      );
    }
  };

  // useEffect(() => {
  //   const allJobs = filterAndPaginateJobs();
  //   console.log(jobType);

  //   const filteredJobs = allJobs.filter((job) => job.JobType === jobType);
  //   console.log(filteredJobs);
  //   currentJobs = filteredJobs;
  // }, [jobType]);
  // Logic to get current jobs based on current page and settings
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Event handler to navigate to the previous page
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Event handler to navigate to the next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Event handler to navigate to a specific page
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Event handler to update sorting option
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when changing sorting option
  };

  // Event handler to update items per page
  const handleJobsPerPageChange = (e) => {
    const page = e.target.value.split(" ");
    // console.log(parseInt(page[1]));
    setJobsPerPage(parseInt(page[1]));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  let profileCompleted = localStorage.getItem("ProfileCompleted");

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
  const [selectedSkills, setSelectedSkills] = useState([]);
  const skillsOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React.js" },
    { value: "node", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "django", label: "Django" },
    { value: "java", label: "Java" },
    { value: "aws", label: "AWS" },
    { value: "docker", label: "Docker" },
  ];
  const [value, setValue] = useState([
    "javascript",
    "react",
    "node",
    "python",
    "django",
    "java",
    "aws",
    "docker",
  ]);
  const selectProps = {
    skills,
    onChange: setSkills,
  };
  const options = skillData?.map((e, idx) => ({ value: e, label: e }));

  const sharedProps = {
    mode: "multiple",
    style: {
      width: "100%",
      height: "55px",
      border: "none",
    },
    options,
    placeholder: "Search Skills",
    maxTagCount: "responsive",
    virtual: false,
  };
  return (
    <div>
      <Helmet>
        <meta
          name="Find IT Jobs 2024 | Latest Job Listings in US | Skillstream Jobs"
          content="Find IT jobs for 2024 with SkillStream Jobs. Explore the latest job listings in US to connect with top employers and advance your tech career today."
        />
      </Helmet>
      <section class="page-title style-two">
        <div class="auto-container">
          <Toaster position="top-center" reverseOrder={false} />
          <div class="job-search-form">
            <form onSubmit={keywordSearch}>
              <div class="row">
                {/* <div class="form-group col-lg-4 col-md-12 col-sm-12">
                  <span class="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="Job title, keywords, or company"
                    value={jobTitle}
                    onChange={(e) => SetjobTitle(e.target.value)}
                  />
                </div> */}

                <div class="form-group col-lg-3 col-md-12 col-sm-12">
                  <span class="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="Job title"
                    value={jobTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      SetjobTitle(val);
                      setJobTitleError(validateJobTitle(val));
                    }}
                  />
                  {jobTitleError && (
                    <p
                      style={{
                        color: "red",
                        paddingLeft: "20px",
                        paddingTop: "5px",
                      }}
                    >
                      {jobTitleError}
                    </p>
                  )}
                </div>
                <div class="form-group col-lg-3 col-md-12 col-sm-12">
                  <span class="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => SetCompanyName(e.target.value)}
                  />
                </div>
                {/* <div className="form-group col-lg-3 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <Select
                    isMulti
                    name="skills"
                    options={skillsOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder=".......Select skills"
                    value={selectedSkills}
                    onChange={setSelectedSkills}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "60px",
                        maxHeight: "60px",
                        overflow: "hidden",
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        maxHeight: "40px",
                        overflowY: "auto",
                        display: "flex",
                        flexWrap: "nowrap",
                        scrollbarWidth: "thin",
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e0e0e0",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                      }),
                    }}
                  />
                </div> */}
                <div className="form-group col-lg-6 col-md-12 col-sm-12">
                  <Space
                    direction="vertical"
                    style={{
                      width: "100%",
                    }}
                  >
                    <Select
                      {...sharedProps}
                      {...selectProps}
                      maxTagPlaceholder={(omittedValues) => (
                        <Tooltip
                          styles={{
                            root: {
                              pointerEvents: "none",
                            },
                          }}
                          title={omittedValues
                            .map(({ label }) => label)
                            .join(", ")}
                        >
                          <span>Hover Me</span>
                        </Tooltip>
                      )}
                    />
                  </Space>
                </div>
              </div>
              <div
                style={{
                  height: "1px",
                  width: "100%",
                  backgroundColor: "#e6e6e6",
                }}
              ></div>
              <div className="row align-items-center">
                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-map-locator"></span>
                  {/* <input
                    type="text"
                    name="field_name"
                    placeholder="State"
                    value={state}
                    onChange={(e) => Setstate(e.target.value)}
                  />*/}
                  <select
                    className="form-control"
                    value={state}
                    onChange={(e) => {
                      Setstate(e.target.value);
                    }}
                    disabled={!country} // Disable if no country selected
                  >
                    <option value="">Select State</option>
                    {stateData?.map((e, idx) => (
                      <option key={idx} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-map-locator"></span>
                  <select
                    className="form-control"
                    value={city}
                    onChange={(e) => {
                      SetCity(e.target.value);
                    }}
                    disabled={!state} // Disable if no state selected
                  >
                    <option value="">Select City</option>
                    {cityData?.map((e, idx) => (
                      <option key={idx} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-lg-3 col-md-6 col-sm-6 location">
                  <span className="icon flaticon-briefcase"></span>
                  <select
                    className="chosen-select small-dropdown"
                    value={industry}
                    onChange={(e) => SetIndustry(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {industryData?.map((e, idx) => (
                      <option key={idx} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wrapper div to align Find Jobs button at the end */}
                <div className="form-group col-lg-2 col-md-12 col-sm-12 d-flex justify-content-end mt-3 mt-lg-0">
                  <button
                    type="submit"
                    className="theme-btn btn-style-one w-100"
                    disabled={loader || jobTitleError}
                    style={{
                      backgroundColor:
                        loader || jobTitleError ? "#cbd5e0" : "#1e90ff", // gray-400 or blue-700
                      color: "white",
                      cursor:
                        loader || jobTitleError ? "not-allowed" : "pointer",
                      border: "none",
                      padding: "0.75rem 1.5rem",
                      fontWeight: "bold",
                      borderRadius: "0.5rem",
                      transition: "background-color 0.3s",
                    }}
                  >
                    {loader ? "Finding Jobs.." : "Find Jobs"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section class="ls-section">
        <div class="auto-container">
          <div class="filters-backdrop"></div>

          <div class="row">
            <div class="filters-column col-lg-4 col-md-12 col-sm-12">
              <div class="inner-column">
                <div class="filters-outer">
                  <button type="button" class="theme-btn close-filters">
                    X
                  </button>

                  {/* <div class="switchbox-outer">
                    <h4>Job type</h4>
                    <ul class="switchbox">
                      {[
                        { label: "Freelance", value: "Freelance" },
                        { label: "Full Time", value: "Full Time" },
                        { label: "Internship", value: "Internship" },
                        { label: "Part Time", value: "Part Time" },
                        { label: "Temporary", value: "Temporary" },
                        { label: "Contract", value: "Contract" },
                      ].map((job) => (
                        <li key={job.value}>
                          <label class="switch">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setJobType((prev) => [...prev, job.value]);
                                } else {
                                  setJobType((prev) =>
                                    prev.filter((type) => type !== job.value)
                                  );
                                }
                              }}
                            />
                            <span class="slider round"></span>
                            <span class="title">{job.label}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                   <div className="checkbox-outer">
                    <h4>Date Posted</h4>
                    <ul className="checkboxes">
                      {[
                        { label: "All", value: "All" },
                        { label: "Last Hour", value: "Last Hour" },
                        { label: "Last 24 Hours", value: "Last 24 Hours" },
                        { label: "Last 7 Days", value: "Last 7 Days" },
                        { label: "Last 14 Days", value: "Last 14 Days" },
                        { label: "Last 30 Days", value: "Last 30 Days" },
                      ].map((date) => (
                        <li key={date.value}>
                          <label>
                            <input
                              type="radio"
                              name="datePosted"
                              value={date.value}
                              checked={datePosted === date.value}
                              onChange={(e) =>
                                setDatePosted(e.target.checked ? date.value : "")
                              }
                            />
                            {date.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>*/}
                  <div className="checkbox-outer">
                    <h4>Job Type</h4>
                    <ul className="checkboxes square1">
                      {[
                        { label: "Freelance", value: "Freelance" },
                        { label: "Full Time", value: "Full Time" },
                        { label: "Internship", value: "Internship" },
                        { label: "Part Time", value: "Part Time" },
                        { label: "Temporary", value: "Temporary" },
                        { label: "Contract", value: "Contract" },
                      ].map((exp) => (
                        <li key={exp.value}>
                          <input
                            id={`check-${exp.value}`}
                            type="checkbox"
                            name="experience"
                            value={exp.value}
                            checked={jobType === exp.value}
                            onChange={(e) =>
                              setJobType(e.target.checked ? exp.value : "")
                            }
                          />
                          <label htmlFor={`check-${exp.value}`}>
                            {exp.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="checkbox-outer">
                    <h4>Date Posted</h4>
                    <ul className="checkboxes square1">
                      {[
                        { label: "All", value: "All" },
                        { label: "Last Hour", value: "Last Hour" },
                        { label: "Last 24 Hours", value: "Last 24 Hours" },
                        { label: "Last 7 Days", value: "Last 7 Days" },
                        { label: "Last 14 Days", value: "Last 14 Days" },
                        { label: "Last 30 Days", value: "Last 30 Days" },
                      ].map((exp) => (
                        <li key={exp.value}>
                          <input
                            id={`check-${exp.value}`}
                            type="checkbox"
                            name="experience"
                            value={exp.value}
                            checked={datePosted === exp.value}
                            onChange={(e) =>
                              setDatePosted(e.target.checked ? exp.value : "")
                            }
                          />
                          <label htmlFor={`check-${exp.value}`}>
                            {exp.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="checkbox-outer">
                    <h4>Experience</h4>
                    <ul className="checkboxes square1">
                      {[
                        { label: "0-1", value: "0-1" },
                        { label: "1-2", value: "1-2" },
                        { label: "3-4", value: "3-4" },
                        { label: "5+", value: "5+" },
                      ].map((exp) => (
                        <li key={exp.value}>
                          <input
                            id={`check-${exp.value}`}
                            type="checkbox"
                            name="experience"
                            value={exp.value}
                            checked={experience === exp.value}
                            onChange={(e) =>
                              setExperience(e.target.checked ? exp.value : "")
                            }
                          />
                          <label htmlFor={`check-${exp.value}`}>
                            {exp.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/*  <button
                    // onClick={keywordSearch}
                    className="theme-btn btn-style-two"
                    style={{ marginRight: "20px" }}
                  >
                    Search
                  </button>
                  <button className="theme-btn btn-style-two">Reset</button>*/}
                </div>
              </div>
            </div>

            <div class="content-column col-lg-8 col-md-12 col-sm-12">
              <div class="ls-outer">
                <div class="ls-switcher">
                  <div class="showing-result">
                    {isPreferredLocations && filteredJobs.length !== 0 && (
                      <div className="text">
                        Showing{" "}
                        <strong>
                          {(currentPage - 1) * jobsPerPage + 1}-
                          {currentPage * jobsPerPage}
                        </strong>{" "}
                        of <strong>{filteredJobs.length}</strong> jobs
                      </div>
                    )}
                  </div>
                </div>

                {loader ? (
                  <p style={{ textAlign: "center" }}>Searching ....</p>
                ) : filteredJobs.length === 0 ? (
                  <p style={{ textAlign: "center" }}>No Jobs Found</p>
                ) : userId && !isPreferredLocations ? (
                  <div className="container py-4">
                    <div className="row justify-content-center">
                      <div className="col-lg-6 col-md-8 col-sm-12">
                        <p className="text-center mb-4 fw-semibold">
                          Add your preferred cities to view more relevant job
                          opportunities
                        </p>

                        {/* State Select */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Select State
                          </label>
                          <div className="position-relative">
                            <i
                              className="bi bi-geo-alt-fill position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary"
                              style={{ zIndex: 2 }}
                            ></i>
                            <Select
                              showSearch
                              style={{ width: "100%" }}
                              virtual={false}
                              optionFilterProp="children"
                              onChange={(e) => {
                                Setstate(e);
                                setCities([]);
                              }}
                              className="custom-select"
                              placeholder="Select State"
                              options={stateOptions}
                              value={state}
                              filterOption={filterOption}
                            />
                          </div>
                        </div>

                        {/* City Multi-select (AntD) */}

                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Select Preferred Cities
                          </label>
                          <Select
                            mode="multiple"
                            // allowClear
                            showSearch
                            virtual={false}
                            style={{ width: "100%" }}
                            placeholder="Select one or more cities"
                            className="custom-select"
                            value={cities}
                            onChange={handleCityChange}
                            optionFilterProp="children"
                            options={cityOptions}
                            disabled={!state}
                            filterOption={filterOption}
                          />
                        </div>

                        {/* Submit Button */}

                        <div className="text-center">
                          <Button
                            type="primary"
                            className="px-5"
                            disabled={!state || cities.length === 0}
                            onClick={(e) => handleSubmitCities(e)}
                            loading={submitLoader}
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentJobs?.map((job, subIndex) => (
                    <div key={subIndex}>
                      {/*console.log(job)*/}

                      <a>
                        <div className="job-block">
                          <div className="inner-box">
                            <button
                              className="bookmark-btn"
                              onClick={() => shortlistedJob(job)}
                            >
                              {shortlistLoader[job.jobId] ? (
                                <Spin />
                              ) : (
                                <span className="flaticon-bookmark"></span>
                              )}
                            </button>
                            <div className="content">
                              <span className="company-logo">
                                <img src={job.image} alt="" />
                              </span>
                              <h4>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/job-detail/${job.userId}/${job.jobId}`
                                    )
                                  }
                                >
                                  {job.JobTitle}
                                </button>
                              </h4>
                              <ul className="job-info">
                                {job.Industry ? (
                                  <li>
                                    <span className="icon flaticon-briefcase"></span>{" "}
                                    {job.Industry}
                                  </li>
                                ) : null}
                                {(job.City || job.Country) && (
                                  <li>
                                    <span className="icon flaticon-map-locator"></span>{" "}
                                    {job.City && job.Country && job.State
                                      ? `${job.City}, ${job.State} , ${job.Country}`
                                      : job.City && job.Country
                                      ? `${job.City}, ${job.Country}`
                                      : job.City || job.Country}
                                  </li>
                                )}
                                {/* Assuming you have a createdAt field in your job data */}
                                <li>
                                  <span className="icon flaticon-clock-3"></span>{" "}
                                  {formatDistanceToNow(new Date(job?.time), {
                                    addSuffix: true,
                                  })}
                                </li>
                                {job.offeredSalary ? (
                                  <li>
                                    <span className="icon flaticon-money"></span>{" "}
                                    {job.offeredSalary}
                                  </li>
                                ) : null}
                              </ul>
                              <ul className="job-other-info">
                                {job.JobType ? (
                                  <li className="time">{job.JobType}</li>
                                ) : null}
                                {job.employmentType ? (
                                  <li className="privacy">
                                    {job.employmentType}
                                  </li>
                                ) : null}
                                {/* <li className="required">Immediately</li>*/}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))
                )}

                {userId &&
                !isPreferredLocations ? null : filteredJobs.length !== 0 ? (
                  <nav className="ls-pagination">
                    <ul>
                      {/* Previous Button */}
                      <li
                        className={`prev ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <a href="#" onClick={goToPrevPage}>
                          <i className="fa fa-arrow-left"></i>
                        </a>
                      </li>

                      {/* Pagination Numbers */}
                      {(() => {
                        const pages = [];
                        const maxPagesToShow = 5;
                        const currentSetStart =
                          Math.floor((currentPage - 1) / maxPagesToShow) *
                            maxPagesToShow +
                          1;
                        const currentSetEnd = Math.min(
                          currentSetStart + maxPagesToShow - 1,
                          totalPages
                        );

                        if (currentSetStart > 1) {
                          pages.push(
                            <li key={1}>
                              <a href="#" onClick={() => goToPage(1)}>
                                1
                              </a>
                            </li>
                          );
                          if (currentSetStart > 2) {
                            pages.push(<li key="dots-prev">...</li>);
                          }
                        }

                        for (let i = currentSetStart; i <= currentSetEnd; i++) {
                          pages.push(
                            <li
                              key={i}
                              className={currentPage === i ? "active" : ""}
                            >
                              <a href="#" onClick={() => goToPage(i)}>
                                {i}
                              </a>
                            </li>
                          );
                        }

                        if (currentSetEnd < totalPages) {
                          if (currentSetEnd < totalPages - 1) {
                            pages.push(<li key="dots-next">...</li>);
                          }
                          pages.push(
                            <li key={totalPages}>
                              <a href="#" onClick={() => goToPage(totalPages)}>
                                {totalPages}
                              </a>
                            </li>
                          );
                        }

                        return pages;
                      })()}

                      {/* Next Button */}
                      <li
                        className={`next ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <a href="#" onClick={goToNextPage}>
                          <i className="fa fa-arrow-right"></i>
                        </a>
                      </li>
                    </ul>
                  </nav>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobList;
// const [currentPage, setCurrentPage] = useState(1);
// const jobsPerPage = 10; // Change this value to adjust the number of jobs per page

// // Logic to get current jobs based on current page
// const indexOfLastJob = currentPage * jobsPerPage;
// const indexOfFirstJob = indexOfLastJob - jobsPerPage;
// const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

// // Logic to determine total number of pages
// const totalPages = Math.ceil(jobs.length / jobsPerPage);

// // Event handler to navigate to the previous page
// const goToPrevPage = () => {
//   if (currentPage > 1) {
//     setCurrentPage(currentPage - 1);
//   }
// };

// // Event handler to navigate to the next page
// const goToNextPage = () => {
//   if (currentPage < totalPages) {
//     setCurrentPage(currentPage + 1);
//   }
// };

// // Event handler to navigate to a specific page
// const goToPage = (pageNumber) => {
//   setCurrentPage(pageNumber);
// };