import React, { useEffect } from "react";
import { useCallback } from "react";
import { ModeSelector } from "../gameRecords/modeSelector";
import { useModel } from "./model";
import Conf from "../../utils/conf";

export default function ModelModeSelector({
  type = "radio" as "radio" | "checkbox",
  availableModes = Conf.availableModes,
  autoSelectFirst = false,
  oneOrAll = false,
}) {
  const [model, updateModel] = useModel();
  const setModes = useCallback((modeId) => updateModel({ selectedModes: modeId }), [updateModel]);
  useEffect(() => {
    if (!availableModes.length) {
      return;
    }
    const selectedModes = (model.selectedModes || []).filter((x) => availableModes.includes(x));
    if (!selectedModes.length) {
      if (autoSelectFirst) {
        updateModel({ selectedModes: [availableModes[0]] });
      } else if (oneOrAll) {
        updateModel({ selectedModes: availableModes });
      }
      return;
    }
    if (oneOrAll && ![1, availableModes.length].includes(selectedModes.length)) {
      updateModel({ selectedModes: availableModes });
      return;
    }
    if (type === "radio" && selectedModes.length > 1) {
      updateModel({ selectedModes: [selectedModes[0]] });
      return;
    }
    if (selectedModes.length !== model.selectedModes.length) {
      updateModel({ selectedModes });
    }
  }, [autoSelectFirst, availableModes, model.selectedModes, oneOrAll, type, updateModel]);
  if (Conf.availableModes.length < 2) {
    return null;
  }
  return (
    <div className="row mb-3">
      <div className="col">
        <ModeSelector type={type} mode={model.selectedModes} onChange={setModes} availableModes={availableModes} />
      </div>
    </div>
  );
}
