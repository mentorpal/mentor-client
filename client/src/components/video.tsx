import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Star, StarBorder } from "@material-ui/icons";

import { idleUrl, videoUrl, subtitleUrl } from "api/api";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { chromeVersion } from "funcs/funcs";
import {
  answerFinished,
  faveMentor,
  mentorAnswerPlaybackStarted,
} from "store/actions";
import { MentorData, State } from "store/types";

const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);

function findMentorIdleId(mentor: MentorData) {
  try {
    return mentor.utterances_by_type["_IDLE_"][0][0];
  } catch (err) {
    return "";
  }
}

interface VideoState {
  answerId: string;
  idleVideoId: string;
  isIdle: boolean;
  mentor: string;
}

interface VideoParams {
  height: number;
  playing?: boolean;
  width: number;
}
const Video = (args: VideoParams) => {
  const { height, width, playing = false } = args;
  const videoState = useSelector<State, VideoState>(state => {
    const m = state.mentorsById[state.curMentor];
    return {
      answerId: m ? `${m.answer_id}` : "",
      idleVideoId: m ? findMentorIdleId(m) : "",
      isIdle: state.isIdle,
      mentor: state.curMentor,
    };
  });
  const dispatch = useDispatch();
  const [duration, setDuration] = useState(Number.NaN);
  const mobileWidth = Math.round(height / 0.895);
  const webWidth = Math.round(height / 0.5625);
  const format =
    Math.abs(width - mobileWidth) > Math.abs(width - webWidth)
      ? "web"
      : "mobile";
  const video = {
    src: videoState.mentor
      ? videoState.isIdle
        ? videoState.idleVideoId
          ? videoUrl(videoState.mentor, videoState.idleVideoId, format)
          : idleUrl(videoState.mentor, format)
        : videoUrl(videoState.mentor, videoState.answerId, format)
      : "",
    subtitles:
      videoState.mentor && subtitlesSupported && !videoState.isIdle
        ? subtitleUrl(videoState.mentor, videoState.answerId)
        : "",
  };

  function onEnded() {
    dispatch(answerFinished());
  }

  function onPlay() {
    if (videoState.isIdle) {
      return;
    }
    dispatch(
      mentorAnswerPlaybackStarted({
        mentor: videoState.mentor,
        duration: duration,
      })
    );
  }

  return (
    <div id="video-container" style={{ width }}>
      <MemoVideoPlayer
        height={height}
        isIdle={Boolean(videoState.isIdle)}
        onEnded={onEnded}
        onPlay={onPlay}
        playing={Boolean(playing)}
        setDuration={setDuration}
        subtitlesOn={Boolean(subtitlesSupported)}
        subtitlesUrl={video.subtitles}
        videoUrl={video.src}
        width={Math.min(width, format === "mobile" ? mobileWidth : webWidth)}
      />
      <FaveButton />
      <LoadingSpinner
        mentor={videoState.mentor}
        height={height}
        width={width}
      />
      <MessageStatus mentor={videoState.mentor} />
    </div>
  );
};

interface VideoPlayerParams {
  height: number;
  isIdle: boolean;
  onEnded: () => void;
  onPlay: () => void;
  playing?: boolean;
  setDuration: (d: number) => void;
  subtitlesOn: boolean;
  subtitlesUrl: string;
  videoUrl: string;
  width: number;
}

function VideoPlayer(args: VideoPlayerParams) {
  const {
    height,
    isIdle,
    onEnded,
    onPlay,
    playing,
    setDuration,
    subtitlesOn,
    subtitlesUrl,
    videoUrl,
    width,
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
      width={width}
      height={height}
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