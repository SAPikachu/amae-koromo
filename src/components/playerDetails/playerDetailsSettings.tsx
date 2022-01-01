import { useCallback } from "react";
import { useModel } from "../gameRecords/model";
import { ModeSelector } from "../gameRecords/modeSelector";
import { GameMode } from "../../data/types";
import { savePlayerPreference } from "../../utils/preference";
import { Box, styled } from "@mui/material";
import ExtraSettings from "./extraSettings";
import DateRangeSetting from "./dateRangeSetting";

const SettingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  [theme.breakpoints.down("md")]: {
    alignItems: "center",
    flexDirection: "column",
  },
  [theme.breakpoints.up("md")]: {
    justifyContent: "space-between",
    alignItems: "center",
  },

  "& > .MuiFormControl-root": {
    display: "flex",
  },
}));

export default function PlayerDetailsSettings({ showLevel = false, availableModes = [] as GameMode[] }) {
  const [model, updateModel] = useModel();
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
      <DateRangeSetting
        start={model.startDate || null}
        end={model.endDate || null}
        onSelectDate={(start, end) =>
          updateModel({
            type: "player",
            playerId: model.playerId,
            startDate: start,
            endDate: end,
          })
        }
      />
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
