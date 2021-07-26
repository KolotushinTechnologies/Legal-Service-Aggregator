const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResponsesCommentsUsersSchema = new Schema(
  {
    responseUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    responseText: {
      type: String,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "services",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = ResponseCommentsUsers = mongoose.model(
  "responsescommentsusers",
  ResponsesCommentsUsersSchema
);
