const jwt = require("jsonwebtoken");
const employerModel = require("../models/employerModel");
const allAccessAdmin = async (req, res, next) => {
  try {
    // console.log(req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      console.log(req.headers.authorization);
      const recivedToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(recivedToken, process.env.REFRESH_KEY);
      const employer = await employerModel.findOne({ email: decoded.email });
      // console.log(decoded);
      if (employer.allAccess && employer.allAccess === true) {
        next();
      } else {
        res
          .status(401)
          .json({ message: "UnAuthorised, You dont have a Admin Access" });
      }
    } else {
      res.status(401).json({ message: "Not authorized, token failed" });
      console.log("Token not sent");
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Token failed / Expired . Try Again!" });
  }
};
module.exports = { allAccessAdmin };
