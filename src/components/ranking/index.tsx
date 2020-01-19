import React from "react";

import { Alert } from "../misc/alert";
import DeltaRanking from "./deltaRanking";
import { CareerRanking, CareerRankingColumn } from "./careerRanking";
import { ModelModeProvider, ModelModeSelector } from "../modeModel";
import { CareerRankingType } from "../../data/types";
import { PlayerMetadata } from "../../data/types/metadata";
import { formatFixed3, formatIdentity } from "../../utils/index";
import { ViewRoutes, SimpleRoutedSubViews, NavButtons, RouteDef } from "../routing";
import { ViewSwitch } from "../routing/index";

const ROUTES = (
  <ViewRoutes>
    <RouteDef path="delta" title="苦主及汪汪">
      <DeltaRanking />
    </RouteDef>
    <RouteDef path="career1" title="一位率/四位率">
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.Rank1} title="一位率" />
        <CareerRankingColumn type={CareerRankingType.Rank4} title="四位率" />
      </CareerRanking>
    </RouteDef>
    <RouteDef path="career2" title="连对率/安定段位">
      <CareerRanking>
        <CareerRankingColumn type={CareerRankingType.Rank12} title="连对率" />
        <CareerRankingColumn
          type={CareerRankingType.StableLevel}
          title="安定段位"
          formatter={PlayerMetadata.formatStableLevel2}
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
  return (
    <SimpleRoutedSubViews>
      {ROUTES}
      <ModelModeProvider>
        <Alert stateName="rankingNotice">
          <h4 className="mb-2">提示</h4>
          排行榜非实时更新，可能会有数小时的延迟
        </Alert>
        <NavButtons />
        <ModelModeSelector />
        <ViewSwitch />
      </ModelModeProvider>
    </SimpleRoutedSubViews>
  );
}
