import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import React, { ReactChild } from "react";
import dayjs from "dayjs";

import { DataProvider, FilterPredicate } from "../../data/source/records/provider";
import { useModel, Model } from "./model";
import { Metadata, GameRecord, Level } from "../../data/types";
import { generatePath } from "./routes";
import { networkError } from "../../utils/notify";
import { ApiError } from "../../data/source/api";
import { useExtraFilterPredicate } from "./extraFilterPredicate";

interface ItemLoadingPlaceholder {
  loading: boolean;
}

const loadingPlaceholder = { loading: true };

export interface IDataAdapter {
  getCount(): number;
  hasCount(): boolean;
  getUnfilteredCount(): number;
  getMetadata<T extends Metadata>(): T | null;
  getItem(index: number): GameRecord | ItemLoadingPlaceholder;
  isItemLoaded(index: number): boolean;
}

class DummyDataAdapter implements IDataAdapter {
  getCount(): number {
    return 0;
  }
  hasCount(): boolean {
    return true;
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

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

class DataAdapter implements IDataAdapter {
  _provider: DataProvider;
  _onDataUpdate: (error: Error | ApiError | false) => void;
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
    promise.then(() => this._callHook(false)).catch((reason) => this._callHook(reason));
  }
  _callHook(error: Error | ApiError | false) {
    setTimeout(() => {
      this._onDataUpdate(error);
      this._onDataUpdate = noop;
    }, 0);
  }
  getCount(): number {
    try {
      const maybeCount = this._provider.getCountMaybeSync();
      if (maybeCount instanceof Promise) {
        this._installHook(maybeCount);
        return 0;
      }
      return maybeCount;
    } catch (e) {
      this._callHook(e);
      return 0;
    }
  }
  hasCount(): boolean {
    try {
      return !(this._provider.getCountMaybeSync() instanceof Promise);
    } catch (e) {
      this._callHook(e);
      return false;
    }
  }
  getUnfilteredCount(): number {
    try {
      return this._provider.getUnfilteredCountSync() || 0;
    } catch (e) {
      this._callHook(e);
      return 0;
    }
  }
  getMetadata<T extends Metadata>(): T | null {
    try {
      return this._provider.getMetadataSync() as T | null;
    } catch (e) {
      this._callHook(e);
      return null;
    }
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
    return `${dayjs(model.date || dayjs())
      .startOf("day")
      .valueOf()
      .toString()}_${model.selectedMode}`;
  } else if (model.type === "player") {
    return generatePath(model);
  }
  throw new Error("Unknown model type");
}

function createProvider(model: Model): DataProvider {
  if (model.type === undefined) {
    return DataProvider.createListing(model.date || dayjs().startOf("day"), model.selectedMode || null);
  }
  if (model.type === "player") {
    return DataProvider.createPlayer(model.playerId, model.startDate, model.endDate, model.limit, model.selectedModes);
  }
  throw new Error("Not implemented");
}

function usePredicate(model: Model): FilterPredicate {
  const extraPredicate = useExtraFilterPredicate();
  let memoFunc: () => FilterPredicate = () => null;
  const searchText = (model.searchText || "").trim().toLowerCase() || "";
  const needPredicate =
    searchText || ("rank" in model && model.rank) || ("kontenOnly" in model && model.kontenOnly) || extraPredicate;
  memoFunc = () =>
    needPredicate
      ? (game) => {
          if (!game.players.some((player) => player.nickname.toLowerCase().indexOf(searchText) > -1)) {
            return false;
          }
          if ("rank" in model) {
            if (model.rank && GameRecord.getRankIndexByPlayer(game, model.playerId) !== model.rank - 1) {
              return false;
            }
            if (model.kontenOnly && !game.players.every((x) => new Level(x.level).isKonten())) {
              return false;
            }
          }
          if (extraPredicate && !extraPredicate(game)) {
            return false;
          }
          return true;
        }
      : null;
  const memoDeps = [
    (model.type === undefined && model.selectedMode) || null,
    searchText,
    "rank" in model && model.rank,
    "kontenOnly" in model && model.kontenOnly,
    extraPredicate,
  ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(memoFunc, memoDeps);
}

function useDataAdapterCommon(
  dataProvider: DataProvider,
  onError: (error: Error | ApiError | false) => void,
  deps: React.DependencyList
) {
  const [dataAdapter, setDataAdapter] = useState(() => DUMMY_DATA_ADAPTER);
  const refreshDataAdapter = useCallback(
    (error?: Error | ApiError | false) => {
      if (error) {
        onError(error);
        return;
      }
      const adapter = new DataAdapter(dataProvider);
      setDataAdapter(adapter);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataProvider, onError, ...deps]
  );
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
    try {
      // Preload metadata
      const result = dataProvider.getCountMaybeSync();
      if (result instanceof Promise) {
        result.catch((e) => onError(e));
      }
    } catch (e) {
      onError(e);
    }
  }, [dataProvider, onError]);
  return {
    dataAdapter,
  };
}

export function DataAdapterProvider({ children }: { children: ReactChild | ReactChild[] }) {
  const [model, updateModel] = useModel();
  const [dataProviders] = useState(() => ({} as { [key: string]: DataProvider }));
  const searchPredicate = usePredicate(model);
  const dataProvider = useMemo(() => {
    const key = getProviderKey(model);
    if (!dataProviders[key]) {
      dataProviders[key] = createProvider(model);
    }
    return dataProviders[key];
  }, [model, dataProviders]);
  useEffect(() => dataProvider.setFilterPredicate(searchPredicate), [dataProvider, searchPredicate]);
  const onError = useCallback(
    (e) => {
      if (e && "status" in e && e.status === 404) {
        if (model.type === "player" && model.selectedModes.length) {
          const path = generatePath(model);
          if (path !== sessionStorage.getItem("lastErrorPath")) {
            sessionStorage.setItem("lastErrorPath", path);
            updateModel({
              type: "player",
              playerId: model.playerId,
              selectedModes: [],
              limit: null,
              startDate: null,
              endDate: null,
            });
            return;
          }
        } else if (model.type === "player") {
          updateModel({ type: undefined, selectedMode: null });
          return;
        }
      }
      networkError();
      // updateModel(Model.removeExtraParams(model));
    },
    [model, updateModel]
  );
  const { dataAdapter } = useDataAdapterCommon(dataProvider, onError, [model, searchPredicate]);
  return <DataAdapterContext.Provider value={dataAdapter}>{children}</DataAdapterContext.Provider>;
}

export function DataAdapterProviderCustom({
  provider,
  children,
}: {
  provider: DataProvider;
  children: ReactChild | ReactChild[];
}) {
  const { dataAdapter } = useDataAdapterCommon(provider, noop, []);
  return <DataAdapterContext.Provider value={dataAdapter}>{children}</DataAdapterContext.Provider>;
}
