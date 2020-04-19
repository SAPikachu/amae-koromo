import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDataAdapter } from "../gameRecords/dataAdapterProvider";
import { PlayerRecord, RankRates, GameRecord, calculateDeltaPoint, Level } from "../../data/types";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { formatPercent, formatFixed3, isMobile } from "../../utils";
import { SimpleRoutedSubViews, ViewRoutes, RouteDef, NavButtons, ViewSwitch } from "../routing";
import { IoIosList } from "react-icons/io";
import { useModel } from "../gameRecords/model";
import { useTranslation } from "react-i18next";

export function SameMatchRateTable({ numGames = 100, numDisplay = 10, currentAccountId = 0 }) {
  const { t } = useTranslation();
  const adapter = useDataAdapter();
  const [, updateModel] = useModel();
  const count = adapter.getCount();
  const numProcessedGames = Math.min(count, numGames);
  const rates = useMemo(() => {
    if (count <= 0) {
      return null;
    }
    const map: {
      [key: number]: {
        player: PlayerRecord;
        count: number;
        resultSelf: RankRates;
        resultOpponent: RankRates;
        pointSelf: number;
        pointOpponent: number;
        win: number;
      };
    } = {};
    for (let i = 0; i < numProcessedGames; i++) {
      const game = adapter.getItem(i);
      if (!("uuid" in game)) {
        return null; // Not loaded, try again later
      }
      const currentPlayer = game.players.find(p => p.accountId === currentAccountId);
      if (!currentPlayer) {
        throw new Error("Can't find current player, shouldn't happen");
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
            win: 0
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
    <dl className="row">
      {rates.slice(0, numDisplay).map(x => (
        <React.Fragment key={x.player.accountId}>
          <div style={{ display: "none" }} id={`smr-statistic-tip-${currentAccountId}-${x.player.accountId}`}>
            <p className="mt-2">
              {t("胜率：")}
              {formatPercent(x.win / x.count)}
            </p>
            <table
              className="table table-dark mb-1 text-nowrap table-sm text-right"
              style={{ display: "inline-table", backgroundColor: "transparent" }}
            >
              <thead>
                <tr>
                  <th></th>
                  <th>{t("玩家")}</th>
                  <th>{t("对手")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left">{t("平均顺位")}</td>
                  <td>{formatFixed3(RankRates.getAvg(x.resultSelf))}</td>
                  <td>{formatFixed3(RankRates.getAvg(x.resultOpponent))}</td>
                </tr>
                <tr>
                  <td className="text-left">{t("平均得点")}</td>
                  <td>{formatFixed3(x.pointSelf / x.count)}</td>
                  <td>{formatFixed3(x.pointOpponent / x.count)}</td>
                </tr>
                {["一", "二", "三", "四"].slice(0, x.resultSelf.length).map((label, index) => (
                  <tr key={index}>
                    <td className="text-left">{t(label + "位")}</td>
                    <td>
                      {formatPercent(x.resultSelf[index] / x.count)} ({x.resultSelf[index]})
                    </td>
                    <td>
                      {formatPercent(x.resultOpponent[index] / x.count)} ({x.resultOpponent[index]})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dt className="col-8 col-lg-4 font-weight-normal">
            <Link to={generatePlayerPathById(x.player.accountId)}>{x.player.nickname}</Link>
            <button
              className="button-link ml-2"
              onClick={() => updateModel({ type: "player", searchText: x.player.nickname })}
            >
              <IoIosList />
            </button>
          </dt>
          <dd className="col-4 col-lg-2 text-right">
            <span
              data-tip={`##smr-statistic-tip-${currentAccountId}-${x.player.accountId}`}
              data-html={true}
              data-place={isMobile() ? "left" : "top"}
            >
              {" "}
              {formatPercent(x.count / numProcessedGames)} ({x.count})
            </span>
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

export default function SameMatchRate({ numDisplay = 10, currentAccountId = 0 }) {
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
      <NavButtons className="mt-n3" />
      <ViewSwitch mutateTitle={false} />
    </SimpleRoutedSubViews>
  );
}
