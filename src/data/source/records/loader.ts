/* eslint-disable @typescript-eslint/camelcase */
import dayjs from "dayjs";

import { GameRecord, GameRecordWithEvent } from "../../types/record";
import { Metadata, PlayerMetadata, PlayerExtendedStats } from "../../types/metadata";
import { apiGet } from "../api";

export interface DataLoader<T extends Metadata, TRecord = GameRecord> {
  getMetadata(): Promise<T>;
  getRecords(skip: number, limit: number, cacheTag?: string): Promise<TRecord[]>;
}

export class RecentHighlightDataLoader implements DataLoader<Metadata> {
  _data: Promise<GameRecord[]>;
  constructor(numItems = 100) {
    this._data = apiGet<GameRecordWithEvent[]>(`recent_highlight_games?limit=${numItems}`)
      .then((data) => {
        if (data.every((x) => x.uuid)) {
          return data; // Old API
        }
        return apiGet<GameRecordWithEvent[]>(`games_by_id/${data.map((x) => x._id).join(",")}`).then((records) => {
          const recordMap = {} as { [key: string]: GameRecordWithEvent };
          records.forEach((x) => (recordMap[x._id || ""] = x));
          return data.map((x) => ({ ...x, ...recordMap[x._id || ""] }));
        });
      })
      .then((data) => data.sort((a, b) => a.startTime - b.startTime));
  }
  async getMetadata(): Promise<Metadata> {
    return this._data.then((x) => ({ count: x.length }));
  }
  async getRecords(skip: number, limit: number): Promise<GameRecord[]> {
    return this._data.then((data) => data.slice(skip, skip + limit));
  }
}

export class ListingDataLoader implements DataLoader<Metadata> {
  _date: dayjs.Dayjs;
  constructor(date: dayjs.ConfigType) {
    this._date = dayjs(date).startOf("day");
  }
  async getMetadata(): Promise<Metadata> {
    return await apiGet<Metadata>(`count/${this._date.valueOf()}`);
  }
  async getRecords(skip: number, limit: number, cacheTag = ""): Promise<GameRecord[]> {
    return await apiGet<GameRecord[]>(`games/${this._date.valueOf()}?skip=${skip}&limit=${limit}&tag=${cacheTag}`);
  }
}

export class PlayerDataLoader implements DataLoader<PlayerMetadata> {
  _playerId: string;
  _startDate?: dayjs.Dayjs;
  _endDate?: dayjs.Dayjs;
  _mode: string;
  constructor(playerId: string, startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs, mode = "") {
    this._playerId = playerId;
    this._startDate = startDate;
    this._endDate = endDate;
    this._mode = mode;
  }
  _getDatePath(): string {
    let result = "";
    if (this._startDate) {
      result += `/${this._startDate.valueOf()}`;
      if (this._endDate) {
        result += `/${this._endDate.valueOf()}`;
      }
    }
    return result;
  }
  _getParams(): string {
    return `${this._playerId}${this._getDatePath()}?mode=${this._mode}`;
  }
  async getMetadata(): Promise<PlayerMetadata> {
    return await apiGet<PlayerMetadata>(`player_stats/${this._getParams()}`).then((stats) => {
      stats.extended_stats = apiGet<PlayerExtendedStats>(`player_extended_stats/${this._getParams()}`).then(
        (extendedStats) => (stats.extended_stats = extendedStats)
      );
      return stats;
    });
  }
  async getRecords(skip: number, limit: number, cacheTag = ""): Promise<GameRecord[]> {
    return await apiGet<GameRecord[]>(
      `player_records/${this._playerId}${this._getDatePath()}?skip=${skip}&limit=${limit}&mode=${
        this._mode
      }&tag=${cacheTag}`
    );
  }
}
