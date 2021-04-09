/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { Hidden, Typography } from "@material-ui/core";
import { State } from "types";

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
  const headerStyleLogo = useSelector<State, string>(
    (state) => state.config.styleHeaderLogo
  );

  if (!mentor) {
    return <div />;
  }

  if (headerStyleLogo) {
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
          src={headerStyleLogo}
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
