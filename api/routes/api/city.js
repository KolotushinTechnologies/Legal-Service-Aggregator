//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize City Model
const City = require("../../models/Cities");

// * @route   GET http://localhost:5000/api/city/test
// * @desc    City route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "City route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

/*
 * First level: CRUD system for cities
 */

// * @route   POST http://localhost:5000/api/city
// * @desc    Create a city (for administrators only)
// * @access  Private (For administrators only)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    City.findOne({ name: req.body.name }).then((city) => {
      if (city) {
        return res.status(400).json({
          status: "error",
          message: "City already exists!",
        });
      }

      const newCity = new City({
        name: req.body.name,
      });

      newCity
        .save()
        .then((result) => res.status(200).json(result))
        .catch((err) =>
          res.status(500).json({
            status: "error",
            message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
          })
        );
    });
  }
);

// * @route   GET http://localhost:5000/api/city
// * @desc    Get (view) all cities
// * @access  Public
router.get("/", (req, res) => {
  City.find()
    .sort({ createdAt: "-1" })
    .then((cities) => {
      if (!cities) {
        return res.status(404).json({
          status: "error",
          message: "Cities not found!",
        });
      }

      res.json(cities);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/city/:_id
// * @desc    Receiving (viewing) a city by ID
// * @access  Public
router.get("/:_id", (req, res) => {
  City.findById(req.params._id)
    .then((city) => {
      if (!city) {
        return res.status(404).json({
          status: "error",
          message: "City not found!",
        });
      }

      res.json(city);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   PUT http://localhost:5000/api/city/:_id
// * @desc    Updating (editing) the city by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    City.findOne({ _id: req.params._id })
      .then((city) => {
        if (!city) {
          return res.status(404).json({
            status: "error",
            message: "City not found!",
          });
        }

        City.findOne({ name: req.body.name })
          .then((nameCity) => {
            if (nameCity) {
              return res.status(400).json({
                status: "error",
                message: "City already exists!",
              });
            }

            const { name } = req.body;

            if (name) {
              city.name = name;
            }

            city
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

// * @route   DELETE http://localhost:5000/api/city/:_id
// * @desc    Removing a city by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    City.findById(req.params._id)
      .then((city) => {
        if (!city) {
          return res.status(404).json({
            status: "error",
            message: "City not found!",
          });
        }

        // Delete
        city
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
