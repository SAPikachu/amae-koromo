import { ContentCopy, PieChartRounded, ReadMore, Replay, SvgIconComponent } from "@mui/icons-material";
import { Avatar, Dialog, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import copy from "copy-to-clipboard";
import { useSnackbar } from "notistack";
import React, { AnchorHTMLAttributes, useCallback, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { GameRecord, PlayerRecord } from "../../../data/types";
import Conf from "../../../utils/conf";
import { generatePlayerPathById } from "../routeUtils";

const Action = ({
  Icon,
  text,
  ...props
}: {
  Icon: SvgIconComponent;
  text: string;
} & Parameters<typeof ListItemButton>[0] &
  AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <ListItem disableGutters>
    <ListItemButton {...props}>
      <ListItemAvatar>
        <Avatar>
          <Icon fontSize="inherit" />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={text} primaryTypographyProps={{ variant: "body2", sx: { pr: 1 } }} />
    </ListItemButton>
  </ListItem>
);
export const ActionsDialog = React.memo(
  ({ player, game, onClose }: { player?: PlayerRecord; game?: GameRecord; onClose: () => void }) => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [savedGame, updateGame] = useReducer(
      (prev: GameRecord | undefined, cur: GameRecord | undefined) => cur || prev,
      game,
      (game) => game
    );
    useEffect(() => {
      updateGame(game);
    }, [game]);
    const isMasked = !(game || savedGame)?.uuid || (game || savedGame)?._masked;
    const gameLink = !game ? "#" : (isMasked ? GameRecord.getMaskedRecordLink : GameRecord.getRecordLink)(game, player);
    const copyLink = useCallback(() => {
      if (!gameLink) {
        return;
      }
      copy(gameLink);
      enqueueSnackbar(t("链接复制成功"), { variant: "success", autoHideDuration: 2000 });
    }, [gameLink, enqueueSnackbar, t]);
    return (
      <Dialog open={!!game} onClose={onClose} onClick={onClose} maxWidth="xs">
        <List>
          <Action Icon={Replay} text={t("查看牌谱")} href={gameLink} target="_blank" />
          {!isMasked && <Action Icon={ContentCopy} onClick={copyLink} text={t("复制链接")} />}
          <Action
            Icon={ReadMore}
            text={t("玩家详细")}
            href={player?.accountId ? generatePlayerPathById(player.accountId) : "#"}
          />
          {Conf.features.aiReview && !isMasked && (
            <Action
              Icon={PieChartRounded}
              text={t("AI 检讨")}
              target="_blank"
              href={
                game && player
                  ? `${t("https://mjai.ekyu.moe/zh-cn.html")}?url=${encodeURIComponent(
                      GameRecord.getRecordLink(game, player)
                    )}`
                  : "#"
              }
            />
          )}
        </List>
      </Dialog>
    );
  }
);

export default ActionsDialog;
