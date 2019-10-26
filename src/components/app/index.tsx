import React from "react";

import { BrowserRouter as Router } from "react-router-dom";
import Loadable from "react-loadable";
const Helmet = Loadable({
  loader: () => import("react-helmet"),
  loading: () => <></>
});

import Scroller from "../misc/scroller";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import GameRecords from "../gameRecords";
import { TITLE_PREFIX } from '../../utils/constants';

function App() {
  return (
    <Router>
      <Helmet>
        <title>{TITLE_PREFIX}</title>
      </Helmet>
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
