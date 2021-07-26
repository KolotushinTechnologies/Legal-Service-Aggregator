const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DealingsSchema = new Schema(
  {
    typeDealing: {
      type: String,
      default: "Гарант-Сервис Сделка",
    },
    transactionAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    termsOfAtransaction: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    executor: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "transactions",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedByAdmin: {
      type: Boolean,
      default: false,
    },
    rejected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = Dealings = mongoose.model("dealings", DealingsSchema);
