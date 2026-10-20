const passport = require("passport");
const AzureOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const User = require("../models/employerModel");
const axios = require("axios");

passport.serializeUser((user, done) => {
  done(null, user.id); // stores user.id in session
});

passport.deserializeUser((user, done) => {
  done(null, user); // just return it from session
});

passport.use(
  new AzureOAuth2Strategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/v1/auth/microsoft/callback",
      authorizationURL:
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      scope: ["https://graph.microsoft.com/user.read"],
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        // console.log("Access Token:", accessToken);
        const userInfo = await axios.get(
          "https://graph.microsoft.com/v1.0/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const microsoftUser = userInfo.data;
        const email = microsoftUser.mail || microsoftUser.userPrincipalName;

        if (!email) {
          return done(new Error("Email not found in Microsoft profile"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          // You can optionally create the user here
          user = await User.create({
            name: microsoftUser.displayName,
            email,
            // Add any other fields if needed
          });
        }

        // return done(null, user);
      } catch (error) {
        console.error(
          "Error fetching user info:",
          error.response?.data || error.message
        );

        return done(error, null);
      }
    }
  )
);
