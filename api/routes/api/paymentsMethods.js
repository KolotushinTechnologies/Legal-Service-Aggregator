//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize Paymets Methods Model
const PaymentsMethods = require("../../models/PaymetsMethdods");

// Initialize User Model
const User = require("../../models/User");

// * @route   GET http://localhost:5000/api/payment-methods/test
// * @desc    Paymets methods route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Payments methods route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

/*
 * First level: CRUD system for payment methods
 */

// * @route   POST http://localhost:5000/api/payment-methods
// * @desc    Create a payment method (for administrators only)
// * @access  Private (For administrators only)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentsMethods.findOne({ name: req.body.name })
      .then((paymentMethod) => {
        if (paymentMethod) {
          return res.status(400).json({
            status: "error",
            message: "Payment method already exists!",
          });
        }

        const newPaymentMethod = new PaymentsMethods({
          name: req.body.name,
        });

        newPaymentMethod
          .save()
          .then((result) => res.status(200).json(result))
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

// * @route   GET http://localhost:5000/api/payment-methods
// * @desc    Get (view) all payment methods
// * @access  Public
router.get("/", (req, res) => {
  PaymentsMethods.find()
    .then((paymentMethods) => {
      if (!paymentMethods) {
        return res.status(404).json({
          status: "error",
          message: "Payment Methods not found!",
        });
      }

      res.json(paymentMethods);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/payment-methods/:_id
// * @desc    Receiving (viewing) a payment system by ID
// * @access  Public
router.get("/:_id", (req, res) => {
  PaymentsMethods.findById(req.params._id)
    .then((paymentMethod) => {
      if (!paymentMethod) {
        return res.status(404).json({
          status: "error",
          message: "Payment method not found!",
        });
      }

      res.json(paymentMethod);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   PUT http://localhost:5000/api/payment-methods/:_id
// * @desc    Updating (editing) the payment method by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentsMethods.findById(req.params._id)
      .then((paymentMethod) => {
        if (!paymentMethod) {
          return res.status(404).json({
            status: "error",
            message: "Payment method not found!",
          });
        }

        const { name } = req.body;

        if (name) {
          paymentMethod.name = name;
        }

        paymentMethod
          .save()
          .then((result) => res.status(200).json(result))
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

// * @route   DELETE http://localhost:5000/api/payment-methods/:_id
// * @desc    Removing a payment system by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentsMethods.findById(req.params._id)
      .then((paymentMethod) => {
        if (!paymentMethod) {
          return res.status(404).json({
            status: "error",
            message: "Payment method not found!",
          });
        }

        // Delete
        paymentMethod
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

// * @route   PUT http://localhost:5000/api/payment-methods/user-add-payment-method/:_id
// * @desc    User's choice of payment method
// * @access  Private
router.put(
  "/user-add-payment-method/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PaymentsMethods.findOne({ _id: req.params._id })
      .then((paymentMethod) => {
        if (!paymentMethod) {
          return res.status(404).json({
            status: "error",
            message: "Payment method not found!",
          });
        }

        User.findOne({ _id: req.user._id })
          .then((user) => {
            if (!user) {
              return res.status(404).json({
                status: "error",
                message: "User not found!",
              });
            }

            if (
              paymentMethod.paymentMethodUsers.indexOf(req.user._id) === -1 &&
              user.paymentMethods.indexOf(req.params._id) === -1
            ) {
              user.paymentMethods.push(paymentMethod);

              paymentMethod.paymentMethodUsers.push(req.user._id);
            } else {
              return res.status(400).json({
                status: "error",
                message: "Payment method has already been added!",
              });
            }

            user.save();
            paymentMethod
              .save()
              .then((result) => res.status(200).json(result))
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
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/payment-methods/user-delete-payment-method/:_id
// * @desc    Deleting the selected payment method by the user
// * @access  Private
router.put(
  "/user-delete-payment-method/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    PaymentsMethods.findOne({ _id: req.params._id })
      .then((paymentMethod) => {
        if (!paymentMethod) {
          return res.status(404).json({
            status: "error",
            message: "Payment method not found!",
          });
        }

        User.findOne({ _id: req.user._id })
          .then((user) => {
            if (!user) {
              return res.status(404).json({
                status: "error",
                message: "User not found!",
              });
            }

            const payMethodUser = paymentMethod.paymentMethodUsers.indexOf(
              req.user._id
            );
            const payMethod = user.paymentMethods.indexOf(req.params._id);

            if (payMethodUser >= 0 && payMethod >= 0) {
              paymentMethod.paymentMethodUsers.splice(payMethodUser, 1);
              user.paymentMethods.splice(payMethod, 1);
            } else {
              return res.status(400).json({
                status: "error",
                message: "The payment method has already been deleted!",
              });
            }

            user.save();
            paymentMethod
              .save()
              .then((result) => res.status(200).json(result))
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
