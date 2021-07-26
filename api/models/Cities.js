const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CitySchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
  },
  { timestamps: true }
);

module.exports = City = mongoose.model("cities", CitySchema);
