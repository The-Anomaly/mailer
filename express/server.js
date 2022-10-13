"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const mailjet = require("node-mailjet");

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});
router.post("/mailjet", (req, res) => {
  console.log(req.body);

  let privateKey = req.headers["private-key"];
  let secretKey = req.headers["secret-key"];
  let messages = req.body.messages;

  if (!privateKey) {
    res
      .status(400)
      .json({
        success: false,
        message: "Private key authorization is required",
      });
    return;
  }
  if (!secretKey) {
    res
      .status(400)
      .json({
        success: false,
        message: "Secret key authorization is required",
      });
    return;
  }
  if (messages.length === 0) {
    res
      .status(400)
      .json({ success: false, message: "Message array is required" });
    return;
  }

  const mailer = mailjet.apiConnect(privateKey, secretKey);

  const send = mailer.post("send", { version: "v3.1" });
  const requestObject = {
    SandboxMode: false,
    Messages: messages,
  };

  send
    .request(requestObject)
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Email successfully sent",
      });
    })
    .catch((err) => {
      res.status(err.statusCode).json({
        success: false,
        message: err.statusText,
      });
    });
});

router.get("/status", function (req, res) {
  res.send({ message: "Server is hot and live!" });
});

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

module.exports = app;
module.exports.handler = serverless(app);
