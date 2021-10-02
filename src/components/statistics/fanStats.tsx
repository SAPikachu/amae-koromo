import React from "react";

import { useAsyncFactory, formatPercent } from "../../utils/index";
import { getFanStats } from "../../data/source/misc";
import Loading from "../misc/loading";
import { FanStatEntry, FanStats, GameMode, modeLabelNonTranslated } from "../../data/types";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const SORTERS: (undefined | ((a: FanStatEntry, b: FanStatEntry) => number))[] = [
  undefined,
  (a, b) => a.count - b.count,
  (a, b) => b.count - a.count,
];

export default function FanStatsView() {
  const { t } = useTranslation();
  const data = useAsyncFactory(getFanStats, [], "getFanStats");
  const [sorterIndex, setSorterIndex] = useState(0);
  const sortedData = useMemo((): FanStats | undefined => {
    if (!data) {
      return undefined;
    }
    if (!SORTERS[sorterIndex]) {
      return data;
    }
    const ret = { ...data };
    for (const key of Object.keys(ret)) {
      ret[key] = {
        ...ret[key],
        entries: [...ret[key].entries].sort(SORTERS[sorterIndex]),
      };
    }
    return ret;
  }, [data, sorterIndex]);
  if (!sortedData) {
    return <Loading />;
  }
  return (
    <>
      <Grid container spacing={2} rowSpacing={3} mt={2}>
        {Object.entries(sortedData)
          .map(([modeId, value]) => [parseInt(modeId, 10) as GameMode, value] as [GameMode, typeof value])
          .sort(([id1], [id2]) => Conf.availableModes.indexOf(id1) - Conf.availableModes.indexOf(id2))
          .map(([mode, value]) => (
            <Grid item lg={4} md={6} xs={12} key={mode}>
              <Typography variant="h5" textAlign="center">
                {t(modeLabelNonTranslated(mode))}
              </Typography>
              <Typography textAlign="center" mt={1}>
                {t("记录和出局数：")}
                {value.count}
              </Typography>
              <TableContainer sx={{ mt: 1 }}>
                <Table>
                  <TableHead
                    onClick={() => setSorterIndex((sorterIndex + 1) % SORTERS.length)}
                    className="cursor-pointer"
                  >
                    <TableRow>
                      <TableCell>{t("役")}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{t("记录数")}</TableCell>
                      <TableCell sx={{ textAlign: "right" }}>{t("比率")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {value.entries.map((x) => (
                      <TableRow key={x.label}>
                        <TableCell>{t(x.label)}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{x.count}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>
                          {x.count
                            ? x.count / value.count < 0.0001
                              ? "<0.01%"
                              : formatPercent(x.count / value.count)
                            : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          ))}
      </Grid>
    </>
  );
}
