/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v1 as uuidv1 } from "uuid";
import { Modal, Button, Paper, InputBase, Backdrop } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { initCmi5 } from "cmiutils";
import { Config, State } from "types";
import { cmi5Init } from "store/actions";

const useStyles = makeStyles((theme) => ({
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

export default function GuestPrompt(): JSX.Element {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(true);
  const config = useSelector<State, Config>((state) => state.config);
  const dispatch = useDispatch();

  async function onGuestNameEntered(name: string) {
    if (!name) {
      name = "guest";
    }
    const userId = uuidv1();
    const localData = localStorage.getItem("userData");
    const userEmail = JSON.parse(localData ? localData : "{}").userEmail;
    await initCmi5(userId, userEmail, `guests`, config);
    dispatch(cmi5Init());
    setOpen(false);
  }

  function onInput(name: string) {
    const polished = name ? name.trim() : "";
    setName(polished);
    if (name.includes("\n")) {
      onGuestNameEntered(polished);
    }
  }

  return (
    <div data-cy="guest-prompt">
      <Modal
        open={open}
        onClose={() => onGuestNameEntered(name)}
        className={classes.modal}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Paper className={classes.paper}>
          <h2 data-cy="guest-prompt-header">Enter Your Name:</h2>
          <InputBase
            data-cy="guest-prompt-input"
            multiline={true}
            className={classes.inputField}
            value={name}
            placeholder={"Name"}
            onChange={(e) => {
              onInput(e.target.value);
            }}
          />
          <Button
            data-cy="guest-prompt-input-send"
            className={classes.button}
            onClick={() => onGuestNameEntered(name)}
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
