import React from "react";
import { useCallback } from "react";
import { ModeSelector } from "../gameRecords/modeSelector";
import { useModel } from "./model";
import Conf from "../../utils/conf";

export default function ModelModeSelector() {
  const [model, updateModel] = useModel();
  const setModeId = useCallback(modeId => updateModel({ selectedModes: modeId }), [updateModel]);
  if (Conf.availableModes.length < 2) {
    return null;
  }
  return (
    <div className="row mb-3">
      <div className="col">
        <ModeSelector mode={model.selectedModes} onChange={setModeId} />
      </div>
    </div>
  );
}
