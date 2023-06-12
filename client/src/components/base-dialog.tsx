/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export function BaseDialog(props: {
  title?: string;
  subtext: string;
  open: boolean;
  closeDialog: () => void;
}): JSX.Element {
  const { title, subtext, open, closeDialog } = props;

  return (
    <Dialog data-cy="base-dialog" maxWidth="sm" fullWidth={true} open={open}>
      <DialogTitle
        data-cy="base-dialog-title"
        variant="h4"
        style={{
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography
          id="base-dialog-body-text"
          variant="h6"
          data-cy="base-dialog-body-text"
        >
          {subtext}
        </Typography>
        <Button data-cy="close-base-dialog-button" onClick={closeDialog}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
