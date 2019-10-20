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
          <Switch>
            <Route exact path={["/", "/:date(\\d{4}-\\d{2}-\\d{2})/:modes([0-9.]+)?/:search?"]}>
              <GameRecords />
            </Route>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </Container>
      </Scroller>
    </Router>
  );
}
export default App;
