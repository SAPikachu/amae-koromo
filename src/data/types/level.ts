import { GameMode } from "./gameMode";
import { PLAYER_RANKS } from "./constants";

const LEVEL_MAX_POINTS = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000];
const LEVEL_PENALTY = [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 180, 195, 210, 225, 240, 255];

const LEVEL_ALLOWED_MODES: { [key: string]: GameMode[] } = {
  "1": [],
  "2": [],
  "3": [],
  "4": [GameMode.玉],
  "5": [GameMode.玉, GameMode.王座],
  "6": [GameMode.王座]
};

export class Level {
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
  isSame(other: Level): boolean {
    return this._majorRank === other._majorRank && this._minorRank === other._minorRank;
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
  formatAdjustedScoreWithTag(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level.getTag()} - ${this.formatAdjustedScore(score)}`;
  }
  formatAdjustedScore(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level === this ? Math.max(score, 0) : level.getStartingPoint()}${
      level.getMaxPoint() ? "/" + level.getMaxPoint() : ""
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
    return new Level(obj.id).formatAdjustedScoreWithTag(obj.score + obj.delta);
  },
  formatAdjustedScore(obj: LevelWithDelta): string {
    return new Level(obj.id).formatAdjustedScore(obj.score + obj.delta);
  },
  getTag(obj: LevelWithDelta): string {
    return LevelWithDelta.getAdjustedLevel(obj).getTag();
  },
  getAdjustedLevel(obj: LevelWithDelta): Level {
    return new Level(obj.id).getAdjustedLevel(obj.score + obj.delta);
  }
});
