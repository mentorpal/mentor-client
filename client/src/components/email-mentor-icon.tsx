/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import MailIcon from "@mui/icons-material/Mail";
import { getLocalStorage, setLocalStorage } from "utils";
import "styles/video.css";
import { Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import { MentorState, State } from "types";
import { useWithScreenOrientation } from "use-with-orientation";

interface MentorData {
  name: string;
  allowContact: boolean;
}

export default function EmailMentorIcon(): JSX.Element {
  const disclaimerDisplayed = getLocalStorage("viewedDisclaimer");
  const [disclaimerOpen, setDisclaimerOpen] = useState<boolean>(false);
  const [mentorData, setMentorData] = useState<MentorData>();
  const { displayFormat } = useWithScreenOrientation();

  const sendMail = (email: string, subject: string): void => {
    const url = `mailto:${email}?subject=${subject}`;
    window.open(url);
  };

  const configEmailMentorAddress = useSelector<State, string>(
    (state) => state.config.filterEmailMentorAddress
  );

  const curMentor = useSelector<State, string>((state) => state.curMentor);

  const mentorsById = useSelector<State, Record<string, MentorState>>(
    (state) => state.mentorsById
  );

  useEffect(() => {
    if (!curMentor || !mentorsById) {
      return;
    }
    const curMentorData = mentorsById[curMentor];
    setMentorData({
      name: curMentorData.mentor.name,
      allowContact: curMentorData.mentor.allowContact,
    });
  }, [curMentor, mentorsById]);

  // TODO: fetch mentor data here from redux, no need to rely on the data being passed in

  useEffect(() => {
    if (!disclaimerDisplayed || disclaimerDisplayed !== "true") {
      setDisclaimerOpen(true);
    }
  }, []);

  function onCloseDisclaimer() {
    setDisclaimerOpen(false);
    if (!disclaimerDisplayed) {
      setLocalStorage("viewedDisclaimer", "true");
    }
  }

  return (
    <>
      {mentorData?.name &&
      mentorData?.allowContact &&
      configEmailMentorAddress ? (
        <Tooltip
          data-cy="email-disclaimer"
          open={disclaimerOpen}
          onClose={onCloseDisclaimer}
          onOpen={() => setDisclaimerOpen(true)}
          title={
            <div
              style={{
                fontSize: "15px",
                pointerEvents: "auto",
                cursor: !disclaimerDisplayed ? "pointer" : "none",
              }}
              onClick={() => onCloseDisclaimer()}
            >
              Please only contact mentors through the provided contact email.
              Messages sent directly to other mentor emails found online may be
              ignored.
              {!disclaimerDisplayed ? (
                <>
                  <br /> <br /> Click here to close
                </>
              ) : (
                ""
              )}
            </div>
          }
          arrow
        >
          <div
            data-cy="email-mentor-icon"
            className="email-mentor-button"
            style={{
              width: displayFormat == "mobile" ? "fit-content" : "100%",
            }}
            onClick={() =>
              sendMail(
                configEmailMentorAddress,
                `Contacting ${mentorData.name} for more information`
              )
            }
          >
            Email Mentor <MailIcon />
          </div>
        </Tooltip>
      ) : undefined}
    </>
  );
}
