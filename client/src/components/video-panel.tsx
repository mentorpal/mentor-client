/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import VideoThumbnail from "components/video-thumbnail";
import LoadingSpinner from "components/video-spinner";
import MessageStatus from "components/video-status";
import { selectMentor } from "store/actions";
import {
  MentorState,
  MentorSelectReason,
  MentorType,
  State,
  MentorQuestionStatus,
} from "types";
import { isMentorReady } from "utils";
import FaveButton from "./fave-button";

interface MentorVideoStatus {
  isReady: boolean;
  answeredQuestion: boolean;
  isOffTopic: boolean;
  mentorType: MentorType;
}

function toMentorVideoStatus(m: MentorState): MentorVideoStatus {
  return {
    isOffTopic: Boolean(m.is_off_topic),
    answeredQuestion: m.status === MentorQuestionStatus.ANSWERED,
    isReady: isMentorReady(m),
    mentorType: m?.mentor?.mentorType || MentorType.VIDEO,
  };
}

function VideoPanel(): JSX.Element {
  const dispatch = useDispatch();
  const curMentor = useSelector<State, string>((state) => state.curMentor);
  const mentorsById = useSelector<State, Record<string, MentorVideoStatus>>(
    (state) => {
      return Object.getOwnPropertyNames(state.mentorsById).reduce(
        (acc: Record<string, MentorVideoStatus>, mentorId: string) => {
          acc[mentorId] = toMentorVideoStatus(state.mentorsById[mentorId]);
          return acc;
        },
        {} as Record<string, MentorVideoStatus>
      );
    }
  );
  if (!curMentor || Object.getOwnPropertyNames(mentorsById).length < 2) {
    return <div />;
  }

  function onClick(mId: string) {
    const m = mentorsById[mId];
    if (m.isOffTopic || !m.isReady) {
      return;
    }
    dispatch(selectMentor(mId, MentorSelectReason.USER_SELECT));
  }

  return (
    <div data-cy="video-panel" className="carousel">
      {Object.keys(mentorsById)
        .filter((mId) => mentorsById[mId]?.mentorType === MentorType.VIDEO)
        .map((id, i) => {
          const m = mentorsById[id];
          return (
            <div
              data-cy={`video-thumbnail-container-${id}`}
              key={`${id}-${i}`}
              style={{ display: "inline-block", position: "relative" }}
            >
              <div
                style={{ position: "absolute", right: 0, top: 5, zIndex: 2 }}
              >
                <FaveButton mentor={id} />
              </div>
              <button
                data-cy={`video-thumbnail-${id}`}
                className={`slide video-slide ${
                  id === curMentor ? "selected" : ""
                }`}
                disabled={m.answeredQuestion}
                data-ready={m.isReady}
                key={`${id}-${i}`}
                onClick={() => onClick(id)}
              >
                <VideoThumbnail mentor={id} />
                <LoadingSpinner mentor={id} />
                <MessageStatus mentor={id} />
              </button>
            </div>
          );
        })}
    </div>
  );
}

export default VideoPanel;
