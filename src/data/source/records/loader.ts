/* eslint-disable @typescript-eslint/camelcase */
import dayjs from "dayjs";

import { GameRecord, GameRecordWithEvent } from "../../types/record";
import { Metadata, PlayerMetadata, PlayerExtendedStats } from "../../types/metadata";
import { apiGet } from "../api";

const CHUNK_SIZE = 100;

export interface DataLoader<T extends Metadata, TRecord = GameRecord> {
  getMetadata(): Promise<T>;
  getNextChunk(): Promise<TRecord[]>;
  getEstimatedChunkSize(): number;
}

export class RecentHighlightDataLoader implements DataLoader<Metadata> {
  _data: Promise<GameRecord[]>;
  _index: number;
  constructor(numItems = 100) {
    this._index = 0;
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
  getEstimatedChunkSize() {
    return CHUNK_SIZE;
  }
  async getMetadata(): Promise<Metadata> {
    return this._data.then((x) => ({ count: x.length }));
  }
  async getNextChunk(): Promise<GameRecord[]> {
    const index = this._index;
    this._index += CHUNK_SIZE;
    return this._data.then((data) => data.slice(index, index + CHUNK_SIZE));
  }
}

export class ListingDataLoader implements DataLoader<Metadata> {
  _date: dayjs.Dayjs;
  _cursor: dayjs.Dayjs;
  _tag: string;
  constructor(date: dayjs.ConfigType) {
    this._date = dayjs(date).startOf("day");
    this._cursor = dayjs(this._date).endOf("day");
    this._tag = "";
  }
  getEstimatedChunkSize() {
    return CHUNK_SIZE;
  }
  async getMetadata(): Promise<Metadata> {
    const result = await apiGet<Metadata>(`count/${this._date.valueOf()}`);
    this._tag = result.count.toString();
    return result;
  }
  async getNextChunk(): Promise<GameRecord[]> {
    if (this._cursor.isBefore(this._date) || this._cursor.isSame(this._date)) {
      return [];
    }
    const chunk = await apiGet<GameRecord[]>(
      `games/${this._cursor.valueOf()}/${this._date.valueOf()}?limit=${
        CHUNK_SIZE + ((parseInt(this._tag, 10) || 0) % CHUNK_SIZE)
      }&descending=true&tag=${this._tag}`
    );
    if (chunk.length) {
      this._cursor = dayjs(chunk[chunk.length - 1].startTime * 1000 - 1);
    } else {
      this._cursor = this._date;
    }
    this._tag = "";
    return chunk;
  }
}

export class PlayerDataLoader implements DataLoader<PlayerMetadata> {
  _playerId: string;
  _startDate: dayjs.Dayjs;
  _endDate: dayjs.Dayjs;
  _cursor: dayjs.Dayjs;
  _mode: string;
  _initialParams: string;
  _tag: string;
  constructor(playerId: string, startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs, mode = "") {
    this._playerId = playerId;
    this._startDate = startDate || dayjs("2010-01-01T00:00:00.000Z");
    this._endDate = endDate || dayjs().endOf("day");
    this._cursor = this._endDate;
    this._mode = mode;
    this._initialParams = this._getParams();
    this._tag = "";
  }
  _getDatePath(): string {
    let result = `/${this._startDate.valueOf()}`;
    if (this._cursor) {
      result += `/${this._cursor.valueOf()}`;
    }
    return result;
  }
  _getParams(): string {
    return `${this._playerId}${this._getDatePath()}?mode=${this._mode}`;
  }
  getEstimatedChunkSize() {
    return CHUNK_SIZE;
  }
  async getMetadata(): Promise<PlayerMetadata> {
    return await apiGet<PlayerMetadata>(`player_stats/${this._initialParams}`).then((stats) => {
      stats.extended_stats = apiGet<PlayerExtendedStats>(`player_extended_stats/${this._initialParams}`).then(
        (extendedStats) => (stats.extended_stats = extendedStats)
      );
      this._tag = stats.count.toString();
      return stats;
    });
  }
  async getNextChunk(): Promise<GameRecord[]> {
    if (this._cursor && (this._cursor.isBefore(this._startDate) || this._cursor.isSame(this._startDate))) {
      return [];
    }
    const chunk = await apiGet<GameRecord[]>(
      `player_records/${this._playerId}/${this._cursor.valueOf()}/${this._startDate.valueOf()}?limit=${
        CHUNK_SIZE + ((parseInt(this._tag, 10) || 0) % CHUNK_SIZE)
      }&mode=${this._mode}&descending=true&tag=${this._tag}`
    );
    if (chunk.length) {
      this._cursor = dayjs(chunk[chunk.length - 1].startTime * 1000 - 1);
    } else {
      this._cursor = this._startDate;
    }
    this._tag = "";
    return chunk;
  }
}
