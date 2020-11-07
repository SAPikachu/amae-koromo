import React from "react";
import { useEffect, useState, useMemo } from "react";

import Loading from "../misc/loading";
import { PlayerMetadataLite, getLevelTag } from "../../data/types";
import { searchPlayer } from "../../data/source/misc";
import { Link } from "react-router-dom";
import { generatePlayerPathById } from "./routes";
import { useTranslation } from "react-i18next";

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
      result: players,
    };
  }
  return null;
}

function PlayerSearchResult({ searchText }: { searchText: string }) {
  const { t } = useTranslation();
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
    cachedResult.result.forEach((player) => {
      if (normalizeName(player.nickname).startsWith(normalizedPrefix)) {
        filteredPlayers.push(player);
      } else if (filteredPlayers.length) {
        // Result covers all players who have the specified prefix
        mayHaveMore = false;
      }
    });
    return [filteredPlayers, mayHaveMore && filteredPlayers.length < NUM_RESULTS_SHOWN, mayHaveMore];
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      playerSearchCache[prefix] = searchPlayer(prefix).then(function (players) {
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
      <ul className="list-unstyled mb-2">
        {players.slice(0, NUM_RESULTS_SHOWN).map((x) => (
          <li key={x.id}>
            <Link to={generatePlayerPathById(x.id)}>
              <span>
                [{getLevelTag(x.level.id)}] {x.nickname}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {(isLoading && <Loading size="small" />) ||
        ((players.length > NUM_RESULTS_SHOWN || mayHaveMore) && (
          <small className="d-block text-center text-muted">{t("（输入更长名字显示其它结果）")}</small>
        ))}
    </>
  );
}

export function PlayerSearch({ className = "player-search", searchText = "" }) {
  if (!searchText) {
    return <></>;
  }
  return (
    <div className={className}>
      <PlayerSearchResult searchText={searchText} />
    </div>
  );
}
