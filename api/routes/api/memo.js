const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize Memo Model
const Memo = require("../../models/Memo");

// * @route   GET http://localhost:5000/api/memo/test
// * @desc    Memo route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "Memo route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   GET http://localhost:5000/api/memo
// * @desc    Memo get all (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Memo.find()
      .then((memos) => {
        if (!memos) {
          return res.status(404).json({
            status: "error",
            message: "Memos not found!",
          });
        }

        res.status(200).json(memos);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/memo/:_id
// * @desc    Memo get by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Memo.findOne({ _id: req.params._id })
      .then((memo) => {
        if (!memo) {
          return res.status(404).json({
            status: "error",
            message: "Memo not found!",
          });
        }

        res.status(200).json(memo);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/memo/:_id
// * @desc    Memo edit by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["SUPERADMIN"]),
  (req, res) => {
    Memo.findOne({ _id: req.params._id })
      .then((memo) => {
        if (!memo) {
          return res.status(404).json({
            status: "error",
            message: "Memo not found!",
          });
        }

        const { nameMemo, textMemo } = req.body;

        if (nameMemo) {
          memo.nameMemo = nameMemo;
        }

        if (textMemo) {
          memo.textMemo = textMemo;
        }

        memo
          .save()
          .then((result) => res.json(result))
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

// * @route   DELETE http://localhost:5000/api/memo/:_id
// * @desc    Memo delete by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["SUPERADMIN"]),
  (req, res) => {
    Memo.findOne({ _id: req.params._id })
      .then((memo) => {
        if (!memo) {
          return res.status(404).json({
            status: "error",
            message: "Memo not found!",
          });
        }

        // Delete
        memo
          .remove()
          .then(() => res.json({ success: true }))
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
