import React from "react";
import { PlayerExtendedStats, PlayerMetadata } from "../../../data/types";
import SimplePieChart, { PieChartItem } from "../../charts/simplePieChart";
import { sum } from "../../../utils";
import { formatPercent } from "../../../utils/index";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function buildItems(
  stats: PlayerExtendedStats,
  keys: (keyof PlayerExtendedStats)[],
  labels: string[],
  total = 0
): PieChartItem[] {
  total = total || sum(keys.map((key) => (stats[key] as number) || 0));
  return keys
    .map((key, index) => ({
      value: stats[key] as number,
      outerLabel: labels[index],
      innerLabel: formatPercent((stats[key] as number) / total),
    }))
    .filter((item) => item.value);
}

export default function WinLoseDistribution({ stats }: { stats: PlayerExtendedStats; metadata: PlayerMetadata }) {
  const { t } = useTranslation();
  const winData = useMemo(() => buildItems(stats, ["立直和了", "副露和了", "默听和了"], ["立直", "副露", "默听"]), [
    stats,
  ]);
  const loseData = useMemo(
    () => buildItems(stats, ["放铳至立直", "放铳至副露", "放铳至默听"], ["立直", "副露", "默听"]),
    [stats]
  );
  const loseSelfData = useMemo(() => {
    const result = buildItems(stats, ["放铳时立直率", "放铳时副露率"], ["立直", "副露"], 1);
    const selfOther = {
      value: 1 - (stats.放铳时副露率 || 0) - (stats.放铳时立直率 || 0),
      outerLabel: "门清",
    } as PieChartItem;
    if (selfOther.value > 0.00001) {
      selfOther.innerLabel = formatPercent(selfOther.value / 1);
      result.push(selfOther);
    }
    return result.filter((item) => item.value);
  }, [stats]);
  return (
    <div className="row">
      <div className="col-lg-4 mb-2">
        <h5 className="text-center">{t("和牌时")}</h5>
        <SimplePieChart
          aspect={4 / 3}
          items={winData}
          startAngle={-45}
          innerLabelFontSize="0.85rem"
          outerLabelOffset={10}
          outerLabel={(x) => t(x.outerLabel || "")}
        />
      </div>
      <div className="col-lg-4 mb-2">
        <h5 className="text-center">{t("放铳时")}</h5>
        <SimplePieChart
          aspect={4 / 3}
          items={loseSelfData}
          startAngle={-45}
          innerLabelFontSize="0.85rem"
          outerLabelOffset={10}
          outerLabel={(x) => t(x.outerLabel || "")}
        />
      </div>
      <div className="col-lg-4 mb-2">
        <h5 className="text-center">{t("放铳至")}</h5>
        <SimplePieChart
          aspect={4 / 3}
          items={loseData}
          startAngle={-45}
          innerLabelFontSize="0.85rem"
          outerLabelOffset={10}
          outerLabel={(x) => t(x.outerLabel || "")}
        />
      </div>
    </div>
  );
}
