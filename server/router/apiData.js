const express = require("express");
const router = express.Router();
const apiRouter = require("../controller/Api");
const maintainModel = require("../models/MaintenanceModel");
const LocationModel = require("../models/LocationModel");

const axios = require("axios");
const fs = require("fs");
const path = require("path");

router.get("/currency", apiRouter.fetchCurrenies);
router.get("/industries", apiRouter.fetchIndustries);
router.get("/skills", apiRouter.fetchSkills);
router.post("/addSkills", apiRouter.addSkills);

router.get("/languages", apiRouter.fetchLanguages);
router.post("/post/blog", apiRouter.postBlogs);

router.get("/blogs/all", apiRouter.fetchBlogs);
router.get("/blog/:id", apiRouter.fetchBlogSingle);
router.post("/verify/captcha", apiRouter.verifyCaptcha);

router.get("/countries", async (req, res) => {
  try {
    const list = await LocationModel.find({}, { country: 1 });
    res.status(200).json({ countries: list.map((c) => c.country) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
});
router.get("/states/:country", async (req, res) => {
  try {
    const { country } = req.params;

    const doc = await LocationModel.findOne({ country });
    if (!doc) return res.status(404).json({ error: "Country not found" });

    res.status(200).json({ states: doc.states.map((s) => s.state) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
});
router.get("/cities/:country/:state", async (req, res) => {
  try {
    const { country, state } = req.params;

    const doc = await LocationModel.findOne({ country });
    if (!doc) return res.status(404).json({ error: "Country not found" });

    const st = doc.states.find((s) => s.state === state);
    if (!st) return res.status(404).json({ error: "State not found" });

    res.status(200).json({ cities: st.cities });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
});
router.get("/download/:filename", (req, res) => {
  const filePath = path.join("/data/upload", req.params.filename);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  // Set headers for download
  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Error downloading file");
    }
  });
});

router.get("/maintenance/status", async (req, res) => {
  try {
    const getMaintenance = await maintainModel.find({});

    res.status(200).json({ data: getMaintenance[0].maintenance, status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error", status: false });
  }
});

module.exports = router;
