import React, { useMemo, useState } from "react";
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
  getAccountZoneTag,
} from "../../data/types";
import Loading from "../misc/loading";
import PlayerDetailsSettings from "./playerDetailsSettings";
import StatItem, { StatList } from "./statItem";
import EstimatedStableLevel from "./estimatedStableLevel";
import { Level } from "../../data/types/level";
import { ViewRoutes, RouteDef, SimpleRoutedSubViews, NavButtons, ViewSwitch } from "../routing";
import SameMatchRate from "./sameMatchRate";
import { useTranslation } from "react-i18next";
import { useModel } from "../gameRecords/model";
import Conf from "../../utils/conf";
import { GameMode } from "../../data/types/gameMode";
import { loadPlayerPreference } from "../../utils/preference";
import { Box, Grid, Link, Typography } from "@mui/material";

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
      <StatItem label="最高等级">
        {LevelWithDelta.getTag(metadata.cross_stats?.max_level || metadata.max_level)}
      </StatItem>
      <StatItem label="最高分数">
        {LevelWithDelta.formatAdjustedScore(fixMaxLevel(metadata.cross_stats?.max_level || metadata.max_level))}
      </StatItem>
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
      <StatItem label="总计局数">{stats.count}</StatItem>
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
      <StatItem label="立直放铳" description="立直放铳局数（含立直瞬间 / 不含立直瞬间） / 立直局数">
        <>
          {formatPercent(stats.立直后放铳率 || 0)}
          <br />
          {formatPercent(stats.立直后非瞬间放铳率 || 0)}
        </>
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
      {(stats.立直好型 || stats.立直好型 === 0) && (
        <StatItem
          label="立直好型"
          description={
            "好型立直局数 / 立直局数\n听牌两种或以上即视为好型，不论残枚数\n（数据从 2021/9/10 前后开始收集）"
          }
        >
          {formatPercent(stats.立直好型 || 0)}
        </StatItem>
      )}
    </>
  );
}
function BasicStats({ metadata }: { metadata: PlayerMetadata }) {
  return (
    <>
      <StatItem label="记录场数">{metadata.count}</StatItem>
      <StatItem label="记录等级">{LevelWithDelta.getTag(metadata.cross_stats?.level || metadata.level)}</StatItem>
      <StatItem label="记录分数">
        {LevelWithDelta.formatAdjustedScore(metadata.cross_stats?.level || metadata.level)}
      </StatItem>
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
    return <Typography textAlign="center">{t("无超过满贯大铳")}</Typography>;
  }
  return (
    <Box>
      <Link
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
        }}
        href={GameRecord.getRecordLink(stats.最近大铳.id, metadata.id)}
      >
        <Box>{FanStatEntryList.formatFanSummary(stats.最近大铳.fans)}</Box>
        <Box>{GameRecord.formatFullStartTime(stats.最近大铳.start_time)}</Box>
      </Link>
      <StatList mt={2}>
        {stats.最近大铳.fans.map((x) => (
          <StatItem key={x.label} label={x.label}>
            {FanStatEntry2.formatFan(x)}
          </StatItem>
        ))}
      </StatList>
    </Box>
  );
}
function PlayerStats({ metadata, isChangingSettings }: { metadata: PlayerMetadata; isChangingSettings: boolean }) {
  return (
    <SimpleRoutedSubViews>
      <ViewRoutes>
        <RouteDef path="" exact title="基本">
          <StatList>
            <BasicStats metadata={metadata} />
          </StatList>
        </RouteDef>
        <RouteDef path="riichi" title="立直">
          <StatList>
            <ExtendedStatsViewAsync metadata={metadata} view={RiichiStats} />
          </StatList>
        </RouteDef>
        <RouteDef path="extended" title="更多">
          <StatList>
            <ExtendedStatsViewAsync metadata={metadata} view={MoreStats} />
          </StatList>
        </RouteDef>
        <RouteDef path="win-lose" title="和铳分布">
          <ExtendedStatsViewAsync metadata={metadata} view={WinLoseDistribution} />
        </RouteDef>
        <RouteDef path="luck" title="血统">
          <StatList>
            <ExtendedStatsViewAsync metadata={metadata} view={LuckStats} />
          </StatList>
        </RouteDef>
        <RouteDef path="largest-lost" title="最近大铳">
          <ExtendedStatsViewAsync metadata={metadata} view={LargestLost} />
        </RouteDef>
        <RouteDef path="same-match" title="最常同桌">
          {!isChangingSettings ? <SameMatchRate currentAccountId={metadata.id} /> : <></>}
        </RouteDef>
      </ViewRoutes>
      <NavButtons sx={{ mt: 3 }} replace keepState withQueryString />
      <ViewSwitch mutateTitle={false} />
    </SimpleRoutedSubViews>
  );
}

