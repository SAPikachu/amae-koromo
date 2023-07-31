import { Route, Switch } from "react-router-dom";
import Loadable from "../misc/customizedLoadable";
import GameRecords from "../gameRecords";
import { PageCategory } from "../misc/tracker";
import Conf from "../../utils/conf";

const Ranking = Loadable({
  loader: () => import("../ranking"),
});
const Statistics = Loadable({
  loader: () => import("../statistics"),
});
const RecentHighlight = Loadable({
  loader: () => import("../recentHighlight"),
});
const ContestTools = Loadable({
  loader: () => import("../contestTools"),
});
export function Routes() {
  return (
    <Switch>
      <Route path="/ranking">
        <PageCategory category="Ranking" />
        <Ranking />
      </Route>
      <Route path="/statistics">
        <PageCategory category="Statistics" />
        <Statistics />
      </Route>
      <Route path="/highlight">
        <PageCategory category="RecentHighlight" />
        <RecentHighlight />
      </Route>
      {Conf.features.contestTools ? (
        <Route path="/contest-tools">
          <ContestTools />
        </Route>
      ) : null}
      <Route path="/">
        <GameRecords />
      </Route>
    </Switch>
  );
}
