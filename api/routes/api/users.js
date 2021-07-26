//  Adding basic modules
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const encryptAndDecryptPassword = require("../../services/encryptPassword");

// Connecting additional application services
const mailer = require("../../services/mailer");
const generatePasswordService = require("../../services/generatePasswordService");

// Connecting validation for forms
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Initialize User Model
const User = require("../../models/User");
const Service = require("../../models/Service");

const Role = require("../../models/Role");

// * @route   GET http://localhost:5000/api/users/test
// * @desc    User route testing
// * @access  Public
router.get("/test", async (req, res) => {
  try {
    res.status(200).json({ message: "User route testing was successfully!" });
  } catch (err) {
    res
      .status(400)
      .json({ message: `Something went wrong, please try again! ${err}` });
  }
});

/*
 * First level: Authentication
 */

// * @route   POST http://localhost:5000/api/users/registration
// * @desc    User registration
// * @access  Public
router.post("/registration", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(async (user) => {
      if (user) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists!",
        });
      } else {
        const userRole = await Role.findOne({ value: "USER" });
        const newUser = new User({
          email: req.body.email,
          password: generatePasswordService().toString(),
          roles: [userRole.value],
        });

        newUser
          .save()
          .then((user) => {
            res.json(user);
            // console.log('отправили пароль', encryptAndDecryptPassword.decrypt(
            //   newUser.password
            // ))
            mailer.sendMail({
              from: "pandora.project.work@gmail.com",
              to: newUser.email,
              subject: "Пароль для входа в Pandora",
              html: `Для того чтобы Вам войти в Pandora потребуется пароль, вот: ${encryptAndDecryptPassword.decrypt(
                newUser.password
              )}`,
            });
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
});

// * @route   POST http://localhost:5000/api/users/login
// * @desc    User login / Returning JWT Token
// * @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email })
    .populate("services", "title textContent categories")
    .then((user) => {
      // Check for user
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found!",
        });
      }

      if (password !== encryptAndDecryptPassword.decrypt(user.password)) {
        return res.status(400).json({
          status: "error",
          message: "Email or password entered incorrectly",
        });
      } else {
        // User Matched
        const payload = { id: user._id, roles: user.roles, username: user?.username || false }; // Create JWT Payload
        console.log(user)
        // Sign Token
        jwt.sign(
          payload,
          process.env.SECRET_KEY,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
              role: user.role,
              user,
            });
          }
        );
      }
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   POST http://localhost:5000/api/users/reset-password
// * @desc    Reset password
// * @access  Public
router.post("/reset-password", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found!",
        });
      }

      const { email } = req.body;

      if (user) {
        user.password = generatePasswordService().toString();
      }

      try {
        user.save().then((user) => {
          res.json({
            status: "success",
            message: `New Pandora login password has been sent to ${user.email}`,
          });
          mailer.sendMail({
            from: "Pandora",
            to: email,
            subject: "Новый пароль для входа в Pandora",
            html: `Для того чтобы войти в Pandora Вам потребуется пароль, вот: ${encryptAndDecryptPassword.decrypt(
              user.password
            )}`,
          });
        });
      } catch (err) {
        res.status(400).json({
          error: `Something went wrong, please try again! ${err}`,
        });
      }
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   DELETE http://localhost:5000/api/users/delete-account
// * @desc    Deleting a user account
// * @access  Private
router.delete(
  "/delete-account",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findByIdAndRemove(req.user._id)
      .then(() => {
        res.status(200).json({ success: true });
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

/*
 * Second level: working with a profile
 */

// * @route   GET http://localhost:5000/api/users/profile
// * @desc    Getting your user profile
// * @access  Private
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user._id;

    User.findOne(user)
      .populate("avatar", "url user _id")
      .populate("services")
      .then((userProfile) => {
        if (!userProfile) {
          return res.status(404).json({
            status: "error",
            message: "User Profile not found!",
          });
        }

        res.json(userProfile);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/users/profile/settings
// * @desc    User profile setup
// * @access  Private
router.put(
  "/profile/settings",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user._id;

    await User.findOne(user)
      .then(async (user) => {
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found!",
          });
        }

        const {
          email,
          password,
          username,
          city,
          guarantorService,
          qiwi,
          telegram,
          info,
        } = req.body;

        if (email) {
          user.email = email;
        }

        if (password) {
          user.password = password;
        }

        if (username && username.match(/^[^-. ](?:[\w.]|\.[\w])+[^. -]$/gm)) {
          user.username = username;
        } else if (username !== undefined) {
          return res.status(400).json({
            status: "error",
            message: "Username неверно написан!",
          });
        }

        if (city) {
          user.city = city;
        }

        if (guarantorService) {
          user.guarantorService = guarantorService;
        }

        if (qiwi) {
          user["paymentMethods"].qiwi = req.body.qiwi;
        }

        if (telegram) {
          user["contacts"].telegram = req.body.telegram;
        }

        if (info) {
          user["contacts"].info = req.body.info;
        }

        await user
          .save()
          .then((newUser) => res.json(newUser))
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

// * @route   GET http://localhost:5000/api/users/profile/:_id
// * @desc    Getting profile another user by ID
// * @access  Public
router.get("/profile/:_id", (req, res) => {
  User.findOne({ _id: req.params._id })
    .select("-password -email -updatedAt -favorites -balance -status")
    .populate("avatar", "url user _id")
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found!",
        });
      }

      Service.find({ user: req.params._id, locked: { $ne: true } })
        .populate({
          path: "user",
          select:
            "-password -email -createdAt -updatedAt -favorites -balance -status",
          populate: {
            path: "avatar",
            select: "-createdAt -updatedAt -ext -size -filename -__v",
          },
        })
        .sort({ createdAt: "-1" })
        .then((services) => {
          if (!services) {
            return res.status(404).json({
              status: "error",
              message: "Services not found by user!",
            });
          }

          res.json({
            user,
            // user: {
            // email: user.email,
            // username: user.username,
            // avatar: user.avatar,
            // _id: user._id,
            // payments: user.paymentMethods,
            // guarantorService: user.guarantorService,
            // city: user.city,
            // onlineUser: user.onlineUser,
            // },
            services,
          });
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
});

/*
 * Third level: getting users
 */

// * @route   GET http://localhost:5000/api/users/profiles
// * @desc    Getting all users of an application
// * @access  Public
router.get("/profiles", (req, res) => {
  User.find()
    .select("-password -balance")
    .populate("user", "-password -balance")
    .populate("services", ["categories", "title", "textContent"])
    .populate("avatar", "url user _id")
    .then((users) => {
      if (!users) {
        return res.status(404).json({
          status: "error",
          message: "Users not found!",
        });
      }

      res.json(users);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

module.exports = router;
