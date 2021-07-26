//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Connecting additional application services
const mailer = require("../../services/mailer");

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Connecting validation for forms
const validateDealingsInput = require("../../validation/dealings");

// Initialize Dealings Model
const Dealings = require("../../models/Dealings");

// Initialize User Model
const User = require("../../models/User");

// Initialize Transactions Model
const Transactions = require("../../models/Transactions");

// Initialize Notifications Model
const Notifications = require("../../models/Notifications");

// Initialize Pandoras Wallet Model
const PandorasWalletModel = require("../../models/PandorasWallet");

// * @route   GET http://localhost:5000/api/dealings/test
// * @desc    Dealings route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    const newWallet = new PandorasWalletModel({
      nameWallet: "Pandora Wallet Реклама",
    });

    newWallet.save();
    res
      .status(200)
      .json({ message: "Dealings route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   GET http://localhost:5000/api/dealings
// * @desc    Receiving (viewing) open transactions of the user (Own)
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Dealings.find({
      $or: [{ executor: req.user._id }, { customer: req.user._id }],
    })
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

// * @route   GET http://localhost:5000/api/dealings/:_id
// * @desc    Search for a deal by ID (Own)
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Dealings.findOne({
      _id: req.params._id,
      $or: [{ executor: req.user._id }, { customer: req.user._id }],
    })
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

// * @route   POST http://localhost:5000/api/dealings
// * @desc    Conclusion of a transaction between the customer and the contractor
// * @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateDealingsInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    User.findOne({ _id: req.user._id }).then((userCustomer) => {
      if (!userCustomer) {
        return res.status(404).json({
          status: "error",
          message: "User not found!",
        });
      }

      if (req.body.transactionAmount > userCustomer.balance) {
        return res.status(400).json({
          status: "error",
          message:
            "Insufficient funds to conclude a deal! Send a request to top up your balance in your Personal Account!",
        });
      }

      const newDealings = new Dealings({
        typeDealing: req.body.typeDealing,
        transactionAmount: req.body.transactionAmount,
        termsOfAtransaction: req.body.termsOfAtransaction,
        customer: req.user._id,
        executor: req.body.executor,
      });

      newDealings
        .save()
        .then((dealing) => {
          dealing.populate(
            "customer executor",
            "email username role _id",
            (err, dealingPayload) => {
              if (err) {
                return res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                });
              }

              if (!dealingPayload.customer) {
                return res.status(404).json({
                  status: "error",
                  message: "Customer not found!",
                });
              }

              if (!dealingPayload.executor) {
                return res.status(404).json({
                  status: "error",
                  message: "Executor not found!",
                });
              }

              res.json(dealingPayload);

              const newTransaction = new Transactions({
                typeTransaction: dealingPayload.typeDealing,
                payerUser: dealing.customer,
                recipientUser: dealing.executor,
                transactionAmount: dealing.transactionAmount,
                status: "Ожидание подтверждения сделки",
              });

              newTransaction.save().catch((err) =>
                res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );

              dealingPayload.transaction = newTransaction;
              dealingPayload.save();

              const newNotificationNewDealing = new Notifications({
                notificationType: "Сделка",
                notificationName: "С Вами хотят заключить сделку",
                notificationText: `Вам поступил запрос на заключение сделки с пользователем ${dealingPayload.customer.email} на сумму ${dealing.transactionAmount}. С уважением, администрация Pandora.`,
                notificationRecipient: dealingPayload.executor,
              });

              newNotificationNewDealing.save().catch((err) =>
                res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );

              mailer.sendMail({
                from: "kolotushins@gmail.com",
                to: dealingPayload.executor.email,
                subject: `Пользователь ${dealingPayload.customer.email} хочет заключить сделку с Вами в Pandora`,
                html: `<h3>Вам поступил запрос на заключение сделки с пользователем <span style="color: blue">${dealingPayload.customer.email}</span> на сумму <span style="color: blue">${dealing.transactionAmount}</span> Рублей.</h3>`,
              });
            }
          );
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

// * @route   PUT http://localhost:5000/api/dealings/confirm/:_id
// * @desc    Confirmation of the transaction by another user
// * @access  Private
router.put(
  "/confirm/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    Dealings.findOne({ _id: req.params._id, executor: req.user._id })
      .then(async (dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        const userRole = await User.findOne({
          _id: dealing.executor,
          roles: "SUPERADMIN",
        }).select("roles username email");

        if (
          dealing.confirmed === false &&
          dealing.rejected === false &&
          dealing.typeDealing === "Гарант-Сервис Сделка"
        ) {
          // Процент Гарант-Фонда Pandora (10%)
          const fundGuarantorPercentage = 10;
          // Сумма, которая пойдет на Гарант-Фонд Pandora
          const guarantFundPandora =
            (dealing.transactionAmount / 100) * fundGuarantorPercentage;
          // Сумма сделки за вычетом 10% Гарант-Фонда Pandora
          const dealingTransactionAmount =
            dealing.transactionAmount - guarantFundPandora;

          // Находим заказчика сделки, и если все успешно, то снимаем денежные средства по транзакции
          User.findOne({ _id: dealing.customer })
            .then((userCustomer) => {
              if (!userCustomer) {
                return res.status(404).json({
                  status: "error",
                  message: "User Customer not found!",
                });
              }

              if (userCustomer.balance < dealing.transactionAmount) {
                return res.status(400).json({
                  status: "error",
                  message:
                    "У заказчика недостаточно денежных средств чтобы начать сделку!",
                });
              }

              // Снимаем денежные средства заказчика
              userCustomer.balance =
                userCustomer.balance - dealing.transactionAmount;
              // Сумма сделки идет в поле "Деньги в работе" у заказчика
              userCustomer.moneyAtWork += dealingTransactionAmount;

              // Находим кошелек Гарант-Фонд Pandora, чтобы отправить комиссию 10% со сделки
              PandorasWalletModel.findOne({
                nameWallet: "Pandora Wallet Гарант Фонд",
              })
                .then((wallet) => {
                  if (!wallet) {
                    return res.status(404).json({
                      status: "error",
                      message: "Wallet not found!",
                    });
                  }

                  // Пополняем баланс кошелька Гарант-Фонд Pandora
                  wallet.balanceWallet += guarantFundPandora;

                  // Сохраняем
                  wallet.save();
                })
                .catch((err) =>
                  res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  })
                );

              // Находим транзакцию, по которой у нас записана сделка, для того чтобы изменить сумму траанзакции
              Transactions.findOne({ _id: dealing.transaction })
                .then((transaction) => {
                  if (!transaction) {
                    return res.status(404).json({
                      status: "error",
                      message: "Transaction not found!",
                    });
                  }

                  // Изменяем сумму транзакции за вычетом 10% Гарнт-Фонда Pandora
                  transaction.transactionAmount = dealingTransactionAmount;

                  // Сохраняем
                  transaction.save();
                })
                .catch((err) =>
                  res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  })
                );

              // После всех вычислений, сохраняем результат с балансом заказчика
              userCustomer.save();
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

          // Находим сделку, над которой мы работаем, для того чтобы изменить сумму сделки
          Dealings.findOneAndUpdate(
            { _id: dealing._id },
            { $set: { transactionAmount: dealingTransactionAmount } },
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
          // Подтверждаем сделку, если все условия соблюдены
          dealing.confirmed += true;

          dealing
            .save()
            .then((result) => {
              result.populate(
                "customer executor",
                "email username role _id",
                (err, dealingPayload) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }

                  if (!dealingPayload.customer) {
                    return res.status(404).json({
                      status: "error",
                      message: "Customer not found!",
                    });
                  }

                  if (!dealingPayload.executor) {
                    return res.status(404).json({
                      status: "error",
                      message: "Executor not found!",
                    });
                  }

                  res.json(dealingPayload);

                  // Изменяем статус транзакци на "Сделка подтверждена"
                  Transactions.findOneAndUpdate(
                    { _id: dealingPayload.transaction },
                    {
                      $set: {
                        status:
                          "Сделка подтверждена, транзакция прошла успешно с учетом 10% Гарант-Фонда Pandora",
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
                  ).catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  const newNotificationDealingConfirmed = new Notifications({
                    notificationType: "Сделка",
                    notificationName: `Вашу сделку №${dealingPayload._id} подтвердили`,
                    notificationText: `Вы отправляли запрос на заключение сделки пользователю ${dealingPayload.executor.email} на сумму ${dealingPayload.transactionAmount}. Пользователь ${dealingPayload.executor.email} подтвердил заключение сделки №${dealingPayload._id} с Вами. Желаем удачной вам сделки! С уважением, администрация Pandora.`,
                    notificationRecipient: dealingPayload.customer,
                  });

                  newNotificationDealingConfirmed.save().catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  mailer.sendMail({
                    from: "kolotushins@gmail.com",
                    to: dealingPayload.customer.email,
                    subject: `Пользователь ${dealingPayload.executor.email} подтвердил заключение сделки с Вами`,
                    html: `<h3>Вы отправляли запрос на заключение сделки пользователю <span style="color: blue">${dealingPayload.executor.email}</span> на сумму <span style="color: blue">${dealingPayload.transactionAmount}</span> Рублей.</h3> Пользователь ${dealingPayload.executor.email} подтвердил заключение сделки №${dealingPayload._id} с Вами. Желаем удачной вам сделки!`,
                  });
                }
              );
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        } else if (
          dealing.confirmed === false &&
          dealing.rejected === false &&
          dealing.typeDealing === "Депозит" &&
          userRole
        ) {
          // Находим заказчика для того, чтобы с его баланса отправить деньги которые он указал в сумме сделки на его депозит
          User.findOne({ _id: dealing.customer }).then((userCustomer) => {
            if (!userCustomer) {
              return res.status(404).json({
                status: "error",
                message: "User customer not found!",
              });
            }

            if (userCustomer.balance < dealing.transactionAmount) {
              return res.status(400).json({
                status: "error",
                message:
                  "У заказчика недостаточно средств для пополнения депозита!",
              });
            }

            // Снимаем сумму сделки с баланса заказчика
            userCustomer.balance =
              userCustomer.balance - dealing.transactionAmount;
            // Сумма, снятая с баланса заказчика идет в поле deposit
            userCustomer.deposit += dealing.transactionAmount;

            userCustomer.save();
          });

          // Подтверждаем сделку, если все условия соблюдены
          dealing.confirmed += true;
          dealing.completed += true;
          dealing.completedByAdmin += true;

          dealing
            .save()
            .then((result) => {
              result.populate(
                "customer executor",
                "email username role _id",
                (err, dealingPayload) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }

                  if (!dealingPayload.customer) {
                    return res.status(404).json({
                      status: "error",
                      message: "Customer not found!",
                    });
                  }

                  if (!dealingPayload.executor) {
                    return res.status(404).json({
                      status: "error",
                      message: "Executor not found!",
                    });
                  }

                  res.json(dealingPayload);
                  // Изменяем стутус транзакции сделки
                  Transactions.findOneAndUpdate(
                    { _id: dealingPayload.transaction },
                    {
                      $set: {
                        status:
                          "Сделка на пополнение депозита подтверждена администратором, транзакция прошла успешно",
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
                  ).catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  const newNotificationDealingConfirmed = new Notifications({
                    notificationType: "Депозит",
                    notificationName: `Вашу сделку на пополнение депозита №${dealingPayload._id} подтвердили`,
                    notificationText: `Вы отправляли запрос на заключение сделки на пополнение депозита на сумму ${dealingPayload.transactionAmount}. Администратор ${dealingPayload.executor.email} подтвердил заключение сделки №${dealingPayload._id} с Вами. Желаем удачной вам сделки! С уважением, администрация Pandora.`,
                    notificationRecipient: dealingPayload.customer,
                  });

                  newNotificationDealingConfirmed.save().catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  mailer.sendMail({
                    from: "kolotushins@gmail.com",
                    to: dealingPayload.customer.email,
                    subject: `Пользователь ${dealingPayload.executor.email} подтвердил заключение сделки с Вами`,
                    html: `<h3>Вы отправляли запрос на заключение сделки на пополнение депозита на сумму на сумму <span style="color: blue">${dealingPayload.transactionAmount}</span> Рублей.</h3> ПАдминистратор ${dealingPayload.executor.email} подтвердил заключение сделки №${dealingPayload._id} с Вами. Желаем удачной вам сделки! С уважением, администрация Pandora.`,
                  });
                }
              );
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        } else if (
          dealing.confirmed === false &&
          dealing.rejected === false &&
          dealing.typeDealing === "Депозит" &&
          !userRole
        ) {
          return res.status(400).json({
            status: "success",
            message:
              "Подтверждать сделки на депозит могут только SUPERADMIN'S!",
          });
        } else if (
          dealing.confirmed === false &&
          dealing.rejected === false &&
          dealing.typeDealing === "Реклама" &&
          userRole
        ) {
          // Находим заказчика для того, чтобы с его баланса отправить деньги которые он указал в сумме сделки на кошелек Pandora
          User.findOne({ _id: dealing.customer }).then((userCustomer) => {
            if (!userCustomer) {
              return res.status(404).json({
                status: "error",
                message: "User customer not found!",
              });
            }

            if (userCustomer.balance < dealing.transactionAmount) {
              return res.status(400).json({
                status: "error",
                message:
                  "У заказчика недостаточно средств для пополнения депозита!",
              });
            }

            // Снимаем сумму сделки с баланса заказчика
            userCustomer.balance =
              userCustomer.balance - dealing.transactionAmount;

            // Находим кошелек Реклама Pandora, чтобы отправить комиссию 10% со сделки
            PandorasWalletModel.findOne({
              nameWallet: "Pandora Wallet Реклама",
            })
              .then((wallet) => {
                if (!wallet) {
                  return res.status(404).json({
                    status: "error",
                    message: "Wallet not found!",
                  });
                }

                // Пополняем баланс кошелька Реклама Pandora
                wallet.balanceWallet += dealing.transactionAmount;

                // Сохраняем
                wallet.save();
              })
              .catch((err) =>
                res.status(500).json({
                  status: "error",
                  message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                })
              );

            userCustomer.save();
          });

          // Подтверждаем сделку, если все условия соблюдены
          dealing.confirmed += true;
          dealing.completed += true;
          dealing.completedByAdmin += true;

          dealing
            .save()
            .then((result) => {
              result.populate(
                "customer executor",
                "email username roles _id",
                (err, dealingPayload) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }

                  if (!dealingPayload.customer) {
                    return res.status(404).json({
                      status: "error",
                      message: "Customer not found!",
                    });
                  }

                  if (!dealingPayload.executor) {
                    return res.status(404).json({
                      status: "error",
                      message: "Executor not found!",
                    });
                  }

                  res.json(dealingPayload);
                  // Изменяем стутус транзакции сделки
                  Transactions.findOneAndUpdate(
                    { _id: dealingPayload.transaction },
                    {
                      $set: {
                        status:
                          "Сделка на оплату рекламы подтверждена администратором, транзакция прошла успешно",
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
                  ).catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  const newNotificationDealingConfirmed = new Notifications({
                    notificationType: "Депозит",
                    notificationName: `Вашу сделку на оплату рекламы №${dealingPayload._id} подтвердили`,
                    notificationText: `Вы отправляли запрос на заключение сделки на оплату рекламы на сумму ${dealingPayload.transactionAmount}. Администратор ${dealingPayload.executor.email} подтвердил заключение сделки №${dealingPayload._id} с Вами. Желаем удачной вам сделки! С уважением, администрация Pandora.`,
                    notificationRecipient: dealingPayload.customer,
                  });

                  newNotificationDealingConfirmed.save().catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  mailer.sendMail({
                    from: "kolotushins@gmail.com",
                    to: dealingPayload.customer.email,
                    subject: `Пользователь ${dealingPayload.executor.email} подтвердил заключение сделки с Вами`,
                    html: `<h3>Вы отправляли запрос на заключение сделки на оплату рекламы на сумму на сумму <span style="color: blue">${dealingPayload.transactionAmount}</span> Рублей.</h3> Администратор ${dealingPayload.executor.email} подтвердил заключение сделки №${dealingPayload._id} с Вами. Желаем удачной вам сделки! С уважением, администрация Pandora.`,
                  });
                }
              );
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        } else if (
          dealing.confirmed === false &&
          dealing.rejected === false &&
          dealing.typeDealing === "Реклама" &&
          !userRole
        ) {
          return res.status(400).json({
            status: "success",
            message:
              "Подтверждать сделки на рекламу могут только SUPERADMIN'S!",
          });
        } else if (dealing.confirmed && dealing.rejected === false) {
          return res.status(400).json({
            status: "error",
            message:
              "The deal has already been confirmed, it will be impossible to cancel the confirmation!",
          });
        } else if (dealing.rejected) {
          return res.status(400).json({
            status: "error",
            message:
              "You have already abandoned the deal, in order to conclude a deal with a client, you need to contact him so that he sends a second request to conclude a deal with you!",
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

// * @route   PUT http://localhost:5000/api/dealings/reject/:_id
// * @desc    Reject of the transaction by another user
// * @access  Private
router.put(
  "/reject/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Dealings.findOne({
      _id: req.params._id,
      executor: req.user._id,
    })
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        if (
          dealing.confirmed === false &&
          dealing.rejected === false &&
          dealing.typeDealing === "Гарант-Сервис Сделка"
        ) {
          dealing.rejected += true;

          dealing
            .save()
            .then((result) => {
              result.populate(
                "customer executor",
                "email username role _id",
                (err, dealingPayload) => {
                  if (err) {
                    return res.status(500).json({
                      status: "error",
                      message: err,
                    });
                  }

                  if (!dealingPayload.customer) {
                    return res.status(404).json({
                      status: "error",
                      message: "Customer not found!",
                    });
                  }

                  if (!dealingPayload.executor) {
                    return res.status(404).json({
                      status: "error",
                      message: "Executor not found!",
                    });
                  }

                  res.json(dealingPayload);

                  Transactions.findOneAndUpdate(
                    { _id: dealingPayload.transaction._id },
                    {
                      $set: { status: "Сделка отклонена" },
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

                  const newNotificationDealingRejected = new Notifications({
                    notificationType: "Сделка",
                    notificationName: `Вашу сделку №${dealingPayload._id} отклонили`,
                    notificationText: `Вы отправляли запрос на заключение сделки пользователю ${dealingPayload.executor.email} на сумму ${dealingPayload.transactionAmount}. Пользователь ${dealingPayload.executor.email} отклонил заключение сделки №${dealingPayload._id} с Вами. С уважением, администрация Pandora.`,
                    notificationRecipient: dealingPayload.customer,
                  });

                  newNotificationDealingRejected.save().catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                  mailer.sendMail({
                    from: "kolotushins@gmail.com",
                    to: dealingPayload.customer.email,
                    subject: `Пользователь ${dealingPayload.executor.email} отклонил заключение сделки с Вами`,
                    html: `<h3>Вы отправляли запрос на заключение сделки пользователю <span style="color: blue">${dealingPayload.executor.email}</span> на сумму <span style="color: blue">${dealingPayload.transactionAmount}</span> Рублей.</h3> Пользователь ${dealingPayload.executor.email} отклонил заключение сделки №${dealingPayload._id} с Вами. С уважением, администрация Pandora.`,
                  });
                }
              );
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );
        } else if (dealing.confirmed) {
          return res.status(400).json({
            status: "error",
            message:
              "The deal has already been confirmed, it will be impossible to cancel the confirmation!",
          });
        } else if (dealing.rejected) {
          return res.status(400).json({
            status: "error",
            message:
              "The deal has already been declined, it will be impossible to cancel the refusal!",
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

// * @route   PUT http://localhost:5000/api/dealings/completed/:_id
// * @desc    Completion of the transaction by the user who started it
// * @desc    (And also, transfer of funds to the account of the executor)
// * @access  Private
router.put(
  "/completed/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Dealings.findOne({ _id: req.params._id, customer: req.user._id })
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        // Deal confirmation data
        const confirmedDealing = dealing.confirmed;
        // Deal completion data
        const completedDealing = dealing.completed;

        // If the deal has already been completed, the user will receive an error message stating that the deal cannot be closed because it has already been completed
        if (completedDealing) {
          return res.status(400).json({
            status: "error",
            message:
              "The deal has already been completed, it will be impossible to cancel the completion!",
          });
        }
        // If we have received the request body and the deal is confirmed by the executor, then we deduct the amount of the deal from the customer and add the deal amount to the executor's balance
        else if (
          dealing.completed === false &&
          confirmedDealing &&
          dealing.typeDealing === "Гарант-Сервис Сделка"
        ) {
          User.findOne({ _id: dealing.customer })
            .then((userCustomer) => {
              if (!userCustomer) {
                return res.status(404).json({
                  status: "error",
                  message: "User not found!",
                });
              }
              // If the customer's balance is less than the deal amount, then display an error
              if (userCustomer.moneyAtWork < dealing.transactionAmount) {
                return res.status(400).json({
                  status: "error",
                  message:
                    "There is no money in the work! Please contact your Pandora manager!",
                });
              }
              // If the customer's balance is greater than or equal to the deal amount, then we need to subtract the deal amount from his balance
              else if (userCustomer.moneyAtWork >= dealing.transactionAmount) {
                userCustomer.moneyAtWork =
                  userCustomer.moneyAtWork - dealing.transactionAmount;

                // If successful, we need to replenish the balance of the executor, so we find the executor by his ID and add the deal amount to his balance
                User.findOne({ _id: dealing.executor })
                  .then((userExecutor) => {
                    if (!userExecutor) {
                      return res.status(404).json({
                        status: "error",
                        message: "User not found!",
                      });
                    }

                    userExecutor.moneyAtWork += dealing.transactionAmount;
                    userExecutor.save().catch((err) =>
                      res.status(500).json({
                        status: "error",
                        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                      })
                    );

                    // We also create a transaction, which will contain the deal amount, the user who sent these funds by subtracting the deal amount from their balance, and the user who received the deal amount, as well as additional data
                    Transactions.findOneAndUpdate(
                      { _id: dealing.transaction },
                      {
                        $set: { status: "В обработке" },
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
                  })
                  .catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                userCustomer.save().catch((err) =>
                  res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  })
                );

                dealing.completed += true;
                dealing
                  .save()
                  .then((dealingStatus) => {
                    dealingStatus.populate(
                      "customer executor",
                      "email username role _id",
                      (err, dealingPayload) => {
                        if (err) {
                          return res.status(500).json({
                            status: "error",
                            message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                          });
                        }

                        if (!dealingPayload.customer) {
                          return res.status(404).json({
                            status: "error",
                            message: "Customer not found!",
                          });
                        }

                        if (!dealingPayload.executor) {
                          return res.status(404).json({
                            status: "error",
                            message: "Executor not found!",
                          });
                        }

                        res.json(dealingPayload);

                        const newNotificationDealingCompleted =
                          new Notifications({
                            notificationType: "Сделка",
                            notificationName: `Ваша сделка №${dealingPayload._id} завершена`,
                            notificationText: `Поздравляем! Пользователь ${dealingPayload.customer.email} заключал с Вами сделку на сумму ${dealingPayload.transactionAmount} Рублей. Рады сообщить Вам, что пользователь ${dealingPayload.customer.email} подтвердил завершение сделки №${dealingPayload._id} с Вами! Скоро на Ваш баланс поступят денежные средства! Спасибо за проявленное доверие к нашему Гарант-Сервису! С уважением, администрация Pandora!`,
                            notificationRecipient: dealingPayload.executor,
                          });

                        newNotificationDealingCompleted.save().catch((err) =>
                          res.status(500).json({
                            status: "error",
                            message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                          })
                        );

                        mailer.sendMail({
                          from: "kolotushins@gmail.com",
                          to: dealingPayload.executor.email,
                          subject: `Поздравляем! Пользователь ${dealingPayload.customer.email} завершил сделку с Вами!`,
                          html: `<h3>Пользователь <span style="color: blue">${dealingPayload.customer.email}</span> заключал с Вами сделку на сумму <span style="color: blue">${dealingPayload.transactionAmount}</span> Рублей.</h3> Рады сообщить Вам, что пользователь ${dealingPayload.customer.email} подтвердил завершение сделки №${dealingPayload._id} с Вами! Скоро на Ваш баланс поступят денежные средства! Спасибо за проявленное доверие к нашему Гарант-Сервису! С уважением, администрация Pandora!`,
                        });
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
        // This condition will be met if the deal has not yet been started by the executor, that is, it has not been confirmed. If the deal is not confirmed by the contractor, then all of the above conditions will not work
        else if (!confirmedDealing) {
          return res.status(400).json({
            status: "error",
            mesasge: "The deal hasn't started yet!",
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

// * @route   POST http://localhost:5000/api/dealings/evaluation/:_id/stars/:stars
// * @desc    Assessment of the executor after completion dealings
// * @access  Private
router.post(
  "/evaluation/:_id/stars/:stars",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Dealings.findOne({
      _id: req.params._id,
      customer: req.user._id,
      confirmed: true,
      completed: true,
    })
      .populate("customer executor", "email username deposit")
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        User.findOne({ _id: dealing.executor })
          .then((user) => {
            if (!user) {
              return res.status(404).json({
                status: "error",
                message: "User not found!",
              });
            }

            if (user.assessedDealings.indexOf(dealing._id) !== -1) {
              return res.status(400).json({
                status: "error",
                message: "The user has already been rated by you!",
              });
            } else if (+req.params.stars > 5 || +req.params.stars < 1) {
              return res.status(400).json({
                status: "error",
                message: "Invalid rating value!",
              });
            } else if (user.assessedDealings.indexOf(dealing._id) === -1) {
              // Calculating a rating based on the average rating (rating / number of rated users)
              user.rating =
                (user.rating * user.assessedDealings.length +
                  +req.params.stars) /
                (user.assessedDealings.length + 1);
              user.assessedDealings.push(dealing._id);
            }

            user.save().then(() => {
              res.status(200).json({
                status: "success",
                message: "User rating passed successfully!",
              });

              const newNotificationDealingRated = new Notifications({
                notificationType: "Рейтинг",
                notificationName: `Вас оценили после сделики №${dealing._id}`,
                notificationText: `Пользователь ${dealing.customer.email} оценил Вашу работу с ним со сделкой №${dealing._id} на ${req.params.stars} звезд. С уважением, администрация Pandora!`,
                notificationRecipient: dealing.executor,
              });

              newNotificationDealingRated.save().catch((err) =>
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
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   DELETE http://localhost:5000/api/dealings/remove/:_id
// * @desc    Deleting a deal by a user if it is not confirmed
// * @access  Private
router.delete(
  "/remove/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Dealings.findOne({
      _id: req.params._id,
      $or: [{ executor: req.user._id }, { customer: req.user._id }],
    })
      .then((dealing) => {
        if (!dealing) {
          return res.status(404).json({
            status: "error",
            message: "Dealing not found!",
          });
        }

        if (dealing.confirmed) {
          return res.status(400).json({
            status: "error",
            message: "The deal is confirmed by another user!",
          });
        }

        // Delete
        dealing
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

// * @route   DELETE http://localhost:5000/api/dealings/remove-admin/:_id
// * @desc    Deleting a deal by the administrator (for administrators only)
// * @access  Private (For administrators only)
router.delete(
  "/remove-admin/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Dealings.findById(req.params._id)
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
