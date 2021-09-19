/* eslint-disable @typescript-eslint/indent */
import React from "react";
import { Link } from "react-router-dom";

import { CareerRankingItem, CareerRankingType } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getCareerRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { LevelWithDelta, GameMode } from "../../data/types";
import { formatPercent } from "../../utils/index";
import { ModelModeSelector, useModel } from "../modeModel";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";
import { CheckboxGroup } from "../form";

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
    <table className="table table-striped">
      <thead>
        <tr>
          <th className="text-right">{t("排名")}</th>
          <th>{t("玩家")}</th>
          {showNumGames && <th className="text-right">{t("对局数")}</th>}
          {extraColumns.map((x) => (
            <th className="text-right" key={x.label}>
              {t(x.label)}
            </th>
          ))}
          <th className="text-right">{valueLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((x, index) => (
          <tr key={x.id}>
            <td className="text-right">{index + 1}</td>
            <td>
              <Link to={generatePlayerPathById(x.id)}>
                [{LevelWithDelta.getTag(x.level)}] {x.nickname}
              </Link>
            </td>
            {showNumGames && <td className="text-right">{x.count}</td>}
            {extraColumns.map((col) => (
              <td className="text-right" key={col.label}>
                {col.value(x)}
              </td>
            ))}
            <td className="text-right">{formatter(x.rank_key, x, modes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
    <div className="col-lg">
      <h3 className="text-center mb-2">{t(title)}</h3>
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
        <p className="text-center mt-4">{t("请选择模式")}</p>
      )}
    </div>
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
    <div className="row">
      {children.map((x, i) => (
        <React.Fragment key={i}>{x}</React.Fragment>
      ))}
    </div>
  );
}
export function CareerRanking({
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
      <div className="row mb-2">
        <div className="col">
          <CheckboxGroup
            type="radio"
            groupKey="MinGamesSelector"
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
        </div>
      </div>
      <ModelModeSelector
        type="checkbox"
        availableModes={Conf.features.ranking || []}
        allowedCombinations={Conf.features.rankingGroups}
      />
      <CareerRankingPlain>{children}</CareerRankingPlain>
    </>
  );
}
