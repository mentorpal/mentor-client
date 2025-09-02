/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

export const LAST_UPDATE_KEY = "lastupdateepoch";
export const POST_SURVEY_TIME_KEY = "postsurveytime";
export const TIME_SPENT_ON_PAGE_KEY = "timespentonpage";
export const TIMER_TEXT_KEY = "timertext";
export const TIMER_UPDATE_INTERVAL_MS = 2000;

export function resetTimeSpentOnPage(): void {
  const curTimeSpentOnPage = getSurveyPopupData()[TIME_SPENT_ON_PAGE_KEY];
  if (!curTimeSpentOnPage) {
    return;
  }
  setSurveyPopupData({ [TIME_SPENT_ON_PAGE_KEY]: "0" });
}

/**
 * Interface for survey config
 * @param surveyLink - The link to the survey.
 * @param showSurveyPopupAfterSeconds - How long to wait before showing the survey popup.
 * @param showManualOpenButton - Whether we should display a button that the user can use to manually open the survey popup
 * @param showSurveyPopupAfterTimer - Whether we should display the survey popup after the timer
 */
export interface SurveyConfig {
  surveyLink: string;
  showSurveyPopupAfterSeconds: number;
  showManualOpenButton: boolean;
  showSurveyPopupAfterTimer: boolean;
}

export interface SurveyUserData {
  userId: string;
  userEmail: string;
  referrer: string;
}

export interface SurveyPopupData {
  [POST_SURVEY_TIME_KEY]?: string;
  [TIMER_TEXT_KEY]?: string;
  [TIME_SPENT_ON_PAGE_KEY]?: string;
  [LAST_UPDATE_KEY]?: string;
}

export interface SurveyLinkClickData {
  verb: string;
  userid?: string;
  userEmail?: string;
  referrer?: string;
  [POST_SURVEY_TIME_KEY]?: string;
  [TIME_SPENT_ON_PAGE_KEY]?: string;
}

export interface SurveyDialogProps {
  config: SurveyConfig;
  userData: SurveyUserData;
  onSurveyLinkClick: (surveyLinkClickData: SurveyLinkClickData) => void;
}

const SURVEY_POPUP_DATA_KEY = "survey-popup-data";

// Helper functions for localStorage
function getSurveyPopupData(): SurveyPopupData {
  const data = localStorage.getItem(SURVEY_POPUP_DATA_KEY);
  return data ? JSON.parse(data) : {};
}

function setSurveyPopupData(data: Partial<SurveyPopupData>) {
  const current = getSurveyPopupData();
  const updated = { ...current, ...data };
  localStorage.setItem(SURVEY_POPUP_DATA_KEY, JSON.stringify(updated));
}

function clearSurveyPopupData() {
  localStorage.removeItem(SURVEY_POPUP_DATA_KEY);
}

