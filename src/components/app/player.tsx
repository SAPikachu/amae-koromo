import React from "react";
import { memo } from "react";

import { getLevelTag } from "../../utils";
import { GameRecord, PlayerRecord } from "../../utils/dataSource";

const encodeAccountId = (t: number) => 1358437 + ((7 * t + 1117113) ^ 86216345);

export const Player = memo(function({
  player: { nickname, level, score, accountId },
  game: { uuid },
  isTop,
}: {
  player: PlayerRecord;
  game: GameRecord;
  isTop: boolean;
}) {
  return (
    <div className={`player ${isTop && "font-weight-bold"}`}>
      <a href={`https://www.majsoul.com/1/?paipu=${uuid}_a${encodeAccountId(accountId)}`} target="_blank">
        [{getLevelTag(level)}] {nickname} {score !== undefined && `[${score}]`}
      </a>
    </div>
  );
});
