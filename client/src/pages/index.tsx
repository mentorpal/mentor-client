/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import { CircularProgress } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";

import Header from "components/header";
import {
  authenticateUser,
  loadConfig,
  loadMentors,
  SESSION_ID_CREATED,
  SESSION_ID_FOUND,
  setChatSessionId,
  USER_DATA_FINISH_LOADING,
  USER_DATA_UPDATED,
} from "store/actions";
import { Config, LoadStatus, MentorType, State } from "types";
import withLocation from "wrap-with-location";
import "styles/layout.css";
import { fetchMentorByAccessToken, pingMentor } from "api";

import "styles/history-chat-responsive.css";

import {
  emailFromUserId,
  getLocalStorage,
  getLocalStorageUserData,
  getParamURL,
  getRegistrationId,
  getUserIdFromURL,
  LocalStorageUserData,
  removeQueryParam,
  resetTimeSpentOnPage,
  setLocalStorage,
  updateLocalStorageUserData,
  validatedEmail,
  XOR,
} from "utils";
import {
  cmi5_instance,
  initCmi5,
  sendCmi5Statement,
  toXapiResultExtCustom,
} from "cmiutils";
import VideoSection from "components/layout/video-section";
import ChatSection from "components/layout/chat-section";
import { useWithScreenOrientation } from "use-with-orientation";
import { AuthUserData } from "types-gql";
import {
  EMAIL_URL_PARAM_KEY,
  EVENTS_KEY,
  LS_EMAIL_KEY,
  LS_USER_ID_KEY,
  LS_X_API_EMAIL_KEY,
  POST_SURVEY_TIME_KEY,
  QUALTRICS_USER_ID_URL_PARAM_KEY,
  REFERRER_KEY,
  REGISTRATION_ID_KEY,
  TIME_SPENT_ON_PAGE_KEY,
} from "local-constants";
import UsernameModal from "components/username-modal";
import { BaseDialog } from "components/base-dialog";

const useStyles = makeStyles({ name: { IndexPage } })(() => ({
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
  loadingImage: {
    width: 100,
    display: "block",
  },
}));

