import { GameMode } from "./gameMode";
import { PLAYER_RANKS } from "./constants";
import i18n from "../../i18n";

const t = i18n.t.bind(i18n);

const LEVEL_MAX_POINTS = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000];
const LEVEL_PENALTY = [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 180, 195, 210, 225, 240, 255];
const LEVEL_PENALTY_3 = [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 190, 215, 240, 265, 290, 320];
const LEVEL_PENALTY_E = [0, 0, 0, 10, 20, 30, 40, 50, 60, 80, 90, 100, 110, 120, 130, 140];
const LEVEL_PENALTY_E_3 = [0, 0, 0, 10, 20, 30, 40, 50, 60, 80, 95, 110, 125, 140, 160, 175];

const LEVEL_KONTEN = 7;
const LEVEL_MAX_POINT_KONTEN = 2000;

const LEVEL_ALLOWED_MODES: { [key: number]: GameMode[] } = {
  101: [],
  102: [],
  103: [GameMode.金, GameMode.金东],
  104: [GameMode.金, GameMode.玉, GameMode.金东, GameMode.玉东],
  105: [GameMode.玉, GameMode.王座, GameMode.玉东, GameMode.王座东],
  106: [GameMode.王座, GameMode.王座东],
  107: [GameMode.王座, GameMode.王座东],
  201: [],
  202: [],
  203: [GameMode.三金, GameMode.三金东],
  204: [GameMode.三金, GameMode.三玉, GameMode.三金东, GameMode.三玉东],
  205: [GameMode.三玉, GameMode.三王座, GameMode.三玉东, GameMode.三王座东],
  206: [GameMode.三王座, GameMode.三王座东],
  207: [GameMode.三王座, GameMode.三王座东],
};

const MODE_PENALTY: { [mode in GameMode]: typeof LEVEL_PENALTY } = {
  [GameMode.金]: LEVEL_PENALTY,
  [GameMode.玉]: LEVEL_PENALTY,
  [GameMode.王座]: LEVEL_PENALTY,
  [GameMode.金东]: LEVEL_PENALTY_E,
  [GameMode.玉东]: LEVEL_PENALTY_E,
  [GameMode.王座东]: LEVEL_PENALTY_E,
  [GameMode.三金]: LEVEL_PENALTY_3,
  [GameMode.三玉]: LEVEL_PENALTY_3,
  [GameMode.三王座]: LEVEL_PENALTY_3,
  [GameMode.三金东]: LEVEL_PENALTY_E_3,
  [GameMode.三玉东]: LEVEL_PENALTY_E_3,
  [GameMode.三王座东]: LEVEL_PENALTY_E_3,
};

export function getTranslatedLevelTags(): string[] {
  const rawTags = t(PLAYER_RANKS) as string;
  if (rawTags.charCodeAt(0) > 127) {
    return rawTags.split("");
  }
  return Array(rawTags.length / 2)
    .fill("")
    .map((_, index) => rawTags.slice(index * 2, index * 2 + 2));
}

