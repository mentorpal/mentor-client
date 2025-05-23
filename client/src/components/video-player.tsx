/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import React, { useEffect, useReducer, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { getLocalStorage, setLocalStorage } from "utils";
import { State, Utterance, UtteranceName, WebLink } from "types";
import "styles/video.css";
import FaveButton from "./fave-button";
import EmailMentorIcon from "./email-mentor-icon";
import { HeaderMentorData } from "./video-player-wrapper";
import {
  PlayerActionType,
  PlayerReducer,
  PlayerStatus,
} from "video-player-reducer";
import { useWithIntervalManagement } from "use-with-interval-management";
import { useWithVideoPlayerHeight } from "use-with-video-player-height";
import { useWithScreenOrientation } from "use-with-orientation";
import { useSelector } from "react-redux";
import { getUtterance } from "api";
import { controlsDisableHelper } from "hooks/controls-disable-helper";

export interface VideoPlayerData {
  videoUrl: string;
  idleUrl: string;
  mentorData: HeaderMentorData;
}

export interface VideoPlayerParams {
  onEnded: () => void;
  onPlay: () => void;
  playing?: boolean;
  videoPlayerData: VideoPlayerData;
  subtitlesOn: boolean;
  subtitlesUrl: string;
  webLinks: WebLink[];
  reactPlayerRef: React.RefObject<ReactPlayer>;
  useVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  vbgAspectRatio: number;
  isIntro: boolean;
}

export default function VideoPlayer(args: VideoPlayerParams): JSX.Element {
  const {
    onEnded,
    onPlay,
    playing,
    subtitlesOn,
    subtitlesUrl,
    videoPlayerData,
    webLinks,
    reactPlayerRef,
    useVirtualBackground,
    virtualBackgroundUrl,
    vbgAspectRatio,
    isIntro,
  } = args;
  const { mentorData, idleUrl, videoUrl } = videoPlayerData;
  const { name: mentorName } = mentorData;
  const [readied, setReadied] = useState<boolean>(false);
  const [firstVideoLoaded, setFirstVideoLoaded] = useState<boolean>(false);
  const [state, dispatch] = useReducer(PlayerReducer, {
    status: PlayerStatus.INTRO_LOADING,
  });
  const [curMentorId, setCurMentorId] = useState<string>(mentorData._id);
  const { newVideo } = useWithVideoPlayerHeight(reactPlayerRef);
  const idlePlayerRef = useRef<ReactPlayer>(null);
  const { displayFormat } = useWithScreenOrientation();
  const { newVideo: newIdleVideo } = useWithVideoPlayerHeight(idlePlayerRef);
  const { intervalStarted, intervalEnded, clearAllIntervals } =
    useWithIntervalManagement();
  const [answerReactPlayerStyling, setAnswerReactPlayerStyling] =
    useState<React.CSSProperties>({
      lineHeight: 0,
      backgroundColor: "black",
      top: 0,
      margin: "0 auto",
      zIndex: 2,
    });
  const isMobile = displayFormat == "mobile";
  const curMentorUtterance = useSelector<State, Utterance | undefined>(
    (state) =>
      getUtterance(state.mentorsById[state.curMentor], UtteranceName.INTRO)
  );
  const [introEnded, setIntroEnded] = useState<boolean>(false);
  const [firstPauseCleared, setFirstPauseCleared] = useState<boolean>(false);
  const { enabled: controlsEnabled, interacted } =
    controlsDisableHelper(firstPauseCleared);

  useEffect(() => {
    if (isIntro && videoUrl) {
      dispatch({
        type: PlayerActionType.INTRO_URL_ARRIVED,
        payload: { introUrl: videoUrl },
      });
    } else if (mentorData._id !== curMentorId) {
      // Not intro, and new mentor data, so switch right to idling.
      dispatch({
        type: PlayerActionType.NEW_MENTOR,
        payload: { newUrl: videoUrl },
      });
    } else if (videoUrl) {
      dispatch({
        type: PlayerActionType.NEW_URL_ARRIVED,
        payload: { newUrl: videoUrl },
      });
    }
    setCurMentorId(mentorData._id);
  }, [videoUrl]);

  const [idleReactPlayerStyling, setIdleReactPlayerStyling] =
    useState<React.CSSProperties>({
      lineHeight: 0,
      backgroundColor: "black",
      top: 0,
      margin: "0 auto",
      zIndex: 1,
      opacity: 0,
    });

  useEffect(() => {
    // Add VBG to both answer and idle players
    if (useVirtualBackground) {
      setAnswerReactPlayerStyling((prevValue) => {
        return {
          ...prevValue,
          backgroundImage: `url(${virtualBackgroundUrl})`,
          backgroundSize: vbgAspectRatio >= 1.77 ? "auto 100%" : "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        };
      });
      setIdleReactPlayerStyling((prevValue) => {
        return {
          ...prevValue,
          backgroundImage: `url(${virtualBackgroundUrl})`,
          backgroundSize: vbgAspectRatio >= 1.77 ? "auto 100%" : "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        };
      });
    } else {
      // Removing background image
      setAnswerReactPlayerStyling((prevValue) => {
        const prevValueCopy: React.CSSProperties = JSON.parse(
          JSON.stringify(prevValue)
        );
        delete prevValueCopy["backgroundImage"];
        delete prevValueCopy["backgroundSize"];
        delete prevValueCopy["backgroundRepeat"];
        delete prevValueCopy["backgroundPosition"];
        return prevValueCopy;
      });
      setIdleReactPlayerStyling((prevValue) => {
        const prevValueCopy: React.CSSProperties = JSON.parse(
          JSON.stringify(prevValue)
        );
        delete prevValueCopy["backgroundImage"];
        delete prevValueCopy["backgroundSize"];
        delete prevValueCopy["backgroundRepeat"];
        delete prevValueCopy["backgroundPosition"];
        return prevValueCopy;
      });
    }
  }, [useVirtualBackground, vbgAspectRatio]);

  function idleVideoTakeSpace() {
    setAnswerReactPlayerStyling((prevValue) => {
      return {
        ...prevValue,
        position: "absolute",
        opacity: 0,
        pointerEvents: "none",
      };
    });

    setIdleReactPlayerStyling((prevValue) => {
      return {
        ...prevValue,
        opacity: 1,
        position: "relative",
        pointerEvents: "auto",
      };
    });
  }

  function answerVideoTakeSpace() {
    setAnswerReactPlayerStyling((prevValue) => {
      return {
        ...prevValue,
        opacity: 1,
        position: "relative",
        pointerEvents: "auto",
      };
    });

    setIdleReactPlayerStyling((prevValue) => {
      return {
        ...prevValue,
        position: "absolute",
        opacity: 0,
        pointerEvents: "none",
      };
    });
  }

  useEffect(() => {
    setReadied(false);
  }, [videoUrl]);

  useEffect(() => {
    if (
      state.status === PlayerStatus.INTRO_PLAYING ||
      state.status === PlayerStatus.INTRO_LOADING
    ) {
      answerVideoTakeSpace();
      return;
    }

    if (state.status === PlayerStatus.IDLING_FOR_NEXT_READY_ANSWER) {
      clearAllIntervals();
      idleVideoTakeSpace();
      return;
    }

    const opacityChangeSpeed = 11;
    const opactiyChangeMagnitude = 0.05;
    if (state.status === PlayerStatus.FADING_TO_ANSWER) {
      //playAnswer
      // Fade from idle to answer
      let newAnswerOpacity = 0;
      const intervalId = setInterval(() => {
        newAnswerOpacity += opactiyChangeMagnitude;
        const fadeComplete = newAnswerOpacity >= 1;
        setAnswerReactPlayerStyling((prevValue) => {
          return {
            ...prevValue,
            opacity: newAnswerOpacity,
          };
        });
        if (fadeComplete) {
          answerVideoTakeSpace();
          intervalEnded(intervalId);
          dispatch({ type: PlayerActionType.FINISHED_FADING_TO_ANSWER });
        }
      }, opacityChangeSpeed);
      intervalStarted(intervalId);
    } else if (state.status === PlayerStatus.FADING_TO_IDLE) {
      //!playAnswer
      // Fade from answer to idle
      setIdleReactPlayerStyling((prevValue) => {
        return {
          ...prevValue,
          opacity: 1,
        };
      });
      let newAnswerOpacity = 1;
      const intervalId = setInterval(() => {
        newAnswerOpacity -= opactiyChangeMagnitude;
        const fadeComplete = newAnswerOpacity <= 0;
        setAnswerReactPlayerStyling((prevValue) => {
          return {
            ...prevValue,
            opacity: newAnswerOpacity,
          };
        });

        if (fadeComplete) {
          intervalEnded(intervalId);
          idleVideoTakeSpace();
          dispatch({ type: PlayerActionType.FINISHED_FADING_TO_IDLE });
        }
      }, opacityChangeSpeed);
      intervalStarted(intervalId);
    }
  }, [state.status]);

  const shouldDiplayWebLinks = webLinks.length > 0 ? true : false;
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
        style={{
          display: "flex",
          alignItems: "center",
        }}
        data-cy="mentorname-faveicon-wrapper"
      >
        <p className="mentor-name-text" data-cy="mentor-name">
          {mentorName}
        </p>
        <FaveButton mentor={mentorData._id} />
      </div>
    </div>
  );

  const videoPlayerHtmlStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
  };

  function getVideoPlayerTracks() {
    const internalPlayer = reactPlayerRef.current?.getInternalPlayer();
    if (!internalPlayer) {
      return [];
    }
    return internalPlayer.textTracks || [];
  }

  function hideVideoPlayerTracks() {
    const tracks = getVideoPlayerTracks();
    const firstTrack = tracks[0];
    if (
      !firstTrack ||
      firstTrack.cues.length == 0 ||
      firstTrack.activeCues.length == 0
    ) {
      return;
    }
    for (let i = 0; i < firstTrack.activeCues.length; i++) {
      firstTrack.activeCues[i].startTime = 100000;
    }
  }

  function endVideo(): void {
    newVideo();
    if (isIntro) {
      dispatch({ type: PlayerActionType.INTRO_FINISHED });
    } else {
      dispatch({ type: PlayerActionType.ANSWER_FINISHED });
    }
    onEnded();
    hideVideoPlayerTracks();
  }

  return (
    <div
      data-cy={"answer-video-player-wrapper"}
      style={{ width: "100%", height: "auto", justifyContent: "center" }}
      onMouseOver={() => {
        interacted();
      }}
      onClick={() => {
        interacted();
      }}
      onMouseMove={() => {
        interacted();
      }}
    >
      {shouldDiplayWebLinks ? answerLinkCard : null}
      {mentorName ? mentorNameCard : null}
      <ReactPlayer
        style={answerReactPlayerStyling}
        className="player-wrapper react-player-wrapper"
        data-cy="react-player-answer-video"
        controls={controlsEnabled || !firstPauseCleared}
        url={state.urlToPlay}
        pip={false}
        muted={false}
        onEnded={endVideo}
        ref={reactPlayerRef}
        onPlay={() => {
          onPlay();
          if (!firstPauseCleared) {
            setFirstPauseCleared(true);
          }
        }}
        onProgress={({ playedSeconds }) => {
          if (
            isIntro &&
            curMentorUtterance?.endTime &&
            playedSeconds >= curMentorUtterance.endTime &&
            !introEnded
          ) {
            endVideo();
            setIntroEnded(true);
          }
        }}
        onReady={(player: ReactPlayer) => {
          newVideo();
          if (isIntro) {
            dispatch({ type: PlayerActionType.INTRO_FINISHED_LOADING });
          } else {
            dispatch({ type: PlayerActionType.ANSWER_FINISHED_LOADING });
          }
          if (!firstVideoLoaded) {
            setFirstVideoLoaded(true);
          }
          if (readied) {
            return;
          }
          setReadied(true);
          if (isIntro) {
            setIntroEnded(false);
          }
          if (isIntro && curMentorUtterance?.startTime) {
            reactPlayerRef.current?.seekTo(
              curMentorUtterance.startTime,
              "seconds"
            );
          }
          const internalPlayer = player.getInternalPlayer();
          if (!internalPlayer) {
            return;
          }
          const tracks = internalPlayer["textTracks"];
          if (tracks) {
            tracks.addEventListener("change", () => {
              const internalPlayer2 = player.getInternalPlayer();
              const tracks = internalPlayer2["textTracks"];
              if (!tracks || !tracks.length) {
                return;
              }
              const track = tracks[0];
              setLocalStorage("captionMode", track["mode"]);
            });
            if (!tracks.length) {
              return;
            }
            const track = tracks[0];
            const localStorageMode = getLocalStorage("captionMode");
            const showCaptions = localStorageMode === "showing";
            track["mode"] = showCaptions ? "showing" : "hidden";
          }
        }}
        onSeek={() => {
          console.log("seeked");
          interacted();
        }}
        loop={false}
        width="fit-content"
        height="fit-content"
        progressInterval={100}
        playing={Boolean(playing && !introEnded)}
        playsinline
        webkit-playsinline="true"
        config={{
          file: {
            attributes: {
              crossOrigin: "true",
              controlsList: "nodownload",
              style: videoPlayerHtmlStyle,
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
      <ReactPlayer
        style={idleReactPlayerStyling}
        className="player-wrapper react-player-wrapper"
        data-cy="react-player-idle-video"
        url={idleUrl}
        pip={false}
        muted={true}
        loop={true}
        controls={false}
        onEnded={newIdleVideo}
        ref={idlePlayerRef}
        onReady={() => {
          newIdleVideo();
        }}
        width="fit-content"
        height="fit-content"
        progressInterval={100}
        playing={true}
        playsinline
        webkit-playsinline="true"
        config={{
          file: {
            attributes: {
              crossOrigin: "true",
              style: videoPlayerHtmlStyle,
            },
            tracks: [],
          },
        }}
      />
      {isMobile ? undefined : <EmailMentorIcon />}
    </div>
  );
}
