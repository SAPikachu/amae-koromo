import React, { useCallback, useEffect } from "react";
import { LevelWithDelta, PlayerMetadata } from "../../../data/types";
import { loadPreference, savePreference } from "../../../utils/preference";

type StarredPlayer = {
  id: number;
  name: string;
  levelId: number;
  timestamp: number;
};

const Context = React.createContext({
  starredPlayers: [] as StarredPlayer[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  unstarPlayer(_: PlayerMetadata) {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  starPlayer(_: PlayerMetadata) {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refreshAndGetIsPlayerStarred(_: PlayerMetadata): boolean {
    return false;
  },
});
export const useStarPlayer = () => React.useContext(Context);

const channel = window.BroadcastChannel ? new BroadcastChannel("StarPlayerProvider") : null;

function loadStarredPlayers() {
  const list = loadPreference<StarredPlayer[]>("starredPlayers", []);
  const map = new Map(list.map((item) => [item.id, item]));
  return { list, map };
}
function saveStarredPlayers(list: StarredPlayer[]) {
  savePreference("starredPlayers", list);
  if (channel) {
    setTimeout(() => channel.postMessage("refresh"), 100);
  }
}

export default function StarPlayerProvider({ children }: { children: React.ReactNode }) {
  const [starredPlayers, setStarredPlayers] = React.useState(() => loadStarredPlayers());
  const [debouceCounter, setDebouceCounter] = React.useState(0);
  useEffect(() => {
    if (debouceCounter > 0) {
      setStarredPlayers(loadStarredPlayers());
    }
  }, [debouceCounter]);
  useEffect(() => {
    if (!channel) {
      return;
    }
    const handler = function handler(e: MessageEvent) {
      if (e.data === "refresh") {
        setDebouceCounter((c) => c + 1);
      }
    };
    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
    };
  }, []);
  const starPlayer = useCallback(
    (player: PlayerMetadata) => {
      const newStarredPlayer = {
        id: player.id,
        name: player.nickname,
        levelId: LevelWithDelta.getAdjustedLevel(player.level).toLevelId(),
        timestamp: Date.now(),
      };
      const index = starredPlayers.list.findIndex((item) => item.id === newStarredPlayer.id);
      if (
        index === 0 &&
        starredPlayers.list[0].name === newStarredPlayer.name &&
        starredPlayers.list[0].levelId === newStarredPlayer.levelId
      ) {
        return;
      }
      starredPlayers.map.set(newStarredPlayer.id, newStarredPlayer);
      if (index >= 0) {
        starredPlayers.list.splice(index, 1);
      }
      starredPlayers.list.unshift(newStarredPlayer);
      saveStarredPlayers(starredPlayers.list);
      setDebouceCounter((c) => c + 1);
    },
    [starredPlayers]
  );
  const value = React.useMemo(
    () => ({
      starredPlayers: starredPlayers.list,
      unstarPlayer(player: PlayerMetadata) {
        if (!starredPlayers.map.has(player.id)) {
          return;
        }
        starredPlayers.map.delete(player.id);
        starredPlayers.list = starredPlayers.list.filter((item) => item.id !== player.id);
        saveStarredPlayers(starredPlayers.list);
        setStarredPlayers({ ...starredPlayers });
      },
      starPlayer,
      refreshAndGetIsPlayerStarred(stats: PlayerMetadata) {
        const isStarred = starredPlayers.map.has(stats.id);
        if (!isStarred) {
          return false;
        }
        starPlayer(stats);
        return true;
      },
    }),
    [starPlayer, starredPlayers]
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
