const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemoSchema = new Schema(
  {
    nameMemo: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    textMemo: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Memo = mongoose.model("memo", MemoSchema);
