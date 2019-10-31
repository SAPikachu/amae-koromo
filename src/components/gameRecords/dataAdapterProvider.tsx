import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import React, { ReactChild } from "react";
import dayjs from "dayjs";

import {
  DataProvider,
  GameRecord,
  NUMBER_OF_GAME_MODE,
  FilterPredicate,
  ListingDataProvider,
  PlayerDataProvider
} from "../../utils/dataSource";
import { useModel, Model } from "./model";
import { Metadata } from "../../utils/dataSource";
import { generatePath } from "./routes";

interface ItemLoadingPlaceholder {
  loading: boolean;
}

const loadingPlaceholder = { loading: true };

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IDataAdapter {
  getCount(): number;
  getUnfilteredCount(): number;
  getMetadata<T extends Metadata>(): T | null;
  getItem(index: number): GameRecord | ItemLoadingPlaceholder;
  isItemLoaded(index: number): boolean;
}

class DummyDataAdapter implements IDataAdapter {
  getCount(): number {
    return 0;
  }
  getUnfilteredCount(): number {
    return 0;
  }
  getMetadata<T extends Metadata>(): T | null {
    return null;
  }
  getItem(): GameRecord | ItemLoadingPlaceholder {
    return loadingPlaceholder;
  }
  isItemLoaded(): boolean {
    return false;
  }
}

export const DUMMY_DATA_ADAPTER = new DummyDataAdapter() as IDataAdapter;

const noop = () => {};

class DataAdapter implements IDataAdapter {
  _provider: DataProvider;
  _onDataUpdate: () => void;
  _triggeredRequest: boolean;

  constructor(provider: DataProvider, onDataUpdate = noop) {
    this._provider = provider;
    this._onDataUpdate = onDataUpdate;
    this._triggeredRequest = false;
  }
  _installHook<T>(promise: Promise<T>) {
    if (this._triggeredRequest) {
      return;
    }
    this._triggeredRequest = true;
    promise.then(this._callHook.bind(this));
  }
  _callHook() {
    this._onDataUpdate();
  }
  getCount(): number {
    const maybeCount = this._provider.getCountMaybeSync();
    if (maybeCount instanceof Promise) {
      this._installHook(maybeCount);
      return 0;
    }
    return maybeCount;
  }
  getUnfilteredCount(): number {
    return this._provider.getUnfilteredCountSync() || 0;
  }
  getMetadata<T extends Metadata>(): T | null {
    return this._provider.getMetadataSync() as T | null;
  }
  getItem(index: number): GameRecord | ItemLoadingPlaceholder {
    if (index >= this.getCount()) {
      return loadingPlaceholder;
    }
    if (this._provider.isItemLoaded(index)) {
      return this._provider.getItem(index) as GameRecord;
    }
    if (!this._triggeredRequest) {
      this._installHook(this._provider.getItem(index) as Promise<GameRecord>);
    }
    return loadingPlaceholder;
  }
  isItemLoaded(index: number): boolean {
    if (index < 0) {
      return false;
    }
    return this._provider.isItemLoaded(index);
  }
  setUpdateHook(hook: () => void) {
    this._onDataUpdate = hook;
  }
  cancelUpdateHook() {
    this._onDataUpdate = noop;
  }
}

const DataAdapterContext = React.createContext(DUMMY_DATA_ADAPTER);

export const useDataAdapter = () => useContext(DataAdapterContext);
export const DataAdapterConsumer = DataAdapterContext.Consumer;

function getProviderKey(model: Model): string {
  if (model.type === undefined) {
    return dayjs(model.date || dayjs())
      .startOf("day")
      .valueOf()
      .toString();
  } else if (model.type === "player") {
    return generatePath(model);
  }
  throw new Error("Unknown model type");
}

function createProvider(model: Model): DataProvider {
  if (model.type === undefined) {
    return ListingDataProvider.create(model.date || dayjs().startOf("day"));
  }
  if (model.type === "player") {
    return PlayerDataProvider.create(model.playerId, model.startDate, model.endDate);
  }
  throw new Error("Not implemented");
}

function usePredicate(model: Model): FilterPredicate {
  if (model.type !== undefined) {
    return useMemo(() => null, [null, ""]);
  }
  const searchText = (model.searchText || "").trim() || "";
  const needPredicate = searchText || (model.selectedModes && model.selectedModes.size < NUMBER_OF_GAME_MODE);
  return useMemo(
    () =>
      needPredicate
        ? game => {
            if (model.selectedModes && !model.selectedModes.has(game.modeId.toString())) {
              return false;
            }
            if (!game.players.some(player => player.nickname.toLowerCase().indexOf(searchText) > -1)) {
              return false;
            }
            return true;
          }
        : null,
    [(model.type === undefined && model.selectedModes) || null, searchText]
  );
}

export function DataAdapterProvider({ children }: { children: ReactChild | ReactChild[] }) {
  const [model] = useModel();
  const [dataProviders] = useState(() => ({} as { [key: string]: DataProvider }));
  const searchPredicate = usePredicate(model);
  const dataProvider = useMemo(() => {
    const key = getProviderKey(model);
    if (!dataProviders[key]) {
      dataProviders[key] = createProvider(model);
    }
    return dataProviders[key];
  }, [model, dataProviders]);
  const [dataAdapter, setDataAdapter] = useState(() => DUMMY_DATA_ADAPTER);
  const refreshDataAdapter = useCallback(() => {
    dataProvider.setFilterPredicate(searchPredicate);
    const adapter = new DataAdapter(dataProvider);
    setDataAdapter(adapter);
  }, [dataProvider, searchPredicate]);
  useEffect(refreshDataAdapter, [refreshDataAdapter]);
  useEffect(() => {
    const adapter = dataAdapter;
    if (adapter instanceof DataAdapter) {
      return () => adapter.cancelUpdateHook();
    }
  }, [dataAdapter]);
  useEffect(() => {
    const adapter = dataAdapter;
    if (adapter instanceof DataAdapter) {
      adapter.setUpdateHook(refreshDataAdapter);
    }
  }, [dataAdapter, refreshDataAdapter]);
  useEffect(() => {
    dataProvider.getCountMaybeSync(); // Preload metadata
  }, [dataProvider]);
  return <DataAdapterContext.Provider value={dataAdapter}>{children}</DataAdapterContext.Provider>;
}
