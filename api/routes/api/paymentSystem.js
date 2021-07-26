//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Connecting additional application services
const mailer = require("../../services/mailer");

// Connecting validation for forms
const validatePaymentSystemBalanceInput = require("../../validation/paymentSystemBalance");

// Initialize User Model
const User = require("../../models/User");
// Initialize Payment Sytem Balance Notify Model
const PaymentSystemBalance = require("../../models/PaymentSystemBalance");

// * @route   GET http://localhost:5000/api/payment-system/test
// * @desc    Paymets methods route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Paymets system route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/payment-system
// * @desc    The user sends a request to replenish the balance
// * @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePaymentSystemBalanceInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPaymentSystemBalance = new PaymentSystemBalance({
      user: req.user._id,
      replenishmentAmount: req.body.replenishmentAmount,
    });

    newPaymentSystemBalance
      .populate("user", "email username _id")
      .save()
      .then((paymentRequestStatus) =>
        paymentRequestStatus.populate(
          "user",
          "email username _id",
          (err, payReq) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }

            if (!payReq.user) {
              return req.status(404).json({
                status: "err",
                message: "User not found!",
              });
            }

            res.json(payReq);

            User.find({}, function (err, users) {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                });
              }

              users.map((user) => {
                if (user.role > 0) {
                  mailer.sendMail({
                    from: "kolotushins@gmail.com",
                    to: user.email,
                    subject: `Запрос на пополнение баланса от ${payReq.user.email} Pandora`,
                    html: `<h3>Поступил запрос на пополнение баланса от пользователя <span style="color: blue">${payReq.user.email}</span> на сумму <span style="color: blue">${payReq.replenishmentAmount}</span> Рублей.</h3>`,
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

// * @route   GET http://localhost:5000/api/payment-system
// * @desc    Receipt of all applications for balance replenishment
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PaymentSystemBalance.find({ user: req.user._id })
      .sort({ createdAt: "-1" })
      .populate("user", "email username _id")
      .then((paymentRequests) => {
        if (!paymentRequests) {
          return res.status(404).json({
            status: "error",
            message: "Payment requests not found!",
          });
        }

        res.status(200).json(paymentRequests);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/payment-system/:_id
// * @desc    Receiving an application for replenishing the balance by ID
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PaymentSystemBalance.findOne({ user: req.user._id, _id: req.params._id })
      .populate("user", "email username _id")
      .then((paymentRequest) => {
        if (!paymentRequest) {
          return res.status(404).json({
            status: "error",
            message: "Payment request not found!",
          });
        }

        res.status(200).json(paymentRequest);
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
