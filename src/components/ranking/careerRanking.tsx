/* eslint-disable @typescript-eslint/indent */
import React from "react";

import { CareerRankingItem, CareerRankingType } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getCareerRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routeUtils";
import { LevelWithDelta, GameMode } from "../../data/types";
import { formatPercent } from "../../utils/index";
import { ModelModeProvider, ModelModeSelector, useModel } from "../modeModel";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";
import { CheckboxGroup } from "../form";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Link,
} from "@mui/material";

type ExtraColumnInternal = {
  label: string;
  value: (item: CareerRankingItem) => string;
};

type ExtraColumn = {
  label: string;
  value: (item: CareerRankingItem, mode: GameMode[]) => string;
};

function RankingTable({
  rows = null as CareerRankingItem[] | null,
  formatter = formatPercent as (x: number, item: CareerRankingItem, modes: GameMode[]) => string,
  showNumGames = true,
  valueLabel = "",
  extraColumns = [] as ExtraColumnInternal[],
  modes = [] as GameMode[],
}) {
  const { t } = useTranslation();
  if (!rows) {
    return <Loading />;
  }
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ textAlign: "right" }}>{t("排名")}</TableCell>
            <TableCell>{t("玩家")}</TableCell>
            {showNumGames && <TableCell sx={{ textAlign: "right" }}>{t("对局数")}</TableCell>}
            {extraColumns.map((x) => (
              <TableCell sx={{ textAlign: "right" }} key={x.label}>
                {t(x.label)}
              </TableCell>
            ))}
            <TableCell sx={{ textAlign: "right" }}>{valueLabel}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((x, index) => (
            <TableRow key={x.id}>
              <TableCell sx={{ textAlign: "right" }}>{index + 1}</TableCell>
              <TableCell>
                <Link href={generatePlayerPathById(x.id)}>
                  [{LevelWithDelta.getTag(x.level)}] {x.nickname}
                </Link>
              </TableCell>
              {showNumGames && <TableCell sx={{ textAlign: "right" }}>{x.count}</TableCell>}
              {extraColumns.map((col) => (
                <TableCell sx={{ textAlign: "right" }} key={col.label}>
                  {col.value(x)}
                </TableCell>
              ))}
              <TableCell sx={{ textAlign: "right" }}>{formatter(x.rank_key, x, modes)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CareerRankingColumn({
  type,
  title,
  formatter = formatPercent,
  showNumGames = true,
  valueLabel = "",
  disableMixedMode = false,
  extraColumns = [],
  forceMode = undefined,
}: {
  type: CareerRankingType;
  title: string;
  formatter?: (x: number, item: CareerRankingItem, modes: GameMode[]) => string;
  showNumGames?: boolean;
  valueLabel?: string;
  disableMixedMode?: boolean;
  extraColumns?: ExtraColumn[];
  forceMode?: undefined | GameMode | number;
}) {
  const { t } = useTranslation();
  const [model] = useModel();
  const modes = forceMode === undefined ? model.selectedModes.sort((a, b) => a - b) : [forceMode];
  const isMixedMode = modes.length !== 1;
  const data = useAsyncFactory(
    () => getCareerRanking(type, modes.join("."), model.careerRankingMinGames),
    [type, model],
    `getCareerRanking-${modes.join(".")}-${model.careerRankingMinGames || 300}`
  );
  return (
    <>
      <Typography textAlign="center" mb={2} variant="h5">
        {t(title)}
      </Typography>
      {!disableMixedMode || !isMixedMode ? (
        <RankingTable
          rows={data}
          formatter={formatter}
          valueLabel={t(valueLabel || title)}
          showNumGames={showNumGames}
          modes={model.selectedModes}
          extraColumns={extraColumns.map((x) => ({ ...x, value: (item) => x.value(item, modes) }))}
        />
      ) : (
        <Box textAlign="center" mt={4}>
          {t("请选择模式")}
        </Box>
      )}
    </>
  );
}
export function CareerRankingPlain({
  children,
}: {
  children:
    | React.ReactElement<ReturnType<typeof CareerRankingColumn>>
    | React.ReactElement<ReturnType<typeof CareerRankingColumn>>[];
}) {
  if (!("length" in children)) {
    children = [children];
  }
  return (
    <Grid container spacing={2} rowSpacing={3}>
      {children.map((x, i) => (
        <Grid item xs={12} md={6} lg key={i}>
          {x}
        </Grid>
      ))}
    </Grid>
  );
}
function CareerRankingInner({
  children,
}: {
  children:
    | React.ReactElement<ReturnType<typeof CareerRankingColumn>>
    | React.ReactElement<ReturnType<typeof CareerRankingColumn>>[];
}) {
  const [model, updateModel] = useModel();
  const { t } = useTranslation();
  if (!("length" in children)) {
    children = [children];
  }
  return (
    <>
      <CheckboxGroup
        type="radio"
        items={[
          { key: "300", value: 300, label: "300 " + t("局") },
          { key: "600", value: 600, label: "600 " + t("局") },
          { key: "1000", value: 1000, label: "1000 " + t("局") },
        ]}
        selectedItems={[(model.careerRankingMinGames || 300).toString()]}
        onChange={(newItems) => {
          updateModel({ careerRankingMinGames: newItems[0].value });
        }}
      />
      <ModelModeSelector
        type="checkbox"
        availableModes={Conf.features.ranking || []}
        allowedCombinations={Conf.features.rankingGroups}
      />
      <CareerRankingPlain>{children}</CareerRankingPlain>
    </>
  );
}

export function CareerRanking({
  children,
}: {
  children:
    | React.ReactElement<ReturnType<typeof CareerRankingColumn>>
    | React.ReactElement<ReturnType<typeof CareerRankingColumn>>[];
}) {
  return (
    <ModelModeProvider>
      <CareerRankingInner>{children}</CareerRankingInner>
    </ModelModeProvider>
  );
}
