//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Initialize Transactions Model
const Transactions = require("../../models/Transactions");

// * @route   GET http://localhost:5000/api/transactions/test
// * @desc    User route testing
// * @access  Private
router.get(
  "/test",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      res
        .status(200)
        .json({ message: "Transactions route testing was successfully!" });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
    }
  }
);

// * @route   GET http://localhost:5000/api/transactions
// * @desc    Receiving their transactions by the user
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Transactions.find({
      $or: [{ payerUser: req.user._id }, { recipientUser: req.user._id }],
    })
      .populate("payerUser", "email username")
      .populate("recipientUser", "email username")
      .then((transactions) => {
        if (!transactions) {
          return res.status(404).json({
            status: "error",
            message: "Transactions not found!",
          });
        }

        res.json(transactions);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/transactions/:_id
// * @desc    Get your user transactions by ID
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Transactions.findOne({
      _id: req.params._id,
      $or: [{ payerUser: req.user._id }, { recipientUser: req.user._id }],
    })
      .populate("payerUser", "email username")
      .populate("recipientUser", "email username")
      .then((transaction) => {
        if (!transaction) {
          return res.status(400).json({
            status: "error",
            message: "Transaction not found!",
          });
        }

        res.json(transaction);
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
