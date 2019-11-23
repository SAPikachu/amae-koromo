/* eslint-disable @typescript-eslint/camelcase */
import { LevelWithDelta, Level } from "./level";
import { GameMode } from "./gameMode";

const RANK_DELTA = [15, 5, -5, -15];
const MODE_DELTA = {
  "12": [110, 55, 0, 0],
  "16": [120, 60, 0, 0]
};

type RankRates = [number, number, number, number];

export interface PlayerExtendedStats {
  和牌率: number;
  自摸率: number;
  默听率: number;
  放铳率: number;
  副露率: number;
  立直率: number;
  平均打点: number;
  最大连庄: number;
  和了巡数: number;
  平均铳点: number;
  流局率: number;
  流听率: number;
  里宝率: number;
  一发率: number;
  被炸率: number;
  平均被炸点数: number;
  放铳时立直率: number;
  放铳时副露率: number;
  立直后放铳率: number;
  副露后放铳率: number;
  立直后和牌率: number;
  副露后和牌率: number;
  立直后流局率: number;
  副露后流局率: number;
}
export interface Metadata {
  count: number;
}
export interface PlayerMetadataLite extends Metadata {
  id: number;
  nickname: string;
  level: LevelWithDelta;
}
export interface PlayerMetadataLite2 extends Metadata {
  rank_rates: RankRates;
  avg_rank: number;
  negative_rate: number;
}
export interface PlayerMetadata extends PlayerMetadataLite, PlayerMetadataLite2 {
  rank_avg_score: RankRates;
  max_level: LevelWithDelta;
  extended_stats?: PlayerExtendedStats | Promise<PlayerExtendedStats>;
}

function calculateDeltaPoint(
  score: number,
  rank: number,
  mode: GameMode,
  level: Level,
  includePenalty = true,
  trimNumber = true
): number {
  let result =
    (trimNumber ? Math.ceil : (x: number) => x)((score - 25000) / 1000 + RANK_DELTA[rank]) +
    MODE_DELTA[mode.toString() as keyof typeof MODE_DELTA][rank];
  if (rank === 3 && includePenalty) {
    result -= level.getPenaltyPoint();
  }
  /*
  console.log(
    `calculateDeltaPoint: score=${score}, rank=${rank}, mode=${mode}, level=${level.getTag()}, result=${result}`
  );
  */
  return result;
}

export const PlayerMetadata = Object.freeze({
  calculateRankDeltaPoints(
    metadata: PlayerMetadata,
    mode: GameMode,
    level?: Level,
    includePenalty = true,
    trimNumber = true
  ): RankRates {
    const rankDeltaPoints = metadata.rank_avg_score.map((score, rank) =>
      calculateDeltaPoint(
        score,
        rank,
        mode,
        level || LevelWithDelta.getAdjustedLevel(metadata.level),
        includePenalty,
        trimNumber
      )
    ) as typeof metadata.rank_avg_score;
    return rankDeltaPoints;
  },
  calculateExpectedGamePoint(metadata: PlayerMetadata, mode: GameMode, level?: Level, includePenalty = true): number {
    const rankDeltaPoints = PlayerMetadata.calculateRankDeltaPoints(metadata, mode, level, includePenalty);
    const rankWeightedPoints = rankDeltaPoints.map((point, rank) => point * metadata.rank_rates[rank]);
    const expectedGamePoint = rankWeightedPoints.reduce((a, b) => a + b, 0);
    /*
    console.log(rankDeltaPoints);
    console.log(rankWeightedPoints);
    console.log(
      `calculateExpectedGamePoint: mode=${mode}, level=${level ? level.getTag() : ""}, result=${expectedGamePoint}`
    );
    */
    return expectedGamePoint;
  },
  estimateStableLevel(metadata: PlayerMetadata, mode: GameMode): string {
    let level = new Level(metadata.level.id);
    let lastPositiveLevel: Level | undefined = undefined;
    for (;;) {
      const expectedGamePoint = PlayerMetadata.calculateExpectedGamePoint(metadata, mode, level);
      if (Math.abs(expectedGamePoint) < 0.001) {
        return level.getTag();
      }
      if (expectedGamePoint >= 0) {
        lastPositiveLevel = level;
        level = level.getNextLevel();
        if (!level.isAllowedMode(mode)) {
          return lastPositiveLevel.getTag() + "+";
        }
        if (level === lastPositiveLevel) {
          return level.getTag() + "+";
        }
      } else {
        if (lastPositiveLevel) {
          return lastPositiveLevel.getTag();
        }
        break;
      }
    }
    if (!level.getMaxPoint()) {
      // 魂天不会掉段
      return level.getTag() + "-";
    }
    for (;;) {
      const prevLevel = level.getPreviousLevel();
      if (!prevLevel.isAllowedMode(mode) || prevLevel === level) {
        return level.getTag() + "-";
      }
      level = prevLevel;
      const expectedGamePoint = PlayerMetadata.calculateExpectedGamePoint(metadata, mode, level);
      if (expectedGamePoint + 0.001 >= 0) {
        return level.getTag();
      }
    }
  },
  formatStableLevel2(level: number): string {
    if (level >= 7) {
      return `魂${(level - 6).toFixed(2)}`;
    }
    if (level >= 4) {
      return `圣${(level - 3).toFixed(2)}`;
    }
    return `豪${level.toFixed(2)}`;
  },
  getStableLevelComponents(metadata: PlayerMetadata, mode: GameMode): RankRates {
    return this.calculateRankDeltaPoints(metadata, mode, undefined, false, false);
  },
  estimateStableLevel2(metadata: PlayerMetadata, mode: GameMode): string {
    if (!metadata.rank_rates[3]) {
      return "";
    }
    const estimatedPoints = this.calculateExpectedGamePoint(metadata, mode, undefined, false);
    const result = estimatedPoints / (metadata.rank_rates[3] * 15) - 10;
    return PlayerMetadata.formatStableLevel2(result);
  }
});
