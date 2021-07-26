//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize User Model
const User = require("../../models/User");

// Initialize Service Model
const Service = require("../../models/Service");

// Initialize Favorites Model
const Favorites = require("../../models/Favorites");

// Initialize Dealings Model
const Dealings = require("../../models/Dealings");

// Initialize Transactions Model
const Transactions = require("../../models/Transactions");

// Initialize Payments System Balance Model
const PaymentSystemBalance = require("../../models/PaymentSystemBalance");

// Initialize Complaints Model
const Complaints = require("../../models/Complaints");

// Initialize Notifications Model
const Notifications = require("../../models/Notifications");

// Initialize Withdrawal Requests Model
const WithdrawalRequests = require("../../models/WithdrawalRequests");

// Initialize Pandora's Wallet Model
const PandorasWalletModel = require("../../models/PandorasWallet");

// * @route   GET http://localhost:5000/api/admin-panel/test
// * @desc    User route testing (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/test",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    try {
      res
        .status(200)
        .json({ message: "Admin panel testing was successfully!" });
    } catch (err) {
      res
        .status(400)
        .json({ message: `Something went wrong, please try again! ${err}` });
    }
  }
);

/*
 * First level: working with users
 */

// * @route   GET http://localhost:5000/api/admin-panel/all-users
// * @desc    Getting all users from the database (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/all-users",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    User.find({})
      .sort({ createdAt: "-1" })
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
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/user/:_id
// * @desc    Get user by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/user/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    User.findOne({ _id: req.params._id })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found!",
          });
        }

        res.json(user);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/change-user/:_id
