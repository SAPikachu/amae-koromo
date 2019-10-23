import React from "react";

import { Switch, Route, Redirect, generatePath as genPath } from "react-router-dom";

import { Model, ModelProvider } from "./model";
import moment from "moment";
import { RouteSync } from "./routeSync";
import { DataAdapterProvider } from "./dataAdapterProvider";
import { GameRecordTable } from "./table";
import { FilterPanel } from "./filterPanel";

const PLAYER_PATH = "/player/:id";
const PATH = "/:date(\\d{4}-\\d{2}-\\d{2})/:modes([0-9.]+)?/:search?";

export function generatePath(model: Model): string {
  if (model.type === "player") {
    return genPath(PLAYER_PATH, { id: model.playerId });
  }
  if ((!model.selectedModes || !model.selectedModes.size) && !model.searchText && !model.date) {
    return "/";
  }
  return genPath(PATH, {
    date: moment(model.date || new Date()).format("YYYY-MM-DD"),
    modes: model.selectedModes && model.selectedModes.size ? Array.from(model.selectedModes).join(".") : undefined,
    search: model.searchText || undefined
  });
}

function Routes() {
  return (
    <ModelProvider>
      <DataAdapterProvider>
        <Switch>
          <Route exact path={PLAYER_PATH}>
            <RouteSync view="player" />
            <GameRecordTable />
          </Route>
          <Route exact path={["/", PATH]}>
            <RouteSync view="listing" />
            <FilterPanel />
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
