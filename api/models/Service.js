const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    name: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      min: 5,
    },
    textContent: {
      type: String,
      required: true,
      min: 10,
    },
    categories: {
      type: [String],
      required: true,
      trim: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
    locked: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ title: "text", textContent: "text" });

module.exports = Service = mongoose.model("services", ServiceSchema);
