const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const axios = require("axios");
const client_id = "778mazj65ph3nn";
const client_secret = "teSzaoF4fFmRfOOk";
const redirect_uri = "https://www.linkedin.com/developers/tools/oauth/redirect";
const scope = "email profile";
const crypto = require("crypto");
const employerModel = require("../models/employerModel");
// const session = require("express-session");
const jwt = require("jsonwebtoken");
const { log } = require("console");
const redirect = (code) => {
  const payload = { code };
};
const cron = require("node-cron");
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running LinkedIn token cleanup job...");

    // Get the current date
    const currentDate = new Date();
    const setResult = await employerModel.updateMany(
      { linkedInTokenExpiresAt: { $lte: currentDate } },
      { $set: { linkedInloggedIn: false } }
    );
    
    // Find and delete all expired tokens
    // Step 1: Unset expired LinkedIn fields
    const unsetResult = await employerModel.updateMany(
      { linkedInTokenExpiresAt: { $lte: currentDate } },
      {
        $unset: {
          linkedInToken: "",
          linkedInTokenExpiresAt: "",
        },
      }
    );

    // Step 2: Set loggedIn = false

    console.log(
      `${unsetResult.modifiedCount} tokens unset, ${setResult.modifiedCount} employers marked logged out.`
    );
  } catch (error) {
    console.error("Error in LinkedIn token cleanup job:", error);
  }
});
const controller = {
  async signInWithLinkedIn(req, res) {
    try {
      const url = encodeURI(
        `https://www.linkedin.com/oauth/v2/authorization?client_id=${client_id}&response_type=code&scope=${scope}&redirect_uri=${redirect_uri}`
      );
      res.redirect(url);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async callBack(req, res, code) {
    try {
      // console.log(req.query.code);
      // res.cookie("linkedinAccessToken", req.query.code);
      const accessToken = req.query.code;
      const token = jwt.sign({ accessToken }, process.env.SECRET_KEY); // Encode access token into JWT
      res.redirect(
        `https://www.skillstreamjobs.ca/linkedin/success?token=${token}`
      ); // Store access token in localStorage
      // res.redirect(`${process.env.client}/linkedin/success`);
      // return res.json(req.query.code);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async UScallBack(req, res, code) {
    try {
      // console.log(req.query.code);
      // res.cookie("linkedinAccessToken", req.query.code);
      const accessToken = req.query.code;
      const token = jwt.sign({ accessToken }, process.env.SECRET_KEY); // Encode access token into JWT
      res.redirect(`${process.env.USWEBSITE}/linkedin/success?token=${token}`); // Store access token in localStorage
      // res.redirect(`http://localhost:3001/linkedin/success?token=${token}`);
      // return res.json(req.query.code);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async InCallBack(req, res, code) {
    try {
      const accessToken = req.query.code;
      const token = jwt.sign({ accessToken }, process.env.SECRET_KEY); // Encode access token into JWT
      res.redirect(
        `https://www.skillstreamlabs.com/linkedin/success?token=${token}`
      );
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async linkedinPost(req, res) {
    try {
      const { userId } = req.params;
      let { jwtToken, region } = req.body;
      const getuserDetails = await employerModel.findOne({ userId });
      const token = getuserDetails.linkedInToken;
      let accessToken = "";
      if (jwtToken != "Verified" && jwtToken != null && jwtToken != "true") {
        const decodedToken = jwt.verify(jwtToken, process.env.SECRET_KEY);
        // console.log(decodedToken.accessToken);
        accessToken = decodedToken.accessToken;
      }
      console.log(accessToken);
      if (token) {
        // res.cookie("linkedinAccessToken ", "", { expires: new Date(0) });
        // console.log("Already Stored", token);
        // let configData = "";
        // // // get user details using access token from db
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: "https://api.linkedin.com/v2/userinfo",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // data: configData,
        };

        const { data } = await axios.request(config);
        // console.log(data);
        // post the job using teh sub id from above response(i.e author id)& sending the post text

        let configdata = JSON.stringify({
          author: `urn:li:person:${data.sub}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: req.body.post,
              },
              shareMediaCategory: "ARTICLE",
              media: [
                {
                  status: "READY",
                  description: {
                    text: `Skill Stream - ${req.body.JobTitle}`,
                  },
                  originalUrl: req.body.jobUrl,
                  title: {
                    text: `SkillStream ITjobs - Apply Here for ${req.body.JobTitle}!`,
                  },
                },
              ],
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        });

        let configuration = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://api.linkedin.com/v2/ugcPosts",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: configdata,
        };

        const result = await axios.request(configuration);
        res.status(200).json({
          message: "Posted Successfully",
          status: true,
          id: result.data.id,
        });
      } else if (accessToken) {
        // console.log("need to Stored", accessToken);
        // let configData = "";

        const grant_type = "authorization_code";
        const redirect_uri =
          region === "United States"
            ? `${process.env.SERVER}/api/v1/linkedIn/us/auth/linkedin/callback`
            : region === "India"
            ? `${process.env.SERVER}/api/v1/linkedIn/in/auth/linkedin/callback`
            : `${process.env.SERVER}/api/v1/linkedIn/auth/linkedin/callback`;
        const client_id = "778mazj65ph3nn";
        const client_secret = "qhjGxlcX53I8hcZR";
        // console.log(accessToken);
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${accessToken}`,
        };
        const { data } = await axios.request(config);
        // console.log(data);
        const addToken = await employerModel.updateOne(
          { userId },
          {
            $set: {
              linkedInToken: data.access_token,
              linkedInloggedIn: true,
              linkedInTokenExpiresAt: new Date(
                Date.now() + data.expires_in * 1000
              ),
            },
          }
        );
        //get user details using access token from db
        let userConfig = {
          method: "get",
          maxBodyLength: Infinity,
          url: "https://api.linkedin.com/v2/userinfo",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
          // data: configData,
        };

        const userData = await axios.request(userConfig);
        // console.log(userData.data);
        //   // // post the job using teh sub id from above response(i.e author id)& sending the post text
        let configdata = JSON.stringify({
          author: `urn:li:person:${userData.data.sub}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: req.body.post,
              },
              shareMediaCategory: "ARTICLE",
              media: [
                {
                  status: "READY",
                  description: {
                    text: `Skill Stream - ${req.body.JobTitle}`,
                  },
                  originalUrl: req.body.jobUrl,
                  title: {
                    text: "Skill Stream - Apply Here!",
                  },
                },
              ],
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        });

        let configuration = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://api.linkedin.com/v2/ugcPosts",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access_token}`,
          },
          data: configdata,
        };
        res.cookie("linkedinAccessToken", "", { expires: new Date(0) });

        const result = await axios.request(configuration);
        res.status(200).json({
          message: "Posted Successfully",
          status: true,
          id: result.data.id,
        });
      } else {
        res.status(202).json({ message: "LinkedIn Verification Pending" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async updateLoggedIn(req, res) {
    try {
      const { userId } = req.params;
      let { jwtToken } = req.body;
      if (jwtToken) {
        const addToken = await employerModel.updateOne(
          { userId },
          {
            $set: {
              linkedInloggedIn: true,
            },
          }
        );
      } else {
        res.status(400).json({ message: "Token Missing", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};
module.exports = controller;

// // Define LinkedIn authentication strategy
// passport.use(
//   new LinkedInStrategy(
//     {
//       clientID: "778mazj65ph3nn",
//       clientSecret: "qhjGxlcX53I8hcZR",
//       callbackURL: "https://www.linkedin.com/developers/tools/oauth/redirect",
//       scope: ["email", "openid"], // Specify the required LinkedIn permissions
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Here you can perform actions like saving the user profile or other tasks
//       // For simplicity, we'll just return the access token
//       console.log(accessToken);
//       return done(null, accessToken);
//     }
//   )
// );

// // Call passport.authenticate to initiate the LinkedIn authentication
// passport.authenticate(
//   "linkedin",
//   { session: false },
//   (err, user, info) => {
//     if (err) {
//       console.error("Error during authentication:", err);
//       return res
//         .status(500)
//         .json({ message: "Authentication failed", status: false });
//     }
//     if (!user) {
//       console.error("Authentication failed:", info.message);
//       return res
//         .status(401)
//         .json({ message: "Authentication failed", status: false });
//     }
//     // Authentication successful
//     console.log("Authentication successful");
//     // Respond with JSON
//     res.status(200).json({
//       message: "Authentication successful",
//       status: true,
//       accessToken: user,
//     });
//   }
// )(req, res);
// const grant_type = "authorization_code";
//       const code =
//         "AQSye97ib-AAbPesEAVKwYY_AwGpGFhzQ3YuuOydklG8Jz9BmodtCdHzlVgO_8AokBW0yUxFssw1Qe3mwqPrm5SoL9j5ib-Y7HzIvMuL790iGq7c0KeBBKERcg4VQYXN48IOWuAUx5CDvsHFgjlqg5GzXk2El7J-En41xyomqzAKvdxnFn60b-wf_FO394BVKbb1uX4GXe5xKfMSx7A";
//       const redirect_uri =
//         "http://localhost:8080/api/v1/linkedIn/auth/linkedin/callback";
//       const client_id = "778mazj65ph3nn";
//       const client_secret = "qhjGxlcX53I8hcZR";
//       // console.log(accessToken);
//       let config = {
//         method: "post",
//         maxBodyLength: Infinity,
//         url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${code}`,
//       };

//       const { data } = await axios.request(config);
//       console.log(data);
// const grant_type = "authorization_code";
// const redirect_uri =
//   "http://localhost:8080/api/v1/linkedIn/auth/linkedin/callback";
// const client_id = "778mazj65ph3nn";
// const client_secret = "qhjGxlcX53I8hcZR";
// let config = {
//   method: "post",
//   maxBodyLength: Infinity,
//   url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${accessToken}`,
// };
// const { data } = await axios.request(config);
// console.log(data);
