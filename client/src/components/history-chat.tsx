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
import { ArrowForwardIos, RotateLeft } from "@material-ui/icons";
import {
  FormGroup,
  FormControlLabel,
  Switch,
  IconButton,
} from "@material-ui/core";

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
import questions from "./questions";

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
    // backgroundColor: "black",
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

function ChatItem(props: {
  message: ChatMsg;
  i: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles: any;
  iconState: boolean;
  onSendFeedback: (id: string, feedback: Feedback) => void;
  mentorBubbleProps: object;
}): JSX.Element {
  const { message, i, styles, onSendFeedback, iconState, mentorBubbleProps } =
    props;
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const config = useSelector<State, Config>((s) => s.config);
  const [showHideAnswer, setshowHideAnswer] = React.useState(true);
  // const [reset, setReset] = useState(false)

  // console.log(`iconState: ${iconState}`)
  // console.log(mentorBubbleProps)

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
    console.log("**********************");
    console.log(props.children);
    return (
      <h3>
        <a href={props.href} target="_blank" rel="noreferrer">
          {props.children}
        </a>
      </h3>
    );
  }

  //   console.log(message)

  /**
   * hide or show an answer asked from user using its index
   * @param  {Number} idx  index of current message
   */
  function visibilityState(idx: number) {
    // get answer msg
    const answerMsg = document.getElementById(`chat-msg-${idx + 1}`);

    // hide it or show it
    if (answerMsg) {
      if (answerMsg.style.display === "none") {
        answerMsg.style.display = "block";
        answerMsg.classList.add("visible");
        answerMsg.classList.remove("hidden");
        console.log(answerMsg);
        setshowHideAnswer(!showHideAnswer);
      } else {
        answerMsg.style.display = "none";
        answerMsg.classList.add("hidden");
        answerMsg.classList.remove("visible");

        console.log(answerMsg);
        setshowHideAnswer(!showHideAnswer);
      }
    }
  }

  // change visibilityBtn based on current state
  const visibilityBtnState =
    showHideAnswer && iconState ? (
      <ArrowForwardIos
        data-cy={`eyeIcon-${i}`}
        className="visibilityBtn"
        onClick={() => visibilityState(i)}
      />
    ) : (
      <ArrowForwardIos
        data-cy={`eyeIcon-${i}`}
        className="visibilityBtn"
        onClick={() => visibilityState(i)}
      />
    );
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
        backgroundColor: message.isUser ? "#88929e" : mentorBubbleProps.color,
      }}
    >
      {message.isUser ? visibilityBtnState : null}
      {/* mentorBubbleProps.name.concat(": ", message.text) */}
      <ReactMarkdown
        source={
          message.isUser
            ? message.text
            : mentorBubbleProps.name.concat(": ", message.text)
        }
        renderers={{ link: LinkRenderer }}
      />
      {message.feedbackId ? (
        <div
          data-cy="feedback-btn"
          className={styles.icon}
          onClick={handleFeedbackClick}
          style={{ zIndex: 2 }}
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

interface ScrollingQuestionsParams {
  height: number;
  questionHistory: string[];
}

function HistoryChat(args: ScrollingQuestionsParams): JSX.Element {
  const { height, questionHistory } = args;
  const styles = useStyles();
  const [chatData, setChatData] = useState<ChatData>({
    messages: [],
  });

  const [checked, toggleChecked] = useState(true);
  const [mentorProps, setMentorProps] = useState([]);

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

  // const mentorBubbleProps = {
  //   name: mentor.mentor.name,
  //   color: generateColors()
  // }

  useEffect(() => {
    setMentorProps({
      name: mentor.mentor.name,
      color: generateColors(),
    });
  }, [mentor.mentor.name]);

  const curQuestion = useSelector<State, string>((state) => state.curQuestion);
  const curQuestionUpdatedAt = useSelector<State, Date | undefined>(
    (state) => state.curQuestionUpdatedAt
  );

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
          // there is not answerFeedbackId in the mentor object, so it was changed to answer_id
          // random number added to differentiate message and provide a feedback
          feedbackId:
            mentor.answerFeedbackId +
            String(Math.floor(Math.random() * 10000) + 1),
        });
        console.log(`Mentor: ${mentor}`);

        chatDataUpdated.lastAnswerAt = answerReceivedAt;
      }
    }
    if (updated) {
      setChatData(chatDataUpdated);
    }
    console.log("-----updated-----");
  }, [mentor, curQuestionUpdatedAt]);

  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [chatData.messages]);

  function onSendFeedback(id: string, feedback: Feedback) {
    // console.log(id, feedback)
    const ix = chatData.messages.findIndex((f) => f.feedbackId === id);
    // console.log("ix:",ix)
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
  }

  function hideAnswers() {
    // get mentor answers
    try {
      const historyChat = document
        ?.getElementById("chat-thread")
        ?.getElementsByClassName("system");
      if (historyChat !== undefined) {
        for (let i = 1; i < historyChat.length; i++) {
          const classes = historyChat[i].className.split(/\s+/);
          if (classes[classes.length - 1] !== "visible") {
            historyChat[i].style.display = "none";
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  function showAnswers() {
    // get mentor msg
    try {
      const historyChat = document
        ?.getElementById("chat-thread")
        ?.getElementsByClassName("system");
      if (historyChat !== undefined) {
        for (let i = 1; i < historyChat.length; i++) {
          const classes = historyChat[i]?.className.split(/\s+/);
          if (classes[classes.length - 1] !== "hidden") {
            historyChat[i].style.display = "block";
          }
        }
      }
    } catch {
      console.log("not ready");
    }
  }

  function showLast() {
    const systemNodes = document.querySelectorAll(".system");
    const lastNode = systemNodes.item(systemNodes.length - 1);
    try {
      lastNode.style.display = "block";
    } catch (err) {
      console.log(err);
    }
  }

  const call = () => {
    hideAnswers();
    showLast();
  };

  checked ? call() : showAnswers();

  function resetVisibility() {
    console.log("reset");
    try {
      const historyChatVisible = document
        ?.getElementById("chat-thread")
        ?.getElementsByClassName("visible");
      const historyChatHidden = document
        ?.getElementById("chat-thread")
        ?.getElementsByClassName("hidden");

      if (historyChatVisible !== undefined) {
        for (let i = 0; i < historyChatVisible.length; i++) {
          historyChatVisible[i].classList.remove("visible");
        }
      }
      if (historyChatHidden !== undefined) {
        for (let i = 0; i < historyChatHidden.length; i++) {
          historyChatHidden[i].classList.remove("hidden");
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  function generateColors() {
    return (
      "hsl(" +
      360 * Math.random() +
      "," +
      (25 + 70 * Math.random()) +
      "%," +
      (85 + 10 * Math.random()) +
      "%)"
    );
  }

  const resetButton = (
    <IconButton
      data-cy="visibility-reset-btn"
      color="primary"
      aria-label="Reset"
      style={{ marginRight: "5px" }}
    >
      <RotateLeft onClick={resetVisibility} />
    </IconButton>
  );

  const toggleAnswers = (
    <div>
      <FormGroup className="togglePos">
        <p
          style={{
            backgroundColor: mentorProps.color,
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          {mentorProps.name}
        </p>
        {resetButton}
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

  return (
    <div
      data-cy="history-chat"
      id="history-chat"
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
          return (
            <ChatItem
              key={`chat-msg-${i}`}
              message={m}
              i={i}
              styles={styles}
              onSendFeedback={onSendFeedback}
              iconState={checked}
              mentorBubbleProps={mentorProps}
            />
          );
        })}
      </List>
    </div>
  );
}

export default HistoryChat;
