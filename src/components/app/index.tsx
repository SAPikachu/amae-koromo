import React from "react";

import { BrowserRouter as Router } from "react-router-dom";
import Loadable from "react-loadable";
import Scroller from "../misc/scroller";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import GameRecords from "../gameRecords";
import { TITLE_PREFIX, CANONICAL_DOMAIN } from "../../utils/constants";
import { MaintenanceHandler } from "./maintenance";

const Helmet = Loadable({
  loader: () => import("react-helmet"),
  loading: () => <></>
});

function App() {
  return (
    <Router>
      <Helmet>
        <title>{TITLE_PREFIX}</title>
        <link rel="canonical" href={`https://${CANONICAL_DOMAIN}/`} />
      </Helmet>
      <MaintenanceHandler>
        <Scroller>
          <AppHeader />
          <Container>
            <GameRecords />
          </Container>
        </Scroller>
      </MaintenanceHandler>
    </Router>
  );
}
export default App;
