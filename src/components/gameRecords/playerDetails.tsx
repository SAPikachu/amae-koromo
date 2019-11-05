import React from "react";
import Loadable from "react-loadable";
import { Helmet } from "react-helmet";

import { useDataAdapter } from "./dataAdapterProvider";
import { useEffect, useState, useCallback } from "react";
import { triggerRelayout, formatPercent, useAsync } from "../../utils/index";
import { LevelWithDelta, PlayerExtendedStats, PlayerMetadata, GameMode } from "../../utils/dataTypes";
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
  }, [model, mode, customDateFrom, customDateTo, updateModel]);
  const setSelectedMode = useCallback(mode => updateModel({ type: "player", selectedMode: mode }), [updateModel]);
  return (
    <div className="row">
      <div className="col-6">
        <FormRow title="时间" inline={true}>
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
        <div className="col-6">
          <FormRow title="等级" inline={true}>
            <ModeSelector mode={model.selectedMode} onChange={setSelectedMode} />
          </FormRow>
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  description,
  className = "",
  children
}: {
  label: string;
  description?: string;
  className?: string;
  children: React.ReactChild;
}) {
  return (
    <>
      <dt className={`col-2 col-lg-1 text-nowrap ${className}`} title={description || ""}>
        {label}
      </dt>
      <dd className={`col-4 col-lg-3 text-right ${className}`}>{children}</dd>
    </>
  );
}

function PlayerExtendedStatsView({ maybeStats }: { maybeStats: PlayerExtendedStats | Promise<PlayerExtendedStats> }) {
  const stats = useAsync(maybeStats);
  useEffect(triggerRelayout, [!!stats]);
  if (!stats) {
    return null;
  }
  return (
    <>
      <StatItem label="和牌率" description="和牌局数 / 总局数">
        {formatPercent(stats.和牌率 || 0)}
      </StatItem>
      <StatItem label="放铳率" description="放铳局数 / 总局数">
        {formatPercent(stats.放铳率 || 0)}
      </StatItem>
      <StatItem label="自摸率" description="自摸局数 / 和牌局数">
        {formatPercent(stats.自摸率 || 0)}
      </StatItem>
      <StatItem label="默胡率" description="门清默听和牌局数 / 和牌局数">
        {formatPercent(stats.默听率 || 0)}
      </StatItem>
      <StatItem label="流局率" description="流局局数 / 总局数">
        {formatPercent(stats.流局率 || 0)}
      </StatItem>
      <StatItem label="流听率" description="流局听牌局数 / 流局局数">
        {formatPercent(stats.流听率 || 0)}
      </StatItem>
      <StatItem label="副露率" description="副露局数 / 总局数">
        {formatPercent(stats.副露率 || 0)}
      </StatItem>
      <StatItem label="立直率" description="立直局数 / 总局数">
        {formatPercent(stats.立直率 || 0)}
      </StatItem>
      <StatItem label="和了巡数">{(stats.和了巡数 || 0).toFixed(3)}</StatItem>
      <StatItem label="平均打点">{stats.平均打点 || 0}</StatItem>
      <StatItem label="平均铳点">{stats.平均铳点 || 0}</StatItem>
      <StatItem label="最大连庄">{stats.最大连庄 || 0}</StatItem>
    </>
  );
}

function EstimatedStableLevel({ metadata }: { metadata: PlayerMetadata }) {
  const [model] = useModel();
  const mode = model.selectedMode
    ? (parseInt(model.selectedMode) as GameMode)
    : LevelWithDelta.getTag(metadata.level) === "魂"
    ? GameMode.王座
    : GameMode.玉;
  const notEnoughData = metadata.count < 100;
  return (
    <>
      <StatItem
        label="安定段位"
        description={`在${GameMode[mode]}之间一直进行对局，预测最终能达到的段位`}
        className={notEnoughData ? "font-italic font-lighter text-muted" : ""}
      >
        <span title={notEnoughData ? "数据量不足，计算结果可能有较大偏差" : ""}>
          {PlayerMetadata.estimateStableLevel(metadata, mode)}
          {notEnoughData && "?"}
        </span>
      </StatItem>
      <StatItem
        label="每局期望"
        description={`在${GameMode[mode]}之间每局获得点数的数学期望值`}
        className={notEnoughData ? "font-italic font-lighter text-muted" : ""}
      >
        <span title={notEnoughData ? "数据量不足，计算结果可能有较大偏差" : ""}>
          {PlayerMetadata.calculateExpectedGamePoint(metadata, mode).toFixed(3)}
          {notEnoughData && "?"}
        </span>
      </StatItem>
    </>
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
            <StatItem label="记录场数">{metadata.count}</StatItem>
            <StatItem label="当前等级">{LevelWithDelta.getTag(metadata.level)}</StatItem>
            <StatItem label="当前分数">{LevelWithDelta.formatAdjustedScore(metadata.level)}</StatItem>
            {metadata.extended_stats && <PlayerExtendedStatsView maybeStats={metadata.extended_stats} />}
            <StatItem label="平均顺位">{metadata.avg_rank.toFixed(3)}</StatItem>
            <EstimatedStableLevel metadata={metadata} />
            <StatItem label="被飞率">{formatPercent(metadata.negative_rate)}</StatItem>
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
