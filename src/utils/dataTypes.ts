import dayjs from "dayjs";

export const PLAYER_RANKS = "初士杰豪圣魂";
const LEVEL_MAX_POINTS = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000];
const LEVEL_PENALTY = [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 180, 195, 210, 225, 240, 255];
const RANK_DELTA = [15, 5, -5, -15];
const MODE_DELTA = {
  "12": [110, 55, 0, 0],
  "16": [120, 60, 0, 0]
};
export const RANK_LABELS = ["一位", "二位", "三位", "四位"];
export const RANK_COLORS = ["#28a745", "#17a2b8", "#6c757d", "#dc3545"];

export enum GameMode {
  王座 = 16,
  玉 = 12
}
const LEVEL_ALLOWED_MODES: { [key: string]: GameMode[] } = {
  "1": [],
  "2": [],
  "3": [],
  "4": [GameMode.玉],
  "5": [GameMode.玉, GameMode.王座],
  "6": [GameMode.王座]
};
export const NUMBER_OF_GAME_MODE = Object.keys(GameMode).filter(
  x => typeof GameMode[x as keyof typeof GameMode] === "number"
).length;

export interface PlayerRecord {
  accountId: number;
  nickname: string;
  level: number;
  score: number;
}
export interface GameRecord {
  modeId: GameMode;
  uuid: string;
  startTime: number;
  endTime: number;
  players: PlayerRecord[];
}
export const GameRecord = Object.freeze({
  getRankIndexByPlayer(rec: GameRecord, player: number | string | PlayerRecord): number {
    const playerId = (typeof player === "object" ? player.accountId : player).toString();
    const sortedPlayers = rec.players.map((player, index) => ({ player, index }));
    sortedPlayers.sort((a, b) => 5 - b.index + b.player.score - (5 - a.index + a.player.score));
    for (let i = 0; i < sortedPlayers.length; i++) {
      if (sortedPlayers[i].player.accountId.toString() === playerId) {
        return i;
      }
    }
    return -1;
  },
  getPlayerRankLabel(rec: GameRecord, player: number | string | PlayerRecord): string {
    return RANK_LABELS[GameRecord.getRankIndexByPlayer(rec, player)] || "";
  },
  getPlayerRankColor(rec: GameRecord, player: number | string | PlayerRecord): string {
    return RANK_COLORS[GameRecord.getRankIndexByPlayer(rec, player)];
  },
  encodeAccountId: (t: number) => 1358437 + ((7 * t + 1117113) ^ 86216345),
  formatFullStartTime: (rec: GameRecord) => dayjs(rec.startTime * 1000).format("YYYY/M/D HH:mm"),
  getRecordLink(rec: GameRecord, player?: PlayerRecord | number | string) {
    const playerId = typeof player === "object" ? player.accountId : player;
    const trailer = playerId
      ? `_a${GameRecord.encodeAccountId(typeof playerId === "number" ? playerId : parseInt(playerId))}`
      : "";
    return `https://www.majsoul.com/1/?paipu=${rec.uuid}${trailer}`;
  }
});

function calculateDeltaPoint(score: number, rank: number, mode: GameMode, level: Level): number {
  let result =
    Math.ceil((score - 25000) / 1000 + RANK_DELTA[rank]) + MODE_DELTA[mode.toString() as keyof typeof MODE_DELTA][rank];
  if (rank === 3) {
    result -= level.getPenaltyPoint();
  }
  /*
  console.log(
    `calculateDeltaPoint: score=${score}, rank=${rank}, mode=${mode}, level=${level.getTag()}, result=${result}`
  );
  */
  return result;
}

