const nodemailer = require("nodemailer");

const options = {
  // host: process.env.NODEMAILER_HOST || "smtp.mailtrap.io",
  service: "gmail",
  // port: Number(process.env.NODEMAILER_PORT) || 2525,
  port: 465,
  auth: {
    // user: process.env.NODEMAILER_USER,
    // pass: process.env.NODEMAILER_PASS,
    user: "kolotushins@gmail.com",
    pass: "query???!!!password???query???!!!",
  },
};

const transport = nodemailer.createTransport(options);

module.exports = transport;
