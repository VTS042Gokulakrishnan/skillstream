const { log } = require("console");
const candidateModel = require("../../models/candidateModel");
const nonUserModel = require("../../models/nonUsersModel");
const Aws = require("aws-sdk");
const formidable = require("formidable");
const fs = require("fs");
const moment = require("moment");
const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});

const controller = {
  async updateProfile(req, res) {
    try {
      // Practice entitlements and sessions are written only by server services/scripts.
      if (Object.keys(req.body || {}).some((key) => /^(practice|codingPractice)/i.test(key))) {
        return res.status(400).json({ message: "Practice access cannot be changed through profile updates." });
      }
      const { userId } = req.params;
      const isUserCheck = await candidateModel.findOne({ userId });
      if (isUserCheck) {
        const updateDetails = await candidateModel.updateOne(
          { userId },
          { $set: req.body }
        );
        console.log(updateDetails);
        if (updateDetails.acknowledged) {
          res.status(201).json({
            message: "Successfully updated profile",
            status: true,
          });
        } else {
          res.status(400).json({
            message: "Error in updating the details",
            status: false,
          });
        }
      } else {
        res.status(404).json({ message: "userid  not found ", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },

  async getAllCandidates(req, res) {
    try {
      const getAllUsers = await candidateModel.find({
        role: "Candidate",
      });
      const AllUsers = await nonUserModel.find({});
      console.log(AllUsers);
      const allCandidates = [...getAllUsers, ...AllUsers];

      res.status(200).json({ Candidates: allCandidates });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async getcandidate(req, res) {
    try {
      const { userId } = req.params;
      const getUsers = await candidateModel.find({
        userId,
      });
      // console.log(getUsers);
      if (getUsers.length !== 0) {
        res.status(200).json({
          Candidate: getUsers,
          status: true,
        });
      } else {
        res.status(404).json({ message: "User not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async addCandidateProfileViews(req, res) {
    try {
      const { userId } = req.params;
      const getUsers = await candidateModel.find({
        userId,
      });
      // console.log(getUsers);
      if (getUsers.length !== 0) {
        for (const user of getUsers) {
          const index = user.profileViews.findIndex(
            (view) => view.employerId === req.query.employerId
          );
          if (index !== -1) {
            // If the employer has viewed the profile before, increment the view count
            user.profileViews[index].viewCount =
              user.profileViews[index].viewCount + 1;
            await user.save();
          } else {
            // If it's the first time the employer views the profile, add a new entry
            user.profileViews.push({
              employerId: req.query.employerId,
              viewCount: 1,
              time: moment().format("MMMM D YYYY, h:mm:ss a"),
            });
            await user.save();
          }
        }
        // console.log(moment().format("MMMM D YYYY, h:mm:ss a"));
        res.status(200).json({
          profileViews: getUsers[0]?.profileViews,
          totalViews: getUsers[0]?.profileViews.length,
          status: true,
        });
      } else {
        res.status(404).json({ message: "User not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async searchCandidate(req, res) {
    try {
      const { c } = req.query;
      console.log(c);
      const search = await candidateModel
        .find({
          name: { $regex: c, $options: "i" },
        })
        .select(["email", "name", "image", "_id", "userId"]);
      res.status(200).json(search);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message, status: false });
    }
  }, 
  async getBothCandidate(req, res) {
    try {
      const { userId } = req.params;
      // const { country } = req.body;
      let candidate;
      const getUsers = await candidateModel.findOne({
        _id: userId,
      });

      const nonusers = await nonUserModel.findOne({
        _id: userId,
      });
      if (getUsers) {
        candidate = getUsers;
      } else if (nonusers) {
        candidate = nonusers;
      } else {
        candidate = null;
      }
      // console.log(candidate);
      if (candidate) {
        res.status(200).json({ candidate: candidate, status: true });
      } else {
        res.status(404).json({ message: "User not found", status: false });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Sever Error", error, status: false });
    }
  },
  async editBothCandidate(req, res) {
    try {
      const { userId } = req.params;
      const { name, email, jobTitle, phone_number, state, city, country } =
        req.body;
      console.log(req.body); 
 
      const candidate = await candidateModel.findOne({ _id: userId });
      const nonuser = await nonUserModel.findOne({ _id: userId });
      if (candidate) {
        const updateUser = await candidateModel.updateOne(
          {
            _id: userId,
          },
          {
            $set: {
              name: name,
              email: email,
              jobTitle: jobTitle,
              position: jobTitle,
              state: state,
              city: city,
              country: country,
              phone_number: phone_number,
            },
          }
        );
        console.log(updateUser);
      } else if (nonuser) {
        const updateUser = await nonUserModel.updateOne(
          {
            _id: userId,
          },
          {
            $set: {
              name: name,
              email: email,
              jobTitle: jobTitle,
              state: state,
              city: city,
              country: country,
              phone_number: phone_number,
            },
          }
        );
        console.log(updateUser);
      } else {
        res.status(404).json({ message: "User not found", status: false });
        return;
      }
      res.status(200).json({ message: "Updated Successfully", status: true });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};

module.exports = controller;
