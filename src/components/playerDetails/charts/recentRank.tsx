import { ResponsiveContainer, LineChart, Line, Dot, Tooltip, YAxis, TooltipProps } from "recharts";

import { IDataAdapter } from "../../gameRecords/dataAdapterProvider";
import { GameRecord, Level, modeLabel, getRankLabelByIndex } from "../../../data/types";
import { useMemo } from "react";
import { Player } from "../../gameRecords/player";
import Loading from "../../misc/loading";
import { calculateDeltaPoint } from "../../../data/types/metadata";
import { useIsMobile } from "../../../utils/index";
import Conf from "../../../utils/conf";
import { alpha, Box, styled, Typography } from "@mui/material";

declare module "recharts" {
  interface DotProps {
    strokeWidth?: number;
    stroke?: string;
    fill?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }
}

type DotPayload = {
  pos: number;
  rank: number;
  delta: number;
  cumulativeDelta: number;
  game: GameRecord;
  playerId: number;
};

const createDot = (isMobile: boolean) => (props: { payload: DotPayload }, active?: boolean) => {
  const scale = isMobile ? 1.5 : 2;
  return (
    <Dot
      {...props}
      stroke={Conf.rankColors[props.payload.rank]}
      onClick={() => window.open(GameRecord.getRecordLink(props.payload.game, props.payload.playerId), "_blank")}
      {...(active ? { fill: Conf.rankColors[props.payload.rank], r: 5 * scale } : { r: 2.5 * scale })}
    />
  );
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createActiveDot = (isMobile: boolean) => (props: Parameters<ReturnType<typeof createDot>>[0]) =>
  createDot(isMobile)(props, true);

const TooltipBox = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[700], 0.92),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.common.white,
  fontFamily: theme.typography.fontFamily,
  padding: "16px",
  fontSize: theme.typography.pxToRem(11),
  fontWeight: theme.typography.fontWeightMedium,
}));

const RankChartTooltip = ({ active, payload }: TooltipProps = {}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }
  const realPayload = payload[0].payload as DotPayload;
  return (
    <TooltipBox>
      <Typography variant="h6">
        {GameRecord.formatFullStartTime(realPayload.game)}{" "}
        {realPayload.game.modeId ? modeLabel(realPayload.game.modeId) : ""} {getRankLabelByIndex(realPayload.rank)}{" "}
        {realPayload.delta > 0 ? "+" : ""}
        {realPayload.delta}pt
      </Typography>
      {realPayload.game.players.map((x) => (
        <Typography key={x.accountId.toString()} variant="body2">
          <Player
            player={x}
            game={realPayload.game}
            sx={{ textDecoration: realPayload.playerId === x.accountId ? "underline" : "none" }}
            color="inherit"
            hideDetailIcon
          />
        </Typography>
      ))}
    </TooltipBox>
  );
};

export default function RecentRankChart({
  dataAdapter,
  playerId,
  aspect = 2,
  numGames = 0,
}: {
  dataAdapter: IDataAdapter;
  playerId: number;
  aspect?: number;
  numGames?: number;
}) {
  const isMobile = useIsMobile();
  if (!numGames) {
    numGames = isMobile ? 20 : 30;
  }
  const dataPoints = useMemo(() => {
    const result = [] as DotPayload[];
    const totalGames = dataAdapter.getCount();
    if (!totalGames) {
      return result;
    }
    for (let i = 0; i < Math.min(totalGames, numGames); i++) {
      const game = dataAdapter.getItem(i);
      if (!game || !("uuid" in game)) {
        break;
      }
      const rank = GameRecord.getRankIndexByPlayer(game, playerId);
      result.unshift({
        pos: 3 - rank,
        rank,
        delta: 0,
        cumulativeDelta: 0,
        game,
        playerId,
      });
    }
    let delta = 0;
    for (const point of result) {
      const game = point.game;
      if (!game.modeId) {
        continue;
      }
      const playerRecord = game.players.filter((x) => x.accountId.toString() === playerId.toString())[0];
      point.delta =
        typeof playerRecord.gradingScore === "number"
          ? playerRecord.gradingScore
          : calculateDeltaPoint(playerRecord.score, point.rank, game.modeId, new Level(playerRecord.level));
      delta += point.delta;
      point.cumulativeDelta = delta;
    }
    return result;
  }, [dataAdapter, numGames, playerId]);
  const dot = useMemo(() => createDot(isMobile), [isMobile]);
  const activeDot = useMemo(() => createActiveDot(isMobile), [isMobile]);
  if (!dataPoints.length) {
    return <Loading />;
  }
  const haveDelta = dataPoints.some((x) => x.delta !== 0);
  return (
    <ResponsiveContainer width="100%" aspect={aspect} height="auto">
      <LineChart data={dataPoints} margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
        <YAxis type="number" domain={["dataMin", "dataMax"]} yAxisId={0} hide={true} />
        <YAxis type="number" domain={["dataMin", "dataMax"]} yAxisId={1} hide={true} />
        {haveDelta && (
          <Line
            isAnimationActive={false}
            dataKey="cumulativeDelta"
            type="linear"
            stroke="#969696"
            strokeWidth={1.5}
            yAxisId={1}
            dot={false}
            activeDot={false}
            strokeDasharray="5 5"
          />
        )}
        <Line
          isAnimationActive={false}
          dataKey="pos"
          type="linear"
          stroke="#b5c2ce"
          strokeWidth={3}
          dot={dot}
          activeDot={activeDot}
        />
        <Tooltip cursor={false} content={<RankChartTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
}
