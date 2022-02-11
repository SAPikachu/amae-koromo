import * as Sentry from "@sentry/react";
import { v4 as uuidv4 } from "uuid";

if (process.env.REACT_APP_SENTRY_DSN) {
  const ignoredFunctions = new Set([
    "is_mark_able_element",
    "findParentClickTag",
    "close_cache_key",
    "check_swipe_element",
    "eval",
  ]);
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
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

export const SentryErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;