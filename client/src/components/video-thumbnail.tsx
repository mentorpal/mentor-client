/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { idleUrl } from "api";
import { Config, MentorData, MentorQuestionStatus, State } from "types";
import { useSelector } from "react-redux";

function VideoThumbnail(props: { mentor: string }) {
  const [isPlaying, setPlaying] = useState(true);
  const config = useSelector<State, Config>(s => s.config);
  const mentorsById = useSelector<State, Record<string, MentorData>>(
    state => state.mentorsById
  );

  const mentor = mentorsById[props.mentor];
  const isDisabled =
    mentor.is_off_topic || mentor.status === MentorQuestionStatus.ERROR;

  return (
    <ReactPlayer
      style={{ opacity: isDisabled ? "0.25" : "1", backgroundColor: "black" }}
      url={idleUrl(mentor.mentor, config)}
      height={50}
      width={100}
      onStart={() => setPlaying(false)}
      playing={isPlaying}
      volume={0.0}
      muted
      controls={isPlaying}
      playsinline
      webkit-playsinline="true"
    />
  );
}

export default VideoThumbnail;
