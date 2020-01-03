import React from "react";
import { PlayerExtendedStats } from "../../../data/types";
import SimplePieChart, { PieChartItem } from "../../charts/simplePieChart";
import { sum } from "../../../utils";
import { formatPercent } from "../../../utils/index";
import { useMemo } from "react";

function buildItems(stats: PlayerExtendedStats, keys: (keyof PlayerExtendedStats)[], labels: string[]): PieChartItem[] {
  const total = sum(keys.map(key => stats[key] as number));
  return keys.map((key, index) => ({
    value: stats[key] as number,
    outerLabel: labels[index],
    innerLabel: formatPercent((stats[key] as number) / total)
  }));
}

export default function WinLoseDistribution({ stats }: { stats: PlayerExtendedStats }) {
  const winData = useMemo(() => buildItems(stats, ["立直和了", "副露和了", "默听和了"], ["立直", "副露", "默听"]), [
    stats
  ]);
  const loseData = useMemo(
    () => buildItems(stats, ["放铳至立直", "放铳至副露", "放铳至默听"], ["立直", "副露", "默听"]),
    [stats]
  );
  return (
    <div className="row">
      <div className="col-lg-6">
        <h5 className="text-center mb-n3">和牌时</h5>
        <SimplePieChart aspect={3 / 2} items={winData} startAngle={-45} innerLabelFontSize="0.85rem" />
      </div>
      <div className="col-lg-6">
        <h5 className="text-center mb-n3">放铳至</h5>
        <SimplePieChart aspect={3 / 2} items={loseData} startAngle={-45} innerLabelFontSize="0.85rem" />
      </div>
    </div>
  );
}
