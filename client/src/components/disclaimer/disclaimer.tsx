/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { State } from "types";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import Tooltip from "@mui/material/Tooltip";
import { SurveyDialog } from "components/survey-dialog";

export default function Disclaimer(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const disclaimerText = useSelector<State, string>(
    (state) => state.config.disclaimerText
  );
  const disclaimerTitle = useSelector<State, string>(
    (state) => state.config.disclaimerTitle?.trim() || "Please Configure Title"
  );

  return (
    <Tooltip title="Disclaimer">
      <div>
        <label htmlFor="icon-button-file">
          <IconButton
            component="span"
            onClick={() => setOpen(true)}
            data-cy="header-disclimer-btn"
            size="large"
          >
            <InfoIcon style={{ color: "white" }} />
          </IconButton>
        </label>
        <Modal
          open={true}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          data-cy="disclaimer-container"
          disableScrollLock={true}
          style={{ height: "100%", display: open ? "block" : "none" }}
        >
          <Box className="modal-animation">
            <div className="disclaimer-content-container">
              <Typography
                data-cy="disclaimer-title"
                id="modal-modal-title"
                variant="h4"
                component="h2"
                style={{ textAlign: "center" }}
              >
                {disclaimerTitle}
              </Typography>
              <div data-cy="disclaimer-text" id="modal-modal-description">
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
