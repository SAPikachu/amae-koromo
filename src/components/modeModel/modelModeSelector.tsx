import React, { useEffect, useMemo } from "react";
import { useCallback } from "react";
import { ModeSelector } from "../gameRecords/modeSelector";
import { useModel } from "./model";
import Conf from "../../utils/conf";
import { GameMode } from "../../data/types";
import { Box } from "@mui/material";

export default function ModelModeSelector({
  type = "radio" as "radio" | "checkbox",
  availableModes = Conf.availableModes,
  autoSelectFirst = false,
  oneOrAll = false,
  allowedCombinations = null as null | GameMode[][],
}) {
  allowedCombinations = useMemo(
    () => allowedCombinations || (oneOrAll ? [availableModes] : null),
    [allowedCombinations, oneOrAll, availableModes]
  );
  const [model, updateModel] = useModel();
  const uiSetModes = useCallback(
    (modes: GameMode[]) => {
      if (!availableModes.length) {
        return;
      }
      modes = modes.filter((x) => availableModes.includes(x));
      if (!modes.length) {
        return;
      }
      if (type === "radio") {
        if (model.selectedModes[0] !== modes[0]) {
          updateModel({ selectedModes: [modes[0]] });
        }
        return;
      }
      if (modes.length > 1 && allowedCombinations) {
        const isAllowed = allowedCombinations.some(
          (comb) => modes.length === comb.length && modes.every((m) => comb.includes(m))
        );
        if (!isAllowed) {
          let newAllowedCombinations = allowedCombinations.filter((comb) => modes.every((mode) => comb.includes(mode)));
          if (newAllowedCombinations.length > 0) {
            const removed = model.selectedModes.find((x) => !modes.includes(x));
            if (removed) {
              const filteredCombinations = newAllowedCombinations.filter((x) => !x.includes(removed));
              if (!filteredCombinations.length) {
                return;
              }
              newAllowedCombinations = filteredCombinations;
            }
          }
          if (newAllowedCombinations.length > 0) {
            modes = newAllowedCombinations[0];
          } else {
            const added = modes.find((x) => !model.selectedModes.includes(x));
            if (!added) {
              return;
            }
            modes = [added];
          }
        }
      }
      if (modes.length === model.selectedModes.length && modes.every((x) => model.selectedModes.includes(x))) {
        return;
      }
      updateModel({ selectedModes: modes });
    },
    [updateModel, availableModes, model, allowedCombinations, type]
  );
  useEffect(() => {
    if (!availableModes.length) {
      return;
    }
    let selectedModes = (model.selectedModes || []).filter((x) => availableModes.includes(x));
    if (
      allowedCombinations &&
      selectedModes.length > 1 &&
      !allowedCombinations.some(
        (comb) => comb.length === selectedModes.length && comb.every((mode) => selectedModes.includes(mode))
      )
    ) {
      selectedModes = [];
    }
    if (type === "radio" && selectedModes.length > 1) {
      selectedModes = [selectedModes[0]];
    }

    if (!selectedModes.length) {
      if (autoSelectFirst) {
        updateModel({ selectedModes: [availableModes[0]] });
      } else if (allowedCombinations) {
        updateModel({ selectedModes: allowedCombinations[0] });
      }
      return;
    }
    if (
      selectedModes.length === model.selectedModes.length &&
      selectedModes.every((x) => model.selectedModes.includes(x))
    ) {
      return;
    }
    updateModel({ selectedModes });
  }, [autoSelectFirst, availableModes, model.selectedModes, allowedCombinations, type, updateModel]);
  if (availableModes.length < 2) {
    return null;
  }
  return (
    <Box
      mb={3}
      visibility={
        allowedCombinations &&
        model.selectedModes.length !== 1 &&
        !allowedCombinations.some(
          (x) => x.length === model.selectedModes.length && x.every((mode) => model.selectedModes.includes(mode))
        )
          ? "hidden"
          : "visible"
      }
    >
      <ModeSelector type={type} mode={model.selectedModes} onChange={uiSetModes} availableModes={availableModes} />
    </Box>
  );
}
