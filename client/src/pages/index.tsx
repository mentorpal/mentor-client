/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cmi5 from "@xapi/cmi5";
import { hasCmi } from "cmiutils";
import Chat from "components/chat";
import GuestPrompt from "components/guest-prompt";
import Header from "components/header";
import Input from "components/input";
import Video from "components/video";
import VideoPanel from "components/video-panel";
import {
  loadConfig,
  loadMentor,
  setGuestName,
  setRecommendedQuestions,
} from "store/actions";
import { Config, LoadStatus, MentorData, MentorType, State } from "types";
import withLocation from "wrap-with-location";
import "styles/layout.css";

const useStyles = makeStyles(theme => ({
  flexRoot: {
    display: "flex",
    flexFlow: "column nowrap",
    flexDirection: "column",
    alignItems: "stretch",
    margin: 0,
  },
  flexFixedChild: {
    flexGrow: 0,
  },
  flexExpandChild: {
    flexGrow: 1,
  },
}));

const useResize = (myRef: any) => {
  const [width, setWidth] = React.useState<number>(0);
  const [height, setHeight] = React.useState<number>(0);

  const handleResize = () => {
    console.log(myRef.current.offsetHeight);
    setWidth(myRef.current.offsetWidth);
    setHeight(myRef.current.offsetHeight);
  };

  useEffect(() => {
    myRef.current && myRef.current.addEventListener("resize", handleResize);
    if (myRef.current) {
      handleResize();
    }
    return () => {
      myRef.current.removeEventListener("resize", handleResize);
    };
  }, [myRef]);

  return { width, height };
};

function IndexPage(props: {
  search: {
    mentor?: string | string[];
    recommendedQuestions?: string | string[];
    guest?: string;
    subject?: string;
  };
}): JSX.Element {
  const dispatch = useDispatch();
  const styles = useStyles();
  const config = useSelector<State, Config>(state => state.config);
  const configLoadStatus = useSelector<State, LoadStatus>(
    state => state.configLoadStatus
  );
  const guestName = useSelector<State, string>(state => state.guestName);
  const curMentor = useSelector<State, string>(state => state.curMentor);
  const mentorsById = useSelector<State, Record<string, MentorData>>(
    state => state.mentorsById
  );

  const [windowHeight, setWindowHeight] = React.useState<number>(0);
  const [chatHeight, setChatHeight] = React.useState<number>(0);
  const curTopic = useSelector<State, string>(state => state.curTopic);

  const { mentor, guest, subject, recommendedQuestions } = props.search;

  function hasSessionUser(): boolean {
    return Boolean(
      !config.cmi5Enabled ||
        (typeof window !== "undefined" && hasCmi(window.location.search)) ||
        guestName
    );
  }

  function isConfigLoadComplete(s: LoadStatus): boolean {
    return s === LoadStatus.LOADED || s === LoadStatus.LOAD_FAILED;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    setWindowHeight(window.innerHeight);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isConfigLoadComplete(configLoadStatus) || !curMentor) {
      return;
    }
    const headerHeight = 50;
    const panelHeight =
      Object.getOwnPropertyNames(mentorsById).length > 1 ? 50 : 0;
    const inputHeight = 130;
    const questionsHeight = curTopic ? 200 : 0;
    setChatHeight(
      Math.max(
        0,
        windowHeight -
          headerHeight -
          panelHeight -
          inputHeight -
          questionsHeight -
          21
      )
    );
  });

  useEffect(() => {
    if (configLoadStatus === LoadStatus.NONE) {
      dispatch(loadConfig());
    }
    if (!isConfigLoadComplete(configLoadStatus)) {
      return;
    }
    if (config.cmi5Enabled && Cmi5.isCmiAvailable) {
      try {
        Cmi5.instance.initialize().catch(e => {
          console.error(e);
        });
      } catch (err2) {
        console.error(err2);
      }
    }
  }, [configLoadStatus]);

  useEffect(() => {
    if (!isConfigLoadComplete(configLoadStatus)) {
      return;
    }
    const recommendedQuestionList = recommendedQuestions
      ? Array.isArray(recommendedQuestions)
        ? recommendedQuestions
        : [recommendedQuestions]
      : [];
    dispatch(setRecommendedQuestions(recommendedQuestionList));
    const mentorList = mentor
      ? Array.isArray(mentor)
        ? mentor
        : [mentor]
      : config.mentorsDefault;
    dispatch(loadMentor(config, mentorList, subject));
    if (guest) {
      dispatch(setGuestName(guest));
    }
  }, [configLoadStatus, mentor, guest, subject, recommendedQuestions]);

  if (!isConfigLoadComplete(configLoadStatus) || !curMentor) {
    return (
      <div>
        <CircularProgress id="loading" />
      </div>
    );
  }

  return (
    <div className={styles.flexRoot} style={{ height: windowHeight }}>
      <div className={styles.flexFixedChild}>
        <VideoPanel />
        <Header />
      </div>
      <div className={styles.flexExpandChild}>
        {Object.keys(mentorsById).length < 2 ||
        mentorsById[curMentor].mentor.mentorType === MentorType.CHAT ? (
          <Chat height={chatHeight} />
        ) : (
          <Video playing={hasSessionUser()} />
        )}
      </div>
      <div className={styles.flexFixedChild}>
        <Input />
      </div>
      {!hasSessionUser() ? <GuestPrompt /> : undefined}
    </div>
  );
}

export default withLocation(IndexPage);
