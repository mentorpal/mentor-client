/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Star, StarBorder } from "@material-ui/icons";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { videoUrl as getVideoUrl, subtitleUrl, idleUrl } from "api";
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
import { ChatMsg, MentorState, State, WebLink } from "types";
import "styles/video.css";
import { Tooltip } from "@material-ui/core";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

export interface VideoData {
  src: string;
  subtitles: string;
}

const defaultVideoData = {
  src: "",
  subtitles: "",
};

interface HeaderMentorData {
  _id: string;
  name: string;
  title: string;
  email: string;
  allowContact: boolean;
}

const defaultHeaderMentorData = {
  _id: "",
  name: "",
  title: "",
  email: "",
  allowContact: false,
};

function Video(args: {
  playing?: boolean;
  configEmailMentorAddress: string;
}): JSX.Element {
  const { playing = false } = args;
  const dispatch = useDispatch();
  // Redux store subscriptions
  const lastQuestionCounter = useSelector<State, number>(
    (s) => s.chat.lastQuestionCounter || s.questionsAsked.length + 1
  );
  const mentorsById = useSelector<State, Record<string, MentorState>>(
    (state) => {
      return state.mentorsById;
    }
  );
  const curMentorId = useSelector<State, string>((state) => state.curMentor);
  const isQuestionSent = useSelector<State, boolean>((s) => {
    return s.chat.questionSent;
  });
  const chatReplay = useSelector<State, boolean>((s) => {
    return s.chat.replay;
  });
  const chatMessages = useSelector<State, ChatMsg[]>((s) => {
    return s.chat.messages;
  });

  const [video, setVideo] = useState<VideoData>(defaultVideoData);
  const [idleVideo, setIdleVideo] = useState<VideoData>(defaultVideoData);
  const [webLinks, setWebLinks] = useState<WebLink[]>([]);
  const [mentorData, setMentorData] = useState<HeaderMentorData>(
    defaultHeaderMentorData
  );
  const curMentor: MentorState = { ...mentorsById[curMentorId] };
  const reactPlayerRef = useRef<ReactPlayer>(null);

  const defaultVirtualBackground = useSelector<State, string>((s) => {
    return s.config.defaultVirtualBackground;
  });
  const virtualBackgroundUrl: string =
    curMentor.mentor.virtualBackgroundUrl || defaultVirtualBackground;

  const getIdleVideoData = (): VideoData => {
    if (!curMentor) {
      return defaultVideoData;
    }
    return {
      src: idleUrl(curMentor.mentor),
      subtitles: "",
    };
  };
  const getVideoData = (): VideoData => {
    if (chatReplay) {
      const videoMedia = chatMessages.find((m) => {
        if (m.replay) {
          return m.answerMedia;
        }
      });
      return {
        src: getVideoUrl(videoMedia?.answerMedia || []),
        subtitles: subtitleUrl(videoMedia?.answerMedia || []),
      };
    }
    if (!curMentorId) {
      return defaultVideoData;
    }
    return {
      src: getVideoUrl(curMentor.answer_media || []),
      subtitles: subtitlesSupported
        ? subtitleUrl(curMentor.answer_media || [])
        : "",
    };
  };

  // returns an array of WebLinks
  const getWebLinkData = () => {
    if (chatReplay) {
      const videoWebLinks = chatMessages.find((m) => {
        if (m.replay) {
          return m.webLinks || [];
        }
      });
      return videoWebLinks?.webLinks || [];
    }

    const lastQuestionId = chatMessages[chatMessages.length - 1].questionId;

    const lastWebLink = chatMessages.filter((m) => {
      if (m.mentorId === curMentorId && m.questionId === lastQuestionId) {
        return m.webLinks || [];
      }
    });
    const mentorWebLink =
      lastWebLink && lastWebLink.length > 0
        ? lastWebLink[0].webLinks || []
        : [];
    return mentorWebLink;
  };

  const getMentorData = (): HeaderMentorData => {
    if (!curMentorId) {
      return defaultHeaderMentorData;
    }
    if (chatReplay) {
      const replayMentorData = chatMessages.find((m) => {
        if (m.replay) {
          return m.webLinks;
        }
      });
      const replayedMentor = replayMentorData?.mentorId
        ? mentorsById[replayMentorData.mentorId].mentor
        : undefined;

      if (replayedMentor) {
        return {
          _id: replayedMentor._id,
          name: replayedMentor.name,
          title: replayedMentor.title,
          email: replayedMentor.email,
          allowContact: replayedMentor.allowContact,
        };
      } else {
        return defaultHeaderMentorData;
      }
    }

    if (!(curMentor && curMentor.mentor)) {
      return defaultHeaderMentorData;
    }
    return {
      _id: curMentor.mentor._id,
      name: curMentor.mentor.name,
      title: curMentor.mentor.title,
      email: curMentor.mentor.email,
      allowContact: curMentor.mentor.allowContact,
    };
  };

  useEffect(() => {
    const _videoData = getVideoData();
    if (
      _videoData.src !== video.src ||
      _videoData.subtitles !== video.subtitles
    )
      setVideo({
        src: _videoData.src ? `${_videoData.src}?v=${Math.random()}` : "",
        subtitles: _videoData.subtitles
          ? `${_videoData.subtitles}?v=${Math.random()}`
          : "",
      });
    const _idleVideoData = getIdleVideoData();
    if (_idleVideoData.src !== idleVideo.src)
      setIdleVideo({
        src: _idleVideoData.src,
        subtitles: "",
      });
  }, [curMentorId, chatReplay, curMentor.answer_media]);

  useEffect(() => {
    setWebLinks(getWebLinkData());
  }, [chatReplay, chatMessages]);

  useEffect(() => {
    setMentorData(getMentorData());
  }, [curMentorId, chatReplay, chatMessages]);

  const [hideLinkLabel, setHideLinkLabel] = useState<boolean>(false);
  const isIdle = useSelector<State, boolean>((state) => {
    if (state.chat.replay) {
      return false;
    }
    return state.isIdle;
  });

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
        onMentorDisplayAnswer(
          false,
          curMentorId,
          lastQuestionCounter,
          Date.now()
        )
      );
    }

    if (isIdle) {
      setHideLinkLabel(true);
      dispatch(answerFinished());
      return;
    }
    dispatch(
      mentorAnswerPlaybackStarted({
        mentor: curMentorId,
        duration: reactPlayerRef.current?.getDuration() || 0,
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
  const videoRef = useRef<HTMLSpanElement>(null);
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
        data-test-replay={idleVideo.src}
        style={{ minHeight: videoRef.current?.clientHeight }}
      >
        <div
          data-cy="answer-idle-video-container"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {/* Answer Video Player, once its onPlay is triggered */}
          <span
            data-cy="answer-memo-video-player-wrapper"
            className="video-player-wrapper"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: "auto 0",
              width: "100%",
              height: "fit-content",
            }}
          >
            <MemoVideoPlayer
              isIdle={false}
              onEnded={onEnded}
              onPlay={onPlay}
              onProgress={onProgressAnswerVideo}
              playing={Boolean(playing)}
              subtitlesOn={
                Boolean(subtitlesSupported) && Boolean(video.subtitles)
              }
              reactPlayerRef={reactPlayerRef}
              subtitlesUrl={video.subtitles}
              videoUrl={isIdle ? "" : video.src}
              webLinks={webLinks}
              hideLinkLabel={hideLinkLabel}
              mentorName={mentorData.name}
              useVirtualBackground={curMentor.mentor.hasVirtualBackground}
              virtualBackgroundUrl={virtualBackgroundUrl}
              visible={!isIdle && videoFinishedBuffering}
              zIndex={2}
            />
            {/* Idle video player, always activate, but sits behind answer video player */}
            <span
              data-cy="idle-memo-video-player-wrapper"
              className="video-player-wrapper"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: "auto 0",
                width: "100%",
                height: "fit-content",
              }}
              ref={videoRef}
            >
              <MemoVideoPlayer
                isIdle={true}
                onEnded={onEnded}
                onPlay={onPlay}
                playing={true}
                onProgress={onProgressIdleVideo}
                subtitlesOn={false}
                subtitlesUrl={""}
                reactPlayerRef={reactPlayerRef}
                videoUrl={idleVideo.src}
                webLinks={webLinks}
                hideLinkLabel={hideLinkLabel}
                mentorName={mentorData.name}
                useVirtualBackground={curMentor.mentor.hasVirtualBackground}
                virtualBackgroundUrl={virtualBackgroundUrl}
                zIndex={1}
                visible={!(!isIdle && videoFinishedBuffering)}
              />
            </span>
          </span>
        </div>
        <LoadingSpinner mentor={curMentorId} />
        <MessageStatus mentor={curMentorId} />
        {mentorData.name &&
        mentorData.allowContact &&
        args.configEmailMentorAddress ? (
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

  if (!(curMentorId && video)) {
    return <div />;
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
  subtitlesOn: boolean;
  subtitlesUrl: string;
  videoUrl: string;
  webLinks: WebLink[];
  hideLinkLabel: boolean;
  mentorName: string;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  useVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  zIndex: number;
  visible: boolean;
}

function VideoPlayer(args: VideoPlayerParams) {
  const {
    isIdle,
    onEnded,
    onPlay,
    onProgress,
    playing,
    subtitlesOn,
    subtitlesUrl,
    videoUrl,
    webLinks,
    hideLinkLabel,
    mentorName,
    reactPlayerRef,
    useVirtualBackground,
    virtualBackgroundUrl,
    zIndex,
    visible,
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

  const shouldDiplayWebLinks = webLinks.length > 0 ? true : false;

  const reactPlayerStyling: React.CSSProperties = useVirtualBackground
    ? {
        backgroundImage: `url(${virtualBackgroundUrl})`,
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "black",
        position: "relative",
        margin: "0 auto",
        zIndex: zIndex,
      }
    : {
        backgroundColor: "black",
        position: "relative",
        margin: "0 auto",
        zIndex: zIndex,
      };
  return (
    <div
      data-cy={"answer-video-player-wrapper"}
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      {!hideLinkLabel && shouldDiplayWebLinks ? answerLinkCard : null}
      {mentorName ? mentorNameCard : null}
      <ReactPlayer
        style={reactPlayerStyling}
        className="player-wrapper react-player-wrapper"
        data-cy="playing-video-mentor"
        url={videoUrl}
        muted={Boolean(isIdle)}
        onEnded={onEnded}
        ref={reactPlayerRef}
        onPlay={onPlay}
        onProgress={onProgress}
        loop={isIdle}
        controls={!isIdle}
        width="100%"
        height="100%"
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
