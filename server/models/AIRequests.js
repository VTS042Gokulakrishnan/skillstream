const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  apiRoute: String,
  aiRoute: String,
  request: Object,
  response: Object,
  version: String,
  requestTime: Date,
  responseTime: Date,
  timeTaken: String,
});

module.exports = mongoose.model("AIRequestLog", userSchema);
