const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WithdrawalRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    replenishmentAmount: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = WithdrawalRequests = mongoose.model(
  "withdrawalrequests",
  WithdrawalRequestSchema
);
