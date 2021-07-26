const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadFileSchema = new Schema(
  {
    filename: String,
    size: Number,
    ext: String,
    url: String,
    message: {
      type: Schema.Types.ObjectId,
      ref: "messages",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = UploadFile = mongoose.model("uploadfile", UploadFileSchema);
