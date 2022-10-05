/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import Video from "components/video";
import VideoPanel from "components/video-panel";
import React from "react";
import { MentorType, State } from "types";
import "styles/history-chat-responsive.css";
import { useSelector } from "react-redux";
import Chat from "components/chat";

function VideoSection(props: {
  mentorType: MentorType;
  chatHeight: number;
  windowHeight: number;
  hasSessionUser: () => boolean;
  isMobile: boolean;
}): JSX.Element {
  const { mentorType, chatHeight, windowHeight, hasSessionUser, isMobile } =
    props;
  const displayGuestPrompt = useSelector<State, boolean>(
    (state) => state.config.displayGuestPrompt
  );
  const configEmailMentorAddress = useSelector<State, string>(
    (state) => state.config.filterEmailMentorAddress
  );
  return (
    <>
      <VideoPanel />
      {mentorType === MentorType.CHAT ? (
        <Chat
          height={chatHeight}
          windowHeight={windowHeight}
          width={isMobile ? "60vw" : "auto"}
          bubbleColor={"#88929e"}
          isMobile={isMobile}
        />
      ) : (
        <Video
          playing={hasSessionUser() || !displayGuestPrompt}
          configEmailMentorAddress={configEmailMentorAddress}
        />
      )}
    </>
  );
}

export default VideoSection;
