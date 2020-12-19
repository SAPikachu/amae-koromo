/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";

import dayjs from "dayjs";
import { useCallback } from "react";

export function DatePicker({
  date = dayjs() as dayjs.ConfigType,
  onChange = (() => {}) as (_: dayjs.Dayjs) => void,
  className = "",
  min = 0 as dayjs.ConfigType,
  max = dayjs() as dayjs.ConfigType
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(dayjs(e.currentTarget.value, "YYYY-MM-DD")),
    [onChange]
  );
  return (
    <input
      className={className}
      type="date"
      value={dayjs(date).format("YYYY-MM-DD")}
      min={min ? dayjs(min).format("YYYY-MM-DD") : undefined}
      max={max ? dayjs(max).format("YYYY-MM-DD") : undefined}
      onChange={handleChange}
    />
  );
}
