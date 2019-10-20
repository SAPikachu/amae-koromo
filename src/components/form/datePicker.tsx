import React from "react";

import moment from "moment";
import { useCallback } from "react";
import { MomentInput } from "moment";

export function DatePicker({
  date = moment() as MomentInput,
  onChange = (_: MomentInput) => {},
  className = "",
  min = undefined as MomentInput,
  max = moment() as MomentInput
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(moment(e.currentTarget.value, "YYYY-MM-DD")),
    [onChange]
  );
  return (
    <input
      className={className}
      type="date"
      value={moment(date).format("YYYY-MM-DD")}
      min={min ? moment(min).format("YYYY-MM-DD") : undefined}
      max={max ? moment(max).format("YYYY-MM-DD") : undefined}
      onChange={handleChange}
    />
  );
}
