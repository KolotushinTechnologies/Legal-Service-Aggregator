//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Connecting additional application services
const mailer = require("../../services/mailer");

// Connecting validation for forms
const validateComplaintsInput = require("../../validation/complaints");

// Initialize Complaints Model
const Complaints = require("../../models/Complaints");

// Initialize User Model
const User = require("../../models/User");

// Initialize Notifications Model
const Notifications = require("../../models/Notifications");

// * @route   GET http://localhost:5000/api/complaints/test
// * @desc    Complaints route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Complaints route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/complaints/:_id
// * @desc    Submitting a user complaint against another user
// * @access  Private
router.post(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateComplaintsInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newComplaints = new Complaints({
      userWhoIsComplaining: req.user._id,
      userViolator: req.params._id,
      textComplaining: req.body.textComplaining,
      chat: req.body.chat,
    });

    newComplaints
      .save()
      .then((complaints) => {
        complaints
          .populate({
            path: "chat",
            populate: {
              path: "author partner administrators",
              select:
                "-password -email -createdAt -updatedAt -favorites -balance -status",
            },
          })
          .populate(
            "userWhoIsComplaining userViolator",
            "email username role _id",
            (err, complaint) => {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: err,
                });
              }

              if (!complaint.userWhoIsComplaining) {
                return res.status(404).json({
                  status: "error",
                  message: "User not found!",
                });
              }

              res.json(complaint);

              User.find({}, function (err, users) {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  });
                }

                const newNotificationNewComplaint = new Notifications({
                  notificationType: "Жалоба",
                  notificationName: `На Вас подали жалобу`,
                  notificationText: `На Вас поступила жалоба от пользователя ${
                    complaint.userWhoIsComplaining &&
                    complaint.userWhoIsComplaining.email
                  } по причине ${
                    complaint.textComplaining
                  }. С уважением, администрация Pandora.`,
                  notificationRecipient: complaint.userViolator,
                });

                newNotificationNewComplaint.save().catch((err) =>
                  res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  })
                );

                users.map((user) => {
                  if (user.role > 0) {
                    mailer.sendMail({
                      from: "kolotushins@gmail.com",
                      to: user.email && user.email,
                      subject: `Жалоба от пользователя ${
                        complaint.userWhoIsComplaining &&
                        complaint.userWhoIsComplaining.email
                      } Pandora`,
                      html: `
                    <h3>Поступила жалоба на пользователя 
                      <span style="color: blue">
                        ${
                          complaint.userViolator && complaint.userViolator.email
                        }
                      </span> 
                      от пользователя <span style="color: blue">
                        ${
                          complaint.userWhoIsComplaining &&
                          complaint.userWhoIsComplaining.email
                        }
                      </span>.</h3> <h4>Текст жалобы:</h4> <p>
                       ${complaint.textComplaining}
                      
                    </p>`,
                    });
                  }
                });
              }).catch((err) =>
                res.status(500).json({
                  status: "err",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );
            }
          );
      })
      .catch((err) =>
        res.status(500).json({
          status: "err",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/complaints
// * @desc    List of complaints submitted by the user
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Complaints.find({ userWhoIsComplaining: req.user._id })
      .sort({ createdAt: "-1" })
      .populate("userWhoIsComplaining userViolator", "email username _id")
      .then((complaints) => {
        if (!complaints) {
          return res.status(404).json({
            status: "error",
            message: "Complaints not found!",
          });
        }

        res.status(200).json(complaints);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/complaints/:_id
// * @desc    Receiving a complaint about a user by ID
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Complaints.findOne({
      userWhoIsComplaining: req.user._id,
      _id: req.params._id,
    })
      .populate("userWhoIsComplaining userViolator", "email username _id")
      .then((complaint) => {
        if (!complaint) {
          return res.status(404).json({
            status: "error",
            message: "Complaint not found!",
          });
        }

        res.status(200).json(complaint);
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
