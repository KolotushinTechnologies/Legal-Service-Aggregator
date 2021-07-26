const User = require("./models/User");

const socket = async (socket) => {
  await socket.on("new-user", async (user) => {
    console.log("new-user: ", user);
    await User.updateMany(
      { _id: user.user._id },
      { $set: { status: socket.id, onlineUser: true, lastSeen: Date.now() } }
    );
    socket.broadcast.emit("user-connected", user);
  });
  await socket.on("user-offline", async (user) => {
    await User.findOneAndUpdate(
      { _id: user },
      { $set: { status: "", onlineUser: false } }
    );
    console.log("user-disconnect: ", user);
    socket.broadcast.emit("user-disconnected", user);
  });
  await socket.on("disconnect", async () => {
    const user = await User.findOneAndUpdate(
      { status: socket.id },
      { $set: { status: "", onlineUser: false, lastSeen: Date.now() } }
    );
    console.log("user-disconnect: ", user);
    socket.broadcast.emit("user-disconnected", user);
  });
  await socket.on("update-socket", async (user) => {
    console.log(user);
    await User.findOneAndUpdate(
      { _id: user },
      { $set: { status: socket.id, onlineUser: true } }
    );
    console.log("user-updateSocket: ", user);
    socket.broadcast.emit("update-socket", user);
  });
  socket.on("broadcast-message", async (msgObj) => {
    console.log("broadcast-message: ", msgObj);
    socket.broadcast.emit("new-message", msgObj);
  });
};

module.exports = socket;
