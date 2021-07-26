//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize Category Model
const Category = require("../../models/Categories");

// Initialize Sections Model
const Sections = require("../../models/Sections");

// * @route   GET http://localhost:5000/api/categories/test
// * @desc    Categories route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Categories route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/categories
// * @desc    Create a category (for administrators only)
// * @access  Private (For administrators only)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    const { name, section } = req.body;

    console.log(name.trim().match(/^.{3,}$/g));
    if (name.trim().match(/^.{3,}$/g) === null || typeof section !== "string")
      return res.status(500).json({
        status: "error",
        message: "Body invalid!",
      });
    Category.findOne({ name, section }).then((category) => {
      if (category) {
        return res.status(400).json({
          status: "error",
          message: "Category already exists!",
        });
      }

      const newCategory = new Category({
        name: req.body.name,
        section: req.body.section,
      });

      newCategory
        .save()
        .then((result) => {
          result.populate("section", "_id name", (err, category) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }

            const sectionId = category.section._id;
            const categoryName = category._id;

            Sections.findOneAndUpdate(
              { _id: sectionId },
              {
                $addToSet: {
                  categories: categoryName,
                },
              },
              function (err) {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  });
                }

                res.status(200).json(category);
              }
            );
          });
        })
        .catch((err) =>
          res.status(500).json({
            status: "error",
            message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
          })
        );
    });
  }
);

// * @route   GET http://localhost:5000/api/categories
// * @desc    Get (view) all categories
// * @access  Public
router.get("/", (req, res) => {
  Category.find()
    .sort({ createdAt: "-1" })
    .populate("section", "name")
    .then(async (categories) => {
      if (!categories) {
        return res.status(404).json({
          status: "error",
          message: "Categories not found!",
        });
      }
      const allSection = await Sections.find();

      res.json({
        categories,
        sections: allSection,
      });
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/categories/:_id
// * @desc    Receiving (viewing) a category by ID
// * @access  Public
router.get("/:_id", (req, res) => {
  Category.findById(req.params._id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found!",
        });
      }

      res.json(category);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   PUT http://localhost:5000/api/categories/:_id
// * @desc    Updating (editing) the categories by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Category.findById(req.params._id)
      .then((category) => {
        if (!category) {
          return res.status(404).json({
            status: "error",
            message: "Category not found!",
          });
        }

        Category.findOne({ name: req.body.name })
          .then((nameCategory) => {
            if (nameCategory) {
              return res.status(400).json({
                status: "error",
                message: "Category name already exists!",
              });
            }

            const { name } = req.body;

            if (name) {
              category.name = name;
            }

            category
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
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   DELETE http://localhost:5000/api/categories/:_id
// * @desc    Removing a category by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Category.findById(req.params._id)
      .then((category) => {
        if (!category) {
          return res.status(404).json({
            status: "error",
            message: "Category not found!",
          });
        }

        const sectionId = category.section._id;
        const categoryId = category._id;

        Sections.findOneAndUpdate(
          { _id: sectionId },
          {
            $pull: {
              categories: categoryId,
            },
          },
          function (err) {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              });
            }
          }
        );

        // Delete
        category
          .remove()
          .then(() => res.status(200).json({ status: true }))
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
