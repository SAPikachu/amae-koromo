import React from "react";

import { Switch, Route, Redirect, generatePath as genPath } from "react-router-dom";

import { Model, ModelProvider } from "./model";
import dayjs from "dayjs";
import { RouteSync } from "./routeSync";
import { DataAdapterProvider } from "./dataAdapterProvider";
import { FilterPanel } from "./filterPanel";
import Loadable from "react-loadable";
import Loading from "../misc/loading";
import { PlayerSearch } from "./playerSearch";
const PlayerDetails = Loadable({
  loader: () => import("../playerDetails/playerDetails"),
  loading: () => <Loading />
});
const GameRecordTable = Loadable({
  loader: () => import("./table"),
  loading: () => <Loading />
});

const PLAYER_PATH = "/player/:id/:mode([0-9]+)?/:startDate(\\d{4}-\\d{2}-\\d{2})?/:endDate(\\d{4}-\\d{2}-\\d{2})?";
const PATH = "/:date(\\d{4}-\\d{2}-\\d{2})/:mode([0-9]+)?/:search?";

export function generatePath(model: Model): string {
  if (model.type === "player") {
    return genPath(PLAYER_PATH, {
      id: model.playerId,
      startDate: model.startDate ? dayjs(model.startDate).format("YYYY-MM-DD") : undefined,
      endDate: model.endDate ? dayjs(model.endDate).format("YYYY-MM-DD") : undefined,
      mode: model.selectedMode || undefined
    });
  }
  if (!model.selectedMode && !model.searchText && !model.date) {
    return "/";
  }
  return genPath(PATH, {
    date: dayjs(model.date || new Date()).format("YYYY-MM-DD"),
    mode: model.selectedMode || undefined,
    search: model.searchText || undefined
  });
}
export function generatePlayerPathById(playerId: number | string): string {
  return generatePath({
    type: "player",
    playerId: playerId.toString(),
    startDate: null,
    endDate: null,
    selectedMode: "",
    version: 0
  });
}

function Routes() {
  return (
    <ModelProvider>
      <DataAdapterProvider>
        <Switch>
          <Route exact path={PLAYER_PATH}>
            <RouteSync view="player" />
            <PlayerDetails />
            <GameRecordTable showFullTime showStartEnd={false} />
          </Route>
          <Route exact path={["/", PATH]}>
            <RouteSync view="listing" />
            <div className="row">
              <FilterPanel className="col" />
              <PlayerSearch className="col-12 col-sm-6 col-md-4" />
            </div>
            <GameRecordTable />
          </Route>
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </DataAdapterProvider>
    </ModelProvider>
  );
}
export default Routes;
