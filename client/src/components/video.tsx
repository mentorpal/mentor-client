/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Star, StarBorder } from "@material-ui/icons";
import { videoUrl, subtitleUrl, idleUrl } from "api";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { chromeVersion } from "utils";
import {
  answerFinished,
  faveMentor,
  mentorAnswerPlaybackStarted,
} from "store/actions";
import { Config, MentorData, State } from "types";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

interface VideoState {
  answerId: string;
  idleVideoId: string;
  isIdle: boolean;
  mentor: string;
}

function Video(args: { playing?: boolean }) {
  const { playing = false } = args;
  const dispatch = useDispatch();
  const curMentor = useSelector<State, string>(state => state.curMentor);
  const mentorsById = useSelector<State, Record<string, MentorData>>(
    state => state.mentorsById
  );
  const isIdle = useSelector<State, boolean>(state => state.isIdle);
  const config = useSelector<State, Config>(s => s.config);
  const [duration, setDuration] = useState(Number.NaN);

  if (!curMentor) {
    return <div />;
  }
  const mentor = mentorsById[curMentor];

  const video = {
    src: isIdle
      ? idleUrl(mentor.mentor, config)
      : videoUrl(curMentor, mentor.answer_id || "", config),
    subtitles:
      subtitlesSupported && !isIdle
        ? subtitleUrl(curMentor, mentor.answer_id || "", config)
        : "",
  };

  function onEnded() {
    dispatch(answerFinished());
  }

  function onPlay() {
    if (isIdle) {
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
    <div id="video-container" data-video-type={isIdle ? "idle" : "answer"}>
      <MemoVideoPlayer
        isIdle={Boolean(isIdle)}
        onEnded={onEnded}
        onPlay={onPlay}
        playing={Boolean(playing)}
        setDuration={setDuration}
        subtitlesOn={Boolean(subtitlesSupported)}
        subtitlesUrl={video.subtitles}
        videoUrl={video.src}
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
  } = args;
  return (
    <ReactPlayer
      style={{
        backgroundColor: "black",
        position: "relative",
        margin: "0 auto",
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
          tracks: subtitlesOn
            ? [
                {
                  kind: "subtitles",
                  label: "subtitles",
                  src: subtitlesUrl,
                  srcLang: "en",
                  default: true,
                },
              ]
            : [],
        },
      }}
    />
  );
}

const MemoVideoPlayer = React.memo(VideoPlayer);

function FaveButton() {
  const dispatch = useDispatch();
  const mentor = useSelector<State, string>(state => state.curMentor);
  const numMentors = useSelector<State, number>(
    state => Object.keys(state.mentorsById).length
  );
  const mentorFaved = useSelector<State, string>(state => state.mentorFaved);

  const onClick = () => {
    dispatch(faveMentor(mentor));
  };

  if (numMentors < 2) {
    return <div />;
  }

  return mentorFaved && mentorFaved === mentor ? (
    <Star
      id="fave-button"
      className="star-icon"
      onClick={onClick}
      style={{ color: "yellow" }}
    />
  ) : (
    <StarBorder
      id="fave-button"
      className="star-icon"
      onClick={onClick}
      style={{ color: "grey" }}
    />
  );
}

export default Video;
