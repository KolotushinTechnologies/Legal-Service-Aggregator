//  Adding basic modules
const express = require("express");
const fs = require("fs");
const router = express.Router();
const passport = require("passport");

// Multer
const multer = require("../../services/multer");

// Initialize Avatars Model
const Avatars = require("../../models/Avatars");

// Initialize User Model
const User = require("../../models/User");

// * @route   GET http://localhost:5000/api/avatars/test
// * @desc    User route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Avatars route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/avatars/profile/avatar-upload
// * @desc    Add user photo
// * @access  Private
router.post(
  "/profile/avatar-upload",
  multer.single("file"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.user._id;
    Avatars.findOne({ user: req.user._id })
      .then((avatar) => {
        if (!avatar) {
          const { file } = req;

          if (!file) {
            return res.status(400).json({
              status: "error",
              message: "No file received!",
            });
          }

          const ext = file.originalname.split(".").pop();

          const fileData = {
            filename: file.path.split("\\").pop(),
            ext: ext,
            url: `${req.protocol}://${
              req.headers.host
            }/images/avatars/${file.path.split("\\").pop()}`,
            user: userId,
          };

          const newAvatar = new Avatars(fileData);

          newAvatar
            .save()
            .then((result) => {
              result.populate(
                "user",
                "_id email username avatar",
                (err, avatarObj) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }

                  User.findOne({ _id: userId })
                    .then((user) => {
                      if (!user) {
                        return res.status(404).json({
                          status: "error",
                          message: "User not found!",
                        });
                      }

                      user.avatar = avatarObj;
                      user.save();
                    })
                    .catch((err) =>
                      res.status(500).json({
                        status: "error",
                        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                      })
                    );

                  res.json(avatarObj);
                }
              );
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        } else if (avatar) {
          Avatars.findOne({ user: userId })
            .then((userAvatar) => {
              if (userAvatar) {
                fs.unlink(
                  `./public/images/avatars/${userAvatar.filename}`,
                  function (err) {
                    if (err) {
                      console.log(err);
                      return res.status(400).json({
                        status: "error",
                        message: err,
                      });
                    }
                  }
                );
                userAvatar.remove();

                const { file } = req;

                if (!file) {
                  return res.status(400).json({
                    status: "error",
                    message: "No file received!",
                  });
                }

                const ext = file.originalname.split(".").pop();

                const fileData = {
                  filename: file.path.split("\\").pop(),
                  ext: ext,
                  url: `${req.protocol}://${
                    req.headers.host
                  }/images/avatars/${file.path.split("\\").pop()}`,
                  user: userId,
                };

                const newAvatar = new Avatars(fileData);

                newAvatar
                  .save()
                  .then((result) => {
                    result.populate(
                      "user",
                      "_id email username avatar",
                      (err, avatarObj) => {
                        if (err) {
                          return res.status(500).json({
                            status: "error",
                            message: err,
                          });
                        }

                        User.findOne({ _id: userId })
                          .then((user) => {
                            if (!user) {
                              return res.status(404).json({
                                status: "error",
                                message: "User not found!",
                              });
                            }

                            user.avatar = avatarObj;
                            user.save();
                          })
                          .catch((err) =>
                            res.status(500).json({
                              status: "error",
                              message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                            })
                          );

                        res.json(avatarObj);
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
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/avatars/profile/avatar
// * @desc    Get user avatar
// * @access  Private
router.get(
  "/profile/avatar",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Avatars.findOne({ user: req.user._id })
      .then((userAvatar) => {
        if (!userAvatar) {
          return res.status(404).json({
            status: "error",
            message: "User avatar not found!",
          });
        }

        res.json(userAvatar);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   DELETE http://localhost:5000/api/avatars/profile/avatar/delete/:_id
// * @desc    Delete user avatar
// * @access  Private
router.delete(
  "/profile/avatar/delete/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Avatars.findOne({ _id: req.params._id, user: req.user._id })
      .then((userAvatar) => {
        if (!userAvatar) {
          return res.status(404).json({
            status: "error",
            message: "User avatar not found!",
          });
        }

        User.updateOne(
          { _id: req.user._id },
          { $unset: { avatar: req.params._id } }
        )
          .then((user) => {
            if (!user) {
              return res.status(404).json({
                status: "error",
                message: "User not found!",
              });
            }
          })
          .catch((err) =>
            res.status(500).json({
              status: "error",
              message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
            })
          );

        fs.unlink(
          `./public/images/avatars/${userAvatar.filename}`,
          function (err) {
            if (err) {
              console.log(err);
              return res.status(400).json({
                status: "error",
                message: err,
              });
            }
          }
        );

        userAvatar
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
