import React from "react";

import { useAsyncFactory, formatPercent, formatFixed3 } from "../../utils/index";
import { getGlobalStatistics } from "../../data/source/misc";
import Loading from "../misc/loading";
import { useModel } from "../modeModel/model";
import { Level } from "../../data/types/level";

const HEADERS = [
  "等级",
  "一位率",
  "二位率",
  "三位率",
  "四位率",
  "被飞率",
  "平均顺位",
  "和牌率",
  "放铳率",
  "副露率",
  "立直率",
  "自摸率",
  "流局率",
  "流听率",
  "对战数",
  "在位记录"
];

export default function DataByRank() {
  const data = useAsyncFactory(getGlobalStatistics, []);
  const [model] = useModel();
  if (!data) {
    return <Loading />;
  }
  const modeData = Object.entries(data[model.selectedMode || "0"]);
  modeData.sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <table className="table table-responsive-xl table-striped table-sm table-hover text-center">
      <thead className="vertical-table-header">
        <tr>
          {HEADERS.map(x => (
            <th key={x}>
              <div>{x}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {modeData.map(([levelId, levelData]) => (
          <tr key={levelId}>
            <td className="text-nowrap">{new Level(parseInt(levelId)).getTag()}</td>
            {levelData.basic.rank_rates.map((x, i) => (
              <td key={i}>{formatPercent(x)}</td>
            ))}
            <td>{formatPercent(levelData.basic.negative_rate)}</td>
            <td>{formatFixed3(levelData.basic.avg_rank)}</td>
            <td>{formatPercent(levelData.extended.和牌率)}</td>
            <td>{formatPercent(levelData.extended.放铳率)}</td>
            <td>{formatPercent(levelData.extended.副露率)}</td>
            <td>{formatPercent(levelData.extended.立直率)}</td>
            <td>{formatPercent(levelData.extended.自摸率)}</td>
            <td>{formatPercent(levelData.extended.流局率)}</td>
            <td>{formatPercent(levelData.extended.流听率)}</td>
            <td>{levelData.basic.count}</td>
            <td>{levelData.num_players}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
