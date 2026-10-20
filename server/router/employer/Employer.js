const express = require("express");
const router = express.Router();
const employerController = require("../../controller/employer/Employer");
const { Authorization } = require("../../middleware/auth");

router.post("/update/:userId", Authorization, employerController.updateProfile);
router.get("/allEmployers", employerController.getAllEmployers);
router.get("/:userId", employerController.getEmployer);
router.post("/contact/search", employerController.searchEmployer);
router.post("/send/email", Authorization, employerController.sendEmail);
router.post(
  "/read/notifications/:empId",
  Authorization,
  employerController.updateNotifactionRead
);

module.exports = router;
