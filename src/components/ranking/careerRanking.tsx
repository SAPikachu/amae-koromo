import React from "react";
import { Link } from "react-router-dom";

import { CareerRankingItem, CareerRankingType } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getCareerRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { LevelWithDelta } from "../../data/types";
import { formatPercent } from "../../utils/index";
import { Alert } from "../misc/alert";
import { useModel } from "../modeModel";
import { useTranslation } from "react-i18next";

function RankingTable({
  rows = [] as CareerRankingItem[],
  formatter = formatPercent as (x: number) => string,
  showNumGames = true,
  valueLabel = ""
}) {
  const { t } = useTranslation();
  if (!rows || !rows.length) {
    return <Loading />;
  }
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th className="text-right">{t("排名")}</th>
          <th>{t("玩家")}</th>
          {showNumGames && <th className="text-right">{t("对局数")}</th>}
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
            <td className="text-right">{formatter(x.rank_key)}</td>
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
  disableMixedMode = false
}: {
  type: CareerRankingType;
  title: string;
  formatter?: (x: number) => string;
  showNumGames?: boolean;
  valueLabel?: string;
  disableMixedMode?: boolean;
}) {
  const { t } = useTranslation();
  const [model] = useModel();
  const modeId = model.selectedMode;
  const isMixedMode = !modeId || modeId === "0";
  const data = useAsyncFactory(() => getCareerRanking(type, modeId), [type, modeId], "getCareerRanking");
  return (
    <div className="col-lg">
      <h3 className="text-center mb-2">{t(title)}</h3>
      {!disableMixedMode || !isMixedMode ? (
        <RankingTable
          rows={data}
          formatter={formatter}
          valueLabel={t(valueLabel || title)}
          showNumGames={showNumGames}
        />
      ) : (
        <p className="text-center mt-4">{t("请选择模式")}</p>
      )}
    </div>
  );
}
export function CareerRanking({
  children
}: {
  children: React.ReactElement<ReturnType<typeof CareerRankingColumn>>[];
}) {
  const { t } = useTranslation();
  return (
    <>
      <Alert stateName="careerRankingNotice">
        <h4 className="mb-2">{t("提示")}</h4>
        {t("本榜只包含有至少 300 场对局记录的玩家")}
      </Alert>
      <div className="row">
        {children.map((x, i) => (
          <React.Fragment key={i}>{x}</React.Fragment>
        ))}
      </div>
    </>
  );
}
