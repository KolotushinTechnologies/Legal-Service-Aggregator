const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const encryptAndDecryptPassword = require("../services/encryptPassword");

const UserSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "services",
      },
    ],
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "avatars",
    },
    onlineUser: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    username: {
      type: String,
      minlength: 1,
      maxlength: 40,
      trim: true,
    },
    lastSeen: {
      type: Date,
    },
    paymentMethods: [
      {
        type: Schema.Types.ObjectId,
        ref: "paymentmethods",
      },
    ],
    city: {
      type: String,
    },
    contacts: {
      telegram: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 200,
      },
      info: {
        type: String,
        minlength: 3,
        maxlength: 300,
      },
    },
    rating: {
      type: Number,
      default: 0,
      max: 5,
    },
    assessedDealings: [
      {
        type: Schema.Types.ObjectId,
        ref: "dealings",
      },
    ],
    guarantorService: {
      type: Boolean,
      default: false,
    },
    deposit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    roles: [
      {
        type: String,
        ref: "roles",
      },
    ],
    moneyAtWork: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserSchema.index({ username: "text" });

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  user.password = await encryptAndDecryptPassword.encrypt(user.password);
});

module.exports = User = mongoose.model("users", UserSchema);
