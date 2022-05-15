/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Star, StarBorder } from "@material-ui/icons";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { videoUrl, subtitleUrl, idleUrl } from "api";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import MailIcon from "@material-ui/icons/Mail";
import { chromeVersion, getLocalStorage, setLocalStorage } from "utils";
import {
  answerFinished,
  faveMentor,
  mentorAnswerPlaybackStarted,
  playIdleAfterReplay,
  onMentorDisplayAnswer,
} from "store/actions";
import { State, WebLink } from "types";
import "styles/video.css";
import { Tooltip } from "@material-ui/core";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

export interface VideoData {
  src: string;
  subtitles: string;
}

function Video(args: {
  playing?: boolean;
  configEmailMentorAddress: string;
}): JSX.Element {
  const { playing = false } = args;
  const dispatch = useDispatch();
  const isQuestionSent = useSelector<State, boolean>(
    (s) => s.chat.questionSent
  );
  const lastQuestionCounter = useSelector<State, number>(
    (s) => s.chat.lastQuestionCounter || s.questionsAsked.length + 1
  );
  const numberMentors = useSelector<State, number>((state) => {
    return Object.keys(state.mentorsById).length;
  });
  const curMentor = useSelector<State, string>((state) => state.curMentor);

  const idleVideo = useSelector<State, VideoData | null>((state) => {
    const m = state.mentorsById[state.curMentor];
    if (!m) {
      return null;
    }
    return {
      src: idleUrl(m.mentor),
      subtitles: "",
    };
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
      src: videoUrl(m.answer_media || []),
      subtitles: subtitlesSupported ? subtitleUrl(m.answer_media || []) : "",
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
    email: string;
  }

  const mentorData = useSelector<State, HeaderMentorData | null>((state) => {
    if (!state.curMentor) {
      return null;
    }
    if (state.chat.replay) {
      const replayMentorData = state.chat.messages.find((m) => {
        if (m.replay) {
          return m.webLinks;
        }
      });
      const replayedMentor = replayMentorData?.mentorId
        ? state.mentorsById[replayMentorData.mentorId].mentor
        : undefined;

      if (replayedMentor) {
        return {
          _id: replayedMentor._id,
          name: replayedMentor.name,
          title: replayedMentor.title,
          email: replayedMentor.email,
        };
      } else {
        return {
          _id: "",
          name: "",
          title: "",
          email: "",
        };
      }
    }

    const m = state.mentorsById[state.curMentor];
    if (!(m && m.mentor)) {
      return null;
    }
    return {
      _id: m.mentor._id,
      name: m.mentor.name,
      title: m.mentor.title,
      email: m.mentor.email,
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
    setVideoFinishedBuffering(false);
    setHideLinkLabel(true);
    dispatch(playIdleAfterReplay(false));
    dispatch(answerFinished());
  }

  function onPlay() {
    setHideLinkLabel(false);

    if (!isQuestionSent) {
      dispatch(
        onMentorDisplayAnswer(false, curMentor, lastQuestionCounter, Date.now())
      );
    }

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

  const sendMail = (email: string, subject: string): void => {
    const url = `mailto:${email}?subject=${subject}`;
    window.open(url);
  };

  const [disclaimerOpen, setDisclaimerOpen] = useState<boolean>(false);
  const [videoFinishedBuffering, setVideoFinishedBuffering] =
    useState<boolean>(true);
  const disclaimerDisplayed = getLocalStorage("viewedDisclaimer");
  useEffect(() => {
    if (!disclaimerDisplayed || disclaimerDisplayed !== "true") {
      setDisclaimerOpen(true);
    }
  }, []);

  function onCloseDisclaimer() {
    setDisclaimerOpen(false);
    if (!disclaimerDisplayed) {
      setLocalStorage("viewedDisclaimer", "true");
    }
  }

  function onProgressAnswerVideo(state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) {
    if (state.playedSeconds > 0.1 && !videoFinishedBuffering && !isIdle) {
      setVideoFinishedBuffering(true);
    }
  }

  function onProgressIdleVideo() {
    return;
  }

  function PlayVideo() {
    if (!idleVideo || !video) {
      return <div></div>;
    }
    return (
      <div
        data-cy="video-container"
        data-test-playing={true}
        className="video-container"
        style={{ display: "block" }}
        data-test-replay={idleVideo.src}
      >
        <div
          data-cy="answer-idle-video-container"
          style={{ position: "relative", textAlign: "left" }}
        >
          {/* Answer Video Player, once its onPlay is triggered */}
          <span
            className="video-player-wrapper"
            style={{ zIndex: !isIdle && videoFinishedBuffering ? 2 : 0 }}
          >
            <MemoVideoPlayer
              isIdle={Boolean(isIdle)}
              onEnded={onEnded}
              onPlay={onPlay}
              onProgress={onProgressAnswerVideo}
              playing={Boolean(playing)}
              setDuration={setDuration}
              subtitlesOn={
                Boolean(subtitlesSupported) && Boolean(video.subtitles)
              }
              subtitlesUrl={video.subtitles}
              videoUrl={isIdle ? "" : video.src}
              webLinks={webLinks}
              hideLinkLabel={hideLinkLabel}
              mentorName={mentorData ? mentorData.name : ""}
              numberMentors={numberMentors}
            />
          </span>
          {/* Idle video player, always activate, but sits behind answer video player */}
          <span
            className="video-player-wrapper"
            style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
          >
            <MemoVideoPlayer
              isIdle={true}
              onEnded={onEnded}
              onPlay={onPlay}
              playing={true}
              onProgress={onProgressIdleVideo}
              setDuration={setDuration}
              subtitlesOn={false}
              subtitlesUrl={""}
              videoUrl={idleVideo.src}
              webLinks={webLinks}
              hideLinkLabel={hideLinkLabel}
              mentorName={mentorData ? mentorData.name : ""}
              numberMentors={numberMentors}
            />
          </span>
        </div>
        <LoadingSpinner mentor={curMentor} />
        <MessageStatus mentor={curMentor} />
        {mentorData?.name && args.configEmailMentorAddress ? (
          <Tooltip
            data-cy="email-disclaimer"
            open={disclaimerOpen}
            onClose={onCloseDisclaimer}
            onOpen={() => setDisclaimerOpen(true)}
            title={
              <div
                style={{
                  fontSize: "15px",
                  pointerEvents: "auto",
                  cursor: !disclaimerDisplayed ? "pointer" : "none",
                }}
                onClick={() => onCloseDisclaimer()}
              >
                Please only contact mentors through the provided contact email.
                Messages sent directly to other mentor emails found online may
                be ignored.
                {!disclaimerDisplayed ? (
                  <>
                    <br /> <br /> Click here to close
                  </>
                ) : (
                  ""
                )}
              </div>
            }
            arrow
          >
            <div
              data-cy="email-mentor-icon"
              className="email-mentor-button"
              onClick={() =>
                sendMail(
                  args.configEmailMentorAddress,
                  `Contacting ${mentorData.name} for more information`
                )
              }
            >
              Email Mentor <MailIcon />
            </div>
          </Tooltip>
        ) : undefined}
      </div>
    );
  }

  return PlayVideo();
}

interface VideoPlayerParams {
  isIdle: boolean;
  onEnded: () => void;
  onPlay: () => void;
  onProgress: (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => void;
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
    onProgress,
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
        onProgress={onProgress}
        loop={isIdle}
        controls={!isIdle}
        progressInterval={100}
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
