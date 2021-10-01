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
  playIdleAfterReplay,
  onMentorDisplayAnswer,
} from "store/actions";
import { State, WebLink } from "types";
import "styles/video.css";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

export interface VideoData {
  src: string;
  subtitles: string;
}

function Video(args: { playing?: boolean }): JSX.Element {
  const { playing = false } = args;
  const dispatch = useDispatch();
  const curMentor = useSelector<State, string>((state) => state.curMentor);
  const numberMentors = useSelector<State, number>((state) => {
    return Object.keys(state.mentorsById).length;
  });

  const video = useSelector<State, VideoData | null>((state) => {
    if (state.chat.replay) {
      const videoMedia = state.chat.messages.find((m) => {
        if (m.replay) {
          return m.answerMedia;
        }
      });
      return {
        src: videoUrl(videoMedia?.answerMedia || []),
        subtitles: subtitleUrl(videoMedia?.answerMedia || []),
      };
    }
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

  // returns an array of WebLinks
  const webLinks = useSelector<State, WebLink[] | undefined>((state) => {
    if (state.chat.replay) {
      const videoWebLinks = state.chat.messages.find((m) => {
        if (m.replay) {
          return m.webLinks;
        }
      });
      return videoWebLinks?.webLinks;
    }

    const chatData = state.chat.messages;
    const lastQuestionId = chatData[chatData.length - 1].questionId;
    const lastWebLink = chatData.filter((m) => {
      if (m.mentorId === curMentor && m.questionId === lastQuestionId) {
        return m.webLinks;
      }
    });
    const mentorWebLink =
      lastWebLink && lastWebLink.length > 0
        ? lastWebLink[0].webLinks
        : undefined;
    return mentorWebLink;
  });

  interface HeaderMentorData {
    _id: string;
    name: string;
    title: string;
  }

  const mentorName = useSelector<State, HeaderMentorData | null>((state) => {
    if (!state.curMentor) {
      return null;
    }
    if (state.chat.replay) {
      const replayMentorData = state.chat.messages.find((m) => {
        if (m.replay) {
          return m.webLinks;
        }
      });
      const _id = replayMentorData
        ? state.mentorsById[replayMentorData?.mentorId].mentor._id
        : "";
      const name = replayMentorData
        ? state.mentorsById[replayMentorData?.mentorId].mentor.name
        : "";
      const title = replayMentorData
        ? state.mentorsById[replayMentorData?.mentorId].mentor.title
        : "";

      return {
        _id,
        name,
        title,
      };
    }

    const m = state.mentorsById[state.curMentor];
    if (!(m && m.mentor)) {
      return null;
    }
    return {
      _id: m.mentor._id,
      name: m.mentor.name,
      title: m.mentor.title,
    };
  });

  const [hideLinkLabel, setHideLinkLabel] = useState<boolean>(false);
  const isIdle = useSelector<State, boolean>((state) => {
    if (state.chat.replay) {
      return false;
    }
    return state.isIdle;
  });

  const [duration, setDuration] = useState(Number.NaN);

  if (!(curMentor && video)) {
    return <div />;
  }

  function onEnded() {
    setHideLinkLabel(true);
    dispatch(playIdleAfterReplay(false));
    dispatch(answerFinished());
  }

  function onPlay() {
    setHideLinkLabel(false);
    dispatch(onMentorDisplayAnswer(false, curMentor));
    if (isIdle) {
      setHideLinkLabel(true);
      dispatch(answerFinished());

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
      className="video-container"
      data-test-replay={video.src}
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
        webLinks={webLinks}
        hideLinkLabel={hideLinkLabel}
        mentorName={mentorName ? mentorName?.name : ""}
        numberMentors={numberMentors}
      />
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
  webLinks: WebLink[] | undefined;
  hideLinkLabel: boolean;
  mentorName: string;
  numberMentors: number;
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
    webLinks,
    hideLinkLabel,
    mentorName,
    numberMentors,
  } = args;

  const webLinkJSX = webLinks?.map((wl, i) => {
    return (
      <a
        href={wl.href}
        className="web-link-a"
        target="_blank"
        rel="noreferrer"
        key={i}
      >
        {wl.href?.length > 30 ? wl.href.slice(0, 30) : wl.href}
      </a>
    );
  });

  const answerLinkCard = (
    <div data-cy="answer-link-card" className="answer-link-card-container">
      <div className="web-links-wrapper">{webLinkJSX}</div>
      <InfoOutlinedIcon className="web-link-card-icon" />
    </div>
  );

  const mentorNameCard = (
    <div data-cy="mentor-name-card" className="mentor-name-card">
      <div
        className="mentor-fav-icon-wrapper"
        data-cy="mentorname-faveicon-wrapper"
      >
        <p className="mentor-name-text" data-cy="mentor-name">
          {mentorName}
        </p>
        <FaveButton />
      </div>
    </div>
  );
  const shouldDiplayWebLinks = webLinks
    ? webLinks.length > 0
      ? true
      : false
    : false;

  return (
    <div
      className="video-player-wrapper"
      style={numberMentors > 1 ? { marginTop: 0 } : { marginTop: 50 }}
    >
      {!hideLinkLabel && shouldDiplayWebLinks ? answerLinkCard : null}
      {mentorName ? mentorNameCard : null}
      <ReactPlayer
        style={{
          backgroundColor: "black",
          position: "relative",
          margin: "0 auto",
          zIndex: 0,
        }}
        width="90%"
        className="player-wrapper react-player-wrapper"
        data-cy="playing-video-mentor"
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
