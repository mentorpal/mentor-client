import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

export function useWithScreenOrientation(){

    const [shouldDisplayPortrait, setShouldDisplayPortrait] =
    useState<boolean>(false);
    const [displayFormat, setDisplayFormat] = useState<string>("desktop");
    const [mainContainerClassName, setMainContainerClassName] = useState<string>(
        "main-container-responsive"
      );
    const [windowHeight, setWindowHeight] = useState<number>(0);

      useEffect(() => {
        if (typeof window === "undefined") return;

        const displaySearchParam = new URL(location.href).searchParams.get(
          "display"
        );
        const displayFormat =
          displaySearchParam && displaySearchParam == "mobile"
            ? "mobile"
            : displaySearchParam && displaySearchParam == "desktop"
            ? "desktop"
            : shouldDisplayPortrait || isMobile
            ? "mobile"
            : "desktop";
        setDisplayFormat(displayFormat);
    
        const mainContainerClassName: string =
          displaySearchParam && displaySearchParam == "mobile"
            ? "main-container-mobile"
            : displaySearchParam && displaySearchParam == "desktop"
            ? "main-container-desktop"
            : "main-container-responsive";
    
        setMainContainerClassName(mainContainerClassName);
    
        const _shouldDisplayPortrait =
          window.matchMedia && window.matchMedia("(max-width: 1200px)").matches;
        setShouldDisplayPortrait(_shouldDisplayPortrait);
    
        const handleResize = () => {
          setWindowHeight(window.innerHeight);
          const _shouldDisplayPortrait =
            window.matchMedia && window.matchMedia("(max-width: 1200px)").matches;
          setShouldDisplayPortrait(_shouldDisplayPortrait);
        };
        window.addEventListener("resize", handleResize);
        setWindowHeight(window.innerHeight);
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

      useEffect(() => {
        if (typeof window === "undefined") return;
        const displaySearchParam = new URL(location.href).searchParams.get(
          "display"
        );
        const displayFormat =
          displaySearchParam && displaySearchParam == "mobile"
            ? "mobile"
            : displaySearchParam && displaySearchParam == "desktop"
            ? "desktop"
            : shouldDisplayPortrait || isMobile
            ? "mobile"
            : "desktop";
        setDisplayFormat(displayFormat);
      }, [shouldDisplayPortrait, isMobile]);


      return{
        displayFormat,
        mainContainerClassName,
        windowHeight
      }
}