import { PlayerMetadataLite2, PlayerExtendedStats } from "./metadata";
export type RankRateBySeat = {
  [modeId: string]: {
    [rankId: number]: [number, number, number, number];
  };
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
