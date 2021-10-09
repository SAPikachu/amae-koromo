import { useMemo } from "react";
import { useDataAdapter } from "../gameRecords/dataAdapterProvider";
import { PlayerRecord, RankRates, GameRecord, calculateDeltaPoint, Level } from "../../data/types";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { formatPercent, formatFixed3 } from "../../utils";
import { SimpleRoutedSubViews, ViewRoutes, RouteDef, NavButtons, ViewSwitch } from "../routing";
import { useModel } from "../gameRecords/model";
import { useTranslation } from "react-i18next";
import { StatList, StatTooltip } from "./statItem";
import {
  Box,
  IconButton,
  Link,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FormatListBulleted } from "@mui/icons-material";

type RateItem = {
  player: PlayerRecord;
  count: number;
  resultSelf: RankRates;
  resultOpponent: RankRates;
  pointSelf: number;
  pointOpponent: number;
  win: number;
};
const StyledTable = styled(Table)(({ theme }) => ({
  display: "inline-table",
  whiteSpace: "nowrap",

  "& .MuiTableRow-root.MuiTableRow-root .MuiTableCell-root, & .MuiTableHead-root": {
    boxShadow: "none",
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    lineHeight: 1.25,
  },
  "& .MuiTableCell-root": {
    fontSize: "inherit",
    color: "inherit",
    padding: theme.spacing(0.5),
  },
  "& .MuiTableCell-root:not(:first-child)": {
    textAlign: "right",
  },
  "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": {
    border: "0 none",
  },
}));
function TipTable({ item }: { item: RateItem }) {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography textAlign="center" variant="body2" my={1}>
        {t("胜率：")}
        {formatPercent(item.win / item.count)}
      </Typography>
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>{t("玩家")}</TableCell>
            <TableCell>{t("对手")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{t("平均顺位")}</TableCell>
            <TableCell>{formatFixed3(RankRates.getAvg(item.resultSelf))}</TableCell>
            <TableCell>{formatFixed3(RankRates.getAvg(item.resultOpponent))}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("平均得点")}</TableCell>
            <TableCell>{formatFixed3(item.pointSelf / item.count)}</TableCell>
            <TableCell>{formatFixed3(item.pointOpponent / item.count)}</TableCell>
          </TableRow>
          {["一", "二", "三", "四"].slice(0, item.resultSelf.length).map((label, index) => (
            <TableRow key={index}>
              <TableCell>{t(label + "位")}</TableCell>
              <TableCell>
                {formatPercent(item.resultSelf[index] / item.count)} ({item.resultSelf[index]})
              </TableCell>
              <TableCell>
                {formatPercent(item.resultOpponent[index] / item.count)} ({item.resultOpponent[index]})
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </Box>
  );
}

export function SameMatchRateTable({ numGames = 100, numDisplay = 12, currentAccountId = 0 }) {
  const adapter = useDataAdapter();
  const [, updateModel] = useModel();
  const count = adapter.getCount();
  const numProcessedGames = Math.min(count, numGames);
  const rates = useMemo(() => {
    if (count <= 0) {
      return null;
    }
    const map: {
      [key: number]: RateItem;
    } = {};
    for (let i = 0; i < numProcessedGames; i++) {
      const game = adapter.getItem(i);
      if (!("uuid" in game)) {
        return null; // Not loaded, try again later
      }
      const currentPlayer = game.players.find((p) => p.accountId.toString() === currentAccountId.toString());
      if (!currentPlayer) {
        throw new Error(
          `Can't find current player, shouldn't happen. Current: ${currentAccountId}, Players: ${game.players
            .map((p) => p.accountId)
            .join(", ")}`
        );
      }
      for (const player of game.players) {
        if (player.accountId === currentAccountId) {
          continue;
        }
        if (!map[player.accountId]) {
          map[player.accountId] = {
            player,
            count: 0,
            resultSelf: new Array<number>(game.players.length).fill(0) as RankRates,
            resultOpponent: new Array<number>(game.players.length).fill(0) as RankRates,
            pointSelf: 0,
            pointOpponent: 0,
            win: 0,
          };
        }
        const entry = map[player.accountId];
        entry.count++;
        const selfRank = GameRecord.getRankIndexByPlayer(game, currentAccountId);
        const opponentRank = GameRecord.getRankIndexByPlayer(game, player);
        entry.resultSelf[selfRank]++;
        entry.resultOpponent[opponentRank]++;
        if (selfRank < opponentRank) {
          entry.win++;
        }
        if (game.modeId) {
          entry.pointSelf += calculateDeltaPoint(
            currentPlayer.score,
            selfRank,
            game.modeId,
            new Level(currentPlayer.level),
            true,
            true
          );
          entry.pointOpponent += calculateDeltaPoint(
            player.score,
            opponentRank,
            game.modeId,
            new Level(player.level),
            true,
            true
          );
        }
      }
    }
    const result = Object.values(map);
    result.sort((a, b) => b.count - a.count);
    return result;
  }, [count, adapter, numProcessedGames, currentAccountId]);
  if (count <= 0) {
    return null;
  }
  if (!rates) {
    return <Loading />;
  }
  return (
    <StatList>
      {rates.slice(0, numDisplay).map((x) => (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ whiteSpace: "nowrap" }}
          key={x.player.accountId}
        >
          <Typography variant="body2" mr={2}>
            <Link href={generatePlayerPathById(x.player.accountId)}>{x.player.nickname}</Link>
            <IconButton
              size="small"
              color="info"
              onClick={() => updateModel({ type: "player", searchText: x.player.nickname })}
              sx={{ margin: "-5px 0", verticalAlign: "text-top" }}
            >
              <FormatListBulleted fontSize="inherit" />
            </IconButton>
          </Typography>
          <Typography variant="body2" component="div">
            <StatTooltip title={<TipTable item={x} />} arrow>
              <Box>
                {formatPercent(x.count / numProcessedGames)} ({x.count})
              </Box>
            </StatTooltip>
          </Typography>
        </Box>
      ))}
    </StatList>
  );
}

export default function SameMatchRate({ numDisplay = 12, currentAccountId = 0 }) {
  return (
    <SimpleRoutedSubViews>
      <ViewRoutes>
        <RouteDef path="latest" title="最近 100 局">
          <SameMatchRateTable currentAccountId={currentAccountId} numDisplay={numDisplay} />
        </RouteDef>
        <RouteDef path="all" title="全部">
          <SameMatchRateTable currentAccountId={currentAccountId} numDisplay={numDisplay} numGames={0x7fffffff} />
        </RouteDef>
      </ViewRoutes>
      <NavButtons sx={{ mt: -1.5 }} />
      <ViewSwitch mutateTitle={false} />
    </SimpleRoutedSubViews>
  );
}
