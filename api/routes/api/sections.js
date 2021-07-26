const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Connecting validation for forms
const validateSectionInput = require("../../validation/sections");

// Initialize Sections Model
const Sections = require("../../models/Sections");

// * @route   GET http://localhost:5000/api/sections/test
// * @desc    Categories route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Sections route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/sections
// * @desc    Create new section (for administrators only)
// * @access  Private (For administrators only)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    const { errors, isValid } = validateSectionInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Sections.findOne({ name: req.body.name })
      .then((section) => {
        if (section) {
          return res.status(400).json({
            status: "error",
            message: "Раздел уже существует!",
          });
        }

        const newSection = new Sections({
          name: req.body.name,
        });

        newSection
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

// * @route   PUT http://localhost:5000/api/sections/:_id
// * @desc    Edit section (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Sections.findOne({ _id: req.params._id })
      .then((section) => {
        if (!section) {
          return res.status(404).json({
            status: "error",
            message: "Section not found!",
          });
        }

        Sections.findOne({ name: req.body.name }).then((nameSection) => {
          if (nameSection) {
            return res.status(400).json({
              status: "error",
              message: "Section name already exists!",
            });
          }

          const { name } = req.body;

          if (name) {
            section.name = name;
          }

          section
            .save()
            .then((result) => res.status(200).json(result))
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        });
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/sections
// * @desc    GET section
// * @access  Public
router.get("/", (req, res) => {
  Sections.find({})
    .populate("categories", "name section")
    .then((sections) => {
      if (!sections) {
        return res.status(404).json({
          status: "error",
          message: "Sections not found!",
        });
      }

      res.status(200).json(sections);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/sections/:_id
// * @desc    GET section by ID
// * @access  Public
router.get("/:_id", (req, res) => {
  Sections.findOne({ _id: req.params._id })
    .then((section) => {
      if (!section) {
        return res.status(404).json({
          status: "error",
          message: "Section not found!",
        });
      }

      res.status(200).json(section);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   DELETE http://localhost:5000/api/sections/:_id
// * @desc    Delete section by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Sections.findOne({ _id: req.params._id })
      .then((section) => {
        if (!section) {
          return res.status(404).json({
            status: "error",
            message: "Section not found!",
          });
        }

        // Delete
        section
          .remove()
          .then(() =>
            res.status(200).json({
              status: true,
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
