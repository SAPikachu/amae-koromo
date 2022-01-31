import { Switch, Route, Redirect } from "react-router-dom";

import { RouteSync } from "./routeSync";
import Loadable from "../misc/customizedLoadable";
import { PageCategory } from "../misc/tracker";
import Home from "./home";
import { ExtraFilterPredicateProvider } from "./extraFilterPredicate";
import { DataAdapterProvider } from "./dataAdapterProvider";
import { PLAYER_PATH, PATH } from "./routeUtils";

const PlayerDetails = Loadable({
  loader: () => import("../playerDetails/playerDetails"),
});
const GameRecordTablePlayerView = Loadable({
  loader: () => import("./tableViews").then((x) => ({ default: x.GameRecordTablePlayerView })),
});

function Routes() {
  return (
    <Switch>
      <Route path={PLAYER_PATH}>
        <RouteSync view="player" />
        <PageCategory category="Player" />
        <ExtraFilterPredicateProvider>
          <DataAdapterProvider>
            <PlayerDetails />
            <GameRecordTablePlayerView />
          </DataAdapterProvider>
        </ExtraFilterPredicateProvider>
      </Route>
      <Route exact path={["/", PATH]}>
        <RouteSync view="listing" />
        <PageCategory category="Listing" />
        <DataAdapterProvider>
          <Home />
        </DataAdapterProvider>
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
export default Routes;
