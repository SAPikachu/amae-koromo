import React from "react";

import { CheckboxGroup } from "../form";
import { GameMode } from "../../data/types";
import Conf from "../../utils/conf";

const MODE_CHECKBOXES = Conf.availableModes.map(x => ({
  key: String(x),
  label: GameMode[x]
}));
MODE_CHECKBOXES.unshift({
  key: "",
  label: "全部"
});

export function ModeSelector({ mode, onChange }: { mode: string; onChange: (x: string) => void }) {
  if (MODE_CHECKBOXES.length < 3) {
    return null;
  }
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
