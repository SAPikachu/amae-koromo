import dayjs from "dayjs";

import { GameRecord } from "../../types/record";
import { Metadata, PlayerMetadata } from "../../types/metadata";
import { ListingDataLoader, PlayerDataLoader, DataLoader, RecentHighlightDataLoader } from "./loader";

export type FilterPredicate<TRecord = GameRecord> = ((record: TRecord) => boolean) | null;
class DataProviderImpl<TMetadata extends Metadata, TRecord extends { uuid: string } = GameRecord> {
  _loader: DataLoader<TMetadata, TRecord>;
  _metadata: TMetadata | Promise<TMetadata> | null;
  _countPromise: Promise<number> | null;
  _chunks: (TRecord[] | Promise<TRecord[]>)[];
  _itemsPerChunk: number;
  _filterPredicate: FilterPredicate<TRecord>;
  _filteredIndices: number[] | null;
  _filterResultCache: { [uuid: string]: boolean };

  constructor(loader: DataLoader<TMetadata, TRecord>, itemsPerChunk = 100) {
    this._loader = loader;
    this._metadata = null;
    this._countPromise = null;
    this._chunks = [];
    this._itemsPerChunk = itemsPerChunk;
    this._filterPredicate = null;
    this._filteredIndices = null;
    this._filterResultCache = {};
  }
  setFilterPredicate(predicate: FilterPredicate<TRecord>) {
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
      // this._triggerFullLoad();
    }
  }
  getMetadataSync(): TMetadata | null {
    return this._metadata && !(this._metadata instanceof Promise) ? this._metadata : null;
  }
  getCountMaybeSync(): number | Promise<number> {
    const metadata = this.getMetadataSync();
    if (metadata) {
      return this._filteredIndices ? this._filteredIndices.length : metadata.count;
    }
    return this.getCount();
  }
  async getCount(): Promise<number> {
    const metadata = this.getMetadataSync();
    if (metadata) {
      return this.getCountMaybeSync();
    }
    if (!this._metadata) {
      this._metadata = this._loader.getMetadata().then(metadata => {
        if (!metadata) {
          console.log("No metadata returned");
          throw new Error("No metadata returned");
        }
        this._metadata = metadata;
        this.updateFilteredIndices();
        this._countPromise = null;
        return metadata;
      });
    }
    if (this._countPromise) {
      return this._countPromise;
    }
    this._countPromise = Promise.resolve(this._metadata)
      .then(() => new Promise(resolve => setTimeout(resolve, 100)))
      .then(() => this.getCountMaybeSync());
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
  getItem(index: number, skipPreload = false): TRecord | Promise<TRecord | null> {
    const mappedIndex = this._mapItemIndex(index);
    if (mappedIndex === null) {
      return this.getCount().then(count => {
        if (index > count - 1 || this._mapItemIndex(index) === null) {
          return null;
        }
        return this.getItem(index);
      });
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
  async _getChunk(chunkIndex: number): Promise<TRecord[]> {
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
  async _loadChunk(chunkIndex: number): Promise<TRecord[]> {
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

export type ListingDataProvider = DataProviderImpl<Metadata>;
export type PlayerDataProvider = DataProviderImpl<PlayerMetadata>;

export type DataProvider = ListingDataProvider | PlayerDataProvider;
export const DataProvider = Object.freeze({
  createListing(date: dayjs.ConfigType): ListingDataProvider {
    return new DataProviderImpl(new ListingDataLoader(date));
  },
  createHightlight(): ListingDataProvider {
    return new DataProviderImpl(new RecentHighlightDataLoader());
  },
  createPlayer(
    playerId: string,
    startDate: dayjs.ConfigType | null,
    endDate: dayjs.ConfigType | null,
    mode: string
  ): PlayerDataProvider {
    return new DataProviderImpl(
      new PlayerDataLoader(
        playerId,
        startDate ? dayjs(startDate).startOf("day") : undefined,
        endDate ? dayjs(endDate).endOf("day") : undefined,
        mode
      )
    );
  }
});
