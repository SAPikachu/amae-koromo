import moment from "moment";

import { DATA_ROOT, API_ROOT } from "./constants";
import GameMode from "./gameMode";

export { default as GameMode, NUMBER_OF_GAME_MODE } from "./gameMode";

export const PLAYER_RANKS = "初士杰豪圣魂";

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
interface CouchDbViewRow<T> {
  id: string;
  key: any;
  value: T;
}
interface CouchDbViewResponse<T> {
  total_rows: number;
  offset: number;
  rows: CouchDbViewRow<T>[];
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
    const ret = Object.values(await resp.json()) as GameRecord[];
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
export type FilterPredicate = ((record: GameRecord) => boolean) | null;
export class DataProvider {
  _date: moment.Moment;
  _count: number | Promise<number> | null;
  _chunks: (GameRecord[] | Promise<GameRecord[]>)[];
  _itemsPerChunk: number;
  _filterPredicate: FilterPredicate;
  _filteredIndices: number[] | null;
  _filterResultCache: { [uuid: string]: boolean };

  constructor(date: moment.MomentInput, itemsPerChunk = 100) {
    this._date = moment(date).startOf("day");
    this._count = null;
    this._chunks = [];
    this._itemsPerChunk = itemsPerChunk;
    this._filterPredicate = null;
    this._filteredIndices = null;
    this._filterResultCache = {};
  }
  async _apiGet<T>(path: string) {
    const resp = await fetch(API_ROOT + path);
    if (!resp.ok) {
      throw resp;
    }
    return (await resp.json()) as T;
  }
  setFilterPredicate(predicate: FilterPredicate) {
    if (this._filterPredicate === predicate) {
      return;
    }
    this._filterPredicate = predicate;
    this._filterResultCache = {};
    this.updateFilteredIndices();
  }
  updateFilteredIndices() {
    this._filteredIndices = null;
    if (!this._filterPredicate) {
      return;
    }
    const count = this._count;
    if (typeof count !== "number") {
      return;
    }
    let numShownItems = 0;
    let numLoadedItems = 0;
    const indices = [];
    for (let i = 0; i < count; i++) {
      const chunk = this._chunks[Math.floor(i / this._itemsPerChunk)];
      if (!chunk || chunk instanceof Promise) {
        indices.push(i);
        continue;
      }
      numLoadedItems++;
      const game = chunk[i % this._itemsPerChunk];
      let result = this._filterResultCache[game.uuid];
      if (result === undefined) {
        this._filterResultCache[game.uuid] = result = this._filterPredicate(game);
      }
      if (result) {
        indices.push(i);
        numShownItems++;
      }
    }
    this._filteredIndices = indices;
    if (numShownItems < 10 && numLoadedItems >= this._itemsPerChunk) {
      this._triggerFullLoad();
    }
  }
  getCountMaybeSync(): number | Promise<number> {
    if (this._count === null) {
      return this.getCount();
    }
    return this._filteredIndices ? this._filteredIndices.length : this._count;
  }
  async getCount(): Promise<number> {
    if (this._count === null) {
      this._count = (async () => {
        const resp = await this._apiGet<{ count: number }>(`count/${this._date.valueOf()}`);
        this._count = resp.count;
        this.updateFilteredIndices();
        return this.getCountMaybeSync();
      })();
    }
    return this.getCountMaybeSync();
  }
  getUnfilteredCountSync(): number | null {
    if (typeof this._count !== "number") {
      return null;
    }
    return this._count;
  }
  isItemLoaded(index: number): boolean {
    const mappedIndex = this._mapItemIndex(index);
    if (mappedIndex === null) {
      return false;
    }
    const chunkNumber = Math.floor(mappedIndex / this._itemsPerChunk);
    return !!this._chunks[chunkNumber] && !(this._chunks[chunkNumber] instanceof Promise);
  }
  getItem(index: number, skipPreload = false): GameRecord | Promise<GameRecord> {
    const mappedIndex = this._mapItemIndex(index);
    if (mappedIndex === null) {
      return this.getCount().then(() => this.getItem(index));
    }
    const chunkNumber = Math.floor(mappedIndex / this._itemsPerChunk);
    const innerIndex = mappedIndex % this._itemsPerChunk;
    const chunk = this._chunks[chunkNumber];
    if (!chunk || chunk instanceof Promise) {
      return this._getChunk(chunkNumber).then(chunk => chunk[innerIndex]);
    }
    if (!skipPreload && !this._filteredIndices) {
      this.preload(index + this._itemsPerChunk);
    }
    return chunk[innerIndex];
  }
  preload(index: number) {
    const count = this.getCountMaybeSync();
    if (count instanceof Promise) {
      return;
    }
    if (index >= count) {
      return;
    }
    this.getItem(index, true);
  }
  _mapItemIndex(requestedIndex: number): number | null {
    const count = this.getCountMaybeSync();
    if (count instanceof Promise) {
      return null;
    }
    if (requestedIndex < 0) {
      return null;
    }
    // Descending order
    const reversed = count - requestedIndex - 1;
    if (reversed < 0) {
      return null;
    }
    return this._filteredIndices ? this._filteredIndices[reversed] : reversed;
  }
  async _getChunk(chunkIndex: number): Promise<GameRecord[]> {
    if (!this._chunks[chunkIndex]) {
      this._chunks[chunkIndex] = this._loadChunk(chunkIndex);
    }
    return this._chunks[chunkIndex];
  }
  _triggerFullLoad() {
    const count = this.getCountMaybeSync();
    if (typeof count !== "number") {
      return;
    }
    const numChunks = Math.ceil(count / this._itemsPerChunk);
    for (let i = 0; i < numChunks; i++) {
      if (this._chunks[i]) {
        continue;
      }
      this._getChunk(i);
    }
  }
  async _loadChunk(chunkIndex: number): Promise<GameRecord[]> {
    const count = await this.getCount();
    const numChunks = Math.ceil(count / this._itemsPerChunk);
    if (!numChunks) {
      return [];
    }
    if (chunkIndex >= numChunks) {
      console.warn(`Loading out-of-index chunk: ${chunkIndex}, number of items: ${this._count}`);
      return [];
    }
    const chunk = await this._apiGet<GameRecord[]>(
      `games/${this._date.valueOf()}?skip=${this._itemsPerChunk * chunkIndex}&limit=${this._itemsPerChunk}&tag=${
        chunkIndex === numChunks - 1 ? count : ""
      }`,
    );
    if (chunk.length < this._itemsPerChunk && chunkIndex < numChunks - 1) {
      console.warn("Unexpected number of items in chunk:", chunk.length);
    }
    this._chunks[chunkIndex] = chunk;
    this.updateFilteredIndices();
    return chunk;
  }
}
