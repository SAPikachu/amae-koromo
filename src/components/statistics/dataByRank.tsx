import { forwardRef, ReactElement, useMemo, useState, VFC } from "react";

import { formatPercent, formatFixed3 } from "../../utils/index";
import { useAsyncFactory } from "../../utils/async";
import { getGlobalStatistics, getGlobalStatisticsSnapshot, getGlobalStatisticsYear } from "../../data/source/misc";
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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  ToggleButtonProps,
  TooltipProps,
  tooltipClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "../form";
import dayjs from "dayjs";
import { CalendarToday } from "@mui/icons-material";
import { GameMode } from "../../data/types";

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

type TooltipToggleButtonProps = ToggleButtonProps & {
  TooltipProps: Omit<TooltipProps, "children">;
};

export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => {
  return <Tooltip {...props} classes={{ popper: className }} />;
})(() => ({
  [`& .${tooltipClasses.tooltip}.${tooltipClasses.tooltip}.${tooltipClasses.tooltip}.${tooltipClasses.tooltip}`]: {
    textAlign: "center",
  },
}));
const TooltipToggleButton: VFC<TooltipToggleButtonProps> = forwardRef(({ TooltipProps, ...props }, ref) => {
  return (
    <StyledTooltip {...TooltipProps}>
      <ToggleButton ref={ref} {...props} />
    </StyledTooltip>
  );
});

const dataLoaders = {
  overall: getGlobalStatistics,
  year: getGlobalStatisticsYear,
};

export default function DataByRank() {
  const { t } = useTranslation();
  const [model] = useModel();
  const [dataRange, setDataRange] = useState("overall" as keyof typeof dataLoaders | "date");
  const [cutoff] = useState(() => dayjs().startOf("day").add(-1, "day"));
  const [selectedDate, setSelectedDate] = useState(() => cutoff);
  const effectiveDataRange = useMemo(
    () => (dataRange === "overall" && selectedDate.isBefore(cutoff) ? "date" : dataRange),
    [dataRange, selectedDate, cutoff]
  );
  const factory = useMemo(
    () =>
      effectiveDataRange !== "date"
        ? dataLoaders[effectiveDataRange]
        : (modes: GameMode[]) => getGlobalStatisticsSnapshot(selectedDate, modes),
    [effectiveDataRange, selectedDate]
  );
  const modes = useMemo(
    () =>
      model.selectedModes
        .filter((x) => (Conf.features.statisticsSubPages.dataByRank || []).includes(x))
        .sort((a, b) => a - b),
    [model]
  );
  const data = useAsyncFactory(
    () => (modes && modes.length ? factory(modes) : Promise.resolve(null)),
    [modes, effectiveDataRange, selectedDate, factory],
    "getGlobalStatistics_" +
      effectiveDataRange +
      (effectiveDataRange === "date" ? selectedDate.format("YYYYMMDD") : "") +
      modes.join(".")
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
      <ToggleButtonGroup
        exclusive
        color="primary"
        onChange={(e, value) => value && value !== "date" && (setDataRange(value), setSelectedDate(cutoff))}
        value={effectiveDataRange}
        size="small"
      >
        <ToggleButton value="overall">{t("全体")}</ToggleButton>
        <TooltipToggleButton value="year" TooltipProps={{ title: t("一年内对局过的玩家的一年对局数据") || "" }}>
          {t("活跃玩家")}
        </TooltipToggleButton>
        <ToggleButton value="date">
          <DatePicker
            min="2020-10-13"
            max={cutoff}
            date={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setDataRange("overall");
            }}
            renderInput={({ inputRef, InputProps }) => (
              <Box
                ref={inputRef}
                onClick={(InputProps?.endAdornment as ReactElement)?.props?.children?.props?.onClick}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <CalendarToday />
                <Box ml={1}>
                  {effectiveDataRange === "date"
                    ? data?._lastModified?.format("YYYY-MM-DD") || "..."
                    : t("日期", { ns: "form" })}
                </Box>
              </Box>
            )}
          />
        </ToggleButton>
      </ToggleButtonGroup>
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
