import { useCallback } from "react";
import React from "react";

import { FormRow, DatePicker, CheckboxGroup } from "../form";
import { GameMode } from "../../utils/dataSource";
import { useModel } from "./model";
import dayjs from "dayjs";
import { DATE_MIN } from "../../utils/constants";

export const MODE_CHECKBOXES = Object.keys(GameMode)
  .filter(x => typeof GameMode[x as keyof typeof GameMode] !== "string")
  .map(x => ({
    key: String(GameMode[x as keyof typeof GameMode]),
    label: x
  }));
MODE_CHECKBOXES.unshift({
  key: "",
  label: "全部"
});

const DEFAULT_DATE = dayjs().startOf("day");

export function FilterPanel({ className = "" }) {
  const [model, updateModel] = useModel();
  const updateSearchTextFromEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateModel({ searchText: e.currentTarget.value }),
    [updateModel]
  );
  const setSelectedItem = useCallback((selectedItemKey: string) => updateModel({ selectedMode: selectedItemKey }), [
    updateModel
  ]);
  const setDate = useCallback((date: dayjs.ConfigType) => updateModel({ date }), [updateModel]);
  if (model.type !== undefined) {
    return null;
  }
  return (
    <div className={className}>
      <FormRow title="日期">
        <DatePicker min={DATE_MIN} date={model.date || DEFAULT_DATE} onChange={setDate} className="form-control" />
      </FormRow>
      <FormRow title="查找玩家">
        <input type="text" className="form-control" value={model.searchText} onChange={updateSearchTextFromEvent} />
      </FormRow>
      <FormRow>
        <CheckboxGroup
          type="radio"
          groupKey="default"
          items={MODE_CHECKBOXES}
          selectedItemKey={model.selectedMode}
          onChange={setSelectedItem}
        />
      </FormRow>
    </div>
  );
}
