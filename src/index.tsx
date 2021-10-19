import { render } from "react-dom";
import * as Sentry from "@sentry/react";

import * as serviceWorker from "./serviceWorkerRegistration";
import "./i18n";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./styles/styles.scss";

import App from "./components/app";

import preval from "preval.macro";

if (process.env.NODE_ENV === "production") {
  const buildDate = preval`module.exports = new Date().toISOString()`;
  Sentry.init({
    dsn: "https://876acfa224b8425c92f9553b9c6676be@sentry.sapikachu.net/31",
    release: buildDate + (process.env.REACT_APP_VERSION || "unknown"),
    ignoreErrors: ["this.hostIndex.push is not a function"],
    denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],
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
  onControllerChange() {
    window.location.reload();
  },
  onUpdate(registration) {
    const waitingServiceWorker = registration.waiting || navigator.serviceWorker.controller;

    if (waitingServiceWorker) {
      if (waitingServiceWorker.state === "activated" || waitingServiceWorker.state === "activating") {
        window.location.reload();
        return;
      }
      waitingServiceWorker.addEventListener("statechange", (event) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = (event.target as any)?.state;
        if (state === "activated" || state === "activating") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});

const statusPageScript = document.createElement("script");
statusPageScript.async = true;
statusPageScript.src = "https://qltr0c2md09b.statuspage.io/embed/script.js";
document.body.appendChild(statusPageScript);
