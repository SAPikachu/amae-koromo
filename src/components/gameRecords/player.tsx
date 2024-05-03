import { PieChartRounded, ReadMore } from "@mui/icons-material";
import { Link, Typography, TypographyProps, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { GameRecord, PlayerRecord, getLevelTag } from "../../data/types";
import { generatePlayerPathById } from "./routeUtils";

export const Player = React.memo(function ({
  player,
  game,
  hideDetailIcon,
  showAiReviewIcon,
  maskedGameLink,
  ...props
}: {
  player: PlayerRecord;
  game: GameRecord;
  hideDetailIcon?: boolean;
  showAiReviewIcon?: boolean;
  maskedGameLink?: boolean;
} & TypographyProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { nickname, level, score, accountId } = player;
  const isTop = GameRecord.getRankIndexByPlayer(game, player) === 0;
  return (
    <Typography
      variant="body2"
      component="span"
      fontWeight={isTop ? "bold" : "normal"}
      display="inline-flex"
      alignItems="center"
      color={theme.palette.info.main}
      {...props}
    >
      <Link
        href={(maskedGameLink || !game.uuid || game._masked
          ? GameRecord.getMaskedRecordLink
          : GameRecord.getRecordLink)(game, player)}
        title={t("查看牌谱")}
        target="_blank"
        rel="noopener noreferrer"
        display="block"
        color="inherit"
      >
        [{getLevelTag(level)}] {nickname} {score !== undefined && `[${score}]`}
      </Link>
      {!hideDetailIcon && (
        <Link
          className="detail-link"
          title={t("玩家详细")}
          href={generatePlayerPathById(accountId)}
          display="block"
          color="inherit"
        >
          <ReadMore fontSize="small" sx={{ ml: 1, display: "block" }} />
        </Link>
      )}
      {game.uuid && showAiReviewIcon && (
        <Link
          className="detail-link"
          title={t("AI 检讨")}
          target="_blank"
          rel="noopener noreferrer"
          href={`${t("https://mjai.ekyu.moe/zh-cn.html")}?url=${encodeURIComponent(
            GameRecord.getRecordLink(game, player)
          )}`}
          display="block"
          color="inherit"
        >
          <PieChartRounded fontSize="small" sx={{ ml: 1, display: "block" }} />
        </Link>
      )}
    </Typography>
  );
});
