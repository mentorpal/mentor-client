/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import {
  List,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
// import { ArrowForwardIos } from "@material-ui/icons";

import {
  FormGroup,
  FormControlLabel,
  Switch,
} from "@material-ui/core";

import {
  ChatData,
  Feedback,
  State,
} from "types";
import "styles/history-chat.css";
import ChatItem from "./history-item";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "auto",
  },
  list: {
    marginTop: 1,
    padding: 10,
    maxHeight: "20vh",
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: "#88929e",
  },
  GOOD: {
    backgroundColor: "#00bf00",
  },
  BAD: {
    backgroundColor: "#E63535",
  },
  icon: {
    position: "absolute",
    right: -40,
  },
  feedbackPopup: {
    borderRadius: "30px",
  },
  chat_container: {
    backgroundColor: "#fff",
  },
  introMsg: {
    marginLeft: "0rem !important",
  },
  visibilityBtn: {
    marginLeft: "5px",
  },
}));

interface ScrollingQuestionsParams {
  height: number;
  questionHistory: string[];
}

export function HistoryChat(args: ScrollingQuestionsParams): JSX.Element {
  const { height } = args;
  const styles = useStyles();
  const chatData = useSelector<State, ChatData>((s)=> s.chat);
  const [checked, toggleChecked] = useState<boolean>(false);
  // const [hide, setHide] = useState<boolean>(false);
  const [answerIndex, setAnswerIndex] = useState<number>(-1);
  // const [mentorProps, setMentorProps] = useState<BubbleProps>({
  //   name: "",
  //   color: "",
  // });

  // const answerReceivedAt = useSelector<State, Date | undefined>((state) => {
  //   const m = state.mentorsById[state.curMentor];
  //   if (!(m && m.answerReceivedAt)) {
  //     return undefined;
  //   }
  //   return m.answerReceivedAt;
  // });
  // const mentor = useSelector<State, MentorState>(
  //   (state) => state.mentorsById[state.curMentor]
  // );


  // const curQuestion = useSelector<State, string>((state) => state.curQuestion);
  // const curQuestionUpdatedAt = useSelector<State, Date | undefined>(
  //   (state) => state.curQuestionUpdatedAt
  // );

  // useEffect(() => {
  //   const chatDataUpdated: ChatData = {
  //     ...chatData,
  //     messages: [...chatData.messages],
  //   };

  //   let updated = false;
  //   if (chatDataUpdated.lastQuestionAt !== curQuestionUpdatedAt) {
  //     updated = true;
  //     chatDataUpdated.messages.push({
  //       name: mentor.mentor.name,
  //       color: "",
  //       isUser: true,
  //       text: curQuestion,
  //     });
  //     chatDataUpdated.lastQuestionAt = curQuestionUpdatedAt;
  //   }
  //   if (mentor) {
  //     if (chatDataUpdated.messages.length === 0) {
  //       updated = true;
  //       chatDataUpdated.messages.push({
  //         name: mentor.mentor.name,
  //         color: "",
  //         isUser: false,
  //         text:
  //           getUtterance(mentor.mentor, UtteranceName.INTRO)?.transcript || "",
  //       });
  //     }
  //     if (chatDataUpdated.lastAnswerAt !== answerReceivedAt) {
  //       updated = true;
  //       chatDataUpdated.messages.push({
  //         name: mentor.mentor.name,
  //         color: "",
  //         isUser: false,
  //         text: mentor.answer_text || "",
  //         // there is not answerFeedbackId in the mentor object, so it was changed to answer_id
  //         // random number added to differentiate message and provide a feedback
  //         feedbackId:
  //           mentor.answerFeedbackId +
  //           String(Math.floor(Math.random() * 10000) + 1),
  //       });
  //       console.log(`chatDataUpdated: ${chatDataUpdated}`);

  //       chatDataUpdated.lastAnswerAt = answerReceivedAt;
  //     }
  //   }
  //   if (updated) {
  //     setChatData(chatDataUpdated);
  //   }
  //   console.log("-----updated-----");
  // }, [mentor, curQuestionUpdatedAt]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [chatData.messages]);

  function onSendFeedback(id: string, feedback: Feedback) {
    const ix = chatData.messages.findIndex((f) => f.feedbackId === id)
    if (ix === -1) {
      return;
    }
    // setChatData({
    //   ...chatData,
    //   messages: [
    //     ...chatData.messages.slice(0, ix),
    //     {
    //       ...chatData.messages[ix],
    //       feedback,
    //     },
    //     ...chatData.messages.slice(ix + 1),
    //   ],
    // });
  }


  const toggleAnswers = (
    <div>
      <FormGroup className="togglePos">
        <FormControlLabel
          control={
            <Switch
              size="medium"
              checked={checked}
              onChange={() => toggleChecked((prev) => !prev)}
              data-cy="visibility-switch"
            />
          }
          label="hide/show"
        />
      </FormGroup>
    </div>
  );
  // console.log(chatData.messages.map((m, i) => console.log(i, m)))

  return (
    <div
      data-cy="history-chat"
      // id="history-chat"
      data-topic="History"
      className={styles.chat_container}
    >
      <List
        data-cy="chat-thread"
        className={styles.list}
        style={{ height: height }}
        disablePadding={true}
        id="chat-thread"
      >
        {toggleAnswers}
        {chatData.messages.map((m, i) => {
          return (<div key={i} style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
           
            <ChatItem
              key={`chat-msg-${i}`}
              message={m}
              i={i}
              styles={styles}
              onSendFeedback={onSendFeedback}
              answersVisibility={checked}
              setAnswerIndex={setAnswerIndex}
              // answerIndex={answerIndex}
              // mentorBubbleProps={chatData.bubbleProps[i]}
            />
            </div>
          );
        })}
      </List>
    </div>
  );
}

export default HistoryChat;
