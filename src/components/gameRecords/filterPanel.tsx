import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { DatePicker } from "../form";
import { useModel } from "./model";
import dayjs from "dayjs";
import { ModeSelector } from "./modeSelector";
import Conf from "../../utils/conf";
import { GameMode } from "../../data/types";
import { Box } from "@mui/material";

const DEFAULT_DATE = dayjs().startOf("day");

export function FilterPanel() {
  const { t } = useTranslation();
  const [model, updateModel] = useModel();
  const setMode = useCallback((mode: GameMode[]) => updateModel({ selectedMode: mode[0] || null }), [updateModel]);
  const setDate = useCallback(
    (date: dayjs.ConfigType) => updateModel({ date: date ? dayjs(date).startOf("day") : date }),
    [updateModel]
  );
  if (model.type !== undefined) {
    return null;
  }
  return (
    <>
      <DatePicker fullWidth label={t("日期")} min={Conf.dateMin} date={model.date || DEFAULT_DATE} onChange={setDate} />
      {Conf.availableModes.length > 1 && (
        <Box mt={1}>
          <ModeSelector mode={model.selectedMode ? [model.selectedMode] : []} onChange={setMode} />
        </Box>
      )}
    </>
  );
}
