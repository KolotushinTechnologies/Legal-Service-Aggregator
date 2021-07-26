//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Connecting validation for forms
const validateFavoritesInput = require("../../validation/favorites");

// Initialize Favorites Model
const Favorites = require("../../models/Favorites");
const { populate } = require("../../models/Favorites");

// * @route   GET http://localhost:5000/api/favorites/test
// * @desc    Paymets methods route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Favorites route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/favorites
// * @desc    Add a user to favorites
// * @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateFavoritesInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Favorites.findOne({
      whoSaved: req.user._id,
      favoriteUser: req.body.favoriteUser,
    })
      .then((favoriteUser) => {
        if (favoriteUser) {
          return res.status(400).json({
            status: "error",
            message: "Favorite user already exists!",
          });
        } else {
          const newFavoriteUser = new Favorites({
            favoriteUser: req.body.favoriteUser,
            additionalText: req.body.additionalText,
            whoSaved: req.user._id,
          });

          newFavoriteUser
            .save()
            .then((newFavorite) => {
              newFavorite.populate(
                "favoriteUser ",
                "email username deposit rating services guarantorService _id",
                (err, favorite) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    });
                  }

                  if (!favorite.favoriteUser) {
                    return res.status(404).json({
                      status: "error",
                      message: "Favorite user not found!",
                    });
                  }

                  res.json(favorite);
                }
              );
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        }
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/favorites
// * @desc    Get favorites by user
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Favorites.find({ whoSaved: req.user._id })
      .sort({ createdAt: "-1" })
      .populate({
        path: "favoriteUser",
        select:
          "-password -balance -role -paymentMethods -createdAt -updatedAt -__v",
        populate: [
          {
            path: "services",
            select: "-title -textContent -__v",
          },
          {
            path: "avatar",
            select: "-createdAt -updatedAt -__v",
          },
        ],
      })
      .then((favorites) => {
        if (!favorites) {
          return res.status(404).json({
            status: "error",
            message: "Favorites not found!",
          });
        }

        res.json(favorites);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/favorites/:_id
// * @desc    Get favorites by ID
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Favorites.findOne({
      _id: req.params._id,
      whoSaved: req.user._id,
    })
      .populate({
        path: "favoriteUser",
        select:
          "-password -balance -role -paymentMethods -createdAt -updatedAt -__v",
        populate: [
          {
            path: "services",
            select: "-title -textContent -__v",
          },
          {
            path: "avatar",
            select: "-createdAt -updatedAt -__v",
          },
        ],
      })
      .then((favorite) => {
        if (!favorite) {
          return res.status(404).json({
            status: "error",
            message: "Favorite not found!",
          });
        }

        res.json(favorite);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/favorites/:_id
// * @desc    Refresh (change) user's favorites by ID (Own)
// * @access  Private
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Favorites.findOne({
      _id: req.params._id,
      whoSaved: req.user._id,
    })
      .populate({
        path: "favoriteUser",
        select:
          "-password -balance -role -paymentMethods -createdAt -updatedAt -__v",
        populate: {
          path: "services",
          select: "-title -textContent -__v",
        },
      })
      .then((favorite) => {
        if (!favorite) {
          return res.status(404).json({
            status: "error",
            message: "Favorite not found!",
          });
        }

        const { additionalText } = req.body;

        if (additionalText) {
          favorite.additionalText = additionalText;
        }

        if (additionalText === "") {
          favorite.additionalText = "";
        }

        favorite
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

// * @route   DELETE http://localhost:5000/api/favorites/:_id
// * @desc    Delete user favorites by ID (Own)
// * @access  Private
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Favorites.findOne({
      _id: req.params._id,
      whoSaved: req.user._id,
    })
      .then((favorites) => {
        if (!favorites) {
          return res.status(404).json({
            status: "error",
            message: "Favorite not found!",
          });
        }

        // Delete
        favorites
          .remove()
          .then((favorite) =>
            res.json({
              status: "success",
              message: `Favorites "${favorite._id}" successfully deleted`,
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
