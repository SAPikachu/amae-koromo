import React from "react";
import { useEffect, useState, useCallback } from "react";
import { DATE_MIN } from "../../utils/constants";
import { FormRow } from "../form/formRow";
import { useModel } from "../gameRecords/model";
import { CheckboxGroup, DatePicker } from "../form";
import dayjs from "dayjs";
import { ModeSelector } from "../gameRecords/modeSelector";

enum DateRangeOptions {
  All = "全部",
  Last4Weeks = "最近四周",
  Custom = "自定义"
}
const DATE_RANGE_ITEMS = Object.keys(DateRangeOptions).map((key: string) => ({
  key: DateRangeOptions[key as keyof typeof DateRangeOptions],
  label: DateRangeOptions[key as keyof typeof DateRangeOptions]
}));

export default function PlayerDetailsSettings({ showLevel = false }) {
  const [model, updateModel] = useModel();
  const [mode, setMode] = useState(() => {
    if (model.type !== "player") {
      return DateRangeOptions.All;
    }
    if (!model.startDate) {
      return DateRangeOptions.All;
    }
    if (
      (!model.endDate || dayjs(model.endDate).isSame(dayjs(), "day")) &&
      dayjs(model.startDate).isSame(dayjs().subtract(27, "day"), "day")
    ) {
      return DateRangeOptions.Last4Weeks;
    }
    return DateRangeOptions.Custom;
  });
  const [customDateFrom, setCustomDateFrom] = useState(() =>
    model.type === "player" && model.startDate ? model.startDate : DATE_MIN
  );
  const [customDateTo, setCustomDateTo] = useState(() =>
    model.type === "player" && model.endDate ? model.endDate : dayjs()
  );
  useEffect(() => {
    if (model.type !== "player") {
      return;
    }
    switch (mode) {
      case DateRangeOptions.All:
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: null,
          endDate: null,
          selectedMode: undefined
        });
        break;
      case DateRangeOptions.Last4Weeks:
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: dayjs().subtract(27, "day"),
          endDate: null
        });
        break;
      case DateRangeOptions.Custom:
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: customDateFrom,
          endDate: customDateTo
        });
        break;
    }
  }, [model, mode, customDateFrom, customDateTo, updateModel]);
  const setSelectedMode = useCallback(mode => updateModel({ type: "player", selectedMode: mode }), [updateModel]);
  return (
    <>
      <div className="row">
        <div className="col-6">
          <FormRow title="时间" inline={true}>
            <CheckboxGroup
              type="radio"
              selectedItemKey={mode}
              items={DATE_RANGE_ITEMS}
              groupKey="PlayerDetailsDateRangeSelector"
              onChange={setMode as (x: string) => void}
            />
          </FormRow>
        </div>
        {showLevel && (
          <div className="col-6">
            <FormRow title="等级" inline={true}>
              <ModeSelector mode={model.selectedMode} onChange={setSelectedMode} />
            </FormRow>
          </div>
        )}
      </div>
      {mode === DateRangeOptions.Custom ? (
        <div className="row mt-n3">
          <div className="col-6">
            <FormRow inline={true}>
              <DatePicker min={DATE_MIN} onChange={setCustomDateFrom} date={customDateFrom} className="form-control" />
              <DatePicker min={DATE_MIN} onChange={setCustomDateTo} date={customDateTo} className="form-control" />
            </FormRow>
          </div>
        </div>
      ) : null}
    </>
  );
}
