import { Switch, Route, Redirect, generatePath as genPath } from "react-router-dom";

import { Model } from "./model";
import dayjs from "dayjs";
import { RouteSync } from "./routeSync";
import Loadable from "../misc/customizedLoadable";
import { PageCategory } from "../misc/tracker";
import Home from "./home";
import { ExtraFilterPredicateProvider } from "./extraFilterPredicate";
import { DataAdapterProvider } from "./dataAdapterProvider";

const PlayerDetails = Loadable({
  loader: () => import("../playerDetails/playerDetails"),
});
const GameRecordTablePlayerView = Loadable({
  loader: () => import("./tableViews").then((x) => ({ default: x.GameRecordTablePlayerView })),
});

const PLAYER_PATH =
  "/player/:id/:mode([0-9.]+)?/:search(-[^/]+)?/:startDate(\\d{4}-\\d{2}-\\d{2}|\\d{6,})?/:endDate(\\d{4}-\\d{2}-\\d{2}|\\d{6,})?";
const PATH = "/:date(\\d{4}-\\d{2}-\\d{2})/:mode([0-9]+)?/:search?";

function dateToStringSafe(value: dayjs.ConfigType | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const dateObj = dayjs(value);
  if (!dateObj.isValid() || dateObj.year() < 2019 || dateObj.year() > 9999) {
    return undefined;
  }
  if (
    dateObj.valueOf() - dateObj.startOf("day").valueOf() > 0 &&
    dateObj.endOf("day").valueOf() - dateObj.valueOf() > 60000
  ) {
    return dateObj.valueOf().toString();
  }
  return dateObj.format("YYYY-MM-DD");
}

export function generatePath(model: Model): string {
  if (model.type === "player") {
    let result = genPath(PLAYER_PATH, {
      id: model.playerId,
      startDate: dateToStringSafe(model.startDate),
      endDate: dateToStringSafe(model.endDate),
      mode: model.selectedModes.join(".") || undefined,
      search: model.searchText ? "-" + model.searchText : undefined,
    });
    const params = new URLSearchParams("");
    if (model.rank) {
      params.set("rank", model.rank.toString());
    }
    if (model.kontenOnly) {
      params.set("kontenOnly", "1");
    }
    const paramString = params.toString();
    if (paramString) {
      result += "?" + paramString;
    }
    return result;
  }
  if (!model.selectedMode && !model.searchText && !model.date) {
    return "/";
  }
  const dateString = dateToStringSafe(model.date || dayjs().startOf("day"));
  if (!dateString) {
    return "/";
  }
  return genPath(PATH, {
    date: dateString,
    mode: model.selectedMode || undefined,
    search: model.searchText || undefined,
  });
}
export function generatePlayerPathById(playerId: number | string): string {
  return generatePath({
    type: "player",
    playerId: playerId.toString(),
    startDate: null,
    endDate: null,
    selectedModes: [],
    searchText: "",
    rank: null,
    kontenOnly: false,
  });
}

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
