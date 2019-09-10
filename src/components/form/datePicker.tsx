import React from "react";

import moment from "moment";
import { useReducer, useEffect } from "react";
import { eventTargetReducer } from "../../utils";

export function DatePicker({
  initialDate = undefined as Date,
  onChange = (_: Date) => {},
  className = "",
  min = undefined as moment.MomentInput,
  max = moment() as moment.MomentInput,
}) {
  const [date, handleChange] = useReducer((_, target: HTMLInputElement) => moment(target.value, "YYYY-MM-DD").toDate(), initialDate || new Date());
  useEffect(() => onChange(date), [date, onChange]);
  return (
    <input
      className={className}
      type="date"
      value={moment(date).format("YYYY-MM-DD")}
      min={min ? moment(min).format("YYYY-MM-DD") : undefined}
      max={max ? moment(max).format("YYYY-MM-DD") : undefined}
      onChange={eventTargetReducer(handleChange)}
    />
  );
}
