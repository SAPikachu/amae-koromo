import React from "react";
import Loadable from "react-loadable";
import { Helmet } from "react-helmet";

import { useDataAdapter } from "./dataAdapterProvider";
import { PlayerMetadata } from "../../utils/dataSource";
import { useEffect, useState, useCallback } from "react";
import { triggerRelayout, formatPercent } from "../../utils/index";
import { LevelWithDelta } from "../../utils/dataTypes";
import { TITLE_PREFIX, DATE_MIN } from "../../utils/constants";
import Loading from "../misc/loading";
import { FormRow } from "../form/formRow";
import { useModel } from "./model";
import { CheckboxGroup, DatePicker } from "../form";
import dayjs from "dayjs";
import { ModeSelector } from "./modeSelector";
const RankRateChart = Loadable({
  loader: () => import("./charts/rankRate"),
  loading: () => <Loading />
});
const RecentRankChart = Loadable({
  loader: () => import("./charts/recentRank"),
  loading: () => <Loading />
});

enum DateRangeOptions {
  All = "全部",
  Last4Weeks = "最近四周",
  Custom = "自定义"
}
const DATE_RANGE_ITEMS = Object.keys(DateRangeOptions).map((key: string) => ({
  key: DateRangeOptions[key as keyof typeof DateRangeOptions],
  label: DateRangeOptions[key as keyof typeof DateRangeOptions]
}));

function PlayerDetailsSettings({ showLevel = false }) {
  const [model, updateModel] = useModel();
  const [mode, setMode] = useState(() => {
    if (model.type !== "player") {
      return DateRangeOptions.All;
    }
    if (!model.startDate) {
      return DateRangeOptions.All;
    }
    if (
      (!model.endDate || dayjs(model.endDate).isSame(dayjs(), "day")) &&
      dayjs(model.startDate).isSame(dayjs().subtract(27, "day"), "day")
    ) {
      return DateRangeOptions.Last4Weeks;
    }
    return DateRangeOptions.Custom;
  });
  const [customDateFrom, setCustomDateFrom] = useState(() =>
    model.type === "player" && model.startDate ? model.startDate : DATE_MIN
  );
  const [customDateTo, setCustomDateTo] = useState(() =>
    model.type === "player" && model.endDate ? model.endDate : dayjs()
  );
  useEffect(() => {
    if (model.type !== "player") {
      return;
    }
    switch (mode) {
      case DateRangeOptions.All:
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: null,
          endDate: null,
          selectedMode: undefined
        });
        break;
      case DateRangeOptions.Last4Weeks:
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: dayjs().subtract(27, "day"),
          endDate: null
        });
        break;
      case DateRangeOptions.Custom:
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: customDateFrom,
          endDate: customDateTo
        });
        break;
    }
  }, [model, mode, customDateFrom, customDateTo]);
  const setSelectedMode = useCallback(mode => updateModel({ type: "player", selectedMode: mode }), [updateModel]);
  return (
    <div className="row">
      <div className="col-md-6">
        <FormRow title="时间范围" inline={true}>
          <CheckboxGroup
            type="radio"
            selectedItemKey={mode}
            items={DATE_RANGE_ITEMS}
            groupKey="PlayerDetailsDateRangeSelector"
            onChange={setMode as (x: string) => void}
          />
          {mode === DateRangeOptions.Custom ? (
            <>
              <DatePicker min={DATE_MIN} onChange={setCustomDateFrom} date={customDateFrom} className="form-control" />
              <DatePicker min={DATE_MIN} onChange={setCustomDateTo} date={customDateTo} className="form-control" />
            </>
          ) : null}
        </FormRow>
      </div>
      {showLevel && (
        <div className="col-md-6">
          <FormRow title="等级" inline={true}>
            <ModeSelector mode={model.selectedMode} onChange={setSelectedMode} />
          </FormRow>
        </div>
      )}
    </div>
  );
}

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
      <PlayerDetailsSettings showLevel={true} />
    </div>
  );
}
