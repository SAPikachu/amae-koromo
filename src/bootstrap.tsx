import { render } from "react-dom";

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
import { SentryErrorBoundary } from "./utils/sentry";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Conf from "./utils/conf";
dayjs.extend(utc);

if (location.host === "amae-koromo.vercel.app") {
  location.href = "https://" + Conf.canonicalDomain;
}

const rootElement = document.getElementById("root");
render(
  <SentryErrorBoundary>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </SentryErrorBoundary>,
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
