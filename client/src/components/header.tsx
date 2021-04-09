/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { Hidden, Typography } from "@material-ui/core";
import { Config, Mentor, State } from "types";

function Header(): JSX.Element {
  const mentor = useSelector<State, Mentor | null>((state) =>
    state.curMentor && state.mentorsById[state.curMentor]
      ? state.mentorsById[state.curMentor].mentor
      : null
  );
  const config = useSelector<State, Config>((state) => state.config);

  if (!mentor) {
    return <div />;
  }

  if (config.styleHeaderLogo) {
    return (
      <div
        id="header"
        data-mentor={mentor._id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 50,
        }}
      >
        <img
          src={config.styleHeaderLogo}
          style={{ position: "absolute", left: 0, height: 50 }}
        />
        <Hidden only="xs">
          <Typography>
            {mentor.name}: {mentor.title}
          </Typography>
        </Hidden>
      </div>
    );
  }

  return (
    <div
      id="header"
      data-mentor={mentor._id}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: 50,
      }}
    >
      <Typography>
        {mentor.name}: {mentor.title}
      </Typography>
    </div>
  );
}

export default Header;
