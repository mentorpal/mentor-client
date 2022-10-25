/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";

type DisplayFormat = "mobile" | "desktop";

export interface UseWithScreenOrientation {
  displayFormat: DisplayFormat;
  windowHeight: number;
}

export function useWithScreenOrientation(): UseWithScreenOrientation {
  const [shouldDisplayPortrait, setShouldDisplayPortrait] =
    useState<boolean>(false);
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("desktop");
  const [windowHeight, setWindowHeight] = useState<number>(0);

  function displayCheckAndSet() {
    const displaySearchParam = new URL(location.href).searchParams.get(
      "display"
    );
    const displayFormat =
      displaySearchParam && displaySearchParam == "mobile"
        ? "mobile"
        : displaySearchParam && displaySearchParam == "desktop"
        ? "desktop"
        : shouldDisplayPortrait
        ? "mobile"
        : "desktop";
    setDisplayFormat(displayFormat);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    displayCheckAndSet();

    const handleResize = () => {
      const windowRatio = window.innerWidth / window.innerHeight;
      const minBreakPointReached =
        window.matchMedia && window.matchMedia("(max-width: 1000px)").matches;
      setShouldDisplayPortrait(minBreakPointReached || windowRatio <= 0.75); // || windowRatio
      setWindowHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    displayCheckAndSet();
  }, [shouldDisplayPortrait]);
  return {
    displayFormat,
    windowHeight,
  };
}
