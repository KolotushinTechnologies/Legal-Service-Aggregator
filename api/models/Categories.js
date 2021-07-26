const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "sections",
      required: true,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ name: "text", section: "text" });

module.exports = Category = mongoose.model("categories", CategorySchema);
