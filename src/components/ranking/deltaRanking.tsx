import { DeltaRankingItem, RankingTimeSpan } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getDeltaRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { LevelWithDelta } from "../../data/types";
import { useModel, ModelModeSelector } from "../modeModel";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";
import {
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

export default function DeltaRanking() {
  const { t } = useTranslation();
  const data1w = useAsyncFactory(
    () => getDeltaRanking(RankingTimeSpan.OneWeek),
    [],
    "getDeltaRanking(RankingTimeSpan.OneWeek)"
  );
  const data4w = useAsyncFactory(
    () => getDeltaRanking(RankingTimeSpan.FourWeeks),
    [],
    "getDeltaRanking(RankingTimeSpan.FourWeeks)"
  );
  const [model] = useModel();
  const modes = model.selectedModes;
  const modeKey = modes.length !== 1 ? 0 : modes[0];
  if (!data1w || !data4w) {
    return <Loading />;
  }
  return (
    <>
      <ModelModeSelector
        type="checkbox"
        availableModes={Conf.features.ranking || []}
        allowedCombinations={Conf.features.rankingGroups}
      />
      <GridContainer>
        <Grid item xs={12} lg={6}>
          <Title variant="h4">{t("苦主榜")}</Title>
          <GridContainer>
            <Grid item xs={12} md={6}>
              <Title variant="h5">{t("一周")}</Title>
              <RankingTable rows={data1w[modeKey].bottom} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Title variant="h5">{t("四周")}</Title>
              <RankingTable rows={data4w[modeKey].bottom} />
            </Grid>
          </GridContainer>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Title variant="h4">{t("汪汪榜")}</Title>
          <GridContainer>
            <Grid item xs={12} md={6}>
              <Title variant="h5">{t("一周")}</Title>
              <RankingTable rows={data1w[modeKey].top} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Title variant="h5">{t("四周")}</Title>
              <RankingTable rows={data4w[modeKey].top} />
            </Grid>
          </GridContainer>
        </Grid>
      </GridContainer>
    </>
  );
}
