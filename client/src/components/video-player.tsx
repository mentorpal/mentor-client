/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import React, { useEffect, useReducer, useState } from "react";
import ReactPlayer from "react-player";
import { getLocalStorage, setLocalStorage } from "utils";
import { WebLink } from "types";
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
  configEmailMentorAddress: string;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  useVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  vbgAspectRatio: number;
  isIntro: boolean;
}

// TODO: Build a reducer that is going to manage the state of the playing videos

export default function VideoPlayer(args: VideoPlayerParams): JSX.Element {
  const {
    onEnded,
    onPlay,
    playing,
    subtitlesOn,
    subtitlesUrl,
    videoPlayerData,
    webLinks,
    configEmailMentorAddress,
    reactPlayerRef,
    useVirtualBackground,
    virtualBackgroundUrl,
    vbgAspectRatio,
    isIntro,
  } = args;
  const { mentorData, idleUrl, videoUrl } = videoPlayerData;
  const { name: mentorName } = mentorData;
  const [readied, setReadied] = useState<boolean>(false);
  const [idleSuccessfullyLoaded, setIdleSuccesfullyLoaded] =
    useState<boolean>(false);
  const [firstVideoLoaded, setFirstVideoLoaded] = useState<boolean>(false);
  const [state, dispatch] = useReducer(PlayerReducer, {
    status: PlayerStatus.INTRO_LOADING,
  });
  const [curMentorId, setCurMentorId] = useState<string>(mentorData._id);
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

  useEffect(() => {
    if (isIntro && videoUrl) {
      console.log("intro url arrived");
      dispatch({
        type: PlayerActionType.INTRO_URL_ARRIVED,
        payload: { introUrl: videoUrl },
      });
    } else if (mentorData._id !== curMentorId) {
      // Not intro, and new mentor data, so switch right to idling.
      console.log("new mentor id");
      dispatch({
        type: PlayerActionType.NEW_MENTOR,
        payload: { newUrl: videoUrl },
      });
    } else if (videoUrl) {
      console.log(`new url arrived: ${videoUrl}`);
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
    // Hack: If idle fails to load, answer player takes up space and idle sits on top of it. If idle successfully loads, idle player takes up space, answer player sits on top of it.
    setAnswerReactPlayerStyling((prevValue) => {
      return {
        ...prevValue,
        position: idleSuccessfullyLoaded ? "absolute" : "relative",
      };
    });

    setIdleReactPlayerStyling((prevValue) => {
      return {
        ...prevValue,
        position: idleSuccessfullyLoaded ? "relative" : "absolute",
      };
    });
  }, [idleSuccessfullyLoaded]);

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
          console.log("finished fading to answer");
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
          console.log("finished fading to idle");
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

  return (
    <div
      data-cy={"answer-video-player-wrapper"}
      style={{ width: "100%", height: "auto" }}
    >
      {/* TODO: shouldDisplayWebLinks && !isIdle */}
      {shouldDiplayWebLinks ? answerLinkCard : null}
      {mentorName ? mentorNameCard : null}
      <ReactPlayer
        style={answerReactPlayerStyling}
        className="player-wrapper react-player-wrapper"
        data-cy="react-player-answer-video"
        url={state.urlToPlay}
        muted={false}
        onEnded={() => {
          // setVideoFinishedBuffering(false);
          if (isIntro) {
            console.log("intro finished");
            dispatch({ type: PlayerActionType.INTRO_FINISHED });
          } else {
            console.log("answer finished");
            dispatch({ type: PlayerActionType.ANSWER_FINISHED });
          }
          onEnded();
        }}
        ref={reactPlayerRef}
        onPlay={onPlay}
        onReady={(player: ReactPlayer) => {
          if (isIntro) {
            console.log("intro ready");
            dispatch({ type: PlayerActionType.INTRO_FINISHED_LOADING });
          } else {
            console.log("answer ready");
            dispatch({ type: PlayerActionType.ANSWER_FINISHED_LOADING });
          }
          // setVideoFinishedBuffering(true);
          if (!firstVideoLoaded) {
            setFirstVideoLoaded(true);
          }
          if (readied) {
            return;
          }
          setReadied(true);
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
        loop={false}
        controls={true}
        width="fit-content"
        height="fit-content"
        progressInterval={100}
        playing={Boolean(playing)}
        playsinline
        webkit-playsinline="true"
        config={{
          file: {
            attributes: {
              crossOrigin: "true",
              controlsList: "nodownload",
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
        muted={true}
        loop={true}
        controls={false}
        onReady={() => {
          setIdleSuccesfullyLoaded(true);
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
            },
            tracks: [],
          },
        }}
      />
      <EmailMentorIcon
        mentorData={mentorData}
        configEmailAddress={configEmailMentorAddress}
      />
    </div>
  );
}
