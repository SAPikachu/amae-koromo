import dayjs from "dayjs";

import { GameRecord, GameRecordWithEvent } from "../../types/record";
import { Metadata, PlayerMetadata, PlayerExtendedStats } from "../../types/metadata";
import { apiGet } from "../api";
import { GameMode } from "../../types";
import Conf from "../../../utils/conf";

const CHUNK_SIZE = 100;

export interface DataLoader<T extends Metadata, TRecord = GameRecord> {
  getMetadata(): Promise<T>;
  getNextChunk(): Promise<TRecord[]>;
  getEstimatedChunkSize(): number;
}

export class RecentHighlightDataLoader implements DataLoader<Metadata> {
  _data: Promise<GameRecord[]>;
  _index: number;
  constructor(mode: GameMode | undefined, numItems = 100) {
    this._index = 0;
    this._data = apiGet<GameRecordWithEvent[]>(`recent_highlight_games?limit=${numItems}&mode=${mode || ""}`)
      .then((data) => {
        if (data.every((x) => x.uuid)) {
          return data;
        }
        return apiGet<GameRecordWithEvent[]>(`games_by_id/${data.map((x) => x._id).join(",")}`).then((records) => {
          const recordMap = {} as { [key: string]: GameRecordWithEvent };
          records.forEach((x) => (recordMap[x._id || ""] = x));
          return data.map((x) => ({ ...x, ...recordMap[x._id || ""] }));
        });
      })
      .then((data) => data.sort((a, b) => b.startTime - a.startTime))
      .catch((e) => {
        if (e.status === 404) {
          return [];
        }
        return Promise.reject(e);
      });
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
  _modeString: string;
  constructor(date: dayjs.ConfigType, mode: GameMode | null) {
    this._date = dayjs(date).startOf("day");
    const cursor = Math.floor(new Date().getTime() / 120000) * 120000;
    this._cursor = dayjs(Math.min(this._date.clone().add(1, "day").valueOf() - 1, cursor));
    this._modeString = mode && mode.toString() !== "0" ? mode.toString() : "";
  }
  getEstimatedChunkSize() {
    return CHUNK_SIZE;
  }
  shouldReturnEmptyResult() {
    return !this._modeString && Conf.availableModes.length > 1;
  }
  async getMetadata(): Promise<Metadata> {
    if (this.shouldReturnEmptyResult()) {
      return { count: 0 };
    }
    return { count: +Infinity };
  }
  async getNextChunk(): Promise<GameRecord[]> {
    if (this._cursor.isBefore(this._date) || this._cursor.isSame(this._date) || this.shouldReturnEmptyResult()) {
      return [];
    }
    const chunk = await apiGet<GameRecord[]>(
      `games/${this._cursor.valueOf()}/${this._date.valueOf()}?limit=${CHUNK_SIZE}&descending=true&mode=${
        this._modeString
      }`
    );
    if (chunk.length) {
      this._cursor = dayjs(chunk[chunk.length - 1].startTime * 1000 - 1);
    } else {
      this._cursor = this._date;
    }
    return chunk;
  }
}

export class PlayerDataLoader implements DataLoader<PlayerMetadata> {
  _playerId: string;
  _startDate: dayjs.Dayjs;
  _endDate: dayjs.Dayjs;
  _cursor: dayjs.Dayjs;
  _mode: GameMode[];
  _initialParams: string;
  _tag: string;
  constructor(playerId: string, startDate?: dayjs.Dayjs, endDate?: dayjs.Dayjs, mode = [] as GameMode[]) {
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
  _getParams(mode = this._mode): string {
    return `${this._playerId}${this._getDatePath()}?mode=${(mode.length ? mode : Conf.availableModes).join(".")}`;
  }
  getEstimatedChunkSize() {
    return CHUNK_SIZE;
  }
  async getMetadata(): Promise<PlayerMetadata> {
    if (this._endDate.isBefore(this._startDate)) {
      return Promise.reject(new Error("Invalid date range"));
    }
    const stats = await apiGet<PlayerMetadata>(`player_stats/${this._initialParams}`);
    if (this._mode.length || !Conf.availableModes.length) {
      stats.extended_stats = apiGet<PlayerExtendedStats>(`player_extended_stats/${this._initialParams}`).then(
        (extendedStats) => (stats.extended_stats = extendedStats)
      );
    }
    let crossStats = stats;
    if (this._mode.length && !Conf.availableModes.every((x) => this._mode.includes(x))) {
      crossStats = await apiGet<PlayerMetadata>(`player_stats/${this._getParams([])}`);
    }
    stats.cross_stats = {
      id: crossStats.id,
      level: crossStats.level,
      max_level: crossStats.max_level,
      played_modes:
        crossStats.played_modes
          ?.map((x) => (typeof x === "string" ? (parseInt(x, 10) as GameMode) : x))
          ?.sort((a, b) => Conf.availableModes.indexOf(a) - Conf.availableModes.indexOf(b)) || [],
      nickname: crossStats.nickname,
      count: crossStats.count,
    };
    this._tag = stats.count.toString();
    return stats;
  }
  async getNextChunk(): Promise<GameRecord[]> {
    if (this._cursor.isBefore(this._startDate) || this._cursor.isSame(this._startDate)) {
      return [];
    }
    if (!this._mode.length && Conf.availableModes.length) {
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
