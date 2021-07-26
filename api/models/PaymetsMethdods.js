const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymetsMethodsSchema = Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    paymentMethodUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true }
);

module.exports = PaymetsMethods = mongoose.model(
  "paymentmethods",
  PaymetsMethodsSchema
);
