const { json } = require("express");
const usermodel = require("../models/candidateModel");
const employerModel = require("../models/employerModel");
const jobsModel = require("../models/jobsModel");
const nonUserModel = require("../models/nonUsersModel");
const aiRequestModel = require("../models/AIRequests");

const axios = require("axios");
function formatTimeTaken(ms) {
  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    return remSeconds ? `${minutes} min ${remSeconds} sec` : `${minutes} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remMinutes = Math.floor((seconds % 3600) / 60);
    return remMinutes ? `${hours} hr ${remMinutes} min` : `${hours} hr`;
  }
}
const controller = {
  async candidateKeywordSearch(req, res) {
    try {
      const { keyword, jobTitle, country, city, state, distance } = req.body;
      console.log(req.body);
      const parseQuery = (query) => {
        const tokens = [];
        const phraseRegex = /"([^"]+)"/g;
        let match;

        // Extract phrases in quotes
        while ((match = phraseRegex.exec(query)) !== null) {
          tokens.push({ type: "PHRASE", value: match[1], exact: true });
        }

        // Remove phrases from the query string
        let remainingQuery = query.replace(phraseRegex, "").trim();

        // Tokenize the remaining query based on boolean operators
        const boolTokens = remainingQuery
          .split(/(\sAND\s|\sOR\s|\sNOT\s|\(|\))/i)
          .filter(Boolean)
          .map((token) => token.trim().toUpperCase());

        tokens.push(...boolTokens);

        return tokens;
      };

      // Function to construct the MongoDB query structure from tokens
      const constructBooleanQuery = (tokens, path, isFuzzy) => {
        const queryStack = [];
        const operatorStack = [];

        // Helper functions
        const applyOperator = () => {
          const operator = operatorStack.pop();
          const right = queryStack.pop();
          const left = queryStack.pop();

          if (operator === "AND") {
            queryStack.push({
              compound: {
                must: [left, right],
              },
            });
          } else if (operator === "OR") {
            queryStack.push({
              compound: {
                should: [left, right],
              },
            });
          } else if (operator === "NOT") {
            queryStack.push({
              compound: {
                mustNot: [right],
              },
            });
          }
        };

        for (let token of tokens) {
          if (token === "(") {
            operatorStack.push(token);
          } else if (token === ")") {
            while (
              operatorStack.length > 0 &&
              operatorStack[operatorStack.length - 1] !== "("
            ) {
              applyOperator();
            }
            operatorStack.pop(); // Remove the '(' from the stack
          } else if (["AND", "OR", "NOT"].includes(token)) {
            operatorStack.push(token);
          } else {
            // It's a search term (could be a word or phrase)
            const query = {
              text: {
                path,
                query: token,
              },
            };

            // Add fuzzy search only if isFuzzy is true
            if (isFuzzy) {
              query.text.fuzzy = {};
            }

            queryStack.push(query);
          }
        }

        // Apply remaining operators
        while (operatorStack.length > 0) {
          applyOperator();
        }

        return queryStack.length > 0 ? queryStack[0] : null;
      };
      const JobparseQuery = (query) => {
        // Handle exact phrases enclosed in double quotes
        const phraseRegex = /"([^"]+)"/g;
        const phrases = [];
        let match;
        while ((match = phraseRegex.exec(query)) !== null) {
          phrases.push(match[1]);
        }
        // Remove phrases from the query
        let remainingQuery = query.replace(phraseRegex, "").trim();

        // Handle parentheses and logical operators
        const parseLogicalOperators = (str) => {
          let result = [];
          let depth = 0;
          let currentPart = "";
          for (let char of str) {
            if (char === "(") {
              depth++;
              if (depth === 1 && currentPart.trim()) {
                result.push(currentPart.trim());
                currentPart = "";
              }
            } else if (char === ")") {
              depth--;
              if (depth === 0) {
                result.push(`(${currentPart.trim()})`);
                currentPart = "";
              }
            } else if (char === " " && depth === 0) {
              if (currentPart.trim()) {
                result.push(currentPart.trim());
                currentPart = "";
              }
            } else {
              currentPart += char;
            }
          }
          if (currentPart.trim()) {
            result.push(currentPart.trim());
          }
          return result;
        };

        const parsedParts = parseLogicalOperators(remainingQuery);
        const andGroups = parsedParts.map((part) => {
          if (part.includes(" OR ")) {
            return part.split(" OR ").map((subPart) => subPart.trim());
          }
          return [part.trim()];
        });

        // Add phrases to the first OR group (simplified logic)
        if (phrases.length > 0) {
          andGroups.unshift(phrases);
        }

        return andGroups;
      };
      const mustQueries = [];
      let distanceCitiesSet = new Set();
      let mergedCities = city ? [...city] : null;
      let mergedStates = state ? [...state] : null;
      if (distance && distance !== 0 && city?.length && state?.length) {
        try {
          const distanceResponse = await axios.post(
            `${process.env.AI_URL}/search_cities_by_distance`,
            {
              city: city[0],
              state: state[0],
              country,
              distance_miles: distance,
            }
          );
          const nearbyCities = [];
          const nearbyStates = new Set();

          if (distanceResponse?.data?.results?.length) {
            for (const r of distanceResponse.data.results) {
              if (r.city) nearbyCities.push(r.city);
              if (r.state) nearbyStates.add(r.state);
            }
          }

          distanceCitiesSet = new Set(nearbyCities);
          mergedCities = Array.from(new Set([...city, ...nearbyCities]));
          mergedStates = Array.from(new Set([...state, ...nearbyStates]));
          console.log(mergedCities)
          console.log(
            `Nearby ${mergedCities.length} cities found, ${mergedStates.size} states found within ${distance} miles`
          );
        } catch (error) {
          console.error("Error fetching nearby cities:", error.message);
        }
      }
      // const mustQueries = [];

      if (jobTitle) {
        const jobTitleOrGroups = JobparseQuery(jobTitle);
        // console.log("title", jobTitleOrGroups);

        mustQueries.push({
          compound: {
            must: jobTitleOrGroups.map((group) => ({
              compound: {
                should: group.map((term) => ({
                  text: {
                    path: "jobTitle",
                    query: term,
                    // fuzzy: {},
                  },
                })),
              },
            })),
          },
        });
      }
      // List of must queries to be passed in the aggregation pipeline

      // Job Title Search without fuzzy
      // if (jobTitle) {
      //   const jobTitleTokens = parseQuery(jobTitle);
      //   const jobTitleQuery = constructBooleanQuery(
      //     jobTitleTokens,
      //     "jobTitle",
      //     false
      //   ); // No fuzzy for jobTitle
      //   if (jobTitleQuery) {
      //     console.log(jobTitleQuery);

      //     mustQueries.push(jobTitleQuery);
      //   }
      // }

      // Country, City, and State filters
      const stateMapping = {
        USA: {
          AL: "Alabama",
          AK: "Alaska",
          AZ: "Arizona",
          AR: "Arkansas",
          CA: "California",
          CO: "Colorado",
          CT: "Connecticut",
          DE: "Delaware",
          FL: "Florida",
          GA: "Georgia",
          HI: "Hawaii",
          ID: "Idaho",
          IL: "Illinois",
          IN: "Indiana",
          IA: "Iowa",
          KS: "Kansas",
          KY: "Kentucky",
          LA: "Louisiana",
          ME: "Maine",
          MD: "Maryland",
          MA: "Massachusetts",
          MI: "Michigan",
          MN: "Minnesota",
          MS: "Mississippi",
          MO: "Missouri",
          MT: "Montana",
          NE: "Nebraska",
          NV: "Nevada",
          NH: "New Hampshire",
          NJ: "New Jersey",
          NM: "New Mexico",
          NY: "New York",
          NC: "North Carolina",
          ND: "North Dakota",
          OH: "Ohio",
          OK: "Oklahoma",
          OR: "Oregon",
          PA: "Pennsylvania",
          RI: "Rhode Island",
          SC: "South Carolina",
          SD: "South Dakota",
          TN: "Tennessee",
          TX: "Texas",
          UT: "Utah",
          VT: "Vermont",
          VA: "Virginia",
          WA: "Washington",
          WV: "West Virginia",
          WI: "Wisconsin",
          WY: "Wyoming",
        },
        Canada: {
          AB: "Alberta",
          BC: "British Columbia",
          MB: "Manitoba",
          NB: "New Brunswick",
          NL: "Newfoundland and Labrador",
          NS: "Nova Scotia",
          NT: "Northwest Territories",
          NU: "Nunavut",
          ON: "Ontario",
          PE: "Prince Edward Island",
          QC: "Quebec",
          SK: "Saskatchewan",
          YT: "Yukon",
        },
      };
      const normalizeCountry = (country) => {
        if (!country) return "";
        const lowerCountry = country.toLowerCase();
        if (
          lowerCountry.includes("united states") ||
          lowerCountry.includes("usa")
        ) {
          return "USA";
        } else if (lowerCountry.includes("canada")) {
          return "Canada";
        }
        return country;
      };

      // ✅ State Match Function
      const getStateVariants = (state, country) => {
        const variants = [];
        if (!state || !country) return [state];

        // Normalize country name
        const normalizedCountry = normalizeCountry(country);

        // Convert state to uppercase to match keys
        const upperState = state.toUpperCase();
        const lowerState = state.toLowerCase();

        // Check if state is abbreviation or full name
        if (stateMapping[normalizedCountry]) {
          const map = stateMapping[normalizedCountry];

          // If input is abbreviation, push full name
          if (map[upperState]) {
            variants.push(map[upperState], upperState);
          }

          // If input is full name, find abbreviation
          const abbreviation = Object.keys(map).find(
            (abbr) => map[abbr].toLowerCase() === lowerState
          );
          if (abbreviation) {
            variants.push(map[abbreviation], abbreviation);
          }
        }

        // Return either abbreviation or full name
        return variants.length ? variants : [state];
      };

      if (Array.isArray(mergedStates) && mergedStates.length > 0) {
        const allStateQueries = mergedStates.flatMap((s) =>
          getStateVariants(s, country).map((variant) => ({
            text: {
              path: "state",
              query: variant,
            },
          }))
        );

        mustQueries.push({
          compound: {
            should: allStateQueries,
          },
        });
      }

      if (country) {
        let countryVariants = [];

        // Handling different variations of country names
        if (
          country.toLowerCase() === "usa" ||
          country.toLowerCase() === "united states"
        ) {
          countryVariants = ["USA", "United States", "U.S.", "America"];
        } else if (country.toLowerCase() === "canada") {
          countryVariants = ["Canada", "CA"];
        } else {
          countryVariants = [country]; // Default case, use provided country
        }

        mustQueries.push({
          compound: {
            should: countryVariants.map((variant) => ({
              text: { path: "country", query: variant },
            })),
          },
        });
      }
      // if (Array.isArray(city) && city.length > 0) {
      //   mustQueries.push({
      //     compound: {
      //       should: city.map((c) => ({
      //         text: {
      //           path: "city",
      //           query: c,
      //         },
      //       })),
      //     },
      //   });
      // }
      // Keyword Search with fuzzy
      if (keyword) {
        const keywordTokens = parseQuery(keyword);
        const keywordQuery = constructBooleanQuery(
          keywordTokens,
          "skills",
          false
        ); // Fuzzy allowed for skills
        if (keywordQuery) {
          mustQueries.push(keywordQuery);
        }
      }

      // // Build the aggregation pipeline
      // const aggregationPipeline = [
      //   {
      //     $search: {
      //       index: "default",
      //       compound: {
      //         must: mustQueries,
      //       },
      //     },
      //   },
      //   ...(city && mergedCities.length > 0
      //     ? [{ $match: { city: { $in: mergedCities } } }]
      //     : []),

      // ];
      const aggregationPipeline = [
        {
          $search: {
            index: "default",
            compound: {
              must: mustQueries,
            },
            sort: {
              lastLoggedIn: -1, // ✅ SORT INSIDE $search
            },
          },
        },
        ...(city && mergedCities.length > 0
          ? [{ $match: { city: { $in: mergedCities } } }]
          : []),
      ];
      // Perform search on both user and non-user collections
      const keywordSearchResults = await usermodel.aggregate(
        aggregationPipeline
      );
      const nonUserKeywordResults = await nonUserModel.aggregate(
        aggregationPipeline
      );
      const emailCountMap = new Map();
      const uniqueNonUserResults = [];
      const seenEmails = new Set();

      for (const candidate of nonUserKeywordResults) {
        const email = candidate.email;

        // Count occurrences of each email
        emailCountMap.set(email, (emailCountMap.get(email) || 0) + 1);

        if (!seenEmails.has(email)) {
          seenEmails.add(email);
          uniqueNonUserResults.push(candidate);
        }
      }

      // Log duplicate emails and their counts
      // console.log("Duplicate Emails and Counts:");
      // for (const [email, count] of emailCountMap.entries()) {
      //   if (count > 1) {
      //     console.log(`${email}: ${count} times`);
      //   }
      // }

      // console.log(`Total: ${nonUserKeywordResults.length}`);
      // console.log(`After Removing Duplicates: ${uniqueNonUserResults.length}`);
      // console.log(`Duplicates Removed: ${nonUserKeywordResults.length - uniqueNonUserResults.length}`);
      // console.log(`Total: ${nonUserKeywordResults.length}`,`afterremoved:${uniqueNonUserResults.length}`)

      const allResults = [...keywordSearchResults, ...uniqueNonUserResults];
      let filteredResults = allResults;

      // if (distanceCitiesSet.size > 0) {
      //   const near = [];
      //   const far = [];
      //   const baseCity = city?.[0];
      //   if (baseCity) {
      //     distanceCitiesSet.add(baseCity);
      //   }
      //   console.log(distanceCitiesSet);
      //   for (const result of allResults) {
      //     const cityName = result.city;
      //     // console.log(cityName);
      //     if (
      //       (cityName && distanceCitiesSet.has(cityName)) ||
      //       (cityName && cityName === city)
      //     ) {
      //       console.log(`Near : ${cityName}`);
      //       near.push(result);
      //     } else {
      //       console.log(`Far : ${cityName}`);

      //       far.push(result);
      //     }
      //   }
      //   filteredResults = [...near, ...far];
      //   console.log(`total:${far.length}`);
      //   console.log(`Reordered: ${near.length} nearby city results first`);
      // }
      if (allResults.length > 0) {
        res.status(200).json({
          totalresults: filteredResults.length,
          results: filteredResults,
          status: true,
        });
      } else {
        res.status(404).json({ message: "No results Found", status: false });
      }
    } catch (error) {
      console.error("Error during candidate search:", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  },

  async employerKeywordSearch(req, res) {
    try {
      const { keyword } = req.body;
      const keywordSearch = await employerModel.aggregate([
        {
          $search: {
            index: "default",
            text: {
              query: keyword,
              path: {
                wildcard: "*",
              },
            },
          },
        },
      ]);
      // console.log(keywordSearch);
      if (keywordSearch != 0) {
        res.status(200).json({
          totalresults: keywordSearch.length,
          results: keywordSearch,
          status: true,
        });
      } else {
        res.status(404).json({ message: "No results Found", staus: false });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  },
  async jobsKeywordSearch(req, res) {
    try {
      const { jobTitle, country, industry, companyName, city, state, skills } =
        req.body;
      console.log(req.body);

      const searchConditions = [];

      // Normalize country aliases
      const countryAliasesMap = {
        usa: ["usa", "united states", "us"],
        canada: ["canada", "ca"],
        india: ["india", "in"],
      };

      let normalizedCountry = null;
      if (country) {
        const countryLower = country.toLowerCase();
        for (const [key, aliases] of Object.entries(countryAliasesMap)) {
          if (aliases.includes(countryLower)) {
            normalizedCountry = aliases;
            break;
          }
        }
        if (!normalizedCountry) {
          normalizedCountry = [country]; // use as-is if not found in aliases
        }

        searchConditions.push({
          text: {
            query: normalizedCountry,
            path: "Country",
          },
        });
      }

      if (state) {
        searchConditions.push({
          text: {
            query: state,
            path: "State",
          },
        });
      }

      if (jobTitle) {
        searchConditions.push({
          phrase: {
            query: jobTitle,
            path: "JobTitle",
          },
        });
      }

      if (companyName) {
        searchConditions.push({
          phrase: {
            query: companyName,
            path: "companyName",
          },
        });
      }

      if (city) {
        searchConditions.push({
          text: {
            query: city,
            path: "City",
          },
        });
      }

      if (industry) {
        searchConditions.push({
          text: {
            query: industry,
            path: "Industry",
          },
        });
      }

      if (Array.isArray(skills) && skills.length > 0) {
        searchConditions.push({
          text: {
            query: skills,
            path: "jobSkills",
          },
        });
      }

      const keywordSearch = await jobsModel.aggregate([
        {
          $search: {
            index: "default",
            compound: {
              must: searchConditions,
            },
          },
        },
      ]);

      if (keywordSearch.length > 0) {
        res.status(200).json({
          totalresults: keywordSearch.length,
          results: keywordSearch,
          status: true,
        });
      } else {
        res.status(404).json({ message: "No results Found", status: false });
      }
    } catch (error) {
      console.error("Error searching for jobs:", error);
      res.status(500).json({ error: "Internal Server Error", status: false });
    }
  },

  async AIResumeSearch(req, res) {
    try {
      const requestTime = new Date();
      const {
        // keyword,
        title,
        description,
        skills,
        keys_and_responsibilities,
        experience,
        location,
        captcha,
      } = req.body;
      // const getAllUsers = await usermodel.find({
      //   role: "Candidate",
      // });
      // const AllUsers = await nonUserModel.find({});
      // const allCandidates = [...getAllUsers, ...AllUsers];
      let formData = JSON.stringify({
        title: title,
        description: description,
        skills: skills,
        keys_and_responsibilities: keys_and_responsibilities,
        experience: experience,
        location: location,
        // users: allCandidates,
      });
      const { data } = await axios.post(
        `${process.env.AI_URL}/search`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(data);
      const responseTime = new Date();
      const timeTaken = responseTime - requestTime;
      const storeResponse = await aiRequestModel.create({
        apiRoute: req.originalUrl,
        aiRoute: "/search",
        request: req.body,
        response: data?.top_candidates,
        version: "1.1.0",
        requestTime,
        responseTime,
        timeTaken: formatTimeTaken(timeTaken),
      });
      if (data?.top_candidates.length != 0) {
        res
          .status(200)
          .json({ candidates: data?.top_candidates, status: true });
      } else {
        res.status(404).json({ message: "No results Found", status: false });
      }
    } catch (error) {
      console.log(error);
      const { cerror } = error;
      res.status(500).json({ error: cerror, status: false });
    }
  },
  async AIJobSearch(req, res) {
    try {
      const { userId } = req.params;

      if (userId) {
        const user = await usermodel.findOne({ userId });
        // console.log("user");

        const {
          name,
          email,
          phone_number,
          country,
          state,
          resume,
          experience,
          jobTitle,
          skills,
          Education,
          work_experience,
        } = user;
        // console.log({
        //   name,
        //   email,
        //   phone_number,
        //   country,
        //   state,
        //   resume,
        //   experience,
        //   jobTitle,
        //   skills,
        //   Education,
        //   work_experience,
        // });

        let formData = JSON.stringify({
          name,
          email,
          phone_number,
          country,
          state,
          resume,
          experience,
          jobTitle,
          skills,
          Education,
          work_experience,
        });
        const { data } = await axios.post(
          `${process.env.AI_URL}/fetch_best_fit_job`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // console.log(data);
        if (data?.best_fit_jobs.length != 0) {
          res.status(200).json({ Jobs: data?.best_fit_jobs, status: true });
        } else {
          res.status(404).json({ message: "No results Found", status: false });
        }
      } else {
        res.status(401).json({ message: "Please Login", status: false });
      }
    } catch (err) {
      console.log(err);
      const { error } = err;
      if (err.data) {
        res.status(500).json({ error: err.data.message, status: false });
      } else {
        res.status(500).json({ error: err, status: false });
      }
    }
  },

  async globalSearch(req, res) {
    try {
      const { query, category } = req.body;
      if (!query) {
        return res
          .status(400)
          .json({ success: false, message: "Query required" });
      }

      const regex = new RegExp(query, "i");

      const results = {
        candidates: [],
        employers: [],
        jobs: [],
      };

      // -------------------
      // Candidates Search
      // -------------------
      if (category === "all" || category === "candidates") {
        const userCandidates = await usermodel.find({
          $or: [
            { name: regex },
            { skills: { $regex: regex } },
            { email: regex },
            { Experience_level: { $regex: regex } },
            { country: regex },
            { city: regex },
            { state: regex },
          ],
        });
        // .select(
        //   "name email experience Experience_level city state country work_authorization skills image userId"
        // )
        // .limit(10)
        // .lean();

        // Non-registered resumes
        const nonUserCandidates = await nonUserModel.find({
          $or: [
            { name: regex },
            { skills: { $regex: regex } },
            { email: regex },
            { Experience_level: { $regex: regex } },
            { country: regex },
            { city: regex },
            { state: regex },
          ],
        });
        // .select(
        //   "name email experience Experience_level city state country work_authorization skills image"
        // )
        // .limit(10)
        // .lean();

        // Merge & deduplicate (by email or name)
        const merged = [
          ...userCandidates,
          ...nonUserCandidates.filter(
            (n) =>
              !userCandidates.some(
                (u) => u.email?.toLowerCase() === n.email?.toLowerCase()
              )
          ),
        ];

        results.candidates = merged; // cap results
      }

      // -------------------
      // Employers Search
      // -------------------
      if (category === "all" || category === "employers") {
        results.employers = await employerModel.find({
          $or: [
            { companyName: regex },
            { industry: regex },
            { email: regex },
            { country: regex },
            { city: regex },
            { state: regex },

            // { "jobs.JobTitle": regex }, // safely match inside job titles
            // { "jobs.jobId": regex },
          ],
        });
        // .select("companyName city state country industry image userId jobs")
        // .limit(10)
        // .lean();

        // Count jobs for each employer
        results.employers = results.employers.map((e) => ({
          ...e,
          jobsCount: e.jobs ? e.jobs.length : 0,
        }));
      }

      // -------------------
      // Jobs Search
      // -------------------
      if (category === "all" || category === "jobs") {
        results.jobs = await jobsModel.find({
          $or: [
            { JobTitle: regex },
            { JobType: regex },
            { skills: { $regex: regex } },
            { EmailAddress: regex },
            { City: regex },
            { State: regex },
            { Country: regex },
          ],
        });
        // .select(
        //   "jobTitle jobType offeredSalary city state country userId _id createdAt"
        // )
        // // .limit(10)
        // .lean();

        // Format jobId and postedTime
        results.jobs = results.jobs.map((j) => ({
          ...j,
          jobId: j._id,
        }));
      }

      res.status(200).json({
        success: true,
        results,
      });
    } catch (error) {
      console.error("Global Search Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};
module.exports = controller;

// const { jobTitle, city, employerCategory } = req.body;

// // Define an array to store the match conditions
// const matchConditions = [];

// // Push match conditions for each keyword
// if (jobTitle) {
//   matchConditions.push({
//     "jobs.JobTitle": { $regex: jobTitle, $options: "i" },
//   });
// }
// if (city) {
//   matchConditions.push({ "jobs.City": { $regex: city, $options: "i" } });
// }
// if (employerCategory) {
//   matchConditions.push({
//     "jobs.Industry": { $regex: employerCategory, $options: "i" },
//   });
// }

// const keywordSearch = await employerModel.aggregate([
//   // Unwind the jobs array to deconstruct it into separate documents
//   { $unwind: "$jobs" },
//   // Match documents based on multiple keyword conditions using $or
//   matchConditions.length > 0
//     ? { $match: { $or: matchConditions } }
//     : { $match: {} }, // Match all documents if no conditions provided
//   // Group the documents back into arrays based on the original document's _id
//   {
//     $group: {
//       _id: "$_id",

//       // Add other fields as needed
//       jobs: { $push: "$jobs" }, // Recontruct the jobs array
//     },
//   },
// ]);

// if (keywordSearch.length > 0) {
//   res.status(200).json({
//     resultsCount: keywordSearch.length,
//     results: keywordSearch,
//     status: true,
//   });
// } else {
//   res.status(404).json({ message: "No results found", status: false });
// }

// candidate search
// async candidateKeywordSearch(req, res) {
//   try {
//     const { keyword, jobTitle, country, city, state } = req.body;
//     // console.log(req.body);

//     const parseQuery = (query) => {
//       // Handle exact phrases enclosed in double quotes
//       const phraseRegex = /"([^"]+)"/g;
//       const phrases = [];
//       let match;
//       while ((match = phraseRegex.exec(query)) !== null) {
//         phrases.push(match[1]);
//       }
//       // Remove phrases from the query
//       let remainingQuery = query.replace(phraseRegex, "").trim();

//       // Handle parentheses and logical operators
//       const parseLogicalOperators = (str) => {
//         let result = [];
//         let depth = 0;
//         let currentPart = "";
//         for (let char of str) {
//           if (char === "(") {
//             depth++;
//             if (depth === 1 && currentPart.trim()) {
//               result.push(currentPart.trim());
//               currentPart = "";
//             }
//           } else if (char === ")") {
//             depth--;
//             if (depth === 0) {
//               result.push(`(${currentPart.trim()})`);
//               currentPart = "";
//             }
//           } else if (char === " " && depth === 0) {
//             if (currentPart.trim()) {
//               result.push(currentPart.trim());
//               currentPart = "";
//             }
//           } else {
//             currentPart += char;
//           }
//         }
//         if (currentPart.trim()) {
//           result.push(currentPart.trim());
//         }
//         return result;
//       };

//       const parsedParts = parseLogicalOperators(remainingQuery);
//       const andGroups = parsedParts.map((part) => {
//         if (part.includes(" OR ")) {
//           return part.split(" OR ").map((subPart) => subPart.trim());
//         }
//         return [part.trim()];
//       });

//       // Add phrases to the first OR group (simplified logic)
//       if (phrases.length > 0) {
//         andGroups.unshift(phrases);
//       }

//       return andGroups;
//     };

//     const mustQueries = [];

//     if (jobTitle) {
//       const jobTitleOrGroups = parseQuery(jobTitle);
//       console.log("title", jobTitleOrGroups);

//       mustQueries.push({
//         compound: {
//           must: jobTitleOrGroups.map((group) => ({
//             compound: {
//               should: group.map((term) => ({
//                 text: {
//                   path: "jobTitle",
//                   query: term,
//                   // fuzzy: {},
//                 },
//               })),
//             },
//           })),
//         },
//       });
//     }

//     if (country) {
//       mustQueries.push({
//         text: {
//           path: "country",
//           query: country,
//         },
//       });
//     }
//     if (city) {
//       mustQueries.push({
//         text: {
//           path: "city",
//           query: city,
//         },
//       });
//     }
//     if (state) {
//       mustQueries.push({
//         text: {
//           path: "state",
//           query: state,
//         },
//       });
//     }

//     if (keyword) {
//       const orGroups = parseQuery(keyword);
//       console.log("skills", orGroups);

//       mustQueries.push({
//         compound: {
//           must: orGroups.map((group) => ({
//             compound: {
//               should: group.map((term) => ({
//                 text: {
//                   path: "skills",
//                   query: term,
//                   fuzzy: {},
//                 },
//               })),
//             },
//           })),
//         },
//       });
//     }

//     const aggregationPipeline = [
//       {
//         $search: {
//           index: "default",
//           compound: {
//             must: mustQueries,
//           },
//         },
//       },
//     ];

//     const keywordSearchResults = await usermodel.aggregate(
//       aggregationPipeline
//     );
//     const nonUserKeywordResults = await nonUserModel.aggregate(
//       aggregationPipeline
//     );

//     const allResults = [...keywordSearchResults, ...nonUserKeywordResults];
//     if (allResults.length > 0) {
//       res.status(200).json({
//         totalresults: allResults.length,
//         results: allResults,
//         // mustQueries,
//         status: true,
//       });
//     } else {
//       res.status(404).json({ message: "No results Found", status: false });
//     }
//   } catch (error) {
//     console.error("Error during candidate search:", error);
//     res.status(500).json({ error: "Internal Server Error", status: false });
//   }
// },
