import { useTranslation } from "react-i18next";

import { FilterPanel } from "./filterPanel";
import { PlayerSearch } from "./playerSearch";
import { Box, Typography } from "@mui/material";
import Loadable from "../misc/customizedLoadable";

const GameRecordTableHomeView = Loadable({
  loader: () => import("./tableViews").then((x) => ({ default: x.GameRecordTableHomeView })),
});

export default function Home() {
  const { t } = useTranslation("form");
  return (
    <>
      <Typography variant="h4" mb={3} textAlign="center">
        {t("查找玩家")}
      </Typography>
      <Box mb={5}>
        <PlayerSearch />
      </Box>
      <Typography variant="h4" mb={3} textAlign="center">
        {t("对局浏览")}
      </Typography>
      <Box mb={5}>
        <FilterPanel />
      </Box>
      <GameRecordTableHomeView />
    </>
  );
}
