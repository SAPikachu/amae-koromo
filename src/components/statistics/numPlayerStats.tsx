import { Box, Grid, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getLevelStatistics } from "../../data/source/misc";
import { getZoneTag, Level, LevelStatistics, LevelStatisticsItem } from "../../data/types";
import { formatPercent } from "../../utils";
import { useAsyncFactory } from "../../utils/async";
import SimplePieChart, { PieChartItem } from "../charts/simplePieChart";
import Loading from "../misc/loading";

function groupData(
  raw: LevelStatistics,
  getLabel: (x: LevelStatisticsItem) => string,
  getKey = getLabel
): (PieChartItem & { percent: string; key: string })[] {
  const map = new Map<string, LevelStatisticsItem[]>();
  const labels: string[] = [];
  for (const item of raw) {
    const key = getKey(item);
    const list = map.get(key) || [];
    list.push(item);
    if (!map.has(key)) {
      map.set(key, list);
      labels.push(key);
    }
  }
  const items = labels.map((key) => ({
    value:
      map
        .get(key)
        ?.map((x) => x[2])
        .reduce((a, b) => a + b, 0) || 0,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    label: getLabel(map.get(key)![0]!),
    key,
  }));
  const total = items.reduce((a, b) => a + b.value, 0);
  return items.map((x) => ({
    key: x.key,
    value: x.value,
    percent: formatPercent(x.value / total),
    innerLabel: x.label.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => ({ value: x.value, percentage: formatPercent(x.value / total) }[key as string] as string)
    ),
  }));
}

export default function NumPlayerStats() {
  const { t } = useTranslation();
  const data = useAsyncFactory(getLevelStatistics, [], "getLevelStatistics");
  const serverStats = useMemo(
    () =>
      data
        ? groupData(
            data,
            (x) => `${getZoneTag(x[0])} {{value}} / {{percentage}}`,
            (x) => x[0].toString()
          )
        : [],
    [data]
  );
  const [selectedServer, setSelectedServer] = useState(null as null | typeof serverStats[0]);
  const levelStats = useMemo(() => {
    if (!data) {
      return [];
    }
    const filteredData = selectedServer ? data.filter((x) => x[0].toString() === selectedServer.key) : data;
    const majorLevelHandled = new Map<string, { count: number; entries: number }>();
    return groupData(filteredData, (x) => new Level(x[1]).getTag()).map(
      (x: ReturnType<typeof groupData>[0] & { majorLevel?: { count: number; entries: number } }) => {
        const majorLevel = x.innerLabel?.replace(/\d+$/, "");
        if (majorLevel) {
          const record = majorLevelHandled.get(majorLevel) || { count: 0, entries: 0 };
          if (!record.count) {
            x.majorLevel = record;
            majorLevelHandled.set(majorLevel, record);
          }
          record.count += x.value;
          record.entries++;
        }
        return x;
      }
    );
  }, [data, selectedServer]);
  if (!data) {
    return <Loading />;
  }
  const total = levelStats.reduce((a, b) => a + b.value, 0);
  return (
    <Grid container mt={4}>
      <Grid item xs={12} lg overflow="hidden">
        <Typography variant="h5" textAlign="center">
          {t("按服务器")}
        </Typography>
        <Box maxWidth={576} marginX="auto" my={3}>
          <SimplePieChart onSelect={setSelectedServer} pieProps={{ outerRadius: "95%" }} items={serverStats} />
        </Box>
      </Grid>
      <Grid item xs={12} lg overflow="hidden">
        <Typography variant="h5" textAlign="center">
          {t("按等级")}
        </Typography>
        <Box mt={4}>
          <Table sx={{ "td:not(:first-child)": { textAlign: "right" } }}>
            <TableBody>
              {levelStats.map((x) => (
                <TableRow key={x.innerLabel}>
                  <TableCell>{x.innerLabel}</TableCell>
                  <TableCell>{x.value}</TableCell>
                  <TableCell>{x.percent}</TableCell>
                  {x.majorLevel &&
                    ((x.majorLevel?.entries || 0) > 1 ? (
                      <>
                        <TableCell rowSpan={x.majorLevel?.entries}>{x.majorLevel?.count}</TableCell>
                        <TableCell rowSpan={x.majorLevel?.entries}>
                          {formatPercent((x.majorLevel?.count || 0) / total)}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell colSpan={2} />
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Grid>
    </Grid>
  );
}
