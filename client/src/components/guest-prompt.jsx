import React, { useState } from "react";
import {
  Modal,
  Button,
  Paper,
  InputBase,
  Backdrop,
  Fade,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  inputField: {
    flex: 1,
    paddingLeft: "8px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderRadius: "5px",
    borderColor: "rgba(0, 0, 0, 0.20)",
  },
  button: {
    margin: 10,
  },
}));

export default function GuestPrompt({ submit }) {
  const classes = useStyles();
  const [name, setName] = useState("");

  function onInput(text) {
    setName(text);
  }

  return (
    <div id="guest-prompt">
      <Modal
        open={true}
        onClose={() => submit(name)}
        className={classes.modal}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Paper className={classes.paper}>
          <h2>Enter a guest name:</h2>
          <InputBase
            className={classes.inputField}
            value={name}
            placeholder={"guest"}
            onChange={e => {
              onInput(e.target.value);
            }}
          />
          <Button
            className={classes.button}
            onClick={() => submit(name)}
            variant="contained"
            color="primary"
          >
            Okay
          </Button>
        </Paper>
      </Modal>
    </div>
  );
}
