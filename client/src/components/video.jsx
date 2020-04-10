import React, { useState } from "react";
import ReactPlayer from "react-player";
import { useSelector, useDispatch } from "react-redux";
import { Star, StarBorder } from "@material-ui/icons";

import { idleUrl, videoUrl, subtitleUrl } from "api/api";
import {
  answerFinished,
  faveMentor,
  mentorAnswerPlaybackStarted,
} from "store/actions";
import { chromeVersion } from "funcs/funcs";

import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";

const showSubtitles = !chromeVersion() || chromeVersion() >= 62;

const Video = ({ height, width, playing = false }) => {
  const mentor = useSelector(state => state.mentorsById[state.curMentor]);
  const mobileWidth = height / 0.895;
  const webWidth = height / 0.5625;
  const format =
    Math.abs(width - mobileWidth) > Math.abs(width - webWidth)
      ? "web"
      : "mobile";
  width = Math.min(width, format === "mobile" ? mobileWidth : webWidth);

  return (
    <div id="video-container" style={{ width }}>
      <VideoPlayer
        height={height}
        width={width}
        format={format}
        playing={playing}
      />
      <FaveButton />
      <LoadingSpinner mentor={mentor} height={height} width={width} />
      <MessageStatus mentor={mentor} />
    </div>
  );
};

function findMentorIdleId(mentor) {
  try {
    return mentor.utterances_by_type["_IDLE_"][0][0];
  } catch (err) {
    return undefined;
  }
}

const VideoPlayer = ({ width, height, format = "mobile", playing = false }) => {
  const dispatch = useDispatch();
  const [duration, setDuration] = useState(Number.NaN);
  const isIdle = useSelector(state => state.isIdle);
  const mentor = useSelector(state => state.mentorsById[state.curMentor]);
  const idleVideoId = findMentorIdleId(mentor);
  const video = {
    src: mentor
      ? isIdle
        ? idleVideoId
          ? videoUrl(mentor.id, idleVideoId, format)
          : idleUrl(mentor.id, format)
        : videoUrl(mentor.id, mentor.answer_id, format)
      : "",
    subtitles:
      mentor && showSubtitles && !isIdle
        ? subtitleUrl(mentor.id, mentor.answer_id)
        : "",
  };

  const onEnded = () => {
    dispatch(answerFinished());
  };

  const onPlay = () => {
    if (isIdle) {
      return;
    }
    dispatch(
      mentorAnswerPlaybackStarted({
        mentor: mentor.id,
        duration: duration,
      })
    );
  };

  console.log("will render with video url", video);
  return (
    <ReactPlayer
      style={{ backgroundColor: "black" }}
      url={video.src}
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
          tracks: showSubtitles
            ? [
                {
                  kind: "subtitles",
                  src: video.subUrl,
                  srcLang: "en",
                  default: true,
                },
              ]
            : [],
        },
      }}
    />
  );
};

const FaveButton = () => {
  const dispatch = useDispatch();
  const mentor = useSelector(state => state.curMentor);
  const mentors = useSelector(state => state.mentorsById);
  const mentorFaved = useSelector(state => state.mentorFaved);

  const onClick = () => {
    dispatch(faveMentor(mentor));
  };

  if (Object.keys(mentors).length === 1) {
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
};

export default Video;
