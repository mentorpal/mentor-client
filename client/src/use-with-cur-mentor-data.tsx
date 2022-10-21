/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { idleUrl, subtitleUrl, videoUrl } from "api";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LoadStatus, MentorState, State } from "types";
import { useWithBrowser } from "use-with-browser";
import { chromeVersion } from "utils";

export interface HeaderMentorData {
  _id: string;
  name: string;
  title: string;
  email: string;
  allowContact: boolean;
}

export interface VideoData {
  src: string;
  subtitles: string;
}

const defaultVideoData = {
  src: "",
  subtitles: "",
};

export interface UseWithCurMentorData {
  video: VideoData;
  idleVideo: VideoData;
  curMentor?: MentorState;
}

export function useWithCurMentorData(): UseWithCurMentorData {
  const { browserSupportsViewingVbg } = useWithBrowser();
  const subtitlesSupported = Boolean(!chromeVersion() || chromeVersion() >= 62);
  const [curMentor, setCurMentor] = useState<MentorState>();
  const [video, setVideo] = useState<VideoData>(defaultVideoData);
  const [idleVideo, setIdleVideo] = useState<VideoData>(defaultVideoData);
  const curMentorId = useSelector<State, string>((state) => state.curMentor);
  const mentorsById = useSelector<State, Record<string, MentorState>>(
    (state) => {
      return state.mentorsById;
    }
  );
  const curMentorInState = mentorsById[curMentorId];
  const mentorsLoadStatus = useSelector<State, string>(
    (state) => state.mentorsInitialLoadStatus
  );
  const mentorAnswersLoadStatus = useSelector<State, string>(
    (state) => state.mentorAnswersLoadStatus
  );
  const replayMessageCount = useSelector<State, number>(
    (state) => state.replayMessageCount
  );

  function updateCurrentMentor() {
    setCurMentor(mentorsById[curMentorId]);
  }

  const getIdleVideoData = (curMentor: MentorState): VideoData => {
    const useVbg =
      browserSupportsViewingVbg() && curMentor.mentor.hasVirtualBackground;
    return {
      src: idleUrl(curMentor.mentor, undefined, useVbg),
      subtitles: "",
    };
  };

  const getVideoData = (curMentor: MentorState): VideoData => {
    const useVbg =
      browserSupportsViewingVbg() && curMentor.mentor.hasVirtualBackground;
    return {
      src: videoUrl(curMentor.answer_media || [], undefined, useVbg),
      subtitles: subtitlesSupported
        ? subtitleUrl(curMentor.answer_media || [])
        : "",
    };
  };

  // USE EFFECTS keep mentor data up to date when new data is loaded in or current mentor changes
  useEffect(() => {
    if (curMentorId) {
      updateCurrentMentor();
    }
  }, [curMentorId, curMentorInState.answer_id]);

  useEffect(() => {
    if (mentorsLoadStatus === LoadStatus.LOADED && curMentorId) {
      updateCurrentMentor();
    }
  }, [mentorsLoadStatus]);

  useEffect(() => {
    if (mentorAnswersLoadStatus === LoadStatus.LOADED && curMentorId) {
      updateCurrentMentor();
    }
  }, [mentorAnswersLoadStatus]);

  // USE EFFECTS update with new source
  useEffect(() => {
    if (!curMentor) {
      return;
    }
    const _videoData = getVideoData(curMentor);
    if (
      _videoData.src !== video.src ||
      _videoData.subtitles !== video.subtitles
    ) {
      setVideo({
        src: _videoData.src ? `${_videoData.src}?v=${Math.random()}` : "",
        subtitles: _videoData.subtitles
          ? `${_videoData.subtitles}?v=${Math.random()}`
          : "",
      });
    }
    const _idleVideoData = getIdleVideoData(curMentor);
    if (_idleVideoData.src !== idleVideo.src)
      setIdleVideo({
        src: _idleVideoData.src,
        subtitles: "",
      });
  }, [curMentor?.answer_media, replayMessageCount]);

  return {
    video,
    idleVideo,
    curMentor,
  };
}
