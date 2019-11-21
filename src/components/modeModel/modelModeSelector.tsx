import React from "react";
import { useCallback } from "react";
import { ModeSelector } from "../gameRecords/modeSelector";
import { useModel } from "./model";

export default function ModelModeSelector() {
  const [model, updateModel] = useModel();
  const setModeId = useCallback(modeId => updateModel({ selectedMode: modeId }), [updateModel]);
  return <ModeSelector mode={model.selectedMode} onChange={setModeId} />;
}
