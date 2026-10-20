import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  Select,
  Progress,
  Modal,
  Spin,
} from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { Server } from "App";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useSpring, animated } from "@react-spring/web";
import { jwtDecode } from "jwt-decode";

const { Option } = Select;

const AiJobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState({});
  const [resumes, setResumes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedAction, setSelectedAction] = useState("none");
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const searchInput = useRef(null);
  const [status, setStatus] = useState("Pending");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [IsResultModalVisible, setIsResultModalVisible] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiScore, setAiScore] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  let token = localStorage.getItem("token");
  const { access } = jwtDecode(token);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleModalCancel = () => {
    setIsResultModalVisible(false);
  };
  const scoreProps = useSpring({
    opacity: aiScore !== null ? 1 : 0,
    transform: aiScore !== null ? "scale(1)" : "scale(0.8)",
    config: { duration: 500 },
  });

  // useEffect(() => {
  //   if (location.state) {
  //     const { jobdetails } = location.state;
  //     setSelectedJobDetails(jobdetails);
  //     setSelectedAction(jobdetails?.jobId);
  //   }
  // }, [location.state]);

  // useEffect(() => {
  //   if (location.state) {
  //     SearchWithAI(selectedJobDetails);
  //     navigate(location.pathname, { replace: true, state: {} });
  //   }
  // }, [selectedAction, selectedJobDetails]);
  // console.log(selectedAction);
  // console.log(selectedJobDetails);

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleActionChange = (value) => {
    setSelectedAction(value);
    // console.log(value);

    if (value != "none") {
      const selectedJob = jobs.find((job) => job.jobId === value);
      setSelectedJobDetails(selectedJob);
      // console.log(selectedJob);
    } else if (value === "none") {
      setSelectedJobDetails({});
    }
  };
  // console.log(selectedJobDetails);

  const getJobs = async () => {
    try {
      let userId = localStorage.getItem("UserId");
      const { data } = await axios.get(
        `${Server}/api/v1/employer/jobs/get/${userId}/${access}`
      );

      setJobs(data.jobs);
      // console.log(data.jobs);
    } catch (error) {
      // console.log(error);
    }
  };

  // useEffect(() => {
  //   getJobs();
  // }, []);
  // console.log(selectedJobDetails);

  const SearchWithAI = async (jobdetails) => {
    // console.log("loading");

    try {
      let userId = localStorage.getItem("UserId");

      setStatus("Searching");
      setLoading(true);
      // let formData = {
      //   title: selectedJobDetails?.JobTitle,
      //   description: selectedJobDetails?.JobDescription,
      //   skills: selectedJobDetails?.jobSkills,
      //   keys_and_responsibilities: selectedJobDetails?.Responsibilties,
      //   experience: `${selectedJobDetails?.Experience}`,
      //   location: selectedJobDetails?.Country,
      // };
      // console.log(formData);

      let { data } = await axios.post(
        `${Server}/api/v1/search/keyword/ai/search/jobs/${userId}`
        // formData
      );
      // console.log(data.Jobs);
      data?.Jobs?.sort((a, b) => a.total_score - b.total_score);
      // const filterjobs = data.Jobs;
      const filterjobs = data?.Jobs.filter(
        (jobs) => jobs.jobDetails.status === "Active"
      );
      // console.log(filterjobs);
      // (jobs) => jobs.jobDetails.status === "Active" && new Date(jobs.jobDetails.time) > Date.now()

      let Jobs = [];
      filterjobs.map((e, idx) =>
        Jobs.push({
          key: e.jobDetails._id,
          JobTitle: e.JobTitle,
          City: e.jobDetails.City,
          Country: e.jobDetails.Country,
          Experience: e.jobDetails.Experience,
          score: e.total_score, // Score percentage for each resume
          jobId: e.jobDetails.jobId,
          status: e.jobDetails.status,
          userId: e.jobDetails.userId,
          companyName: e.jobDetails.companyName,
          location: `${e.jobDetails.City} , ${e.jobDetails.Country}`,
        })
      );
      setResumes(Jobs);
      setStatus("Completed");
      setLoading(false);
    } catch (error) {
      // console.log(error);
      if (error?.response?.data?.message === "No results Found") {
        setLoading(false);
        setStatus("Completed");
        setResumes([]);
      } else {
        setLoading(false);
        setStatus("Pending");
      }
    }
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
            onClick={() => handleReset(clearFilters)}
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
  const handleExpand = (key) => {
    const isExpanded = expandedRowKeys.includes(key);
    const newExpandedRowKeys = isExpanded
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key];
    setExpandedRowKeys(newExpandedRowKeys);
  };

  const columns = [
    {
      /*
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      // sorter: (a, b) => a.rank.localeCompare(b.rank),
      // ...getColumnSearchProps("rank"),
      width: "8%", // Adjusted width
    */
    },
    {
      title: "Job Title",
      dataIndex: "JobTitle",
      key: "JobTitle",
      sorter: (a, b) => a.JobTitle.localeCompare(b.JobTitle),
      ...getColumnSearchProps("JobTitle"),
      width: "20%", // Adjusted width for company names
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) => a.location.localeCompare(b.location),
      ...getColumnSearchProps("location"),
      width: "15%", // Adjusted width
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
      sorter: (a, b) => a.companyName - b.companyName,
      ...getColumnSearchProps("revenue"),
      width: "15%", // Adjusted width
    },
    {
      /*
      title: "Country",
      dataIndex: "location",
      key: "location",
      width: "15%", // Adjusted width
    */
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status - b.status,
      ...getColumnSearchProps("status"),
      width: "12%",
      render: (text) => (
        <Tag
          color={
            text === "Active"
              ? "green"
              : text === "Inactive"
              ? "volcano"
              : text === "Closed"
              ? "red"
              : "gold"
          }
        >
          {text}
        </Tag>
      ), // Adjusted width
    },
    {
      title: "Matching Score",
      dataIndex: "score",
      key: "score",
      render: (score) => (
        <div className="progress-container">
          {/* Add a container div for styling */}
          <Progress
            type="circle"
            percent={score}
            width={80} // Size of the circle
            format={(percent) => `${percent}%`} // Show percentage in center
            strokeColor={{
              "0%": "#0057e7",
              "100%": "#34b1eb",
            }}
            className="blue-shadow" // Custom class for shadow effect
          />
        </div>
      ),
      sorter: (a, b) => a.score - b.score,
      width: "15%", // Adjusted width
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const companyProfileUrl = `job-detail/${record.userId}/${record.jobId}`;

        return (
          <Space size="middle">
            <a
              href={companyProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>Apply Job </Button>
            </a>
            {/*        <Button onClick={() => handleModalOk(record)}>
              {record.isAnalysing ? (
                <>
                  <LoadingOutlined />
                  <span>Analysing</span>
                </>
              ) : (
                <>
                  <SearchOutlined />
                  <span>Analyse</span>
                </>
              )}
            </Button>*/}
          </Space>
        );
      },
    },
  ];

  // console.log(candidates);
  const handleModalOk = async (selectedUser) => {
    const updatedData = resumes.map((item) =>
      item.key === selectedUser.key ? { ...item, isAnalysing: true } : item
    );
    setResumes(updatedData);
    setLoader(true);
    try {
      let userId = localStorage.getItem("UserId");
      let bodyData = {
        jobDetails: selectedJobDetails,
        userDetails: {
          basic_info: {
            full_name: selectedUser.name,
            email: selectedUser.email,
            City: selectedUser.city,
            Country: selectedUser.country,
            Province: selectedUser.state,
            Experience_in_Years: selectedUser.experience,
            Experience_level: selectedUser.Experience_level,
            Job_Title: selectedUser.jobTitle,
          },
          education: selectedUser.education,
          work_experience: selectedUser.work_experience,
          skills: selectedUser.skills,
        },
      };
      // console.log(bodyData);

      const { data } = await axios.post(
        `${Server}/api/v1/employer/jobs/openAI/aiResume/analyse/${userId}/${selectedJobDetails.jobId}/${selectedUser._id}`,
        bodyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(data);
      setAiResult(data.data.fitment_summary);
      setAiScore(data.data.matching_score);
      setLoader(false);
      const updatedDataAfterAnalysis = updatedData.map((item) =>
        item.key === selectedUser.key ? { ...item, isAnalysing: false } : item
      );
      setResumes(updatedDataAfterAnalysis);
      setIsResultModalVisible(true);
    } catch (error) {
      // message.error("Failed to analyze. Please try again."); // Error handling
      // console.log("Error analyzing with AI:", error);
      setLoader(false);
      const updatedDataAfterAnalysis = updatedData.map((item) =>
        item.key === selectedUser.key ? { ...item, isAnalysing: false } : item
      );
      setResumes(updatedDataAfterAnalysis);
    }
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          width: "100%",
          height: "150px",
          marginBottom: "20px",
          padding: "10px",
          backgroundImage:
            "linear-gradient(45deg, #0A0A23, #000000 40%, #1E90FF 80%)",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "5px",
        }}
      >
        AI Job Search
      </h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {/*<Select
          defaultValue="none"
          style={{
            width: 200,
            marginRight: "10px",
            marginTop: "18px",
          }}
          onChange={handleActionChange}
        >
          <Option value="none">Select Job</Option>
          {jobs?.map((e, idx) => (
            <Option key={idx} value={e?.jobId} onChange={handleActionChange}>
              {e?.JobTitle}
            </Option>
          ))}
        </Select>*/}

        <div className="loader-one">
          {loading ? (
            <>
              <span className="loader__inner1"></span>
              <span className="loader__inner1"></span>
              <span className="loader__text1">AI</span>
            </>
          ) : (
            <Button
              style={{
                backgroundColor: "#1E90FF", // SkyBlue color
                color: "#fff", // White text color
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
              }}
              onClick={SearchWithAI}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#4682B4")
              } // Darker SkyBlue on hover
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#1E90FF")
              } // Original color on mouse out
            >
              Search with AI
            </Button>
          )}
        </div>
      </div>

      {status === "Pending" && (
        <p style={{ padding: "100px", fontSize: "30px" }}>
          {" "}
          Search Job With AI{" "}
        </p>
      )}
      {status === "Searching" && (
        <p style={{ padding: "100px" }}> Searching..... </p>
      )}
      {status === "Completed" && (
        <Table
          columns={columns}
          dataSource={resumes}
          pagination={{ pageSize: 10 }}
          style={{
            width: "100%",
            maxWidth: "1200px", // Max width for the table
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        />
      )}
      <Modal
        title="AI Analysis Result"
        open={IsResultModalVisible}
        onCancel={handleModalCancel}
        // footer={[
        //   <Button key="download" onClick={() => downloadPDF()}>
        //     Download as PDF
        //   </Button>,
        //   <Button key="cancel" onClick={handleModalCancel}>
        //     Cancel
        //   </Button>,
        // ]}
        centered
        styles={{ textAlign: "center" }}
      >
        <Spin spinning={loading}>
          <div id="modal-content">
            {aiScore !== null && (
              <animated.div style={scoreProps} className="score-box">
                <span>Score:</span> {aiScore}
              </animated.div>
            )}
            <ReactMarkdown style={{ marginBottom: 20 }}>
              {aiResult}
            </ReactMarkdown>
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default AiJobSearch;
{
  /* <Table
          columns={columns}
          dataSource={resumes}
          pagination={{ pageSize: 10 }}
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded, record) => handleExpand(record.key)}
          expandedRowRender={(record) => (
            <p style={{ margin: 0 }}>{record.summary}</p>
          )}
          style={{
            width: "100%",
            maxWidth: "1200px", // Max width for the table
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
          }}
          rowKey="key"
        />*/
}
