import moment from "moment";

import { API_ROOT } from "./constants";
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

async function ApiGet<T>(path: string) {
  const resp = await fetch(API_ROOT + path);
  if (!resp.ok) {
    throw resp;
  }
  return (await resp.json()) as T;
}

type Metadata = {
  count: number;
};
interface DataLoader<T extends Metadata> {
  getMetadata(): Promise<T>;
  getRecords(skip: number, limit: number, cacheTag?: string): Promise<GameRecord[]>;
}

class ListingDataLoader implements DataLoader<Metadata> {
  _date: moment.Moment;
  constructor(date: moment.MomentInput) {
    this._date = moment(date).startOf("day");
  }
  async getMetadata(): Promise<Metadata> {
    return await ApiGet<Metadata>(`count/${this._date.valueOf()}`);
  }
  async getRecords(skip: number, limit: number, cacheTag = ""): Promise<GameRecord[]> {
    return await ApiGet<GameRecord[]>(`games/${this._date.valueOf()}?skip=${skip}&limit=${limit}&tag=${cacheTag}`);
  }
}

export type FilterPredicate = ((record: GameRecord) => boolean) | null;
export type ListingDataProvider = _DataProvider<ListingDataLoader>;
export const ListingDataProvider = Object.freeze({
  create(date: moment.MomentInput): ListingDataProvider {
    return new _DataProvider<ListingDataLoader>(new ListingDataLoader(date));
  }
});
export type DataProvider = ListingDataProvider;
class _DataProvider<
  TLoader extends DataLoader<TMetadata>,
  TMetadata extends Metadata = TLoader extends DataLoader<infer T> ? T : Metadata
> {
  _loader: TLoader;
  _metadata: TMetadata | Promise<TMetadata> | null;
  _countPromise: Promise<number> | null;
  _chunks: (GameRecord[] | Promise<GameRecord[]>)[];
  _itemsPerChunk: number;
  _filterPredicate: FilterPredicate;
  _filteredIndices: number[] | null;
  _filterResultCache: { [uuid: string]: boolean };

  constructor(loader: TLoader, itemsPerChunk = 100) {
    this._loader = loader;
    this._metadata = null;
    this._countPromise = null;
    this._chunks = [];
    this._itemsPerChunk = itemsPerChunk;
    this._filterPredicate = null;
    this._filteredIndices = null;
    this._filterResultCache = {};
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
    const metadata = this.getMetadataSync();
    if (!metadata) {
      return;
    }
    const count = metadata.count;
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
  getMetadataSync(): TMetadata | null {
    return this._metadata && !(this._metadata instanceof Promise) ? this._metadata : null;
  }
  getCountMaybeSync(): number | Promise<number> {
    let metadata = this.getMetadataSync();
    if (metadata) {
      return this._filteredIndices ? this._filteredIndices.length : metadata.count;
    }
    return this.getCount();
  }
  async getCount(): Promise<number> {
    let metadata = this.getMetadataSync();
    if (metadata) {
      return this.getCountMaybeSync();
    }
    if (this._countPromise) {
      return this._countPromise;
    }
    if (!this._metadata) {
      this._metadata = this._loader.getMetadata().then(metadata => {
        this._metadata = metadata;
        this.updateFilteredIndices();
        this._countPromise = null;
        return metadata;
      });
    }
    this._countPromise = Promise.resolve(this._metadata).then(() => this.getCountMaybeSync());
    return this._countPromise;
  }
  getUnfilteredCountSync(): number | null {
    const metadata = this.getMetadataSync();
    if (!metadata) {
      return null;
    }
    return metadata.count;
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
      console.warn(`Loading out-of-index chunk: ${chunkIndex}, number of items: ${count}`);
      return [];
    }
    const chunk = await this._loader.getRecords(
      this._itemsPerChunk * chunkIndex,
      this._itemsPerChunk,
      chunkIndex === numChunks - 1 ? count.toString() : ""
    );
    if (chunk.length < this._itemsPerChunk && chunkIndex < numChunks - 1) {
      console.warn("Unexpected number of items in chunk:", chunk.length);
    }
    this._chunks[chunkIndex] = chunk;
    this.updateFilteredIndices();
    return chunk;
  }
}
