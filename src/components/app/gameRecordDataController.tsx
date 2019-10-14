import { useState, useEffect, useReducer } from "react";
import React from "react";

import { FormRow, DatePicker, CheckboxGroup, CheckboxItem } from "../form";
import { GameMode, GameRecord, DataProvider } from "../../utils/dataSource";
import { eventTargetReducer } from "../../utils";
import moment from "moment";

const MODE_CHECKBOXES = Object.keys(GameMode)
  .filter(x => typeof GameMode[x as keyof typeof GameMode] !== "string")
  .map(x => ({
    key: String(GameMode[x as keyof typeof GameMode]),
    label: x,
  }));

const getKeySet = (items: CheckboxItem[]) => new Set(items.map(x => x.key));

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

export class DummyDataAdapter implements IDataAdapter {
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

class DataAdapter implements IDataAdapter {
  _provider: DataProvider;
  _onDataUpdate: () => void;
  _triggeredRequest: boolean;

  constructor(provider: DataProvider, onDataUpdate = () => {}) {
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
  cancelUpdateHook() {
    this._onDataUpdate = () => {};
  }
}

export function GameRecordDataController({
  initialDate = undefined as Date | undefined,
  setData = (_: IDataAdapter) => {},
}) {
  [initialDate] = useState(() => initialDate || new Date()); // Set default value and remember
  const [dataProviders] = useState(() => ({ [dateToProviderKey(initialDate)]: new DataProvider(initialDate) }));
  const [dataProvider, setDate] = useReducer((_, date: Date) => {
    const key = dateToProviderKey(date);
    if (!dataProviders[key]) {
      dataProviders[key] = new DataProvider(date);
    }
    return dataProviders[key];
  }, dataProviders[dateToProviderKey(initialDate)]);
  const [dataAdapter, setDataAdapter] = useState(() => new DataAdapter(dataProvider));
  const [searchText, updateSearchTextFromEvent] = useReducer(
    (_, target: HTMLInputElement) => target.value.trim().toLowerCase(),
    "",
  );
  const [selectedModes, setSelectedItems] = useReducer((_, selectedItems) => getKeySet(selectedItems), null, () =>
    getKeySet(MODE_CHECKBOXES),
  );
  useEffect(
    () =>
      dataProvider.setFilterPredicate(
        searchText || selectedModes.size < MODE_CHECKBOXES.length
          ? game => {
              if (!selectedModes.has(game.modeId.toString())) {
                return false;
              }
              if (searchText && !game.players.some(player => player.nickname.toLowerCase().indexOf(searchText) > -1)) {
                return false;
              }
              return true;
            }
          : null,
      ),
    [selectedModes, searchText, dataProvider],
  );
  useEffect(() => {
    let adapter: DataAdapter | null = null;
    function onDataUpdate() {
      if (adapter) {
        adapter.cancelUpdateHook();
      }
      adapter = new DataAdapter(dataProvider, onDataUpdate);
      setDataAdapter(adapter);
    }
    onDataUpdate();
    return () => (adapter ? adapter.cancelUpdateHook() : undefined);
  }, [dataProvider, selectedModes, searchText]);
  useEffect(() => setData(dataAdapter), [setData, dataAdapter]);
  return (
    <React.Fragment>
      <FormRow title="日期">
        <DatePicker min="2019-08-23" className="form-control" initialDate={initialDate} onChange={setDate} />
      </FormRow>
      <FormRow title="查找玩家">
        <input type="text" className="form-control" onChange={eventTargetReducer(updateSearchTextFromEvent)} />
      </FormRow>
      <FormRow>
        <CheckboxGroup items={MODE_CHECKBOXES} checkedItems={MODE_CHECKBOXES} onChange={setSelectedItems} />
      </FormRow>
    </React.Fragment>
  );
}
