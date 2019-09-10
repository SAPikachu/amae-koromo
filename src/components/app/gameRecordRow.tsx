import React from "react";
import { memo } from "react";
import moment from "moment";

import { Player } from "./player";
import { GameMode, GameRecord } from "../../utils/dataSource";

export const GameRecordRow = memo(function({ game }: { game: GameRecord }) {
  const topScore = Math.max(...game.players.map(x => x.score));
  return (
    <tr>
      <td>{GameMode[game.modeId]}</td>
      <td>
        <div className="row no-gutters">
          {game.players.map(x => (
            <div key={x.accountId} className="col-6 pr-1">
              <Player game={game} player={x} isTop={x.score === topScore} />
            </div>
          ))}
        </div>
      </td>
      <td>{moment.unix(game.startTime).format("HH:mm")}</td>
      <td>{moment.unix(game.endTime).format("HH:mm")}</td>
    </tr>
  );
});
