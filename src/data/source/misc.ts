/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-use-before-define */
import dayjs from "dayjs";

import { apiGet } from "./api";
import { PlayerMetadataLite, PlayerExtendedStats, GameMode } from "../types";
import { RankingTimeSpan, DeltaRankingResponse } from "../types";
import { RankRateBySeat } from "../types";
import { CareerRankingItem, CareerRankingType } from "../types/ranking";
import { GlobalStatistics, FanStats, GlobalHistogram, LevelStatistics } from "../types/statistics";


export type PlayerSearchResult = Pick<PlayerMetadataLite, "id" | "nickname" | "level"> & {
  latest_timestamp: number;
};
export async function searchPlayer(prefix: string, limit = 20): Promise<PlayerSearchResult[]> {
  prefix = prefix.trim();
  if (!prefix) {
    return [];
  }
  const result = await apiGet<PlayerSearchResult[]>(
    `search_player/${encodeURIComponent(prefix)}?limit=${limit}&tag=all`
  );
  return result || [];
}

export async function getExtendedStats(
  playerId: number,
  startDate?: dayjs.ConfigType,
  endDate?: dayjs.ConfigType,
  mode = ""
): Promise<PlayerExtendedStats> {
  let datePath = "";
  if (startDate) {
    datePath += `/${dayjs(startDate).valueOf()}`;
    if (endDate) {
      datePath += `/${dayjs(endDate).valueOf()}`;
    }
  }
  return await apiGet<PlayerExtendedStats>(`player_extended_stats/${playerId}${datePath}?mode=${mode}`);
}

export async function getDeltaRanking(timespan: RankingTimeSpan): Promise<DeltaRankingResponse> {
  return await apiGet<DeltaRankingResponse>(`player_delta_ranking/${timespan}`);
}

export async function getCareerRanking(
  type: CareerRankingType,
  modeId?: string,
  minGames?: number
): Promise<CareerRankingItem[]> {
  minGames = minGames || 300;
  const suffix = minGames === 300 ? "" : `_${minGames}`;
  return await apiGet<CareerRankingItem[]>(`career_ranking/${type + suffix}?mode=${modeId || ""}`);
}

export async function getGlobalStatistics(modes: GameMode[]): Promise<GlobalStatistics> {
  return await apiGet<GlobalStatistics>(`global_statistics_2?mode=${modes.join(".")}`);
}
export async function getGlobalStatisticsYear(modes: GameMode[]): Promise<GlobalStatistics> {
  return await apiGet<GlobalStatistics>(`global_statistics_year?mode=${modes.join(".")}`);
}
export async function getGlobalStatisticsSnapshot(
  date: dayjs.ConfigType,
  modes: GameMode[]
): Promise<GlobalStatistics> {
  return await apiGet<GlobalStatistics>(
    `global_statistics_snapshot/${dayjs(date).format("YYYY-MM-DD")}?mode=${modes.join(".")}`
  );
}
export async function getLevelStatistics(): Promise<LevelStatistics> {
  return await apiGet<LevelStatistics>("level_statistics").then((data) => {
    data.sort((a, b) => a[1] - b[1]);
    return data;
  });
}
export async function getGlobalHistogram(): Promise<GlobalHistogram> {
  return await apiGet<GlobalHistogram>("global_histogram");
}
export async function getFanStats(): Promise<FanStats> {
  return await apiGet<FanStats>("fan_stats");
}

export async function getRankRateBySeat(): Promise<RankRateBySeat> {
  type RawResponse = [[number, number, number], number][];
  let rawResp = await apiGet<RawResponse>("rank_rate_by_seat");
  if (rawResp.some((x) => x[0][0] === null)) {
    // Contest
    rawResp = rawResp.filter((x) => x[0][0] !== 0);
  }
  const counts: {
    [modeId: string]: { [rank: number]: number };
  } = {};
  let maxRank = 0;
  for (const [[modeId, rank], count] of rawResp) {
    if (maxRank < rank) {
      maxRank = rank;
    }
    const modeIdStr = (modeId || 0).toString();
    counts[modeIdStr] = counts[modeIdStr] || [];
    counts[modeIdStr][rank] = counts[modeIdStr][rank] || 0;
    counts[modeIdStr][rank] += count;
  }
  const result: RankRateBySeat = {};
  for (const [[modeId, rank, seatId], count] of rawResp) {
    const modeIdStr = (modeId || 0).toString();
    result[modeIdStr] = result[modeIdStr] || [];
    result[modeIdStr].numGames = counts[modeIdStr][rank];
    result[modeIdStr][rank] = result[modeIdStr][rank] || Array(maxRank).fill(0);
    result[modeIdStr][rank][seatId] = count / counts[modeIdStr][rank];
  }
  return result;
}
