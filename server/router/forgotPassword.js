const express = require("express");
const router = express.Router();
const forgotPasswordController = require("../controller/ForgotPassword");

router.get(
  "/forgotPassword/reset/:id",
  forgotPasswordController.resetPasswordPage
);
router.post("/forgotPassword", forgotPasswordController.forgotPasssowrd);
router.post("/resetPassword/:userId", forgotPasswordController.updateNewPassword);

module.exports = router;
