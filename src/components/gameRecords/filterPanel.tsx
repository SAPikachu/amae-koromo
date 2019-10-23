import { useCallback } from "react";
import React from "react";

import { FormRow, DatePicker, CheckboxGroup } from "../form";
import { GameMode } from "../../utils/dataSource";
import { useModel } from "./model";
import { MomentInput } from "moment";
import moment from "moment";

export const MODE_CHECKBOXES = Object.keys(GameMode)
  .filter(x => typeof GameMode[x as keyof typeof GameMode] !== "string")
  .map(x => ({
    key: String(GameMode[x as keyof typeof GameMode]),
    label: x
  }));

const DEFAULT_DATE = moment().startOf("day");

export function FilterPanel() {
  const [model, updateModel] = useModel();
  const updateSearchTextFromEvent = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => updateModel({ searchText: e.currentTarget.value }),
    [updateModel]
  );
  const setSelectedItems = useCallback(
    (selectedItemKeys: Set<string>) => updateModel({ selectedModes: selectedItemKeys }),
    [updateModel]
  );
  const setDate = useCallback((date: MomentInput) => updateModel({ date }), [updateModel]);
  if (model.type !== undefined) {
    return null;
  }
  return (
    <React.Fragment>
      <FormRow title="日期">
        <DatePicker min="2019-08-23" date={model.date || DEFAULT_DATE} onChange={setDate} className="form-control" />
      </FormRow>
      <FormRow title="查找玩家">
        <input type="text" className="form-control" value={model.searchText} onChange={updateSearchTextFromEvent} />
      </FormRow>
      <FormRow>
        <CheckboxGroup items={MODE_CHECKBOXES} selectedItemKeys={model.selectedModes} onChange={setSelectedItems} />
      </FormRow>
    </React.Fragment>
  );
}
