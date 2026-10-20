const mongoose = require("mongoose");
const locationSchema = new mongoose.Schema({
  country: String,
  states: [
    {
      state: String,
      cities: [String],
    },
  ],
});

module.exports = mongoose.model("locations", locationSchema);
