/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { Sms, SmsFailed } from "@material-ui/icons";
import { MentorQuestionStatus, State } from "types";

interface MessageStatusState {
  isMentorLoaded: boolean;
  isOffTopic: boolean;
  mentorNext: string;
  mentorStatus: MentorQuestionStatus;
}

function MessageStatus(args: { mentor: string }): JSX.Element {
  const { mentor } = args;
  const msgStatusState = useSelector<State, MessageStatusState>((state) => {
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
}

export default MessageStatus;
