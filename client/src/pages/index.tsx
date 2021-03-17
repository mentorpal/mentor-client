/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgress } from "@material-ui/core";
import {
  MuiThemeProvider,
  createMuiTheme,
  makeStyles,
} from "@material-ui/core/styles";
import Cmi5 from "@xapi/cmi5";
import { hasCmi } from "cmiutils";
import Chat from "components/chat";
import GuestPrompt from "components/guest-prompt";
import Header from "components/header";
import Input from "components/input";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import {
  loadConfig,
  loadMentor,
  setGuestName,
  setRecommendedQuestions,
} from "store/actions";
import { Config, LoadStatus, MentorData, MentorType, State } from "types";
import withLocation from "wrap-with-location";
import "styles/layout.css";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1b6a9c",
    },
  },
});

const useStyles = makeStyles(theme => ({
  flexRoot: {
    height: "100vh",
    minHeight: "-webkit-fill-available",
    display: "flex",
    flexFlow: "column nowrap",
    flexDirection: "column",
    alignItems: "stretch",
    margin: 0,
  },
  flexFixedChild: {
    flex: "none",
  },
  flexExpandChild: {
    flex: "auto",
    overflowY: "scroll",
  },
}));

function IndexPage(props: {
  search: {
    mentor?: string | string[];
    recommendedQuestions?: string | string[];
    guest?: string;
    subject?: string;
  };
}): JSX.Element {
  const dispatch = useDispatch();
  const styles = useStyles();
  const config = useSelector<State, Config>(state => state.config);
  const configLoadStatus = useSelector<State, LoadStatus>(
    state => state.configLoadStatus
  );
  const guestName = useSelector<State, string>(state => state.guestName);
  const curMentor = useSelector<State, string>(state => state.curMentor);
  const mentorsById = useSelector<State, Record<string, MentorData>>(
    state => state.mentorsById
  );
  const { mentor, guest, subject, recommendedQuestions } = props.search;

  function hasSessionUser(): boolean {
    return Boolean(
      !config.cmi5Enabled ||
        (typeof window !== "undefined" && hasCmi(window.location.search)) ||
        guestName
    );
  }

  function isConfigLoadComplete(s: LoadStatus): boolean {
    return s === LoadStatus.LOADED || s === LoadStatus.LOAD_FAILED;
  }

  useEffect(() => {
    if (configLoadStatus === LoadStatus.NONE) {
      dispatch(loadConfig());
    }
    if (!isConfigLoadComplete(configLoadStatus)) {
      return;
    }
    if (config.cmi5Enabled && Cmi5.isCmiAvailable) {
      try {
        Cmi5.instance.initialize().catch(e => {
          console.error(e);
        });
      } catch (err2) {
        console.error(err2);
      }
    }
  }, [configLoadStatus]);

  useEffect(() => {
    if (!isConfigLoadComplete(configLoadStatus)) {
      return;
    }
    const recommendedQuestionList = recommendedQuestions
      ? Array.isArray(recommendedQuestions)
        ? recommendedQuestions
        : [recommendedQuestions]
      : [];
    dispatch(setRecommendedQuestions(recommendedQuestionList));
    const mentorList = mentor
      ? Array.isArray(mentor)
        ? mentor
        : [mentor]
      : config.mentorsDefault;
    dispatch(loadMentor(config, mentorList, subject));
    if (guest) {
      dispatch(setGuestName(guest));
    }
  }, [configLoadStatus, mentor, guest, subject, recommendedQuestions]);

  if (!isConfigLoadComplete(configLoadStatus) || !curMentor) {
    return (
      <div>
        <CircularProgress id="loading" />
      </div>
    );
  }

  return (
    <MuiThemeProvider theme={theme}>
      <div className={styles.flexRoot}>
        <div className={styles.flexFixedChild}>
          <VideoPanel />
          <Header />
        </div>
        {Object.keys(mentorsById).length < 2 ||
        mentorsById[curMentor].mentor.mentorType === MentorType.CHAT ? (
          <Chat />
        ) : (
          <Video playing={hasSessionUser()} />
        )}
        <div className={styles.flexFixedChild}>
          <Input />
        </div>
        {!hasSessionUser() ? <GuestPrompt /> : undefined}
      </div>
    </MuiThemeProvider>
  );
}

export default withLocation(IndexPage);
