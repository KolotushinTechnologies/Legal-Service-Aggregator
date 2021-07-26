const express = require("express");
const router = express.Router();
const passport = require("passport");

// Connecting additional application services
const mailer = require("../../services/mailer");

// Connecting validation for forms
const validateWithdrawalRequestsInput = require("../../validation/withdrawalRequests");

// Initialize Withdrawal Requests Model
const WithdrawalRequests = require("../../models/WithdrawalRequests");
// Initialize User Model
const User = require("../../models/User");

// * @route   GET http://localhost:5000/api/withdrawal-requests/test
// * @desc    Paymets methods route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Withdrawal requests route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/withdrawal-requests
// * @desc    Sending a withdrawal request
// * @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateWithdrawalRequestsInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newWithdrawalRequest = new WithdrawalRequests({
      user: req.user._id,
      replenishmentAmount: req.body.replenishmentAmount,
    });

    newWithdrawalRequest
      .save()
      .then((withdrawalRequest) =>
        withdrawalRequest.populate(
          "user",
          "email username _id",
          (err, result) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }

            if (!result.user) {
              return res.status(404).json({
                status: "error",
                message: "User not found!",
              });
            }

            res.json(result);

            User.find({ role: 1 }, function (err, users) {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                });
              }

              users.filter((user) => {
                if (user.role > 0) {
                  mailer.sendMail({
                    from: "kolotushins@gmail.com",
                    to: user.email,
                    subject: `Запрос на вывод денежных средств от пользователя ${result.user.email}`,
                    html: `<p>Поступил запрос на вывод денежных средств от пользователя <span style="color: blue">${result.user.email}</span> на сумму <span style="color: blue">${result.replenishmentAmount}</span> Рублей.</p>`,
                  });
                }
              });
            });
          }
        )
      )
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/withdrawal-requests
// * @desc    Receipt of all requests for withdrawal of funds
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    WithdrawalRequests.find({ user: req.user._id })
      .sort({ createdAt: "-1" })
      .populate("user", "email username _id")
      .then((withdrawalRequests) => {
        if (!withdrawalRequests) {
          return res.status(404).json({
            status: "error",
            message: "Withdrawal requests not found!",
          });
        }

        res.status(200).json(withdrawalRequests);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/withdrawal-requests/:_id
// * @desc    Receiving application for withdrawal of funds by ID
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    WithdrawalRequests.findOne({ user: req.user._id, _id: req.params._id })
      .then((withdrawalRequest) => {
        if (!withdrawalRequest) {
          return res.status(404).json({
            status: "error",
            message: "Withdrawal request not found!",
          });
        }

        res.status(200).json(withdrawalRequest);
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
