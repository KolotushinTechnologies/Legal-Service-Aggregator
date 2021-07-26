const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AvatarsSchema = new Schema(
  {
    filename: String,
    ext: String,
    url: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Avatars = mongoose.model("avatars", AvatarsSchema);
