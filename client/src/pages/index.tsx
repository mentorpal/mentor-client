/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cmi5 from "@xapi/cmi5";
import { hasCmi } from "cmiutils";
import Chat from "components/chat";
import GuestPrompt from "components/guest-prompt";
import Header from "components/header";
import Input from "components/input";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import { loadConfig, loadMentors, setGuestName } from "store/actions";
import { Config, LoadStatus, MentorType, State } from "types";
import withLocation from "wrap-with-location";
import "styles/layout.css";
import { fetchMentorByAccessToken } from "api";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  flexRoot: {
    display: "flex",
    flexFlow: "column nowrap",
    flexDirection: "column",
    alignItems: "stretch",
    margin: 0,
  },
  flexFixedChildHeader: {
    flexGrow: 0,
  },
  flexFixedChild: {
    marginTop: 10,
    flexGrow: 0,
    width: "calc(100% - 10px)",
    maxWidth: 1366,
    marginLeft: "auto",
    marginRight: "auto",
  },
  flexExpandChild: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1366,
    marginLeft: "auto",
    marginRight: "auto",
  },
  loadingWindow: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    height: 200,
  },
  loadingContent: {
    position: "relative",
  },
  loadingIndicatorContent: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  loadingIndicator: {
    color: theme.palette.primary.main,
  },
  loadingImage: {
    width: 100,
    display: "block",
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
  const config = useSelector<State, Config>((state) => state.config);
  const configLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.configLoadStatus
  );
  const guestName = useSelector<State, string>((state) => state.guestName);
  const curMentor = useSelector<State, string>((state) => state.curMentor);
  const mentorCount = useSelector<State, number>((state) => {
    return Object.getOwnPropertyNames(state.mentorsById).length;
  });
  const mentorType = useSelector<State, MentorType>((state) => {
    if (!state.curMentor) {
      return MentorType.VIDEO;
    }
    return (
      state.mentorsById[state.curMentor]?.mentor?.mentorType || MentorType.VIDEO
    );
  });

  const [windowHeight, setWindowHeight] = React.useState<number>(0);
  const [chatHeight, setChatHeight] = React.useState<number>(0);
  const curTopic = useSelector<State, string>((state) => state.curTopic);
  const { guest, subject, recommendedQuestions } = props.search;
  let { mentor } = props.search;

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

  //Load Theme
  const styleHeaderColor = useSelector<State, string>(
    (state) => state.config.styleHeaderColor?.trim() || "#FFFFFF"
  );

  const brandedTheme = createMuiTheme({
    palette: {
      primary: {
        main: styleHeaderColor,
      },
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    setWindowHeight(window.innerHeight);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isConfigLoadComplete(configLoadStatus) || !curMentor) {
      return;
    }
    const headerHeight = 50;
    const panelHeight = mentorCount > 1 ? 50 : 0;
    const inputHeight = 130;
    const questionsHeight = curTopic ? 200 : 0;
    setChatHeight(
      Math.max(
        0,
        windowHeight -
          headerHeight -
          panelHeight -
          inputHeight -
          questionsHeight -
          21
      )
    );
  });

  useEffect(() => {
    if (configLoadStatus === LoadStatus.NONE) {
      dispatch(loadConfig());
    }
    if (!isConfigLoadComplete(configLoadStatus)) {
      return;
    }
    if (config.cmi5Enabled && Cmi5.isCmiAvailable) {
      try {
        Cmi5.instance.initialize().catch((e) => {
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

    const findMentor = async () => {
      // check local store=
    if (!mentor) {
      const ACCESS_TOKEN_KEY = "accessToken";

      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || "";
      if (accessToken) {
        const tokenResponse = await fetchMentorByAccessToken(accessToken);
        mentor = tokenResponse._id;
      }
    }

    dispatch(
      loadMentors({
        config,
        mentors: mentor
          ? Array.isArray(mentor)
            ? mentor
            : [mentor]
          : config.mentorsDefault,
        subject,
        recommendedQuestions: recommendedQuestions
          ? Array.isArray(recommendedQuestions)
            ? recommendedQuestions
            : [recommendedQuestions]
          : [],
      })
    );
    };
    findMentor();
  }, [configLoadStatus, mentor, subject, recommendedQuestions]);

  useEffect(() => {
    if (guest) {
      dispatch(setGuestName(guest));
    }
  }, [guest]);

  //Waiting for config
  if (!isConfigLoadComplete(configLoadStatus) || !curMentor) {
    return (
      <div className={styles.loadingWindow}>
        <div className={styles.loadingContent}>
          <CircularProgress
            data-cy="loading"
            className={styles.loadingIndicator}
            style={{ color: config.styleHeaderColor }}
            size={150}
          />
          <div className={styles.loadingIndicatorContent}></div>
        </div>
      </div>
    );
  }

  return (
    <MuiThemeProvider theme={brandedTheme}>
      <div className={styles.flexRoot} style={{ height: windowHeight }}>
        <div className={styles.flexFixedChildHeader}>
          <VideoPanel />
          <Header />
        </div>
        <div className={styles.flexExpandChild}>
          {mentorType === MentorType.CHAT ? (
            <Chat height={chatHeight} />
          ) : (
            <Video playing={hasSessionUser()} />
          )}
        </div>
        <div className={styles.flexFixedChild}>
          <Input />
        </div>
        {!hasSessionUser() ? <GuestPrompt /> : undefined}
      </div>
    </MuiThemeProvider>
  );
}

export default withLocation(IndexPage);
