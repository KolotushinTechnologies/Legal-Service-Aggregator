const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const ChatSchema = new Schema(
  {
    partner: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    administrators: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "messages",
    },
  },
  { timestamps: true }
);

module.exports = Chat = mongoose.model("chats", ChatSchema);
