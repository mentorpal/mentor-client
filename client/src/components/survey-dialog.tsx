/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import {
  getLocalStorage,
  printLocalStorage,
  removeLocalStorageItem,
  setLocalStorage,
} from "utils";
import { sendCmi5Statement, toXapiResultExtCustom } from "cmiutils";
import { useSelector } from "react-redux";
import { Config, State } from "types";

export function SurveyDialog(): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [pollingTimer, setPollingTimer] = useState<boolean>(false);
  const [showSurveyPopup, setShowSurveyPopup] = useState<boolean>(false);
  const [surveyLink, setSurveyLink] = useState<string>();
  const config = useSelector<State, Config>((state) => state.config);
  const chatSessionId = useSelector<State, string>(
    (state) => state.chatSessionId
  );
  const sessionIdInState = useSelector<State, string>(
    (state) => state.sessionId
  );

  function checkForSurveyPopupVariables() {
    const localStorageTimerPopup = getLocalStorage("postsurveytime");
    const qualtricsUserIdLocalStorage = getLocalStorage("qualtricsuserid");
    const searchParams = new URL(location.href).searchParams;
    const postsurveytime =
      searchParams.get("postsurveytime") ||
      localStorageTimerPopup ||
      `${config.postSurveyTimer}`;
    if (postsurveytime) {
      setLocalStorage("postsurveytime", postsurveytime);
    }
    let qualtricsuserid =
      searchParams.get("userid") || qualtricsUserIdLocalStorage;
    if (qualtricsuserid) {
      setLocalStorage("qualtricsuserid", qualtricsuserid);
    } else {
      qualtricsuserid = getLocalStorage("qualtricsuserid");
      if (!qualtricsuserid) {
        const localData = getLocalStorage("userData");
        if (localData) {
          const data = JSON.parse(localData);
          if (data.userID) {
            qualtricsuserid = data.userID;
          }
        }
      }
    }
    const timertext = searchParams.get("timertext");
    if (timertext) {
      setLocalStorage("timertext", timertext);
    }
    if (config.postSurveyLink && qualtricsuserid) {
      setSurveyLink(`${config.postSurveyLink}?userid=${qualtricsuserid}`);
    }
    if (
      postsurveytime &&
      Number(postsurveytime) > 0 &&
      qualtricsuserid &&
      config.postSurveyLink
    ) {
      const localStorageTimeSpent = getLocalStorage("timespentonpage");
      setLocalStorage("timespentonpage", localStorageTimeSpent || "0");
      setPollingTimer(true);
    }
  }

  function clearTimerLocalStorage() {
    removeLocalStorageItem("timespentonpage");
    removeLocalStorageItem("postsurveytime");
    removeLocalStorageItem("qualtricsuserid");
    removeLocalStorageItem("timertext");
    setPollingTimer(false);
  }

  function generateSurveyPopupTitle(): string {
    const timerTextFromLocalStorage = getLocalStorage("timertext");
    if (timerTextFromLocalStorage) {
      return timerTextFromLocalStorage;
    }

    const timeSpentOnPageFromLocalStorage = getLocalStorage("timespentonpage");
    const timeSpentOnPage = timeSpentOnPageFromLocalStorage
      ? Number(timeSpentOnPageFromLocalStorage)
      : 0;

    const surveyWaitTimeFromLocalStorage = getLocalStorage("postsurveytime");
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
    const timeSpentOnPage = getLocalStorage("timespentonpage");
    const newTimeSpentOnPage = Number(timeSpentOnPage) + 10;
    const timerDuration = getLocalStorage("postsurveytime");
    const currentEpoch = Date.now();

    if (!timerDuration || !timeSpentOnPage) {
      console.error("local storage not set correctly");
      clearTimerLocalStorage();
      return;
    }
    if (newTimeSpentOnPage >= Number(timerDuration) && !showSurveyPopup) {
      setLocalStorage("timespentonpage", String(newTimeSpentOnPage));

      setShowSurveyPopup(true);
      setPollingTimer(false);
    }
    const lastUpdateEpoch = getLocalStorage("lastupdateepoch");
    if (lastUpdateEpoch && currentEpoch - Number(lastUpdateEpoch) <= 9800) {
      //if atleast 9.8 seconds has not passed since last update, then don't update
      return;
    }
    setLocalStorage("lastupdateepoch", String(currentEpoch));
    setLocalStorage("timespentonpage", String(newTimeSpentOnPage));
  }

  useEffect(() => {
    if (!pollingTimer) {
      return;
    }
    const id = setInterval(() => pollTimer(), pollingTimer ? 10000 : undefined);
    return () => clearInterval(id);
  }, [pollingTimer]);

  useEffect(() => {
    if (showSurveyPopup) {
      setTitle(generateSurveyPopupTitle());
    }
  }, [showSurveyPopup, pollingTimer]);

  useEffect(() => {
    if (config && config.postSurveyLink) {
      checkForSurveyPopupVariables();
    }
  }, [config]);

  function onClose() {
    // Clear local storage if enough time was spent on page
    const timeSpentOnPageFromLocalStorage = getLocalStorage("timespentonpage");
    const timeSpentOnPage = timeSpentOnPageFromLocalStorage
      ? Number(timeSpentOnPageFromLocalStorage)
      : 0;
    const surveyWaitTimeFromLocalStorage = getLocalStorage("postsurveytime");
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

  return (
    <div>
      {surveyLink ? (
        <label>
          <Button
            onClick={() => {
              setShowSurveyPopup(true);
              printLocalStorage();
            }}
            data-cy="header-survey-popup-btn"
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
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
