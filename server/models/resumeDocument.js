const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true, index: true },
  title: { type: String, required: true, maxlength: 100 },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  template: { type: String, required: true },
  settings: { type: mongoose.Schema.Types.Mixed, required: true },
  revision: { type: Number, default: 1 },
}, { timestamps: true });
schema.index({ owner: 1, updatedAt: -1 });
module.exports = mongoose.model("ResumeDocument", schema);
