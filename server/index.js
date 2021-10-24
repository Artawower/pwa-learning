//Express
const express = require("express");

//web-push
const webpush = require("web-push");

//body-parser
const bodyParser = require("body-parser");

//path
const path = require("path");

// cors
const cors = require("cors");

//using express
const app = express();

// app.use(cors());
//using bodyparser

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//storing the keys in variables
const publicVapidKey =
  "BJxgti75ow0Q96X5fGMIz5PAwdR4a_eGg9KbrpTo8qBaacix5UEMBX0S2amT3HweXWsClr5tsV3EOMYWElIlhOc";
const privateVapidKey = "v0mrf6LhO8U2BzmOkqYa5Te8dPr7ovjOuBU_nddfocU";

//setting vapid keys details
webpush.setVapidDetails(
  "mailto:somerealemal@google.com",
  publicVapidKey,
  privateVapidKey
);

const memcacheSubscriptionStore = [];

//subscribe route
app.post("/subscribe", (req, res) => {
  //get push subscription object from the request
  const subscription = req.body;
  console.debug("[line 33][index.js] 🚀 req: ", req.body);

  //send status 201 for the request
  res.status(201).json({});

  //create paylod: specified the detals of the push notification
  const payload = JSON.stringify({ title: "Hello from node.js backend", openUrl: '/help/'});

  setTimeout(() => {
    webpush
      .sendNotification(subscription, JSON.stringify({ title: "TIMEOUT MSG", body: "Okay, it works perfect now", openUrl: '/' }))
      .catch((err) => console.log(err));
  }, 5000);
});

const port = 3010;
app.listen(port, () => {
  console.log(`server started on ${port}`);
});
