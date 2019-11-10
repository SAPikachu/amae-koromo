import React from "react";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Loadable from "react-loadable";
import Scroller from "../misc/scroller";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import GameRecords from "../gameRecords";
import { TITLE_PREFIX } from "../../utils/constants";
import { MaintenanceHandler } from "./maintenance";
import Navbar from "./navbar";
import CanonicalLink from "../misc/canonicalLink";
import Loading from "../misc/loading";

const Helmet = Loadable({
  loader: () => import("react-helmet"),
  loading: () => <></>
});
const Ranking = Loadable({
  loader: () => import("../ranking"),
  loading: () => <Loading />
});
const Statistics = Loadable({
  loader: () => import("../statistics"),
  loading: () => <Loading />
});

function App() {
  return (
    <Router>
      <Helmet defaultTitle={TITLE_PREFIX} titleTemplate={`%s | ${TITLE_PREFIX}`} />
      <CanonicalLink />
      <Navbar />
      <MaintenanceHandler>
        <Scroller>
          <AppHeader />
          <Container>
            <Switch>
              <Route path="/ranking">
                <Ranking />
              </Route>
              <Route path="/statistics">
                <Statistics />
              </Route>
              <Route path="/">
                <GameRecords />
              </Route>
            </Switch>
          </Container>
        </Scroller>
      </MaintenanceHandler>
    </Router>
  );
}
export default App;
