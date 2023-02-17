/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Collapse, Paper } from "@mui/material";

import Topics from "components/topics/topics";
import Questions from "components/questions";
import { UseWitInputtData } from "components/layout/use-input-data";
import Input from "components/input";
import History from "components/history";
import { MentorType } from "types";
import "styles/history-chat-responsive.css";

function ChatSection(props: {
  mentorType: MentorType;
  curTopic: string;
  isMobile: boolean;
  noHistoryDownload?: string;
}): JSX.Element {
  const { mentorType, curTopic, isMobile } = props;
  const { onTopicSelected, onQuestionSelected } = UseWitInputtData();

  if (isMobile) {
    return (
      <>
        <Paper>
          <Input />
          <Topics
            isMobile={isMobile}
            onSelected={onTopicSelected}
            showHistoryTab={mentorType === MentorType.CHAT}
          />
          <History noHistoryDownload={props.noHistoryDownload} />
          <Collapse in={Boolean(curTopic)} timeout="auto" unmountOnExit>
            <Questions isMobile={isMobile} onSelected={onQuestionSelected} />
          </Collapse>
        </Paper>
      </>
    );
  } else {
    return (
      <div style={{ flexDirection: "column" }}>
        <Topics
          isMobile={isMobile}
          onSelected={onTopicSelected}
          showHistoryTab={mentorType === MentorType.CHAT}
        />
        <div style={{ height: "calc(100vh - 240px)" }}>
          <Collapse in={Boolean(curTopic)} timeout="auto" unmountOnExit>
            <Questions isMobile={isMobile} onSelected={onQuestionSelected} />
          </Collapse>
        </div>
        <History noHistoryDownload={props.noHistoryDownload} />
        <Input />
      </div>
    );
  }
}

export default ChatSection;
