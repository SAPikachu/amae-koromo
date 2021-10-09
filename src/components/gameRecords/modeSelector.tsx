import React, { useMemo } from "react";

import { CheckboxGroup } from "../form";
import { GameMode, modeLabelNonTranslated } from "../../data/types";
import Conf from "../../utils/conf";
import { useTranslation } from "react-i18next";

export function ModeSelector({
  mode,
  onChange,
  label = "",
  type = "radio",
  availableModes = Conf.availableModes,
  i18nNamespace = undefined,
}: {
  mode: GameMode[];
  onChange: (x: GameMode[]) => void;
  label?: string;
  type?: "checkbox" | "radio";
  availableModes?: GameMode[];
  i18nNamespace?: string | string[] | undefined;
}) {
  useTranslation();
  const items = useMemo(
    () =>
      availableModes.map((x) => ({
        key: String(x),
        label: modeLabelNonTranslated(x),
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
      label={label}
      items={items}
      selectedItems={mode.map((x) => x.toString())}
      onChange={(newItems) => onChange(newItems.map((x) => x.value))}
      i18nNamespace={i18nNamespace}
    />
  );
}
