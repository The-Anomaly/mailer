'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
router.post("/mailjet", (req, res) => {
  console.log(req.body);

  let privateKey = req.headers["private-key"];
  let secretKey = req.headers["secret-key"];
  let messages = req.body.messages;

  if (!privateKey) {
    res.status(400).json({ message: "Private key authorization is required" });
    return;
  }
  if (!secretKey) {
    res.status(400).json({ message: "Secret key authorization is required" });
    return;
  }
  if (messages.length === 0) {
    res.status(400).json({ message: "Message array is required" });
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
      });
    })
    .catch((err) => {
      console.log(err);

      res.json({
        error: err.statusCode,
      });
    });
});

router.get("/status", function (req, res) {
  res.send({ message: "Server is hot and live!" });
});

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
