const candidateModel = require("../../models/candidateModel");
const VendorModel = require("../../models/vendorModel");
const employerModel = require("../../models/employerModel");
const moment = require("moment");

const controller = {
  async getAllJobAlerts(req, res) {
    try {
      const { userId, role } = req.params;
      if (userId) {
        let userDetail;
        if (role === "Candidate") {
          userDetail = await candidateModel.findOne(
            { userId },
            { jobAlerts: 1, _id: 0 }
          );
        } else {
          userDetail = await VendorModel.findOne(
            { userId },
            { jobAlerts: 1, _id: 0 }
          );
        }

        res.status(200).json({ jobAlerts: userDetail });
      } else {
        res.status(400).json({ error: "User Id is missing" });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
  async deleteAppliedJobs(req, res) {
    try {
      let { jobId, userId, role } = req.params; 
      // console.log(jo);
      if (role === "Candidate") {
        const deleteshortlisted = await candidateModel.updateOne(
          { userId },
          {
            $pull: {
              jobAlerts: { jobId },
            },
          }
        ); 
      } else {
        const deleteshortlisted = await VendorModel.updateOne(
          { userId },
          {
            $pull: {
              jobAlerts: { jobId },
            },
          }
        );
      }
      console.log(deleteshortlisted);
      res.status(200).json({
        message: "Job Alerts Deleted Successfully",
        status: true,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};
module.exports = controller;
