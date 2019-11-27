import React from "react";
import Loadable from "react-loadable";
import { Helmet } from "react-helmet";

import { useDataAdapter } from "../gameRecords/dataAdapterProvider";
import { useEffect, useState } from "react";
import { triggerRelayout, formatPercent, useAsync, sum } from "../../utils/index";
import { LevelWithDelta, PlayerExtendedStats, PlayerMetadata, GameRecord } from "../../data/types";
import Loading from "../misc/loading";
import PlayerDetailsSettings from "./playerDetailsSettings";
import StatItem from "./statItem";
import EstimatedStableLevel from "./estimatedStableLevel";
import clsx from "clsx";
import { Level } from "../../data/types/level";

const RankRateChart = Loadable({
  loader: () => import("./charts/rankRate"),
  loading: () => <Loading />
});
const RecentRankChart = Loadable({
  loader: () => import("./charts/recentRank"),
  loading: () => <Loading />
});
const ReactTooltipPromise = import("react-tooltip");
const ReactTooltip = Loadable({
  loader: () => ReactTooltipPromise,
  loading: () => null
});

function ExtendedStatsViewAsync({
  metadata,
  view
}: {
  metadata: PlayerMetadata;
  view: React.ComponentType<{ stats: PlayerExtendedStats; metadata: PlayerMetadata }>;
}) {
  const stats = useAsync(metadata.extended_stats);
  useEffect(triggerRelayout, [!!stats]);
  if (!stats) {
    return null;
  }
  const View = view;
  return <View stats={stats} metadata={metadata} />;
}

function PlayerExtendedStatsView({ stats }: { stats: PlayerExtendedStats }) {
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
    </>
  );
}

function fixMaxLevel(level: LevelWithDelta): LevelWithDelta {
  const levelObj = new Level(level.id);
  if (level.score + level.delta < levelObj.getStartingPoint()) {
    return {
      id: level.id,
      score: levelObj.getStartingPoint(),
      delta: 0
    };
  }
  return level;
}

