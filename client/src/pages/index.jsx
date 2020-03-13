import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions as cmi5Actions } from "redux-cmi5";
import { withPrefix } from "gatsby";
import { CircularProgress } from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { Helmet } from "react-helmet";

import { loadMentor, setGuestName } from "store/actions";

import GuestPrompt from "components/guest-prompt";
import Header from "components/header";
import Input from "components/input";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import withLocation from "wrap-with-location";

import "styles/layout.css";

const { start: cmi5Start } = cmi5Actions;

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

  const isMobile = width < 768;
  const videoHeight = isMobile ? height * 0.5 : Math.min(width * 0.5625, 700);
  const inputHeight = isMobile
    ? height * 0.5
    : Math.max(height - videoHeight, 250);

  let globalWindow;
  if (typeof window !== "undefined") {
    globalWindow = window; // eslint-disable-line no-undef
  }

  function handleWindowResize() {
    if (typeof globalWindow === `undefined`) {
      return;
    }
    setHeight(globalWindow.innerHeight);
    setWidth(globalWindow.innerWidth);
  }

  function setQueryStringWithoutPageReload(qsValue) {
    let url = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
    if (window.location.search) {
      url += `&guest=${qsValue}`;
    } else {
      url += `?guest=${qsValue}`;
    }
    window.history.pushState({ path: url }, "", url);
  }

  function onGuestNameEntered(name) {
    if (!name) {
      name = "guest";
    }
    setQueryStringWithoutPageReload(name);
    dispatch(setGuestName(name));
  }

  useEffect(() => {
    dispatch(cmi5Start());
  }, []);

  useEffect(() => {
    const mentorList = mentor
      ? Array.isArray(mentor)
        ? mentor
        : [mentor]
      : ["clint", "dan", "carlos", "julianne"];
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

  const hidePanel = Object.getOwnPropertyNames(mentorsById).length < 2;

  return (
    <MuiThemeProvider theme={theme}>
      <Helmet>
        <script src={withPrefix("cmi5.js")} type="text/javascript" />
      </Helmet>
      <div className="flex" style={{ height: videoHeight }}>
        {hidePanel ? (
          undefined
        ) : (
          <div className="content" style={{ height: "100px" }}>
            <VideoPanel isMobile={isMobile} />
            <Header />
          </div>
        )}
        <div className="expand">
          <Video height={videoHeight - (hidePanel ? 0 : 100)} width={width} />
        </div>
      </div>
      <Input height={inputHeight} />
      {guestName ? undefined : <GuestPrompt submit={onGuestNameEntered} />}
    </MuiThemeProvider>
  );
};

export default withLocation(IndexPage);
