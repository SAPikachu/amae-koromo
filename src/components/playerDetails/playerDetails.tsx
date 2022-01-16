import React, { ReactNode, useMemo, useState } from "react";
import Loadable from "../misc/customizedLoadable";
import { Helmet } from "react-helmet";

import { useDataAdapter } from "../gameRecords/dataAdapterProvider";
import { useEffect } from "react";
import { triggerRelayout, formatPercent, useAsync, formatFixed3, formatRound, formatIdentity } from "../../utils/index";
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
import { Trans, useTranslation } from "react-i18next";
import { Model, useModel } from "../gameRecords/model";
import Conf from "../../utils/conf";
import { GameMode } from "../../data/types/gameMode";
import { loadPlayerPreference } from "../../utils/preference";
import { Box, BoxProps, Grid, Link, Typography } from "@mui/material";
import { StatHistogram } from "./histogram";

const RankRateChart = Loadable({
  loader: () => import("./charts/rankRate"),
});
const RecentRankChart = Loadable({
  loader: () => import("./charts/recentRank"),
});
const WinLoseDistribution = Loadable({
  loader: () => import("./charts/winLoseDistribution"),
});

function GenericStat({
  stats,
  statKey,
  description,
  formatter,
  formatterHistogram,
  label,
  defaultValue = 0,
}: {
  stats: PlayerExtendedStats;
  statKey: keyof PlayerExtendedStats;
  description?: ReactNode;
  formatter: (value: number) => string;
  formatterHistogram?: (value: number) => string;
  label?: string;
  defaultValue?: number | string;
}) {
  const value = stats[statKey] ?? defaultValue;
  if (typeof value !== "number" && value !== defaultValue) {
    throw new Error(`${statKey} is not a number`);
  }
  return (
    <StatItem
      description={description}
      label={label || statKey}
      extraTip={
        stats.count > 100 ? (
          <StatHistogram
            statKey={statKey}
            value={typeof value === "number" ? value : undefined}
            valueFormatter={formatterHistogram || formatter}
          />
        ) : null
      }
    >
      {typeof value === "string" ? value : formatter(value)}
    </StatItem>
  );
}

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
      <GenericStat stats={stats} formatter={formatPercent} statKey="和牌率" description="和牌局数 / 总局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="放铳率" description="放铳局数 / 总局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="自摸率" description="自摸局数 / 和牌局数" />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="默听率"
        label="默胡率"
        description="门清默听和牌局数 / 和牌局数"
      />
      <GenericStat stats={stats} formatter={formatPercent} statKey="流局率" description="流局局数 / 总局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="流听率" description="流局听牌局数 / 流局局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="副露率" description="副露局数 / 总局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="立直率" description="立直局数 / 总局数" />
      <GenericStat stats={stats} formatter={formatFixed3} statKey="和了巡数" />
      <GenericStat stats={stats} formatter={formatRound} statKey="平均打点" />
      <GenericStat stats={stats} formatter={formatRound} statKey="平均铳点" />
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
  const { t } = useTranslation();
  return (
    <>
      <StatItem label="最高等级">
        {LevelWithDelta.getTag(metadata.cross_stats?.max_level || metadata.max_level)}
      </StatItem>
      <StatItem label="最高分数">
        {LevelWithDelta.formatAdjustedScore(fixMaxLevel(metadata.cross_stats?.max_level || metadata.max_level))}
      </StatItem>
      <GenericStat stats={stats} formatter={formatIdentity} formatterHistogram={formatFixed3} statKey="最大连庄" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="里宝率" description="中里宝局数 / 立直和了局数" />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="被炸率"
        description="被炸庄（满贯或以上）次数 / 被自摸次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        statKey="平均被炸点数"
        description="被炸庄（满贯或以上）点数 / 次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="放铳时立直率"
        description="放铳时立直次数 / 放铳次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="放铳时副露率"
        description="放铳时副露次数 / 放铳次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="副露后放铳率"
        description="放铳时副露次数 / 副露次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="副露后和牌率"
        description="副露后和牌次数 / 副露次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="副露后流局率"
        description="副露后流局次数 / 副露次数"
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        defaultValue=""
        statKey="打点效率"
        description={`${t("和牌率")} * ${t("平均打点")}`}
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        defaultValue=""
        statKey="铳点损失"
        description={`${t("放铳率")} * ${t("平均铳点")}`}
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        defaultValue=""
        statKey="净打点效率"
        description={`${t("和牌率")} * ${t("平均打点")} - ${t("放铳率")} * ${t("平均铳点")}`}
      />
      <StatItem label="总计局数">{stats.count}</StatItem>
    </>
  );
}
function RiichiStats({ stats }: { stats: PlayerExtendedStats; metadata: PlayerMetadata }) {
  return (
    <>
      <GenericStat stats={stats} formatter={formatPercent} statKey="立直率" description="立直局数 / 总局数" />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        statKey="立直后和牌率"
        label="立直和了"
        description="立直和了局数 / 立直局数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        label="立直放铳A"
        statKey="立直后放铳率"
        description="立直放铳局数（含立直瞬间） / 立直局数"
      />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        label="立直放铳B"
        statKey="立直后非瞬间放铳率"
        description="立直放铳局数（不含立直瞬间） / 立直局数"
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        statKey="立直收支"
        description="立直总收支（含供托） / 立直局数"
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        statKey="立直收入"
        description="立直和了收入（含供托） / 立直和了局数"
      />
      <GenericStat
        stats={stats}
        formatter={formatRound}
        statKey="立直支出"
        description="立直放铳支出（含立直棒） / 立直放铳局数"
      />
      <GenericStat stats={stats} formatter={formatPercent} statKey="先制率" description="先制立直局数 / 立直局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="追立率" description="追立局数 / 立直局数" />
      <GenericStat stats={stats} formatter={formatPercent} statKey="被追率" description="被追立局数 / 立直局数" />
      <GenericStat stats={stats} formatter={formatFixed3} statKey="立直巡目" />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        label="立直流局"
        statKey="立直后流局率"
        description="立直流局局数 / 立直局数"
      />
      <GenericStat stats={stats} formatter={formatPercent} statKey="一发率" description="一发局数 / 立直和了局数" />
      <GenericStat
        stats={stats}
        formatter={formatPercent}
        label="振听率"
        statKey="振听立直率"
        description="振听立直局数（不含立直见逃） / 立直局数"
      />
      {(stats.立直多面 || stats.立直多面 === 0) && (
        <GenericStat
          stats={stats}
          formatter={formatPercent}
          statKey="立直多面"
          description={
            <Box>
              <Trans>
                多面立直局数 / 立直局数
                <br />
                听牌两种或以上即视为多面（含对碰）
              </Trans>
              <br />
              <Trans values={{ date: "2021/9/10" }} defaults="（数据从 {{date}} 前后开始收集）" />
            </Box>
          }
        />
      )}
      {(stats.立直好型2 || stats.立直好型2 === 0) && (
        <GenericStat
          stats={stats}
          formatter={formatPercent}
          statKey="立直好型2"
          label="立直好型"
          description={
            <Box>
              <Trans>
                好型立直局数 / 立直局数
                <br />
                立直时听牌可见剩余 6 枚或以上视为好型
              </Trans>
              <br />
              <Trans values={{ date: "2021/11/7" }} defaults="（数据从 {{date}} 前后开始收集）" />
            </Box>
          }
        />
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
      <GenericStat stats={stats} formatter={formatFixed3} statKey="平均起手向听" />
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

const BlurrableBox = ({ blur, sx, ...props }: { blur: boolean } & BoxProps) => (
  <Box sx={{ ...(blur ? { opacity: 0.2, pointerEvents: "none" } : {}), ...sx }} {...props} />
);

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
    <Box mb={1} position="relative">
      {isChangingSettings && (
        <Box position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -50%)" }}>
          <Loading />
        </Box>
      )}
      {hasMetadata ? (
        <BlurrableBox blur={isChangingSettings}>
          <Helmet>
            <title>{metadata?.nickname}</title>
          </Helmet>
          <Typography variant="h4" textAlign="center">
            {getAccountZoneTag(metadata!.id)} {metadata?.nickname}
          </Typography>
          <Grid container mt={2} rowSpacing={2} spacing={2}>
            <Grid item xs={12} md={8}>
              <BlurrableBox blur={Model.hasAdvancedParams(model)}>
                <Typography variant="h5" mb={2} textAlign="center">
                  {t("最近走势")}
                </Typography>
                <RecentRankChart dataAdapter={dataAdapter} playerId={metadata!.id} aspect={6} />
              </BlurrableBox>
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
        </BlurrableBox>
      ) : (
        <Loading />
      )}
      <PlayerDetailsSettings showLevel={true} availableModes={availableModes} />
    </Box>
  );
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}
