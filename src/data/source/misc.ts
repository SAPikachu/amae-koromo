/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-use-before-define */
import dayjs from "dayjs";

import { apiGet } from "./api";
import { PlayerMetadataLite, PlayerExtendedStats } from "../types";
import { RankingTimeSpan, DeltaRankingResponse } from "../types";
import { RankRateBySeat } from "../types";
import { CareerRankingItem, CareerRankingType } from "../types/ranking";
import { GlobalStatistics, FanStats } from "../types/statistics";

export async function searchPlayer(prefix: string, limit = 20): Promise<PlayerMetadataLite[]> {
  prefix = prefix.trim();
  if (!prefix) {
    return [];
  }
  return apiGet<PlayerMetadataLite[]>(`search_player/${encodeURIComponent(prefix)}?limit=${limit}`);
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

export async function getCareerRanking(type: CareerRankingType, modeId?: string): Promise<CareerRankingItem[]> {
  return await apiGet<CareerRankingItem[]>(`career_ranking/${type}?mode=${modeId || ""}`);
}

export async function getGlobalStatistics(): Promise<GlobalStatistics> {
  return await apiGet<GlobalStatistics>("global_statistics");
}
export async function getFanStats(): Promise<FanStats> {
  return await apiGet<FanStats>("fan_stats");
}

export async function getRankRateBySeat(): Promise<RankRateBySeat> {
  type RawResponse = [[number, number, number], number][];
  const rawResp = await apiGet<RawResponse>("rank_rate_by_seat");
  const counts: {
    [modeId: string]: { [rank: number]: number };
  } = {};
  let maxRank = 0;
  for (const [[modeId, rank], count] of rawResp) {
    if (maxRank < rank) {
      maxRank = rank;
    }
    const modeIdStr = modeId.toString();
    counts[modeIdStr] = counts[modeIdStr] || [];
    counts[modeIdStr][rank] = counts[modeIdStr][rank] || 0;
    counts[modeIdStr][rank] += count;
  }
  const result: RankRateBySeat = {};
  for (const [[modeId, rank, seatId], count] of rawResp) {
    const modeIdStr = modeId.toString();
    result[modeIdStr] = result[modeIdStr] || [];
    result[modeIdStr].numGames = counts[modeIdStr][rank];
    result[modeIdStr][rank] = result[modeIdStr][rank] || Array(maxRank).fill(0);
    result[modeIdStr][rank][seatId] = count / counts[modeIdStr][rank];
  }
  return result;
}
