const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
  maintenance: Boolean,
});

module.exports = mongoose.model("maintennace", userSchema);
