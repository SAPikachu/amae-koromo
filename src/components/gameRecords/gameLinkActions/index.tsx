import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { GameRecord, PlayerRecord } from "../../../data/types";
import Loadable from "../../misc/customizedLoadable";

const ActionsDialog = Loadable({
  loader: () => import(/* webpackMode: "lazy" */ /* webpackFetchPriority: "low" */ "./dialog"),
  loading: () => <></>,
});

const Context = React.createContext<{ open: (player: PlayerRecord, game: GameRecord) => void }>({
  open: () => {
    /* Placeholder */
  },
});

export const useGameLinkActions = () => React.useContext(Context);

const GameLinkActionsProvider = ({ children }: { children: ReactNode }) => {
  const [info, setInfo] = useState<{ player: PlayerRecord; game: GameRecord } | null>(null);
  const { player, game } = info || {};
  const open = useCallback(
    (player: PlayerRecord, game: GameRecord) => {
      setInfo({ player, game });
    },
    [setInfo]
  );
  const close = useCallback(() => setInfo(null), [setInfo]);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <Context.Provider value={value}>
      <ActionsDialog player={player} game={game} onClose={close} />
      {children}
    </Context.Provider>
  );
};
export default GameLinkActionsProvider;
