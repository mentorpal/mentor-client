/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";

import { Divider, TextField } from "@mui/material";

import "styles/grid.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Config, State } from "types";
import ReactMarkdown from "react-markdown";

const style = {
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "fit-content",
  maxWidth: "95%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};

interface UsernameModalProps {
  setOpen: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  onSubmit: (email: string) => void;
  open: boolean;
}

export default function UsernameModal(props: UsernameModalProps): JSX.Element {
  const { setOpen, open, onSubmit } = props;
  const [userEmailField, setUserEmailField] = useState<string>("");
  const handleClose = () => setOpen(false);
  const [error, setError] = useState<boolean>(false);
  const config: Config = useSelector<State, Config>((state) => state.config);

  const onSumbitClick = (): void => {
    if (
      config.guestPromptInputType == "Email" &&
      !validateEmailField(userEmailField)
    ) {
      setError(true);
    } else {
      onSubmit(userEmailField);
      setOpen(false);
    }
  };

  const validateEmailField = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const editValue = (value: string): void => {
    if (config.guestPromptInputType == "Text") {
      const domain = window.location.host.split(".");
      setUserEmailField(
        config.guestPromptInputType == "Text"
          ? `${value}@${domain[0]}${domain[1]}.com`
          : value
      );
    } else {
      setUserEmailField(value);
    }
  };

  const closeModal = (): void => {
    setOpen(false);
    onSubmit("");
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          style={{ position: "absolute" }}
          data-cy="username-modal-container"
        >
          <CloseIcon
            onClick={closeModal}
            style={{ position: "absolute", right: "15px", top: "15px" }}
            data-cy="close-username-modal"
          />
          <Typography
            id="modal-username-title"
            variant="h4"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 15,
            }}
            data-cy="modal-username-title"
          >
            {config.guestPromptTitle}
          </Typography>
          <Divider />
          <br></br>
          <div
            id="modal-username-title"
            style={{ textAlign: "justify", marginBottom: 35 }}
            data-cy="modal-username-description"
          >
            <ReactMarkdown>{unescape(config.guestPromptText)}</ReactMarkdown>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            data-cy="remove-btns-options"
          >
            <TextField
              error={error}
              id="outline-basic"
              className="text-field"
              variant="outlined"
              label={config.guestPromptInputType}
              onChange={(e) => editValue(e.target.value)}
              style={{ marginRight: 10 }}
              helperText={error ? "Incorrect entry." : ""}
              data-cy="username-field"
            />
            <Button
              data-cy="sumbit-email-btn"
              className="btn-email"
              onClick={onSumbitClick}
            >
              Submit
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
