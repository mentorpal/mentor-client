/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import { v1 as uuidv1, v4 as uuid } from "uuid";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";

import Header from "components/header";
import {
  loadConfig,
  loadMentors,
  SESSION_ID_CREATED,
  SESSION_ID_FOUND,
  setChatSessionId,
  setGuestName,
} from "store/actions";
import { Config, LoadStatus, MentorType, State } from "types";
import withLocation from "wrap-with-location";
import "styles/layout.css";
import { fetchMentorByAccessToken, pingMentor } from "api";

import "styles/history-chat-responsive.css";

import { getLocalStorage, getParamUserId, removeQueryParam } from "utils";
import {
  cmi5_instance,
  initCmi5,
  sendCmi5Statement,
  toXapiResultExtCustom,
} from "cmiutils";
import VideoSection from "components/layout/video-section";
import ChatSection from "components/layout/chat-section";
import { useWithScreenOrientation } from "use-with-orientation";

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

function IndexPage(props: {
  search: {
    mentor?: string | string[];
    recommendedQuestions?: string | string[];
    guest?: string;
    subject?: string;
    intro?: string;
    noHistoryDownload?: string;
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
  const sessionIdInState = useSelector<State, string>(
    (state) => state.sessionId
  );
  const chatSessionId = useSelector<State, string>(
    (state) => state.chatSessionId
  );
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
  const [chatHeight, setChatHeight] = React.useState<number>(0);

  const { displayFormat, windowHeight } = useWithScreenOrientation();
  const curTopic = useSelector<State, string>((state) => state.curTopic);
  const cmi5init = useSelector<State, boolean>((state) => state.isCmi5Init);

  const { guest, subject, recommendedQuestions, intro } = props.search;
  let { mentor } = props.search;

  function hasSessionUser(): boolean {
    return Boolean(!config.cmi5Enabled || cmi5init || guestName);
  }

  function isConfigLoadComplete(s: LoadStatus): boolean {
    return s === LoadStatus.LOADED || s === LoadStatus.LOAD_FAILED;
  }

  //Load Theme
  const styleHeaderColor = useSelector<State, string>(
    (state) => state.config.styleHeaderColor?.trim() || "#FFFFFF"
  );

  const brandedTheme = createTheme({
    palette: {
      primary: {
        main: styleHeaderColor,
      },
    },
  });

  useEffect(() => {
    if (chatSessionId && cmi5init) {
      sendCmi5Statement(
        {
          verb: {
            id: `https://mentorpal.org/xapi/verb/initialized`,
            display: {
              "en-US": "initialized",
            },
          },
          object: {
            id: `${window.location.protocol}//${window.location.host}`,
            objectType: "Activity",
          },
        },
        chatSessionId,
        sessionIdInState
      );
    }
  }, [chatSessionId, cmi5init, sessionIdInState]);

  useEffect(() => {
    const sessionIdInUrl = new URL(location.href).searchParams.get("sessionId");
    if (sessionIdInUrl) {
      dispatch({
        type: SESSION_ID_FOUND,
        payload: sessionIdInUrl,
      });
      return;
    }
    if (!sessionIdInState) {
      dispatch({
        type: SESSION_ID_CREATED,
        payload: uuid(),
      });
    }
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

    // remove saved query params (no longer needed) to clean up url
    removeQueryParam("userID");
    removeQueryParam("referrer");
    removeQueryParam("userEmail");

    return [userIdURL, referrerURL, userEmail];
  };

  function warmupMentors(mentors: string | string[]) {
    const mentorIds = Array.isArray(mentors) ? mentors : [mentors];
    mentorIds.forEach((mentorId) => {
      pingMentor(mentorId, chatSessionId, config).catch((err) => {
        // We don't really care if this query fails, so just catch error
        console.error(err);
      });
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
    if (config.cmi5Enabled && !config.displayGuestPrompt && !cmi5_instance) {
      const [userIdLRS, referrer, userEmail] = setupLocalStorage();
      if (userIdLRS && userEmail && referrer) {
        initCmi5(userIdLRS, userEmail, `guests-client/${referrer}`, config);
      }
    }
  }, [configLoadStatus]);

  useEffect(() => {
    const chatSessionId = uuid();
    dispatch(setChatSessionId(chatSessionId));

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        const localData = localStorage.getItem("userData");
        if (!localData) {
          return;
        }
        const data = JSON.parse(localData);
        if (!data.userID) {
          return;
        }
        const userData = {
          verb: "suspended",
          userid: data.userID,
          userEmail: data.userEmail,
          referrer: data.referrer,
          postSurveyTime: getLocalStorage("postsurveytime"),
          timeSpentOnPage: getLocalStorage("postsurveytime"),
          qualtricsUserId: getLocalStorage("qualtricsuserid"),
        };
        sendCmi5Statement(
          {
            verb: {
              id: `https://mentorpal.org/xapi/verb/${userData.verb}`,
              display: {
                "en-US": `${userData.verb}`,
              },
            },
            result: {
              extensions: {
                "https://mentorpal.org/xapi/verb/suspended":
                  toXapiResultExtCustom(
                    userData.verb,
                    userData.userid,
                    userData.userEmail,
                    userData.referrer,
                    userData.postSurveyTime,
                    userData.timeSpentOnPage,
                    userData.qualtricsUserId
                  ),
              },
            },
            object: {
              id: `${window.location.protocol}//${window.location.host}`,
              objectType: "Activity",
            },
          },
          chatSessionId,
          sessionIdInState
        );
      }
    });
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
          subject: subject,
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
    let userId = getParamUserId(window.location.href);
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
          <div className={`main-container-${displayFormat}`}>
            <div className="video-section">
              <VideoSection
                mentorType={mentorType}
                chatHeight={chatHeight}
                windowHeight={windowHeight}
                hasSessionUser={hasSessionUser}
                isMobile={displayFormat == "mobile"}
              />
            </div>
            <div className={`chat-section-${displayFormat}`}>
              <ChatSection
                mentorType={mentorType}
                hasSessionUser={hasSessionUser}
                curTopic={curTopic}
                isMobile={displayFormat == "mobile"}
                noHistoryDownload={props.search.noHistoryDownload}
              />
            </div>
          </div>
        </MuiThemeProvider>
      )}
    </div>
  );
}

export default withLocation(IndexPage);
