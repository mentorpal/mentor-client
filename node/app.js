"use strict";
const express = require("express");
const path = require("path");
const app = express();
const http = require("http");

var server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "public", "mentorpanel")));
const port = process.env.NODE_PORT || 3000;
server.listen(port, function() {
  console.log(`node listening on port ${port}`);
});
module.exports = app;
