import { render } from "react-dom";
import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";

import * as serviceWorker from "./serviceWorkerRegistration";
import "./i18n";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./styles/styles.scss";

import App from "./components/app";

import { Suspense } from "react";
import Loading from "./components/misc/loading";

if (process.env.NODE_ENV === "production") {
  const ignoredFunctions = new Set([
    "is_mark_able_element",
    "findParentClickTag",
    "close_cache_key",
    "check_swipe_element",
    "eval",
  ]);
  Sentry.init({
    dsn: "https://876acfa224b8425c92f9553b9c6676be@sentry.sapikachu.net/31",
    release: process.env.REACT_APP_RELEASE || "unknown",
    ignoreErrors: [
      "this.hostIndex.push is not a function",
      "undefined is not an object (evaluating 't.uv')",
      "SyntaxError: The string did not match the expected pattern.",
      "instantSearchSDKJSBridgeClearHighlight",
      "window.bannerNight",
      "window.ucbrowser",
      "webkitExitFullScreen",
      "close_cache_key",
      "UCShellJava",
      "file:///",
      "hw-upgrade-client",
      "is_mark_able_element",
      "QK_middlewareReadModePageDetect",
      "window.webkit.messageHandlers",
      "Timeout to initialize runtime",
      "this.excludedTags.length",
    ],
    denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i, /^safari-extension:\/\//i, /^file:\/\//i],
    autoSessionTracking: true,
    beforeSend: (event, hint) => {
      if (event?.exception?.values?.[0]?.stacktrace?.frames?.some((x) => ignoredFunctions.has(x?.function || ""))) {
        return null;
      }
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
  let sentryUserId;
  try {
    sentryUserId = localStorage.getItem("sentryUserId") || sessionStorage.getItem("sentryUserId");
    if (!sentryUserId) {
      sentryUserId = uuidv4();
      sessionStorage.setItem("sentryUserId", sentryUserId);
      localStorage.setItem("sentryUserId", sentryUserId);
    }
  } catch (e) {
    // Ignore
  }
  if (sentryUserId) {
    Sentry.setUser({ id: sentryUserId });
  }
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