function IndexPage(props: {
  search: {
    mentor?: string | string[];
    recommendedQuestions?: string | string[];
    subject?: string;
    intro?: string;
    introVideo?: string;
    introVideoStart?: number;
    introVideoEnd?: number;
    noHistoryDownload?: string;
  };
}): JSX.Element {
  const userDataState = useSelector<State, LocalStorageUserData>(
    (state) => state.userData
  );
  const userDataLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.userDataLoadStatus
  );

  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [usernameModalOpen, setUsernameModalOpen] = useState<boolean>(true);

  const dispatch = useDispatch();
  const { classes: styles } = useStyles();
  const config = useSelector<State, Config>((state) => state.config);
  const configLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.configLoadStatus
  );
  const mentorsLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.mentorsInitialLoadStatus
  );
  const authUserLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.authenticationStatus
  );
  const authUserData = useSelector<State, AuthUserData>(
    (state) => state.authUserData
  );
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
  const answerMissing = useSelector<State, boolean>((state) => {
    if (!state.curMentor) {
      return false;
    }
    return state.mentorsById[state.curMentor]?.answer_missing || false;
  });
  const [chatHeight, setChatHeight] = React.useState<number>(0);
  const [warnedAnswerMissing, setWarnedAnswerMissing] = React.useState(false);
  const { displayFormat, windowHeight } = useWithScreenOrientation();
  const curTopic = useSelector<State, string>((state) => state.curTopic);

  const {
    subject,
    recommendedQuestions,
    intro,
    introVideo,
    introVideoStart,
    introVideoEnd,
  } = props.search;
  let { mentor } = props.search;

  function isLoadComplete(s: LoadStatus): boolean {
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
    dispatch(authenticateUser());
    dispatch(loadConfig());
  }, []);

  function setupSessionId(): string {
    const sessionIdInUrl = new URL(location.href).searchParams.get("sessionId");
    if (sessionIdInUrl) {
      dispatch({
        type: SESSION_ID_FOUND,
        payload: sessionIdInUrl,
      });
      return sessionIdInUrl;
    }
    if (!sessionIdInState) {
      const newSessionId = uuid();
      dispatch({
        type: SESSION_ID_CREATED,
        payload: newSessionId,
      });
      return newSessionId;
    } else {
      return sessionIdInState;
    }
  }

  useEffect(() => {
    if (!isLoadComplete(configLoadStatus) || !curMentor) {
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

  function setupUserData(config: Config) {
    const sessionId = setupSessionId();
    const userData = setupLocalStorageUserData(sessionId);

    if (
      !userData.givenUserId &&
      !userData.givenUserEmail &&
      config.displayGuestPrompt
    ) {
      dispatch({
        type: USER_DATA_UPDATED,
        payload: userData,
      });
      setShowEmailPopup(true);
    } else {
      dispatch({
        type: USER_DATA_FINISH_LOADING,
        payload: userData,
      });
    }
  }

  function setupLocalStorageUserData(sessionId: string): LocalStorageUserData {
    const localData = getLocalStorageUserData();
    const userIdFromUrl = getUserIdFromURL();
    const userEmailfromUrl = new URL(location.href).searchParams.get(
      EMAIL_URL_PARAM_KEY
    );

    const xapiEmailBeforeChanges = localData.xapiUserEmail;

    let givenUserId = localData.givenUserId;
    let givenUserEmail = localData.givenUserEmail;
    let xApiEmail = localData.xapiUserEmail;

    if (userEmailfromUrl && userIdFromUrl) {
      // If have both userID in url and userEmail in url, then set both in local storage, and xapiUserEmail becomes userEmailUrl
      givenUserId = userIdFromUrl;
      givenUserEmail = validatedEmail(userEmailfromUrl);
      xApiEmail = validatedEmail(userEmailfromUrl);
    } else if (XOR(Boolean(userEmailfromUrl), Boolean(userIdFromUrl))) {
      const newEmailProvided =
        userEmailfromUrl &&
        userEmailfromUrl !== localData.givenUserEmail &&
        userEmailfromUrl !== emailFromUserId(localData.givenUserId);
      const newUserIdProvided =
        userIdFromUrl && userIdFromUrl !== localData.givenUserId;

      const noUserInLocal = !localData.givenUserId;
      const noEmailInLocal = !localData.givenUserEmail;
      const noEmailOrUserInLocal = noUserInLocal && noEmailInLocal;

      if (noEmailOrUserInLocal || newEmailProvided || newUserIdProvided) {
        givenUserId = userIdFromUrl || "";
        givenUserEmail = validatedEmail(userEmailfromUrl) || "";
        xApiEmail =
          (givenUserId && emailFromUserId(givenUserId)) || givenUserEmail;
      }

      // SPECIAL CASE: If user exists in local but no email in local, and provided email is equivalent to emailFromUserId(local.userId),
      // then just add the given email and nothing else.
      if (
        userEmailfromUrl &&
        !newEmailProvided &&
        Boolean(localData.givenUserId) &&
        !localData.givenUserEmail &&
        userEmailfromUrl == emailFromUserId(localData.givenUserId)
      ) {
        givenUserEmail = validatedEmail(userEmailfromUrl);
      }
    } else {
      // Nothing passed in, so make sure we at least have an xapiemail setup
      const xApiEmailIsFunctionOfSesssionId =
        xApiEmail && !localData.givenUserEmail && !localData.givenUserId;
      if (!xApiEmail || xApiEmailIsFunctionOfSesssionId) {
        xApiEmail = `${sessionId}@mentorpal.org`;
      }
    }

    const referrerFromUrl = new URL(location.href).searchParams.get(
      REFERRER_KEY
    );
    const referrerFromLocalStorage = localData.referrer;
    const referrer =
      referrerFromUrl || referrerFromLocalStorage || "no referrer";

    const userData: LocalStorageUserData = {
      [LS_USER_ID_KEY]: givenUserId,
      [LS_EMAIL_KEY]: givenUserEmail,
      [LS_X_API_EMAIL_KEY]: xApiEmail,
      [EVENTS_KEY]: localData.events || [],
      [REFERRER_KEY]: referrer,
    };

    updateLocalStorageUserData(userData);
    setLocalStorage(REGISTRATION_ID_KEY, getRegistrationId());

    // Whenever a new xapi email is set, it's considered a new user so reset timer.
    if (xapiEmailBeforeChanges !== xApiEmail) {
      resetTimeSpentOnPage();
    }

    removeQueryParam(QUALTRICS_USER_ID_URL_PARAM_KEY);
    removeQueryParam(REFERRER_KEY);
    removeQueryParam(EMAIL_URL_PARAM_KEY);

    return userData;
  }

  function warmupMentors(mentors: string | string[], accessToken: string) {
    const mentorIds = Array.isArray(mentors) ? mentors : [mentors];
    mentorIds.forEach((mentorId) => {
      pingMentor(mentorId, chatSessionId, config, accessToken).catch((err) => {
        // We don't really care if this query fails, so just catch error
        console.error(err);
      });
    });
  }

  useEffect(() => {
    if (configLoadStatus === LoadStatus.LOADED) {
      setupUserData(config);
    }
  }, [configLoadStatus]);

  useEffect(() => {
    if (
      !isLoadComplete(configLoadStatus) ||
      !isLoadComplete(authUserLoadStatus) ||
      !isLoadComplete(userDataLoadStatus) ||
      !sessionIdInState ||
      !config.cmi5Enabled ||
      cmi5_instance
    ) {
      return;
    }
    if (mentor) {
      warmupMentors(mentor, authUserData.accessToken);
    }
    try {
      initCmi5(
        userDataState.givenUserId || userDataState.xapiUserEmail,
        userDataState.xapiUserEmail,
        userDataState.referrer,
        config,
        sessionIdInState,
        chatSessionId
      );
    } catch (err2) {
      console.error(err2);
    }
  }, [
    configLoadStatus,
    authUserLoadStatus,
    userDataLoadStatus,
    sessionIdInState,
  ]);

  useEffect(() => {
    const chatSessionId = uuid();
    dispatch(setChatSessionId(chatSessionId));

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        const data = getLocalStorageUserData();
        const xapiUserData = {
          verb: "suspended",
          userid: data.givenUserId,
          userEmail: data.xapiUserEmail,
          referrer: data.referrer,
          postSurveyTime: getLocalStorage(POST_SURVEY_TIME_KEY),
          timeSpentOnPage: getLocalStorage(TIME_SPENT_ON_PAGE_KEY),
          qualtricsUserId: getLocalStorage(LS_USER_ID_KEY),
        };
        sendCmi5Statement(
          {
            verb: {
              id: `https://mentorpal.org/xapi/verb/${xapiUserData.verb}`,
              display: {
                "en-US": `${xapiUserData.verb}`,
              },
            },
            result: {
              extensions: {
                "https://mentorpal.org/xapi/verb/suspended":
                  toXapiResultExtCustom(
                    xapiUserData.verb,
                    xapiUserData.userid,
                    xapiUserData.userEmail,
                    xapiUserData.referrer,
                    xapiUserData.postSurveyTime,
                    xapiUserData.timeSpentOnPage,
                    xapiUserData.qualtricsUserId
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
    if (
      !isLoadComplete(configLoadStatus) ||
      !isLoadComplete(authUserLoadStatus)
    ) {
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
          introVideo,
          introVideoStart,
          introVideoEnd,
          recommendedQuestions: recommendedQuestions
            ? Array.isArray(recommendedQuestions)
              ? recommendedQuestions
              : [recommendedQuestions]
            : [],
        })
      );
    };
    findMentor();
  }, [
    configLoadStatus,
    mentor,
    subject,
    recommendedQuestions,
    authUserLoadStatus,
  ]);

  function onSubmitEmail(email: string) {
    const newGivenUserEmail = getParamURL(EMAIL_URL_PARAM_KEY) || email;
    const newUserData: LocalStorageUserData = {
      ...userDataState,
      givenUserEmail: newGivenUserEmail || "guest@mentorpal.org",
    };
    if (newGivenUserEmail) {
      newUserData.xapiUserEmail = validatedEmail(newGivenUserEmail);
      resetTimeSpentOnPage();
    }
    dispatch({
      type: USER_DATA_FINISH_LOADING,
      payload: newUserData,
    });
    updateLocalStorageUserData(newUserData);
  }
  if (typeof window !== "undefined") {
    console.log(document.referrer);
  }
  return (
    <div>
      <BaseDialog
        subtext="You are not authorized to view the selected mentor(s)."
        open={mentorsLoadStatus === LoadStatus.EMPTY_LOAD}
        customButtonText="Go to home"
        closeDialog={() => {
          window.location.href = "/home";
        }}
      />
      {!isLoadComplete(configLoadStatus) || !curMentor ? (
        <div className={styles.loadingWindow}>
          <div className={styles.loadingContent}>
            <CircularProgress
              data-cy="loading"
              style={{ color: styleHeaderColor }}
              size={150}
            />
            <div className={styles.loadingIndicatorContent}></div>
          </div>
        </div>
      ) : (
        <StyledEngineProvider injectFirst>
          {answerMissing && !warnedAnswerMissing ? (
            <BaseDialog
              title="Notice"
              subtext="It appears this mentor is currently being updated and may not respond correctly to all questions."
              open={answerMissing && !warnedAnswerMissing}
              closeDialog={() => setWarnedAnswerMissing(true)}
            />
          ) : undefined}
          <ThemeProvider theme={brandedTheme}>
            <Header />
            {showEmailPopup ? (
              <UsernameModal
                setOpen={setUsernameModalOpen}
                open={usernameModalOpen}
                onSubmit={onSubmitEmail}
              />
            ) : null}
            <div className={`main-container-${displayFormat}`}>
              <div className="video-section">
                <VideoSection
                  mentorType={mentorType}
                  chatHeight={chatHeight}
                  windowHeight={windowHeight}
                  isMobile={displayFormat == "mobile"}
                />
              </div>
              <div className={`chat-section-${displayFormat}`}>
                <ChatSection
                  mentorType={mentorType}
                  curTopic={curTopic}
                  isMobile={displayFormat == "mobile"}
                  noHistoryDownload={props.search.noHistoryDownload}
                />
              </div>
            </div>
          </ThemeProvider>
        </StyledEngineProvider>
      )}
    </div>
  );
}

export default withLocation(IndexPage);

// https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
export const Head = (): JSX.Element => (
  <>
    <meta name="googlebot" content="noindex" />
    <meta name="robots" content="noindex" />
  </>
);
