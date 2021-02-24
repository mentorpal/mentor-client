/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { Grid, Hidden, Typography } from "@material-ui/core";
import config from "config";
import { MentorData, State } from "store/types";

function Header(): JSX.Element {
  const mentor = useSelector<State, MentorData>(
    state => state.mentorsById[state.curMentor]
  );

  if (config.HEADER_LOGO) {
    return (
      <Grid
        id="header"
        container
        direction="row"
        alignItems="center"
        style={{ padding: "2px 4px", height: 50 }}
      >
        <Grid item style={{ position: "absolute", textAlign: "left" }}>
          <img src={config.HEADER_LOGO} style={{ height: 50 }} />
        </Grid>
        <Hidden only="xs">
          <Grid item sm={12}>
            <Typography>
              {mentor ? `${mentor.name}: ${mentor.title}` : undefined}
            </Typography>
          </Grid>
        </Hidden>
      </Grid>
    );
  }

  return (
    <div
      id="header"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: 50,
      }}
    >
      <Typography>
        {mentor ? `${mentor.name}: ${mentor.title}` : undefined}
      </Typography>
    </div>
  );
}

export default Header;
