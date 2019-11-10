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

function RankingTable({ rows = [] as CareerRankingItem[], formatter = formatPercent as (x: number) => string }) {
  if (!rows || !rows.length) {
    return <Loading />;
  }
  return (
    <table className="table table-striped">
      <tbody>
        {rows.map((x, index) => (
          <tr key={x.id}>
            <td>{index + 1}</td>
            <td>
              <Link to={generatePlayerPathById(x.id)}>
                [{LevelWithDelta.getTag(x.level)}] {x.nickname}
              </Link>
            </td>
            <td className="text-right">{formatter(x.rank_key)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CareerRanking() {
  const [model] = useModel();
  const modeId = model.selectedMode;
  const dataRank1 = useAsyncFactory(() => getCareerRanking(CareerRankingType.Rank1, modeId), [modeId]);
  const dataRank12 = useAsyncFactory(() => getCareerRanking(CareerRankingType.Rank12, modeId), [modeId]);
  const dataRank4 = useAsyncFactory(() => getCareerRanking(CareerRankingType.Rank4, modeId), [modeId]);
  return (
    <>
      <Alert stateName="careerRankingNotice">
        <h4 className="mb-2">提示</h4>
        本榜只包含有至少 300 场对局记录的玩家
      </Alert>
      <div className="row">
        <div className="col-lg">
          <h3 className="text-center">一位率</h3>
          <RankingTable rows={dataRank1} />;
        </div>
        <div className="col-lg">
          <h3 className="text-center">连对率</h3>
          <RankingTable rows={dataRank12} />;
        </div>
        <div className="col-lg">
          <h3 className="text-center">四位率</h3>
          <RankingTable rows={dataRank4} />;
        </div>
      </div>
    </>
  );
}