// * @desc    Changing data of all users by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/change-user/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    User.findById(req.params._id)
      .then((user) => {
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
          _id,
          role,
          balance,
          deposit,
          rating,
          city,
          guarantorService,
        } = req.body;

        if (email) {
          user.email = email;
        }

        if (password) {
          user.password = password;
        }

        if (username) {
          user.username = username;
        }

        if (_id) {
          user._id = _id;
        }

        if (user.roles.indexOf("SUPERADMIN") !== -1)
          return res.status(500).json({
            status: "error",
            message: "User with role SUPERADMIN cannot be changed!",
          });
        if (role == 0) {
          // становиться обычным пользователем
          user.roles = ["USER"];
        } else {
          user.roles = ["USER", "ADMIN"];
        }

        if (balance) {
          user.balance = balance;
        }

        if (deposit) {
          user.deposit = deposit;
        }

        if (rating) {
          user.rating = rating;
        }

        if (city) {
          user.city = city;
        }

        if (guarantorService) {
          user.guarantorService = guarantorService;
        }

        user
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

// * @route   PUT http://localhost:5000/api/admin-panel/top-up-user-deposit/:_id
// * @desc    Changing data of all users by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/top-up-user-deposit/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    User.findOne({ _id: req.params._id })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found!",
          });
        }

        const { deposit } = req.body;

        if (deposit) {
          user.deposit += +deposit;
          user
            .save()
            .then((result) => res.status(200).json(result))
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

          const newNotificationTopUpUserDeposit = new Notifications({
            notificationType: "Депозит",
            notificationName: "Депозит пополнен",
            notificationText: `Сообщаем Вам о том, что Ваш депозит был пополнен на сумму ${deposit}. С уважением, администрация Pandora.`,
            notificationRecipient: user,
          });

          newNotificationTopUpUserDeposit.save().catch((err) =>
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

// * @route   DELETE http://localhost:5000/api/admin-panel/delete-user/:_id
// * @desc    Delete user by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/delete-user/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    User.findById(req.params._id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            status: "error",
            message: "User not found!",
          });
        }

        // Delete
        user
          .remove()
          .then(() =>
            res.json({
              success: `${(true, user.email).toUpperCase()}  был удален`,
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

/*
 * Second level: working with user services
 */

// * @route   GET http://localhost:5000/api/admin-panel/all-services
// * @desc    Getting all user services (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/all-services",
  // passport.authenticate("jwt", { session: false }),
  // roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Service.find({})
      .sort({ createdAt: "-1" })
      .populate("user", "email username password _id balance deposit")
      .then((services) => {
        if (!services) {
          return res.status(404).json({
            status: "error",
            message: "Services not found!",
          });
        }

        res.json(services);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/service/:_id
// * @desc    Receiving user service by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/service/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Service.findById(req.params._id)
      .populate("user", "email username password _id balance deposit")
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        res.json(service);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/change-service/:_id
// * @desc    Change user service by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/change-service/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Service.findById(req.params._id)
      .populate("user", "email username password _id balance deposit")
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        const { title, textContent, categories, locked } = req.body;

        if (title) {
          service.title = title;
        }

        if (textContent) {
          service.textContent = textContent;
        }

        if (categories) {
          service.categories = categories.split(";");
        }
        if (typeof locked === "boolean") service.locked = locked;

        service
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

// * @route   PUT http://localhost:5000/api/admin-panel/block-service/:_id
// * @desc    Block user service by ID(for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/block-service/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  async (req, res) => {
    Service.findOne({ _id: req.params._id })
      .populate("user", "email username password _id balance deposit")
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        if (service.locked === false) {
          service.locked += true;
          service
            .save()
            .then((result) => res.status(200).json(result))
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

          const newNotificationServiceBlocked = new Notifications({
            notificationType: "Услуга",
            notificationName: "Услуга заблокирована",
            notificationText:
              "Сообщаем Вам о том, что Ваша услуга была заблокирована в связи с нарушением правил публикации услуг. Скоро Вам напишет менеджер и Вы подробно сможете уточнить причину блокировки. С уважением, администрация Pandora.",
            notificationRecipient: service.user,
          });

          newNotificationServiceBlocked.save().catch((err) =>
            res.status(500).json({
              status: "error",
              message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
            })
          );
        } else if (service.locked) {
          return res.status(400).json({
            status: "error",
            message: "The user's service is already blocked!",
          });
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

// * @route   PUT http://localhost:5000/api/admin-panel/unblock-service/:_id
// * @desc    Unblock user service by ID(for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/unblock-service/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Service.findOne({ _id: req.params._id })
      .populate("user", "email username password _id balance deposit")
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        if (service.locked) {
          service.locked = false;
          service
            .save()
            .then((result) => res.status(200).json(result))
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

          const newNotificationServiceUnblocked = new Notifications({
            notificationType: "Услуга",
            notificationName: "Услуга разблокирована",
            notificationText:
              "Сообщаем Вам о том, что Ваша услуга была разблокирована. Теперь Вы можете редактировать услугу. С уважением, администрация Pandora.",
            notificationRecipient: service.user,
          });

          newNotificationServiceUnblocked.save().catch((err) =>
            res.status(500).json({
              status: "error",
              message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
            })
          );
        } else if (service.locked === false) {
          return res.status(400).json({
            status: "error",
            message: "The user's service is already unlocked!",
          });
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

// * @route   DELETE http://localhost:5000/api/admin-panel/delete-service/:_id
// * @desc    Delete service by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/delete-service/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Service.findById(req.params._id)
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        // Delete
        service
          .remove()
          .then(() =>
            res.json({
              success: `${(true,
              service.title).toUpperCase()} услуга была удалена`,
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

/*
 * Third level: work with favorites users
 */

// * @route   GET http://localhost:5000/api/admin-panel/all-favorites
// * @desc    Getting all the favorites of users (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/all-favorites",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Favorites.find({})
      .sort({ createdAt: "-1" })
      .populate("whoSaved favoriteUser", "email username deposit _id")
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

// * @route   GET http://localhost:5000/api/admin-panel/favorite/:_id
// * @desc    Getting favorite users by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/favorite/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Favorites.findById(req.params._id)
      .populate("whoSaved favoriteUser", "email username deposit _id")
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

// * @route   PUT http://localhost:5000/api/admin-panel/change-favorite/:_id
// * @desc    Change user favorites by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/change-favorite/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Favorites.findById(req.params._id)
      .populate("whoSaved favoriteUser", "email username deposit _id")
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

// * @route   DELETE http://localhost:5000/api/admin-panel/delete-favorite/:_id
// * @desc    Delete user favorites by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/delete-favorite/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Favorites.findById(req.params._id)
      .populate("whoSaved favoriteUser", "email username deposit _id")
      .then((favorite) => {
        if (!favorite) {
          return res.status(404).json({
            status: "error",
            message: "Favorite not found!",
          });
        }

        // Delete
        favorite
          .remove()
          .then(() =>
            res.json({
              success: `${(true,
              favorite.additionalText).toUpperCase()} избранное пользователя ${
                favorite.whoSaved && favorite.whoSaved.email
              } было удалено`,
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

/*
 * Fourth level: work with user deals
 */

// * @route   GET http://localhost:5000/api/admin-panel/all-dealings
// * @desc    Retrieving all user dealings (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/all-dealings",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Dealings.find({})
      .sort({ createdAt: "-1" })
      .populate("customer executor", "email username _id")
      .then((dealings) => {
        if (!dealings) {
          return res.status(404).json({
            status: "error",
            message: "Dealings not found!",
          });
        }

        res.json(dealings);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/dealing/:_id
// * @desc    Receiving user dealings by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/dealing/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Dealings.findById(req.params._id)
      .populate("customer executor", "email username _id")
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        res.json(dealing);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/change-dealing/:_id
// * @desc    Change user dealings by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/change-dealing/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["SUPERADMIN"]),
  (req, res) => {
    Dealings.findById(req.params._id)
      .populate("customer executor", "email username _id")
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        const { transactionAmount, termsOfAtransaction, confirmed, completed } =
          req.body;

        if (transactionAmount) {
          dealing.transactionAmount = transactionAmount;
        }

        if (termsOfAtransaction) {
          dealing.termsOfAtransaction = termsOfAtransaction;
        }

        if (confirmed) {
          dealing.confirmed = confirmed;
        }

        if (completed) {
          dealing.completed = completed;
        }

        dealing
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

// * @route   PUT http://localhost:5000/api/admin-panel/dealings/completed-admin/:_id
// * @desc    Change user dealings by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/dealings/completed-admin/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["SUPERADMIN"]),
  (req, res) => {
    Dealings.findOne({ _id: req.params._id }).then((dealing) => {
      if (!dealing) {
        return res.status(404).json({
          status: "error",
          message: "Dealing not found!",
        });
      }

      if (!dealing.confirmed) {
        return res.status(400).json({
          status: "error",
          message: "The deal is not confirmed by the executor!",
        });
      }

      if (!dealing.completed) {
        return res.status(400).json({
          status: "error",
          message: "The deal was not completed by the customer!",
        });
      }

      if (dealing.completedByAdmin) {
        return res.status(400).json({
          status: "error",
          message: "The deal has already been completed by the administrator!",
        });
      }

      if (dealing.typeDealing === "Гарант-Сервис Сделка") {
        dealing.completedByAdmin += true;
        dealing.save().then((result) => {
          result.populate(
            "customer executor",
            "email username role _id",
            (err, deal) => {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: err,
                });
              }

              res.json(deal);

              // Находим исполнителя, для того чтобы отправить ему его заработок
              User.findOne({ _id: deal.executor })
                .then((userExecutor) => {
                  if (!userExecutor) {
                    return res.status(404).json({
                      status: "error",
                      message: "User Executor not found!",
                    });
                  }

                  // Сумма сделки с учетом 10% Гарант-Фонда Pandora
                  const dealingTransactionAmount = deal.transactionAmount;

                  if (userExecutor.moneyAtWork < dealingTransactionAmount) {
                    return res.status(400).json({
                      status: "error",
                      message:
                        "Недостаточно денежных средств на балансе в поле Деньги В Работе у исполнителя, чтобы завершить сделку!",
                    });
                  }
                  // Снимаем у исполнителя сумму сделки из поля "Деньги в работе"
                  userExecutor.moneyAtWork -= dealingTransactionAmount;
                  // Пополняем баланс исполнителя на сумму сделки, которую он выполнил
                  userExecutor.balance += dealingTransactionAmount;

                  // Сохраняем измененные данные исполнителя
                  userExecutor.save();
                })
                .catch((err) =>
                  res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  })
                );

              Transactions.findOneAndUpdate(
                { _id: dealing.transaction },
                {
                  $set: { status: "Сделка завершена" },
                },
                function (err) {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    });
                  }
                }
              ).catch((err) =>
                res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );
            }
          );
        });
      } else if (dealing.typeDealing === "ДЕПОЗИТ") {
        return res.status(400).json({
          status: "error",
          message:
            "Сделки на депозит могут подтверждать только SUPERADMIN'S! в своем аккаунте!",
        });
      } else {
        return res.status(500).json({
          status: "error",
          message: "Something went wrong!",
        });
      }
    });
  }
);

// * @route   DELETE http://localhost:5000/api/admin-panel/delete-dealing/:_id
// * @desc    Delete user dealings by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/delete-dealing/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["SUPERADMIN"]),
  (req, res) => {
    Dealings.findById(req.params._id)
      .populate("customer executor", "email username _id")
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        // Delete
        dealing
          .remove()
          .then(() =>
            res.json({
              success: `${(true, dealing._id)} сделка пользователей ${
                dealing.customer && dealing.customer.email
              }(customer) и ${
                dealing.executor && dealing.executor.email
              }(executor) была удалена`,
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

/*
 * Fifth level: working with transactions
 */

// * @route   GET http://localhost:5000/api/admin-panel/all-transactions
// * @desc    Retrieving all user transactions (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/all-transactions",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Transactions.find({})
      .sort({ createdAt: "-1" })
      .populate("payerUser recipientUser", "email username deposit _id")
      .then((transactions) => {
        if (!transactions) {
          return res.status(404).json({
            status: "error",
            message: "Transactions not found!",
          });
        }

        res.json(transactions);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/transaction/:_id
// * @desc    Receiving user transactions by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/transaction/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Transactions.findById(req.params._id)
      .populate("payerUser recipientUser", "email username deposit _id")
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).json({
            status: "error",
            message: "Transaction not found!",
          });
        }

        res.json(transaction);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/change-transaction/:_id
// * @desc    Change user transactions by ID (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/change-transaction/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Transactions.findById(req.params._id)
      .populate("payerUser recipientUser", "email username deposit _id")
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).json({
            status: "error",
            message: "Transaction not found!",
          });
        }

        const { status } = req.body;

        if (status) {
          transaction.status = status;
        }

        transaction
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

// * @route   DELETE http://localhost:5000/api/admin-panel/delete-transaction/:_id
// * @desc    Delete user transactions by ID (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/delete-transaction/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Transactions.findById(req.params._id)
      .populate("payerUser recipientUser", "email username deposit _id")
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).json({
            status: "error",
            message: "Transaction not found!",
          });
        }

        // Delete
        transaction
          .remove()
          .then(() =>
            res.json({
              success: `${(true, transaction._id)} транзакция пользователей ${
                transaction.payerUser && transaction.payerUser.email
              }(Payer User) и ${
                transaction.recipientUser && transaction.recipientUser.email
              }(Recipient User) была удалена`,
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

/*
 * Sixth level: work with requests for balance replenishment
 */

// * @route   GET http://localhost:5000/api/admin-panel/payment-system/applications
// * @desc    Receipt of all applications for balance replenishment (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/payment-system/applications",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentSystemBalance.find({})
      .sort({ createdAt: "-1" })
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((paymentRequstes) => {
        if (!paymentRequstes) {
          return res.status(404).json({
            status: "error",
            message: "Payment requsts not found!",
          });
        }

        res.status(200).json(paymentRequstes);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/payment-system/applications/:_id
// * @desc    Receiving an application for replenishing the balance by ID
// * @desc    (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/payment-system/applications/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentSystemBalance.findById(req.params._id)
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((paymentRequest) => {
        if (!paymentRequest) {
          return res.status(404).json({
            status: "error",
            message: "Payment request not found!",
          });
        }

        res.status(200).json(paymentRequest);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/payment-system/applications/:_id
// * @desc    Editing applications for balance replenishment (for administrators only)
// * @desc    Confirmation of filling in the application for balance replenishment
// * @desc    (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/payment-system/applications/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentSystemBalance.findOne({ _id: req.params._id })
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((paymentRequest) => {
        if (!paymentRequest) {
          return res.status(404).json({
            status: "error",
            message: "Payment request has already been completed!",
          });
        }

        User.findOne({ _id: paymentRequest.user }).then((user) => {
          if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found!",
            });
          }

          if (paymentRequest.completed === false) {
            user.balance += paymentRequest.replenishmentAmount;
            user.save().catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

            paymentRequest.completed += true;
            paymentRequest
              .save()
              .then((result) => res.status(200).json(result))
              .catch((err) =>
                res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );

            const newNotificationBalanceTopUp = new Notifications({
              notificationType: "Баланс",
              notificationName: "Баланс пополнен",
              notificationText: `Сообщаем Вам о том, что Ваш баланс пополнен на сумму ${paymentRequest.replenishmentAmount}`,
              notificationRecipient: paymentRequest.user,
            });

            newNotificationBalanceTopUp.save().catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
          } else if (paymentRequest.completed) {
            return res.status(400).json({
              status: "error",
              message:
                "The transaction for replenishment of funds has already been completed",
            });
          }
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

// * @route   DELETE http://localhost:5000/api/admin-panel/payment-system/applications/:_id
// * @desc    Deleting a request for balance replenishment (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/payment-system/applications/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    PaymentSystemBalance.findById(req.params._id)
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((paymentRequest) => {
        if (!paymentRequest) {
          return res.status(404).json({
            status: "error",
            message: "Payment request not found!",
          });
        }

        paymentRequest
          .remove()
          .then(() =>
            res.json({
              success: `${
                (true, paymentRequest._id)
              } заявка на поплнение баланса пользователя ${
                paymentRequest.user && paymentRequest.user.email
              } была удалена`,
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

/*
 * Seventh level: work with requests for withdrawal of funds
 */

// * @route   GET http://localhost:5000/api/admin-panel/withdrawal-requests
// * @desc    Receipt of all requests for withdrawal of funds (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/withdrawal-requests",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    WithdrawalRequests.find({})
      .sort({ createdAt: "-1" })
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((withdrawalRequests) => {
        if (!withdrawalRequests) {
          return res.status(404).json({
            status: "error",
            message: "Withdrawal requests not found!",
          });
        }

        res.status(200).json(withdrawalRequests);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/withdrawal-requests/:_id
// * @desc    Receiving application for withdrawal of funds by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/withdrawal-requests/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    WithdrawalRequests.findOne({ _id: req.params._id })
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((withdrawalRequest) => {
        if (!withdrawalRequest) {
          return res.status(404).json({
            status: "error",
            message: "Withdrawal request not found!",
          });
        }

        res.status(200).json(withdrawalRequest);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/withdrawal-requests/:_id
// * @desc    Editing withdrawal requests (for administrators only)
// * @desc    Confirmation of the request for withdrawal of funds
// * @desc    (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/withdrawal-requests/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    WithdrawalRequests.findOne({ _id: req.params._id })
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((withdrawalRequest) => {
        if (!withdrawalRequest) {
          return res.status(404).json({
            status: "error",
            message: "Withdrawal request not found!",
          });
        }

        User.findOne({ _id: withdrawalRequest.user }).then((user) => {
          if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found!",
            });
          }

          if (
            user.balance >= withdrawalRequest.replenishmentAmount &&
            withdrawalRequest.completed === false
          ) {
            user.balance -= withdrawalRequest.replenishmentAmount;
            user.save().catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

            withdrawalRequest.completed += true;
            withdrawalRequest
              .save()
              .then((result) => res.status(200).json(result))
              .catch((err) =>
                res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );

            const newNotificationOfWithdrawalOfFunds = new Notifications({
              notificationType: "Баланс",
              notificationName: "Вывод средств произошел",
              notificationText: `Сообщаем Вам о том, что вывод средств на сумму ${withdrawalRequest.replenishmentAmount} прошел успешно!`,
              notificationRecipient: withdrawalRequest.user,
            });

            newNotificationOfWithdrawalOfFunds.save().catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
          } else if (user.balance < withdrawalRequest.replenishmentAmount) {
            return res.status(400).json({
              status: "error",
              message: "Insufficient funds to withdraw funds!",
            });
          } else if (withdrawalRequest.completed) {
            return res.status(400).json({
              status: "error",
              message: "Withdrawal request has already been confirmed",
            });
          } else {
            return res.status(400).json({
              status: "error",
              message:
                "Insufficient funds to withdraw funds or the application has already been completed",
            });
          }
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

// * @route   DELETE http://localhost:5000/api/admin-panel/withdrawal-requests/:_id
// * @desc    Deleting a withdrawal request (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/withdrawal-requests/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    WithdrawalRequests.findOne({ _id: req.params._id })
      .populate("user", "email username role deposit rating paymentMethods _id")
      .then((withdrawalRequest) => {
        if (!withdrawalRequest) {
          return res.status(404).json({
            status: "error",
            message: "Withdrawal request not found!",
          });
        }

        withdrawalRequest
          .remove()
          .then(() =>
            res.status(200).json({
              success: `${true}, Заявка на вывод средств пользователя ${
                withdrawalRequest.user && withdrawalRequest.user.email
              } с идентификатором "${withdrawalRequest._id}" была удалена`,
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

/*
 * Eighth level: handling user complaints about other users
 */

// * @route   GET http://localhost:5000/api/admin-panel/complaints/list
// * @desc    Receiving all user complaints about other users (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/complaints/list",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Complaints.find({})
      .sort({ createdAt: "-1" })
      .populate(
        "userWhoIsComplaining userViolator",
        "email username role deposit rating paymentMethods _id"
      )
      .then((complaints) => {
        if (!complaints) {
          return res.status(404).json({
            status: "error",
            message: "Complaints not found!",
          });
        }

        res.status(200).json(complaints);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/complaints/:_id
// * @desc    Receiving a user complaint about another user by ID (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/complaints/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Complaints.findById(req.params._id)
      .populate(
        "userWhoIsComplaining userViolator",
        "email username role deposit rating paymentMethods _id"
      )
      .then((complaint) => {
        if (!complaint) {
          return res.status(404).json({
            status: "error",
            message: "Complaint not found!",
          });
        }

        res.status(200).json(complaint);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/admin-panel/complaints/:_id
// * @desc    Editing a user complaint about another user by ID (for administrators only)
// * @desc    Handling a user complaint about another user (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/complaints/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Complaints.findById(req.params._id)
      .populate(
        "userWhoIsComplaining userViolator",
        "email username role deposit rating paymentMethods _id"
      )
      .then((complaint) => {
        if (!complaint) {
          return res.status(404).json({
            status: "error",
            message: "Complaint not found!",
          });
        }

        const { complaintsApproved } = req.body;

        if (complaintsApproved) {
          complaint.complaintsApproved = complaintsApproved;
        }

        complaint
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

// * @route   DELETE http://localhost:5000/api/admin-panel/complaints/:_id
// * @desc    Removing a user complaint about another user (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/complaints/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Complaints.findById(req.params._id)
      .populate(
        "userWhoIsComplaining userViolator",
        "email username role deposit rating paymentMethods _id"
      )
      .then((complaint) => {
        if (!complaint) {
          return res.status(404).json({
            status: "error",
            message: "Complaint not found!",
          });
        }

        complaint
          .remove()
          .then(() =>
            res.json({
              success: `${(true, complaint._id)} жалоба пользователя ${
                complaint.userWhoIsComplaining &&
                complaint.userWhoIsComplaining.email
              } на пользователя ${
                complaint.userViolator && complaint.userViolator.email
              } по причине "${complaint.textComplaining}" была удалена`,
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

/*
 * Ninth level: work with user notifications
 */

// * @route   GET http://localhost:5000/api/admin-panel/notifications
// * @desc    User receives all their notifications (for administrators only)
// * @access  Private (For administrators only)
router.get(
  "/notifications",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Notifications.find({})
      .then((notifications) => {
        if (!notifications) {
          return res.status(404).json({
            status: "error",
            message: "Notifications not found!",
          });
        }

        res.status(200).json(notifications);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/admin-panel/notifications/:_id
// * @desc    User receives their notifications by ID
// * @access  Private
router.get(
  "/notifications/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Notifications.findOne({ _id: req.params._id })
      .then((notification) => {
        if (!notification) {
          return res.status(404).json({
            status: "error",
            message: "Notification not found!",
          });
        }

        res.status(200).json(notification);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   DELETE http://localhost:5000/api/admin-panel/notifications/:_id
// * @desc    User deletes their notifications by ID
// * @access  Private
router.delete(
  "/notifications/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Notifications.findOne({ _id: req.params._id })
      .then((notification) => {
        if (!notification) {
          return res.status(404).json({
            status: "error",
            message: "Notification not found!",
          });
        }

        notification
          .remove()
          .then(() =>
            res.status(200).json({
              status: "success",
              message: "Notification successfully deleted",
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
