/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgress } from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Cmi5 from "@xapi/cmi5";

import { hasCmi } from "cmiutils";
import config from "config";
import Chat from "components/chat";
import GuestPrompt from "components/guest-prompt";
import Header from "components/header";
import Input from "components/input";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import { loadMentor, setGuestName } from "store/actions";
import withLocation from "wrap-with-location";

import "styles/layout.css";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

const IndexPage = ({ search }) => {
  const dispatch = useDispatch();
  const mentorsById = useSelector(state => state.mentorsById);
  const guestName = useSelector(state => state.guestName);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const { recommended, mentor, guest } = search;

  const hidePanel = Object.getOwnPropertyNames(mentorsById).length < 2;
  const isMobile = width < 768;
  const videoHeight = isMobile
    ? height * 0.5
    : Math.min(width * 0.5625, height * 0.7);
  const inputHeight = isMobile
    ? height * 0.5
    : Math.max(height - videoHeight, 300);
  const headerHeight = hidePanel || config.USE_CHAT_INTERFACE ? 50 : 100;

  let globalWindow;
  if (typeof window !== "undefined") {
    globalWindow = window; // eslint-disable-line no-undef
  }

  function hasSessionUser() {
    return Boolean(
      config.DISABLE_CMI5 ||
        (globalWindow && hasCmi(globalWindow.location.search)) ||
        guestName
    );
  }

  function handleWindowResize() {
    if (typeof globalWindow === `undefined`) {
      return;
    }
    setHeight(globalWindow.innerHeight);
    setWidth(globalWindow.innerWidth);
  }

  useEffect(() => {
    if (!config.DISABLE_CMI5 && Cmi5.isCmiAvailable) {
      try {
        Cmi5.instance.initialize().catch(e => {
          console.error(e);
        });
      } catch (err2) {
        console.error(err2);
      }
    }
  }, []);

  useEffect(() => {
    const mentorList = mentor
      ? Array.isArray(mentor)
        ? mentor
        : [mentor]
      : config.DEFAULT_MENTORS;
    dispatch(
      loadMentor(mentorList, {
        recommendedQuestions: recommended,
      })
    );
    if (guest) {
      dispatch(setGuestName(guest));
    }
  }, [mentor, recommended, guest]);

  useEffect(() => {
    // Media queries for layout
    setHeight(globalWindow.innerHeight);
    setWidth(globalWindow.innerWidth);
    globalWindow.addEventListener("resize", handleWindowResize);
    return () => {
      globalWindow.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  if (mentorsById === {} || height === 0 || width === 0) {
    return <CircularProgress />;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <div className="flex" style={{ height: videoHeight }}>
        <div className="content" style={{ height: headerHeight }}>
          {hidePanel || config.USE_CHAT_INTERFACE ? (
            undefined
          ) : (
            <VideoPanel isMobile={isMobile} />
          )}
          <Header />
        </div>
        <div className="expand">
          {config.USE_CHAT_INTERFACE ? (
            <Chat height={videoHeight - headerHeight} />
          ) : (
            <Video
              height={videoHeight - headerHeight}
              width={width}
              playing={hasSessionUser()}
            />
          )}
        </div>
      </div>
      <Input height={inputHeight} />
      {!hasSessionUser() ? <GuestPrompt /> : undefined}
    </MuiThemeProvider>
  );
};

export default withLocation(IndexPage);
