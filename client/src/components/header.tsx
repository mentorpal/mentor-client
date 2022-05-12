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
import HomeIcon from "@material-ui/icons/Home";
import "styles/layout.css";
import Disclaimer from "./disclaimer/disclaimer";

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

  const numberMentors = useSelector<State, number>(
    (state) => Object.keys(state.mentorsById).length
  );
  const subject = "";

  const styleHeaderLogo = useSelector<State, string>(
    (state) => state.config.styleHeaderLogo?.trim() || ""
  );
  const styleHeaderColor = useSelector<State, string>(
    (state) => state.config.styleHeaderColor?.trim() || "#FFFFFF"
  );
  const styleHeaderTextColor = useSelector<State, string>(
    (state) => state.config.styleHeaderTextColor?.trim() || "#000000"
  );

  if (!mentor) {
    return <></>;
  }

  const handleClickHome = () => {
    const localData = localStorage.getItem("userData");
    const userEmail = JSON.parse(localData ? localData : "").userEmail;
    const userID = JSON.parse(localData ? localData : "").userID;
    const referrer = new URL(location.href).searchParams.get("referrer");

    window.location.href = `/home/?referrer=${referrer}&userEmail=${userEmail}&userid=${userID}`;
  };

  // const handleAgree = () => {
  //   setAcceptedTerms("true");
  //   setOpen(false);
  // };

  const MentorNameTitle = `${mentor.name}: ${mentor.title}`;

  const subjectTitle = subject ? `Mentor Panel: ${subject}` : "Mentor Panel";

  // function disclaimerDialog() {
  //   return (
  //     <>
  //       <IconButton
  //         aria-label="information"
  //         component="span"
  //         style={{
  //           position: "absolute",
  //           right: "20px",
  //           color: `${styleHeaderTextColor}`,
  //         }}
  //         onClick={handleClickOpen}
  //         data-cy="info-button"
  //       >
  //         <InfoIcon />
  //       </IconButton>
  //       <Dialog
  //         disableBackdropClick
  //         disableEscapeKeyDown
  //         open={open}
  //         aria-labelledby="alert-dialog-title"
  //         aria-describedby="alert-dialog-description"
  //       >
  //         <DialogTitle id="alert-dialog-title" data-cy="alert-dialog-title">
  //           {disclaimerTitle}
  //         </DialogTitle>
  //         <DialogContent>
  //           <DialogContentText
  //             id="alert-dialog-description"
  //             data-cy="alert-dialog-description"
  //           >
  //             {disclaimerText}
  //           </DialogContentText>
  //         </DialogContent>
  //         <DialogActions>
  //           <Button
  //             onClick={handleAgree}
  //             color="primary"
  //             data-cy="agree-button"
  //           >
  //             I Agree
  //           </Button>
  //         </DialogActions>
  //         <div
  //           style={{
  //             margin: "auto",
  //             marginTop: 10,
  //             width: "100%",
  //             textAlign: "center",
  //           }}
  //         >
  //           <SurveyDialog />
  //         </div>
  //       </Dialog>
  //     </>
  //   );
  // }

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
        {mentor.name !== "USC" ? (
          <IconButton
            aria-label="information"
            component="span"
            style={{
              position: "absolute",
              left: "50px",
              color: `${styleHeaderTextColor}`,
            }}
            onClick={handleClickHome}
            data-cy="home-button"
          >
            <HomeIcon />
          </IconButton>
        ) : (
          ""
        )}
        <Hidden only="xs">
          <Typography>
            {numberMentors === 1 ? MentorNameTitle : subjectTitle}
          </Typography>
        </Hidden>
        {/* Show disclaimer */}
        <div
          style={{
            position: "absolute",
            right: "50px",
          }}
        >
          <Disclaimer />
        </div>
      </div>
    );
  }

  return (
    <div
      data-cy="header"
      data-mentor={mentor._id}
      style={{
        backgroundColor: `${styleHeaderColor}`,
        color: `${styleHeaderTextColor}`,
      }}
      className="header-container"
    >
      <div className="home-btn-wrapper">
        {mentor.name !== "USC" ? (
          <IconButton
            aria-label="information"
            component="span"
            style={{
              color: `${styleHeaderTextColor}`,
            }}
            className="home-btn"
            onClick={handleClickHome}
            data-cy="home-button"
          >
            <HomeIcon />
          </IconButton>
        ) : (
          ""
        )}
      </div>
      <div className="header-mentor-info">
        <Typography>
          {mentor.name}: {mentor.title}
        </Typography>
      </div>
      {/* Show disclaimer */}
      <div
        style={{
          position: "absolute",
          right: "50px",
        }}
      >
        <Disclaimer />
      </div>
    </div>
  );
}

export default Header;
