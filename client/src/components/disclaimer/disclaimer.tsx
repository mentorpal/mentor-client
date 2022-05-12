/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import { Button, IconButton } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { State } from "types";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import Tooltip from "@material-ui/core/Tooltip";
import { SurveyDialog } from "components/survey-dialog";

export default function Disclaimer(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const disclaimerText = useSelector<State, string>(
    (state) => state.config.disclaimerText
  );

  // const disclaimerTitle = useSelector<State, string>(
  //   (state) => state.config.disclaimerTitle?.trim() || "Please Configure Title"
  // );
  // const disclaimerDisabled = useSelector<State, boolean>(
  //   (state) => state.config.disclaimerDisabled
  // );

  // const [acceptedTerms, setAcceptedTerms] = useLocalStorage(
  //   "acceptedTerms",
  //   "false"
  // );

  //Check if user agreed to TOS, if not present dialog by setting default state
  // const [open, setOpen] = React.useState(false);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  return (
    <Tooltip title="Disclaimer">
      <div>
        <label htmlFor="icon-button-file">
          <IconButton
            component="span"
            onClick={() => setOpen(true)}
            data-cy="header-disclimer-btn"
          >
            <InfoIcon style={{ color: "black" }} />
          </IconButton>
        </label>
        <Modal
          open={true}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          data-cy="disclaimer-container"
          style={{ height: "100%", display: open ? "block" : "none" }}
        >
          <Box className="modal-animation">
            <div className="disclaimer-content-container">
              <Typography
                id="modal-modal-title"
                variant="h4"
                component="h2"
                style={{ textAlign: "center" }}
              >
                Policy
              </Typography>
              <div id="modal-modal-description">
                <ReactMarkdown>
                  {disclaimerText
                    ? unescape(disclaimerText)
                    : "No policy avaliable"}
                </ReactMarkdown>
              </div>
              <Button
                style={{
                  margin: "auto",
                  marginTop: 10,
                  width: "100%",
                  fontWeight: "bold",
                }}
                onClick={() => setOpen(false)}
                data-cy="accept-disclaimer"
              >
                Accept
              </Button>
              <div
                style={{
                  margin: "auto",
                  marginTop: 10,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <SurveyDialog />
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </Tooltip>
  );
}
