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
import { useModel } from "./model";

function RankingTable({
  rows = [] as CareerRankingItem[],
  formatter = formatPercent as (x: number) => string,
  showNumGames = true,
  valueLabel = ""
}) {
  if (!rows || !rows.length) {
    return <Loading />;
  }
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th className="text-right">排名</th>
          <th>玩家</th>
          {showNumGames && <th className="text-right">对局数</th>}
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
  valueLabel = ""
}: {
  type: CareerRankingType;
  title: string;
  formatter?: (x: number) => string;
  showNumGames?: boolean;
  valueLabel?: string;
}) {
  const [model] = useModel();
  const modeId = model.selectedMode;
  const data = useAsyncFactory(() => getCareerRanking(type, modeId), [type, modeId]);
  return (
    <div className="col-lg">
      <h3 className="text-center mb-2">{title}</h3>
      <RankingTable rows={data} formatter={formatter} valueLabel={valueLabel || title} showNumGames={showNumGames} />;
    </div>
  );
}
export function CareerRanking({
  children
}: {
  children: React.ReactElement<ReturnType<typeof CareerRankingColumn>>[];
}) {
  return (
    <>
      <Alert stateName="careerRankingNotice">
        <h4 className="mb-2">提示</h4>
        本榜只包含有至少 300 场对局记录的玩家
      </Alert>
      <div className="row">
        {children.map((x, i) => (
          <React.Fragment key={i}>{x}</React.Fragment>
        ))}
      </div>
    </>
  );
}
