import React from "react";
import Loadable from "../misc/customizedLoadable";
import { Helmet } from "react-helmet";

import { useDataAdapter } from "../gameRecords/dataAdapterProvider";
import { useEffect } from "react";
import { triggerRelayout, formatPercent, useAsync, formatFixed3 } from "../../utils/index";
import {
  LevelWithDelta,
  PlayerExtendedStats,
  PlayerMetadata,
  GameRecord,
  FanStatEntry2,
  FanStatEntryList,
} from "../../data/types";
import Loading from "../misc/loading";
import PlayerDetailsSettings from "./playerDetailsSettings";
import StatItem from "./statItem";
import EstimatedStableLevel from "./estimatedStableLevel";
import { Level } from "../../data/types/level";
import { ViewRoutes, RouteDef, SimpleRoutedSubViews, NavButtons, ViewSwitch } from "../routing";
import { useLocation } from "react-router-dom";
import SameMatchRate from "./sameMatchRate";
import { useTranslation } from "react-i18next";

const RankRateChart = Loadable({
  loader: () => import("./charts/rankRate"),
  loading: () => <Loading />,
});
const RecentRankChart = Loadable({
  loader: () => import("./charts/recentRank"),
  loading: () => <Loading />,
});
const WinLoseDistribution = Loadable({
  loader: () => import("./charts/winLoseDistribution"),
  loading: () => <Loading />,
});
const ReactTooltipPromise = import("react-tooltip");
const ReactTooltip = Loadable({
  loader: () => ReactTooltipPromise,
  loading: () => null,
});

