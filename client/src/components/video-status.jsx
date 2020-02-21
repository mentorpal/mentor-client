import React from "react";
import { useSelector } from "react-redux";
import { Sms, SmsFailed } from "@material-ui/icons";

import { MentorQuestionStatus } from "@/store/types";

const MessageStatus = ({ mentor }) => {
  const mentorNext = useSelector(state => state.mentorNext);

  if (!mentor || mentor.is_off_topic) {
    return <div />;
  }
  if (mentor.status === MentorQuestionStatus.ERROR) {
    return (
      <SmsFailed
        className="message-notice"
        fontSize="small"
        style={{ color: "red" }}
      />
    );
  }
  if (mentor.status === MentorQuestionStatus.READY) {
    const isNext = mentor.id === mentorNext;
    return (
      <Sms
        className={`message-notice ${isNext ? "blink" : ""}`}
        fontSize="small"
        style={{ color: "green" }}
      />
    );
  }
  return <div />;
};

export default MessageStatus;
