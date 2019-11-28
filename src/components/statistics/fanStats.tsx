import React from "react";

import { useAsyncFactory, formatPercent } from "../../utils/index";
import { getFanStats } from "../../data/source/misc";
import Loading from "../misc/loading";
import { GameMode } from "../../data/types";

export default function FanStats() {
  const data = useAsyncFactory(getFanStats, [], "getFanStats");
  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="row">
        {Object.entries(data).map(([modeId, value]) => (
          <div className="col" key={modeId}>
            <h2 className="text-center">{modeId === "0" ? "全部" : GameMode[parseInt(modeId)]}</h2>
            <p className="text-center">记录和出局数：{value.count}</p>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>役</th>
                  <th className="text-right">记录数</th>
                  <th className="text-right">比率</th>
                </tr>
              </thead>
              <tbody>
                {value.entries.map(x => (
                  <tr key={x.label}>
                    <td>{x.label}</td>
                    <td className="text-right">{x.count}</td>
                    <td className="text-right">{formatPercent(x.count / value.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
