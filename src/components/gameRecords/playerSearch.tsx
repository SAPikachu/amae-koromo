import React from "react";
import { useEffect, useState, useMemo } from "react";

import { useModel } from "./model";
import Loading from "../misc/loading";
import { PlayerMetadataLite, LevelWithDelta, getLevelTag } from "../../utils/dataTypes";
import { searchPlayer } from "../../utils/dataSource";
import { Link } from "react-router-dom";
import { generatePath } from "./routes";

const playerSearchCache = {} as { [prefix: string]: PlayerMetadataLite[] | Promise<PlayerMetadataLite[]> };
const NUM_RESULTS_SHOWN = 6;
const NUM_FETCH = 20;

const normalizeName = (s: string) => s.toLowerCase().trim();

function findRawResultFromCache(prefix: string): { result: PlayerMetadataLite[]; isExactMatch: boolean } | null {
  const normalizedPrefix = normalizeName(prefix);
  prefix = normalizedPrefix;
  while (prefix) {
    const players = playerSearchCache[prefix];
    if (!players || players instanceof Promise) {
      prefix = prefix.slice(0, prefix.length - 1);
      continue;
    }
    return {
      isExactMatch: prefix === normalizedPrefix,
      result: players
    };
  }
  return null;
}

function PlayerSearchResult({ searchText }: { searchText: string }) {
  const [version, setVersion] = useState(0);
  const [players, isLoading, mayHaveMore] = useMemo(() => {
    const cachedResult = findRawResultFromCache(searchText);
    if (!cachedResult) {
      return [[], true];
    }
    if (cachedResult.isExactMatch) {
      return [cachedResult.result, false];
    }
    const normalizedPrefix = normalizeName(searchText);
    let mayHaveMore = cachedResult.result.length >= NUM_FETCH;
    const filteredPlayers = [] as PlayerMetadataLite[];
    cachedResult.result.forEach(player => {
      if (normalizeName(player.nickname).startsWith(normalizedPrefix)) {
        filteredPlayers.push(player);
      } else if (filteredPlayers.length) {
        // Result covers all players who have the specified prefix
        mayHaveMore = false;
      }
    });
    return [filteredPlayers, mayHaveMore && filteredPlayers.length < NUM_RESULTS_SHOWN, mayHaveMore];
  }, [searchText, version]);
  useEffect(() => {
    const prefix = normalizeName(searchText);
    if (playerSearchCache[prefix]) {
      return;
    }
    if (!isLoading) {
      return;
    }
    let cancelled = false;
    let debounceToken: NodeJS.Timeout | undefined = setTimeout(() => {
      debounceToken = undefined;
      if (cancelled) {
        return;
      }
      if (playerSearchCache[prefix]) {
        return;
      }
      playerSearchCache[prefix] = searchPlayer(prefix).then(function(players) {
        playerSearchCache[prefix] = players;
        if (!cancelled) {
          setVersion(new Date().getTime());
        }
        return players;
      });
    }, 500);
    return () => {
      cancelled = true;
      if (debounceToken) {
        clearTimeout(debounceToken);
      }
    };
  }, [searchText, isLoading]);
  return (
    <>
      <h6 className="text-center mb-2">玩家前缀搜索</h6>
      <ul className="list-unstyled row mb-2">
        {players.slice(0, NUM_RESULTS_SHOWN).map(x => (
          <li key={x.id} className="col-6">
            <Link to={generatePath({ type: "player", playerId: x.id.toString(), version: 0 })}>
              <span>
                [{getLevelTag(x.level.id)}] {x.nickname}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {(isLoading && <Loading size="small" />) ||
        ((players.length > NUM_RESULTS_SHOWN || mayHaveMore) && (
          <small className="d-block text-center text-muted">（输入更长名字显示其它结果）</small>
        ))}
    </>
  );
}

export function PlayerSearch({ className = "" }) {
  const [model] = useModel();
  if ("playerId" in model || !model.searchText) {
    return <></>;
  }
  return (
    <div className={className}>
      <PlayerSearchResult searchText={model.searchText} />
    </div>
  );
}
