import { useModel } from "./model";

import { default as GameRecordTable } from "./table";
import {
  COLUMN_RANK,
  COLUMN_GAMEMODE,
  COLUMN_PLAYERS,
  COLUMN_FULLTIME,
  COLUMN_STARTTIME,
  COLUMN_ENDTIME,
} from "./columns";

export function GameRecordTablePlayerView() {
  const [model] = useModel();
  if (!("playerId" in model)) {
    return null;
  }
  return (
    <GameRecordTable
      columns={[
        COLUMN_GAMEMODE,
        COLUMN_RANK(model.playerId),
        COLUMN_PLAYERS({ activePlayerId: model.playerId }),
        COLUMN_FULLTIME,
      ]}
    />
  );
}

export function GameRecordTableHomeView() {
  return <GameRecordTable columns={[COLUMN_GAMEMODE, COLUMN_PLAYERS(), COLUMN_STARTTIME, COLUMN_ENDTIME]} />;
}
