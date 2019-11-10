import React from "react";

import { Alert } from "../misc/alert";
import { Switch, Route, Redirect, useRouteMatch } from "react-router";
import DeltaRanking from "./deltaRanking";
import { CareerRanking, CareerRankingColumn } from "./careerRanking";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import ModelModeSelector from "./modelModeSelector";
import { ModelProvider } from "./model";
import { CareerRankingType } from "../../data/types";
import { PlayerMetadata } from "../../data/types/metadata";

export default function Routes() {
  const match = useRouteMatch() || { path: "" };
  return (
    <ModelProvider>
      <Alert stateName="rankingNotice">
        <h4 className="mb-2">提示</h4>
        排行榜非实时更新，可能会有数小时的延迟
      </Alert>
      <nav className="nav nav-pills mb-3">
        <NavLink to={`${match.path}/delta`} className="nav-link" activeClassName="active">
          苦主与汪汪
        </NavLink>
        <NavLink to={`${match.path}/career1`} className="nav-link" activeClassName="active">
          一位率/四位率
        </NavLink>
        <NavLink to={`${match.path}/career2`} className="nav-link" activeClassName="active">
          连对率/安定段位
        </NavLink>
      </nav>
      <div className="row mb-3">
        <div className="col">
          <ModelModeSelector />
        </div>
      </div>
      <Switch>
        <Route path={`${match.path}/delta`}>
          <Helmet>
            <title>苦主及汪汪</title>
          </Helmet>
          <DeltaRanking />
        </Route>
        <Route path={`${match.path}/career1`}>
          <Helmet>
            <title>一位率/四位率</title>
          </Helmet>
          <CareerRanking>
            <CareerRankingColumn type={CareerRankingType.Rank1} title="一位率" />
            <CareerRankingColumn type={CareerRankingType.Rank4} title="四位率" />
          </CareerRanking>
        </Route>
        <Route path={`${match.path}/career2`}>
          <Helmet>
            <title>连对率/安定段位</title>
          </Helmet>
          <CareerRanking>
            <CareerRankingColumn type={CareerRankingType.Rank12} title="连对率" />
            <CareerRankingColumn
              type={CareerRankingType.StableLevel}
              title="安定段位"
              formatter={PlayerMetadata.formatStableLevel2}
            />
          </CareerRanking>
        </Route>
        <Route>
          <Redirect to={`${match.path}/delta`} />
        </Route>
      </Switch>
    </ModelProvider>
  );
}
