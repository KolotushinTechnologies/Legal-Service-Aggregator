//  Adding basic modules
const express = require("express");
const router = express.Router();
const passport = require("passport");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// // EventEmitter
const events = require("events");
const emitter = new events.EventEmitter();

// Initialize Chat Model
const Chat = require("../../models/Chat");

// Initialize Message Model
const Message = require("../../models/Message");

// * @route   GET http://localhost:5000/api/messages/test
// * @desc    Chat route testing
// * @access  Public
router.get("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Messages route testing was successfully!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
    });
  }
});

// * @route   POST http://localhost:5000/api/messages/create/:chat_id
// * @desc    Message create
// * @access  Private
router.post(
  "/create/:chat_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newMessage = new Message({
      textMessage: req.body.textMessage,
      dealMessage: req.body.dealMessage,
      chat: req.params.chat_id,
      userMessage: req.user._id,
    });

    newMessage
      .populate("chat")
      .save()
      .then((sendMessage) => {
        sendMessage
          .populate(
            "userMessage",
            "-password -email -createdAt -updatedAt -favorites -balance -status"
          )
          .populate("chat dealMessage", (err, message) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }

            if (!message.chat) {
              return res.status(404).json({
                message: "Chat not found!",
              });
            }

            Chat.findOneAndUpdate(
              { _id: req.params.chat_id },
              { lastMessage: message._id },
              { upsert: true },
              function (err) {
                if (err) {
                  return res
                    .status(500)
                    .json({ status: "error", message: err });
                }
              }
            );

            res.json(message);
            emitter.emit("newMessage", message);
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

// * @route   GET http://localhost:5000/api/messages/:_id
// * @desc    Message get
// * @access  Private
router.get(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const chatId = req.params._id;
    const userId = req.user._id;
    updateReadStatus(res, userId, chatId);
    Message.find({ chat: req.params._id })
      .populate({
        path: "userMessage",
        select:
          "-password -email -createdAt -updatedAt -favorites -balance -status",
      })
      .populate({
        path: "chat",
        populate: {
          path: "administrators author partner",
          select:
            "-password -email -createdAt -updatedAt -favorites -balance -status",
        },
      })
      .then((chat) => {
        if (!chat) {
          return res
            .status(404)
            .json({ status: "error", message: "Chat and messages not found!" });
        }

        res.json(chat);
      })
      .catch((err) =>
        res.status(500).json({
          status: "error",
          message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
        })
      );
  }
);

// * @route   GET http://localhost:5000/api/messages/new-message/:chat_id
// * @desc    New Message get
// * @access  Private
router.get(
  "/new-message/:chat_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Message.findOne({ chat: req.params.chat_id })
      .populate({
        path: "userMessage",
        select:
          "-password -email -createdAt -updatedAt -favorites -balance -status",
      })
      .populate({
        path: "chat",
        populate: {
          path: "administrators author partner",
          select:
            "-password -email -createdAt -updatedAt -favorites -balance -status",
        },
      })
      .then((message) => {
        if (!message) {
          return res.status(404).json({
            status: "error",
            message: "Message not found!",
          });
        }

        emitter.once("newMessage", (message) => {
          res.json(message);
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

module.exports = router;
