/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { getLocalStorage, setLocalStorage } from "utils";
import { WebLink } from "types";
import "styles/video.css";
import FaveButton from "./fave-button";
import EmailMentorIcon from "./email-mentor-icon";
import { HeaderMentorData } from "./video";

export interface VideoPlayerParams {
  onEnded: () => void;
  onPlay: () => void;
  playing?: boolean;
  idleUrl: string;
  subtitlesOn: boolean;
  subtitlesUrl: string;
  videoUrl: string;
  webLinks: WebLink[];
  hideLinkLabel: boolean;
  mentorData: HeaderMentorData;
  configEmailMentorAddress: string;
  reactPlayerRef: React.RefObject<ReactPlayer>;
  useVirtualBackground: boolean;
  virtualBackgroundUrl: string;
  vbgAspectRatio: number;
  isIdle: boolean;
}

// TODO: Build a reducer that is going to manage the state of the playing videos

export default function VideoPlayer(args: VideoPlayerParams): JSX.Element {
  const {
    onEnded,
    onPlay,
    playing,
    subtitlesOn,
    subtitlesUrl,
    videoUrl,
    idleUrl,
    webLinks,
    hideLinkLabel,
    configEmailMentorAddress,
    mentorData,
    reactPlayerRef,
    useVirtualBackground,
    virtualBackgroundUrl,
    vbgAspectRatio,
    isIdle,
  } = args;
  const { name: mentorName } = mentorData;
  const [readied, setReadied] = useState<boolean>(false);
  const [idleSuccessfullyLoaded, setIdleSuccesfullyLoaded] =
    useState<boolean>(false);
  const [firstVideoLoaded, setFirstVideoLoaded] = useState<boolean>(false);

  const [videoFinishedBuffering, setVideoFinishedBuffering] =
    useState<boolean>(true);
  const [answerReactPlayerStyling, setAnswerReactPlayerStyling] =
    useState<React.CSSProperties>({
      lineHeight: 0,
      backgroundColor: "black",
      margin: "0 auto",
      zIndex: 2, //TODO: remove if we want to fade the
    });
  const [playAnswer, setPlayAnswer] = useState<boolean>(
    !isIdle && videoFinishedBuffering
  );

  const [idleReactPlayerStyling, setIdleReactPlayerStyling] =
    useState<React.CSSProperties>({
      lineHeight: 0,
      backgroundColor: "black",
      top: 0,
      margin: "0 auto",
      zIndex: 1,
    });

  useEffect(() => {
    setPlayAnswer(!isIdle && videoFinishedBuffering);
  }, [isIdle, videoFinishedBuffering]);

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

  useEffect(() => {
    setReadied(false);
  }, [videoUrl]);

  useEffect(() => {
    const showAnswer = playAnswer || !firstVideoLoaded;
    const opacityChangeSpeed = 22; // opacity change 10 times a second
    const opactiyChangeMagnitude = 0.05;
    if (showAnswer && firstVideoLoaded) {
      // Fade from idle to answer
      let newAnswerOpacity = 0;
      const intervalId = setInterval(() => {
        newAnswerOpacity += opactiyChangeMagnitude;
        const fadeComplete = newAnswerOpacity >= 1;
        setAnswerReactPlayerStyling((prevValue) => {
          return {
            ...prevValue,
            opacity: newAnswerOpacity,
            // zIndex: fadeComplete ? 2 : 1
          };
        });

        // setIdleReactPlayerStyling(prevValue=>{
        //     return {
        //         ...prevValue,
        //         opacity: 1-newAnswerOpacity,
        //         zIndex: fadeComplete ? 1 : 2
        //     }
        // })
        if (fadeComplete) {
          clearInterval(intervalId);
        }
      }, opacityChangeSpeed);
    } else if (!showAnswer && firstVideoLoaded) {
      // Fade from answer to idle
      let newAnswerOpacity = 1;
      const intervalId = setInterval(() => {
        newAnswerOpacity -= opactiyChangeMagnitude;
        const fadeComplete = newAnswerOpacity <= 0;
        setAnswerReactPlayerStyling((prevValue) => {
          return {
            ...prevValue,
            opacity: newAnswerOpacity,
            // zIndex: fadeComplete ? 1 : 2
          };
        });

        // setIdleReactPlayerStyling(prevValue=>{
        //     return {
        //         ...prevValue,
        //         opacity: 1-newAnswerOpacity,
        //         zIndex: fadeComplete ? 2 : 1
        //     }
        // })
        if (fadeComplete) {
          clearInterval(intervalId);
        }
      }, opacityChangeSpeed);
    }
  }, [playAnswer, firstVideoLoaded]);

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
      {!hideLinkLabel && shouldDiplayWebLinks ? answerLinkCard : null}
      {mentorName ? mentorNameCard : null}
      <ReactPlayer
        style={answerReactPlayerStyling}
        className="player-wrapper react-player-wrapper"
        data-cy="react-player-answer-video"
        url={videoUrl}
        muted={false}
        onEnded={() => {
          setVideoFinishedBuffering(false);
          onEnded();
        }}
        ref={reactPlayerRef}
        onPlay={onPlay}
        onReady={(player: ReactPlayer) => {
          setVideoFinishedBuffering(true);
          if (!firstVideoLoaded) {
            setFirstVideoLoaded(true);
          }
          if (readied) {
            return;
          }
          setReadied(true);
          const internalPlayer = player.getInternalPlayer();
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
