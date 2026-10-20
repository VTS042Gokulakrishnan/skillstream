import React, { useState, useEffect } from "react";
import { Input, Select, Collapse } from "antd";
import { Button } from "antd";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { DownloadOutlined } from "@ant-design/icons";

import { Helmet } from "react-helmet";
import { Server } from "App";
import axios from "axios";
import { Drawer } from "antd"; // ✅ Add import
// import toast, { Toaster } from "react-hot-toast";
import ResumePreviewDrawer from "Components/ReaderDrawer/ResumePreviewDrawer";

const { Panel } = Collapse;
const { Option } = Select;

const GlobalSearch = () => {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [resume, setResume] = useState("");
  const [results, setResults] = useState({
    candidates: [],
    employers: [],
    jobs: [],
  });
  const [page, setPage] = useState({
    candidates: 1,
    employers: 1,
    jobs: 1,
  });

  const getViewerUrl = (resumeUrl) => {
    if (!resumeUrl) {
      toast.error("No resume Uploaded");
      return null;
    }
    // const lowerUrl = resumeUrl.toLowerCase();
    return `https://docs.google.com/viewer?url=${resumeUrl}&embedded=true`;
    // if (lowerUrl.endsWith(".pdf")) {
    //   return `https://docs.google.com/viewer?url=${resumeUrl}&embedded=true`;
    // } else if (lowerUrl.endsWith(".doc") || lowerUrl.endsWith(".docx")) {
    //   return `https://view.officeapps.live.com/op/view.aspx?src=${resumeUrl}`;
    // } else {
    //   return `https://docs.google.com/viewer?url=${resumeUrl}&embedded=true`;
    // }
  };

  // Function to handle preview open

  const handleDownload = async (s3Url) => {
    try {
      const ext = s3Url?.split(".").pop().toLowerCase();

      const response = await fetch(s3Url);
      if (!response.ok) throw new Error("Failed to download file");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeName.split(" ")[0]}.${ext}`; // << USING ext HERE
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };
  const handlePreview = (resumeUrl, name) => {
    if (!resumeUrl) {
      toast.error("No resume uploaded");
      return;
    }
    // console.log(resumeUrl);
    setResume(resumeUrl);

    setResumeName(name);
    setSelectedResume(null);
    const viewerUrl = getViewerUrl(resumeUrl);
    if (viewerUrl) {
      setSelectedResume(viewerUrl);
      setDrawerVisible(true);
    }
  };
  const handleCancel = () => {
    setSelectedResume(null);
    setDrawerVisible(false);
  };
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialKeyword = queryParams.get("keyword") || "";

    if (initialKeyword) {
      setKeyword(initialKeyword);
      setSearched(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (searched) {
      handleSearch();
    }
  }, [keyword]);

  const pageSize = 3; // 3 results per panel

  const handlePageChange = (type, direction, totalLength) => {
    setPage((prev) => {
      const totalPages = Math.ceil(totalLength / pageSize);
      const newPage =
        direction === "next"
          ? Math.min(prev[type] + 1, totalPages)
          : Math.max(prev[type] - 1, 1);
      return { ...prev, [type]: newPage };
    });
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;
    setSearched(false);

    try {
      setLoading(true);
      setShowResults(true);

      const { data } = await axios.post(
        `${Server}/api/v1/search/keyword/global/search`,
        {
          query: keyword,
          category,
          region: "United States",
        }
      );
      // console.log(data);

      if (data.success) {
        setResults(data.results);
      } else {
        setResults({ candidates: [], employers: [], jobs: [] });
      }
      setLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setResults({ candidates: [], employers: [], jobs: [] });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const paginatedCandidates = results?.candidates?.slice(
    (page.candidates - 1) * pageSize,
    page.candidates * pageSize
  );

  const paginatedEmployers = results?.employers?.slice(
    (page.employers - 1) * pageSize,
    page.employers * pageSize
  );

  const paginatedJobs = results?.jobs?.slice(
    (page.jobs - 1) * pageSize,
    page.jobs * pageSize
  );

  return (
    <div>
      <Helmet>
        <title>Global Search | Skillstream</title>
      </Helmet>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Search Section */}
      <section className="page-title style-two">
        <div className="auto-container">
          <div className="job-search-form">
            <form onSubmit={handleSearch}>
              <div className="row align-items-center">
                {/* Keyword Input */}
                <div className="form-group col-lg-5 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <Input
                    placeholder="Search by keyword (e.g. Java Developer)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ height: "55px", paddingLeft: "40px" }}
                  />
                </div>

                {/* Category Select */}
                <div className="form-group col-lg-3 col-md-12 col-sm-12">
                  <Select
                    value={category}
                    onChange={setCategory}
                    style={{ width: "100%", height: "55px" }}
                    size="large"
                  >
                    <Option value="all">All</Option>
                    <Option value="candidates">Candidates</Option>
                    <Option value="employers">Employers</Option>
                    <Option value="jobs">Jobs</Option>
                  </Select>
                </div>

                {/* Search Button */}
                <div className="form-group col-lg-2 col-md-12 col-sm-12 d-flex justify-content-end">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="theme-btn btn-style-one w-100"
                    loading={loading}
                    disabled={loading}
                    style={{
                      height: "55px",
                      backgroundColor: "#1e90ff",
                      color: "#fff",
                      fontWeight: "600",
                      border: "none",
                      borderRadius: "6px",
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      {loading && (
        <div className="text-center py-5">
          <span className="spinner-border text-primary" role="status"></span>
        </div>
      )}
      {/* Results Section */}
      {showResults && !loading && (
        <section className="ls-section" style={{ backgroundColor: "#f9f9f9" }}>
          <div className="auto-container">
            <div className="row justify-content-center">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="ls-outer">
                  <div className="ls-switcher mb-4 text-center">
                    <div className="showing-result">
                      <div className="text fw-semibold fs-5">
                        Showing results for “{keyword}”
                      </div>
                    </div>
                  </div>

                  <Collapse
                    defaultActiveKey={["candidates", "employers", "jobs"]}
                    bordered={false}
                    expandIconPosition="end"
                    className="mb-5"
                  >
                    {/* Candidates */}
                    {(category === "all" || category === "candidates") &&
                      results.candidates.length !== 0 && (
                        <Panel
                          header={
                            <div className="d-flex justify-content-between align-items-center fw-semibold">
                              <span>Candidates</span>
                              <span>{results.candidates.length} found</span>
                            </div>
                          }
                          key="candidates"
                        >
                          {paginatedCandidates.map((c, i) => (
                            <div className="job-block" key={i}>
                              <div className="inner-box">
                                <div className="content">
                                  <span className="company-logo">
                                    {" "}
                                    <img
                                      src={
                                        c.image
                                          ? c.image
                                          : "https://skill-stream-jobs.s3.amazonaws.com/candidates/5303f7d40027bf760cef74c00.png"
                                      }
                                      alt="Candidate"
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                      onClick={() =>
                                        handlePreview(c.resume, c.name)
                                      }
                                    />
                                  </span>
                                  <h4 className="fw-bold mb-2">
                                    <a
                                      onClick={() =>
                                        handlePreview(c.resume, c.name)
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#1e90ff",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {c.name}
                                    </a>
                                  </h4>
                                  <ul className="job-info mb-2">
                                    <li>
                                      <span className="icon flaticon-user"></span>{" "}
                                      {c.jobTitle}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      {c.city ? c.city : "NA"},{" "}
                                      {c.state ? c.state : "NA"},{" "}
                                      {c.country ? c.country : "NA"}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-briefcase"></span>{" "}
                                      {c.workAuthorization
                                        ? c.workAuthorization
                                        : "NA"}
                                    </li>
                                  </ul>
                                  <p className="text-muted">
                                    <strong>Skills:</strong>{" "}
                                    {c.skills.join(", ")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {results.candidates.length > 3 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <Button
                                size="small"
                                disabled={page.candidates === 1}
                                onClick={() =>
                                  handlePageChange(
                                    "candidates",
                                    "prev",
                                    results.candidates.length
                                  )
                                }
                              >
                                Previous
                              </Button>

                              <span>
                                Page {page.candidates} of{" "}
                                {Math.ceil(
                                  results.candidates.length / pageSize
                                ) || 1}
                              </span>

                              <Button
                                size="small"
                                disabled={
                                  page.candidates ===
                                  Math.ceil(
                                    results.candidates.length / pageSize
                                  )
                                }
                                onClick={() =>
                                  handlePageChange(
                                    "candidates",
                                    "next",
                                    results.candidates.length
                                  )
                                }
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </Panel>
                      )}

                    {/* Employers */}
                    {(category === "all" || category === "employers") &&
                      results.employers.length !== 0 && (
                        <Panel
                          header={
                            <div className="d-flex justify-content-between align-items-center fw-semibold">
                              <span>Employers</span>
                              <span>{results.employers.length} found</span>
                            </div>
                          }
                          key="employers"
                        >
                          {paginatedEmployers.map((e, i) => (
                            <div className="job-block" key={i}>
                              <div className="inner-box">
                                <div className="content">
                                  <span className="company-logo">
                                    <a
                                      href={`/employers/${e._doc.userId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#1e90ff",
                                        textDecoration: "none",
                                      }}
                                    >
                                      <img
                                        src={e._doc.image}
                                        alt="Employer"
                                        style={{
                                          width: "60px",
                                          height: "60px",
                                          borderRadius: "10px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </a>
                                  </span>
                                  <h4 className="fw-bold mb-2">
                                    <a
                                      href={`/employers/${e._doc.userId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#1e90ff",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {e._doc.companyName}
                                    </a>
                                  </h4>
                                  <ul className="job-info mb-2">
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      {e._doc.city}, {e._doc.state},{" "}
                                      {e._doc.country}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-briefcase"></span>{" "}
                                      {e._doc.primaryIndustry
                                        ? e._doc.primaryIndustry
                                        : "NA"}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-people"></span>{" "}
                                      {e.jobsCount} Active Jobs
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                          {results.employers.length > 3 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <Button
                                size="small"
                                disabled={page.employers === 1}
                                onClick={() =>
                                  handlePageChange(
                                    "employers",
                                    "prev",
                                    results.employers.length
                                  )
                                }
                              >
                                Previous
                              </Button>

                              <span>
                                Page {page.employers} of{" "}
                                {Math.ceil(
                                  results.employers.length / pageSize
                                ) || 1}
                              </span>

                              <Button
                                size="small"
                                disabled={
                                  page.employers ===
                                  Math.ceil(results.employers.length / pageSize)
                                }
                                onClick={() =>
                                  handlePageChange(
                                    "employers",
                                    "next",
                                    results.employers.length
                                  )
                                }
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </Panel>
                      )}

                    {/* Jobs */}
                    {(category === "all" || category === "jobs") &&
                      results.jobs.length !== 0 && (
                        <Panel
                          header={
                            <div className="d-flex justify-content-between align-items-center fw-semibold">
                              <span>Jobs</span>
                              <span>{results.jobs.length} found</span>
                            </div>
                          }
                          key="jobs"
                        >
                          {paginatedJobs.map((j, i) => (
                            <div className="job-block" key={i}>
                              <div className="inner-box">
                                <div className="content">
                                  <span className="company-logo">
                                    <a
                                      href={`/job-detail/${j._doc.userId}/${j._doc.jobId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#1e90ff",
                                        textDecoration: "none",
                                      }}
                                    >
                                      <img
                                        src={j._doc.image}
                                        alt="Employer"
                                        style={{
                                          width: "60px",
                                          height: "60px",
                                          borderRadius: "10px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </a>
                                  </span>
                                  <h4 className="fw-bold mb-2">
                                    <a
                                      href={`/job-detail/${j._doc.userId}/${j._doc.jobId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#1e90ff",
                                        textDecoration: "none",
                                      }}
                                    >
                                      {j._doc.JobTitle}
                                    </a>
                                  </h4>
                                  <ul className="job-info">
                                    <li>
                                      <span className="icon flaticon-map-locator"></span>{" "}
                                      {j._doc.City}, {j._doc.State},{" "}
                                      {j._doc.Country}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-briefcase"></span>{" "}
                                      {j._doc.JobType}
                                    </li>
                                    <li>
                                      <span className="icon flaticon-money"></span>{" "}
                                      {j._doc.offeredSalary
                                        ? j._doc.offeredSalary
                                        : "NA"}
                                    </li>
                                    {/*<li>
                                      <span className="icon flaticon-clock-3">
                                        {" "}
                                        {formatDistanceToNow(
                                          new Date(j._doc?.time),
                                          {
                                            addSuffix: true,
                                          }
                                        )}
                                      </span>{" "}
                                    </li>*/}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                          {results.jobs.length > 3 && (
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <Button
                                size="small"
                                disabled={page.jobs === 1}
                                onClick={() =>
                                  handlePageChange(
                                    "jobs",
                                    "prev",
                                    results.jobs.length
                                  )
                                }
                              >
                                Previous
                              </Button>

                              <span>
                                Page {page.jobs} of{" "}
                                {Math.ceil(results.jobs.length / pageSize) || 1}
                              </span>

                              <Button
                                size="small"
                                disabled={
                                  page.jobs ===
                                  Math.ceil(results.jobs.length / pageSize)
                                }
                                onClick={() =>
                                  handlePageChange(
                                    "jobs",
                                    "next",
                                    results.jobs.length
                                  )
                                }
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </Panel>
                      )}
                  </Collapse>

                  {!loading &&
                    results &&
                    results.candidates?.length === 0 &&
                    results.employers?.length === 0 &&
                    results.jobs?.length === 0 && (
                      <div className="text-center py-5">
                        <h5 className="text-muted">
                          No results found for “{keyword}”. <br />
                          Try refining your keywords or selecting another
                          category.
                        </h5>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Resume Viewer</span>

            {/* ⭐ Download Button */}
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(resume)}
            >
              Download
            </Button>
          </div>
        }
        placement="right"
        width={window.innerWidth > 1024 ? "60%" : "90%"} // ✅ Reduced width
        onClose={() => handleCancel()}
        open={drawerVisible}
        bodyStyle={{ padding: 0, height: "100vh", overflow: "hidden" }} // ✅ Important
        styles={{
          header: { borderBottom: "1px solid #f0f0f0" },
          body: { padding: 0, background: "#f9f9f9" },
        }}
      >
        {selectedResume ? (
          <iframe
            src={selectedResume}
            title="Resume Viewer"
            width="100%"
            height="100%"
            style={{
              border: "none",
              height: "calc(100vh - 64px)", // ✅ Adjusts for drawer header height
            }}
          ></iframe>
        ) : (
          <div className="p-4 text-center">
            No resume available for preview.
          </div>
        )}
      </Drawer>
      {!showResults && (
        <section className="ls-section" style={{ backgroundColor: "#f9f9f9" }}>
          <div className="auto-container text-center py-5">
            <h5 className="text-muted fst-italic">
              “Discover top talent, leading employers, and great opportunities —
              all in one place.”
            </h5>
          </div>
        </section>
      )}
    </div>
  );
};

export default GlobalSearch;

{
  /*import React, { useState } from "react";
import { Input, Select, Collapse } from "antd";
import { Button } from "antd";
import { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";

const { Panel } = Collapse;
const { Option } = Select;

const GlobalSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [showResults, setShowResults] = useState(false);

  // Dummy results (1 each)
  const results = {
    candidates: [
      {
        name: "John Doe",
        skills: "Java, Spring Boot",
        location: "New York, USA",
        experience: "4 years",
      },
    ],
    employers: [
      {
        companyName: "TechStream Solutions",
        industry: "Software Development",
        location: "San Francisco, USA",
      },
    ],
    jobs: [
      {
        title: "Java Developer",
        company: "TechStream Solutions",
        location: "New York, USA",
        type: "Full Time",
      },
    ],
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setShowResults(true);
  };

  return (
    <div>
      <Helmet>
        <title>Global Search | Skillstream</title>
      </Helmet>
      <Toaster position="top-center" reverseOrder={false} />

  
      <section className="page-title style-two">
        <div className="auto-container">
          <div className="job-search-form">
            <form onSubmit={handleSearch}>
              <div className="row align-items-center">
     
                <div className="form-group col-lg-5 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <Input
                    placeholder="Type keyword (e.g. Java Developer)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ height: "55px", paddingLeft: "40px" }}
                  />
                </div>

      
                <div className="form-group col-lg-3 col-md-12 col-sm-12">
                  <Select
                    value={category}
                    onChange={setCategory}
                    style={{ width: "100%", height: "55px" }}
                    size="large"
                  >
                    <Option value="all">All</Option>
                    <Option value="candidates">Candidates</Option>
                    <Option value="employers">Employers</Option>
                    <Option value="jobs">Jobs</Option>
                  </Select>
                </div>

   
                <div className="form-group col-lg-2 col-md-12 col-sm-12 d-flex justify-content-end">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="theme-btn btn-style-one w-100"
                    style={{
                      height: "55px",
                      backgroundColor: "#1e90ff",
                      color: "#fff",
                      fontWeight: "600",
                      border: "none",
                      borderRadius: "6px",
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

  
      {showResults && (
        <section className="ls-section">
          <div className="auto-container">
            <div className="ls-outer">
              <div className="ls-switcher mb-4">
                <div className="showing-result text-center">
                  <div className="text fw-semibold fs-5">
                    Showing results for “{keyword}”
                  </div>
                </div>
              </div>

              <Collapse
                accordion={false}
                defaultActiveKey={["candidates", "employers", "jobs"]}
                bordered={false}
              >
     
                {(category === "all" || category === "candidates") && (
                  <Panel
                    header={
                      <div className="d-flex justify-content-between align-items-center fw-semibold">
                        <span>Candidates</span>
                        <span>{results.candidates.length} found</span>
                      </div>
                    }
                    key="candidates"
                  >
                    {results.candidates.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 mb-3 border rounded bg-light shadow-sm"
                      >
                        <h5 className="fw-bold mb-1">{c.name}</h5>
                        <p className="mb-1">
                          <strong>Skills:</strong> {c.skills}
                        </p>
                        <p className="mb-1">
                          <strong>Experience:</strong> {c.experience}
                        </p>
                        <p className="mb-0 text-muted">{c.location}</p>
                      </div>
                    ))}
                  </Panel>
                )}

  
                {(category === "all" || category === "employers") && (
                  <Panel
                    header={
                      <div className="d-flex justify-content-between align-items-center fw-semibold">
                        <span>Employers</span>
                        <span>{results.employers.length} found</span>
                      </div>
                    }
                    key="employers"
                  >
                    {results.employers.map((e, i) => (
                      <div
                        key={i}
                        className="p-3 mb-3 border rounded bg-light shadow-sm"
                      >
                        <h5 className="fw-bold mb-1">{e.companyName}</h5>
                        <p className="mb-1">
                          <strong>Industry:</strong> {e.industry}
                        </p>
                        <p className="mb-0 text-muted">{e.location}</p>
                      </div>
                    ))}
                  </Panel>
                )}

        
                {(category === "all" || category === "jobs") && (
                  <Panel
                    header={
                      <div className="d-flex justify-content-between align-items-center fw-semibold">
                        <span>Jobs</span>
                        <span>{results.jobs.length} found</span>
                      </div>
                    }
                    key="jobs"
                  >
                    {results.jobs.map((j, i) => (
                      <div
                        key={i}
                        className="p-3 mb-3 border rounded bg-light shadow-sm"
                      >
                        <h5 className="fw-bold mb-1">{j.title}</h5>
                        <p className="mb-1">
                          <strong>Company:</strong> {j.company}
                        </p>
                        <p className="mb-1">
                          <strong>Type:</strong> {j.type}
                        </p>
                        <p className="mb-0 text-muted">{j.location}</p>
                      </div>
                    ))}
                  </Panel>
                )}
              </Collapse>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default GlobalSearch;*/
}
