/* eslint-disable @typescript-eslint/no-empty-function */

import dayjs from "dayjs";
import { useCallback } from "react";

import { DatePicker as MuiDatePicker, DatePickerProps } from "@mui/lab";
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
  renderInput = null as null | DatePickerProps["renderInput"],
}) {
  const handleChange = useCallback(
    (value: dayjs.Dayjs | null) => onChange(value || dayjs(date).startOf("day")),
    [date, onChange]
  );
  const { t } = useTranslation("form");
  return (
    <MuiDatePicker
      disableCloseOnSelect={false}
      label={t(label)}
      value={dayjs(date)}
      onChange={handleChange}
      ignoreInvalidInputs
      toolbarFormat=" "
      toolbarTitle=""
      mask="____-__-__"
      renderInput={renderInput || ((params: any) => <TextField fullWidth={fullWidth} size={size} {...params} />)} // eslint-disable-line @typescript-eslint/no-explicit-any
      minDate={dayjs(min)}
      maxDate={dayjs(max)}
    />
  );
}
