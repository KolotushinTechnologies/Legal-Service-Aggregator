//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Middleware connection (Importing)
const roleMiddleware = require("../../middleware/roleMiddleware");

// Initialize Chat Model
const Chat = require("../../models/Chat");

// Initialize Message Model
const Message = require("../../models/Message");

// * @route   GET http://localhost:5000/api/chat/test
// * @desc    Chat route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "Chat route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   GET http://localhost:5000/api/chat
// * @desc    Chats get
// * @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const chats = await Chat.find()
        .or([{ author: req.user._id }, { partner: req.user._id }])
        .sort({ createdAt: "-1" })
        .populate([
          {
            path: "administrators author partner",
            select:
              "-password -createdAt -updatedAt -favorites -balance -status",
            populate: {
              path: "avatar",
              select: "-createdAt -updatedAt -__v",
            },
          },
        ])
        .populate({
          path: "lastMessage",
          populate: {
            path: "userMessage",
            select:
              "-password -createdAt -updatedAt -favorites -balance -status",
            populate: {
              path: "avatar",
              select: "-createdAt -updatedAt -__v",
            },
          },
        });
      console.log(chats);

      if (!chats) {
        return res.status(404).json({
          status: "error",
          message: "Chats not found!",
        });
      }

      return res.json(chats);
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
    }
  }
);

// * @route   POST http://localhost:5000/api/chat/create
// * @desc    Chat create
// * @access  Private
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Chat.findOne({ author: req.user._id, partner: req.body.partner })
      .then((chat) => {
        if (chat) {
          return res.status(400).json({
            status: "error",
            message: "Chat already exists",
          });
        } else {
          const newMessage = new Message({
            textMessage: req.body.textMessage,
            userMessage: req.user._id,
          });

          newMessage.save((err, message) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
              });
            }

            const newChat = new Chat({
              author: req.user._id,
              partner: req.body.partner,
              lastMessage: message._id,
            });

            if (message) {
              message.chat = newChat._id;
              message.save();
            }

            newChat
              .save()
              .then((result) => {
                res.status(201).json(result);
                io.on("connection", function (socket) {
                  socket.emit("SERVER:CHAT_CREATED", result);
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
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/chat/admin-chat
// * @desc    Chats get
// * @access  Private
router.get(
  "/admin-chat",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    Chat.find({ administrators: req.user._id })
      .populate([
        {
          path: "administrators author partner",
          select: "-password -createdAt -updatedAt -favorites -balance -status",
          populate: {
            path: "avatar",
            select: "-createdAt -updatedAt -__v",
          },
        },
      ])
      .populate({
        path: "lastMessage",
        populate: {
          path: "userMessage",
          select: "-password -createdAt -updatedAt -favorites -balance -status",
        },
        populate: {
          path: "avatar",
          select: "-createdAt -updatedAt -__v",
        },
      })
      .then((chats) => {
        if (!chats) {
          return res.status(404).json({
            status: "error",
            message: "Chats not found!",
          });
        }
        return res.json(chats);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   PUT http://localhost:5000/api/chat/:_id
// * @desc    Connecting administrator to chat (for administrators only)
// * @access  Private (For administrators only)
router.put(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  roleMiddleware(["ADMIN", "SUPERADMIN"]),
  (req, res) => {
    {
      const newMessage = new Message({
        textMessage: req.body.textMessage,
        chat: req.params._id,
        userMessage: req.user._id,
      });

      newMessage
        .save()
        .then((result) => {
          result
            .populate(
              "userMessage",
              "-password -createdAt -updatedAt -favorites -balance -status"
            )
            .populate({
              path: "readMessageUsers",
              select:
                "-password -createdAt -updatedAt -favorites -balance -status",
            })
            .populate(
              [
                {
                  path: "chat",
                  populate: {
                    path: "author partner administrators",
                    select:
                      "-password -createdAt -updatedAt -favorites -balance -status",
                  },
                },
              ],
              (err, message) => {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }

                if (!message.chat) {
                  return res.status(404).json({
                    status: "error",
                    message: "Chat not found!",
                  });
                }

                Chat.findById({ _id: req.params._id })
                  .then((chat) => {
                    if (!chat) {
                      return res.status(404).json({
                        status: "error",
                        message: "Chat not found!",
                      });
                    }

                    if (chat) {
                      if (chat.administrators.indexOf(req.user._id) === -1) {
                        chat.administrators.push(req.user._id);
                      }
                    }

                    chat.save();
                  })
                  .catch((err) =>
                    res.status(500).json({
                      status: "error",
                      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
                    })
                  );

                Chat.findByIdAndUpdate(
                  { _id: req.params._id },
                  {
                    lastMessage: message._id,
                  },
                  { upsert: true },
                  function (err) {
                    if (err) {
                      return res.status(500).json({
                        status: "error",
                        message: err,
                      });
                    }
                  }
                );

                res.json(message);
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
  }
);

function updateReadStatus(res, userId, chatId) {
  Message.updateMany(
    { chat: chatId, userMessage: { $ne: userId } },
    {
      $addToSet: {
        readMessageUsers: userId,
      },
    },
    (err) => {
      if (err) {
        res.status(500).json({ status: "error", message: err });
      } else {
        io.on("connection", function (socket) {
          socket.emit("SERVER:MESSAGES_READED", {
            userId,
            chatId,
          });
        });
      }
    }
  );
}

// * @route   GET http://localhost:5000/api/chat/last-message/:_id
// * @desc    Last message get
// * @access  Private
router.get(
  "/last-message/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const chatId = req.params._id;
    const userId = req.user._id;
    Chat.findOne({ _id: req.params._id })
      .then((chat) => {
        if (!chat) {
          return res.status(404).json({
            status: "error",
            message: "Chat not found!",
          });
        }

        Message.find({
          chat: req.params._id,
          userMessage: { $ne: req.user._id },
          readMessageUsers: { $ne: req.user._id },
        })
          .then((messages) => {
            if (!messages) {
              return res.status(404).json({
                status: "error",
                message: "Messages not found!",
              });
            }

            res.json(messages);
            updateReadStatus(res, userId, chatId);
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

module.exports = router;
