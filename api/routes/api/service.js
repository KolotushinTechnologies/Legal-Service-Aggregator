//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Connecting validation for forms
const validateServiceInput = require("../../validation/service");

// Initialize User Model
const User = require("../../models/User");
// Initialize Service Model
const Service = require("../../models/Service");
// Initialize Comments Model
const Comments = require("../../models/Comments");
// Initialize Responses Comments Users Model
const ResponsesCommentsUsers = require("../../models/ResponsesCommentsUsers");
// Initialize Notifications Model
const Notifications = require("../../models/Notifications");

// * @route   GET http://localhost:5000/api/services/test
// * @desc    Categories route testing
// * @access  Public
router.get(
  "/test",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      res
        .status(200)
        .json({ message: "Services route testing was successfully!" });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
    }
  }
);

// * @route   POST http://localhost:5000/api/services
// * @desc    Create service
// * @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateServiceInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newService = await new Service({
      title: req.body.title,
      textContent: req.body.textContent,
      categories: req.body.categories.split(";"),
      user: req.user._id,
    });

    newService
      .save()
      .then((service) => {
        service.populate("user", "email username _id", (err, userService) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: err,
            });
          }

          User.findOne(userService.user)
            .then((user) => {
              if (!user) {
                return res.status(404).json({
                  status: "error",
                  message: "User not found!",
                });
              }

              if (user) {
                user.services.push(userService);
              }

              user.save();
            })
            .catch((err) =>
              res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              })
            );

          res.json(userService);
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

// * @route   GET http://localhost:5000/api/services/user
// * @desc    Get service by user
// * @access  Private
// TODO
router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Service.find({ user: req.user._id })
      .sort({ createdAt: "-1" })
      .populate("user", "email username _id")
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

// * @route   GET http://localhost:5000/api/services
// * @desc    Get service all user
// * @access  Private
router.get("/", (req, res) => {
  Service.find({ locked: { $ne: true } })
    .sort({ createdAt: "-1" })
    .populate(
      "user",
      "username paymentMethods guarantorService city rating deposit"
    )
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
});

