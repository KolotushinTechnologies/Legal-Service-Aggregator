const express = require("express");
const router = express.Router();
const passport = require("passport");

// Initialize Notifications Model
const Notifications = require("../../models/Notifications");
// Initialize Service Model
const Service = require("../../models/Service");
// Initialize Comments Model
const Comments = require("../../models/Comments");

// * @route   GET http://localhost:5000/api/notifications/test
// * @desc    News route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Notifications route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});



function updateReadStatus(res, userId) {
  Notifications.updateMany(
    { notificationRecipient: userId },
    {
      $set: {
        notificationRead: true,
      },
    },
    (err) => {
      if (err) {
        res.status(500).json({ status: "error", message: err });
      }
    }
  );
}

// * @route   GET http://localhost:5000/api/notifications
// * @desc    User receives all their notifications
// * @access  Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Notifications.find({ notificationRecipient: req.user._id })
      .sort({ createdAt: '-1' })
      .then(async (notifications) => {
        updateReadStatus(res, req.user._id)
        try {
          for (let notification of notifications) {
            if (notification.notificationType !== 'Комментарии') continue
            const is_answer = notification.notificationText.includes('ответил на Ваш комментарий')
            notification.is_answer = is_answer
            const serviceId = is_answer ? (await Comments.findOne({ _id: notification.notificationName.match(/[0-9a-zA-Z]+/g)[0] }).populate('service', '_id').select('')).service._id
              : notification.notificationName.match(/[0-9a-zA-Z]+/g)[0]
            const currentComments = await Comments.find({ service: serviceId }).sort({ createdAt: '-1' }).select('_id')
            notification.commentPage = Math.ceil((currentComments.map(comment => comment._id.toString()).indexOf(is_answer ? notification.notificationName.match(/[0-9a-zA-Z]+/g)[0] : notification.payload.toString()) + 1) / 10)
            notification.serviceId = serviceId
          }
        } catch (err) {
          res.status(500).json({
            status: 'error',
            message: `Something went wrong or you entered incorrect data ${err}. Please try again!`
          })
          return
        }
        res.status(200).json(notifications)
      })
      .catch((err) =>
        res.status(500).json({
          status: 'error',
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`
        })
      )
  }
)

// * @route   GET http://localhost:5000/api/notifications/profile
// * @desc    User receives all their notifications
// * @access  Private
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Notifications.find({ notificationRecipient: req.user._id })
      .select('notificationRead')
      .then(async (notifications) => {
        res.status(200).json({
          read: notifications.filter(notification => notification.notificationRead).length,
          unread: notifications.filter(notification => !notification.notificationRead).length
        })
      })
      .catch((err) =>
        res.status(500).json({
          status: 'error',
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`
        })
      )
  }
)

// * @route   GET http://localhost:5000/api/notifications/:_id
// * @desc    User receives their notifications by ID
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Notifications.findOne({
      _id: req.params._id,
      notificationRecipient: req.user._id,
    })
      .then((notification) => {
        if (!notification) {
          return res.status(404).json({
            status: "error",
            message: "Notification not found!",
          });
        }

        res.status(200).json(notification);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   DELETE http://localhost:5000/api/notifications/:_id
// * @desc    ser deletes their notifications by ID
// * @access  Private
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Notifications.findOne({
      _id: req.params._id,
      notificationRecipient: req.user._id,
    })
      .then((notification) => {
        if (!notification) {
          return res.status(404).json({
            status: "error",
            message: "Notification not found!",
          });
        }

        notification
          .remove()
          .then(() =>
            res.status(200).json({
              status: "success",
              message: "Notification successfully deleted",
            })
          )
          .catch((err) =>
            res.status(500).json({
              status: "error",
              message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
            })
          );
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

module.exports = router;
