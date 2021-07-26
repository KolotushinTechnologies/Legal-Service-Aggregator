const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NewsSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = News = mongoose.model("news", NewsSchema);
