import React from "react";

import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Scroller from "../misc/scroller";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import GameRecords from "../gameRecords";

function App() {
  return (
    <Router>
      <Scroller>
        <AppHeader />
        <Container>
          <GameRecords />
        </Container>
      </Scroller>
    </Router>
  );
}
export default App;
