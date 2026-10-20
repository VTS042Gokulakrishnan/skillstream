const jwt = require("jsonwebtoken");
const employerModel = require("../models/employerModel");
const candidateModel = require("../models/candidateModel");
const Authorization = async (req, res, next) => {
  try {
    // console.log(req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const recivedToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(recivedToken, process.env.REFRESH_KEY);
      // console.log(decoded);
      let user = null;
      if (decoded.role === "Employer") {
        user = await employerModel.findOne({
          email: new RegExp(`^${decoded.email}$`, "i"),
        });
      }

      if (decoded.role === "Candidate") {
        user = await candidateModel.findOne({
          email: new RegExp(`^${decoded.email}$`, "i"),
        });
      }
      // console.log(user._id);
      const currentTime = Math.floor(Date.now() / 1000); // in seconds
      // console.log(user);

      if (user) {
        // console.log(decoded.exp, currentTime);

        // console.log(decoded.exp < currentTime);

        if (decoded.exp > currentTime) {
          req.user = user;
          next();
        } else {
          res.status(401).json({
            message: "Token Expired!, Please Login Again",
            status: false,
          });
        }
      } else {
        res.status(404).json({
          message: "Invalid Request ! User not found ",
          status: false,
        });
      }
    } else {
      res.status(401).json({ message: "UnAuthorized, token failed" });
      console.log("Token not sent");
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Token failed / Expired . Try Again!" });
  }
};
module.exports = { Authorization };
