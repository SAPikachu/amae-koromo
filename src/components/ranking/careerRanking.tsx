import React from "react";
import { Link } from "react-router-dom";

import { CareerRankingItem, CareerRankingType } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getCareerRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { LevelWithDelta } from "../../data/types";
import { useState } from "react";
import { ModeSelector } from "../gameRecords/modeSelector";
import { formatPercent } from "../../utils/index";
import { Alert } from "../misc/alert";

function RankingTable({ rows = [] as CareerRankingItem[] }) {
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
            <td className="text-right">{formatPercent(x.rank_key)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CareerRanking() {
  const [modeId, setModeId] = useState("");
  const dataRank1 = useAsyncFactory(() => getCareerRanking(CareerRankingType.Rank1, modeId), [modeId]);
  const dataRank12 = useAsyncFactory(() => getCareerRanking(CareerRankingType.Rank12, modeId), [modeId]);
  const dataRank123 = useAsyncFactory(() => getCareerRanking(CareerRankingType.Rank123, modeId), [modeId]);
  return (
    <>
      <Alert stateName="careerRankingNotice">
        <h4 className="mb-2">提示</h4>
        本榜只包含进行过至少 300 场对局的玩家
      </Alert>
      <div className="row mb-3">
        <div className="col">
          <ModeSelector mode={modeId} onChange={setModeId} />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-4">
          <h3 className="text-center">一位率</h3>
          <RankingTable rows={dataRank1} />;
        </div>
        <div className="col-lg-4">
          <h3 className="text-center">连对率</h3>
          <RankingTable rows={dataRank12} />;
        </div>
        <div className="col-lg-4">
          <h3 className="text-center">避四率</h3>
          <RankingTable rows={dataRank123} />;
        </div>
      </div>
    </>
  );
}