class Level {
  _majorRank: number;
  _minorRank: number;
  constructor(levelId: number) {
    const realId = levelId % 10000;
    this._majorRank = Math.floor(realId / 100);
    this._minorRank = realId % 100;
  }
  isSameMajorRank(other: Level): boolean {
    return this._majorRank === other._majorRank;
  }
  isAllowedMode(mode: GameMode): boolean {
    return LEVEL_ALLOWED_MODES[this._majorRank.toString() as keyof typeof LEVEL_ALLOWED_MODES].includes(mode);
  }
  getTag(): string {
    const label = PLAYER_RANKS[this._majorRank - 1];
    if (this._majorRank === PLAYER_RANKS.length) {
      return label;
    }
    return label + this._minorRank;
  }
  getMaxPoint(): number {
    return LEVEL_MAX_POINTS[(this._majorRank - 1) * 3 + this._minorRank - 1];
  }
  getPenaltyPoint(): number {
    return LEVEL_PENALTY[(this._majorRank - 1) * 3 + this._minorRank - 1];
  }
  getStartingPoint(): number {
    if (this._majorRank === 1) {
      return 0;
    }
    if (this._majorRank === PLAYER_RANKS.length) {
      return 10000;
    }
    return this.getMaxPoint() / 2;
  }
  getNextLevel(): Level {
    if (this._majorRank === PLAYER_RANKS.length) {
      return this;
    }
    let majorRank = this._majorRank;
    let minorRank = this._minorRank + 1;
    if (minorRank > 3) {
      majorRank++;
      minorRank = 1;
    }
    return new Level(majorRank * 100 + minorRank);
  }
  getPreviousLevel(): Level {
    if (this._majorRank === 1 && this._minorRank === 1) {
      return this;
    }
    let majorRank = this._majorRank;
    let minorRank = this._minorRank - 1;
    if (minorRank < 1) {
      majorRank--;
      minorRank = 3;
    }
    return new Level(majorRank * 100 + minorRank);
  }
  getAdjustedLevel(score: number): Level {
    let maxPoints = this.getMaxPoint();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let level: Level = this;
    if (maxPoints && score >= maxPoints) {
      level = this.getNextLevel();
      maxPoints = level.getMaxPoint();
      score = level.getStartingPoint();
    } else if (score < 0) {
      if (!maxPoints || level._majorRank === 1 || (level._majorRank === 2 && level._minorRank === 1)) {
        score = 0;
      } else {
        level = this.getPreviousLevel();
        maxPoints = level.getMaxPoint();
        score = level.getStartingPoint();
      }
    }
    return level;
  }
  formatWithAdjustedScore(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level.getTag()} - ${this.formatAdjustedScore(score)}`;
  }
  formatAdjustedScore(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level === this ? Math.max(score, 0) : level.getStartingPoint()}${
      level.getTag() ? "/" + level.getMaxPoint() : ""
    }`;
  }
}
export function getLevelTag(levelId: number) {
  return new Level(levelId).getTag();
}
export type LevelWithDelta = {
  id: number;
  score: number;
  delta: number;
};
export const LevelWithDelta = Object.freeze({
  format(obj: LevelWithDelta): string {
    return new Level(obj.id).formatWithAdjustedScore(obj.score + obj.delta);
  },
  formatAdjustedScore(obj: LevelWithDelta): string {
    return new Level(obj.id).formatAdjustedScore(obj.score + obj.delta);
  },
  getTag(obj: LevelWithDelta): string {
    return new Level(obj.id).getAdjustedLevel(obj.score + obj.delta).getTag();
  }
});

export interface Metadata {
  count: number;
}
export interface PlayerMetadataLite extends Metadata {
  id: number;
  nickname: string;
  level: LevelWithDelta;
}
export interface PlayerMetadata extends PlayerMetadataLite {
  rank_rates: [number, number, number, number];
  rank_avg_score: [number, number, number, number];
  avg_rank: number;
  negative_rate: number;
  extended_stats?: PlayerExtendedStats | Promise<PlayerExtendedStats>;
}
export const PlayerMetadata = Object.freeze({
  calculateExpectedGamePoint(metadata: PlayerMetadata, mode: GameMode, level?: Level): number {
    const rankDeltaPoints = metadata.rank_avg_score.map((score, rank) =>
      calculateDeltaPoint(score, rank, mode, level || new Level(metadata.level.id))
    );
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
  }
});
export interface PlayerExtendedStats {
  id: number;
  和牌率: number;
  自摸率: number;
  放铳率: number;
  副露率: number;
  立直率: number;
  平均打点: number;
  最大连庄: number;
  和了巡数: number;
  平均铳点: number;
  流局率: number;
  流听率: number;
}