function ExtendedStatsViewAsync({
  metadata,
  view,
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
      delta: 0,
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
      <StatItem label="副露后放铳率" description="放铳时副露次数 / 副露次数">
        {formatPercent(stats.副露后放铳率 || 0)}
      </StatItem>
      <StatItem label="副露后和牌率" description="副露后和牌次数 / 副露次数">
        {formatPercent(stats.副露后和牌率 || 0)}
      </StatItem>
      <StatItem label="副露后流局率" description="副露后流局次数 / 副露次数">
        {formatPercent(stats.副露后流局率 || 0)}
      </StatItem>
    </>
  );
}
function RiichiStats({ stats }: { stats: PlayerExtendedStats; metadata: PlayerMetadata }) {
  return (
    <>
      <StatItem label="立直率" description="立直局数 / 总局数">
        {formatPercent(stats.立直率 || 0)}
      </StatItem>
      <StatItem label="立直和了" description="立直和了局数 / 立直局数">
        {formatPercent(stats.立直后和牌率 || 0)}
      </StatItem>
      <StatItem label="立直放铳" description="立直放铳局数 / 立直局数">
        {formatPercent(stats.立直后放铳率 || 0)}
      </StatItem>
      <StatItem label="立直收支" description="立直总收支（含供托） / 立直局数">
        {stats.立直收支 || 0}
      </StatItem>
      <StatItem label="立直收入" description="立直和了收入（含供托） / 立直和了局数">
        {stats.立直收入 || 0}
      </StatItem>
      <StatItem label="立直支出" description="立直放铳支出（含立直棒） / 立直放铳局数">
        {stats.立直支出 || 0}
      </StatItem>
      <StatItem label="先制率" description="先制立直局数 / 立直局数">
        {formatPercent(stats.先制率 || 0)}
      </StatItem>
      <StatItem label="追立率" description="追立局数 / 立直局数">
        {formatPercent(stats.追立率 || 0)}
      </StatItem>
      <StatItem label="被追率" description="被追立局数 / 立直局数">
        {formatPercent(stats.被追率 || 0)}
      </StatItem>
      <StatItem label="立直巡目">{formatFixed3(stats.立直巡目 || 0)}</StatItem>
      <StatItem label="立直流局" description="立直流局局数 / 立直局数">
        {formatPercent(stats.立直后流局率 || 0)}
      </StatItem>
      <StatItem label="一发率" description="一发局数 / 立直和了局数">
        {formatPercent(stats.一发率 || 0)}
      </StatItem>
      <StatItem label="振听率" description="振听立直局数（不含立直见逃） / 立直局数">
        {formatPercent(stats.振听立直率 || 0)}
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
      <StatItem label="平均起手向听">{formatFixed3(stats.平均起手向听)}</StatItem>
    </>
  );
}
function LargestLost({ stats, metadata }: { stats: PlayerExtendedStats; metadata: PlayerMetadata }) {
  const { t } = useTranslation();
  if (!stats.最近大铳) {
    return <p className="text-center">{t("无满贯或以上大铳")}</p>;
  }
  return (
    <div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex justify-content-between font-weight-bold"
        href={GameRecord.getRecordLink(stats.最近大铳.id, metadata.id)}
      >
        <span>{FanStatEntryList.formatFanSummary(stats.最近大铳.fans)}</span>
        <span>{GameRecord.formatFullStartTime(stats.最近大铳.start_time)}</span>
      </a>
      <dl className="row mt-2">
        {stats.最近大铳.fans.map((x) => (
          <StatItem key={x.label} label={x.label}>
            {FanStatEntry2.formatFan(x)}
          </StatItem>
        ))}
      </dl>
    </div>
  );
}
function PlayerStats({ metadata }: { metadata: PlayerMetadata }) {
  const loc = useLocation();
  useEffect(() => {
    ReactTooltipPromise.then((x) => x.rebuild());
  }, [loc.pathname]);
  return (
    <SimpleRoutedSubViews>
      <ViewRoutes>
        <RouteDef path="" exact title="基本">
          <dl className="row">
            <BasicStats metadata={metadata} />
          </dl>
        </RouteDef>
        <RouteDef path="riichi" title="立直">
          <dl className="row">
            <ExtendedStatsViewAsync metadata={metadata} view={RiichiStats} />
          </dl>
        </RouteDef>
        <RouteDef path="extended" title="更多">
          <dl className="row">
            <ExtendedStatsViewAsync metadata={metadata} view={MoreStats} />
          </dl>
        </RouteDef>
        <RouteDef path="win-lose" title="和铳分布">
          <ExtendedStatsViewAsync metadata={metadata} view={WinLoseDistribution} />
        </RouteDef>
        <RouteDef path="luck" title="血统">
          <dl className="row">
            <ExtendedStatsViewAsync metadata={metadata} view={LuckStats} />
          </dl>
        </RouteDef>
        <RouteDef path="largest-lost" title="最近大铳">
          <ExtendedStatsViewAsync metadata={metadata} view={LargestLost} />
        </RouteDef>
        <RouteDef path="same-match" title="最常同桌">
          <SameMatchRate currentAccountId={metadata.id} />
        </RouteDef>
      </ViewRoutes>
      <NavButtons className="mt-3" replace keepState />
      <ViewSwitch mutateTitle={false} />
    </SimpleRoutedSubViews>
  );
}

function getTooltip(dataTip: string): React.ReactNode {
  if (dataTip && dataTip.indexOf && dataTip.indexOf("##") === 0) {
    return document.getElementById(dataTip.slice(2))?.innerHTML || dataTip;
  }
  return dataTip;
}

export default function PlayerDetails() {
  const { t } = useTranslation();
  const dataAdapter = useDataAdapter();
  const metadata = dataAdapter.getMetadata<PlayerMetadata>();
  useEffect(() => {
    ReactTooltipPromise.then((x) => x.rebuild());
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
      <h2 className="text-center">
        {t("玩家：")}
        {metadata.nickname}
      </h2>
      <div className="row mt-4">
        <div className="col-md-8">
          <h3 className="text-center mb-4">{t("最近走势")}</h3>
          <RecentRankChart dataAdapter={dataAdapter} playerId={metadata.id} aspect={6} />
          <PlayerStats metadata={metadata} />
        </div>
        <div className="col-md-4">
          <h3 className="text-center mb-4">{t("累计战绩")}</h3>
          <RankRateChart metadata={metadata} />
        </div>
      </div>
      <PlayerDetailsSettings showLevel={true} />
      <ReactTooltip effect="solid" multiline={true} place="top" getContent={getTooltip} className="stat-tooltip" />
    </div>
  );
}
