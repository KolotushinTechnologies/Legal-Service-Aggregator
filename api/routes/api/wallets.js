const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize Pandoras Wallet Model
const PandorasWallet = require("../../models/PandorasWallet");

// * @route   GET http://localhost:5000/api/wallets/test
// * @desc    Wallets route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Wallets route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   GET http://localhost:5000/api/wallets
// * @desc    Get all Pandoras Wallets (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PandorasWallet.find()
      .then((wallets) => {
        if (!wallets) {
          return res.status(404).json({
            status: "error",
            message: "Pandoras Wallets not found!",
          });
        }

        res.status(200).json(wallets);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/wallets/:_id
// * @desc    Get Pandoras Wallet by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PandorasWallet.findOne({ _id: req.params._id })
      .then((wallet) => {
        if (!wallet) {
          return res.status(404).json({
            status: "error",
            message: "Pandoras Wallet noot found!",
          });
        }

        res.status(200).json(wallet);
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
