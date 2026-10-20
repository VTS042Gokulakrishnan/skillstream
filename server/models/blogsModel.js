const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  date: String,
  topic: String,
  keywords: Array,
  content: String,
  image: String,
});

module.exports = mongoose.model("blog", userSchema);
