const express = require("express");
const router = express.Router();
const employerController = require("../../controller/employer/Employer");
const { Authorization } = require("../../middleware/auth");

router.get("/profile-status", Authorization, (req, res) => {
  if (req.user.role !== "Employer") return res.status(403).json({ message: "Employer access required" });
  const { profileCompleted, companyName, email, image, access, notifications, userId } = req.user;
  res.json({ profileCompleted: profileCompleted === true, companyName, email, image, access, notifications, userId });
});

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
