import React from "react";
import { useEffect, useState, useMemo } from "react";

import { LevelWithDelta, Level, getAccountZone } from "../../data/types";
import { searchPlayer, PlayerSearchResult } from "../../data/source/misc";
import { Redirect } from "react-router-dom";
import { generatePlayerPathById } from "./routeUtils";
import { useTranslation } from "react-i18next";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { networkError } from "../../utils/notify";
import Conf, { CONFIGURATIONS } from "../../utils/conf";
import Loading from "../misc/loading";

type PlayerSearchResultExt = PlayerSearchResult & {
  isDeleted?: boolean;
};

const playerSearchCache = new Map<string, PlayerSearchResultExt[] | Promise<PlayerSearchResultExt[]>>();
const NUM_FETCH = 20;

const normalizeName = (s: string) => s.toLowerCase().trim();

function findRawResultFromCache(prefix: string): { result: PlayerSearchResultExt[]; isExactMatch: boolean } | null {
  const normalizedPrefix = normalizeName(prefix);
  prefix = normalizedPrefix;
  while (prefix) {
    const players = playerSearchCache.get(prefix);
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

function getCrossSiteConf(x: PlayerSearchResultExt) {
  if (Conf.availableModes.length > 1) {
    const level = new Level(x.level.id);
    if (!Conf.availableModes.some((mode) => level.isAllowedMode(mode))) {
      return level.getNumPlayerId() === 2 ? CONFIGURATIONS.ikeda : CONFIGURATIONS.DEFAULT;
    }
  }
  return null;
}
function getOptionLabel(x: PlayerSearchResultExt, t: (x: string) => string): string {
  let ret = `[${LevelWithDelta.getTag(x.level)}] ${x.nickname}`;
  const conf = getCrossSiteConf(x);
  if (conf) {
    ret = `[${conf.rankColors.length === 3 ? t("三麻") : t("四麻")}] ${ret}`;
  }
  return ret;
}
export function PlayerSearch() {
  const { t } = useTranslation("form");
  const [selectedItem, setSelectedItem] = useState(null as PlayerSearchResultExt | null);
  const [version, setVersion] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = React.useState(false);
  const [players, isLoading] = useMemo(() => {
    if (!searchText) {
      return [[], false];
    }
    const cachedResult = findRawResultFromCache(searchText);
    if (!cachedResult) {
      return [[], true];
    }
    if (cachedResult.isExactMatch) {
      return [cachedResult.result, false];
    }
    const normalizedPrefix = normalizeName(searchText);
    let mayHaveMore = cachedResult.result.length >= NUM_FETCH;
    const filteredPlayers = [] as PlayerSearchResultExt[];
    cachedResult.result.forEach((player) => {
      if (normalizeName(player.nickname).startsWith(normalizedPrefix)) {
        filteredPlayers.push(player);
      } else if (filteredPlayers.length) {
        // Result covers all players who have the specified prefix
        mayHaveMore = false;
      }
    });
    return [filteredPlayers, mayHaveMore];
  }, [searchText, version]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!searchText.trim()) {
      return;
    }
    const prefix = normalizeName(searchText);
    if (playerSearchCache.has(prefix)) {
      return;
    }
    if (!isLoading) {
      return;
    }
    let cancelled = false;
    let debounceToken: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
      debounceToken = undefined;
      if (cancelled) {
        return;
      }
      if (playerSearchCache.has(prefix)) {
        return;
      }
      const promise = searchPlayer(prefix, NUM_FETCH).then(function (players: PlayerSearchResultExt[]) {
        players.forEach((x) => {
          x.isDeleted = players.some(
            (y) =>
              x.nickname === y.nickname &&
              getAccountZone(x.id) === getAccountZone(y.id) &&
              x.latest_timestamp < y.latest_timestamp
          );
        });
        playerSearchCache.set(prefix, players);
        if (!cancelled) {
          setVersion(new Date().getTime());
        }
        return players;
      });
      playerSearchCache.set(prefix, promise);
      promise.catch((e) => {
        console.error(e);
        playerSearchCache.delete(prefix);
        networkError();
      });
    }, 500);
    return () => {
      cancelled = true;
      if (debounceToken) {
        clearTimeout(debounceToken);
      }
    };
  }, [searchText, isLoading]);
  if (selectedItem) {
    const crossSiteConf = getCrossSiteConf(selectedItem);
    if (crossSiteConf) {
      location.href = `https://${crossSiteConf.canonicalDomain}${generatePlayerPathById(selectedItem.id)}`;
      return <Loading />;
    }
    return <Redirect to={generatePlayerPathById(selectedItem.id)} push />;
  }
  return (
    <Autocomplete
      fullWidth
      blurOnSelect
      open={open && !!searchText.trim()}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      inputValue={searchText}
      onInputChange={(_, value, reason) => setSearchText(reason === "reset" ? "" : value)}
      onChange={(_, value, reason) => reason === "selectOption" && setSelectedItem(value)}
      options={players}
      getOptionLabel={(x) => getOptionLabel(x, t)}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props as typeof props & { key: string };
        return (
          <li key={key} {...otherProps}>
            <span style={option.isDeleted ? { textDecoration: "line-through", color: "#888" } : {}}>
              {" "}
              {getOptionLabel(option, t)}
            </span>
          </li>
        );
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isLoading}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("名字")}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>{isLoading ? <CircularProgress color="inherit" size={20} /> : null}</React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
