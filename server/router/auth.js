const express = require("express");
const router = express.Router();
const authController = require("../controller/Auth");
const passport = require("passport");
router.post("/register", authController.register);
router.get("/register/confirmation/:id", authController.checkLink);
router.post("/register/confirmation/resend", authController.resendLink);

//login routes
router.post("/login", authController.login);

router.post("/googleLogin", authController.googleLogin);
// router.get(
//   "/microsoft/login",
//   passport.authenticate("azure_ad_oauth2")
// );
router.post("/microsoft/login", authController.microsoftLogin);
// router.get(
//   "/microsoft/callback",
// //   passport.authenticate("azure_ad_oauth2", {
// //     failureRedirect: "http://localhost:3000",
// //   }),
//   authController.micorsoftCallback
// );

module.exports = router;
