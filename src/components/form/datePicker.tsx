/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";

import dayjs from "dayjs";
import { useCallback } from "react";

import AdapterDayJs from "@mui/lab/AdapterDayjs";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/lab";
import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

export function DatePicker({
  date = dayjs() as dayjs.ConfigType,
  onChange = (() => {}) as (_: dayjs.Dayjs) => void,
  min = 0 as dayjs.ConfigType,
  max = dayjs() as dayjs.ConfigType,
  label = "",
  fullWidth = false,
  size = "medium" as "medium" | "small",
}) {
  const handleChange = useCallback((value: dayjs.Dayjs | null) => onChange(value || dayjs(date)), [date, onChange]);
  const { t } = useTranslation("form");
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayJs}
      dateFormats={{
        month: "MM",
        monthShort: "MM",
        monthAndDate: "MM-DD",
        monthAndYear: "YYYY-MM",
        fullDate: "YYYY-MM-DD",
        keyboardDate: "YYYY-MM-DD",
      }}
    >
      <MuiDatePicker
        disableCloseOnSelect={false}
        label={t(label)}
        value={dayjs(date)}
        onChange={handleChange}
        ignoreInvalidInputs
        toolbarFormat=" "
        toolbarTitle=""
        mask="____-__-__"
        renderInput={(params: any) => <TextField fullWidth={fullWidth} size={size} {...params} />} // eslint-disable-line @typescript-eslint/no-explicit-any
        minDate={dayjs(min)}
        maxDate={dayjs(max)}
      />
    </LocalizationProvider>
  );
}
