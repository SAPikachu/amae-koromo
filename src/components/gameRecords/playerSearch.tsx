import React from "react";
import { useEffect, useState, useMemo } from "react";

import { PlayerMetadataLite, LevelWithDelta } from "../../data/types";
import { searchPlayer } from "../../data/source/misc";
import { Redirect } from "react-router-dom";
import { generatePlayerPathById } from "./routeUtils";
import { useTranslation } from "react-i18next";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { networkError } from "../../utils/notify";

const playerSearchCache = new Map<string, PlayerMetadataLite[] | Promise<PlayerMetadataLite[]>>();
const NUM_RESULTS_SHOWN = 6;
const NUM_FETCH = 20;

const normalizeName = (s: string) => s.toLowerCase().trim();

function findRawResultFromCache(prefix: string): { result: PlayerMetadataLite[]; isExactMatch: boolean } | null {
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

export function PlayerSearch() {
  const { t } = useTranslation("form");
  const [selectedItem, setSelectedItem] = useState(null as PlayerMetadataLite | null);
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
      const promise = searchPlayer(prefix).then(function (players) {
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
      getOptionLabel={(x) => `[${LevelWithDelta.getTag(x.level)}] ${x.nickname}`}
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
