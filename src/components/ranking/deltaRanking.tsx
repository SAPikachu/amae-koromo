import React from "react";
import { Link } from "react-router-dom";

import { DeltaRankingItem, RankingTimeSpan } from "../../data/types/ranking";
import { useAsyncFactory } from "../../utils";
import { getDeltaRanking } from "../../data/source/misc";
import Loading from "../misc/loading";
import { generatePlayerPathById } from "../gameRecords/routes";
import { LevelWithDelta } from "../../data/types";
import { useModel } from "./model";

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
  const data1w = useAsyncFactory(() => getDeltaRanking(RankingTimeSpan.OneWeek), []);
  const data4w = useAsyncFactory(() => getDeltaRanking(RankingTimeSpan.FourWeeks), []);
  const [model] = useModel();
  const modeId = model.selectedMode;
  if (!data1w || !data4w) {
    return <Loading />;
  }
  return (
    <>
      <div className="row">
        <div className="col-lg-6">
          <h3 className="text-center">苦主榜</h3>
          <div className="row">
            <div className="col-md-6">
              <h4 className="text-center">一周</h4>
              <RankingTable rows={data1w[modeId || "0"].bottom} />
            </div>
            <div className="col-md-6">
              <h4 className="text-center">四周</h4>
              <RankingTable rows={data4w[modeId || "0"].bottom} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <h3 className="text-center">汪汪榜</h3>
          <div className="row">
            <div className="col-md-6">
              <h4 className="text-center">一周</h4>
              <RankingTable rows={data1w[modeId || "0"].top} />
            </div>
            <div className="col-md-6">
              <h4 className="text-center">四周</h4>
              <RankingTable rows={data4w[modeId || "0"].top} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
