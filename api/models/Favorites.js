const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavoritesSchema = new Schema(
  {
    favoriteUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    additionalText: {
      type: String,
    },
    whoSaved: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

module.exports = Favorites = mongoose.model("favorites", FavoritesSchema);
