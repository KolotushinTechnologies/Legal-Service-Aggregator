const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ComplaintsSchema = new Schema(
  {
    userWhoIsComplaining: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    userViolator: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    textComplaining: {
      type: String,
      required: true,
    },
    complaintsApproved: {
      type: Boolean,
      default: false,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "chats",
    },
  },
  { timestamps: true }
);

module.exports = UserComplaintToManager = mongoose.model(
  "complaints",
  ComplaintsSchema
);
