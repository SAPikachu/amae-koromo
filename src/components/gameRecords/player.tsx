import React from "react";
import { Link } from "react-router-dom";
import { IoMdBook } from "react-icons/io";

import { GameRecord, PlayerRecord, getLevelTag } from "../../utils/dataSource";
import { generatePath } from "./routes";

export const Player = React.memo(function({
  player,
  game,
  isActive,
  hideDetailLink
}: {
  player: PlayerRecord;
  game: GameRecord;
  isActive: boolean;
  hideDetailLink?: boolean;
}) {
  const { nickname, level, score, accountId } = player;
  const isTop = GameRecord.getRankIndexByPlayer(game, player) === 0;
  return (
    <span className={`player ${isTop && "font-weight-bold"} ${isActive && "active-player"}`}>
      <a href={GameRecord.getRecordLink(game, player)} title="查看牌谱" target="_blank">
        [{getLevelTag(level)}] {nickname} {score !== undefined && `[${score}]`}
      </a>{" "}
      {hideDetailLink || isActive ? null : (
        <Link title="玩家记录" to={generatePath({ type: "player", playerId: accountId.toString(), version: 0 })}>
          <IoMdBook />
        </Link>
      )}
    </span>
  );
});
