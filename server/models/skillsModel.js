const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userSchema = new schema({
    computer_sciences: Array,
});

module.exports = mongoose.model("skill", userSchema);
