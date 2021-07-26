/* 
    * Welcome to the server side of the Pandora project! 
    * Here you can see a list of all the routes used by the modules and learn more about the project.

    * Authors: Mikhail Kolotushin (Back-End Developer) and Evgeniy Butkov (Front-End Developer)

    * @... WELCOME!!! ...@ *
*/

//  Adding basic modules
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

// Connecting (Importing) routes for API operation
const userRoute = require("./routes/api/users");
const serviceRoute = require("./routes/api/service");
const paymetsMethodsRoute = require("./routes/api/paymentsMethods");
const cityRoute = require("./routes/api/city");
const categoriesRoute = require("./routes/api/category");
const dealingsRoute = require("./routes/api/dealings");
const paymentSystemRoute = require("./routes/api/paymentSystem");
const favoritesRoute = require("./routes/api/favorites");
const transactionsRoute = require("./routes/api/transactions");
const adminPanelRoute = require("./routes/api/adminPanel");
const chatRoute = require("./routes/api/chats");
const messageRoute = require("./routes/api/messages");
const complaintsRoute = require("./routes/api/complaints");
const avatarsRoute = require("./routes/api/avatars");
const newsRouter = require("./routes/api/news");
const withdrawalRequestsRoute = require("./routes/api/withdrawalRequests");
const notificationsRoute = require("./routes/api/notifications");
const searchRoute = require("./routes/api/search");
const sectionsRoute = require("./routes/api/sections");
const walletsRoute = require("./routes/api/wallets");
const memoRoute = require("./routes/api/memo");

// Initialize App
const app = express();
const server = require("http").Server(app);
const socket = require("socket.io")(server);

// Database connection (MongoDB)
const socketConnection = require("./socket");
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to database MongoDB successfully!");
    socket.on("connection", socketConnection);
  })
  .catch((err) => console.log(`Error connecting to MongoDB database: ${err}`));

// Connecting middleware for an application
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

app.use(express.static("public"));

// Connecting middleware Passport
app.use(passport.initialize());
// Connecting Passport Config
require("./config/passport")(passport);

// Using application routes (API)
app.use("/api/users", userRoute);
app.use("/api/services", serviceRoute);
app.use("/api/payment-methods", paymetsMethodsRoute);
app.use("/api/city", cityRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/dealings", dealingsRoute);
app.use("/api/payment-system", paymentSystemRoute);
app.use("/api/favorites", favoritesRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/admin-panel", adminPanelRoute);
app.use("/api/chat", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/complaints", complaintsRoute);
app.use("/api/avatars", avatarsRoute);
app.use("/api/news", newsRouter);
app.use("/api/withdrawal-requests", withdrawalRequestsRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/search", searchRoute);
app.use("/api/sections", sectionsRoute);
app.use("/api/wallets", walletsRoute);
app.use("/api/memo", memoRoute);

// Connecting cors
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// Connecting to Server and Initialize port
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
