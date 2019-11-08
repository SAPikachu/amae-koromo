/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-use-before-define */
import dayjs from "dayjs";

import { apiGet } from "./api";
import { PlayerMetadataLite, PlayerExtendedStats } from "../types/metadata";

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
