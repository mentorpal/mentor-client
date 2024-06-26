/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, IconButton, FormGroup, Switch } from "@mui/material";
import DownloadIcon from "@mui/icons-material/GetApp";

import { toggleHistoryVisibility } from "store/actions";
import { useWithChatData } from "./chat/use-chat-data";
import { State } from "types";

export default function History(props: {
  noHistoryDownload?: string;
}): JSX.Element {
  const dispatch = useDispatch();
  const curTopic = useSelector<State, string>((state) => state.curTopic);
  const { visibilityShowAllPref, downloadChatHistory } = useWithChatData();
  return (
    <div
      className="input-history"
      style={{ visibility: curTopic === "History" ? "visible" : "hidden" }}
    >
      <Typography>History: </Typography>
      <div>
        <FormGroup className="togglePos">
          <Switch
            size="medium"
            checked={visibilityShowAllPref}
            onChange={() => {
              dispatch(toggleHistoryVisibility());
            }}
            data-cy="visibility-switch"
          />
        </FormGroup>
      </div>
      {props.noHistoryDownload ? undefined : (
        <IconButton
          data-cy="download-history-btn"
          onClick={downloadChatHistory}
          size="large"
        >
          <DownloadIcon />
        </IconButton>
      )}
    </div>
  );
}
