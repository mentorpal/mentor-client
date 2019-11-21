"use strict";
const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const cors = require("cors");
var server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", express.static(path.join(__dirname, "public", "mentorpanel")));
app.get("/config", (req, res, next) => {
  res.send({
    MENTOR_API_URL: process.env.MENTOR_API_URL || "/mentor-api",
    MENTOR_VIDEO_URL: process.env.MENTOR_VIDEO_URL || "/videos",
  });
});
app.get(/mentor-api\/*/, (req, res, next) => {
  if (!process.env.MENTOR_API_URL) {
    return next(new Error("MENTOR_API_URL not set in env"));
  }
  return res.redirect(
    301,
    process.env.MENTOR_API_URL + req.url.replace(/^\/mentor-api/, "")
  );
});
app.get(/videos\/*/, (req, res, next) => {
  if (!process.env.MENTOR_VIDEO_URL) {
    return next(new Error("MENTOR_VIDEO_URL not set in env"));
  }
  res.redirect(
    301,
    process.env.MENTOR_VIDEO_URL + req.url.replace(/^\/videos/, "")
  );
});
const port = process.env.NODE_PORT || 3000;
server.listen(port, function() {
  console.log(`node listening on port ${port}`);
});
module.exports = app;
