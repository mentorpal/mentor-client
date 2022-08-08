/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v1 as uuidv1 } from "uuid";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cmi5 from "@xapi/cmi5";
import addCmi, { getParams, hasCmi } from "cmiutils";
import Header from "components/header";
import { loadConfig, loadMentors, setGuestName } from "store/actions";
import { Config, LoadStatus, MentorType, State } from "types";
import withLocation from "wrap-with-location";
import "styles/layout.css";
import { fetchMentorByAccessToken, queryMentor } from "api";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { Helmet } from "react-helmet";

import "styles/history-chat-responsive.css";

import Desktop from "components/layout/desktop";
import { isMobile } from "react-device-detect";
import Mobile from "components/layout/mobile";
import { getRegistrationId, onVisibilityChange, setLocalStorage } from "utils";

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

export const shouldDisplayPortrait = (): boolean =>
  window.matchMedia && window.matchMedia("(max-width: 1200px)").matches;

function IndexPage(props: {
  search: {
    mentor?: string | string[];
    recommendedQuestions?: string | string[];
    guest?: string;
    subject?: string;
    intro?: string;
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

  const { guest, subject, recommendedQuestions, intro } = props.search;
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

    const registrationIdFromUrl = new URL(location.href).searchParams.get(
      "registrationId"
    );
    if (registrationIdFromUrl) {
      setLocalStorage("registrationId", registrationIdFromUrl);
    }

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

  const setupLocalStorage = (): string[] => {
    // get local user information
    const localData = localStorage.getItem("userData");
    const newId = uuidv1();
    // grab referrer from the URL
    const userId = new URL(location.href).searchParams.get("userID") || newId;
    const referrer =
      new URL(location.href).searchParams.get("referrer") || "no referrer";
    const userEmail =
      new URL(location.href).searchParams.get("userEmail") ||
      `${newId}.guest@mentorpal.org`;

    // if userId exists in localStorage and is the same as the one in the URL, use that one.
    // Otherwise, use the one in the URL
    const localUserId =
      JSON.parse(localData ? localData : "{}").userID !== undefined &&
      JSON.parse(localData ? localData : "{}").userID === userId
        ? JSON.parse(localData ? localData : "").userID
        : userId;

    // if referrer exists in localStorage and is the same as the one in the URL, use that one.
    // Otherwise, use the one in the URL
    const localReferrer =
      JSON.parse(localData ? localData : "{}").referrer !== undefined &&
      JSON.parse(localData ? localData : "{}").referrer === referrer
        ? JSON.parse(localData ? localData : "").referrer
        : referrer;

    // if userEmail exists in localStorage and is the same as the one in the URL, use that one.
    // Otherwise, use the one in the URL
    const localUserEmail =
      JSON.parse(localData ? localData : "{}").userEmail !== undefined &&
      JSON.parse(localData ? localData : "{}").userEmail === userEmail
        ? JSON.parse(localData ? localData : "").userEmail
        : userEmail;

    // if no referrer in localStorage, use the one from the URL
    const referrerURL = localData ? localReferrer : referrer;
    // if no userEmail in localStorage, use the one from the URL
    const userEmailURL = localData ? localUserEmail : userEmail;
    // if no userEmail in localStorage, use the one from the URL
    const userIdURL = localData ? localUserId : userId;

    // create new localStorage object
    const userData = {
      userID: userIdURL,
      referrerURL: referrerURL,
      userEmail: userEmailURL,
    };

    // set it in localStorage
    localStorage.setItem("userData", JSON.stringify(userData));

    return [userIdURL, referrerURL, userEmail];
  };

  function warmupMentors(mentors: string | string[]) {
    const mentorIds = Array.isArray(mentors) ? mentors : [mentors];
    mentorIds.forEach((mentorId) => {
      queryMentor(mentorId, "What is your name?", config);
    });
  }

  useEffect(() => {
    if (configLoadStatus === LoadStatus.NONE) {
      dispatch(loadConfig());
    }
    if (!isConfigLoadComplete(configLoadStatus)) {
      return;
    }

    if (mentor) {
      warmupMentors(mentor);
    }

    if (
      config.cmi5Enabled &&
      !Cmi5.isCmiAvailable &&
      !config.displayGuestPrompt
    ) {
      const urlRoot = `${window.location.protocol}//${window.location.host}`;
      // TODO: Shouldn't this also check local storage?
      let userId = getParams(window.location.href);
      if (!userId || typeof userId !== "string") {
        userId = uuidv1();
      }
      const referrer = setupLocalStorage()[1];
      const userEmail = setupLocalStorage()[2];
      const userIdLRS = setupLocalStorage()[0];

      window.location.href = addCmi(
        window.location.href,
        {
          activityId: window.location.href,
          actor: {
            objectType: "Agent",
            account: {
              homePage: `${urlRoot}/guests-client/${referrer}`,
              name: userIdLRS,
            },
            mbox: userEmail,
            name: userIdLRS,
          },
          endpoint: config.cmi5Endpoint,
          fetch: `${config.cmi5Fetch}${
            config.cmi5Fetch.includes("?") ? "" : "?"
          }&username=${encodeURIComponent(
            userEmail
          )}&userid=${userIdLRS}&userID=${userIdLRS}`,
          registration: getRegistrationId(),
        },
        referrer,
        userEmail
      );
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
    document.addEventListener("visibilitychange", onVisibilityChange);
  }, []);

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
          intro,
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
    let userId = getParams(window.location.href);
    if (!userId || typeof userId !== "string") {
      userId = uuidv1();
    }
  });

  useEffect(() => {
    if (guest) {
      dispatch(setGuestName(guest));
    }
  }, [guest]);

  return (
    <div>
      <Helmet>
        <meta name="googlebot" content="noindex" />
        <meta name="robots" content="noindex" />
      </Helmet>
      {!isConfigLoadComplete(configLoadStatus) || !curMentor ? (
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
      ) : (
        <MuiThemeProvider theme={brandedTheme}>
          <Header />
          {shouldDisplayPortrait() || isMobile ? (
            <Mobile
              mentorType={mentorType}
              chatHeight={chatHeight}
              windowHeight={windowHeight}
              hasSessionUser={hasSessionUser}
              curTopic={curTopic}
            />
          ) : (
            <Desktop
              mentorType={mentorType}
              chatHeight={chatHeight}
              windowHeight={windowHeight}
              hasSessionUser={hasSessionUser}
              curTopic={curTopic}
            />
          )}
        </MuiThemeProvider>
      )}
    </div>
  );
}

export default withLocation(IndexPage);
