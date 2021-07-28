/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Star, StarBorder } from "@material-ui/icons";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { videoUrl, subtitleUrl, idleUrl } from "api";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { chromeVersion } from "utils";
import {
  answerFinished,
  faveMentor,
  mentorAnswerPlaybackStarted,
} from "store/actions";
import { State } from "types";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

interface VideoData {
  src: string;
  subtitles: string;
}

function Video(args: { playing?: boolean }): JSX.Element {
  const { playing = false } = args;
  const dispatch = useDispatch();
  const curMentor = useSelector<State, string>((state) => state.curMentor);
  const video = useSelector<State, VideoData | null>((state) => {
    if (!state.curMentor) {
      return null;
    }
    const m = state.mentorsById[state.curMentor];
    if (!m) {
      return null;
    }
    return {
      src: state.isIdle ? idleUrl(m.mentor) : videoUrl(m.answer_media || []),
      subtitles:
        subtitlesSupported && !state.isIdle
          ? subtitleUrl(m.answer_media || [])
          : "",
    };
  });

  const [hideLinkLabel, setHideLinkLabel] = useState<boolean>(false);
  const isIdle = useSelector<State, boolean>((state) => state.isIdle);

  const lastAnswerLink = useSelector<State, string>((state) => {
    const totalMentors = Object.keys(state.mentorsById).length;
    const chatAnswers = state.chat.messages.map((m) => {
      return !m.isUser ? findLinks(m.text) : "";
    });
    const lastMentorAnswers = chatAnswers.slice(-totalMentors);
    return getLastAnswerLink(lastMentorAnswers.reverse())!;
  });

  function getLastAnswerLink(lastMentorAnswers: Array<string>) {
    for (let i = 0; i < lastMentorAnswers.length; i++) {
      if (lastMentorAnswers[i] !== "") {
        return lastMentorAnswers[i];
      }
    }
  }

  function findLinks(text: string): string {
    const matchs =
      /\[(.+)\]\((https?:\/\/[^\s]+)(?: "(.+)")?\)|(https?:\/\/[^\s]+)/gi.exec(
        text
      );
    const url = matchs ? matchs[2] : "";
    return url;
  }

  const [duration, setDuration] = useState(Number.NaN);

  if (!(curMentor && video)) {
    return <div />;
  }

  function onEnded() {
    setHideLinkLabel(true);
    dispatch(answerFinished());
  }

  function onPlay() {
    setHideLinkLabel(false);
    if (isIdle) {
      setHideLinkLabel(true);
      return;
    }
    dispatch(
      mentorAnswerPlaybackStarted({
        mentor: curMentor,
        duration: duration,
      })
    );
  }

  return (
    <div
      data-cy="video-container"
      data-test-playing={Boolean(playing)}
      data-video-type={isIdle ? "idle" : "answer"}
    >
      <MemoVideoPlayer
        isIdle={Boolean(isIdle)}
        onEnded={onEnded}
        onPlay={onPlay}
        playing={Boolean(playing)}
        setDuration={setDuration}
        subtitlesOn={Boolean(subtitlesSupported)}
        subtitlesUrl={video.subtitles}
        videoUrl={video.src}
        lastAnswerLink={lastAnswerLink}
        hideLinkLabel={hideLinkLabel}
      />
      <FaveButton />
      <LoadingSpinner mentor={curMentor} />
      <MessageStatus mentor={curMentor} />
    </div>
  );
}

interface VideoPlayerParams {
  isIdle: boolean;
  onEnded: () => void;
  onPlay: () => void;
  playing?: boolean;
  setDuration: (d: number) => void;
  subtitlesOn: boolean;
  subtitlesUrl: string;
  videoUrl: string;
  lastAnswerLink: string;
  hideLinkLabel: boolean;
}

function VideoPlayer(args: VideoPlayerParams) {
  const {
    isIdle,
    onEnded,
    onPlay,
    playing,
    setDuration,
    subtitlesOn,
    subtitlesUrl,
    videoUrl,
    lastAnswerLink,
    hideLinkLabel,
  } = args;
  const answerLinkCard = (
    <div
      data-cy="answer-link-card"
      style={{
        backgroundColor: "#ddd",
        position: "absolute",
        right: 5,
        top: 5,
        display: "inline-block",
        zIndex: 1,
      }}
    >
      <a
        href={lastAnswerLink}
        style={{ position: "relative", color: "#000", bottom: 6, left: 5 }}
        target="_blank"
        rel="noreferrer"
      >
        {lastAnswerLink?.length > 30
          ? lastAnswerLink.slice(0, 30)
          : lastAnswerLink}
      </a>
      <InfoOutlinedIcon
        style={{ marginLeft: 10, position: "relative", top: 2 }}
      />
    </div>
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {!hideLinkLabel && lastAnswerLink ? answerLinkCard : null}
      <ReactPlayer
        style={{
          backgroundColor: "black",
          position: "relative",
          margin: "0 auto",
          zIndex: 0,
        }}
        url={videoUrl}
        muted={Boolean(isIdle)}
        onDuration={setDuration}
        onEnded={onEnded}
        onPlay={onPlay}
        loop={isIdle}
        controls={!isIdle}
        playing={Boolean(playing)}
        playsinline
        webkit-playsinline="true"
        config={{
          file: {
            attributes: {
              crossOrigin: "true",
            },
            tracks: subtitlesOn
              ? [
                  {
                    kind: "subtitles",
                    label: "eng",
                    srcLang: "en",
                    src: subtitlesUrl,
                    default: true,
                  },
                ]
              : [],
          },
        }}
      />
    </div>
  );
}

const MemoVideoPlayer = React.memo(VideoPlayer);

function FaveButton() {
  const dispatch = useDispatch();
  const mentor = useSelector<State, string>((state) => state.curMentor);
  const numMentors = useSelector<State, number>(
    (state) => Object.keys(state.mentorsById).length
  );
  const mentorFaved = useSelector<State, string>((state) => state.mentorFaved);

  const onClick = () => {
    dispatch(faveMentor(mentor));
  };

  if (numMentors < 2) {
    return <div />;
  }

  return mentorFaved && mentorFaved === mentor ? (
    <Star
      data-cy="fave-button"
      className="star-icon"
      onClick={onClick}
      style={{ color: "yellow" }}
    />
  ) : (
    <StarBorder
      data-cy="fave-button"
      className="star-icon"
      onClick={onClick}
      style={{ color: "grey" }}
    />
  );
}

export default Video;
