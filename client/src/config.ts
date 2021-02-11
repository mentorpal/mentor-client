/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from "axios";

const config = {
  CMI5_ENDPOINT: process.env.CMI5_ENDPOINT || "/lrs/xapi",
  CMI5_FETCH: process.env.CMI5_FETCH || "/lrs/auth/guesttoken",
  MENTOR_API_URL: process.env.MENTOR_API_URL || "/classifier", // eslint-disable-line no-undef
  MENTOR_VIDEO_URL: process.env.MENTOR_VIDEO_URL || "/videos",
};

/*
This is a hacky place and means to get a server-configured
override of VIDEO_HOST.
It exists (at least for now), exclusively to enable
dev-local clients where mentor videos are being polished
to test serving those videos
*/
if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
  // i.e. don't run at build time
  axios
    .get(`/chat/config`)
    .then(result => {
      if (typeof result.data["CMI5_ENDPOINT"] === "string") {
        config.CMI5_ENDPOINT = result.data["CMI5_ENDPOINT"];
      }
      if (typeof result.data["CMI5_FETCH"] === "string") {
        config.CMI5_FETCH = result.data["CMI5_FETCH"];
      }
      if (typeof result.data["MENTOR_API_URL"] === "string") {
        config.MENTOR_API_URL = result.data["MENTOR_API_URL"];
      }
      if (typeof result.data["MENTOR_VIDEO_URL"] === "string") {
        config.MENTOR_VIDEO_URL = result.data["MENTOR_VIDEO_URL"];
      }
    })
    .catch(err => {
      console.error(err);
    });
}

export default config;
