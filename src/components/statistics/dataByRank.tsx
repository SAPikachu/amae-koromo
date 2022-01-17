import { useMemo } from "react";

import { useAsyncFactory, formatPercent, formatFixed3 } from "../../utils/index";
import { getGlobalStatistics } from "../../data/source/misc";
import Loading from "../misc/loading";
import { useModel } from "../modeModel/model";
import { Level } from "../../data/types/level";
import { ModelModeSelector } from "../modeModel";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";
import {
  Box,
  Table,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableCellProps,
  TableBody,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const HEADERS = ["等级"].concat(["一位率", "二位率", "三位率", "四位率"].slice(0, Conf.rankColors.length), [
  "被飞率",
  "平均顺位",
  "和牌率",
  "放铳率",
  "副露率",
  "立直率",
  "自摸率",
  "流局率",
  "流听率",
  "对战数",
  "在位记录",
]);
const HEADERS2 = ["等级", "平均打点", "平均铳点", "打点效率", "铳点损失", "净打点效率"];

const TableCell = (props: TableCellProps) => (
  <MuiTableCell {...props} sx={{ textAlign: "center", padding: 1, ...props.sx }} />
);

const HeaderBox = styled(Box)({
  display: "inline",
  letterSpacing: "0.5em",
  writingMode: "vertical-lr",
  verticalAlign: "middle",
  ".lang-en &": {
    letterSpacing: "0.05em",
    marginBottom: "0.75em",
  },
});

export default function DataByRank() {
  const { t } = useTranslation();
  const [model] = useModel();
  const modes = useMemo(
    () =>
      model.selectedModes
        .filter((x) => (Conf.features.statisticsSubPages.dataByRank || []).includes(x))
        .sort((a, b) => a - b),
    [model]
  );
  const data = useAsyncFactory(
    () => (modes && modes.length ? getGlobalStatistics(modes) : Promise.resolve(null)),
    [modes],
    "getGlobalStatistics_" + modes.join(".")
  );
  const modeData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const selectedData = data[modes.join(".")];
    if (!selectedData) {
      return undefined;
    }
    const modeData = Object.entries(selectedData);
    if (!modeData) {
      return undefined;
    }
    modeData.sort((a, b) => a[0].localeCompare(b[0]));
    return modeData;
  }, [data, modes]);
  const haveNumPlayers = modeData && Object.values(modeData)[0][1].num_players;
  const headers = useMemo(() => (haveNumPlayers ? HEADERS : HEADERS.slice(0, HEADERS.length - 1)), [haveNumPlayers]);
  if (!Conf.features.statisticsSubPages.dataByRank) {
    return <></>;
  }
  return (
    <>
      <ModelModeSelector type="checkbox" availableModes={Conf.features.statisticsSubPages.dataByRank} autoSelectFirst />
      {modeData ? (
        <>
          <TableContainer sx={{ mt: 2 }}>
            <Table sx={{ textAlign: "center" }}>
              <TableHead>
                <TableRow sx={{ boxShadow: "none" }}>
                  {headers.map((x) => (
                    <TableCell key={x} sx={{ verticalAlign: "bottom", padding: "1em 0 0" }}>
                      <HeaderBox>{t(x)}</HeaderBox>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {modeData.map(([levelId, levelData]) => (
                  <TableRow key={levelId}>
                    <TableCell className="text-nowrap">{new Level(parseInt(levelId)).getTag()}</TableCell>
                    {levelData.basic.rank_rates.slice(0, Conf.rankColors.length).map((x, i) => (
                      <TableCell key={i}>{formatPercent(x)}</TableCell>
                    ))}
                    <TableCell>{formatPercent(levelData.basic.negative_rate)}</TableCell>
                    <TableCell>{formatFixed3(levelData.basic.avg_rank)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.和牌率)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.放铳率)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.副露率)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.立直率)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.自摸率)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.流局率)}</TableCell>
                    <TableCell>{formatPercent(levelData.extended.流听率)}</TableCell>
                    <TableCell>{levelData.basic.count}</TableCell>
                    {haveNumPlayers && <TableCell>{levelData.num_players}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer sx={{ mt: 2 }}>
            <Table sx={{ textAlign: "center" }}>
              <TableHead>
                <TableRow sx={{ boxShadow: "none" }}>
                  {HEADERS2.map((x) => (
                    <TableCell key={x}>{t(x)}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {modeData.map(([levelId, levelData]) => (
                  <TableRow key={levelId}>
                    <TableCell className="text-nowrap">{new Level(parseInt(levelId)).getTag()}</TableCell>
                    <TableCell>{levelData.extended.平均打点}</TableCell>
                    <TableCell>{levelData.extended.平均铳点}</TableCell>
                    <TableCell>{levelData.extended.打点效率}</TableCell>
                    <TableCell>{levelData.extended.铳点损失}</TableCell>
                    <TableCell>{levelData.extended.净打点效率}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography mt={2} textAlign="right">
            {t("统计对战数：")}
            {Math.floor(
              modeData.map(([, levelData]) => levelData.basic.count).reduce((a, b) => a + b, 0) / Conf.rankColors.length
            )}
          </Typography>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
