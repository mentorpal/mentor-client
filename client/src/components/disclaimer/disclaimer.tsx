/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Config, DisplaySurveyPopupCondition, LoadStatus, State } from "types";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import Tooltip from "@mui/material/Tooltip";
import {
  SurveyDialog,
  SurveyConfig,
  SurveyUserData,
} from "components/survey-dialog";
import { sendCmi5Statement, toXapiResultExtCustom } from "cmiutils";
import { LocalStorageUserData } from "utils";
import { QUALTRICS_USER_ID_URL_PARAM_KEY, REFERRER_KEY } from "local-constants";

export default function Disclaimer(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const disclaimerText = useSelector<State, string>(
    (state) => state.config.disclaimerText
  );
  const disclaimerTitle = useSelector<State, string>(
    (state) => state.config.disclaimerTitle?.trim() || "Please Configure Title"
  );
  const config = useSelector<State, Config>((state) => state.config);
  const configLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.configLoadStatus
  );
  const chatSessionId = useSelector<State, string>(
    (state) => state.chatSessionId
  );
  const sessionId = useSelector<State, string>((state) => state.sessionId);
  const userData = useSelector<State, LocalStorageUserData>(
    (state) => state.userData
  );
  const userDataLoadStatus = useSelector<State, LoadStatus>(
    (state) => state.userDataLoadStatus
  );
  const shouldExistInDisclaimer = Boolean(
    config.surveyButtonInDisclaimer == "ALWAYS" ||
      (config.surveyButtonInDisclaimer == "PROVIDED_USER_IDENTIFIER" &&
        (userData.givenUserId || userData.givenUserEmail))
  );

  const shouldSurveyPopupAfterTimer = Boolean(
    config.postSurveyLink && // always required
      (config.displaySurveyPopupCondition ==
        DisplaySurveyPopupCondition.ALWAYS ||
        (config.displaySurveyPopupCondition ==
          DisplaySurveyPopupCondition.USER_ID &&
          userData.givenUserId) ||
        (config.displaySurveyPopupCondition ==
          DisplaySurveyPopupCondition.USER_ID_AND_EMAIL &&
          userData.givenUserId &&
          userData.givenUserEmail))
  );
  const surveyLink = useMemo(() => {
    const link = config.postSurveyLink ? new URL(config.postSurveyLink) : null;
    if (!link) {
      return "";
    }
    if (config.postSurveyUserIdEnabled) {
      link.searchParams.append(
        QUALTRICS_USER_ID_URL_PARAM_KEY,
        userData.givenUserId || userData.xapiUserEmail || ""
      );
    }
    if (config.postSurveyReferrerEnabled) {
      link.searchParams.append(REFERRER_KEY, userData.referrer);
    }
    return link.toString();
  }, [
    config.postSurveyLink,
    config.postSurveyUserIdEnabled,
    config.postSurveyReferrerEnabled,
  ]);
  const surveyConfig: SurveyConfig = {
    surveyLink: surveyLink,
    showSurveyPopupAfterSeconds: config.postSurveyTimer,
    showManualOpenButton: shouldExistInDisclaimer,
    showSurveyPopupAfterTimer: shouldSurveyPopupAfterTimer,
  };
  const surveyUserData: SurveyUserData = {
    userId: userData.givenUserId || userData.xapiUserEmail || "",
    userEmail: userData.givenUserEmail || userData.xapiUserEmail || "",
    referrer: userData.referrer,
  };

  const handleSurveyLinkClick = (xapiUserData: {
    verb: string;
    userid?: string;
    userEmail?: string;
    referrer?: string;
    postSurveyTime?: string;
    timeSpentOnPage?: string;
  }) => {
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
            "https://mentorpal.org/xapi/verb/terminated": toXapiResultExtCustom(
              xapiUserData.verb,
              xapiUserData.userid || "",
              xapiUserData.userEmail || "",
              xapiUserData.referrer || "",
              xapiUserData.postSurveyTime || "",
              xapiUserData.timeSpentOnPage || "",
              xapiUserData.userid || ""
            ),
          },
        },
        object: {
          id: `${window.location.protocol}//${window.location.host}`,
          objectType: "Activity",
        },
      },
      chatSessionId,
      sessionId
    );
  };

  // Only render SurveyDialog if data is loaded
  const shouldRenderSurveyDialog =
    configLoadStatus === LoadStatus.LOADED &&
    userDataLoadStatus === LoadStatus.LOADED;

  return (
    <Tooltip title="Disclaimer">
      <div>
        <label htmlFor="icon-button-file">
          <IconButton
            component="span"
            onClick={() => setOpen(true)}
            data-cy="header-disclimer-btn"
            size="large"
          >
            <InfoIcon style={{ color: "white" }} />
          </IconButton>
        </label>
        <Modal
          open={true}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          data-cy="disclaimer-container"
          disableScrollLock={true}
          style={{ height: "100%", display: open ? "block" : "none" }}
        >
          <Box className="modal-animation">
            <div className="disclaimer-content-container">
              <Typography
                data-cy="disclaimer-title"
                id="modal-modal-title"
                variant="h4"
                component="h2"
                style={{ textAlign: "center" }}
              >
                {disclaimerTitle}
              </Typography>
              <div data-cy="disclaimer-text" id="modal-modal-description">
                <ReactMarkdown>
                  {disclaimerText
                    ? unescape(disclaimerText)
                    : "No policy avaliable"}
                </ReactMarkdown>
              </div>
              <Button
                style={{
                  margin: "auto",
                  marginTop: 10,
                  width: "100%",
                  fontWeight: "bold",
                }}
                onClick={() => setOpen(false)}
                data-cy="accept-disclaimer"
              >
                Accept
              </Button>
              <div
                style={{
                  margin: "auto",
                  marginTop: 10,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {shouldRenderSurveyDialog && (
                  <SurveyDialog
                    config={surveyConfig}
                    userData={surveyUserData}
                    onSurveyLinkClick={handleSurveyLinkClick}
                  />
                )}
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </Tooltip>
  );
}
