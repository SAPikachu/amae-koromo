import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  LineChart,
  Line,
  Dot,
  Tooltip,
  TooltipProps,
  Curve
} from "recharts";

import { useDataAdapter, IDataAdapter } from "./dataAdapterProvider";
import { PlayerMetadata, GameRecord, RANK_LABELS, RANK_COLORS, getLevelTag } from "../../utils/dataSource";
import { useMemo, useEffect } from "react";
import { triggerRelayout } from "../../utils/index";
import GameMode from "../../utils/gameMode";
import { Player } from "./player";
import { LevelWithDelta } from "../../utils/dataTypes";

declare module "recharts" {
  interface DotProps {
    strokeWidth?: number;
    stroke?: string;
    fill?: string;
    payload?: any;
  }
  interface LabelListProps {
    fill?: string;
  }
}

const generateCells = (activeIndex: number) =>
  RANK_COLORS.map((color, index) => (
    <Cell fill={color} fillOpacity={activeIndex === index ? 1 : 1} key={`cell-${index}`} />
  ));

const CELLS = generateCells(-1);

const formatLabel = (x: any) => (x.rate > 0 ? x.label : null);
const formatPercent = (x: any) => (x > 0 ? `${(x * 100).toFixed(2)}%` : "");
const createLabelLine = (props: any) =>
  props.payload.payload.rate > 0 ? <Curve {...props} type="linear" className="recharts-pie-label-line" /> : null;

function RankRateChart({ metadata, aspect = 1 }: { metadata: PlayerMetadata; aspect?: number }) {
  const ranks = useMemo(() => metadata.rank_rates.map((x, index) => ({ label: RANK_LABELS[index], rate: x })), [
    metadata
  ]);
  const startAngle = ranks.filter(x => x.rate > 0).length < 4 ? 45 : 0;
  return (
    <ResponsiveContainer width="100%" aspect={aspect} height="auto">
      <PieChart>
        <Pie
          isAnimationActive={false}
          data={ranks}
          label={formatLabel}
          labelLine={createLabelLine}
          nameKey="label"
          dataKey="rate"
          startAngle={startAngle}
          endAngle={startAngle + 360}
        >
          {CELLS}
          <LabelList dataKey="rate" formatter={formatPercent} position="inside" fill="#fff" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

type DotPayload = { pos: number; rank: number; game: GameRecord; playerId: number };

const createDot = (props: { payload: DotPayload }, active?: boolean) => {
  return (
    <Dot
      {...props}
      r={5}
      stroke={RANK_COLORS[props.payload.rank]}
      onClick={() => window.open(GameRecord.getRecordLink(props.payload.game, props.payload.playerId), "_blank")}
      {...(active ? { fill: RANK_COLORS[props.payload.rank], r: 10 } : {})}
    />
  );
};
const createActiveDot = (props: any) => createDot(props, true);

const RankChartTooltip = ({ active, payload }: TooltipProps = {}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }
  const realPayload = payload[0].payload as DotPayload;
  return (
    <div className="player-chart-tooltip">
      <h5>
        {GameRecord.formatFullStartTime(realPayload.game)} {GameMode[realPayload.game.modeId]}{" "}
        {RANK_LABELS[realPayload.rank]}
      </h5>
      {realPayload.game.players.map(x => (
        <p key={x.accountId.toString()}>
          <Player player={x} game={realPayload.game} isActive={realPayload.playerId === x.accountId} hideDetailLink />
        </p>
      ))}
    </div>
  );
};

function RecentRankChart({
  dataAdapter,
  playerId,
  aspect = 2,
  numGames = 20
}: {
  dataAdapter: IDataAdapter;
  playerId: number;
  aspect?: number;
  numGames?: number;
}) {
  const dataPoints = useMemo(() => {
    const result = [] as DotPayload[];
    const totalGames = dataAdapter.getCount();
    if (!totalGames) {
      return result;
    }
    for (let i = 0; i < Math.min(totalGames, numGames); i++) {
      const game = dataAdapter.getItem(i);
      if (!("uuid" in game)) {
        break;
      }
      const rank = GameRecord.getRankIndexByPlayer(game, playerId);
      result.unshift({ pos: 3 - rank, rank, game, playerId });
    }
    return result;
  }, [dataAdapter]);
  return (
    <ResponsiveContainer width="100%" aspect={aspect} height="auto">
      <LineChart data={dataPoints} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
        <Line
          isAnimationActive={false}
          dataKey="pos"
          type="linear"
          stroke="#b5c2ce"
          strokeWidth={3}
          dot={createDot}
          activeDot={createActiveDot}
        />
        <Tooltip cursor={false} content={<RankChartTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PlayerDetails() {
  const dataAdapter = useDataAdapter();
  const metadata = dataAdapter.getMetadata<PlayerMetadata>();
  useEffect(triggerRelayout, [!!metadata]);
  if (!metadata || !metadata.nickname) {
    return null;
  }
  return (
    <div>
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
