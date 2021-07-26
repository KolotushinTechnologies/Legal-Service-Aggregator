const multer = require("multer");
const path = require("path");

module.exports = storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images/avatars");
  },
  filename: function (req, file, callback) {
    let ext = file.originalname.split(".").pop();
    callback(null, "file" + "-" + Date.now() + "." + ext);
  },
});

const uploader = multer({ storage: storage });

module.exports = uploader;
