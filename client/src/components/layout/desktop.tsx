/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Chat from "components/chat";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import Topics from "components/topics/topics";
import Questions from "components/questions";

import React from "react";
import { Collapse } from "@material-ui/core";
import GuestPrompt from "components/guest-prompt";
import { MentorType, State } from "types";
import { UseWitInputtData } from "components/layout/use-input-data";
import Input from "components/input";
import "styles/history-chat-responsive.css";
import { useSelector } from "react-redux";

function Desktop(props: {
  mentorType: MentorType;
  chatHeight: number;
  windowHeight: number;
  hasSessionUser: () => boolean;
  curTopic: string;
}): JSX.Element {
  const { mentorType, chatHeight, windowHeight, hasSessionUser, curTopic } =
    props;
  const { onTopicSelected, onQuestionSelected } = UseWitInputtData();
  const displayGuestPrompt = useSelector<State, boolean>(
    (state) => state.config.displayGuestPrompt
  );

  const leftPanel = (
    <div>
      <VideoPanel />
      {mentorType === MentorType.CHAT ? (
        <Chat
          height={chatHeight}
          windowHeight={windowHeight}
          width={"auto"}
          bubbleColor={"#88929e"}
        />
      ) : (
        <Video playing={hasSessionUser() || !displayGuestPrompt} />
      )}
    </div>
  );

  const rightPanel = (
    <div>
      <Topics
        onSelected={onTopicSelected}
        showHistoryTab={mentorType === MentorType.CHAT}
      />
      <Collapse in={Boolean(curTopic)} timeout="auto" unmountOnExit>
        <Questions onSelected={onQuestionSelected} />
      </Collapse>
      {!hasSessionUser() && displayGuestPrompt ? <GuestPrompt /> : undefined}
      <Input />
    </div>
  );
  return (
    <div className="main-container" style={{ height: windowHeight - 60 }}>
      <div className="left-panel">{leftPanel}</div>
      <div className="right-panel">{rightPanel}</div>
    </div>
  );
}

export default Desktop;
