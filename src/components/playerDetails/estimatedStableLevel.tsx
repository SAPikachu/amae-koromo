import React from "react";
import { LevelWithDelta, PlayerMetadata, GameMode, Level, modeLabel } from "../../data/types";
import { useModel } from "../gameRecords/model";
import StatItem from "./statItem";
import Conf from "../../utils/conf";
import { useTranslation } from "react-i18next";
import { formatFixed3 } from "../../utils";
import { Box } from "@mui/material";

const ENABLED_MODES = [
  GameMode.玉,
  GameMode.王座,
  GameMode.三玉,
  GameMode.三王座,
  GameMode.王东,
  GameMode.玉东,
  GameMode.三王东,
  GameMode.三玉东,
];

export default function EstimatedStableLevel({ metadata }: { metadata: PlayerMetadata }) {
  const [model] = useModel();
  const { t } = useTranslation();
  if (!Conf.features.estimatedStableLevel) {
    return null;
  }
  let level = LevelWithDelta.getAdjustedLevel(metadata.cross_stats?.level || metadata.level);
  if (!("selectedModes" in model) || model.selectedModes.length !== 1) {
    return null;
  }
  const mode = model.selectedModes[0];
  if (!ENABLED_MODES.includes(mode)) {
    return null;
  }
  if (!level.isAllowedMode(mode)) {
    level = LevelWithDelta.getAdjustedLevel(metadata.level);
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
    ? t("，括号内为预计{{ label }}段场数", { label: estimatedNumGamesToChangeLevel > 0 ? t("升") : t("降") })
    : "";
  const levelComponents = PlayerMetadata.getStableLevelComponents(metadata, mode);
  const levelNames = "一二三四".slice(0, levelComponents.length);
  const modeL = modeLabel(mode);
  return (
    <>
      <StatItem
        label="安定段位"
        description={
          <Box>
            {`${t("在{{ modeL }}之间一直进行对局，预测最终能达到的段位。", { modeL })}${
              levelNames.length === 3 ? t("括号内为安定段位时的分数期望。") : ""
            }${notEnoughData ? t("（数据量不足，计算结果可能有较大偏差）") : ""}`}
            {!level.isKonten() && (
              <>
                <br />
                {`${t("{{ levelNames1 }}位平均 Pt / {{ levelName2 }}位平均得点 Pt：", {
                  levelNames1: t(levelNames.slice(0, levelNames.length - 1)),
                  levelName2: t(levelNames[levelNames.length - 1]),
                })}[${levelComponents.map((x) => x.toFixed(2)).join("/")}]`}
              </>
            )}
            <br />
            {`${t("得点效率（各顺位平均 Pt 及平均得点 Pt 的加权平均值）：")}${formatFixed3(
              PlayerMetadata.calculateExpectedGamePoint(metadata, mode, undefined, false)
            )}`}
          </Box>
        }
        valueProps={notEnoughData ? { fontStyle: "italic", fontWeight: 300, sx: { opacity: 0.5 } } : {}}
      >
        <span>
          {PlayerMetadata.estimateStableLevel2(metadata, mode)}
          {notEnoughData && "?"}
        </span>
      </StatItem>
      <StatItem
        label="分数期望"
        description={`${t("在{{ modeL }}之间每局获得点数的数学期望值{{ changeLevelMsg }}", {
          changeLevelMsg,
          modeL,
        })}${notEnoughData ? t("（数据量不足，计算结果可能有较大偏差）") : ""}`}
        valueProps={notEnoughData ? { fontStyle: "italic", fontWeight: 300, sx: { opacity: 0.5 } } : {}}
      >
        <span>
          {level.isKonten() && level.isAllowedMode(mode)
            ? (expectedGamePoint / 100).toFixed(3)
            : expectedGamePoint.toFixed(1)}
          {estimatedNumGamesToChangeLevel && estimatedNumGamesToChangeLevel < 10000
            ? ` (${Math.abs(estimatedNumGamesToChangeLevel).toFixed(0)})`
            : ""}
          {notEnoughData && "?"}
        </span>
      </StatItem>
    </>
  );
}
