const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    textMessage: {
      type: String,
      required: isFieldRequired,
    },
    dealMessage: {
      type: Schema.Types.ObjectId,
      ref: "dealings",
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "chats",
    },
    userMessage: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    readMessageUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

function isFieldRequired() {
  return this.dealMessage == null ||
    this.dealMessage == "" ||
    this.dealMessage == {}
    ? true
    : false;
}

module.exports = Message = mongoose.model("messages", MessageSchema);
