/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Popover,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";
import CloseIcon from "@material-ui/icons/Close";
import { Visibility, VisibilityOff } from "@material-ui/icons";

import { giveFeedback, getUtterance } from "api";
import {
  ChatMsg,
  ChatData,
  Config,
  Feedback,
  MentorState,
  State,
  UtteranceName,
} from "types";
import "styles/history-chat.css";


const useStyles = makeStyles((theme) => ({
  root: {
    width: "auto",
  },
  list: {
    marginTop: 1,
    padding: 10,
    maxHeight: "20vh"
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
    // backgroundColor: "black",
  },
  chat_container: {
      backgroundColor: '#fff',
  },
  introMsg: {
      marginLeft: "0rem !important",
  },
  visibilityBtn: {
    marginLeft: "5px",
  }
}));

function ChatItem(props: {
  message: ChatMsg;
  i: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
  onSendFeedback: (id: string, feedback: Feedback) => void;
}): JSX.Element {
  const { message, i, styles, onSendFeedback } = props;
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const config = useSelector<State, Config>((s) => s.config);
  const [showHideAnswer, setshowHideAnswer] = React.useState(true);

  // console.log(`index: ${i}`) 
  // console.log(` message: ${JSON.stringify(message)}`) 

  function handleFeedbackClick(event: React.MouseEvent<HTMLDivElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleFeedbackClose() {
    setAnchorEl(null);
  }

  function handleSelectFeedback(id: string, feedback: Feedback) {
    giveFeedback(id, feedback, config);
    setAnchorEl(null);
    onSendFeedback(id, feedback);
  }

  function LinkRenderer(props: { href: string; children: React.ReactNode }) {
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }
//   console.log(message)

  function onVisibility(idx:number){
    console.log(`index: ${idx}`)
    const answer = document.getElementById(`chat-msg-${i+1}`);
    if(answer){
      if (answer.style.display === "none") {
        answer.style.display = "block";
      } else {
        answer.style.display = "none";
      }
    }
    setshowHideAnswer(!showHideAnswer)
  }
  return (
    <ListItem
      data-cy={`chat-msg-${i}`}
      id={`chat-msg-${i}`}
      disableGutters={false}
      className={message.isUser ? "user" : "system"}
      classes={{ root: styles.root }}
      style={{
        paddingRight: 16,
        maxWidth: 750,
        marginLeft: message.feedbackId ? 50 : 0,
      }}
      
    >
      {message.isUser ? (showHideAnswer ? (<Visibility className="visibilityBtn" onClick={() => onVisibility(i)}/>): (<VisibilityOff className="visibilityBtn" onClick={() => onVisibility(i)}/>)) : null}
      <ReactMarkdown source={message.text} renderers={{ link: LinkRenderer }} />
      {message.feedbackId ? (
        <div
          data-cy="feedback-btn"
          className={styles.icon}
          onClick={handleFeedbackClick}
        >
          <ListItemAvatar>
            <Avatar
              className={[
                styles.avatar,
                message.feedback === Feedback.GOOD
                  ? styles.GOOD
                  : message.feedback === Feedback.BAD
                  ? styles.BAD
                  : undefined,
              ].join(" ")}
            >
              {message.feedback === Feedback.GOOD ? (
                <ThumbUpIcon data-cy="good" />
              ) : message.feedback === Feedback.BAD ? (
                <ThumbDownIcon data-cy="bad" />
              ) : (
                <ThumbsUpDownIcon data-cy="neutral" />
              )}
            </Avatar>
          </ListItemAvatar>
        </div>
      ) : undefined}
      <Popover
        id="feedback-popup"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFeedbackClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        elevation={0}
        className={styles.feedbackPopup}
      >
        <div
          id="feedback-popup-child"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#88929e",
            borderRadius: "30px",
            padding: 10,
            color: "#FFFFFF",
          }}
        >
          <Typography>Did this answer your question?</Typography>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              data-cy="click-good"
              onClick={() => {
                if (message.feedbackId) {
                  handleSelectFeedback(message.feedbackId, Feedback.GOOD);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar className={[styles.avatar, styles.GOOD].join(" ")}>
                  <ThumbUpIcon />
                </Avatar>
              </ListItemAvatar>
            </div>
            <div
              data-cy="click-neutral"
              onClick={() => {
                if (message.feedbackId) {
                  handleSelectFeedback(message.feedbackId, Feedback.NEUTRAL);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar className={styles.avatar}>
                  <CloseIcon />
                </Avatar>
              </ListItemAvatar>
            </div>
            <div
              data-cy="click-bad"
              onClick={() => {
                if (message.feedbackId) {
                  handleSelectFeedback(message.feedbackId, Feedback.BAD);
                }
              }}
            >
              <ListItemAvatar>
                <Avatar className={[styles.avatar, styles.BAD].join(" ")}>
                  <ThumbDownIcon />
                </Avatar>
              </ListItemAvatar>
            </div>
          </div>
        </div>
      </Popover>
    </ListItem>
  );
}

function HistoryChat(props: { height: number }): JSX.Element {
  const styles = useStyles();
  const [chatData, setChatData] = useState<ChatData>({
    messages: [],
  });
  const answerReceivedAt = useSelector<State, Date | undefined>((state) => {
    const m = state.mentorsById[state.curMentor];
    if (!(m && m.answerReceivedAt)) {
      return undefined;
    }
    return m.answerReceivedAt;
  });
  const mentor = useSelector<State, MentorState>(
    (state) => state.mentorsById[state.curMentor]
  );
  
  const curQuestion = useSelector<State, string>((state) => state.curQuestion);
  const curQuestionUpdatedAt = useSelector<State, Date | undefined>(
    (state) => state.curQuestionUpdatedAt
  );
//   console.log(curQuestion)
//   console.log(chatData)
  

  useEffect(() => {
    const chatDataUpdated = {
      ...chatData,
      messages: [...chatData.messages],
    };    
    let updated = false;
    if (chatDataUpdated.lastQuestionAt !== curQuestionUpdatedAt) {
      updated = true;
      chatDataUpdated.messages.push({
        isUser: true,
        text: curQuestion,
      });
      chatDataUpdated.lastQuestionAt = curQuestionUpdatedAt;
    }
    if (mentor) {
      if (chatDataUpdated.messages.length === 0) {
        updated = true;
        chatDataUpdated.messages.push({
          isUser: false,
          text:
            getUtterance(mentor.mentor, UtteranceName.INTRO)?.transcript || "",
        });
      }      
      if (chatDataUpdated.lastAnswerAt !== answerReceivedAt) {
        updated = true;
        chatDataUpdated.messages.push({
          isUser: false,
          text: mentor.answer_text || "",
          feedbackId: mentor.answerFeedbackId + String(Math.floor(Math.random() * 10000) + 1), // there is not answerFeedbackId in the mentor object, so it was changed to answer_id
        });
        // console.log(`Mentor: ${mentor}`);
        // console.log(`chatDataUpdated: ${JSON.stringify(chatDataUpdated.messages)}`);
    
        chatDataUpdated.lastAnswerAt = answerReceivedAt;
      }
    }
    if (updated) {
      setChatData(chatDataUpdated);
    }
    // console.log(chatData.messages)
  }, [mentor, curQuestionUpdatedAt]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [chatData.messages]);

  function onSendFeedback(id: string, feedback: Feedback) {
    console.log(id, feedback)
    const ix = chatData.messages.findIndex((f) => f.feedbackId === id);
    console.log("ix:",ix)
    if (ix === -1) {
      return;
    }
    setChatData({
      ...chatData,
      messages: [
        ...chatData.messages.slice(0, ix),
        {
          ...chatData.messages[ix],
          feedback,
        },
        ...chatData.messages.slice(ix + 1),
      ],
    });
    // console.log(chatData.messages)
  }

  

  return (
      <div data-cy="history-chat" className={styles.chat_container}>
        <List
        data-cy="chat-thread"
        className={styles.list}
        style={{ height: props.height }}
        disablePadding={true}
        >
        {chatData.messages.map((m, i) => {
            return (
                <ChatItem
                    key={`chat-msg-${i}`}
                    message={m}
                    i={i}
                    styles={styles}
                    onSendFeedback={onSendFeedback}
                />
            );
        })}
        </List>
    </div>
  );
}

export default HistoryChat;
