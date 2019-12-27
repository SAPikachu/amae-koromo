import React from "react";
import { Link } from "react-router-dom";
import { IoMdBook } from "react-icons/io";

import { GameRecord, PlayerRecord, getLevelTag } from "../../data/types";
import { generatePlayerPathById } from "./routes";

export const Player = React.memo(function({
  player,
  game,
  isActive
}: {
  player: PlayerRecord;
  game: GameRecord;
  isActive: boolean;
}) {
  const { nickname, level, score, accountId } = player;
  const isTop = GameRecord.getRankIndexByPlayer(game, player) === 0;
  return (
    <span className={`player ${isTop && "font-weight-bold"} ${isActive && "active-player"}`}>
      <a href={GameRecord.getRecordLink(game, player)} title="查看牌谱" target="_blank" rel="noopener noreferrer">
        [{getLevelTag(level)}] {nickname} {score !== undefined && `[${score}]`}
      </a>{" "}
      <Link className="detail-link" title="玩家记录" to={generatePlayerPathById(accountId)}>
        <IoMdBook />
      </Link>
    </span>
  );
});
