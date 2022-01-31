import { Star, StarBorder } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PlayerMetadata } from "../../../data/types";
import { useStarPlayer } from "./starPlayerProvider";

const StarButton = React.memo(function ({ metadata }: { metadata: PlayerMetadata }) {
  const { t } = useTranslation();
  const { refreshAndGetIsPlayerStarred, starPlayer, unstarPlayer } = useStarPlayer();
  const isStarred = useMemo(() => refreshAndGetIsPlayerStarred(metadata), [metadata, refreshAndGetIsPlayerStarred]);
  return isStarred ? (
    <Button startIcon={<Star />} disableElevation variant="outlined" onClick={() => unstarPlayer(metadata)}>
      {t("已收藏")}
    </Button>
  ) : (
    <Button startIcon={<StarBorder />} onClick={() => starPlayer(metadata)}>
      {t("收藏")}
    </Button>
  );
});
export default StarButton;
