const mongoose = require("mongoose");

const aischema = new mongoose.Schema({
    content: {
    type: String,
  },
  role: {
    type: String,
  },
});

const MessageModel = mongoose.model("Message", aischema);

module.exports = MessageModel
