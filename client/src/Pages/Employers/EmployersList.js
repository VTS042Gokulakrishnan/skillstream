import React, { useState, useEffect } from "react";
import $ from "jquery";
import "jquery-ui/ui/widgets/slider";
import axios from "axios";
import { Skeleton } from "antd";
import { Server } from "../../App";

import { useNavigate } from "react-router-dom";
const EmployersList = () => {
  const [areaValues, setAreaValues] = useState([0, 50]);
  const [priceValues, setPriceValues] = useState([1923, 2023]);
  const [allEmployers, setAllEmployers] = useState([]); // Store full data
  // const [currentPage, setCurrentPage] = useState(1);
  const [employers, setEmployers] = useState([]);
  // const [employersPerPage, setEmployersPerPage] = useState(10);
  // const [sortBy, setSortBy] = useState("New Employers");
  const [sortBy, setSortBy] = useState("New Jobs");
  const [currentPage, setCurrentPage] = useState(1);
  const [employersPerPage, setEmployersPerPage] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [industryData, SetIndustryData] = useState([]);
  const [city, SetCity] = useState("");
  const [industry, SetIndustry] = useState("");
  const [jobTitle, SetjobTitle] = useState("");
  const [cityData, SetCityData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [countryData, SetCountryData] = useState([]);
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
    // Scroll to the top when navigation occurs
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getallEmployers();
    // fetchIndustries();
  }, []);
  const getallEmployers = async () => {
    setLoader(true);
    try {
      const response = await axios.get(
        `${Server}/api/v1/employer/allEmployers`
      );
      // console.log(response);
      setEmployers(response.data.Employers);
      setLoader(false);
      setAllEmployers(response.data.Employers);
    } catch (error) {
      // console.log(error);
      setLoader(false);
    }
  };

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

  useEffect(() => {
    // Price Range Slider
    if ($(".range-slider-one .range-slider").length) {
      $(".range-slider-one .range-slider").slider({
        range: true,
        min: 1900,
        max: 2030,
        values: priceValues,
        slide: function (event, ui) {
          setPriceValues(ui.values);
        },
      });

      // Initial values
      $(".range-slider-one .count").text(
        priceValues[0] + " - " + priceValues[1]
      );
    }
  }, [priceValues]);

  const ShortlistJobs = () => {
    try {
    } catch (error) {
      // console.log(error);
    }
  };
  // console.log(industryData);

  const fetchIndustries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/industries`);
      // console.log(data.industries);
      SetIndustryData(data.industries);
    } catch (error) {
      // console.log(error);
    }
  };
  // useEffect(() => {
  //   if (jobTitle.length != 0 || city.length != 0 || industry.length != 0) {
  //     keywordSearch();
  //   } else {
  //     const getallEmployers = async () => {
  //       setLoader(true);

  //       try {
  //         const response = await axios.get(
  //           `${Server}/api/v1/employer/allEmployers`
  //         );
  //         console.log(response);
  //         setEmployers(response.data.Employers);
  //         setLoader(false);
  //       } catch (error) {
  //         console.log(error);
  //         setLoader(false);
  //       }
  //     };

  //     getallEmployers();
  //   }
  //   // fetchIndustries();
  // }, [jobTitle, city, industry]);
  // const keywordSearch = async (e) => {
  //   // e.preventDefault();
  //   setLoader(true);

  //   try {
  //     const requestData = {};
  //     if (city) requestData.country = city;
  //     if (jobTitle) requestData.companyName = jobTitle;
  //     if (industry) requestData.industry = industry;
  //     const { data } = await axios.post(
  //       `${Server}/api/v1/search/keyword/employer`,
  //       {
  //         requestData,
  //       }
  //     );
  //     console.log(data);
  //     setLoader(false);

  //     // console.log(keywordData);
  //     // const jobsArray = data.results.reduce(
  //     //   (acc, curr) => acc.concat(curr.jobs),
  //     //   []
  //     // );

  //     // Update the job list with search results
  //     setEmployers(data.results);
  //     // setKeywordData(true);
  //   } catch (error) {
  //     console.log(error);
  //     setEmployers([]);
  //     setLoader(false);
  //   }
  // };
  const keywordSearch = () => {
    setLoader(true);

    let filteredData = allEmployers; // Start with all data

    if (city) {
      filteredData = filteredData.filter((employer) =>
        employer.country?.toLowerCase().includes(city.toLowerCase())
      );
    }
    if (jobTitle) {
      filteredData = filteredData.filter((employer) =>
        employer.companyName?.toLowerCase().includes(jobTitle.toLowerCase())
      );
    }
    if (industry) {
      filteredData = filteredData.filter((employer) =>
        employer.industry?.toLowerCase().includes(industry.toLowerCase())
      );
    }

    setEmployers(filteredData);
    setLoader(false);
  };
  useEffect(() => {
    fetchIndustries();
    fetchCountries();
  }, []);
  const fetchCountries = async () => {
    // console.log("country");

    try {
      const { data } = await axios.get(`${Server}/api/v1/data/countries`);
      // console.log(data.data);
      let country = [];
      const countryValue = data.countries.map((e, idx) => {
        country.push(e);
      });
      // console.log(country);

      SetCountryData(country);
    } catch (error) {
      // console.log(error);
    }
  };
  const sortEmployers = (employers) => {
    let sortedEmployers = [...employers];
    switch (sortBy) {
      case "New Jobs":
        sortedEmployers.sort((a, b) => {
          return new Date(b.postedAt) - new Date(a.postedAt);
        });
        break;
      case "Freelance":
        sortedEmployers = sortedEmployers.filter((employer) =>
          employer.jobs.some((job) => job.type === "Freelance")
        );
        break;
      case "Full Time":
        sortedEmployers = sortedEmployers.filter((employer) =>
          employer.jobs.some((job) => job.type === "Full Time")
        );
      case "Internship":
        sortedEmployers = sortedEmployers.filter((employer) =>
          employer.jobs.some((job) => job.type === "Internship")
        );
      case "Part Time":
        sortedEmployers = sortedEmployers.filter((employer) =>
          employer.jobs.some((job) => job.type === "Part Time")
        );
      case "Temporary":
        sortedEmployers = sortedEmployers.filter((employer) =>
          employer.jobs.some((job) => job.type === "Temporary")
        );
        break;
      // Add more cases for other sorting options as needed
      default:
        // Default sorting (e.g., by company name)
        sortedEmployers.sort((a, b) => {
          if (a.companyName < b.companyName) return -1;
          if (a.companyName > b.companyName) return 1;
          return 0;
        });
    }
    return sortedEmployers;
  };

  const filterAndPaginateEmployers = () => {
    let sortedEmployers = sortEmployers(employers);
    return sortedEmployers.slice(
      (currentPage - 1) * employersPerPage,
      currentPage * employersPerPage
    );
  };

  const currentEmployers = filterAndPaginateEmployers();
  const totalPages = Math.ceil(employers.length / employersPerPage);

  const handleEmployersPerPageChange = (e) => {
    setEmployersPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const startIndex = Math.min(
    (currentPage - 1) * itemsPerPage + 1,
    employers.length
  );
  const endIndex =
    currentPage * itemsPerPage < employers.length
      ? currentPage * itemsPerPage
      : employers.length;

  const totalJobs = employers.length;

  const paginationText = `Showing ${startIndex}-${endIndex} of ${totalJobs} Companies`;
  const reset = () => {
    SetjobTitle("");
    SetCity("");
    SetIndustry("");
    getallEmployers();
  };
  return (
    <div>
      <section class="page-title">
        <div class="auto-container">
          <div class="title-outer">
            <h1>Companies</h1>
            <ul class="page-breadcrumb">
              <li>
                <a href="#">Home</a>
              </li>
              <li>Companies</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="ls-section">
        <div class="auto-container">
          <div class="filters-backdrop"></div>

          <div class="row">
            <div class="filters-column col-lg-4 col-md-12 col-sm-12">
              <div class="inner-column pd-right">
                <div class="filters-outer">
                  <button type="button" class="theme-btn close-filters">
                    X
                  </button>

                  <div class="filter-block">
                    <h4>Company Name</h4>
                    <div class="form-group">
                      <input
                        type="text"
                        name="listing-search"
                        placeholder="keywords, or company"
                        value={jobTitle}
                        onChange={(e) => SetjobTitle(e.target.value)}
                      />
                      <span class="icon flaticon-search-3"></span>
                    </div>
                  </div>

                  <div class="filter-block">
                    <h4>Location</h4>
                    <div class="form-group">
                      <select
                        class="chosen-select"
                        placeholder="Country"
                        value={city}
                        onChange={(e) => SetCity(e.target.value)}
                      >
                        <option value={""}>Select a country</option>
                        {countryData?.map((e, idx) => (
                          <option key={idx} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <span class="icon flaticon-map-locator"></span>
                    </div>
                  </div>

                  <div class="filter-block">
                    <h4>Category</h4>
                    <div class="form-group">
                      <select
                        class="chosen-select"
                        value={industry}
                        onChange={(e) => SetIndustry(e.target.value)}
                      >
                        <option value={""}>Choose a category</option>
                        {industryData?.map((e, idx) => (
                          <option key={idx} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <span class="icon flaticon-briefcase"></span>
                    </div>
                  </div>
                  <button
                    onClick={keywordSearch}
                    className="theme-btn btn-style-two"
                    style={{ marginRight: "20px" }}
                  >
                    Search
                  </button>
                  <button onClick={reset} className="theme-btn btn-style-two">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div class="content-column col-lg-8 col-md-12 col-sm-12">
              <div class="ls-outer">
                <button
                  type="button"
                  class="theme-btn btn-style-two toggle-filters"
                >
                  Show Filters
                </button>

                <div class="ls-switcher">
                  <div class="showing-result">
                    <div className="text">{paginationText}</div>
                  </div>
                </div>

                <div
                  className="row"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  {loader ? (
                    <p style={{ textAlign: "center", marginTop: "5rem" }}>
                      Fetching.....
                    </p>
                  ) : employers?.length !== 0 ? (
                    currentEmployers?.map((e, idx) => (
                      <div
                        key={e.userId}
                        style={{
                          position: "relative",
                          width: "calc(33.333% - 20px)",
                          margin: "10px",
                          backgroundColor: "#f4f6f8",
                          borderRadius: "10px",
                          border: "1px solid #e0e0e0",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                          overflow: "hidden",
                          transition:
                            "box-shadow 0.3s ease, transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 8px 16px rgba(0, 0, 0, 0.15)";
                          e.currentTarget.style.transform = "translateY(-5px)";
                          // Show bookmark icon on hover
                          // e.currentTarget.querySelector(
                          //   ".bookmark-btn"
                          // ).style.display = "flex";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(0, 0, 0, 0.1)";
                          e.currentTarget.style.transform = "translateY(0)";
                          // Hide bookmark icon when not hovering
                          e.currentTarget.querySelector(
                            ".bookmark-btn"
                          ).style.display = "none";
                        }}
                      >
                        {/*<span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          backgroundColor: "rgba(255, 193, 7, 0.9)", // Adjust transparency if needed
                          color: "#000",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontWeight: "bold",
                          fontSize: "12px",
                          // textTransform: "uppercase",
                          zIndex: "2", // Ensure it's on top of other elements
                          display: "block",
                        }}
                      >
                        Featured
                      </span>*/}
                        <a onClick={() => navigate(`/employers/${e.userId}`)}>
                          {" "}
                          <div
                            style={{
                              position: "relative",
                              padding: "20px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                marginBottom: "15px",
                                marginLeft: "auto",
                                marginRight: "auto",
                              }}
                            >
                              <img
                                src={e.image}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <h4
                              style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                color: "#333",
                                marginBottom: "10px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  navigate(`/employers/${e.userId}`)
                                }
                                style={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: "#007bff",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                  transition: "color 0.3s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#0056b3")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "#007bff")
                                }
                              >
                                {e.companyName}
                              </button>
                            </h4>
                            <ul
                              style={{
                                listStyle: "none",
                                padding: "0",
                                margin: "0",
                                fontSize: "14px",
                                color: "#555",
                                marginBottom: "10px",
                              }}
                            >
                              <li
                                style={{
                                  marginBottom: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  justifyContent: "center",
                                }}
                              >
                                <span className="flaticon-map-locator"></span>{" "}
                                {e.city && e.country
                                  ? ` ${e.city}, ${e.country}`
                                  : e.country || e.city || "N/A"}
                              </li>
                              <li
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  justifyContent: "center",
                                }}
                              >
                                <span className="flaticon-briefcase"></span>{" "}
                                {e.primaryIndustry ? e.primaryIndustry : "N/A"}
                              </li>
                            </ul>
                            <div
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                display: "inline-block",
                                marginTop: "10px",
                              }}
                            >
                              Open Jobs: {e.jobs}
                            </div>
                          </div>
                          <button
                            style={{
                              position: "absolute",
                              top: "15px",
                              right: "15px",
                              backgroundColor: "#007bff",
                              border: "none",
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              color: "#fff",
                              fontSize: "20px",
                              cursor: "pointer",
                              display: "none", // Hidden by default, shown on hover
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            className="bookmark-btn"
                          >
                            <span className="flaticon-bookmark"></span>
                          </button>
                        </a>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", marginTop: "5rem" }}>
                      No Employer Found!
                    </p>
                  )}
                </div>

                <nav className="ls-pagination">
                  <ul>
                    {/* Previous Button */}
                    <li
                      className={`prev ${currentPage === 1 ? "disabled" : ""}`}
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployersList;
{
  /*  <p>Radius around selected destination</p>
                    <div class="range-slider-one">
                      <div class="area-range-slider"></div>
                      <div class="input-outer">
                        <div class="amount-outer">
                          <span class="area-amount"></span>km
                        </div>
                      </div>
  </div>*/
}
{
  /* <div class="ls-switcher">
                  <div class="showing-result">
                    <div class="text">
                      Showing <strong>41-60</strong> of <strong>944</strong>{" "}
                      employer
                    </div>
                  </div>
                  <div class="sort-by">
                    <select
                      className="chosen-select"
                      value={sortBy}
                      onChange={handleSortByChange}
                    >
                      <option>New Employers</option>
                      <option>New Jobs</option>
                      <option>Freelance</option>
                      <option>Full Time</option>
                      <option>Internship</option>
                      <option>Part Time</option>
                      <option>Temporary</option>
                    </select>
                    <select
                      className="chosen-select"
                      value={employersPerPage}
                      onChange={handleEmployersPerPageChange}
                    >
                      <option>Show 10</option>
                      <option>Show 20</option>
                      <option>Show 30</option>
                      <option>Show 40</option>
                      <option>Show 50</option>
                      <option>Show 60</option>
                    </select>
                  </div>
                </div> */
}
{
  /*         <div class="filter-block">
                    <h4>Company Size</h4>
                    <div class="form-group">
                      <select class="chosen-select">
                        <option>1-100 Members</option>
                        <option>100-200 Members</option>
                        <option>200-500 Members</option>
                        <option>500-1000 Members</option>
                        <option>1000-10000 Members</option>
                      </select>
                      <span class="icon flaticon-briefcase"></span>
                    </div>
                  </div>

                  <div class="filter-block">
                    <h4>Founded Date</h4>
                    <div class="range-slider-one">
                      <div class="range-slider"></div>
                      <div class="input-outer">
                        <div class="amount-outer">
                          <span class="count"></span>
                        </div>
                      </div>
                    </div>
</div>*/
}
// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-2.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Opendoor</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-3.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Checkr</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-4.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Mural</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-5.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Astronomer</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-6.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Figma</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-7.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Mural</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-8.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Astronomer</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>

// <div class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12">
// <div class="inner-box">
//   <button class="bookmark-btn">
//     <span class="flaticon-bookmark"></span>
//   </button>
//   <span class="featured">Featured</span>
//   <span class="company-logo">
//     <img
//       src="images/resource/company-logo/6-9.png"
//       alt=""
//     />
//   </span>
//   <h4>
//     <a href="#">Figma</a>
//   </h4>
//   <ul class="job-info">
//     <li>
//       <span class="icon flaticon-map-locator"></span>{" "}
//       London, UK
//     </li>
//     <li>
//       <span class="icon flaticon-briefcase"></span>{" "}
//       Accounting / Finance
//     </li>
//   </ul>
//   <div class="job-type">Open Jobs – 2</div>
// </div>
// </div>
{
  /* <div class="row">
                  {employers?.length != 0 ? (
                    currentEmployers?.map((e, idx) => (
                      <div
                        key={e.userId}
                        class="company-block-four col-xl-4 col-lg-6 col-md-6 col-sm-12"
                      >
                        <div class="inner-box">
                          <button class="bookmark-btn">
                            <span class="flaticon-bookmark"></span>
                          </button>
                          <span class="featured">Featured</span>
                          <span class="company-logo">
                            <img src={e.image} alt="" />
                          </span>
                          <h4>
                            <button
                              onClick={() => navigate(`/employers/${e.userId}`)}
                            >
                              {e.companyName}
                            </button>
                          </h4>
                          <ul class="job-info">
                            <li>
                              <span class="icon flaticon-map-locator"></span>{" "}
                              {e.city},{e.country}
                            </li>
                            <li>
                              <span class="icon flaticon-briefcase"></span>{" "}
                              {e.primaryIndustry}
                            </li>
                          </ul>
                          <div class="job-type">
                            Open Jobs – {e.jobs.length}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", marginTop: "5rem" }}>
                      No Employer Found!
                    </p>
                  )}
                </div> */
}

{
  /* <div className="ls-switcher">
                    <div className="sort-by">
                      <select
                        className="chosen-select"
                        value={sortBy}
                        onChange={handleSortByChange}
                      >
                        <option>New Jobs</option>
                        <option>Freelance</option>
                        <option>Full Time</option>
                        <option>Internship</option>
                        <option>Part Time</option>
                        <option>Temporary</option>
                      </select>

                     
                      <select
                        className="chosen-select"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                      >
                        <option>Show 10</option>
                        <option>Show 20</option>
                        <option>Show 30</option>
                        <option>Show 40</option>
                        <option>Show 50</option>
                        <option>Show 60</option>
                      </select>
                    </div>
                  </div> */
}
