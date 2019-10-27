import * as React from "react";
import { render } from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-virtualized/styles.css";
import "./styles.css";

import App from "./components/app";

const rootElement = document.getElementById("root");
render(<App />, rootElement);
