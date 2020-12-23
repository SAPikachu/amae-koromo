import React, { useState } from "react";

import { Switch, Route, Redirect, generatePath as genPath } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Model, useModel } from "./model";
import dayjs from "dayjs";
import { RouteSync } from "./routeSync";
import { FilterPanel } from "./filterPanel";
import Loadable from "../misc/customizedLoadable";
import Loading from "../misc/loading";
import { PlayerSearch } from "./playerSearch";
import { COLUMN_RANK } from "./table";
import {
  default as GameRecordTable,
  COLUMN_GAMEMODE,
  COLUMN_PLAYERS,
  COLUMN_STARTTIME,
  COLUMN_ENDTIME,
  COLUMN_FULLTIME,
} from "./table";
import { PageCategory } from "../misc/tracker";
import { FormRow } from "../form";
const PlayerDetails = Loadable({
  loader: () => import("../playerDetails/playerDetails"),
  loading: () => <Loading />,
});

const PLAYER_PATH =
  "/player/:id/:mode([0-9.]+)?/:search(-[^/]+)?/:startDate(\\d{4}-\\d{2}-\\d{2})?/:endDate(\\d{4}-\\d{2}-\\d{2})?";
const PATH = "/:date(\\d{4}-\\d{2}-\\d{2})/:mode([0-9]+)?/:search?";

function dateToStringSafe(value: dayjs.ConfigType | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const dateObj = dayjs(value);
  if (!dateObj.isValid() || dateObj.year() < 2019 || dateObj.year() > 9999) {
    return undefined;
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
    if (model.rank) {
      result += `?rank=${model.rank}`;
    }
    return result;
  }
  if (!model.selectedMode && !model.searchText && !model.date) {
    return "/";
  }
  const dateString = dateToStringSafe(model.date || new Date());
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
  });
}

function GameRecordTablePlayerView() {
  const [model] = useModel();
  if (!("playerId" in model)) {
    return null;
  }
  return (
    <GameRecordTable
      withActivePlayer
      columns={[COLUMN_GAMEMODE, COLUMN_RANK(model.playerId), COLUMN_PLAYERS(model.playerId), COLUMN_FULLTIME]}
    />
  );
}

function Routes() {
  const { t } = useTranslation("formRow");
  const [searchText, setSearchText] = useState("");
  return (
    <Switch>
      <Route path={PLAYER_PATH}>
        <RouteSync view="player" />
        <PageCategory category="Player" />
        <PlayerDetails />
        <GameRecordTablePlayerView />
      </Route>
      <Route exact path={["/", PATH]}>
        <RouteSync view="listing" />
        <PageCategory category="Listing" />
        <h2 className="text-center mb-3">{t("查找玩家")}</h2>
        <div className="home-header mb-5">
          <FormRow title="名字">
            <input
              type="text"
              className="form-control"
              value={searchText}
              onChange={(e) => setSearchText(e.currentTarget.value)}
            />
          </FormRow>
          <PlayerSearch searchText={searchText} />
        </div>
        <h2 className="text-center mb-3">{t("对局浏览")}</h2>
        <div className="home-header">
          <FilterPanel />
        </div>
        <GameRecordTable columns={[COLUMN_GAMEMODE, COLUMN_PLAYERS(""), COLUMN_STARTTIME, COLUMN_ENDTIME]} />
      </Route>
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
export default Routes;
