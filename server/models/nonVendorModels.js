// const { StreamingQuerystring } = require("formidable/parsers");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  email: String,
  name: String,
});

module.exports = mongoose.model("nonVendors", userSchema);
