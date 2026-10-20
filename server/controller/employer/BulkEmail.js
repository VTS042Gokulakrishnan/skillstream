const employerModel = require("../../models/employerModel");
const candidateModel = require("../../models/candidateModel");

const controller = {
  async bulkEmail(req, res) {
    try {
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message, status: false });
    }
  },
};
module.exports = controller;