// * @route   GET http://localhost:5000/api/services/:_id
// * @desc    Get service by ID
// * @access  Public
router.get("/:_id", (req, res) => {
  Service.findOne({ _id: req.params._id })
    .populate("user", "email username _id")
    .then((service) => {
      if (!service) {
        return res.status(404).json({
          status: "error",
          message: "Service not found!",
        });
      }

      if (service.locked) {
        return res.status(400).json({
          status: "error",
          message: "Service blocked!",
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
});

// * @route   GET http://localhost:5000/api/services/user/:_id
// * @desc    Receiving their services by the user by ID
// * @access  Private
router.get(
  "/user/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Service.findOne({ _id: req.params._id, user: req.user._id })
      .populate("user", "email username _id")
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        if (service.locked) {
          return res.status(400).json({
            status: "error",
            message: "Service blocked!",
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

// * @route   PUT http://localhost:5000/api/services/:_id
// * @desc    Get service by ID
// * @access  Private
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Service.findOne({ _id: req.params._id, user: req.user._id })
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        if (service.locked) {
          return res.status(400).json({
            status: "error",
            message: "Service blocked!",
          });
        }

        const { title, textContent, categories } = req.body;

        if (title) {
          service.title = title;
        }

        if (textContent) {
          service.textContent = textContent;
        }

        if (categories) {
          service.categories = categories.split(";");
        }

        service
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
  }
);

// * @route   DELETE http://localhost:5000/api/services/:_id
// * @desc    Delete service user
// * @access  Private
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Service.findOneAndDelete({ _id: req.params._id, user: req.user._id })
      .then((service) => {
        if (!service) {
          return res.status(404).json({
            status: "error",
            message: "Service not found!",
          });
        }

        if (service.locked) {
          return res.status(400).json({
            status: "error",
            message: "Service blocked!",
          });
        }

        // Delete
        User.findOneAndUpdate(
          { _id: service.user },
          { $pull: { services: req.params._id } },
          function (err) {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }
          }
        );

        service.remove().then(() => res.json({ success: true }));
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   POST http://localhost:5000/api/services/add-comment/:service_id
// * @desc    Add comment for service
// * @access  Private
router.post(
  "/add-comment/:service_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newComment = new Comments({
      userComment: req.user._id,
      textComment: req.body.textComment,
      service: req.params.service_id,
    });

    newComment
      .populate("service")
      .save()
      .then((comment) => {
        comment.populate(
          "userComment",
          "-password -createdAt -updatedAt -favorites -balance -status",
          (err, commentResult) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }

            if (!commentResult.service) {
              return res.status(404).json({
                status: "error",
                message: "Service not found!",
              });
            }

            Service.findOneAndUpdate(
              { _id: req.params.service_id },
              { $push: { comments: commentResult } },
              function (err, service) {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!service) {
                  return res.status(404).json({
                    status: "error",
                    message: "Service not found!",
                  });
                }

                const newNotificationNewComment = new Notifications({
                  notificationType: "Комментарии",
                  notificationName: `Вашу услугу №${service._id} прокомментировали`,
                  notificationText: `Пользователь ${commentResult.userComment && commentResult.userComment.email
                    } прокомментировал Вашу услугу №${service._id
                    }. С уважением, администрация Pandora!`,
                  notificationRecipient: service.user,
                  payload: commentResult._id,
                });

                newNotificationNewComment.save().catch((err) =>
                  res.status(500).json({
                    status: "error",
                    message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                  })
                );
              }
            );

            res.status(200).json(commentResult);
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
);

// * @route   GET http://localhost:5000/api/services/all-comments/:service_id
// * @desc    Get (view) all comments
// * @access  Public
router.get("/all-comments/:service_id", (req, res) => {
  Comments.find({ service: req.params.service_id })
    .populate(
      "userComment",
      "-password -email -createdAt -updatedAt -favorites -balance -status"
    )
    .populate("service")
    .then((comments) => {
      if (!comments) {
        return res.status(404).json({
          status: "error",
          message: "Comments not found!",
        });
      }

      res.json(comments);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/services/all-comments/:service_id/page/:page_num
// * @desc    Receiving (view) comments page by page
// * @access  Public
router.get("/all-comments/:service_id/page/:page_num", (req, res) => {
  const skips = 10 * (req.params.page_num - 1);

  Comments.find({ service: req.params.service_id })
    .sort({ createdAt: "-1" })
    .skip(skips)
    .limit(10)
    .populate(
      "userComment",
      "-password -email -createdAt -updatedAt -favorites -balance -status"
    )
    .populate("service")
    .then((comments) => {
      if (!comments) {
        return res.status(404).json({
          status: "error",
          message: "Comments not found!",
        });
      }

      res.json(comments);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   GET http://localhost:5000/api/services/comment/:_id
// * @desc    Get (view) a comment by ID
// * @access  Public
router.get("/comment/:_id", (req, res) => {
  Comments.findOne({ _id: req.params._id })
    .populate(
      "userComment",
      "-password -email -createdAt -updatedAt -favorites -balance -status"
    )
    .populate("service")
    .then((comment) => {
      if (!comment) {
        return res.status(404).json({
          status: "error",
          message: "Comment not found!",
        });
      }

      res.json(comment);
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      })
    );
});

// * @route   PUT http://localhost:5000/api/services/edit-comment/:_id
// * @desc    Edit comment
// * @access  Private
router.put(
  "/edit-comment/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comments.findOne({
      _id: req.params._id,
      userComment: req.user._id,
    })
      .populate(
        "userMessage",
        "-password -email -createdAt -updatedAt -favorites -balance -status"
      )
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({
            status: "error",
            message: "Comment not found!",
          });
        }

        const { textComment } = req.body;

        if (textComment) {
          comment.textComment = textComment;
        }

        comment
          .populate("service")
          .save()
          .then((result) => {
            result.populate(
              "userComment",
              "-password -email -createdAt -updatedAt -favorites -balance -status",
              (err, commentResult) => {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!commentResult.service) {
                  return res.status(404).json({
                    status: "error",
                    message: "Service not found!",
                  });
                }

                res.status(200).json(commentResult);
              }
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

// * @route   DELETE http://localhost:5000/api/services/delete-comment/:_id
// * @desc    Delete comment
// * @access  Private
router.delete(
  "/delete-comment/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comments.findOne({ _id: req.params._id, userComment: req.user._id })
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({
            status: "error",
            message: "Comment not found!",
          });
        }

        // Delete
        Service.findOneAndUpdate(
          { _id: comment.service },
          { $pull: { comments: comment._id } },
          function (err) {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }
          }
        );

        comment.remove().then(() => res.json({ success: true }));
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   POST http://localhost:5000/api/services/add-response-comment/:comment_id/service/:service_id
// * @desc    Add response comment user
// * @access  Private
router.post(
  "/add-response-comment/:comment_id/service/:service_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Comments.findOne({
      _id: req.params.comment_id,
      service: req.params.service_id,
    })
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({
            status: "error",
            message: "Comment not found!",
          });
        }

        const newResponseComent = new ResponsesCommentsUsers({
          responseUser: req.user._id,
          responseText: req.body.responseText,
          comment: comment._id,
          service: comment.service._id,
        });

        newResponseComent
          .save()
          .then((result) => {
            result.populate(
              "responseUser",
              "-password -createdAt -updatedAt -favorites -balance -status",
              (err, resultResponseComment) => {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!resultResponseComment.comment) {
                  return res.status(404).json({
                    status: "error",
                    message: "Comment not found!",
                  });
                }

                Comments.findOneAndUpdate(
                  { _id: comment._id },
                  { $push: { userResponses: resultResponseComment } },
                  function (err, commentUser) {
                    if (err) {
                      return res.status(500).json({
                        status: "error",
                        message: err,
                      });
                    }

                    if (!commentUser) {
                      return res.status(404).json({
                        status: "error",
                        message: "Comment user not found!",
                      });
                    }

                    const newNotificationNewResponseComment = new Notifications(
                      {
                        notificationType: "Комментарии",
                        notificationName: `На Ваш комментарий №${comment._id} ответили`,
                        notificationText: `Пользователь ${resultResponseComment.responseUser.email} ответил на Ваш комментарий №${comment._id}. С уважением, администрация Pandora!`,
                        notificationRecipient: comment.userComment,
                        link: comment._id,
                        payload: resultResponseComment._id,
                      }
                    );

                    newNotificationNewResponseComment.save().catch((err) =>
                      res.status(500).json({
                        status: "error",
                        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                      })
                    );
                  }
                );

                res.status(200).json(resultResponseComment);
              }
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

// * @route   GET http://localhost:5000/api/services/all-responses-comments/:comment_id/service/:service_id
// * @desc    Get (view) all responses comments users
// * @access  Public
router.get(
  "/all-responses-comments/:comment_id/service/:service_id",
  (req, res) => {
    ResponsesCommentsUsers.find({
      comment: req.params.comment_id,
      service: req.params.service_id,
    })
      .populate(
        "responseUser",
        "-password -email -createdAt -updatedAt -favorites -balance -status"
      )
      .populate("comment")
      .then((responses) => {
        if (!responses) {
          return res.status(404).json({
            status: "error",
            message: "Response comments users not found!",
          });
        }

        res.json(responses);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/services/response-comment/:_id/comment/:comment_id/service/:service_id
// * @desc    Get (view) a response comment user by ID
// * @access  Private
router.get(
  "/response-comment/:_id/comment/:comment_id/service/:service_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    ResponsesCommentsUsers.findOne({
      _id: req.params._id,
      comment: req.params.comment_id,
      service: req.params.service_id,
    })
      .populate(
        "responseUser",
        "-password -email -createdAt -updatedAt -favorites -balance -status"
      )
      .populate("comment")
      .then((response) => {
        if (!response) {
          return res.status(404).json({
            status: "error",
            message: "Response comment user not found!",
          });
        }

        res.json(response);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/services/edit-response-comment/:_id/comment/:comment_id/service/:service_id
// * @desc    Updating (editing) the response comment user by ID
// * @access  Private
router.put(
  "/edit-response-comment/:_id/comment/:comment_id/service/:service_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    ResponsesCommentsUsers.findOne({
      _id: req.params._id,
      responseUser: req.user._id,
      comment: req.params.comment_id,
      service: req.params.service_id,
    })
      .then((responseComment) => {
        if (!responseComment) {
          return res.status(404).json({
            status: "error",
            message: "Response comment user not found!",
          });
        }

        const { responseText } = req.body;

        if (responseText) {
          responseComment.responseText = responseText;
        }

        responseComment
          .populate("comment")
          .save()
          .then((result) => {
            result.populate(
              "responseUser",
              "-password -email -createdAt -updatedAt -favorites -balance -status",
              (err, resultResponseComment) => {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!resultResponseComment.service) {
                  return res.status(404).json({
                    status: "error",
                    message: "Service not found!",
                  });
                }

                res.status(200).json(resultResponseComment);
              }
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

// * @route   DELETE http://localhost:5000/api/services/delete-response-comment/:_id/comment/:comment_id/service/:service_id
// * @desc    Removing a response comment user by ID
// * @access  Private
router.delete(
  "/delete-response-comment/:_id/comment/:comment_id/service/:service_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    ResponsesCommentsUsers.findOne({
      _id: req.params._id,
      responseUser: req.user._id,
      comment: req.params.comment_id,
      service: req.params.service_id,
    })
      .then((responseComment) => {
        if (!responseComment) {
          return res.status(404).json({
            status: "error",
            message: "Response comment user not found!",
          });
        }

        // Delete
        Comments.findOneAndUpdate(
          { _id: responseComment.comment },
          { $pull: { userResponses: responseComment._id } },
          function (err) {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }
          }
        );

        responseComment.remove().then(() => res.json({ success: true }));
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
