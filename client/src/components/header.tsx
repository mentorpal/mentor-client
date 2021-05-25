/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { useSelector } from "react-redux";
import { Hidden, Typography } from "@material-ui/core";
import { State } from "types";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import Button from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useLocalStorage from "use-local-storage";

interface HeaderMentorData {
  _id: string;
  name: string;
  title: string;
}

function Header(): JSX.Element {
  const mentor = useSelector<State, HeaderMentorData | null>((state) => {
    if (!state.curMentor) {
      return null;
    }
    const m = state.mentorsById[state.curMentor];
    if (!(m && m.mentor)) {
      return null;
    }
    return {
      _id: m.mentor._id,
      name: m.mentor.name,
      title: m.mentor.title,
    };
  });

  const styleHeaderLogo = useSelector<State, string>(
    (state) => state.config.styleHeaderLogo?.trim() || ""
  );
  const styleHeaderColor = useSelector<State, string>(
    (state) => state.config.styleHeaderColor?.trim() || "#FFFFFF"
  );
  const styleHeaderTextColor = useSelector<State, string>(
    (state) => state.config.styleHeaderTextColor?.trim() || "#000000"
  );

  const disclaimerTitle = useSelector<State, string>(
    (state) => state.config.disclaimerTitle?.trim() || "Please Configure Title"
  );
  const disclaimerText = useSelector<State, string>(
    (state) => state.config.disclaimerText?.trim() || "Please Configure Text"
  );
  const disclaimerDisabled = useSelector<State, boolean>(
    (state) => state.config.disclaimerDisabled
  );

  if (!mentor) {
    return <></>;
  }

  const [acceptedTerms, setAcceptedTerms] = useLocalStorage(
    "acceptedTerms",
    "false"
  );
  //Check if user agreed to TOS, if not present dialog by setting default state
  const [open, setOpen] = React.useState(acceptedTerms !== "true");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleAgree = () => {
    setAcceptedTerms("true");
    setOpen(false);
  };

  if (styleHeaderLogo) {
    return (
      <div
        data-cy="header"
        data-mentor={mentor._id}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 55,
          backgroundColor: `${styleHeaderColor}`,
          color: `${styleHeaderTextColor}`,
        }}
      >
        <img
          src={styleHeaderLogo}
          style={{
            position: "absolute",
            left: "10px",
            height: 40,
            paddingTop: 10,
            paddingBottom: 10,
          }}
        />
        <Hidden only="xs">
          <Typography>
            {mentor.name}: {mentor.title}
          </Typography>
        </Hidden>
        {/* Show disclaimer */}
        {disclaimerDisabled ? (
          <></>
        ) : (
          <>
            <IconButton
              aria-label="information"
              component="span"
              style={{
                position: "absolute",
                right: "20px",
                color: `${styleHeaderTextColor}`,
              }}
              onClick={handleClickOpen}
              data-cy="info-button"
            >
              <InfoIcon />
            </IconButton>
            <Dialog
              disableBackdropClick
              disableEscapeKeyDown
              open={open}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title" data-cy="alert-dialog-title">
                {disclaimerTitle}
              </DialogTitle>
              <DialogContent>
                <DialogContentText
                  id="alert-dialog-description"
                  data-cy="alert-dialog-description"
                >
                  {disclaimerText}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleAgree}
                  color="primary"
                  data-cy="agree-button"
                >
                  I Agree
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      data-cy="header"
      data-mentor={mentor._id}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: 55,
        backgroundColor: `${styleHeaderColor}`,
        color: `${styleHeaderTextColor}`,
      }}
    >
      <Typography>
        {mentor.name}: {mentor.title}
      </Typography>
      {/* Show disclaimer */}
      {disclaimerDisabled ? (
        <></>
      ) : (
        <>
          <IconButton
            aria-label="information"
            component="span"
            style={{
              position: "absolute",
              right: "20px",
              color: `${styleHeaderTextColor}`,
            }}
            onClick={handleClickOpen}
            data-cy="info-button"
          >
            <InfoIcon />
          </IconButton>
          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title" data-cy="alert-dialog-title">
              {disclaimerTitle}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                data-cy="alert-dialog-description"
              >
                {disclaimerText}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleAgree}
                color="primary"
                data-cy="agree-button"
              >
                I Agree
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
}

export default Header;
