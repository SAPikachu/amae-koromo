/* eslint-disable @typescript-eslint/camelcase */
import { LevelWithDelta, Level } from "./level";
import { GameMode } from "./gameMode";
import { FanStatEntry } from "./statistics";
import { sum } from "../../utils";

const RANK_DELTA = [15, 5, -5, -15];
const MODE_DELTA = {
  "12": [110, 55, 0, 0],
  "16": [120, 60, 0, 0]
};

type RankRates = [number, number, number, number];

export type FanStatEntry2 = FanStatEntry & {
  役满: number;
};
export const FanStatEntry2 = Object.freeze({
  formatFan(entry: FanStatEntry2): string {
    if (entry.役满) {
      if (entry.役满 === 1) {
        return "役满";
      }
      return `${entry.役满} 倍役满`;
    }
    return `${entry.count} 番`;
  }
});
export type FanStatEntryList = FanStatEntry2[];
export const FanStatEntryList = Object.freeze({
  formatFanSummary(list: FanStatEntryList): string {
    const count = sum(list.map(x => x.count));
    const 役满 = sum(list.map(x => x.役满));
    if (役满) {
      if (役满 === 1) {
        return "役满";
      }
      return `${役满} 倍役满`;
    }
    let result = `${count} 番`;
    if (count >= 13) {
      result += " - 累计役满";
    } else if (count >= 11) {
      result += " - 三倍满";
    } else if (count >= 8) {
      result += " - 倍满";
    } else if (count >= 6) {
      result += " - 跳满";
    } else if (count === 5) {
      result += " - 满贯";
    }
    return result;
  }
});

export interface PlayerExtendedStats {
  和牌率: number;
  自摸率: number;
  默听率: number;
  放铳率: number;
  副露率: number;
  立直率: number;
  平均打点: number;
  最大连庄?: number;
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
  役满?: number;
  累计役满?: number;
  最大累计番数?: number;
  W立直?: number;
  流满?: number;
  平均起手向听: number;
  放铳至立直: number;
  放铳至副露: number;
  放铳至默听: number;
  立直和了: number;
  副露和了: number;
  默听和了: number;
  立直巡目: number;
  立直流局: number;
  立直收支: number;
  立直收入: number;
  立直支出: number;
  先制率: number;
  追立率: number;
  被追率: number;
  振听立直率: number;
  最近大铳?: {
    id: string;
    start_time: number;
    fans: FanStatEntryList;
  };
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

export function calculateDeltaPoint(
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
    const formatNumber = function(x: number): string {
      // Trim after the second digit after decimal point
      let s = x.toString();
      if (s.indexOf(".") === -1) {
        s += ".00";
      }
      if (s.length < 8) {
        s += "00";
      }
      return s.slice(0, s.indexOf(".") + 3);
    };
    if (level >= 7) {
      return `魂${formatNumber(level - 6)}`;
    }
    if (level >= 4) {
      return `圣${formatNumber(level - 3)}`;
    }
    return `豪${formatNumber(level)}`;
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
