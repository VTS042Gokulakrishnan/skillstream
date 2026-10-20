// import React from "react";
// import tw from "twin.macro";
// import styled from "styled-components";

// const JobSearchContainer = tw.div`w-full flex flex-col items-center lg:items-start`;
// const JobSearchInput = tw.input`w-full p-4 mt-4 rounded bg-white border border-gray-300 focus:outline-none focus:border-primary-500`;
// const JobSearchButton = tw.button`mt-4 px-8 py-3 bg-primary-500 text-white font-bold rounded shadow transition duration-300 hocus:bg-primary-700 hocus:text-gray-100 focus:shadow-outline`;

// const JobSearchBar = () => {
//   return (
//     <JobSearchContainer>
//       <JobSearchInput type="text" placeholder="Job Title or Keywords" />
//       <JobSearchInput type="text" placeholder="Location" />
//       <JobSearchButton>Search Jobs</JobSearchButton>
//     </JobSearchContainer>
//   );
// };

// export default JobSearchBar;

import React, { useEffect, useState } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { Server } from "App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const JobSearchContainer = styled.div`
  ${tw`w-full flex flex-col md:flex-row items-center bg-white rounded-none md:rounded-full shadow p-2`}
`;

const JobSearchInput = styled.input`
  ${tw`w-full md:flex-1 p-4 pl-12 bg-transparent border-none focus:outline-none text-gray-600`}
`;

const LocationInput = styled.input`
  ${tw`w-full md:flex-1 p-4 bg-transparent border-t md:border-t-0 md:border-l border-gray-300 focus:outline-none text-gray-600`}
`;

const ExperienceDropdown = styled.select`
  ${tw`w-full md:flex-1 p-4 bg-transparent border-t md:border-t-0 md:border-l border-gray-300 focus:outline-none text-gray-600`}
`;

const SearchButton = styled.button`
  ${tw`w-full md:w-auto ml-4 px-8 py-3 bg-blue-700 text-white font-bold rounded-full transition duration-300 hover:bg-purple-800 focus:shadow-outline`}

  &:disabled {
    ${tw`bg-gray-400 cursor-not-allowed hover:bg-gray-400`}
  }
`;

const JobSearchIcon = styled.span`
  ${tw`absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-500`}
`;

const InputWrapper = styled.div`
  ${tw`relative w-full md:flex-1 p-2`}
`;
const JobSearchBar = () => {
  const [industryData, SetIndustryData] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [industry, setIndustry] = useState("");
  const naviagte = useNavigate();
  const [jobTitleError, setJobTitleError] = useState("");
  const [cityError, setCityError] = useState("");
  const [stateError, setStateError] = useState("");
  const [stateData, setStateData] = useState([]);
  const [cityData, SetCityData] = useState([]);

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
  useEffect(() => {
    fetchStates(); // Fetch states when country changes
  }, []);
  useEffect(() => {
    if (state) {
      fetchCities(); // Fetch states when country changes
    }
  }, [state]);

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
  // const validateCity = (value) => {
  //   const pattern = /^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/; // e.g., New-York, LosAngeles
  //   if (!value) return "";
  //   if (value.length < 2) return "Minimum 2 characters required.";
  //   if (value.length > 30) return "Maximum 30 characters allowed.";
  //   if (!pattern.test(value)) return "Space/Invalid Characters not allowed";
  //   return "";
  // };
  const fetchIndustries = async () => {
    try {
      const { data } = await axios.get(`${Server}/api/v1/data/industries`);
      // console.log(data.country_city);
      SetIndustryData(data.industries);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    fetchIndustries();
    // console.log(industryData);.
  }, []);
  const search = async () => {
    try {
      let payload = {};
      if (jobTitle || city || industry || state) {
        if (jobTitle.length != 0) {
          payload.job = jobTitle;
        }
        if (city.length != 0) {
          payload.City = city;
        }
        if (industry.length != 0) {
          payload.Industry = industry;
        }
        if (state.length != 0) {
          payload.State = state;
        }
        payload.country = "United States";
        // let payload = {
        //   job: jobTitle,
        //   City: city,
        //   Industry: industry,
        // };

        // console.log(payload);
        naviagte("/find-jobs", { state: payload });
      } else {
        toast.error("Atleast one Field required");
      }
    } catch (error) {
      // console.log(error);
    }
  };
  return (
    <JobSearchContainer>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Job Title Input with Icon */}
      <InputWrapper>
        <JobSearchIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l5.387 5.386a1 1 0 01-1.415 1.415l-5.386-5.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
          </svg>
        </JobSearchIcon>
        <JobSearchInput
          type="text"
          placeholder="Search by Job Title"
          onChange={(e) => {
            const val = e.target.value;
            setJobTitle(val);
            setJobTitleError(validateJobTitle(val));
          }}
        />
        {jobTitleError && (
          <p style={{ color: "red", paddingLeft: "20px", paddingTop: "5px" }}>
            {jobTitleError}
          </p>
        )}
      </InputWrapper>
      {/* Location Input (Only Show on Desktop) */}
      <InputWrapper className="hidden md:block">
        <ExperienceDropdown
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Select State</option>
          {stateData.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </ExperienceDropdown>
      </InputWrapper>

      <InputWrapper className="hidden md:block">
        <ExperienceDropdown
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!state} // Disable city dropdown until state is selected
        >
          <option value="">Select City</option>
          {cityData.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </ExperienceDropdown>
      </InputWrapper>

      {/* Industry Dropdown (Always Visible) */}
      <ExperienceDropdown onChange={(e) => setIndustry(e.target.value)}>
        <option> Select Industry</option>
        {industryData?.map((e, idx) => (
          <option key={idx} value={e}>
            {e}
          </option>
        ))}
      </ExperienceDropdown>

      <SearchButton
        disabled={
          (!!jobTitle && jobTitleError) ||
          (!!city && cityError) ||
          (!jobTitle && !city && !industry && !state)
        }
        onClick={() => search()}
      >
        Search
      </SearchButton>
    </JobSearchContainer>
  );
};

export default JobSearchBar;
