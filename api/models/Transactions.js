const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionsSchema = new Schema(
  {
    typeTransaction: {
      type: String,
    },
    payerUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    recipientUser: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = Transactions = mongoose.model(
  "transactions",
  TransactionsSchema
);
