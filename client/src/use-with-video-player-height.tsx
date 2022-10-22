/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

export interface UseWithVideoPlayerHeight {
  newVideo: () => void;
}

// Provide with a ReactPlayer ref, and this hook will keep the react player responsive when resizing page,
//  but keep the size static of the last played video.

/**
 * Hack hook to keep React Players embedded video element to be responsive when resizing page, and static size of playing video when not resizing.
 * This is so the player doesn't resize while it's loading in a new video.
 * @param reactPlayerRef
 * @returns
 */
export function useWithVideoPlayerHeight(
  reactPlayerRef: React.RefObject<ReactPlayer>
): UseWithVideoPlayerHeight {
  const [height, setHeight] = useState<string>("fit-content");

  // Whenever the window resizes, go back to fit-content, so it's responsize again
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => setHeight("fit-content");
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  //   When a video ends, set height of internal player to that of the ended video, so when a
  // new video loads, the size of the video player doesn't hop around
  function newVideo() {
    const internalPlayer = reactPlayerRef.current?.getInternalPlayer();
    if (!internalPlayer) {
      return;
    }
    const boundingRect = internalPlayer.getBoundingClientRect();

    const newHeight = boundingRect["height"];
    if (!newHeight) {
      return;
    }
    setHeight(newHeight.toString());
    internalPlayer.setAttribute("style", `width: 100%; height: ${newHeight}px`);
  }

  useEffect(() => {
    const internalPlayer = reactPlayerRef.current?.getInternalPlayer();
    if (!internalPlayer) {
      return;
    }
    internalPlayer.setAttribute("style", `width: 100%; height: ${height}px`);
  }, [height]);

  return {
    newVideo,
  };
}
