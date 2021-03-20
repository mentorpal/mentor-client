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
  // console.log("Header Logo: " + styleHeaderLogo);
  const styleHeaderColor = useSelector<State, string>(
    (state) => state.config.styleHeaderColor?.trim() || "#FFFFFF"
  );
  // console.log("Header Color: " + styleHeaderColor);
  const styleHeaderTextColor = useSelector<State, string>(
    (state) => state.config.styleHeaderTextColor?.trim() || "#000000"
  );
  // console.log("Header Text Color: " + styleHeaderTextColor);

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
          height: 50,
          backgroundColor: `${styleHeaderColor}`,
          color: `${styleHeaderTextColor}`,
        }}
      >
        <img
          src={styleHeaderLogo}
          style={{ position: "absolute", left: "5px", height: 50 }}
        />
        <Hidden only="xs">
          <Typography>
            {mentor.name}: {mentor.title}
          </Typography>
        </Hidden>
        <IconButton
          aria-label="information"
          component="span"
          style={{
            position: "absolute",
            right: "20px",
            color: `${styleHeaderTextColor}`,
          }}
          onClick={handleClickOpen}
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
          <DialogTitle id="alert-dialog-title">
            {"USC Privacy Policy"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              felis ex, tempor eget velit id, fringilla interdum nisl. Aliquam
              erat volutpat. Duis eu suscipit dolor, quis varius ex. Proin
              tincidunt mollis dictum. Sed porta elit sapien, id ultrices tortor
              venenatis porttitor. Nam ut egestas magna. Nunc at neque a enim
              aliquet efficitur vitae in odio. Mauris sollicitudin pulvinar
              vestibulum. Nunc gravida tellus in diam maximus rutrum. Vivamus mi
              tellus, convallis at commodo nec, consequat non velit. Nulla id
              diam nibh. Mauris lectus enim, consectetur nec aliquam vitae,
              auctor non odio. Curabitur eleifend sagittis neque, id ornare odio
              mollis eget. Cras dictum enim nec eleifend fringilla. Ut in
              bibendum quam. Suspendisse ultricies, orci id blandit faucibus,
              neque ligula sodales mi, vitae tristique arcu erat volutpat
              libero.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAgree} color="primary">
              I Agree
            </Button>
          </DialogActions>
        </Dialog>
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
        height: 50,
        backgroundColor: `${styleHeaderColor}`,
        color: `${styleHeaderTextColor}`,
      }}
    >
      <Typography>
        {mentor.name}: {mentor.title}
      </Typography>
    </div>
  );
}

export default Header;
