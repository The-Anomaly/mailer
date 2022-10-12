const express = require("express");
const mailjet = require("node-mailjet");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.post("/mailjet", (req, res) => {
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

app.get("/", function (req, res) {
  res.send({ message: "Server is hot and live!" });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