export default function PlayerDetails() {
  const { t } = useTranslation();
  const latestDataAdapter = useDataAdapter();
  const [dataAdapter, setDataAdapter] = useState(latestDataAdapter);
  useEffect(() => {
    if (latestDataAdapter === dataAdapter) {
      return;
    }
    latestDataAdapter.getCount();
    const metadata = latestDataAdapter.getMetadata<PlayerMetadata>();
    if (!metadata) {
      return;
    }
    if (dataAdapter.getMetadata()?.count === 0) {
      setDataAdapter(latestDataAdapter);
      return;
    }
    if (!latestDataAdapter.isItemLoaded(0)) {
      latestDataAdapter.getItem(0);
      return;
    }
    if (metadata.extended_stats instanceof Promise) {
      let changed = false;
      metadata.extended_stats.then(() => {
        if (changed) {
          return;
        } else {
          setDataAdapter(latestDataAdapter);
        }
      });
      return () => {
        changed = true;
      };
    }
    setDataAdapter(latestDataAdapter);
  }, [latestDataAdapter, dataAdapter]);
  const metadata = dataAdapter.getMetadata<PlayerMetadata>();
  const [model, updateModel] = useModel();
  const availableModes = useMemo(
    () =>
      latestDataAdapter.getMetadata<PlayerMetadata>()?.cross_stats?.played_modes ||
      metadata?.cross_stats?.played_modes ||
      [],
    [metadata, latestDataAdapter]
  );
  useEffect(() => {
    if (model.type !== "player" || Conf.availableModes.length < 2) {
      return;
    }
    if (!model.selectedModes.length && !model.startDate && !model.endDate) {
      const savedMode = loadPlayerPreference<GameMode[]>("modePreference", model.playerId, []);
      if (savedMode && savedMode.length) {
        updateModel({ type: "player", playerId: model.playerId, selectedModes: savedMode });
        return;
      }
    }
    if (availableModes.length) {
      const newSelectedModes = model.selectedModes.filter((x) => availableModes.includes(x));
      if (!newSelectedModes.length) {
        newSelectedModes.push(Conf.modePreference.find((x) => availableModes.includes(x)) || availableModes[0]);
      }
      if (
        newSelectedModes.length !== model.selectedModes.length ||
        newSelectedModes.some((x) => !model.selectedModes.includes(x))
      ) {
        updateModel({ type: "player", playerId: model.playerId, selectedModes: newSelectedModes });
      }
    }
  }, [availableModes, model, updateModel]);
  useEffect(triggerRelayout, [!!metadata]);
  const hasMetadata = metadata && metadata.nickname && metadata.count;
  const isChangingSettings = !!(
    hasMetadata &&
    latestDataAdapter !== dataAdapter &&
    metadata !== latestDataAdapter.getMetadata()
  );
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  return (
    <Box mb={3} position="relative">
      {isChangingSettings && (
        <Box position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -50%)" }}>
          <Loading />
        </Box>
      )}
      {hasMetadata ? (
        <Box sx={isChangingSettings ? { opacity: 0.2, pointerEvents: "none" } : {}}>
          <Helmet>
            <title>{metadata?.nickname}</title>
          </Helmet>
          <Typography variant="h4" textAlign="center">
            {getAccountZoneTag(metadata!.id)} {metadata?.nickname}
          </Typography>
          <Grid container mt={2} rowSpacing={2} spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" mb={2} textAlign="center">
                {t("最近走势")}
              </Typography>
              <RecentRankChart dataAdapter={dataAdapter} playerId={metadata!.id} aspect={6} />
              <PlayerStats metadata={metadata!} isChangingSettings={isChangingSettings} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" textAlign="center">
                {t("累计战绩")}
              </Typography>
              <Box maxWidth={480} margin="auto">
                <RankRateChart metadata={metadata!} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Loading />
      )}
      <PlayerDetailsSettings showLevel={true} availableModes={availableModes} />
    </Box>
  );
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}
