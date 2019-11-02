import dayjs from "dayjs";

import GameMode from "./gameMode";

export const PLAYER_RANKS = "初士杰豪圣魂";
export const LEVEL_MAX_POINTS = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000];
export const RANK_LABELS = ["一位", "二位", "三位", "四位"];
export const RANK_COLORS = ["#28a745", "#17a2b8", "#6c757d", "#dc3545"];

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

class Level {
  _majorRank: number;
  _minorRank: number;
  constructor(levelId: number) {
    const realId = levelId % 10000;
    this._majorRank = Math.floor(realId / 100);
    this._minorRank = realId % 100;
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
  formatWithAdjustedScore(score: number) {
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
    return `${level.getTag()} - ${score}${maxPoints ? "/" + maxPoints : ""}`;
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
  avg_rank: number;
  negative_rate: number;
}
