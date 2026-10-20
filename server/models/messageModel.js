const mongoose = require("mongoose");
const schema = mongoose.Schema;

const messageSchema = new schema(
  {
    //   sender: { type: String, required: true }, // 'candidate' or 'employer'
    //   recipient: { type: String, required: true }, // 'candidate' or 'employer'
    //   message: { type: String, required: true },
    //   timestamp: { type: Date, default: Date.now },
    message: {
      text: String,
    },
    users: Array,
    sender: String,
    isRead: Boolean,
  }, 
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Message", messageSchema);
