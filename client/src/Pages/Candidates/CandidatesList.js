import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import $ from "jquery";
import "jquery-ui/ui/widgets/slider";
import axios from "axios";
import { Select, Space, Menu, Dropdown } from "antd";
import Highlighter from "react-highlight-words";

// import { DownOutlined } from "@ant-design/icons-svg";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";
import { Server } from "../../App";
import { useNavigate } from "react-router-dom";
import Mail from "../../Components/Mail";
import { Button, Table, Divider, Input, Tooltip } from "antd";
import { jwtDecode } from "jwt-decode";
import { Toast } from "bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa"; // Importing icons
import { Helmet } from "react-helmet";
import ForwardMail from "Components/ForwardMail";
import { useSafeLayoutEffect } from "@chakra-ui/react";
import EditCandidateDrawer from "Components/Header/EditCandidateDrawer";
// import { Select } from "antd";
import ProgressLoader from "Components/Loader/ProgressLoader/Loader";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";
import ResumePreviewDrawer from "Components/ReaderDrawer/ResumePreviewDrawer";
import SubscriptionGuard from "Components/SubscriberCheckWrapper/SubscriptionGuard";

const CandidatesList = () => {
  const navigate = useNavigate();
  const [areaValues, setAreaValues] = useState([0, 50]);
  const [candidates, setCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPerPage, setCandidatesPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("New Jobs");
  const [jobTitle, setJobTitle] = useState("");
  const [addSkills, setAddSkills] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [updatedDateFilter, setUpdatedDateFilter] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [country, SetCountry] = useState("United States");
  const [city, SetCity] = useState([]);
  const [countryData, SetCountryData] = useState([]);
  const [cityData, SetCityData] = useState([]);
  const [state, setState] = useState([]); // Add state
  const [stateData, setStateData] = useState([]); // Add state data
  const [status, setStatus] = useState("Pending");
  const [skills, setSkills] = useState([{ skill: "", operator: "AND" }]);
  const [fromEmail, setFromEmail] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchloading, setSearchLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  const [skillData, SetSkillData] = useState([]);
  const searchInput = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [open, setOpen] = useState(false);
  const [jobSkills, setJobSkills] = useState([]);
  const [addSkillDB, setAddSkillDB] = useState(""); // Set initial state to 'Contract'
  let token = localStorage.getItem("token");
  const [distance, setDistance] = useState(50);
  const [distanceDisabled, setDistanceDisabled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [highlightedArray, setHighLightedArray] = useState([]);
  const { access } = jwtDecode(token);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm();
  };
  const hasJobTitle = jobTitle.trim() !== "";
  const hasState = Array.isArray(state) && state.length > 0;
  const hasCity = Array.isArray(city) && city.length > 0;
  const hasSkill =
    Array.isArray(skills) && skills.some((s) => s.skill.trim() !== "");
  const locationEntered = hasCity || hasState;
  const isSearchDisabled = !(
    (
      hasJobTitle ||
      (locationEntered && hasSkill) || // city/state entered AND at least one skill
      (!locationEntered && hasSkill)
    ) // no city/state, skill alone is fine
  );
  let tooltipMessage = "";
  if (isSearchDisabled) {
    if (locationEntered) {
      tooltipMessage =
        "Enter at least one skill or job title to search with city/state.";
    } else {
      tooltipMessage = "Job title or at least one skill is required to search.";
    }
  }
  // const isSearchDisabled = !(
  //   jobTitle.trim() ||
  //   (Array.isArray(state) && state.length > 0) ||
  //   (Array.isArray(city) && city.length > 0) ||
  //   skills.some((s) => s.skill.trim() !== "")
  // );
  const handleCancel = () => {
    setSelectedResume(null);
    setDrawerVisible(false);
  };
  const handlePreview = (resumeUrl) => {
    if (!resumeUrl) {
      toast.error("No resume uploaded");
      return;
    }
    console.log(resumeUrl);
    setSelectedResume(resumeUrl); // ✅ Use the real file URL, not Google Docs Viewer
    setDrawerVisible(true);
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
    },
    {
      title: "Country",
      dataIndex: "country",
    },
    {
      title: "State",
      dataIndex: "state",
    },
    {
      title: "City",
      dataIndex: "city",
      ...getColumnSearchProps("city"),
    },
    {
      title: "Experience",
      dataIndex: "experience",
    },
    {
      title: "Work Authorization",
      dataIndex: "workAuthorization", // Make sure your data includes this field
    },
    {
      title: "Last Updated",
      dataIndex: "lastloggedin", // Make sure your data includes this field
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const fileExtension = record.resume?.split(".").pop().toLowerCase();
        const isDocx = fileExtension === "docx";
        const fileUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(
          record.resume,
        )}`;

        return (
          <Space size="middle">
            {record.resume ? (
              <Tooltip title="View Resume">
                <Button
                  onClick={() => handlePreview(record.resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <EyeOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
                </Button>
              </Tooltip>
            ) : (
              "No CV"
            )}
          </Space>
        );
      },
    },
  ];
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setFromEmail(decodedToken?.email);
    }
    // console.log(fromEmail);
  }, []);

  let searchData = [];
  for (let i = 0; i < candidates.length; i++) {
    searchData.push({
      key: i,
      name: candidates[i].name ? candidates[i].name : "User",
      workAuthorization: candidates[i].workAuthorization
        ? candidates[i].workAuthorization
        : "NA",
      // jobTitle: `Job Title ${i}`,
      country: candidates[i].country ? candidates[i].country : "NA",
      state: candidates[i].state ? candidates[i].state : "NA",
      resume: candidates[i].resume ? candidates[i].resume : "NA",
      experience: candidates[i].experience ? candidates[i].experience : "NA",
      jobTitle: candidates[i].jobTitle ? candidates[i].jobTitle : "NA",
      city: candidates[i].city ? candidates[i].city : "NA",
      lastloggedin: candidates[i].lastLoggedIn
        ? formatDistanceToNow(new Date(candidates[i].lastLoggedIn), {
            addSuffix: true,
          })
        : "Not Active",
    });
  }

  const showMailModal = () => {
    setModalOpen(true);
  };
  const showForwardMailModal = () => {
    setMailModalOpen(true);
  };
  const handleOk = () => {
    setModalOpen(false);
  };

  // console.log(modalOpen);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const start = () => {
    setLoading(true);
    // ajax request after empty completing
    setTimeout(() => {
      setSelectedRowKeys([]);
      setLoading(false);
    }, 1000);
  };
  const onSelectChange = (newSelectedRowKeys) => {
    // console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  // Function to handle "Select All" checkbox change
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAllChecked(isChecked);
    const updatedSelectedCandidates = isChecked
      ? sortedCandidates.map((candidate) => candidate.email)
      : [];
    setSelectedCandidates(updatedSelectedCandidates);
  };

  // Function to handle individual checkbox change
  const handleCandidateCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    const candidateEmail = event.target.dataset.email; // Assuming you have data attribute for candidate's email
    if (isChecked) {
      setSelectedCandidates([...selectedCandidates, candidateEmail]);
    } else {
      const updatedSelectedCandidates = selectedCandidates.filter(
        (email) => email !== candidateEmail,
      );
      setSelectedCandidates(updatedSelectedCandidates);
    }
    setSelectAllChecked(selectedCandidates.length === sortedCandidates.length);
  };
  // console.log(candidates);
  const sendEmail = () => {
    const mailtoLink = "mailto:" + selectedCandidates.join(",");
    window.location.href = mailtoLink;
  };

  useEffect(() => {
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    // Slider for area range
    if ($(".area-range-slider").length) {
      $(".area-range-slider").slider({
        range: true,
        min: 0,
        max: 100,
        values: areaValues,
        slide: function (event, ui) {
          setAreaValues(ui.values);
        },
      });

      // Initial value
      $(".area-amount").text(areaValues[1]);
    }
  }, [areaValues]);

  let profileCompleted = localStorage.getItem("ProfileCompleted");
  let role = localStorage.getItem("Role");
  useEffect(() => {
    if (profileCompleted === "false") {
      console.log(typeof profileCompleted);
      if (role === "Candidate") {
        navigate("/my-profile");
      } else {
        navigate("/company-profile");
      }
    }
  }, []);

  const jobsPerPage = 4; // Change this value as needed

  // Logic to get current jobs based on current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = candidates.slice(indexOfFirstJob, indexOfLastJob);

  // Logic to get current candidates based on current page and candidates per page
  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  let sortedCandidates = [...filteredCandidates];
  // useEffect(() => {
  //   if (jobTitle.length != 0) {
  //     keywordSearch();
  //   }
  // }, [jobTitle]);

  // let key = {};
  // if (jobTitle.length != 0) key.jobTitle = jobTitle;
  // if (addSkills.length != 0) key.addSkills = addSkills;
  // // if (country.length != 0) key.country = country;
  // if (city && city.length != 0) key.city = city;
  // if (state && state.length != 0) key.state = state;
  // if (keyword.length != 0) key.keyword = keyword;
  // console.log(key);
  const keywordSearch = async (e) => {
    // e.preventDefault();
    try {
      setStatus("Loading");

      let keywordData = { country: "United States" };

      if (jobTitle.length !== 0) keywordData.jobTitle = jobTitle;
      if (addSkills.length !== 0) keywordData.addSkills = addSkills;
      // if (country.length != 0) keywordData.country = country;
      if (city && city.length !== 0 && !city?.includes("All"))
        keywordData.city = city;
      if (state && state.length !== 0 && !state?.includes("All"))
        keywordData.state = state;
      if (distance && !distanceDisabled) keywordData.distance = distance;
      if (keyword.length != 0) keywordData.keyword = keyword;

      const { data } = await axios.post(
        `${Server}/api/v1/search/keyword/candidate`,

        keywordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(data);
      // console.log(keywordData);

      setStatus("Completed");

      const candidatesWithResume = data.results.filter(
        (candidate) => candidate.resume,
      );

      // Update the job list with search results
      setCandidates(candidatesWithResume);
      setFilteredCandidates(candidatesWithResume);
      // setKeywordData(true);
    } catch (error) {
      // console.log(error);
      if (error.response) {
        if (error?.response?.data?.message === "No results Found") {
          setCandidates([]);
          setStatus("Completed");
          searchData = [];
        } else {
          setCandidates([]);
          toast.error(error?.response?.data?.message);
          setStatus("Pending");
        }
      } else {
        setCandidates([]);
        toast.error("Internal Server Error");
        setStatus("Pending");
      }
    }
  };
  useEffect(() => {
    fetchSkills();
  }, []);
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
  const skillOptions = skillData?.map((e, idx) => ({ value: e, label: e }));

  const addSkill = async () => {
    try {
      const { data } = await axios.post(`${Server}/api/v1/data/addSkills`, {
        jobSkills: addSkillDB,
      });
      // console.log(data);
      setJobSkills([...jobSkills, addSkillDB]);
      fetchSkills();
      toast.success("skills added");
      setAddSkills("");
    } catch (error) {
      // console.log(error);
    }
  };
  let emails = [];
  let selectedCandidate = [];
  useEffect(() => {
    selectedRowKeys.map((e, idx) => {
      // console.log(sortedCandidates[e].email);
      emails.push(sortedCandidates[e].email);
      selectedCandidate.push(sortedCandidates[e].resume);
      setSelectedEmails(emails);
      setSelectedResumes(selectedCandidate);
    });
  }, [selectedRowKeys]);
  let addedCandidates = [];
  useEffect(() => {
    selectedRowKeys.map((e, idx) => {
      addedCandidates.push(sortedCandidates[e]);
      setSelectedUser(addedCandidates);
    });
  }, [selectedRowKeys]);
  // console.log(selectedResumes);

  // console.log(selectedEmails);
  // Sorting logic
  if (sortBy === "New Jobs") {
    sortedCandidates.sort((a, b) => (a.date > b.date ? -1 : 1));
  } else if (sortBy === "Freelance") {
    sortedCandidates = sortedCandidates.filter(
      (candidate) => candidate.type === "Freelance",
    );
  } else if (sortBy === "Full Time") {
    sortedCandidates = sortedCandidates.filter(
      (candidate) => candidate.type === "Full Time",
    );
  } else if (sortBy === "Internship") {
    sortedCandidates = sortedCandidates.filter(
      (candidate) => candidate.type === "Internship",
    );
  } else if (sortBy === "Part Time") {
    sortedCandidates = sortedCandidates.filter(
      (candidate) => candidate.type === "Part Time",
    );
  } else if (sortBy === "Temporary") {
    sortedCandidates = sortedCandidates.filter(
      (candidate) => candidate.type === "Temporary",
    );
  } // Add other sorting options as needed

  const currentCandidates = sortedCandidates.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate,
  );

  // Logic to determine total number of pages

  // Event handler to change candidates per page
  const handleCandidatesPerPageChange = (event) => {
    setCandidatesPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to first page when changing candidates per page
  };

  // Event handler to change sorting option
  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1); // Reset to first page when changing sorting option
  };

  const filterByUpdatedDate = (selectedOption) => {
    let startDate;
    const currentDate = new Date();

    switch (selectedOption) {
      case "All":
        setFilteredCandidates(candidates); // Reset filteredCandidates to all candidates
        return;
      case "Last Hour":
        startDate = new Date(currentDate.getTime() - 60 * 60 * 1000);
        break;
      case "Last 24 Hours":
        startDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "Last 7 Days":
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "Last 14 Days":
        startDate = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "Last 30 Days":
        startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const filtered = candidates.filter((candidate) => {
      const updatedAt = new Date(candidate.updatedAt);
      return updatedAt >= startDate;
    });
    // console.log(filtered);

    setFilteredCandidates(filtered);
  };
  // Updated handleUpdatedDateFilter function

  useEffect(() => {
    fetchCountries();
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
      const Country = "United States";
      const { data } = await axios.get(
        `${Server}/api/v1/data/states/${Country}`,
      );
      console.log(data.states);

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
    if (state && state.length > 0) {
      fetchCities();
    }
  }, [state]);

  const fetchCities = async () => {
    try {
      const allCities = [];
      const Country = "United States";

      for (const stateName of state) {
        // const { data } = await axios.post(
        //   `https://countriesnow.space/api/v0.1/countries/state/cities`,
        //   {
        //     country: "United States",
        //     state: stateName,
        //   }
        // );
        const { data } = await axios.get(
          `${Server}/api/v1/data/cities/${Country}/${stateName}`,
        );
        if (data?.cities?.length > 0) {
          allCities.push(...data.cities);
        }
      }

      // Remove duplicates
      const uniqueCities = [...new Set(allCities)];
      SetCityData(uniqueCities);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  const countryOptions = countryData.map((e, idx) => ({
    value: e.country,
    label: e.country,
  }));

  const stateOptions = country
    ? [
        { value: "All", label: "All" },
        ...stateData?.map((e) => ({
          value: e,
          label: e,
        })),
      ]
    : [{ value: null, label: "Select Country First" }];
  const disabledStateOptions = country
    ? [
        { value: "All", label: "All" },
        ...stateData?.map((e) => ({
          value: e,
          label: e,
          disabled: true,
        })),
      ]
    : [{ value: null, label: "Select Country First" }];
  const cityOptions = state
    ? [
        { value: "All", label: "All" },
        ...cityData.map((e, idx) => ({ value: e, label: e })),
      ]
    : [{ value: null, label: "Select State First" }];
  const disabledCityOptions = state
    ? [
        { value: "All", label: "All" },
        ...cityData.map((e, idx) => ({ value: e, label: e, disabled: true })),
      ]
    : [{ value: null, label: "Select State First" }];
  const [inputFields, setInputFields] = useState([]);

  const addInputField = () => {
    setInputFields([...inputFields, { value: "", selected: false }]);
  };

  const handleInputChange = (index, event) => {
    const values = [...inputFields];
    values[index].value = event.target.value;
    setInputFields(values);
  };

  const handleRemoveField = (index) => {
    const values = [...inputFields];
    values.splice(index, 1);
    setInputFields(values);
  };

  const handleCheckboxChange = (index) => {
    const values = [...inputFields];
    values[index].selected = !values[index].selected;
    setInputFields(values);
  };

  const handleORClick = (selectedIndices) => {
    const selectedValues = selectedIndices.map(
      (index) => inputFields[index].value,
    );
    const orString = selectedValues.join(" OR ");
    // console.log("OR:", orString);
  };
  const reset = () => {
    SetCity([]);
    setState([]);
    setSkills([{ skill: "", operator: "AND" }]);
    setJobTitle("");
    setKeyword("");
    setCandidates([]);
    setStatus("Pending");
  };
  const selectedIndices = inputFields.reduce((acc, curr, index) => {
    if (curr.selected) {
      acc.push(index);
    }
    return acc;
  }, []);

  // const filterOption = (input, option) => {
  //   return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  // };

  const searchSkills = () => {
    const searchQuery = skills.reduce((acc, curr, index) => {
      return `${acc} ${curr.skill} ${
        index < skills.length - 1 ? curr.operator : ""
      }`;
    }, "");

    // console.log("Search Query:", searchQuery);
    // Implement your search logic using searchQuery
  };
  // const handleMenuClick = ({ key }) => {
  //   if (!hasSelected) {
  //     message.info("Please select at least one item");
  //     return;
  //   }

  //   if (key === "sendEmail") {
  //     showMailModal();
  //   } else if (key === "addToJob") {
  //     // showAddToJobModal();
  //   } else {
  //     message.info(`Click on item ${key}`);
  //   }
  // };
  const getJobs = async () => {
    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/get/${userId}/${access}`,
      );

      setJobs(data.jobs);
      // console.log(data.jobs);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);
  const addToJob = async () => {
    try {
      setLoader(true);
      // console.log(selectedUser);

      setTimeout(() => {
        setLoader(false);
        toast.success("Added to job");
      }, [2000]);
    } catch (error) {
      // console.log(error);
    }
  };
  const nestedMenu = (
    <Menu>
      {jobs.map((e, idx) => (
        <Menu.Item key={`1-${idx + 1}`}>
          <Button loading={loader} onClick={() => shortlistedJob(e)}>
            {e?.JobTitle}
          </Button>
        </Menu.Item>
      ))}
    </Menu>
  );
  const items = [
    {
      label: (
        <a
          // type="primary"
          disabled={!hasSelected}
          onClick={showMailModal}
          loading={loading}
        >
          Send Email
        </a>
      ),
      key: "0",
    },
    {
      key: "1",
      label: (
        <Dropdown overlay={nestedMenu} trigger={["click"]}>
          <a onClick={(e) => e.preventDefault()}>
            Add to Job <DownOutlined />
          </a>
        </Dropdown>
      ),
    },
    {
      key: "2",
      label: <a onClick={showForwardMailModal}>Forward Resume </a>,
    },
    selectedUser.length === 1
      ? {
          key: "3",
          label: <a onClick={() => setOpen(true)}>Edit Details </a>,
        }
      : null,
  ];
  // const menu = (
  //   <Menu onClick={handleMenuClick}>
  //     <Menu.Item key="sendEmail">Send Email</Menu.Item>
  //     <Menu.Item key="addToJob">Add to Job</Menu.Item>
  //   </Menu>
  // );

  const shortlistedJob = async (job) => {
    try {
      setLoader(true);
      // if (token) {
      let userId = localStorage.getItem("UserId");
      let jobDetails = {
        jobId: job.jobId,
        candidates: selectedUser,
        // jobId: params.jobId,
        // jobTitle: jobData[0]?.JobTitle,
        // companyName: jobData[0]?.companyName,
        // categories: jobData[0]?.Industry,
        // city: jobData[0]?.City,
        // country: jobData[0]?.Country,
        // logo: jobData[0]?.image,
        // empId: params.userId,
        // status: jobData[0]?.status,
        // email: jobData[0]?.EmailAddress,
      };
      // console.log(jobDetails);

      const { data } = await axios.post(
        `${Server}/api/v1/employer/shortlistResume/add/${userId}`,
        jobDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLoader(false);
      toast.success("Added to job");
      // } else {
      //   toast.error("Please login");
      //   showModal("login");
      // }
    } catch (error) {
      setLoader(false);

      if (error.response.data.message === "Job already shortlisted") {
        toast.error("Already shortlisted");
      } else {
        // console.log(error.response.data.message);
        toast.error("Error in Shortlisting the job");
      }
    }
  };
  // Handle Skill Input Change
  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index].skill = value;
    setSkills(newSkills);
    generateBooleanQuery(newSkills);
    setHighLightedArray(
      newSkills.map((s) => s.skill).filter((s) => s && s.trim() !== ""),
    );
  };

  // Handle Operator Change
  const handleOperatorChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index].operator = value;
    setSkills(newSkills);
    generateBooleanQuery(newSkills);
  };

  // Add Skill Field
  const addSkillField = () => {
    if (skills[skills.length - 1].skill.trim() !== "") {
      setSkills([
        ...skills,
        {
          skill: "",
          operator: "AND",
        },
      ]);
    }
  };

  // Remove Skill Field
  const removeSkillField = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    generateBooleanQuery(newSkills);
  };

  // Generate Boolean Query String
  const generateBooleanQuery = (skillsArray) => {
    if (skillsArray.length === 0) {
      setKeyword("");
      return;
    }

    let query = "";
    skillsArray.forEach((item, index) => {
      if (item.skill.trim() === "") return; // Ignore empty fields
      if (index === 0) {
        // For the first skill don't use operator
        query += `(${item.skill})`;
      } else {
        query += ` ${item.operator} (${item.skill})`;
      }
    });

    setKeyword(query);
  };
  const totalResults = searchData.length;
  // const from = indexOfFirstCandidate + 1;
  const to = Math.min(currentPage * candidatesPerPage, totalResults);
  const from = (currentPage - 1) * candidatesPerPage + 1;

  return (
    <SubscriptionGuard>
      <div>
        <Helmet>
          <meta
            name="Top IT Talent | Tech Candidate Listings for Employers | Skillstream Jobs US"
            content="Find top IT talent on SkillStream Jobs US. Explore our tech candidate listings to connect with skilled professionals and streamline your hiring process."
          />
        </Helmet>
        <section class="page-title">
          <Toaster position="top-center" reverseOrder={false} />
          <div class="auto-container">
            {/* <div class="title-outer">
            <h1>Showing All Candidates</h1>
            <ul class="page-breadcrumb">
              <li>
                <a href="#">Home</a>
              </li>
              <li>Candidates</li>
            </ul>
          </div> */}
            <h2
              style={{
                position: "relative",
                fontSize: "24px",
                fontWeight: "bold",
                width: "100%",
                height: "100px",
                marginBottom: "20px",
                padding: "10px 20px",
                backgroundImage:
                  "linear-gradient(45deg, #0A0A23, #000000 40%, #1E90FF 80%)",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "5px",
              }}
            >
              <span
                onClick={() => navigate("/employer-dashboard")}
                style={{
                  position: "absolute",
                  top: "5px",
                  left: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#1E90FF",
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "4px 10px",
                  borderRadius: "8px",
                }}
              >
                <ArrowLeftOutlined style={{ marginRight: "5px" }} />
                Back
              </span>
              Showing All Candidates
            </h2>
            <ul class="page-breadcrumb">
              <li>
                <a href="#">Home</a>
              </li>
              <li>Candidates</li>
            </ul>
          </div>
        </section>

        <section class="ls-section">
          <div class="auto-container">
            <div class="filters-backdrop"></div>

            <div class="row">
              <div className="filters-column col-lg-4 col-md-12 col-sm-12">
                <div className="inner-column">
                  <div className="filters-outer">
                    <button type="button" className="theme-btn close-filters">
                      X
                    </button>

                    <div className="filter-block">
                      <h4>Skills</h4>
                      <div className="form-group">
                        <input
                          type="text"
                          name="listing-search"
                          placeholder="Added Skills will appear here"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          disabled
                        />
                      </div>
                    </div>
                    {/* Add Skills */}
                    <div className="filter-block">
                      <h4>Add Skills</h4>
                      <div className="skills-container">
                        {skills.map((skillObj, index) => (
                          <div
                            className="form-group skill-row"
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "10px",
                            }}
                          >
                            {/* Show AND/OR only after the first skill */}
                            {index > 0 && (
                              <Select
                                style={{ width: "100px", marginRight: "10px" }}
                                value={skillObj.operator}
                                onChange={(value) =>
                                  handleOperatorChange(index, value)
                                }
                                options={[
                                  { label: "AND", value: "AND" },
                                  { label: "OR", value: "OR" },
                                ]}
                              />
                            )}

                            {/* Skill Input */}
                            {/* <input
                            type="text"
                            name="listing-skills"
                            placeholder="Eg. Java Developer"
                            value={skillObj.skill}
                            onChange={(e) =>
                              handleSkillChange(index, e.target.value)
                            }
                            style={{ flex: 1, paddingRight: "40px" }}
                          />*/}
                            <Select
                              showSearch
                              size={"middle"}
                              style={{
                                width: "100%",
                                flex: 1,
                                paddingRight: "40px",
                                paddingBottom: "70px",
                              }}
                              optionFilterProp="children"
                              filterOption={filterOption}
                              className="custom-select"
                              placeholder="Select Skills"
                              options={skillOptions}
                              value={skillObj.skill}
                              onChange={(e) => handleSkillChange(index, e)}
                              virtual={false}
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
                                      value={addSkillDB}
                                      onChange={(e) =>
                                        setAddSkillDB(e.target.value)
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
                            {/* ✅ Add Skill Button - Only If Value Is Entered */}
                            {index === skills.length - 1 &&
                              skillObj.skill.trim() !== "" && (
                                <FaPlus
                                  onClick={addSkillField}
                                  className="icon-button add-skill-btn"
                                  style={{
                                    marginLeft: "10px",
                                    cursor: "pointer",
                                    color: "#007bff",
                                    fontSize: "1rem",
                                  }}
                                />
                              )}

                            {/* ✅ Trash Icon Instead of Minus */}
                            {index > 0 && (
                              <FaTrash
                                onClick={() => removeSkillField(index)}
                                className="icon-button remove-skill-btn"
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                  color: "#dc3545",
                                  fontSize: "1rem",
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="filter-block">
                      <h4>Job Title</h4>
                      <div className="form-group">
                        <input
                          type="text"
                          name="listing-search"
                          placeholder="Eg.Java Developer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="filter-block">
                      <h4>State</h4>
                      <Select
                        showSearch
                        mode="multiple"
                        style={{ width: "100%" }}
                        virtual={false}
                        optionFilterProp="children"
                        filterOption={filterOption}
                        className="custom-select"
                        placeholder="Select State"
                        options={
                          state?.includes("All")
                            ? disabledStateOptions
                            : stateOptions
                        }
                        value={state}
                        onChange={(values) => {
                          // Handle 'All' logic
                          if (values.includes(null) || values.includes("All")) {
                            setState(values);
                            setDistanceDisabled(true); // disable distance
                          } else {
                            setState(values);
                            setDistanceDisabled(values.length > 1);
                            // Remove cities not matching current states
                            SetCity((prev) =>
                              prev.filter((c) => cityData.includes(c)),
                            );
                          }
                        }}
                        // disabled={state.includes("All")} // disable when All selected
                      />
                    </div>

                    <div className="filter-block">
                      <h4>City</h4>
                      <Select
                        showSearch
                        mode="multiple"
                        style={{ width: "100%" }}
                        virtual={false}
                        optionFilterProp="children"
                        filterOption={filterOption}
                        className="custom-select"
                        placeholder="Select City"
                        options={
                          city?.includes("All")
                            ? disabledCityOptions
                            : cityOptions
                        }
                        value={city}
                        onChange={(e) => SetCity(e)}
                      />
                    </div>
                    <div className="filter-block">
                      <h4>Distance (miles)</h4>
                      <div className="form-group">
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="5"
                          value={distance}
                          disabled={
                            distanceDisabled ||
                            state.length > 1 ||
                            city.length > 1
                          }
                          onChange={(e) => setDistance(Number(e.target.value))}
                          style={{
                            width: "100%",
                          }}
                        />
                        <div style={{ textAlign: "center", marginTop: "5px" }}>
                          {distance} miles
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={keywordSearch}
                      size="large"
                      type="primary"
                      // className="theme-btn btn-style-two"
                      style={{
                        marginRight: "20px",
                      }}
                      disabled={isSearchDisabled}
                      title={isSearchDisabled ? tooltipMessage : ""} // Tooltip here
                      loading={status === "Loading"}
                    >
                      Search
                    </Button>
                    <Button
                      size="large"
                      type="primary"
                      onClick={reset}
                      // className="theme-btn btn-style-two"
                      disabled={isSearchDisabled}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              {/* {candidates.length != 0 ? (*/}
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                {status === "Pending" && (
                  <h1 className="text-center text-design new-word">
                    Enter the Skills or Job title
                  </h1>
                )}
                {status === "Loading" && <ProgressLoader />}
                {status === "Completed" && (
                  <>
                    {" "}
                    {/*<div>
                    <button
                      type="button"
                      id="send-email-button"
                      className="theme-btn btn-style-three"
                      style={{
                        display:
                          selectedCandidates.length > 0 ? "block" : "none",
                      }}
                      onClick={showMailModal}
                    >
                      Send Email
                    </button>
                    {modalOpen && (
                      <div>
                        <Mail
                          modalOpen={modalOpen}
                          setModalOpen={setModalOpen}
                          showMailModal={showMailModal}
                          selectedEmails={selectedEmails}
                          fromEmail={fromEmail}
                        />
                      </div>
                    )}
                  </div>*/}
                    <div>
                      {/*  <div
                      style={{
                        marginBottom: 16,
                      }}
                    >
                  
                      <Button
                        type="primary"
                        disabled={!hasSelected}
                        onClick={showMailModal}
                        loading={loading}
                      >
                        Send Email
                      </Button>
                      <span
                        style={{
                          marginLeft: 8,
                        }}
                      >
                        {hasSelected
                          ? `Selected ${selectedRowKeys.length} items`
                          : ""}
                      </span>
                    </div>*/}
                      <div style={{ marginBottom: 16 }}>
                        <Dropdown
                          menu={{ items }}
                          disabled={!hasSelected}
                          trigger={["click"]}
                        >
                          <a onClick={(e) => e.preventDefault()}>
                            <Button
                              type="primary"
                              disabled={!hasSelected}
                              loading={loading}
                            >
                              Actions
                              <DownOutlined />
                            </Button>
                          </a>
                        </Dropdown>
                        <span style={{ marginLeft: 8 }}>
                          {hasSelected
                            ? `Selected ${selectedRowKeys.length} items`
                            : ""}
                        </span>
                        {modalOpen && (
                          <div>
                            <Mail
                              modalOpen={modalOpen}
                              setModalOpen={setModalOpen}
                              showMailModal={showMailModal}
                              selectedEmails={selectedEmails}
                              fromEmail={fromEmail}
                            />
                          </div>
                        )}
                        {mailModalOpen && (
                          <div>
                            <ForwardMail
                              modalOpen={mailModalOpen}
                              setModalOpen={setMailModalOpen}
                              showMailModal={showForwardMailModal}
                              selectedResume={selectedResumes}
                              fromEmail={fromEmail}
                            />
                          </div>
                        )}
                        {open && (
                          <EditCandidateDrawer
                            open={open}
                            setOpen={setOpen}
                            selectedUser={selectedUser}
                            keywordSearch={keywordSearch}
                            setSelectedRowKeys={setSelectedRowKeys}
                            setCandidates={setCandidates}
                            setFilteredCandidates={setFilteredCandidates}
                          />
                        )}
                      </div>
                      <div style={{ marginTop: "20px" }}>
                        <div
                          style={{ marginBottom: "10px", fontWeight: "bold" }}
                        >
                          Showing {from}–{to} of {totalResults} result
                          {totalResults !== 1 ? "s" : ""}
                        </div>
                        <Table
                          rowSelection={rowSelection}
                          columns={columns}
                          dataSource={searchData}
                          pagination={{
                            current: currentPage,
                            pageSize: candidatesPerPage,
                            showSizeChanger: true,
                            pageSizeOptions: ["10", "25", "50", "100"],
                            onChange: (page, pageSize) => {
                              setCurrentPage(page);
                              setCandidatesPerPage(pageSize);
                            },
                          }}
                        />
                        <ResumePreviewDrawer
                          open={drawerVisible}
                          onClose={() => handleCancel()}
                          fileUrl={selectedResume}
                          highlightArray={highlightedArray}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* ) : null}*/}
            </div>
          </div>
        </section>
      </div>
    </SubscriptionGuard>
  );
};

export default CandidatesList;

// import React, { useState, useEffect } from "react";
// import $ from "jquery";
// import "jquery-ui/ui/widgets/slider";
// import axios from "axios";
// import { Select, Space } from "antd";
// import { Skeleton } from "antd";
// import { Server } from "../../App";
// import { useNavigate } from "react-router-dom";
// import Mail from "../../Components/Mail";
// import { Button, Table } from "antd";

// const CandidatesList = () => {
//   const navigate = useNavigate();
//   const [areaValues, setAreaValues] = useState([0, 50]);
//   const [candidates, setCandidates] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [candidatesPerPage, setCandidatesPerPage] = useState(10);
//   const [sortBy, setSortBy] = useState("New Jobs");
//   const [jobTitle, setJobTitle] = useState("");
//   const [keyword, setKeyword] = useState("");
//   const [filteredCandidates, setFilteredCandidates] = useState([]);
//   const [updatedDateFilter, setUpdatedDateFilter] = useState("");
//   const [selectedEmails, setSelectedEmails] = useState([]);
//   const [selectedCandidates, setSelectedCandidates] = useState([]);
//   const [selectAllChecked, setSelectAllChecked] = useState(false);
//   const [country, SetCountry] = useState("");
//   const [city, SetCity] = useState("");
//   const [countryData, SetCountryData] = useState([]);
//   const [cityData, SetCityData] = useState([]);
//   const [state, setState] = useState(""); // Add state
//   const [stateData, setStateData] = useState([]); // Add state data
//   // const location = useLocation();
//   const [modalOpen, setModalOpen] = useState(false);
//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//     },
//     {
//       title: "Country",
//       dataIndex: "country",
//     },
//     {
//       title: "State",
//       dataIndex: "state",
//     },
//     {
//       title: "City",
//       dataIndex: "city",
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <Space size="middle">
//           <a href={record.resume} target="_blank">
//             {" "}
//             {record.resume ? <Button>View CV</Button> : "No CV"}
//           </a>
//         </Space>
//       ),
//     },
//   ];
//   const data = [];
//   for (let i = 0; i < 46; i++) {
//     data.push({
//       key: i,
//       name: `Edward King ${i}`,
//       jobTitle: `Job Title ${i}`,
//       salary: `${1300 + i * 100}`,
//       Country: `India ${i}`,
//       State: `TamilNadu ${i}`,
//       City: `City${i.toString().padStart(2, "0")}`,
//     });
//   }

//   const showMailModal = () => {
//     setModalOpen(true);
//   };

//   const handleOk = () => {
//     setModalOpen(false);
//   };

//   // console.log(modalOpen);
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const start = () => {
//     setLoading(true);
//     // ajax request after empty completing
//     setTimeout(() => {
//       setSelectedRowKeys([]);
//       setLoading(false);
//     }, 1000);
//   };
//   const onSelectChange = (newSelectedRowKeys) => {
//     console.log("selectedRowKeys changed: ", newSelectedRowKeys);
//     setSelectedRowKeys(newSelectedRowKeys);
//   };
//   const rowSelection = {
//     selectedRowKeys,
//     onChange: onSelectChange,
//   };
//   const hasSelected = selectedRowKeys.length > 0;

//   // Function to handle "Select All" checkbox change
//   const handleSelectAllChange = (event) => {
//     const isChecked = event.target.checked;
//     setSelectAllChecked(isChecked);
//     const updatedSelectedCandidates = isChecked
//       ? sortedCandidates.map((candidate) => candidate.email)
//       : [];
//     setSelectedCandidates(updatedSelectedCandidates);
//   };

//   // Function to handle individual checkbox change
//   const handleCandidateCheckboxChange = (event) => {
//     const isChecked = event.target.checked;
//     const candidateEmail = event.target.dataset.email; // Assuming you have data attribute for candidate's email
//     if (isChecked) {
//       setSelectedCandidates([...selectedCandidates, candidateEmail]);
//     } else {
//       const updatedSelectedCandidates = selectedCandidates.filter(
//         (email) => email !== candidateEmail
//       );
//       setSelectedCandidates(updatedSelectedCandidates);
//     }
//     setSelectAllChecked(selectedCandidates.length === sortedCandidates.length);
//   };

//   const sendEmail = () => {
//     const mailtoLink = "mailto:" + selectedCandidates.join(",");
//     window.location.href = mailtoLink;
//   };

//   useEffect(() => {
//     // Scroll to the top when navigation occurs
//     window.scrollTo(0, 0);
//   }, []);
//   useEffect(() => {
//     // Slider for area range
//     if ($(".area-range-slider").length) {
//       $(".area-range-slider").slider({
//         range: true,
//         min: 0,
//         max: 100,
//         values: areaValues,
//         slide: function (event, ui) {
//           setAreaValues(ui.values);
//         },
//       });

//       // Initial value
//       $(".area-amount").text(areaValues[1]);
//     }
//   }, [areaValues]);

//   useEffect(() => {
//     // Fetch candidates data from API
//     if (jobTitle.length === 0) {
//       const getallCandidates = async () => {
//         try {
//           const response = await axios.get(
//             `${Server}/api/v1/candidate/allCandidates`
//           );
//           setCandidates(response.data.Candidates);
//           setFilteredCandidates(response.data.Candidates);
//         } catch (error) {
//           console.log(error);
//         }
//       };

//       getallCandidates();
//     }
//   }, [jobTitle, keyword, city, country, state]);

//   useEffect(() => {
//     const getallCandidates = async () => {
//       try {
//         const response = await axios.get(
//           `${Server}/api/v1/candidate/allCandidates`
//         );
//         const candidatesWithResume = response.data.Candidates.filter(
//           (candidate) => candidate.resume
//         );
//         setCandidates(candidatesWithResume);
//         setFilteredCandidates(candidatesWithResume);
//       } catch (error) {
//         console.log(error);
//       }
//     };

//     getallCandidates();
//   }, [jobTitle, keyword, country, city]);

//   let profileCompleted = localStorage.getItem("ProfileCompleted");
//   let role = localStorage.getItem("Role");
//   useEffect(() => {
//     if (profileCompleted === "false") {
//       console.log(typeof profileCompleted);
//       if (role === "Candidate") {
//         navigate("/my-profile");
//       } else {
//         navigate("/company-profile");
//       }
//     }
//   }, []);
//   // console.log(candidates);

//   // useEffect(() => {
//   //   getallCandidates();
//   // }, []);

//   const jobsPerPage = 4; // Change this value as needed

//   // Logic to get current jobs based on current page
//   const indexOfLastJob = currentPage * jobsPerPage;
//   const indexOfFirstJob = indexOfLastJob - jobsPerPage;
//   const currentJobs = candidates.slice(indexOfFirstJob, indexOfLastJob);

//   // Logic to get current candidates based on current page and candidates per page
//   const indexOfLastCandidate = currentPage * candidatesPerPage;
//   const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
//   let sortedCandidates = [...filteredCandidates];
//   // useEffect(() => {
//   //   if (jobTitle.length != 0) {
//   //     keywordSearch();
//   //   }
//   // }, [jobTitle]);
//   const keywordSearch = async (e) => {
//     // e.preventDefault();
//     try {
//       let keywordData = [];
//       // Push job title(s) to the keywordData array if available
//       if (jobTitle.length > 0) {
//         keywordData.push(...jobTitle.split(",").map((title) => title.trim()));
//       }
//       if (city.length > 0) {
//         keywordData.push(city);
//       }
//       if (country.length > 0) {
//         keywordData.push(country);
//       }
//       if (keyword.length > 0) {
//         keywordData.push(keyword);
//       }
//       if (keyword.length > 0) {
//         keywordData.push(keyword);
//       }
//       console.log(keywordData);
//       // Push city to the keywordData array if available

//       const { data } = await axios.post(
//         `${Server}/api/v1/search/keyword/candidate`,
//         {
//           keyword: keywordData,
//         }
//       );
//       console.log(data);
//       console.log(keywordData);
//       const candidatesWithResume = data.results.filter(
//         (candidate) => candidate.resume
//       );

//       // Update the job list with search results
//       setCandidates(candidatesWithResume);
//       setFilteredCandidates(candidatesWithResume);
//       // setKeywordData(true);
//     } catch (error) {
//       console.log(error);
//       setCandidates([]);
//     }
//   };
//   console.log(sortedCandidates);
//   // Sorting logic
//   if (sortBy === "New Jobs") {
//     sortedCandidates.sort((a, b) => (a.date > b.date ? -1 : 1));
//   } else if (sortBy === "Freelance") {
//     sortedCandidates = sortedCandidates.filter(
//       (candidate) => candidate.type === "Freelance"
//     );
//   } else if (sortBy === "Full Time") {
//     sortedCandidates = sortedCandidates.filter(
//       (candidate) => candidate.type === "Full Time"
//     );
//   } else if (sortBy === "Internship") {
//     sortedCandidates = sortedCandidates.filter(
//       (candidate) => candidate.type === "Internship"
//     );
//   } else if (sortBy === "Part Time") {
//     sortedCandidates = sortedCandidates.filter(
//       (candidate) => candidate.type === "Part Time"
//     );
//   } else if (sortBy === "Temporary") {
//     sortedCandidates = sortedCandidates.filter(
//       (candidate) => candidate.type === "Temporary"
//     );
//   } // Add other sorting options as needed

//   const currentCandidates = sortedCandidates.slice(
//     indexOfFirstCandidate,
//     indexOfLastCandidate
//   );

//   // Logic to determine total number of pages
//   const totalPages = Math.ceil(sortedCandidates.length / candidatesPerPage);

//   // Event handler to navigate between pages
//   const goToPage = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // Event handler to change candidates per page
//   const handleCandidatesPerPageChange = (event) => {
//     setCandidatesPerPage(parseInt(event.target.value));
//     setCurrentPage(1); // Reset to first page when changing candidates per page
//   };

//   // Event handler to change sorting option
//   const handleSortByChange = (event) => {
//     setSortBy(event.target.value);
//     setCurrentPage(1); // Reset to first page when changing sorting option
//   };

//   const filterByUpdatedDate = (selectedOption) => {
//     let startDate;
//     const currentDate = new Date();

//     switch (selectedOption) {
//       case "All":
//         setFilteredCandidates(candidates); // Reset filteredCandidates to all candidates
//         return;
//       case "Last Hour":
//         startDate = new Date(currentDate.getTime() - 60 * 60 * 1000);
//         break;
//       case "Last 24 Hours":
//         startDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
//         break;
//       case "Last 7 Days":
//         startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
//         break;
//       case "Last 14 Days":
//         startDate = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
//         break;
//       case "Last 30 Days":
//         startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
//         break;
//       default:
//         startDate = new Date(0);
//     }

//     const filtered = candidates.filter((candidate) => {
//       const updatedAt = new Date(candidate.updatedAt);
//       return updatedAt >= startDate;
//     });
//     console.log(filtered);

//     setFilteredCandidates(filtered);
//   };
//   // Updated handleUpdatedDateFilter function

//   useEffect(() => {
//     fetchCountries();
//   }, []);

//   const fetchCountries = async () => {
//     try {
//       const { data } = await axios.get(
//         `https://countriesnow.space/api/v0.1/countries`
//       );
//       // console.log(data.country_city);
//       SetCountryData(data.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Fetch states based on selected country
//   const fetchStates = async () => {
//     try {
//       const { data } = await axios.post(
//         `https://countriesnow.space/api/v0.1/countries/states`,
//         {
//           country: country,
//         }
//       );
//       setStateData(data.data.states); // Set state data
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   useEffect(() => {
//     if (country) {
//       fetchStates(); // Fetch states when country changes
//     }
//   }, [country]);

//   useEffect(() => {
//     if (state) {
//       fetchCities(); // Fetch states when country changes
//     }
//   }, [state]);
//   const fetchCities = async () => {
//     try {
//       const { data } = await axios.post(
//         `https://countriesnow.space/api/v0.1/countries/state/cities`,
//         {
//           country: country,
//           state: state,
//         }
//       );
//       // console.log(data.country_city);
//       SetCityData(data.data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Filter `option.label` match the user type `input`
//   const filterOption = (input, option) =>
//     (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
//   const countryOptions = countryData.map((e, idx) => ({
//     value: e.country,
//     label: e.country,
//   }));

//   const stateOptions = country
//     ? stateData?.map((e, idx) => ({
//         value: e.name,
//         label: e.name,
//       }))
//     : [{ value: null, label: "Select Country First" }];

//   const cityOptions = state
//     ? cityData.map((e, idx) => ({ value: e, label: e }))
//     : [{ value: null, label: "Select State First" }];

//   const [inputFields, setInputFields] = useState([]);

//   const addInputField = () => {
//     setInputFields([...inputFields, { value: "", selected: false }]);
//   };

//   const handleInputChange = (index, event) => {
//     const values = [...inputFields];
//     values[index].value = event.target.value;
//     setInputFields(values);
//   };

//   const handleRemoveField = (index) => {
//     const values = [...inputFields];
//     values.splice(index, 1);
//     setInputFields(values);
//   };

//   const handleCheckboxChange = (index) => {
//     const values = [...inputFields];
//     values[index].selected = !values[index].selected;
//     setInputFields(values);
//   };

//   const handleORClick = (selectedIndices) => {
//     const selectedValues = selectedIndices.map(
//       (index) => inputFields[index].value
//     );
//     const orString = selectedValues.join(" OR ");
//     console.log("OR:", orString);
//   };
//   const reset = () => {
//     SetCountry("");
//     SetCity("");
//     setState("");
//     setJobTitle("");
//     setKeyword("");
//   };
//   const selectedIndices = inputFields.reduce((acc, curr, index) => {
//     if (curr.selected) {
//       acc.push(index);
//     }
//     return acc;
//   }, []);

//   return (
//     <div>
//       <section class="page-title">
//         <div class="auto-container">
//           <div class="title-outer">
//             <h1>Showing All Candidates</h1>
//             <ul class="page-breadcrumb">
//               <li>
//                 <a href="#">Home</a>
//               </li>
//               <li>Candidates</li>
//             </ul>
//           </div>
//         </div>
//       </section>

//       <section class="ls-section">
//         <div class="auto-container">
//           <div class="filters-backdrop"></div>

//           <div class="row">
//             <div class="filters-column col-lg-4 col-md-12 col-sm-12">
//               <div class="inner-column">
//                 <div class="filters-outer">
//                   <button type="button" class="theme-btn close-filters">
//                     X
//                   </button>

//                   <div class="filter-block">
//                     <h4>Search by Keywords</h4>
//                     <div class="form-group">
//                       <input
//                         type="text"
//                         name="listing-search"
//                         placeholder="Eg.JavaScript"
//                         value={keyword}
//                         onChange={(e) => setKeyword(e.target.value)}
//                       />
//                       <span class="icon flaticon-search-3"></span>
//                     </div>
//                   </div>

//                   <div class="filter-block">
//                     <h4>Job Title</h4>
//                     <div class="form-group">
//                       <input
//                         type="text"
//                         name="listing-search"
//                         placeholder="Eg.Java Developer"
//                         value={jobTitle}
//                         onChange={(e) => setJobTitle(e.target.value)}
//                       />
//                       <span class="icon flaticon-search-3"></span>
//                     </div>
//                   </div>
//                   {/*                <div
//               onClick={() => {
//                 if (inputFields.length === 0) {
//                   setInputFields([{ value: "", selected: false }]);
//                 }
//               }}
//               style={{ cursor: "pointer" }}
//             >
//               + String Builder
//             </div>

//             <div className="filter-block">
//               {inputFields.map((inputField, index) => (
//                 <div className="input-keyword" key={index}>
//                   <div className="form-group">
//                     <input
//                       type="text"
//                       placeholder="Enter Skill"
//                       value={inputField.value}
//                       onChange={(event) =>
//                         handleInputChange(index, event)
//                       }
//                     />
//                     <span
//                       className="icon delete-icon"
//                       onClick={() => handleRemoveField(index)}
//                     >
//                       ❌
//                     </span>
//                   </div>
//                   <div>
//                     {inputField.selected &&
//                     selectedIndices.length > 1 &&
//                     selectedIndices.indexOf(index) !==
//                       selectedIndices.length - 1 ? (
//                       <button
//                         onClick={() =>
//                           handleORClick([
//                             selectedIndices[
//                               selectedIndices.indexOf(index)
//                             ],
//                             selectedIndices[
//                               selectedIndices.indexOf(index) + 1
//                             ],
//                           ])
//                         }
//                       >
//                         OR
//                       </button>
//                     ) : null}
//                   </div>
//                   <div>
//                     <input
//                       type="checkbox"
//                       className="input-checkbox"
//                       checked={inputField.selected}
//                       onChange={() => handleCheckboxChange(index)}
//                     />
//                   </div>
//                   <div>
//                     <div
//                       onClick={addInputField}
//                       style={{ cursor: "pointer" }}
//                     >
//                       +
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>*/}

//                   <br />
//                   <div class="filter-block">
//                     <h4>Country</h4>
//                     <Select
//                       showSearch
//                       optionFilterProp="children"
//                       filterOption={filterOption}
//                       style={{ width: "100%" }}
//                       className="custom-select"
//                       placeholder="Select Country"
//                       options={countryOptions}
//                       // value={jobSkills}
//                       // value={primaryIndustry}
//                       onChange={(e) => SetCountry(e)}
//                     />
//                   </div>
//                   <div class="filter-block">
//                     <h4>State</h4>
//                     <Select
//                       showSearch
//                       style={{ width: "100%" }}
//                       optionFilterProp="children"
//                       filterOption={filterOption}
//                       className="custom-select"
//                       placeholder="Select State"
//                       options={stateOptions}
//                       onChange={(e) => setState(e)}
//                     />
//                   </div>
//                   <div class="filter-block">
//                     <h4>City</h4>
//                     <Select
//                       showSearch
//                       style={{ width: "100%" }}
//                       optionFilterProp="children"
//                       filterOption={filterOption}
//                       className="custom-select"
//                       placeholder="Select City"
//                       options={cityOptions}
//                       // value={jobSkills}
//                       // value={primaryIndustry}
//                       onChange={(e) => SetCity(e)}
//                     />
//                   </div>

//                   <button
//                     onClick={() => keywordSearch()}
//                     className="theme-btn btn-style-two"
//                     style={{ marginRight: "20px" }}
//                   >
//                     Search
//                   </button>
//                   <button
//                     onClick={() => reset()}
//                     className="theme-btn btn-style-two"
//                   >
//                     Reset
//                   </button>

//                   {/*            <div class="filter-block">
//               <h4>Location</h4>
//               <div class="form-group">
//                 <input
//                   type="text"
//                   name="listing-search"
//                   placeholder="City or postcode"
//                 />
//                 <span class="icon flaticon-map-locator"></span>
//               </div>
//               <p>Radius around selected destination</p>
//               <div class="range-slider-one">
//                 <div class="area-range-slider"></div>
//                 <div class="input-outer">
//                   <div class="amount-outer">
//                     <span class="area-amount"></span>km
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div class="filter-block">
//               <h4>Category</h4>
//               <div class="form-group">
//                 <select class="chosen-select">
//                   <option>Choose a category</option>
//                   <option>Residential</option>
//                   <option>Commercial</option>
//                   <option>Industrial</option>
//                   <option>Apartments</option>
//                 </select>
//                 <span class="icon flaticon-briefcase"></span>
//               </div>
//             </div>

//             <div class="filter-block">
//               <h4>Candidate Gender</h4>
//               <div class="form-group">
//                 <select class="chosen-select">
//                   <option>Male</option>
//                   <option>Female</option>
//                   <option>other</option>
//                 </select>
//                 <span class="icon flaticon-heart-1"></span>
//               </div>
// </div>*/}
//                   {/* <div className="checkbox-outer">
//               <h4>Updated Date</h4>
//               <ul className="checkboxes">
//                 <li>
//                   <input
//                     id="check-1"
//                     type="radio"
//                     name="check"
//                     onClick={() => filterByUpdatedDate("All")}
//                   />
//                   <label htmlFor="check-1">All</label>
//                 </li>
//                 <li>
//                   <input
//                     id="check-a"
//                     type="radio"
//                     name="check"
//                     onClick={() => filterByUpdatedDate("Last Hour")}
//                   />
//                   <label htmlFor="check-a">Last Hour</label>
//                 </li>
//                 <li>
//                   <input
//                     id="check-b"
//                     type="radio"
//                     name="check"
//                     onClick={() => filterByUpdatedDate("Last 24 Hours")}
//                   />
//                   <label htmlFor="check-b">Last 24 Hours</label>
//                 </li>
//                 <li>
//                   <input
//                     id="check-c"
//                     type="radio"
//                     name="check"
//                     onClick={() => filterByUpdatedDate("Last 7 Days")}
//                   />
//                   <label htmlFor="check-c">Last 7 Days</label>
//                 </li>
//                 <li>
//                   <input
//                     id="check-d"
//                     type="radio"
//                     name="check"
//                     onClick={() => filterByUpdatedDate("Last 14 Days")}
//                   />
//                   <label htmlFor="check-d">Last 14 Days</label>
//                 </li>
//                 <li>
//                   <input
//                     id="check-e"
//                     type="radio"
//                     name="check"
//                     onClick={() => filterByUpdatedDate("Last 30 Days")}
//                   />
//                   <label htmlFor="check-e">Last 30 Days</label>
//                 </li>
//               </ul>
//             </div>

//             <div class="checkbox-outer">
//               <h4>Experience</h4>
//               <ul class="checkboxes">
//                 <li>
//                   <input id="check-f" type="checkbox" name="check" />
//                   <label for="check-f">0-2 Years</label>
//                 </li>
//                 <li>
//                   <input id="check-g" type="checkbox" name="check" />
//                   <label for="check-g">10-12 Years</label>
//                 </li>
//                 <li>
//                   <input id="check-h" type="checkbox" name="check" />
//                   <label for="check-h">12-16 Years</label>
//                 </li>
//                 <li>
//                   <input id="check-i" type="checkbox" name="check" />
//                   <label for="check-i">16-20 Years</label>
//                 </li>
//                 <li>
//                   <input id="check-j" type="checkbox" name="check" />
//                   <label for="check-j">20-25 Years</label>
//                 </li>
//                 <li>
//                   <button class="view-more">
//                     <span class="icon flaticon-plus"></span> View More
//                   </button>
//                 </li>
//               </ul>
//             </div> */}
//                   {/*
//             <div class="checkbox-outer">
//               <h4>Education Levels</h4>
//               <ul class="checkboxes">
//                 <li>
//                   <input id="check-2" type="checkbox" name="check" />
//                   <label for="check-2">Certificate</label>
//                 </li>
//                 <li>
//                   <input id="check-3" type="checkbox" name="check" />
//                   <label for="check-3">Diploma</label>
//                 </li>
//                 <li>
//                   <input id="check-4" type="checkbox" name="check" />
//                   <label for="check-4">Associate Degree</label>
//                 </li>
//                 <li>
//                   <input id="check-5" type="checkbox" name="check" />
//                   <label for="check-5">Bachelor Degree</label>
//                 </li>
//                 <li>
//                   <input id="check-6" type="checkbox" name="check" />
//                   <label for="check-6">Master’s Degree</label>
//                 </li>
//               </ul>
// </div>*/}
//                 </div>
//               </div>
//             </div>
//             <div className="content-column col-lg-8 col-md-12 col-sm-12">
//               <div>
//                 <button
//                   type="button"
//                   id="send-email-button"
//                   className="theme-btn btn-style-three"
//                   style={{
//                     display: selectedCandidates.length > 0 ? "block" : "none",
//                   }}
//                   onClick={showMailModal}
//                 >
//                   Send Email
//                 </button>
//                 {modalOpen && (
//                   <div>
//                     <Mail
//                       modalOpen={modalOpen}
//                       setModalOpen={setModalOpen}
//                       showMailModal={showMailModal}
//                     />
//                   </div>
//                 )}
//               </div>
//               <div>
//                 <div
//                   style={{
//                     marginBottom: 16,
//                   }}
//                 >
//                   <Button
//                     type="primary"
//                     disabled={!hasSelected}
//                     onClick={showMailModal}
//                     loading={loading}
//                   >
//                     Send Email
//                   </Button>
//                   <span
//                     style={{
//                       marginLeft: 8,
//                     }}
//                   >
//                     {hasSelected
//                       ? `Selected ${selectedRowKeys.length} items`
//                       : ""}
//                   </span>
//                 </div>
//                 <Table
//                   rowSelection={rowSelection}
//                   columns={columns}
//                   dataSource={candidates}
//                 />
//               </div>
//               {/* <table>
//               <tr>
//                 <th>
//                   <input
//                     type="checkbox"
//                     className="selectAll-checkbox"
//                     id="select-all-checkbox"
//                     checked={selectAllChecked}
//                     onChange={handleSelectAllChange}
//                   />
//                 </th>
//                 <th>Name</th>
//                 <th>Job Title</th>
//                 <th>Country</th>
//                 <th>States</th>
//                 <th>City</th>
//                 <th>Job Status</th>
//                 <th>Location</th>
//                 <th>Salary</th>
//               </tr>
//               <tr>
//                 <td>
//                   <input type="checkbox" />
//                 </td>
//                 <td>Alfreds Futterkiste</td>
//                 <td>Maria Anders</td>
//                 <td>Germany</td>
//                 <td>Germany</td>
//                 <td>Germany</td>
//                 <td>Maria Anders</td>
//                 <td>Maria Anders</td>
//               </tr>
//               <tr>
//                 <td>
//                   <input type="checkbox" />
//                 </td>

//                 <td>Centro comercial Moctezuma</td>
//                 <td>Francisco Chang</td>
//                 <td>Mexico</td>
//                 <td>Maria Anders</td>
//                 <td>Maria Anders</td>
//                 <td>Maria Anders</td>
//                 <td>Maria Anders</td>
//                 <td>Maria Anders</td>
//               </tr>
//             </table> */}
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default CandidatesList;

// const handleSkillChange = (index, value) => {
//   const newSkills = [...skills];
//   newSkills[index].skill = value;
//   setSkills(newSkills);
// };

// const handleOperatorChange = (index, value) => {
//   const newSkills = [...skills];
//   newSkills[index].operator = value;
//   setSkills(newSkills);
// };

// const addSkillField = () => {
//   setSkills([...skills, { skill: "", operator: "AND" }]);
// };

// const removeSkillField = (index) => {
//   const newSkills = skills.filter((_, i) => i !== index);
//   setSkills(newSkills);
// };
