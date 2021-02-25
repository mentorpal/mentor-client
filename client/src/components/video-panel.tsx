/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Star } from "@material-ui/icons";
import VideoThumbnail from "components/video-thumbnail";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { selectMentor, faveMentor } from "store/actions";
import {
  MentorData,
  MentorQuestionStatus,
  MentorSelectReason,
  State,
} from "store/types";

const VideoPanel = (props: { isMobile: boolean }) => {
  const { isMobile } = props;
  const dispatch = useDispatch();
  const mentor = useSelector<State, string>(state => state.curMentor);
  const mentors = useSelector<State, Record<string, MentorData>>(
    state => state.mentorsById
  );
  const mentorFaved = useSelector<State, string>(state => state.mentorFaved);
  const isIdle = useSelector<State, boolean>(state => state.isIdle);
  if (!mentor) {
    return <div />;
  }
  const height = 50;
  const width = isMobile ? height / 0.895 : height / 0.5625;

  const onClick = (m: MentorData) => {
    if (m.is_off_topic || m.status === MentorQuestionStatus.ERROR) {
      return;
    }
    if (!(isIdle && mentorFaved === m.id)) {
      dispatch(faveMentor(m.id));
    }
    dispatch(selectMentor(m.id, MentorSelectReason.USER_SELECT));
  };

  return (
    <div id="video-panel" className="carousel">
      {Object.keys(mentors).map((id, i) => (
        <div
          id={`video-thumbnail-${id}`}
          className={`slide video-slide ${id === mentor ? "selected" : ""}`}
          key={`${id}-${i}`}
          onClick={() => onClick(mentors[id])}
        >
          <VideoThumbnail
            mentor={mentors[id]}
            isMobile={isMobile}
            height={height}
            width={width}
          />
          <LoadingSpinner mentor={id} height={height} width={width} />
          <MessageStatus mentor={id} />
          <StarIcon mentor={mentors[id]} />
        </div>
      ))}
    </div>
  );
};

const StarIcon = (props: { mentor: MentorData }) => {
  const { mentor } = props;
  const mentorFaved = useSelector<State, string>(state => state.mentorFaved);
  if (mentorFaved === mentor.id) {
    return (
      <Star
        className="star-icon"
        fontSize="small"
        style={{ color: "yellow" }}
      />
    );
  }
  return <div />;
};

export default VideoPanel;
