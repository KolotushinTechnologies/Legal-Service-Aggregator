const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentsSchema = new Schema(
  {
    userComment: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    textComment: {
      type: String,
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "services",
    },
    userResponses: [
      {
        type: Schema.Types.ObjectId,
        ref: "responsescommentsusers",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = Comments = mongoose.model("comments", CommentsSchema);
