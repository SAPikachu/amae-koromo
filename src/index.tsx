import * as React from "react";
import { render } from "react-dom";
import * as serviceWorker from "./serviceWorker";
import "./i18n";

import "./styles/bootstrap-custom.scss";
import "./styles/styles.scss";

import App from "./components/app";

const rootElement = document.getElementById("root");
render(<App />, rootElement);

serviceWorker.register({
  onUpdate(registration) {
    const waitingServiceWorker = registration.waiting || navigator.serviceWorker.controller;

    if (waitingServiceWorker) {
      if (waitingServiceWorker.state === "activated") {
        window.location.reload();
        return;
      }
      waitingServiceWorker.addEventListener("statechange", event => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (event.target && (event.target as any).state === "activated") {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }
});
