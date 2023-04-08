import { DeltaRankingItem, RankingTimeSpan } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils/async";
import { getDeltaRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routeUtils";
import { GameMode, LevelWithDelta } from "../../data/types";
import { useModel, ModelModeSelector, ModelModeProvider } from "../modeModel";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Link,
  TypographyProps,
  GridProps,
} from "@mui/material";
import { useState } from "react";
import { CheckboxGroup } from "../form";

function RankingTable({ rows = [] as DeltaRankingItem[] }) {
  return (
    <TableContainer>
      <Table>
        <TableBody>
          {rows.map((x) => (
            <TableRow key={x.id}>
              <TableCell>
                <Link href={generatePlayerPathById(x.id)}>
                  [{LevelWithDelta.getTag(x.level)}] {x.nickname}
                </Link>
              </TableCell>
              <TableCell sx={{ textAlign: "right" }}>{x.delta}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const Title = (props: TypographyProps) => <Typography mb={1} textAlign="center" {...props} />;
const GridContainer = (props: GridProps) => <Grid container spacing={2} rowSpacing={3} {...props} />;

function DeltaRankingInner() {
  const { t } = useTranslation();
  const [selectedTimeSpan, setSelectedTimeSpan] = useState(RankingTimeSpan.FourWeeks);
  const data = useAsyncFactory(
    () => getDeltaRanking(selectedTimeSpan),
    [selectedTimeSpan],
    "getDeltaRanking_" + selectedTimeSpan
  );
  const [model] = useModel();
  const modes = model.selectedModes;
  const modeKey = modes.length !== 1 ? 0 : modes[0];
  const availableModes = (
    data
      ? Object.keys(data)
          .filter((x) => x !== "0")
          .map((x) => parseInt(x, 10) as GameMode)
      : []
  ).sort((a, b) => Conf.availableModes.indexOf(a) - Conf.availableModes.indexOf(b));
  return (
    <>
      <CheckboxGroup
        type="radio"
        items={[
          { key: RankingTimeSpan.FourWeeks, value: RankingTimeSpan.FourWeeks, label: t("四周") },
          { key: RankingTimeSpan.OneWeek, value: RankingTimeSpan.OneWeek, label: t("一周") },
          { key: RankingTimeSpan.ThreeDays, value: RankingTimeSpan.ThreeDays, label: t("三天") },
          { key: RankingTimeSpan.OneDay, value: RankingTimeSpan.OneDay, label: t("一天") },
        ]}
        selectedItems={[selectedTimeSpan]}
        onChange={(newItems) => {
          setSelectedTimeSpan(newItems[0].value);
        }}
      />
      <Box visibility={data ? "visible" : "hidden"} mb={2}>
        <ModelModeSelector type="checkbox" availableModes={availableModes} allowedCombinations={[availableModes]} />
      </Box>
      {data ? (
        <GridContainer>
          <Grid item xs={12} md={4}>
            <Title variant="h4">{t("苦主榜")}</Title>
            <RankingTable rows={data[modeKey].bottom} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Title variant="h4">{t("汪汪榜")}</Title>
            <RankingTable rows={data[modeKey].top} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Title variant="h4">{t("劳模榜")}</Title>
            <RankingTable rows={data[modeKey].num_games} />
          </Grid>
        </GridContainer>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default function DeltaRanking() {
  return (
    <ModelModeProvider>
      <DeltaRankingInner />
    </ModelModeProvider>
  );
}
