import React from "react";
import { useSelector } from "react-redux";
import { Sms, SmsFailed } from "@material-ui/icons";
import { MentorQuestionStatus, State } from "store/types";

interface MessageStatusState {
  isMentorLoaded: boolean;
  isOffTopic: boolean;
  mentorNext: string;
  mentorStatus: MentorQuestionStatus;
}

const MessageStatus = (args: { mentor: string }) => {
  const { mentor } = args;
  const msgStatusState = useSelector<State, MessageStatusState>(state => {
    const m = state.mentorsById[mentor];
    return {
      isMentorLoaded: Boolean(m),
      isOffTopic: Boolean(m && m.is_off_topic),
      mentorNext: state.mentorNext,
      mentorStatus: m && m.status,
    };
  });
  if (!msgStatusState.isMentorLoaded || msgStatusState.isOffTopic) {
    return <div />;
  }
  switch (msgStatusState.mentorStatus) {
    case MentorQuestionStatus.ERROR:
      return (
        <SmsFailed
          className="message-notice"
          fontSize="small"
          style={{ color: "red" }}
        />
      );
    case MentorQuestionStatus.READY:
      return (
        <Sms
          className={`message-notice ${
            mentor === msgStatusState.mentorNext ? "blink" : ""
          }`}
          fontSize="small"
          style={{ color: "green" }}
        />
      );
    default:
      return <div />;
  }
};

export default MessageStatus;
