import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDataAdapter } from "../gameRecords/dataAdapterProvider";
import { PlayerRecord } from "../../data/types";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { formatPercent } from "../../utils";
import { SimpleRoutedSubViews, ViewRoutes, RouteDef, NavButtons, ViewSwitch } from "../routing";

export function SameMatchRateTable({ numGames = 100, numDisplay = 10, currentAccountId = 0 }) {
  const adapter = useDataAdapter();
  const count = adapter.getCount();
  const numProcessedGames = Math.min(count, numGames);
  const rates = useMemo(() => {
    if (count <= 0) {
      return null;
    }
    const map: { [key: number]: { player: PlayerRecord; count: number } } = {};
    for (let i = 0; i < numProcessedGames; i++) {
      const game = adapter.getItem(i);
      if (!("uuid" in game)) {
        return null; // Not loaded, try again later
      }
      for (const player of game.players) {
        if (player.accountId === currentAccountId) {
          continue;
        }
        if (!map[player.accountId]) {
          map[player.accountId] = {
            player,
            count: 0
          };
        }
        map[player.accountId].count++;
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
          <dt className="col-8 col-lg-4 font-weight-normal">
            <Link to={generatePlayerPathById(x.player.accountId)}>{x.player.nickname}</Link>
          </dt>
          <dd className="col-4 col-lg-2 text-right">
            {formatPercent(x.count / numProcessedGames)} ({x.count})
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
