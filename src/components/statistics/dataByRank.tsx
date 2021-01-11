import React, { useEffect, useMemo } from "react";

import { useAsyncFactory, formatPercent, formatFixed3 } from "../../utils/index";
import { getGlobalStatistics } from "../../data/source/misc";
import Loading from "../misc/loading";
import { useModel } from "../modeModel/model";
import { Level } from "../../data/types/level";
import { ModelModeSelector } from "../modeModel";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";

const HEADERS = ["等级"].concat(["一位率", "二位率", "三位率", "四位率"].slice(0, Conf.rankColors.length), [
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
  "在位记录",
]);

export default function DataByRank() {
  const { t } = useTranslation();
  const [model, updateModel] = useModel();
  useEffect(() => {
    if (!model.selectedModes.length && Conf.features.statisticsSubPages.dataByRank) {
      updateModel({ selectedModes: [Conf.features.statisticsSubPages.dataByRank[0]] });
    }
  }, [model, updateModel]);
  const modes = useMemo(() => [...model.selectedModes].sort((a, b) => a - b), [model]);
  const data = useAsyncFactory(
    () => (modes && modes.length ? getGlobalStatistics(modes) : Promise.resolve(null)),
    [modes],
    "getGlobalStatistics_" + modes.join(".")
  );
  const modeData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const selectedData = data[modes.join(".")];
    if (!selectedData) {
      return undefined;
    }
    const modeData = Object.entries(selectedData);
    if (!modeData) {
      return undefined;
    }
    modeData.sort((a, b) => a[0].localeCompare(b[0]));
    return modeData;
  }, [data, modes]);
  const haveNumPlayers = modeData && Object.values(modeData)[0][1].num_players;
  const headers = useMemo(() => (haveNumPlayers ? HEADERS : HEADERS.slice(0, HEADERS.length - 1)), [haveNumPlayers]);
  if (!Conf.features.statisticsSubPages.dataByRank) {
    return <></>;
  }
  return (
    <>
      <ModelModeSelector type="checkbox" availableModes={Conf.features.statisticsSubPages.dataByRank} />
      {modeData ? (
        <>
          <table className="table table-responsive-xl table-striped table-sm table-hover text-center">
            <thead className="vertical-table-header">
              <tr>
                {headers.map((x) => (
                  <th key={x}>
                    <div>{t(x)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modeData.map(([levelId, levelData]) => (
                <tr key={levelId}>
                  <td className="text-nowrap">{new Level(parseInt(levelId)).getTag()}</td>
                  {levelData.basic.rank_rates.slice(0, Conf.rankColors.length).map((x, i) => (
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
                  {haveNumPlayers && <td>{levelData.num_players}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row">
            <div className="col text-right">
              {t("统计半庄数：")}
              {Math.floor(
                modeData.map(([, levelData]) => levelData.basic.count).reduce((a, b) => a + b, 0) /
                  Conf.rankColors.length
              )}
            </div>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
