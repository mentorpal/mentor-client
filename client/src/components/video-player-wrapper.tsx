/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { chromeVersion } from "utils";
import { useResizeDetector } from "react-resize-detector";
import {
  answerFinished,
  mentorAnswerPlaybackStarted,
  onMentorDisplayAnswer,
} from "store/actions";
import { State, UtteranceName } from "types";
import "styles/video.css";
import { useWithImage } from "use-with-image-url";
import { useWithBrowser } from "use-with-browser";
import VideoPlayer from "./video-player";
import { useWithWebLinks } from "use-with-web-links";
import { useWithCurMentorData } from "use-with-cur-mentor-data";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

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

function Video(args: { playing?: boolean }): JSX.Element {
  const { playing = false } = args;
  const dispatch = useDispatch();
  // Redux store subscriptions
  const lastQuestionCounter = useSelector<State, number>(
    (s) => s.chat.lastQuestionCounter || s.questionsAsked.length + 1
  );
  const isQuestionSent = useSelector<State, boolean>((s) => {
    return s.chat.questionSent;
  });

  const { video, idleVideo, curMentor } = useWithCurMentorData();
  const { webLinks } = useWithWebLinks();
  const [mentorData, setMentorData] = useState<HeaderMentorData>(
    defaultHeaderMentorData
  );
  const { browserSupportsViewingVbg } = useWithBrowser();
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const defaultVirtualBackground = useSelector<State, string>((s) => {
    return s.config.defaultVirtualBackground;
  });
  const virtualBackgroundUrl: string =
    curMentor?.mentor.virtualBackgroundUrl || defaultVirtualBackground;

  const isMentorPanel = useSelector<State, boolean>((state) => {
    return Object.getOwnPropertyNames(state.mentorsById).length > 1;
  });

  const { height: videoContainerRefHeight, ref: videoContainerRef } =
    useResizeDetector();

  const { aspectRatio: vbgAspectRatio } = useWithImage(virtualBackgroundUrl);

  useEffect(() => {
    if (!curMentor) {
      return;
    }
    const { _id, name, email, title, allowContact } = curMentor.mentor;
    setMentorData({
      _id,
      name,
      email,
      title,
      allowContact,
    });
  }, [curMentor]);

  function onEnded() {
    dispatch(answerFinished());
  }

  function onPlay() {
    if (!curMentor) {
      return;
    }
    if (!isQuestionSent) {
      dispatch(
        onMentorDisplayAnswer(
          false,
          curMentor.mentor._id,
          lastQuestionCounter,
          Date.now()
        )
      );
    }
    dispatch(
      mentorAnswerPlaybackStarted({
        mentor: curMentor.mentor._id,
        duration: reactPlayerRef.current?.getDuration() || 0,
      })
    );
  }

  if (!curMentor) {
    return <div />;
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
            reactPlayerRef={reactPlayerRef}
            subtitlesUrl={video.subtitles}
            webLinks={webLinks}
            videoPlayerData={{
              videoUrl: video.src,
              idleUrl: idleVideo.src,
              mentorData: mentorData,
            }}
            useVirtualBackground={Boolean(
              browserSupportsViewingVbg() &&
                curMentor?.mentor.hasVirtualBackground
            )}
            virtualBackgroundUrl={virtualBackgroundUrl}
            vbgAspectRatio={vbgAspectRatio}
            isIntro={curMentor?.answer_utterance_type === UtteranceName.INTRO}
          />
        </span>
      </div>
      <LoadingSpinner mentor={curMentor.mentor._id} />
      <MessageStatus mentor={curMentor.mentor._id} />
    </>
  );
}

const MemoVideoPlayer = React.memo(VideoPlayer);

export default Video;
