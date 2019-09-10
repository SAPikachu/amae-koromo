import moment from "moment";

import { DATA_ROOT } from "./constants";

export const PlayerRanks = "初士杰豪圣魂";

export enum GameMode {
  王座 = 16,
  玉 = 12,
}
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

// Fix error on CodeSandbox
declare global {
  interface ObjectConstructor {
    values<T>(o: { [s: string]: T }): T[];
    values(o: any): any[];
    entries<T>(o: { [s: string]: T }): [string, T][];
    entries(o: any): [string, any][];
  }
}

const DATA_CACHE_MS = 120000;
export async function fetchGameRecords(date: moment.MomentInput): Promise<GameRecord[]> {
  const dateString = moment(date).format("YYMMDD");
  const isToday = moment(date).isSame(moment(), "day");
  const cacheTag = `gameRecord${isToday ? "Today" : dateString}`;
  const timestamp = new Date().getTime();
  const lastUpdateTimestamp = parseInt(sessionStorage.lastUpdateTimestamp || "0", 10);
  const cacheExpired = isToday && timestamp > lastUpdateTimestamp + DATA_CACHE_MS;
  if (cacheExpired) {
    sessionStorage.removeItem(cacheTag);
    sessionStorage.setItem("lastUpdateTimestamp", timestamp.toString());
  }
  if (sessionStorage[cacheTag]) {
    return Promise.resolve(JSON.parse(sessionStorage[cacheTag]));
  }
  try {
    const resp = await fetch(`${DATA_ROOT}records/${dateString}.json?t=${cacheTag}`);
    const ret = Object.values(await resp.json());
    ret.sort((a, b) => b.endTime - a.endTime);
    const cacheData = JSON.stringify(ret);
    try {
      sessionStorage.setItem(cacheTag, cacheData);
    } catch (e) {
      sessionStorage.clear();
      sessionStorage.setItem(cacheTag, cacheData);
    }
    return ret;
  } catch (e) {
    return [];
  }
}
