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
import { Suspense } from "react";
import Loading from "./components/misc/loading";

if (process.env.NODE_ENV === "production") {
  const buildDate = preval`const dayjs = require("dayjs"); dayjs.extend(require('dayjs/plugin/utc')); module.exports = dayjs.utc().format("YYYYMMDDHHmm")`;
  Sentry.init({
    dsn: "https://876acfa224b8425c92f9553b9c6676be@sentry.sapikachu.net/31",
    release: buildDate + "-" + (process.env.REACT_APP_VERSION || "unknown").slice(0, 7),
    ignoreErrors: [
      "this.hostIndex.push is not a function",
      "undefined is not an object (evaluating 't.uv')",
      "SyntaxError: The string did not match the expected pattern.",
      "instantSearchSDKJSBridgeClearHighlight",
      "window.bannerNight",
      "window.ucbrowser",
      "webkitExitFullScreen",
      "close_cache_key",
    ],
    denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i, /^file:\/\//i],
    beforeSend: (event, hint) => {
      if (
        hint?.originalException &&
        typeof hint.originalException !== "string" &&
        /Loading chunk \d+ failed after \d+ retries/.test(hint.originalException.message)
      ) {
        event.fingerprint = ["ChunkLoadError"];
      }
      return event;
    },
  });
}

const rootElement = document.getElementById("root");
render(
  <Sentry.ErrorBoundary>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
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
