import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { ArrowDropDown, History } from "@material-ui/icons";
import { State, TopicQuestions } from "types";
import "styles/layout.css";
import { useSelector } from "react-redux";
import { Button, DialogActions, Paper, Tab, Tabs } from "@material-ui/core";
import { shouldDisplayPortrait } from "pages";
import { isMobile } from "react-device-detect";
import { ChangeEvent } from "react";
import "styles/topic-tabs.css";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);

function TopicTabs(props: {
  topicQuestions: TopicQuestions[];
  onTopicSelected: (topic: string) => void;
  showHistoryTab: boolean;
  existRecommendedQuestions: boolean;
}): JSX.Element {
  const {
    topicQuestions,
    onTopicSelected,
    showHistoryTab,
    existRecommendedQuestions,
  } = props;
  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTabIx, setSelectedTabIx] = React.useState<number>(
    existRecommendedQuestions ? 1 : 0
  );

  const curTopic = useSelector<State, string>((s) => s.curTopic);
  const curMentor = useSelector<State, string>((state) => state.curMentor);
  const firstTopic = useSelector<State, string>((state) => {
    return state.mentorsById[curMentor]?.mentor?.topicQuestions[0]?.topic || "";
  });

  const onChange = (
    e: ChangeEvent<Record<string, unknown>>,
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
          style: { background: "#808080", height: "10px" },
        }}
        textColor="primary"
        onChange={onChange}
        aria-label="disabled tabs example"
        data-cy="topics"
      >
        {showHistoryTab ? null : (
          <Tab
            label="History"
            data-cy="history-tab"
            onClick={() => onTopicSelected("History")}
            className="topic-tab"
            icon={
              <History
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginLeft: 8,
                  marginBottom: 0,
                }}
              />
            }
          />
        )}
        <Tab
          label={curTopic && curTopic !== "History" ? curTopic : firstTopic}
          data-cy="topic-tab"
          onClick={onClickOpen}
          className="topic-tab"
          data-test={curTopic !== "History" ? curTopic : null}
          icon={<ArrowDropDown />}
        />
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
                onChange={onChange}
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
        </Tabs>
      </Paper>
    </div>
  );

  // if mobile -> show history button
  // if not mobile -> hide history button
  return (
    <div className="tab-wrapper">
      {shouldDisplayPortrait() || isMobile ? mobileView : desktopView}
    </div>
  );
}

export default TopicTabs;
