const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationsSchema = new Schema(
  {
    notificationType: {
      type: String,
      required: true,
    },
    notificationName: {
      type: String,
      required: true,
    },
    notificationText: {
      type: String,
      required: true,
    },
    notificationRecipient: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    notificationRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: Schema.Types.ObjectId,
    },
    payload: {
      type: Schema.Types.ObjectId,
    },
    commentPage: {
      type: Number
    },
    serviceId: {
      type: Schema.Types.ObjectId,
    },
    is_answer: {
      type: Boolean
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Notifications = mongoose.model(
  "notifications",
  NotificationsSchema
);
