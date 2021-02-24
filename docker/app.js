/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
require("dotenv").config();
const yn = require("yn");
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
app.use("/", express.static(path.join(__dirname, "public", "chat")));
app.get("/chat/config", (req, res) => {
  res.send({
    CMI5_ENDPOINT: process.env.CMI5_ENDPOINT || "/lrs/xapi",
    CMI5_FETCH: process.env.CMI5_FETCH || "/lrs/auth/guesttoken",
    MENTOR_API_URL: process.env.MENTOR_API_URL || "/classifier",
    MENTOR_VIDEO_URL: process.env.MENTOR_VIDEO_URL || "/videos",

    DISABLE_CMI5: yn(process.env.DISABLE_CMI5 || false), // move to graphql
    USE_CHAT_INTERFACE: yn(process.env.USE_CHAT_INTERFACE || false), // move to graphql
    HEADER_LOGO: process.env.HEADER_LOGO, // move to graphql
    DEFAULT_MENTORS: process.env.DEFAULT_MENTORS?.split(",") || [], // move to graphql
  });
});
app.get(/lrs\/*/, (req, res, next) => {
  if (!process.env.LRS_URL) {
    return next(new Error("LRS_URL not set in env"));
  }
  return res.redirect(301, process.env.LRS_URL + req.url.replace(/^\/lrs/, ""));
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
