import React from "react";
import { Link } from "react-router-dom";
import { IoMdBook } from "react-icons/io";

import { getLevelTag } from "../../utils";
import { GameRecord, PlayerRecord } from "../../utils/dataSource";
import { generatePath } from "./routes";

const encodeAccountId = (t: number) => 1358437 + ((7 * t + 1117113) ^ 86216345);

export const Player = function({
  player: { nickname, level, score, accountId },
  game: { uuid },
  isTop
}: {
  player: PlayerRecord;
  game: GameRecord;
  isTop: boolean;
}) {
  return (
    <div className={`player ${isTop && "font-weight-bold"}`}>
      <a href={`https://www.majsoul.com/1/?paipu=${uuid}_a${encodeAccountId(accountId)}`} title="查看牌谱" target="_blank">
        [{getLevelTag(level)}] {nickname} {score !== undefined && `[${score}]`}
      </a>{" "}
      <Link title="玩家记录" to={generatePath({ type: "player", playerId: accountId.toString(), version: 0 })}>
        <IoMdBook />
      </Link>
    </div>
  );
};
