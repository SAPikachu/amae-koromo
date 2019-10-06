import { useState, useEffect, useReducer } from "react";
import React from "react";

import { FormRow, DatePicker, CheckboxGroup, CheckboxItem } from "../form";
import { fetchGameRecords, GameMode, GameRecord } from "../../utils/dataSource";
import { eventTargetReducer } from "../../utils";

const MODE_CHECKBOXES = Object.keys(GameMode)
  .filter(x => typeof GameMode[x as keyof typeof GameMode] !== "string")
  .map(x => ({
    key: String(GameMode[x as keyof typeof GameMode]),
    label: x
  }));

const getKeySet = (items: CheckboxItem[]) => new Set(items.map(x => x.key));

export function GameRecordDataController({
  initialDate = undefined as Date | undefined,
  setLoading = (_: boolean) => {},
  setData = (_: GameRecord[]) => {}
}) {
  [initialDate] = useState(() => initialDate || new Date()); // Set default value and remember
  const [date, setDate] = useState(initialDate);
  const [rawData, setRawData] = useState([] as GameRecord[]);
  const [searchText, updateSearchTextFromEvent] = useReducer(
    (_, target: HTMLInputElement) => target.value.trim().toLowerCase(),
    ""
  );
  const [selectedModes, setSelectedItems] = useReducer(
    (_, selectedItems) => getKeySet(selectedItems),
    null,
    () => getKeySet(MODE_CHECKBOXES)
  );
  useEffect(() => {
    let cancelled = false;
    setRawData([]);
    setLoading(true);
    fetchGameRecords(date).then(x => {
      if (cancelled) {
        return;
      }
      setRawData(x);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [date, setLoading]);
  useEffect(
    () =>
      setData(
        rawData.filter(x => {
          if (!selectedModes.has(x.modeId.toString())) {
            return false;
          }
          if (
            searchText &&
            !x.players.some(
              player => player.nickname.toLowerCase().indexOf(searchText) > -1
            )
          ) {
            return false;
          }
          return true;
        })
      ),
    [rawData, selectedModes, searchText, setData]
  );
  return (
    <React.Fragment>
      <FormRow title="日期">
        <DatePicker
          min="2019-08-23"
          className="form-control"
          initialDate={initialDate}
          onChange={setDate}
        />
      </FormRow>
      <FormRow title="查找玩家">
        <input
          type="text"
          className="form-control"
          onChange={eventTargetReducer(updateSearchTextFromEvent)}
        />
      </FormRow>
      <FormRow>
        <CheckboxGroup
          items={MODE_CHECKBOXES}
          checkedItems={MODE_CHECKBOXES}
          onChange={setSelectedItems}
        />
      </FormRow>
    </React.Fragment>
  );
}
