import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import React, { ReactChild } from "react";
import moment from "moment";

import { DataProvider, GameRecord, NUMBER_OF_GAME_MODE, FilterPredicate } from "../../utils/dataSource";
import { useModel } from "./model";

const dateToProviderKey = (date: moment.MomentInput) =>
  moment(date)
    .startOf("day")
    .valueOf()
    .toString();

interface ItemLoadingPlaceholder {
  loading: boolean;
}

const loadingPlaceholder = { loading: true };

export interface IDataAdapter {
  getCount(): number;
  getUnfilteredCount(): number;
  getItem(index: number): GameRecord | ItemLoadingPlaceholder;
  isItemLoaded(index: number): boolean;
}

class _DummyDataAdapter implements IDataAdapter {
  getCount(): number {
    return 0;
  }
  getUnfilteredCount(): number {
    return 0;
  }
  getItem(index: number): GameRecord | ItemLoadingPlaceholder {
    return loadingPlaceholder;
  }
  isItemLoaded(index: number): boolean {
    return false;
  }
}

export const DUMMY_DATA_ADAPTER = new _DummyDataAdapter() as IDataAdapter;

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
  _installHook(promise: Promise<any>) {
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
  getItem(index: number): GameRecord | ItemLoadingPlaceholder {
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

export function DataAdapterProvider({ children }: { children: ReactChild | ReactChild[] }) {
  const [model] = useModel();
  const date = model.date || moment();
  const [dataProviders] = useState(() => ({ [dateToProviderKey(date)]: new DataProvider(date) }));
  const searchText = (model.searchText || "").trim();
  const searchPredicate: FilterPredicate = useMemo(
    () =>
      searchText || (model.selectedModes && model.selectedModes.size < NUMBER_OF_GAME_MODE)
        ? game => {
            if (model.selectedModes && !model.selectedModes.has(game.modeId.toString())) {
              return false;
            }
            if (searchText && !game.players.some(player => player.nickname.toLowerCase().indexOf(searchText) > -1)) {
              return false;
            }
            return true;
          }
        : null,
    [model.selectedModes, searchText]
  );
  const dataProvider = useMemo(() => {
    const key = dateToProviderKey(date);
    if (!dataProviders[key]) {
      dataProviders[key] = new DataProvider(date);
    }
    return dataProviders[key];
  }, [date, dataProviders]);
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
  return <DataAdapterContext.Provider value={dataAdapter}>{children}</DataAdapterContext.Provider>;
}
