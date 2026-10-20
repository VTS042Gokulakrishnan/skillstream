const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  currency: String,
  abbreviation: String,
  symbol: String,
});

module.exports = mongoose.model("currency", userSchema);
