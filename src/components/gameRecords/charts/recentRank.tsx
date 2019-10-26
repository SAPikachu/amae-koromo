import React from "react";
import { ResponsiveContainer, LineChart, Line, Dot, Tooltip, TooltipProps } from "recharts";

import { IDataAdapter } from "../dataAdapterProvider";
import { GameRecord, RANK_LABELS, RANK_COLORS } from "../../../utils/dataSource";
import { useMemo } from "react";
import GameMode from "../../../utils/gameMode";
import { Player } from "../player";

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

export default function RecentRankChart({
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