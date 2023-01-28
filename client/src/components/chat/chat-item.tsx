/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { animateScroll } from "react-scroll";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  Popover,
  Typography,
} from "@mui/material";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

import CloseIcon from "@mui/icons-material/Close";

import {
  ChatMsg,
  Config,
  Feedback,
  LINK_TYPE_ASK,
  MentorQuestionSource,
  State,
} from "types";
import "styles/history-chat.css";
import { feedbackSend, sendQuestion, userInputChanged } from "store/actions";
import { hrefToChatLink } from "./use-chat-data";

type StyleProps = {
  root: string;
  list: string;
  icon: string;
  avatar: string;
  GOOD: string;
  BAD: string;
  feedbackPopup: string;
  chat_container: string;
  introMsg: string;
  visibilityBtn: string;
};

export interface ChatItemData extends ChatMsg {
  name: string;
  color: string;
}

export function ChatItem(props: {
  message: ChatItemData;
  i: number;
  styles: StyleProps;
  setAnswerVisibility: (show: boolean) => void;
  visibility: boolean;
  mentorType: string;
  rePlayQuestionVideo: (messageId: string) => void;
  mostRecentMsg: boolean;
}): JSX.Element {
  const {
    message,
    i,
    styles,
    setAnswerVisibility,
    visibility,
    mentorType,
    rePlayQuestionVideo,
    mostRecentMsg,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const dispatch = useDispatch();
  const config = useSelector<State, Config>((s) => s.config);

  const isUser = !message.mentorId;
  const mentorColor = message.color || "#88929e";
  const isVisible =
    mentorType === "CHAT"
      ? visibility
      : visibility && !message.isVideoInProgress;

  useEffect(() => {
    if (!(isVisible && mostRecentMsg)) {
      return;
    }
    animateScroll.scrollToBottom({
      containerId: "chat-thread",
    });
  }, [isVisible]);

  function handleFeedbackClick(event: React.MouseEvent<HTMLDivElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleFeedbackClose() {
    setAnchorEl(null);
  }

  function onFeedbackClicked(feedback: Feedback): void {
    setAnchorEl(null);
    dispatch(feedbackSend(message.feedbackId, feedback));
  }
  function LinkRenderer(props: {
    href: string;
    children: React.ReactNode;
    node: { url: string };
  }) {
    // const linkAnswer =
    //   props.href.length > 30 ? props.href.slice(0, 30) : props.href;
    const chatLink = hrefToChatLink(props?.node?.url || "", message);
    return chatLink.type === LINK_TYPE_ASK ? (
      <a
        href="#"
        rel="noreferrer"
        onClick={() =>
          onAskLinkClicked(chatLink.question, MentorQuestionSource.CHAT_LINK)
        }
        data-cy={`ask-link-${chatLink.askLinkIndex}`}
      >
        {props.children}
      </a>
    ) : (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }
  const addDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function askLinkQuestionChanged(
    question: string,
    source: MentorQuestionSource
  ): Promise<void> {
    dispatch(userInputChanged({ question, source }));
    await addDelay(300);
  }

  function askLinkQuestionSend(
    question: string,
    source: MentorQuestionSource
  ): void {
    if (!question) {
      return;
    }
    dispatch(sendQuestion({ question, source, config }));
    window.focus();
  }

  function onAskLinkClicked(question: string, source: MentorQuestionSource) {
    askLinkQuestionChanged(question, source)
      .then(() => askLinkQuestionSend(question, source))
      .catch((err) => console.error(err));
  }

  function onToggleVisibilityItem() {
    setAnswerVisibility(!isVisible);
  }

  const visibilityIcon =
    isUser && isVisible === false ? (
      <ChevronRightRoundedIcon
        data-cy={`vsbyIcon-${i}`}
        onClick={onToggleVisibilityItem}
        style={{ marginRight: 7, fontSize: 28 }}
        className="visibility-icon"
      />
    ) : isUser && isVisible ? (
      <ExpandMoreRoundedIcon
        onClick={onToggleVisibilityItem}
        data-cy={`vsbyIcon-${i}`}
        style={{ marginRight: 7, fontSize: 28 }}
        className="visibility-icon"
      />
    ) : null;

  const askQuestionIcon = !isUser ? (
    <RecordVoiceOverIcon
      data-cy={`ask-icon-${i}`}
      style={{
        paddingLeft: 10,
        maxWidth: 750,
        backgroundColor: mentorColor,
        color: "#88929e",
      }}
    />
  ) : null;

  const rePlayBtn =
    !isUser && isVisible && message.answerMedia ? (
      <PlayCircleOutlineIcon
        style={{ marginRight: 10, cursor: "pointer", color: "#0000008a" }}
        onClick={() => rePlayQuestionVideo(message.id)}
        data-cy={`replay-icon-${i}`}
      />
    ) : null;

  const mentorBubbleName = (
    <p
      style={{
        marginTop: isUser ? 6 : 3,
        marginLeft: message.isIntro ? 30 : 62,
      }}
      className="bubble-mentor-name"
    >
      {message.name}
    </p>
  );
  return (
    <div>
      {!isUser && isVisible ? mentorBubbleName : null}
      <ListItem
        data-cy={`chat-msg-${i}`}
        id={`chat-msg-${i}`}
        disableGutters={false}
        className={[
          isUser ? "user" : "system",
          isVisible && !isUser ? "visible" : "hidden",
        ].join(" ")}
        classes={{ root: styles.root }}
        style={{
          paddingRight: 16,
          maxWidth: 750,
          marginLeft: isUser || message.isIntro ? 0 : 50,
          backgroundColor: message.isIntro ? "#eaeaea" : mentorColor,
          color: message.isIntro
            ? "#000000c9"
            : message.isUser
            ? "#fff"
            : "#000000c9",
          marginTop: !message.isUser ? "0.6rem" : "",
          marginBottom: "0.6rem",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {!message.isIntro ? visibilityIcon : null}
        {mentorType === "VIDEO" ? rePlayBtn : null}
        <div>
          <ReactMarkdown
            source={message.text}
            className="markdown-container"
            renderers={{ link: LinkRenderer }}
          />
        </div>
        {message.askLinks?.length || 0 > 0 ? askQuestionIcon : null}
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
                  <ThumbUpIcon data-cy="selected-good" />
                ) : message.feedback === Feedback.BAD ? (
                  <ThumbDownIcon data-cy="selected-bad" />
                ) : (
                  <ThumbsUpDownIcon data-cy="selected-none" />
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
                data-test-in-progress={message.isFeedbackSendInProgress}
                onClick={() => {
                  onFeedbackClicked(Feedback.GOOD);
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
                data-test-in-progress={message.isFeedbackSendInProgress}
                onClick={() => {
                  onFeedbackClicked(Feedback.NEUTRAL);
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
                data-test-in-progress={message.isFeedbackSendInProgress}
                onClick={() => {
                  onFeedbackClicked(Feedback.BAD);
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
    </div>
  );
}
export default ChatItem;
