import React from "react";
import { Link } from "react-router-dom";

import { DeltaRankingItem, RankingTimeSpan } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getDeltaRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { LevelWithDelta } from "../../data/types";
import { useModel } from "../modeModel";
import { useTranslation } from "react-i18next";

function RankingTable({ rows = [] as DeltaRankingItem[] }) {
  return (
    <table className="table table-striped">
      <tbody>
        {rows.map(x => (
          <tr key={x.id}>
            <td>
              <Link to={generatePlayerPathById(x.id)}>
                [{LevelWithDelta.getTag(x.level)}] {x.nickname}
              </Link>
            </td>
            <td className="text-right">{x.delta}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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
      <div className="row">
        <div className="col-lg-6">
          <h3 className="text-center">{t("苦主榜")}</h3>
          <div className="row">
            <div className="col-md-6">
              <h4 className="text-center">{t("一周")}</h4>
              <RankingTable rows={data1w[modeKey].bottom} />
            </div>
            <div className="col-md-6">
              <h4 className="text-center">{t("四周")}</h4>
              <RankingTable rows={data4w[modeKey].bottom} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <h3 className="text-center">{t("汪汪榜")}</h3>
          <div className="row">
            <div className="col-md-6">
              <h4 className="text-center">{t("一周")}</h4>
              <RankingTable rows={data1w[modeKey].top} />
            </div>
            <div className="col-md-6">
              <h4 className="text-center">{t("四周")}</h4>
              <RankingTable rows={data4w[modeKey].top} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
