import { LevelWithDelta } from "./level";
import { PlayerMetadataLite } from "./metadata";

export enum RankingTimeSpan {
  OneWeek = "1w",
  FourWeeks = "4w"
}
export type DeltaRankingItem = {
  id: number;
  nickname: string;
  level: LevelWithDelta;
  delta: number;
};
export type DeltaRankingResponse = {
  [modeId: string]: {
    top: DeltaRankingItem[];
    bottom: DeltaRankingItem[];
  };
};
export interface CareerRankingItem extends PlayerMetadataLite {
  rank_key: number;
  count: number;
}
export enum CareerRankingType {
  Rank1 = "rank1",
  Rank12 = "rank12",
  Rank123 = "rank123",
  Rank4 = "rank4",
  AvgRank = "avg_rank",
  NumGames = "num_games",
  StableLevel = "stable_level"
}
