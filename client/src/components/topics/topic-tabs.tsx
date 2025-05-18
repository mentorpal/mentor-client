import React, { useState } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { ArrowDropDown, History } from "@mui/icons-material";
import { LoadStatus, State, TopicQuestions } from "types";
import "styles/layout.css";
import { useSelector } from "react-redux";
import { Button, DialogActions, Paper, Tab, Tabs } from "@mui/material";
import "styles/topic-tabs.css";
import EmailMentorIcon from "components/email-mentor-icon";

const useStyles = makeStyles({ name: { TopicTabs } })((theme: Theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  root: {
    flexGrow: 1,
    width: "100%",
  },
}));

function TopicTabs(props: {
  topicQuestions: TopicQuestions[];
  onTopicSelected: (topic: string) => void;
  showHistoryTab: boolean;
  existRecommendedQuestions: boolean;
  isMobile: boolean;
}): JSX.Element {
  const {
    topicQuestions,
    onTopicSelected,
    showHistoryTab,
    existRecommendedQuestions,
    isMobile,
  } = props;
  const { classes } = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTabIx, setSelectedTabIx] = React.useState<number>(
    existRecommendedQuestions ? 1 : 0
  );

  const curTopic = useSelector<State, string>((s) => s.curTopic);
  const curMentor = useSelector<State, string>((state) => state.curMentor);
  const firstTopic = useSelector<State, string>((state) => {
    return state.mentorsById[curMentor]?.mentor?.topicQuestions[0]?.topic || "";
  });
  const topicQuestionsLoadStatus = useSelector<State, string>(
    (s) => s.topicQuestionsLoadStatus
  );
  const onChange = (
    e: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    setSelectedTabIx(newValue);
  };

  const onClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const onTopicClick = (topic: string) => {
    onTopicSelected(topic);
    handleClose();
  };

  const topics = topicQuestions.map(({ topic }, index) =>
    topic !== "History" ? (
      <MenuItem
        key={index}
        value={index}
        onClick={() => onTopicClick(topic)}
        data-test={curTopic === topic ? topic : null}
        data-cy={`topic-opt-item-${index}`}
        data-active-tab={selectedTabIx === index + 1 ? "active" : "disable"}
      >
        {topic}
      </MenuItem>
    ) : null
  );

  const mobileView = (
    <div className="tab-container-mobile">
      <Tabs
        value={selectedTabIx}
        TabIndicatorProps={{
          style: { background: "#808080", height: "5px" },
        }}
        style={{ alignItems: "center" }}
        textColor="primary"
        onChange={onChange}
        aria-label="disabled tabs example"
        data-cy="topics"
        centered={true}
      >
        {showHistoryTab ? null : (
          <Tab
            label="History"
            data-cy="history-tab"
            onClick={() => onTopicSelected("History")}
            className="topic-tab"
            style={{
              padding: 0,
              height: "fit-content",
              minHeight: 0,
              width: "fit-content",
              minWidth: 0,
              verticalAlign: "bottom",
              margin: 5,
            }}
            disableRipple
            icon={
              <History
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 0,
                  marginLeft: 8,
                  width: "20",
                  height: "auto",
                }}
              />
            }
          />
        )}
        <Tab
          label={
            topicQuestionsLoadStatus === LoadStatus.NONE
              ? "Loading topics..."
              : curTopic && curTopic !== "History"
              ? curTopic
              : firstTopic
          }
          disabled={topicQuestionsLoadStatus === LoadStatus.NONE}
          data-cy="topic-tab"
          onClick={onClickOpen}
          className="topic-tab"
          disableRipple
          style={{
            padding: 0,
            height: "fit-content",
            minHeight: 0,
            width: "fit-content",
            minWidth: 0,
            verticalAlign: "bottom",
            margin: 5,
          }}
          data-test={curTopic !== "History" ? curTopic : null}
          icon={
            <ArrowDropDown
              style={{
                width: "20",
                height: "auto",
                marginLeft: 8,
                margin: 0,
                padding: 0,
              }}
            />
          }
        />
        {isMobile ? <EmailMentorIcon /> : undefined}
      </Tabs>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Topics</DialogTitle>
        <DialogContent data-cy="topics-questions-list">
          <form className={classes.container} data-cy="topics-form">
            <FormControl className={classes.formControl}>{topics}</FormControl>
          </form>
        </DialogContent>
        <DialogActions className="dialog-container-mobile">
          <Button onClick={handleClose} color="primary" data-cy="close-topics">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  const desktopView = (
    <div className="tab-container-desktop">
      <Paper className={classes.root} style={{ display: "flex" }}>
        <div>
          <Tabs
            value={selectedTabIx}
            TabIndicatorProps={{
              style: { background: "#ddd", height: "10px", top: 0 },
            }}
            textColor="primary"
            onChange={onChange}
            aria-label="disabled tabs example"
            data-cy="history-tab"
          >
            {showHistoryTab ? null : (
              <Tab
                label={"History"}
                onClick={() => onTopicClick("History")}
                className={["topic-tab topic-selected"].join(" ")}
                data-test="History"
                data-cy="history-tab-inner"
              />
            )}
          </Tabs>
        </div>
        <Tabs
          value={selectedTabIx}
          TabIndicatorProps={{
            style: { background: "#ddd", height: "10px", top: 0 },
          }}
          textColor="primary"
          onChange={onChange}
          aria-label="disabled tabs example"
          data-cy="topics"
        >
          {topicQuestions.map(({ topic }, i) =>
            topic !== "History" ? (
              <Tab
                key={i}
                value={i + 1}
                label={topic}
                onClick={() => onTopicClick(topic)}
                className={
                  curTopic === topic ? "topic-tab topic-selected" : "topic-tab"
                }
                data-test={curTopic === topic ? topic : null}
                data-cy={`desktop-tab-${i}`}
                data-active-tab={selectedTabIx === i + 1 ? "active" : "disable"}
                data-topic-name={`topic-${topic.replace(" ", "-")}`}
              />
            ) : null
          )}
          {topicQuestionsLoadStatus === LoadStatus.NONE ? (
            <>
              {/* Hack to make the default selected tab (tab 0) not be visibly selected while loading */}
              <Tab
                style={{
                  display: "none",
                }}
              />
              <Tab
                label="Loading topics..."
                disabled
                className="loading-topic-tab topic-tab"
              />
              <Tab
                label="Loading topics..."
                disabled
                className="loading-topic-tab topic-tab"
              />
              <Tab
                label="Loading topics..."
                disabled
                className="loading-topic-tab topic-tab"
              />
            </>
          ) : null}
        </Tabs>
      </Paper>
    </div>
  );

  // if mobile -> show history button
  // if not mobile -> hide history button
  return (
    <div className="tab-wrapper">{isMobile ? mobileView : desktopView}</div>
  );
}

export default TopicTabs;
