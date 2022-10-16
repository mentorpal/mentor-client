/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { videoUrl as getVideoUrl, subtitleUrl, idleUrl } from "api";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { chromeVersion } from "utils";
import { useResizeDetector } from "react-resize-detector";
import {
  answerFinished,
  mentorAnswerPlaybackStarted,
  playIdleAfterReplay,
  onMentorDisplayAnswer,
} from "store/actions";
import { ChatMsg, MentorState, State, WebLink } from "types";
import "styles/video.css";
import { useWithImage } from "use-with-image-url";
import { useWithBrowser } from "use-with-browser";
import VideoPlayer from "./video-player";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

export interface VideoData {
  src: string;
  subtitles: string;
}

const defaultVideoData = {
  src: "",
  subtitles: "",
};

export interface HeaderMentorData {
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
  const { browserSupportsViewingVbg } = useWithBrowser();
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
  const [useVirtualBackground, setUseVirtualBackground] =
    useState<boolean>(false);
  const curMentor: MentorState = { ...mentorsById[curMentorId] };
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const defaultVirtualBackground = useSelector<State, string>((s) => {
    return s.config.defaultVirtualBackground;
  });
  const virtualBackgroundUrl: string =
    curMentor.mentor.virtualBackgroundUrl || defaultVirtualBackground;

  const isMentorPanel = useSelector<State, boolean>((state) => {
    return Object.getOwnPropertyNames(state.mentorsById).length > 1;
  });

  const useVbg =
    curMentor.mentor.hasVirtualBackground && browserSupportsViewingVbg();
  const { aspectRatio: vbgAspectRatio } = useWithImage(virtualBackgroundUrl);

  useEffect(() => {
    setUseVirtualBackground(
      curMentor.mentor.hasVirtualBackground && browserSupportsViewingVbg()
    );
  }, [curMentor.mentor.hasVirtualBackground, browserSupportsViewingVbg()]);

  const getIdleVideoData = (): VideoData => {
    if (!curMentor) {
      return defaultVideoData;
    }
    return {
      src: idleUrl(curMentor.mentor, undefined, useVbg),
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
        src: getVideoUrl(
          videoMedia?.answerMedia || [],
          undefined,
          useVirtualBackground
        ),
        subtitles: subtitleUrl(videoMedia?.answerMedia || []),
      };
    }
    if (!curMentorId) {
      return defaultVideoData;
    }
    return {
      src: getVideoUrl(
        curMentor.answer_media || [],
        undefined,
        useVirtualBackground
      ),
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
    ) {
      setVideoFinishedBuffering(false);
      setVideo({
        src: _videoData.src ? `${_videoData.src}?v=${Math.random()}` : "",
        subtitles: _videoData.subtitles
          ? `${_videoData.subtitles}?v=${Math.random()}`
          : "",
      });
    }
    const _idleVideoData = getIdleVideoData();
    if (_idleVideoData.src !== idleVideo.src)
      setIdleVideo({
        src: _idleVideoData.src,
        subtitles: "",
      });
  }, [curMentorId, chatReplay, curMentor.answer_media, useVirtualBackground]);

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

  const [videoFinishedBuffering, setVideoFinishedBuffering] =
    useState<boolean>(true);

  const { height: videoContainerRefHeight, ref: videoContainerRef } =
    useResizeDetector();

  function onAnswerReady() {
    setVideoFinishedBuffering(true);
  }

  function PlayVideo() {
    if (!idleVideo || !video) {
      return <div></div>;
    }
    return (
      <>
        <div
          data-cy="video-container"
          data-test-playing={true}
          className="video-container"
          data-test-replay={idleVideo.src}
          style={{
            height: isMentorPanel ? "fit-content" : "100%",
            minHeight: Math.max(videoContainerRefHeight || 0),
          }}
        >
          <span
            data-cy="memo-video-player-wrapper"
            style={{
              display: "inline-block",
              position: "relative",
              width: "100%",
              height: "fit-content",
            }}
            ref={videoContainerRef}
          >
            <MemoVideoPlayer
              onEnded={onEnded}
              onPlay={onPlay}
              playing={Boolean(playing)}
              subtitlesOn={
                Boolean(subtitlesSupported) && Boolean(video.subtitles)
              }
              configEmailMentorAddress={args.configEmailMentorAddress}
              reactPlayerRef={reactPlayerRef}
              subtitlesUrl={video.subtitles}
              videoUrl={isIdle ? "" : video.src}
              webLinks={webLinks}
              hideLinkLabel={hideLinkLabel}
              mentorData={mentorData}
              idleUrl={idleVideo.src}
              useVirtualBackground={useVirtualBackground}
              virtualBackgroundUrl={virtualBackgroundUrl}
              playAnswer={!isIdle && videoFinishedBuffering}
              vbgAspectRatio={vbgAspectRatio}
              onAnswerReady={onAnswerReady}
            />
          </span>
        </div>
        <LoadingSpinner mentor={curMentorId} />
        <MessageStatus mentor={curMentorId} />
      </>
    );
  }

  if (!(curMentorId && video)) {
    return <div />;
  }

  return PlayVideo();
}

const MemoVideoPlayer = React.memo(VideoPlayer);

export default Video;
