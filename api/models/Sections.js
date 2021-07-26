const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SectionsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "categories",
      },
    ],
  },
  { timestamps: true }
);

module.exports = Sections = mongoose.model("sections", SectionsSchema);
