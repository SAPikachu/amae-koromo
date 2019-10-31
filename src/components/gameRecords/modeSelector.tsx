import React from "react";

import { CheckboxGroup } from "../form";
import { GameMode } from "../../utils/dataSource";

const MODE_CHECKBOXES = Object.keys(GameMode)
  .filter(x => typeof GameMode[x as keyof typeof GameMode] !== "string")
  .map(x => ({
    key: String(GameMode[x as keyof typeof GameMode]),
    label: x
  }));
MODE_CHECKBOXES.unshift({
  key: "",
  label: "全部"
});

export function ModeSelector({ mode, onChange }: { mode: string; onChange: (x: string) => void }) {
  return (
    <CheckboxGroup
      type="radio"
      groupKey="ModeSelector"
      items={MODE_CHECKBOXES}
      selectedItemKey={mode || ""}
      onChange={onChange}
    />
  );
}
