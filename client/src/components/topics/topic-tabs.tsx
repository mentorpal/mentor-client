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
    },
  })
);

function TopicTabs(props: {
  topicQuestions: TopicQuestions[];
  onTopicSelected: (topic: string) => void;
  showHistoryTab: boolean;
}): JSX.Element {
  const { topicQuestions, onTopicSelected, showHistoryTab } = props;

  const classes = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = React.useState<number>(0);
  const curTopic = useSelector<State, string>((s) => s.curTopic);

  const onChange = (
    e: ChangeEvent<Record<string, unknown>>,
    newValue: number
  ) => {
    setValue(newValue);
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
        className={curTopic === topic ? "topic-selected" : ""}
        data-cy="topic-opt-item"
      >
        {topic}
      </MenuItem>
    ) : null
  );

  const mobileView = (
    <div style={{ width: "100%" }}>
      <Paper className={classes.root} style={{ width: "100%" }}>
        <Tabs
          value={value}
          TabIndicatorProps={{
            style: { background: "#ddd", height: "10px" },
          }}
          textColor="primary"
          onChange={onChange}
          aria-label="disabled tabs example"
          data-cy="topics"
        >
          <Tab
            label={curTopic && curTopic !== "History" ? curTopic : "Topics"}
            data-cy="topic-tab"
            onClick={onClickOpen}
            className="topic-tab"
            icon={<ArrowDropDown />}
          />
          {showHistoryTab ? null : (
            <Tab
              label="History"
              data-cy="history-tab"
              onClick={() => onTopicSelected("History")}
              className="topic-tab"
              icon={<History />}
            />
          )}
        </Tabs>
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Topics</DialogTitle>
        <DialogContent data-cy="topics-questions-list">
          <form className={classes.container} data-cy="topics-form">
            <FormControl className={classes.formControl}>{topics}</FormControl>
          </form>
        </DialogContent>
        <DialogActions style={{ display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleClose}
            color="primary"
            data-cy="close-topics"
            style={{ backgroundColor: "#ddd" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  const desktopView = (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Paper className={classes.root} style={{ width: "100%" }}>
        <Tabs
          value={value}
          TabIndicatorProps={{
            style: { background: "#ddd", height: "10px" },
          }}
          textColor="primary"
          onChange={onChange}
          aria-label="disabled tabs example"
        >
          {topicQuestions.map(({ topic }, i) =>
            topic !== "History" ? (
              <Tab
                key={i}
                label={topic}
                onClick={() => onTopicClick(topic)}
                className="topic-tab"
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
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      {shouldDisplayPortrait() || isMobile ? mobileView : desktopView}
    </div>
  );
}

export default TopicTabs;
