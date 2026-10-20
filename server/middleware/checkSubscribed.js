const jwt = require("jsonwebtoken");

const checkSubscribe = (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // console.log(req.headers.authorization.split(" ")[1]);
      const recivedToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(recivedToken, process.env.REFRESH_KEY);
      // console.log(decoded);
      if (decoded.subscribed) {
        next();
      } else {
        res.status(401).json({ message: "You dont have a Subscription" });
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
module.exports = { checkSubscribe };
