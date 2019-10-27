import React from "react";
import Loadable from "react-loadable";
import { Helmet } from "react-helmet";

import { useDataAdapter } from "./dataAdapterProvider";
import { PlayerMetadata } from "../../utils/dataSource";
import { useEffect } from "react";
import { triggerRelayout, formatPercent } from "../../utils/index";
import { LevelWithDelta } from "../../utils/dataTypes";
import { TITLE_PREFIX } from "../../utils/constants";
import Loading from "../misc/loading";
const RankRateChart = Loadable({
  loader: () => import("./charts/rankRate"),
  loading: () => <Loading />
});
const RecentRankChart = Loadable({
  loader: () => import("./charts/recentRank"),
  loading: () => <Loading />
});

export default function PlayerDetails() {
  const dataAdapter = useDataAdapter();
  const metadata = dataAdapter.getMetadata<PlayerMetadata>();
  useEffect(triggerRelayout, [!!metadata]);
  if (!metadata || !metadata.nickname) {
    return <Loading />;
  }
  return (
    <div>
      <Helmet>
        <title>
          {TITLE_PREFIX} - {metadata.nickname}
        </title>
      </Helmet>
      <h2 className="text-center">玩家：{metadata.nickname}</h2>
      <div className="row mt-4">
        <div className="col-md-8">
          <h3 className="text-center mb-4">最近走势</h3>
          <RecentRankChart dataAdapter={dataAdapter} playerId={metadata.id} aspect={6} />
          <h3 className="text-center mt-4 mb-4">相关数据</h3>
          <dl className="row">
            <dt className="col-4 col-md-2">记录场数</dt>
            <dd className="col-8 col-md-4">{metadata.count}</dd>
            <dt className="col-4 col-md-2">当前等级</dt>
            <dd className="col-8 col-md-4">{LevelWithDelta.format(metadata.level)}</dd>
            <dt className="col-4 col-md-2">平均顺位</dt>
            <dd className="col-8 col-md-4">{metadata.avg_rank.toFixed(3)}</dd>
            <dt className="col-4 col-md-2">被飞率</dt>
            <dd className="col-8 col-md-4">{formatPercent(metadata.negative_rate)}</dd>
          </dl>
        </div>
        <div className="col-md-4">
          <h3 className="text-center mb-4">累计战绩</h3>
          <RankRateChart metadata={metadata} />
        </div>
      </div>
    </div>
  );
}
