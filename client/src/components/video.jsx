import React from "react";
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

const Video = ({ height, width }) => {
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
      <VideoPlayer height={height} width={width} format={format} />
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

const VideoPlayer = ({ width, height, format = "mobile" }) => {
  const dispatch = useDispatch();
  const isIdle = useSelector(state => state.isIdle);
  const mentor = useSelector(state => state.mentorsById[state.curMentor]);
  const idleVideoId = findMentorIdleId(mentor);
  const url = mentor
    ? isIdle
      ? idleVideoId
        ? videoUrl(mentor.id, idleVideoId, format)
        : idleUrl(mentor.id, format)
      : videoUrl(mentor.id, mentor.answer_id, format)
    : "";
  const subtitle_url =
    mentor && !isIdle ? subtitleUrl(mentor.id, mentor.answer_id) : "";
  const showSubtitles = !chromeVersion() || chromeVersion() >= 62;

  const onEnded = () => {
    dispatch(answerFinished());
  };

  const onPlay = () => {
    if (isIdle) {
      return;
    }
    dispatch(mentorAnswerPlaybackStarted(mentor.id));
  };

  return (
    <ReactPlayer
      style={{ backgroundColor: "black" }}
      url={url}
      onEnded={onEnded}
      onPlay={onPlay}
      loop={isIdle}
      width={width}
      height={height}
      controls={!isIdle}
      playing
      playsinline
      webkit-playsinline="true"
      config={{
        file: {
          tracks: showSubtitles
            ? [
                {
                  kind: "subtitles",
                  src: subtitle_url,
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

  return mentorFaved === mentor ? (
    <Star className="star-icon" onClick={onClick} style={{ color: "yellow" }} />
  ) : (
    <StarBorder
      className="star-icon"
      onClick={onClick}
      style={{ color: "grey" }}
    />
  );
};

export default Video;