export function SurveyDialog({
  config,
  userData,
  onSurveyLinkClick,
}: SurveyDialogProps): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [pollingTimer, setPollingTimer] = useState<boolean>(false);
  const [showSurveyPopup, setShowSurveyPopup] = useState<boolean>(false);
  const [surveyLink, setSurveyLink] = useState<string>();

  function checkForSurveyPopupVariables(config: SurveyConfig) {
    const searchParams = new URL(location.href).searchParams;
    const popupData = getSurveyPopupData();

    const postsurveytime =
      searchParams.get(POST_SURVEY_TIME_KEY) ||
      popupData[POST_SURVEY_TIME_KEY] ||
      (config.showSurveyPopupAfterSeconds &&
        `${config.showSurveyPopupAfterSeconds}`) ||
      "";
    const timertext =
      searchParams.get(TIMER_TEXT_KEY) || popupData[TIMER_TEXT_KEY] || "";

    const updatedData: Partial<SurveyPopupData> = {};
    if (postsurveytime) updatedData[POST_SURVEY_TIME_KEY] = postsurveytime;
    if (timertext) updatedData[TIMER_TEXT_KEY] = timertext;

    if (Object.keys(updatedData).length > 0) {
      setSurveyPopupData(updatedData);
    }

    if (config.surveyLink) {
      const url = new URL(config.surveyLink);
      setSurveyLink(url.href);
    }

    const shouldSurveyPopupAfterTimer = config.showSurveyPopupAfterTimer;

    if (
      postsurveytime &&
      Number(postsurveytime) > 0 &&
      shouldSurveyPopupAfterTimer
    ) {
      const currentPopupData = getSurveyPopupData();
      setSurveyPopupData({
        [LAST_UPDATE_KEY]: String(Date.now()),
        [TIME_SPENT_ON_PAGE_KEY]:
          currentPopupData[TIME_SPENT_ON_PAGE_KEY] || "0",
      });
      setPollingTimer(true);
    }
  }

  function clearTimerLocalStorage() {
    clearSurveyPopupData();
    setPollingTimer(false);
  }

  function generateSurveyPopupTitle(): string {
    const popupData = getSurveyPopupData();
    if (popupData[TIMER_TEXT_KEY]) {
      return popupData[TIMER_TEXT_KEY];
    }

    const timeSpentOnPage = popupData[TIME_SPENT_ON_PAGE_KEY]
      ? Number(popupData[TIME_SPENT_ON_PAGE_KEY])
      : 0;

    const surveyWaitTime = popupData[POST_SURVEY_TIME_KEY]
      ? Number(popupData[POST_SURVEY_TIME_KEY])
      : 0;

    const timeSpentOnPageText =
      timeSpentOnPage > 60
        ? `${Math.round(timeSpentOnPage / 60)} minutes`
        : `${timeSpentOnPage} seconds`;
    let surveyPopupTitleText = "";
    if (
      !popupData[POST_SURVEY_TIME_KEY] ||
      !popupData[TIME_SPENT_ON_PAGE_KEY]
    ) {
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
    const currentEpoch = Date.now();
    const popupData = getSurveyPopupData();
    const timeSpentOnPage = popupData[TIME_SPENT_ON_PAGE_KEY]
      ? Number(popupData[TIME_SPENT_ON_PAGE_KEY])
      : 0;
    const newTimeSpentOnPage =
      timeSpentOnPage + TIMER_UPDATE_INTERVAL_MS / 1000;
    const timerDuration = popupData[POST_SURVEY_TIME_KEY]
      ? Number(popupData[POST_SURVEY_TIME_KEY])
      : 0;

    if (
      !popupData[POST_SURVEY_TIME_KEY] ||
      popupData[TIME_SPENT_ON_PAGE_KEY] === undefined
    ) {
      console.error("survey popup data not set correctly");
      clearTimerLocalStorage();
      return;
    }
    if (newTimeSpentOnPage >= timerDuration && !showSurveyPopup) {
      setSurveyPopupData({
        [TIME_SPENT_ON_PAGE_KEY]: String(newTimeSpentOnPage),
      });
      setShowSurveyPopup(true);
      setPollingTimer(false);
    }
    setSurveyPopupData({
      [LAST_UPDATE_KEY]: String(currentEpoch),
      [TIME_SPENT_ON_PAGE_KEY]: String(newTimeSpentOnPage),
    });
  }

  useEffect(() => {
    checkForSurveyPopupVariables(config);
  }, [config]);

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
    const popupData = getSurveyPopupData();
    const timeSpentOnPage = popupData[TIME_SPENT_ON_PAGE_KEY]
      ? Number(popupData[TIME_SPENT_ON_PAGE_KEY])
      : 0;
    const surveyWaitTime = popupData[POST_SURVEY_TIME_KEY]
      ? Number(popupData[POST_SURVEY_TIME_KEY])
      : 0;
    if (
      popupData[TIME_SPENT_ON_PAGE_KEY] &&
      popupData[POST_SURVEY_TIME_KEY] &&
      timeSpentOnPage >= surveyWaitTime
    ) {
      clearTimerLocalStorage();
    }
    setShowSurveyPopup(false);
  }

  const sendUserData = () => {
    const popupData = getSurveyPopupData();
    const surveyLinkClickData: SurveyLinkClickData = {
      verb: "terminated",
      userid: userData.userId,
      userEmail: userData.userEmail,
      referrer: userData.referrer,
      [POST_SURVEY_TIME_KEY]: popupData[POST_SURVEY_TIME_KEY],
      [TIME_SPENT_ON_PAGE_KEY]: popupData[TIME_SPENT_ON_PAGE_KEY],
    };
    onSurveyLinkClick(surveyLinkClickData);
  };

  return (
    <div data-cy="survey-container">
      {surveyLink && config.showManualOpenButton ? (
        <label>
          <Button
            onClick={() => {
              setShowSurveyPopup(true);
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
