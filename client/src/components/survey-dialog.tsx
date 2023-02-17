/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

import { sendCmi5Statement, toXapiResultExtCustom } from "cmiutils";
import { Config, LoadStatus, State } from "types";
import {
  getLocalStorage,
  LocalStorageUserData,
  printLocalStorage,
  removeLocalStorageItem,
  setLocalStorage,
} from "utils";
import {
  POST_SURVEY_TIME_KEY,
  TIME_SPENT_ON_PAGE_KEY,
  QUALTRICS_USER_ID_URL_PARAM_KEY,
  TIMER_TEXT_KEY,
  LAST_UPDATE_KEY,
  LS_USER_ID_KEY,
  REFERRER_KEY,
  TIMER_UPDATE_INTERVAL_MS,
} from "../local-constants";

export function SurveyDialog(): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [pollingTimer, setPollingTimer] = useState<boolean>(false);
  const [showSurveyPopup, setShowSurveyPopup] = useState<boolean>(false);
  const [surveyLink, setSurveyLink] = useState<string>();
  const configInState = useSelector<State, Config>((state) => state.config);
  const configLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.configLoadStatus
  );
  const chatSessionId = useSelector<State, string>(
    (state) => state.chatSessionId
  );
  const sessionIdInState = useSelector<State, string>(
    (state) => state.sessionId
  );
  const userDataInState = useSelector<State, LocalStorageUserData>(
    (state) => state.userData
  );
  const userDataLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.userDataLoadStatus
  );

  function checkForSurveyPopupVariables(
    userData: LocalStorageUserData,
    config: Config
  ) {
    const searchParams = new URL(location.href).searchParams;
    const postSurveyTimeLocal = getLocalStorage(POST_SURVEY_TIME_KEY);
    const timerTextLocal = getLocalStorage(TIMER_TEXT_KEY);

    const postsurveytime =
      searchParams.get(POST_SURVEY_TIME_KEY) ||
      postSurveyTimeLocal ||
      (config.postSurveyTimer && `${config.postSurveyTimer}`) ||
      "";
    const timertext = searchParams.get(TIMER_TEXT_KEY) || timerTextLocal || "";

    postsurveytime && setLocalStorage(POST_SURVEY_TIME_KEY, postsurveytime);
    timertext && setLocalStorage(TIMER_TEXT_KEY, timertext);

    if (config.postSurveyLink) {
      const url = new URL(config.postSurveyLink);
      config.postSurveyUserIdEnabled &&
        url.searchParams.append(
          QUALTRICS_USER_ID_URL_PARAM_KEY,
          userData.givenUserId ||
            userData.givenUserEmail ||
            userData.xapiUserEmail
        );
      config.postSurveyReferrerEnabled &&
        userData.referrer &&
        url.searchParams.append(REFERRER_KEY, userData.referrer);
      setSurveyLink(url.href);
    }

    const userIdentifierProvided =
      userData.givenUserId || userData.givenUserEmail;
    const shouldSurveyPopupAfterTimer =
      userIdentifierProvided && config.postSurveyLink;
    if (
      postsurveytime &&
      Number(postsurveytime) > 0 &&
      shouldSurveyPopupAfterTimer
    ) {
      const localStorageTimeSpent = getLocalStorage(TIME_SPENT_ON_PAGE_KEY);
      setLocalStorage(LAST_UPDATE_KEY, String(Date.now()));
      setLocalStorage(TIME_SPENT_ON_PAGE_KEY, localStorageTimeSpent || "0");
      setPollingTimer(true);
    }
  }

  function clearTimerLocalStorage() {
    removeLocalStorageItem(TIME_SPENT_ON_PAGE_KEY);
    removeLocalStorageItem(POST_SURVEY_TIME_KEY);
    removeLocalStorageItem(TIMER_TEXT_KEY);
    setPollingTimer(false);
  }

  function generateSurveyPopupTitle(): string {
    const timerTextFromLocalStorage = getLocalStorage(TIMER_TEXT_KEY);
    if (timerTextFromLocalStorage) {
      return timerTextFromLocalStorage;
    }

    const timeSpentOnPageFromLocalStorage = getLocalStorage(
      TIME_SPENT_ON_PAGE_KEY
    );
    const timeSpentOnPage = timeSpentOnPageFromLocalStorage
      ? Number(timeSpentOnPageFromLocalStorage)
      : 0;

    const surveyWaitTimeFromLocalStorage =
      getLocalStorage(POST_SURVEY_TIME_KEY);
    const surveyWaitTime = surveyWaitTimeFromLocalStorage
      ? Number(surveyWaitTimeFromLocalStorage)
      : 0;

    const timeSpentOnPageText =
      timeSpentOnPage > 60
        ? `${Math.round(timeSpentOnPage / 60)} minutes`
        : `${timeSpentOnPage} seconds`;
    let surveyPopupTitleText = "";
    if (!surveyWaitTimeFromLocalStorage || !timeSpentOnPageFromLocalStorage) {
      surveyPopupTitleText +=
        "After spending some time with our site, you may click the link below to take our survey!";
    } else {
      // Only display the survey link if enough time has passed
      surveyPopupTitleText += `You have spent ${timeSpentOnPageText} on this site.`;
      const shouldDisplaySurveyLink = timeSpentOnPage >= surveyWaitTime;
      if (shouldDisplaySurveyLink) {
        surveyPopupTitleText +=
          " Please click the link below to take our survey!";
      } else {
        const timeLeftToSpendOnPage = surveyWaitTime - timeSpentOnPage;
        const timeLeftToSpendOnPageText =
          timeLeftToSpendOnPage > 60
            ? `${Math.round(timeLeftToSpendOnPage / 60)} more minutes`
            : `${timeLeftToSpendOnPage} more seconds`;
        surveyPopupTitleText += ` Please wait ${timeLeftToSpendOnPageText} before taking our survey!`;
      }
    }
    return surveyPopupTitleText;
  }

  function pollTimer(): void {
    const timeSpentOnPage = getLocalStorage(TIME_SPENT_ON_PAGE_KEY);
    const newTimeSpentOnPage =
      Number(timeSpentOnPage) + TIMER_UPDATE_INTERVAL_MS / 1000;
    const timerDuration = getLocalStorage(POST_SURVEY_TIME_KEY);
    const currentEpoch = Date.now();

    if (!timerDuration || !timeSpentOnPage) {
      console.error("local storage not set correctly");
      clearTimerLocalStorage();
      return;
    }
    if (newTimeSpentOnPage >= Number(timerDuration) && !showSurveyPopup) {
      setLocalStorage(TIME_SPENT_ON_PAGE_KEY, String(newTimeSpentOnPage));

      setShowSurveyPopup(true);
      setPollingTimer(false);
    }
    const lastUpdateEpoch = getLocalStorage(LAST_UPDATE_KEY);
    if (
      lastUpdateEpoch &&
      currentEpoch - Number(lastUpdateEpoch) <= TIMER_UPDATE_INTERVAL_MS * 0.9
    ) {
      //if atleast 90% of the interval has not passed since last update, then don't update
      return;
    }
    setLocalStorage(LAST_UPDATE_KEY, String(currentEpoch));
    setLocalStorage(TIME_SPENT_ON_PAGE_KEY, String(newTimeSpentOnPage));
  }

  useEffect(() => {
    if (
      configLoadStatus == LoadStatus.LOADED &&
      userDataLoadStatus == LoadStatus.LOADED
    ) {
      checkForSurveyPopupVariables(userDataInState, configInState);
    }
  }, [configLoadStatus, userDataLoadStatus]);

  useEffect(() => {
    if (!pollingTimer) {
      return;
    }
    const id = setInterval(
      () => pollTimer(),
      pollingTimer ? TIMER_UPDATE_INTERVAL_MS : undefined
    );
    return () => clearInterval(id);
  }, [pollingTimer]);

  useEffect(() => {
    if (showSurveyPopup) {
      setTitle(generateSurveyPopupTitle());
    }
  }, [showSurveyPopup, pollingTimer]);

  function onClose() {
    // Clear local storage if enough time was spent on page
    const timeSpentOnPageFromLocalStorage = getLocalStorage(
      TIME_SPENT_ON_PAGE_KEY
    );
    const timeSpentOnPage = timeSpentOnPageFromLocalStorage
      ? Number(timeSpentOnPageFromLocalStorage)
      : 0;
    const surveyWaitTimeFromLocalStorage =
      getLocalStorage(POST_SURVEY_TIME_KEY);
    const surveyWaitTime = surveyWaitTimeFromLocalStorage
      ? Number(surveyWaitTimeFromLocalStorage)
      : 0;
    if (
      timeSpentOnPageFromLocalStorage &&
      surveyWaitTimeFromLocalStorage &&
      timeSpentOnPage >= surveyWaitTime
    ) {
      clearTimerLocalStorage();
    }
    setShowSurveyPopup(false);
  }

  const sendUserData = () => {
    const localData = localStorage.getItem("userData");
    if (!localData) {
      return;
    }

    const data = JSON.parse(localData);
    if (!data.userID) {
      return;
    }
    const userData = {
      verb: "terminated",
      userid: data.userID,
      userEmail: data.userEmail,
      referrer: data.referrer,
      postSurveyTime: getLocalStorage(POST_SURVEY_TIME_KEY),
      timeSpentOnPage: getLocalStorage(POST_SURVEY_TIME_KEY),
      qualtricsUserId: getLocalStorage(LS_USER_ID_KEY),
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
            "https://mentorpal.org/xapi/verb/terminated": toXapiResultExtCustom(
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
  };

  const shouldExistInDisclaimer =
    configInState.surveyButtonInDisclaimer == "ALWAYS" ||
    (configInState.surveyButtonInDisclaimer == "PROVIDED_USER_IDENTIFIER" &&
      (userDataInState.givenUserEmail || userDataInState.givenUserId));

  return (
    <div data-cy="survey-container">
      {surveyLink && shouldExistInDisclaimer ? (
        <label>
          <Button
            onClick={() => {
              setShowSurveyPopup(true);
              printLocalStorage();
            }}
            data-cy="header-survey-popup-btn"
            data-survey-link={surveyLink}
          >
            Open Survey Popup
          </Button>
        </label>
      ) : undefined}
      <Dialog
        data-cy="survey-dialog"
        maxWidth="sm"
        fullWidth={true}
        open={showSurveyPopup}
      >
        <DialogTitle data-cy="survey-dialog-title">{title}</DialogTitle>
        <a
          href={surveyLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "24px", paddingBottom: "16px" }}
          data-cy="survey-link"
          onClick={sendUserData}
        >
          Careerfair Survey
        </a>
        <DialogContent>
          <Button data-cy="close-survey-popup-btn" onClick={onClose}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
