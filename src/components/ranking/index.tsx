import React from "react";

import { Alert } from "../misc/alert";
import DeltaRanking from "./deltaRanking";
import { CareerRanking, CareerRankingColumn } from "./careerRanking";
import { ModelModeProvider, ModelModeSelector } from "../modeModel";
import { CareerRankingType } from "../../data/types";
import { PlayerMetadata } from "../../data/types/metadata";
import { formatFixed3, formatIdentity, formatPercent } from "../../utils/index";
import { ViewRoutes, SimpleRoutedSubViews, NavButtons, RouteDef } from "../routing";
import { ViewSwitch } from "../routing/index";
import { useTranslation } from "react-i18next";
import Conf from "../../utils/conf";

const SANMA = Conf.rankColors.length === 3;

const ROUTES = (
  <ViewRoutes>
    <RouteDef path="delta" title="苦主及汪汪" disabled={SANMA}>
      <DeltaRanking />
    </RouteDef>
    <RouteDef path="career1" title="一位率/四位率" disabled={SANMA}>
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.Rank1} title="一位率" />
        <CareerRankingColumn type={CareerRankingType.Rank4} title="四位率" />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="career1" title="一位率/三位率" disabled={!SANMA}>
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.Rank1} title="一位率" />
        <CareerRankingColumn type={CareerRankingType.Rank3} title="三位率" />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="career2" title="连对率/安定段位" disabled={SANMA}>
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.Rank12} title="连对率" />
        <CareerRankingColumn
          type={CareerRankingType.StableLevel}
          title="安定段位"
          formatter={PlayerMetadata.formatStableLevel2}
          disableMixedMode
        />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="career3" title="平均顺位/对局数">
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.AvgRank} title="平均顺位" formatter={formatFixed3} />
        <CareerRankingColumn
          type={CareerRankingType.NumGames}
          title="对局数"
          formatter={formatIdentity}
          showNumGames={false}
        />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="winlose" title="和率/铳率">
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.Win} title="和牌率" />
        <CareerRankingColumn type={CareerRankingType.Lose} title="放铳率" />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="winlosediff" title="和铳差">
      <CareerRanking>
        <CareerRankingColumn
          type={CareerRankingType.WinLoseDiff}
          title="和铳差"
          extraColumns={[
            {
              label: "和牌率",
              value: (x) =>
                x.extended_stats && "和牌率" in x.extended_stats ? formatPercent(x.extended_stats.和牌率) : "",
            },
            {
              label: "放铳率",
              value: (x) =>
                x.extended_stats && "放铳率" in x.extended_stats ? formatPercent(x.extended_stats.放铳率) : "",
            },
          ]}
        />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="ept12" title="一/二位平均 Pt" disabled={SANMA}>
      <CareerRanking>
        <CareerRankingColumn
          type={CareerRankingType.ExpectedGamePoint0}
          title="一位平均 Pt"
          formatter={formatFixed3}
          valueLabel="Pt"
          disableMixedMode
        />
        <CareerRankingColumn
          type={CareerRankingType.ExpectedGamePoint1}
          title="二位平均 Pt"
          formatter={formatFixed3}
          valueLabel="Pt"
          disableMixedMode
        />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="ept34" title="三位平均 Pt/四位平均得点 Pt" disabled={SANMA}>
      <CareerRanking>
        <CareerRankingColumn
          type={CareerRankingType.ExpectedGamePoint2}
          title="三位平均 Pt"
          formatter={formatFixed3}
          valueLabel="Pt"
          disableMixedMode
        />
        <CareerRankingColumn
          type={CareerRankingType.ExpectedGamePoint3}
          title="四位平均得点 Pt"
          formatter={formatFixed3}
          valueLabel="Pt"
          disableMixedMode
        />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="efficiency" title="得点效率" disabled={SANMA}>
      <CareerRanking>
        <CareerRankingColumn
          type={CareerRankingType.PointEfficiency}
          title="得点效率"
          formatter={formatFixed3}
          disableMixedMode
        />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="lucky" title="欧洲人">
      <CareerRanking>
        <CareerRankingColumn showNumGames={false} type={CareerRankingType.被炸率} title="被炸率" />
        <CareerRankingColumn showNumGames={false} type={CareerRankingType.里宝率} title="里宝率" />
        <CareerRankingColumn showNumGames={false} type={CareerRankingType.一发率} title="一发率" />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="unlucky" title="非洲人">
      <CareerRanking>
        <CareerRankingColumn showNumGames={false} type={CareerRankingType.被炸率Rev} title="被炸率" />
        <CareerRankingColumn showNumGames={false} type={CareerRankingType.里宝率Rev} title="里宝率" />
        <CareerRankingColumn showNumGames={false} type={CareerRankingType.一发率Rev} title="一发率" />
      </CareerRanking>
    </RouteDef>
  </ViewRoutes>
);

export default function Routes() {
  const { t } = useTranslation();
  if (!Array.isArray(Conf.features.ranking)) {
    return <></>;
  }
  return (
    <SimpleRoutedSubViews>
      {ROUTES}
      <ModelModeProvider>
        <Alert stateName="rankingNotice20201229">
          <h4 className="mb-2">{t("提示")}</h4>
          {t("排行榜非实时更新，可能会有数小时的延迟。排行榜目前只统计半庄战对局。")}
        </Alert>
        <NavButtons />
        <ModelModeSelector type="checkbox" oneOrAll={true} availableModes={Conf.features.ranking} />
        <ViewSwitch />
      </ModelModeProvider>
    </SimpleRoutedSubViews>
  );
}
