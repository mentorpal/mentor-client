import Chat from "components/chat";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import Topics from "components/topics/topics";
import Questions from "components/questions";

import React from "react";
import { Collapse } from "@material-ui/core";
import GuestPrompt from "components/guest-prompt";
import { MentorType } from "types";
import { UseWitInputtData } from "pages/use-input-data";
import Input from "components/input";
import "styles/history-chat-responsive.css";

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
  const leftPanel = (
    <div>
      <VideoPanel />
      {mentorType === MentorType.CHAT ? (
        <Chat
          height={chatHeight}
          windowHeight={windowHeight}
          width={"60vw"}
          bubbleColor={"#88929e"}
        />
      ) : (
        <Video playing={hasSessionUser()} />
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
      {!hasSessionUser() ? <GuestPrompt /> : undefined}
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
