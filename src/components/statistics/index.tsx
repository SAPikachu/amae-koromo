import React from "react";

import { ModelModeProvider } from "../modeModel";
import { ViewRoutes, SimpleRoutedSubViews, NavButtons, RouteDef } from "../routing";
import { ViewSwitch } from "../routing/index";

import RankBySeats from "./rankBySeats";
import DataByRank from "./dataByRank";
import FanStats from "./fanStats";
import Conf from "../../utils/conf";

const ROUTES = (
  <ViewRoutes>
    <RouteDef path="rank-by-seat" title="坐席顺位" disabled={!Conf.features.statisticsSubPages.rankBySeat}>
      <RankBySeats />
    </RouteDef>
    <RouteDef path="data-by-rank" title="等级数据" disabled={!Conf.features.statisticsSubPages.dataByRank}>
      <DataByRank />
    </RouteDef>
    <RouteDef path="fan-stats" title="和出役种统计" disabled={!Conf.features.statisticsSubPages.fanStats}>
      <FanStats />
    </RouteDef>
  </ViewRoutes>
);

export default function Routes() {
  return (
    <SimpleRoutedSubViews>
      {ROUTES}
      <ModelModeProvider>
        <NavButtons />
        <ViewSwitch />
      </ModelModeProvider>
    </SimpleRoutedSubViews>
  );
}
