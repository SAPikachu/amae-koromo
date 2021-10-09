import { useTranslation } from "react-i18next";

import { FilterPanel } from "./filterPanel";
import { PlayerSearch } from "./playerSearch";
import { default as GameRecordTable } from "./table";
import { COLUMN_GAMEMODE, COLUMN_PLAYERS, COLUMN_STARTTIME, COLUMN_ENDTIME } from "./columns";
import { Box, Typography } from "@mui/material";

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
      <GameRecordTable columns={[COLUMN_GAMEMODE, COLUMN_PLAYERS(), COLUMN_STARTTIME, COLUMN_ENDTIME]} />
    </>
  );
}
