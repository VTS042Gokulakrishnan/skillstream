const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  status: { type: String, enum: ["draft", "published"] },
  audience: String,
  category: String,
  summary: String,
  author: String,
  authorId: String,
  imageAlt: String,
  seoTitle: String,
  date: String,
  topic: String,
  keywords: Array,
  content: String,
  image: String,
});

module.exports = mongoose.model("blog", userSchema);
