import React from "react";
import { useAsyncFactory } from "../../utils/index";
import { getRankRateBySeat } from "../../data/source/misc";
import Loading from "../misc/loading";
import { useMemo } from "react";
import { useModel, ModelModeSelector } from "../modeModel";
import SimplePieChart from "../charts/simplePieChart";
import { useTranslation } from "react-i18next";
import { RankRates } from "../../data/types";

const SEAT_LABELS = "东南西北";

function Chart({ rates, numGames, aspect = 1 }: { rates: RankRates; numGames: number; aspect?: number }) {
  const items = useMemo(
    () =>
      rates.map((x, index) => ({
        value: x,
        outerLabel: SEAT_LABELS[index],
        innerLabel: `${(x * 100).toFixed(2)}%\n[${Math.round(x * numGames)}]`,
      })),
    [rates, numGames]
  );
  return <SimplePieChart aspect={aspect} items={items} />;
}

export default function RankBySeats() {
  const { t } = useTranslation();
  const data = useAsyncFactory(getRankRateBySeat, [], "getRankRateBySeat");
  const [model] = useModel();
  if (!data) {
    return <Loading />;
  }
  const selectedData = data[model.selectedMode || "0"];
  return (
    <>
      <ModelModeSelector />
      <div className="row">
        <div className="col-lg-6">
          <h3 className="text-center">{t("坐席吃一率")}</h3>
          <Chart rates={selectedData[1]} numGames={selectedData.numGames} />
        </div>
        <div className="col-lg-6">
          <h3 className="text-center">{t(`坐席吃${selectedData.length > 4 ? "四" : "三"}率`)}</h3>
          <Chart rates={selectedData[selectedData.length - 1]} numGames={selectedData.numGames} />
        </div>
      </div>
      <div className="row">
        <div className="col text-right">
          {t("统计半庄数：")}
          {selectedData.numGames}
        </div>
      </div>
    </>
  );
}
