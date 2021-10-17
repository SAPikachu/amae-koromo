import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useModel } from "../gameRecords/model";
import { CheckboxGroup, DatePicker } from "../form";
import dayjs from "dayjs";
import { ModeSelector } from "../gameRecords/modeSelector";
import Conf from "../../utils/conf";
import { GameMode } from "../../data/types";
import { savePlayerPreference } from "../../utils/preference";
import { useLocation } from "react-router-dom";
import { generatePath } from "../gameRecords/routes";
import { Box, styled } from "@mui/material";
import ExtraSettings from "./extraSettings";

enum DateRangeOptions {
  All = "全部",
  Last4Weeks = "最近四周",
  Custom = "自定义",
}
const DATE_RANGE_ITEMS = Object.keys(DateRangeOptions).map((key: string) => ({
  key: DateRangeOptions[key as keyof typeof DateRangeOptions],
  label: DateRangeOptions[key as keyof typeof DateRangeOptions],
  value: DateRangeOptions[key as keyof typeof DateRangeOptions],
}));


const SettingContainer = styled(Box)(({ theme }) => ({
  "& > .MuiFormControl-root": {
    display: "flex",
  },
  [theme.breakpoints.up("md")]: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

export default function PlayerDetailsSettings({ showLevel = false, availableModes = [] as GameMode[] }) {
  const [model, updateModel] = useModel();
  const location = useLocation();
  const [mode, setMode] = useState(() => {
    if (model.type !== "player") {
      return DateRangeOptions.All;
    }
    if (!model.startDate) {
      return DateRangeOptions.All;
    }
    return DateRangeOptions.Custom;
  });
  const [customDateFrom, setCustomDateFrom] = useState(() =>
    model.type === "player" && model.startDate ? model.startDate : Conf.dateMin
  );
  const [customDateTo, setCustomDateTo] = useState(() =>
    model.type === "player" && model.endDate ? model.endDate : dayjs()
  );
  const updateModeFromUi = useCallback(
    (newMode: DateRangeOptions) => {
      if (mode === newMode) {
        return;
      }
      if (model.type !== "player") {
        return;
      }
      if (newMode === DateRangeOptions.All) {
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate: null,
          endDate: null,
        });
      } else if (newMode === DateRangeOptions.Last4Weeks) {
        const startDate = dayjs().subtract(27, "day");
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate,
          endDate: null,
        });
        setCustomDateFrom(startDate);
        setCustomDateTo(dayjs());
      } else if (newMode === DateRangeOptions.Custom) {
        if (model.type !== "player") {
          return;
        }
        const startDate = dayjs(mode === DateRangeOptions.Last4Weeks ? model.startDate || Conf.dateMin : Conf.dateMin);
        updateModel({
          type: "player",
          playerId: model.playerId,
          startDate,
          endDate: dayjs(),
        });
        setCustomDateFrom(startDate);
        setCustomDateTo(dayjs());
      }
      setMode(newMode);
    },
    [mode, model, updateModel]
  );
  useEffect(() => {
    if (model.type !== "player") {
      return;
    }
    if (
      location.pathname.replace(/\/[^/]*[a-z][^/]*(\?[^?]*)?$/i, "") !== generatePath(model).replace(/(\?[^?]*)?$/i, "")
    ) {
      return;
    }
    if (model.startDate === null && model.endDate === null && mode !== DateRangeOptions.All) {
      if (mode === DateRangeOptions.Custom) {
        setCustomDateFrom(Conf.dateMin);
        setCustomDateTo(dayjs());
      } else if (mode === DateRangeOptions.Last4Weeks) {
        setMode(DateRangeOptions.All);
      }
      return;
    }
    if (mode === DateRangeOptions.Custom) {
      if (dayjs(customDateTo).isBefore(customDateFrom)) {
        let to = dayjs(customDateFrom).endOf("day");
        if (to.isAfter(new Date())) {
          to = dayjs().endOf("day");
        }
        setCustomDateTo(to);
        if (dayjs(customDateTo).isBefore(customDateFrom)) {
          setCustomDateFrom(dayjs(to).startOf("day"));
        }
        return;
      }
      updateModel({
        type: "player",
        playerId: model.playerId,
        startDate: customDateFrom,
        endDate: customDateTo,
      });
    }
  }, [model, mode, customDateFrom, customDateTo, updateModel, location.pathname]);
  const setSelectedMode = useCallback(
    (mode) => {
      if (mode.length && model.type === "player") {
        savePlayerPreference("modePreference", model.playerId, mode);
      }
      updateModel({ type: "player", selectedModes: mode });
    },
    [model, updateModel]
  );
  if (model.type !== "player") {
    return null;
  }
  return (
    <SettingContainer mt={3}>
      <Box>
        <CheckboxGroup
          type="radio"
          selectedItems={[mode]}
          items={DATE_RANGE_ITEMS}
          onChange={(items) => updateModeFromUi(items[0].value)}
        />
        {mode === DateRangeOptions.Custom ? (
          <Box display="grid" gridTemplateColumns="10rem 10rem">
            <DatePicker size="small" min={Conf.dateMin} onChange={setCustomDateFrom} date={customDateFrom} />
            <DatePicker size="small" min={Conf.dateMin} onChange={setCustomDateTo} date={customDateTo} />
          </Box>
        ) : null}
      </Box>
      {showLevel && availableModes.length > 0 && (
        <ModeSelector
          type="checkbox"
          mode={model.selectedModes}
          onChange={setSelectedMode}
          availableModes={availableModes}
          i18nNamespace="gameModeShort"
        />
      )}
      <ExtraSettings />
    </SettingContainer>
  );
}
