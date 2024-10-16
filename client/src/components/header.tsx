/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { Tooltip, Typography } from "@mui/material";
import { State } from "types";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import "styles/layout.css";
import Disclaimer from "./disclaimer/disclaimer";
import { getLocalStorageUserData, getRegistrationId } from "utils";
import {
  EMAIL_URL_PARAM_KEY,
  QUALTRICS_USER_ID_URL_PARAM_KEY,
  REFERRER_KEY,
  REGISTRATION_ID_KEY,
  SESSION_URL_PARAM_KEY,
} from "local-constants";
import { useWithWindowSize } from "use-with-window-size";

interface HeaderMentorData {
  _id: string;
  name: string;
  title: string;
}

function Header(): JSX.Element {
  const mentor = useSelector<State, HeaderMentorData | null>((state) => {
    if (!state.curMentor) {
      return null;
    }
    const m = state.mentorsById[state.curMentor];
    if (!(m && m.mentor)) {
      return null;
    }
    return {
      _id: m.mentor._id,
      name: m.mentor.name,
      title: m.mentor.title,
    };
  });
  const { isMobile } = useWithWindowSize();
  const styleHeaderLogo = useSelector<State, string>(
    (state) => state.config.styleHeaderLogo?.trim() || ""
  );
  const styleHeaderLogoUrl = useSelector<State, string>(
    (state) => state.config.styleHeaderLogoUrl?.trim() || ""
  );
  const styleHeaderColor = useSelector<State, string>(
    (state) => state.config.styleHeaderColor?.trim() || "#FFFFFF"
  );
  const styleHeaderTextColor = useSelector<State, string>(
    (state) => state.config.styleHeaderTextColor?.trim() || "#000000"
  );
  const sessionIdInState = useSelector<State, string>(
    (state) => state.sessionId
  );

  if (!mentor) {
    return <></>;
  }

  const handleClickHome = () => {
    const localData = getLocalStorageUserData();
    const userEmail = localData.givenUserEmail;
    const userID = localData.givenUserId;
    const referrer = localData.referrer;
    let link = `/home/?${REFERRER_KEY}=${referrer}`;
    userEmail &&
      (link += `&${EMAIL_URL_PARAM_KEY}=${encodeURIComponent(userEmail)}`);
    userID && (link += `&${QUALTRICS_USER_ID_URL_PARAM_KEY}=${userID}`);
    sessionIdInState &&
      (link += `&${SESSION_URL_PARAM_KEY}=${sessionIdInState}`);
    link += `&${REGISTRATION_ID_KEY}=${getRegistrationId()}`;
    window.location.href = link;
  };

  const MentorNameTitle = `${mentor.name}: ${mentor.title}`;
  const mentorTitleTooLong = isMobile && MentorNameTitle.length > 60;
  const displayMentorNameTitle = mentorTitleTooLong
    ? MentorNameTitle.slice(0, 60).concat("...")
    : MentorNameTitle;
  return (
    <div
      data-cy="header"
      data-mentor={mentor._id}
      style={{
        backgroundColor: `${styleHeaderColor}`,
        color: `${styleHeaderTextColor}`,
      }}
      className="header-container"
    >
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        {styleHeaderLogo ? (
          styleHeaderLogoUrl ? (
            <a href={styleHeaderLogoUrl}>
              <img
                src={styleHeaderLogo}
                style={{
                  height: 40,
                  marginLeft: 10,
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
              />
            </a>
          ) : (
            <img
              src={styleHeaderLogo}
              style={{
                height: 40,
                marginLeft: 10,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            />
          )
        ) : undefined}
        <div className="home-btn-wrapper">
          {mentor.name !== "USC" ? (
            <IconButton
              aria-label="information"
              component="span"
              style={{
                color: `${styleHeaderTextColor}`,
              }}
              className="home-btn"
              onClick={handleClickHome}
              data-cy="home-button"
              size="large"
            >
              <HomeIcon />
            </IconButton>
          ) : (
            ""
          )}
        </div>
      </div>
      <Tooltip title={mentorTitleTooLong ? MentorNameTitle : ""}>
        <div className="header-mentor-info">
          <Typography>{displayMentorNameTitle}</Typography>
        </div>
      </Tooltip>
      <div>
        <Disclaimer />
      </div>
    </div>
  );
}

export default Header;
