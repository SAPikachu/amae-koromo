import { LevelWithDelta } from "./level";

export enum RankingTimeSpan {
  OneWeek = "1w",
  FourWeeks = "4w"
}
export type DeltaRankingItem = {
  id: number;
  nickname: string;
  level: LevelWithDelta;
  delta: number;
}
export type DeltaRankingResponse = {
  [modeId: string]: {
    top: DeltaRankingItem[];
    bottom: DeltaRankingItem[];
  }
}