import dayjs from "dayjs";

import { GameRecord } from "../../types/record";
import { Metadata, PlayerMetadata } from "../../types/metadata";
import { ListingDataLoader, PlayerDataLoader, DataLoader, RecentHighlightDataLoader } from "./loader";

export type FilterPredicate<TRecord = GameRecord> = ((record: TRecord) => boolean) | null;
class DataProviderImpl<TMetadata extends Metadata, TRecord extends { uuid: string } = GameRecord> {
  _loader: DataLoader<TMetadata, TRecord>;
  _metadata: TMetadata | Promise<TMetadata> | null;
  _countPromise: Promise<number> | null;
  _loadingPromise: Promise<unknown> | null;
  _data: TRecord[];
  _filterPredicate: FilterPredicate<TRecord>;
  _filteredIndices: number[] | null;
  _filterResultCache: { [uuid: string]: boolean };

  constructor(loader: DataLoader<TMetadata, TRecord>) {
    this._loader = loader;
    this._metadata = null;
    this._data = [];
    this._countPromise = null;
    this._filterPredicate = null;
    this._filteredIndices = null;
    this._filterResultCache = {};
    this._loadingPromise = null;
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
    const indices = [];
    for (let i = 0; i < count; i++) {
      if (i >= this._data.length) {
        indices.push(i);
        continue;
      }
      const game = this._data[i];
      let result = this._filterResultCache[game.uuid];
      if (result === undefined) {
        this._filterResultCache[game.uuid] = result = this._filterPredicate(game);
      }
      if (result) {
        indices.push(i);
      }
    }
    this._filteredIndices = indices;
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
      this._metadata = this._loader.getMetadata().then((metadata) => {
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
      .then(() => new Promise((resolve) => setTimeout(resolve, 100)))
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
    return mappedIndex < this._data.length;
  }
  getItem(index: number, skipPreload = false): TRecord | Promise<TRecord | null> {
    const mappedIndex = this._mapItemIndex(index);
    if (mappedIndex === null) {
      return this.getCount().then((count) => {
        const newMappedIndex = this._mapItemIndex(index);
        if (index > count - 1 || newMappedIndex === null) {
          return null;
        }
        return this.getItem(index, skipPreload);
      });
    }
    if (mappedIndex >= this._data.length) {
      const curLength = this._data.length;
      return this._loadNextChunk().then(() => {
        if (this._data.length > curLength) {
          return this.getItem(index, skipPreload);
        }
        return null;
      });
    }
    if (!skipPreload && !this._filteredIndices) {
      this.preload(index + this._loader.getEstimatedChunkSize() / 2);
    }
    return this._data[mappedIndex];
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
    if (requestedIndex < 0 || requestedIndex >= count) {
      return null;
    }
    return this._filteredIndices ? this._filteredIndices[requestedIndex] : requestedIndex;
  }
  async _loadNextChunk(): Promise<unknown> {
    if (this._loadingPromise) {
      return this._loadingPromise;
    }
    this._loadingPromise = (async () => {
      const count = this.getUnfilteredCountSync() || 0;
      if (this._data.length >= count) {
        this._loadingPromise = null;
        return;
      }
      const nextChunk = await this._loader.getNextChunk();
      this._loadingPromise = null;
      if (nextChunk.length) {
        this._data.splice(this._data.length, 0, ...nextChunk);
      } else {
        const metadata = await this._metadata;
        if (metadata) {
          console.warn("Fixing incorrect item count: " + metadata?.count + " -> " + this._data.length);
          metadata.count = this._data.length;
          this._metadata = metadata;
        }
      }
      this.updateFilteredIndices();
    })();
    return this._loadingPromise;
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
  },
});
