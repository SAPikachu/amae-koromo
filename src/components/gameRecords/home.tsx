import { useTranslation } from "react-i18next";

import { FilterPanel } from "./filterPanel";
import { PlayerSearch } from "./playerSearch";
import { Box, Typography } from "@mui/material";
import Loadable from "../misc/customizedLoadable";
import Loading from "../misc/loading";

const GameRecordTableHomeView = Loadable<unknown, typeof import("./tableViews")>({
  loader: () => import("./tableViews"),
  loading: () => <Loading />,
  render(loaded, props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = loaded.GameRecordTableHomeView as any;
    return <Component {...props} />;
  },
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