function MoreStats({ stats, metadata }: { stats: PlayerExtendedStats; metadata: PlayerMetadata }) {
  return (
    <>
      <StatItem label="最高等级">{LevelWithDelta.getTag(metadata.max_level)}</StatItem>
      <StatItem label="最高分数">{LevelWithDelta.formatAdjustedScore(fixMaxLevel(metadata.max_level))}</StatItem>
      <StatItem label="最大连庄">{stats.最大连庄 || 0}</StatItem>
      <StatItem label="一发率" description="一发局数 / 立直和了局数">
        {formatPercent(stats.一发率 || 0)}
      </StatItem>
      <StatItem label="里宝率" description="中里宝局数 / 立直和了局数">
        {formatPercent(stats.里宝率 || 0)}
      </StatItem>
      <StatItem label="被炸率" description="被炸庄（满贯或以上）次数 / 被自摸次数">
        {formatPercent(stats.被炸率 || 0)}
      </StatItem>
      <StatItem label="平均被炸点数" description="被炸庄（满贯或以上）点数 / 次数">
        {stats.平均被炸点数 || 0}
      </StatItem>
      <StatItem label="放铳时立直率" description="放铳时立直次数 / 放铳次数">
        {formatPercent(stats.放铳时立直率 || 0)}
      </StatItem>
      <StatItem label="放铳时副露率" description="放铳时副露次数 / 放铳次数">
        {formatPercent(stats.放铳时副露率 || 0)}
      </StatItem>
      <StatItem label="立直后放铳率" description="放铳时立直次数 / 立直次数">
        {formatPercent(stats.立直后放铳率 || 0)}
      </StatItem>
      <StatItem label="副露后放铳率" description="放铳时副露次数 / 副露次数">
        {formatPercent(stats.副露后放铳率 || 0)}
      </StatItem>
      <StatItem label="立直后和牌率" description="立直后和牌次数 / 立直次数">
        {formatPercent(stats.立直后和牌率 || 0)}
      </StatItem>
      <StatItem label="副露后和牌率" description="副露后和牌次数 / 副露次数">
        {formatPercent(stats.副露后和牌率 || 0)}
      </StatItem>
      <StatItem label="立直后流局率" description="立直后流局次数 / 立直次数">
        {formatPercent(stats.立直后流局率 || 0)}
      </StatItem>
      <StatItem label="副露后流局率" description="副露后流局次数 / 副露次数">
        {formatPercent(stats.副露后流局率 || 0)}
      </StatItem>
    </>
  );
}
function BasicStats({ metadata }: { metadata: PlayerMetadata }) {
  return (
    <>
      <StatItem label="记录场数">{metadata.count}</StatItem>
      <StatItem label="记录等级">{LevelWithDelta.getTag(metadata.level)}</StatItem>
      <StatItem label="记录分数">{LevelWithDelta.formatAdjustedScore(metadata.level)}</StatItem>
      <ExtendedStatsViewAsync metadata={metadata} view={PlayerExtendedStatsView} />
      <StatItem label="平均顺位">{metadata.avg_rank.toFixed(3)}</StatItem>
      <StatItem label="被飞率">{formatPercent(metadata.negative_rate)}</StatItem>
      <EstimatedStableLevel metadata={metadata} />
    </>
  );
}
function LuckStats({ stats }: { stats: PlayerExtendedStats }) {
  return (
    <>
      <StatItem label="役满" description="和出役满次数">
        {stats.役满 || 0}
      </StatItem>
      <StatItem label="累计役满" description="和出累计役满次数">
        {stats.累计役满 || 0}
      </StatItem>
      <StatItem label="最大累计番数" description="和出的最大番数（不含役满役）">
        {stats.最大累计番数 || 0}
      </StatItem>
      <StatItem label="流满" description="流满次数">
        {stats.流满 || 0}
      </StatItem>
      <StatItem label="两立直" description="两立直次数">
        {stats.W立直 || 0}
      </StatItem>
    </>
  );
}
function formatFanSummary(count: number, 役满: number): string {
  if (役满) {
    if (役满 === 1) {
      return "役满";
    }
    return `${役满} 倍役满`;
  }
  let result = `${count} 番`;
  if (count >= 13) {
    result += " - 累计役满";
  } else if (count >= 11) {
    result += " - 三倍满";
  } else if (count >= 8) {
    result += " - 倍满";
  } else if (count >= 6) {
    result += " - 跳满";
  } else if (count === 5) {
    result += " - 满贯";
  }
  return result;
}
function formatFan(count: number, 役满: number): string {
  if (役满) {
    if (役满 === 1) {
      return "役满";
    }
    return `${役满} 倍役满`;
  }
  return `${count} 番`;
}
function LargestLost({ stats, metadata }: { stats: PlayerExtendedStats; metadata: PlayerMetadata }) {
  if (!stats.最近大铳) {
    return <p className="text-center">无满贯或以上大铳</p>;
  }
  return (
    <div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex justify-content-between font-weight-bold"
        href={GameRecord.getRecordLink(stats.最近大铳.id, metadata.id)}
      >
        <span>
          {formatFanSummary(sum(stats.最近大铳.fans.map(x => x.count)), sum(stats.最近大铳.fans.map(x => x.役满)))}
        </span>
        <span>{GameRecord.formatFullStartTime(stats.最近大铳.start_time)}</span>
      </a>
      <dl className="row mt-2">
        {stats.最近大铳.fans.map(x => (
          <StatItem key={x.label} label={x.label}>
            {formatFan(x.count, x.役满)}
          </StatItem>
        ))}
      </dl>
    </div>
  );
}
function PlayerStats({ metadata }: { metadata: PlayerMetadata }) {
  const [page, setPage] = useState(0);
  useEffect(() => {
    ReactTooltipPromise.then(x => x.rebuild());
  }, [page]);
  return (
    <>
      <nav className="nav nav-pills mb-3 mt-3">
        <button onClick={() => setPage(0)} className={clsx("nav-link", page === 0 && "active")}>
          基本数据
        </button>
        <button onClick={() => setPage(1)} className={clsx("nav-link", page === 1 && "active")}>
          更多数据
        </button>
        <button onClick={() => setPage(2)} className={clsx("nav-link", page === 2 && "active")}>
          血统
        </button>
        <button onClick={() => setPage(3)} className={clsx("nav-link", page === 3 && "active")}>
          最近大铳
        </button>
      </nav>
      <dl className="row font-xs-adjust">
        {page === 0 && <BasicStats metadata={metadata} />}
        {page === 1 && <ExtendedStatsViewAsync metadata={metadata} view={MoreStats} />}
        {page === 2 && <ExtendedStatsViewAsync metadata={metadata} view={LuckStats} />}
      </dl>
      {page === 3 && <ExtendedStatsViewAsync metadata={metadata} view={LargestLost} />}
    </>
  );
}

export default function PlayerDetails() {
  const dataAdapter = useDataAdapter();
  const metadata = dataAdapter.getMetadata<PlayerMetadata>();
  useEffect(() => {
    ReactTooltipPromise.then(x => x.rebuild());
  });
  useEffect(triggerRelayout, [!!metadata]);
  if (!metadata || !metadata.nickname) {
    return <Loading />;
  }
  return (
    <div>
      <Helmet>
        <title>{metadata.nickname}</title>
      </Helmet>
      <h2 className="text-center">玩家：{metadata.nickname}</h2>
      <div className="row mt-4">
        <div className="col-md-8">
          <h3 className="text-center mb-4">最近走势</h3>
          <RecentRankChart dataAdapter={dataAdapter} playerId={metadata.id} aspect={6} />
          <PlayerStats metadata={metadata} />
        </div>
        <div className="col-md-4">
          <h3 className="text-center mb-4">累计战绩</h3>
          <RankRateChart metadata={metadata} />
        </div>
      </div>
      <PlayerDetailsSettings showLevel={true} />
      <ReactTooltip effect="solid" multiline={true} place="top" />
    </div>
  );
}
