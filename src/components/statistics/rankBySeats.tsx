import React from "react";
import { useAsyncFactory } from "../../utils/async";
import { getRankRateBySeat } from "../../data/source/misc";
import Loading from "../misc/loading";
import { useMemo } from "react";
import { useModel, ModelModeSelector } from "../modeModel";
import SimplePieChart from "../charts/simplePieChart";
import { useTranslation } from "react-i18next";
import { RankRates } from "../../data/types";
import Conf from "../../utils/conf";
import { Grid, Typography } from "@mui/material";

const SEAT_LABELS = "东南西北";

function Chart({ rates, numGames, aspect = 1 }: { rates: RankRates; numGames: number; aspect?: number }) {
  const { t } = useTranslation();
  const items = useMemo(
    () =>
      rates.map((x, index) => ({
        value: x,
        outerLabel: t(SEAT_LABELS[index]),
        innerLabel: `${(x * 100).toFixed(2)}%\n[${Math.round(x * numGames)}]`,
      })),
    [rates, numGames, t]
  );
  return <SimplePieChart aspect={aspect} items={items} />;
}

export default function RankBySeats() {
  const { t } = useTranslation();
  const data = useAsyncFactory(getRankRateBySeat, [], "getRankRateBySeat");
  const [model] = useModel();
  if (!data) {
    return <Loading />;
  }
  const selectedData = Conf.availableModes.length
    ? model.selectedModes && model.selectedModes.length && data[model.selectedModes[0]]
    : data[0];
  return (
    <>
      <ModelModeSelector autoSelectFirst={true} />
      {selectedData ? (
        <>
          <Grid container mt={2}>
            <Grid item xs={12} sm overflow="hidden">
              <Typography variant="h5" textAlign="center">
                {t("坐席吃一率")}
              </Typography>
              <Chart rates={selectedData[1]} numGames={selectedData.numGames} />
            </Grid>
            <Grid item xs={12} sm overflow="hidden">
              <Typography variant="h5" textAlign="center">
                {t(`坐席吃${selectedData.length > 4 ? "四" : "三"}率`)}
              </Typography>
              <Chart rates={selectedData[selectedData.length - 1]} numGames={selectedData.numGames} />
            </Grid>
          </Grid>
          <Typography textAlign="right">
            {t("统计对战数：")}
            {selectedData.numGames}
          </Typography>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
