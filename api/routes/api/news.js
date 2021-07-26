const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Connecting validation for forms
const validateServiceInput = require("../../validation/news");

// Initialize News Model
const News = require("../../models/News");
const { populate } = require("../../models/News");

// * @route   GET http://localhost:5000/api/news/test
// * @desc    News route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "News route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/news
// * @desc    Publishing news (for administrators only)
// * @access  Private (For administrators only)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    const { errors, isValid } = validateServiceInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    News.findOne({ textContent: req.body.textContent })
      .then((newsContent) => {
        if (newsContent) {
          return res.status(400).json({
            status: "error",
            message: "News content already exists!",
          });
        }

        const newNewsContent = new News({
          author: req.user._id,
          title: req.body.title,
          textContent: req.body.textContent,
        });

        newNewsContent
          .save()
          .then((result) =>
            result.populate(
              "author",
              "-password -email -createdAt -updatedAt -favorites -balance -status",
              (err, newsResult) => {
                if (err) {
                  res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!newsResult.author) {
                  return res.status(404).json({
                    status: "error",
                    message: "User not found!",
                  });
                }

                res.status(200).json(newsResult);
              }
            )
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

// * @route   GET http://localhost:5000/api/news
// * @desc    Get (view) all news (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    News.find()
      .populate({
        path: "author",
        select:
          "-password -email -createdAt -updatedAt -favorites -balance -status",
        populate: {
          path: "avatar",
          select: "-createdAt -updatedAt -__v",
        },
      })
      .sort({ createdAt: "-1" })
      .then((news) => {
        if (!news) {
          return res.status(404).json({
            status: "error",
            message: "News not found!",
          });
        }

        res.json(news);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/news/blog
// * @desc    Get (view) all news
// * @access  Public
router.get("/blog", (req, res) => {
  News.find()
    .select("-author")
    .sort({ createdAt: "-1" })
    .then((news) => {
      if (!news) {
        return res.status(404).json({
          status: "error",
          message: "News not found!",
        });
      }

      res.json(news);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/news/:_id
// * @desc    Get (view) a news by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    News.findOne({ _id: req.params._id })
      .populate({
        path: "author",
        select:
          "-password -email -createdAt -updatedAt -favorites -balance -status",
        populate: {
          path: "avatar",
          select: "-createdAt -updatedAt -__v",
        },
      })
      .then((news) => {
        if (!news) {
          return res.status(404).json({
            status: "error",
            message: "News not found!",
          });
        }

        res.json(news);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/news/blog/:_id
// * @desc    Get (view) a news by ID for blog
// * @access  Private
router.get(
  "/blog/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    News.findOne({ _id: req.params._id })
      .select("-author")
      .then((news) => {
        if (!news) {
          return res.status(404).json({
            status: "error",
            message: "News not found!",
          });
        }

        res.json(news);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/news/:_id
// * @desc    Updating (editing) the news by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    News.findOne({ _id: req.params._id })
      .then((news) => {
        if (!news) {
          return res.status(404).json({
            status: "error",
            message: "News not found!",
          });
        }

        const { title, textContent } = req.body;

        if (title) {
          news.title = title;
        }

        if (textContent) {
          news.textContent = textContent;
        }

        news
          .save()
          .then((result) =>
            result.populate(
              "author",
              "-password -email -createdAt -updatedAt -favorites -balance -status",
              (err, newsResult) => {
                if (err) {
                  res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                res.status(200).json(newsResult);
              }
            )
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

// * @route   DELETE http://localhost:5000/api/news/:_id
// * @desc    Removing a news by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    News.findOne({ _id: req.params._id })
      .then((news) => {
        if (!news) {
          return res.status(404).json({
            status: "error",
            message: "News not found!",
          });
        }

        // Delete
        news
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