export class Level {
  _majorRank: number;
  _minorRank: number;
  _numPlayerId: number;
  constructor(levelId: number) {
    const realId = levelId % 10000;
    this._majorRank = Math.floor(realId / 100);
    this._minorRank = realId % 100;
    this._numPlayerId = Math.floor(levelId / 10000);
  }
  toLevelId() {
    return this._numPlayerId * 10000 + this._majorRank * 100 + this._minorRank;
  }
  isSameMajorRank(other: Level): boolean {
    return this._majorRank === other._majorRank;
  }
  isSame(other: Level): boolean {
    if (this.isKonten() && other.isKonten()) {
      if (this._majorRank === LEVEL_KONTEN - 1 || other._majorRank === LEVEL_KONTEN - 1) {
        return true;
      }
    }
    return this._majorRank === other._majorRank && this._minorRank === other._minorRank;
  }
  isAllowedMode(mode: GameMode): boolean {
    return LEVEL_ALLOWED_MODES[this._numPlayerId * 100 + this._majorRank].includes(mode);
  }
  isKonten(): boolean {
    return this._majorRank >= LEVEL_KONTEN - 1;
  }
  getNumPlayerId(): number {
    return this._numPlayerId;
  }
  withLevelId(newLevelId: number): Level {
    return new Level(this._numPlayerId * 10000 + newLevelId);
  }
  getTag(): string {
    const label = getTranslatedLevelTags()[this.isKonten() ? LEVEL_KONTEN - 2 : this._majorRank - 1];
    if (this._majorRank === LEVEL_KONTEN - 1) {
      return label;
    }
    return label + this._minorRank;
  }
  getMaxPoint(): number {
    if (this.isKonten()) {
      return LEVEL_MAX_POINT_KONTEN;
    }
    return LEVEL_MAX_POINTS[(this._majorRank - 1) * 3 + this._minorRank - 1];
  }
  getPenaltyPoint(mode: GameMode): number {
    if (this.isKonten()) {
      return 0;
    }
    return MODE_PENALTY[mode][(this._majorRank - 1) * 3 + this._minorRank - 1];
  }
  getStartingPoint(): number {
    if (this._majorRank === 1) {
      return 0;
    }
    return this.getMaxPoint() / 2;
  }
  getNextLevel(): Level {
    const level = this.getVersionAdjustedLevel();
    let majorRank = level._majorRank;
    let minorRank = level._minorRank + 1;
    if (minorRank > 3 && !level.isKonten()) {
      majorRank++;
      minorRank = 1;
    }
    if (majorRank === LEVEL_KONTEN - 1) {
      majorRank = LEVEL_KONTEN;
    }
    return new Level(level._numPlayerId * 10000 + majorRank * 100 + minorRank);
  }
  getPreviousLevel(): Level {
    if (this._majorRank === 1 && this._minorRank === 1) {
      return this;
    }
    const level = this.getVersionAdjustedLevel();
    let majorRank = level._majorRank;
    let minorRank = level._minorRank - 1;
    if (minorRank < 1) {
      majorRank--;
      minorRank = 3;
    }
    if (majorRank === LEVEL_KONTEN - 1) {
      majorRank = LEVEL_KONTEN - 2;
    }
    return new Level(level._numPlayerId * 10000 + majorRank * 100 + minorRank);
  }
  getAdjustedLevel(score: number): Level {
    score = this.getVersionAdjustedScore(score);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let level: Level = this.getVersionAdjustedLevel();
    let maxPoints = level.getMaxPoint();
    if (maxPoints && score >= maxPoints) {
      level = level.getNextLevel();
      maxPoints = level.getMaxPoint();
      score = level.getStartingPoint();
    } else if (score < 0) {
      if (!maxPoints || level._majorRank === 1 || (level._majorRank === 2 && level._minorRank === 1)) {
        score = 0;
      } else {
        level = level.getPreviousLevel();
        maxPoints = level.getMaxPoint();
        score = level.getStartingPoint();
      }
    }
    return level;
  }
  getVersionAdjustedLevel() {
    if (this._majorRank !== LEVEL_KONTEN - 1) {
      return this;
    }
    return new Level(this._numPlayerId * 10000 + LEVEL_KONTEN * 100 + 1);
  }
  getVersionAdjustedScore(score: number) {
    if (this._majorRank === LEVEL_KONTEN - 1) {
      return Math.ceil(score / 100) * 10 + 200;
    }
    return score;
  }
  getScoreDisplay(score: number) {
    score = this.getVersionAdjustedScore(score);
    if (this.isKonten()) {
      return (score / 100).toFixed(1);
    }
    return score.toString();
  }
  formatAdjustedScoreWithTag(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level.getTag()} ${this.formatAdjustedScore(score)}`;
  }
  formatAdjustedScore(score: number) {
    const level = this.getAdjustedLevel(score);
    score = this.getVersionAdjustedScore(score);
    return `${level.getScoreDisplay(level.isSame(this) ? Math.max(score, 0) : level.getStartingPoint())}${
      level.getMaxPoint() ? "/" + level.getScoreDisplay(level.getMaxPoint()) : ""
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
// eslint-disable-next-line @typescript-eslint/no-redeclare
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
  },
});
