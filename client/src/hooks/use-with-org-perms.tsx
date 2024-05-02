/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Dialog,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { fetchOrgPerm } from "api";
import { ORG_ACCESS_CODE } from "local-constants";
import { useEffect, useState } from "react";
import { getLocalStorage, setLocalStorage } from "utils";

interface OrgPermStatus {
  loading: boolean;
  permitted: boolean;
  accessCode: string;
}

export interface UseWithOrgPerms {
  orgPermloading: boolean;
  orgPermitted: boolean;
  orgAccessCode: string;
  OrgPermDisplay: React.JSX.Element;
}

export function useWithOrgPerms(): UseWithOrgPerms {
  const [orgPermitted, setOrgPermitted] = useState<OrgPermStatus>({
    loading: true,
    permitted: false,
    accessCode: "",
  });
  const { accessCode, permitted, loading } = orgPermitted;

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    console.log(queryParams.get("accesscode"));
    let accesscode = queryParams.get("accesscode");
    if (accesscode) {
      setLocalStorage(ORG_ACCESS_CODE, accesscode || "");
    } else {
      accesscode = getLocalStorage(ORG_ACCESS_CODE);
    }
    getOrgPerms(accesscode || "");
  }, []);

  function setOrgPermitteds(val: Partial<OrgPermStatus>) {
    setOrgPermitted((prevValue) => {
      return {
        ...prevValue,
        ...val,
      };
    });
  }

  async function getOrgPerms(accessCode: string) {
    accessCode && setLocalStorage(ORG_ACCESS_CODE, accessCode);
    setOrgPermitteds({
      loading: true,
      accessCode,
    });
    fetchOrgPerm(accessCode).then((orgPermitted) => {
      setOrgPermitteds({
        loading: false,
        permitted: orgPermitted.canView,
      });
    });
  }

  const MemoizedOrgPermDisplay = React.useMemo(orgPermDisplay, [orgPermitted]);

  function orgPermDisplay() {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Dialog
          open={true}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            margin: 20,
            padding: 20,
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
          }}
          data-cy="get-access-code-modal"
          aria-labelledby="cookie-modal-title"
          aria-describedby="cookie-modal-description"
        >
          <Typography
            variant="h4"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 15,
              backgroundColor: "white",
              width: "100%",
            }}
          >
            Private Organization Mentor
          </Typography>
          <Typography
            style={{ textAlign: "justify", margin: 20, marginBottom: 35 }}
          >
            The mentor you are trying to visit belongs to a private
            organization. Please provide an access code to view this page.
          </Typography>
          <TextField
            id="outline-basic"
            className="text-field"
            variant="outlined"
            data-cy="access-code-input"
            value={accessCode}
            onChange={(e) => setOrgPermitteds({ accessCode: e.target.value })}
            style={{ margin: 10 }}
          />
          {orgPermitted.loading && <CircularProgress />}
          <Button
            style={{ margin: 10 }}
            disabled={orgPermitted.loading}
            data-cy="submit-access-code"
            onClick={() => getOrgPerms(accessCode)}
          >
            Submit
          </Button>
        </Dialog>
      </div>
    );
  }

  return {
    orgPermloading: loading,
    orgPermitted: permitted,
    orgAccessCode: accessCode,
    OrgPermDisplay: MemoizedOrgPermDisplay,
  };
}
