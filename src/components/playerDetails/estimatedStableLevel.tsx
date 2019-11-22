import React from "react";
import { LevelWithDelta, PlayerMetadata, GameMode, Level } from "../../data/types";
import { useModel } from "../gameRecords/model";
import StatItem from "./statItem";

export default function EstimatedStableLevel({ metadata }: { metadata: PlayerMetadata }) {
  const [model] = useModel();
  const level = LevelWithDelta.getAdjustedLevel(metadata.level);
  const mode = model.selectedMode
    ? (parseInt(model.selectedMode) as GameMode)
    : LevelWithDelta.getTag(metadata.level) === "魂"
    ? GameMode.王座
    : GameMode.玉;
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
  return (
    <>
      <StatItem
        label="安定段位"
        description={`在${GameMode[mode]}之间一直进行对局，预测最终能达到的段位。${
          notEnoughData ? "（数据量不足，计算结果可能有较大偏差）" : ""
        }<br/>一二三位平均 Pt / 四位平均得点 Pt：[${PlayerMetadata.getStableLevelComponents(metadata, mode)
          .map(x => x.toFixed(2))
          .join("/")}]`}
        className={notEnoughData ? "font-italic font-lighter text-muted" : ""}
      >
        <span>
          {PlayerMetadata.estimateStableLevel2(metadata, mode)}
          {notEnoughData && "?"}
        </span>
      </StatItem>
      <StatItem
        label="分数期望"
        description={`在${GameMode[mode]}之间每局获得点数的数学期望值${changeLevelMsg}${
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
