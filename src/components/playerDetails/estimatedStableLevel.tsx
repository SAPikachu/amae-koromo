import React from "react";
import { LevelWithDelta, PlayerMetadata, GameMode, Level, modeLabel } from "../../data/types";
import { useModel } from "../gameRecords/model";
import StatItem from "./statItem";
import Conf from "../../utils/conf";

const ENABLED_MODES = [GameMode.玉, GameMode.王座, GameMode.三玉, GameMode.三王座];

export default function EstimatedStableLevel({ metadata }: { metadata: PlayerMetadata }) {
  const [model] = useModel();
  if (!Conf.features.estimatedStableLevel) {
    return null;
  }
  const level = LevelWithDelta.getAdjustedLevel(metadata.level);
  if (!model.selectedMode) {
    return null;
  }
  const mode = parseInt(model.selectedMode) as GameMode;
  if (!ENABLED_MODES.includes(mode) || !level.isAllowedMode(mode)) {
    return null;
  }
  const notEnoughData = metadata.count < 100;
  const expectedGamePoint = PlayerMetadata.calculateExpectedGamePoint(metadata, mode);
  let estimatedNumGamesToChangeLevel = null as number | null;
  if (level.getMaxPoint() && level.isAllowedMode(mode)) {
    const curPoint = level.isSame(new Level(metadata.level.id))
      ? metadata.level.score + metadata.level.delta
      : level.getStartingPoint();
    estimatedNumGamesToChangeLevel =
      expectedGamePoint > 0 ? (level.getMaxPoint() - curPoint) / expectedGamePoint : curPoint / expectedGamePoint;
  }
  const changeLevelMsg = estimatedNumGamesToChangeLevel
    ? `，括号内为预计${estimatedNumGamesToChangeLevel > 0 ? "升" : "降"}段场数`
    : "";
  const levelComponents = PlayerMetadata.getStableLevelComponents(metadata, mode);
  const levelNames = "一二三四".slice(0, levelComponents.length);
  return (
    <>
      <StatItem
        label="安定段位"
        description={`在${modeLabel(mode)}之间一直进行对局，预测最终能达到的段位。${
          notEnoughData ? "（数据量不足，计算结果可能有较大偏差）" : ""
        }<br/>${levelNames.slice(0, levelNames.length - 1)}位平均 Pt / ${
          levelNames[levelNames.length - 1]
        }位平均得点 Pt：[${levelComponents.map(x => x.toFixed(2)).join("/")}]`}
        className={notEnoughData ? "font-italic font-lighter text-muted" : ""}
      >
        <span>
          {PlayerMetadata.estimateStableLevel2(metadata, mode)}
          {notEnoughData && "?"}
        </span>
      </StatItem>
      <StatItem
        label="分数期望"
        description={`在${modeLabel(mode)}之间每局获得点数的数学期望值${changeLevelMsg}${
          notEnoughData ? "（数据量不足，计算结果可能有较大偏差）" : ""
        }`}
        className={notEnoughData ? "font-italic font-lighter text-muted" : ""}
      >
        <span>
          {expectedGamePoint.toFixed(1)}
          {estimatedNumGamesToChangeLevel ? ` (${Math.abs(estimatedNumGamesToChangeLevel).toFixed(0)})` : ""}
          {notEnoughData && "?"}
        </span>
      </StatItem>
    </>
  );
}
