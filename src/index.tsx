import * as React from "react";
import { render } from "react-dom";
import * as Sentry from "@sentry/react";

import * as serviceWorker from "./serviceWorkerRegistration";
import "./i18n";

import "./styles/bootstrap-custom.scss";
import "./styles/styles.scss";

import App from "./components/app";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://876acfa224b8425c92f9553b9c6676be@sentry.sapikachu.net/31",
    release: process.env.REACT_APP_VERSION || "unknown",
  });
}

if (!Object.values) {
  import("./utils/polyfill");
}

const rootElement = document.getElementById("root");
render(
  <Sentry.ErrorBoundary>
    <App />
  </Sentry.ErrorBoundary>,
  rootElement
);

serviceWorker.register({
  onUpdate(registration) {
    const waitingServiceWorker = registration.waiting || navigator.serviceWorker.controller;

    if (waitingServiceWorker) {
      if (waitingServiceWorker.state === "activated") {
        window.location.reload();
        return;
      }
      waitingServiceWorker.addEventListener("statechange", (event) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (event.target && (event.target as any).state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
});
