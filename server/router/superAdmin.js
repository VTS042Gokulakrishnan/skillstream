const express = require("express");
const router = express.Router();
const {
  getUser,
  createUser,
  deleteUser,
  editUser,
} = require("../controller/superAdminAccess");
const { checkAdminAccess } = require("../middleware/admin");
router.get("/get/users/:organisationId", checkAdminAccess, getUser);
router.delete("/delete/user", checkAdminAccess, deleteUser);
router.post("/edit/user", checkAdminAccess, editUser);
router.post("/create/users", checkAdminAccess, createUser);

module.exports = router;
