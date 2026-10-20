// models/jobCounterModel.js
const mongoose = require("mongoose");

const jobCounterSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true },
  sequence: { type: Number, default: 0 },
});

module.exports = mongoose.model("JobCounter", jobCounterSchema);
