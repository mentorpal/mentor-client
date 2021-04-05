/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

import store from "store/reducer";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#000000",
    },
  },
});

const storeObj = createStore(store, applyMiddleware(...[thunk]));

export const wrapRootElement = ({ element }) => (
  // <MuiThemeProvider theme={theme}>
    <Provider store={storeObj}>{element}</Provider>
  // </MuiThemeProvider>
);

/*export const onRouteUpdate = ({ location, prevLocation }) => {
  if (
    typeof window !== "undefined" &&
    !window.location.protocol.toLowerCase().startsWith("https")
  ) {
    const redirect = `https://${window.location.host}${window.location.pathname}${window.location.search}`;
    window.location.href = redirect;
  }
};*/
