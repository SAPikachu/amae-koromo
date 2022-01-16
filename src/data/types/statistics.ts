import { GameMode } from ".";
import { PlayerMetadataLite2, PlayerExtendedStats, RankRates } from "./metadata";
export type RankRateBySeat = {
  [modeId: string]: {
    [rankId: number]: RankRates;
  } & { numGames: number; length: number };
};
export type GlobalStatistics = {
  [modeId: string]: {
    [levelId: string]: {
      num_players: number;
      basic: PlayerMetadataLite2;
      extended: PlayerExtendedStats;
    };
  };
};
export type HistogramData = {
  min: number;
  max: number;
  bins: number[];
};
export type HistogramGroup = {
  mean: number;
  histogramFull?: HistogramData;
  histogramClamped?: HistogramData;
};

export type GlobalHistogram = {
  [modeId in GameMode]: {
    [levelId: string]: {
      [name in keyof PlayerExtendedStats]: HistogramGroup;
    };
  };
};
export type FanStatEntry = {
  label: string;
  count: number;
};
export type FanStats = {
  [modeId: string]: {
    count: number;
    entries: FanStatEntry[];
  };
};
