import React, { useMemo } from "react";

import { CheckboxGroup } from "../form";
import { modeLabel, GameMode } from "../../data/types";
import Conf from "../../utils/conf";

export function ModeSelector({
  mode,
  onChange,
  type = "radio",
  availableModes = Conf.availableModes,
}: {
  mode: GameMode[];
  onChange: (x: GameMode[]) => void;
  type?: "checkbox" | "radio";
  availableModes?: GameMode[];
}) {
  const items = useMemo(
    () =>
      availableModes.map((x) => ({
        key: String(x),
        label: modeLabel(x),
        value: x,
      })),
    [availableModes]
  );
  if (items.length < 1) {
    return null;
  }
  return (
    <CheckboxGroup
      type={type}
      groupKey="ModeSelector"
      items={items}
      selectedItems={mode.map((x) => x.toString())}
      onChange={(newItems) => onChange(newItems.map((x) => x.value))}
    />
  );
}
