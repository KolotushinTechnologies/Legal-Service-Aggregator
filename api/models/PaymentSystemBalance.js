const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSystemBalanceSchema = new Schema(
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
  { timestamps: true }
);

module.exports = PaymentSystemBalance = mongoose.model(
  "paymentssystembalancenotify",
  PaymentSystemBalanceSchema
);
