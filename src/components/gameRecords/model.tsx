import { MomentInput } from "moment";
import moment from "moment";
import React, { useReducer, useContext, ReactChild } from "react";
import { useMemo } from "react";
import { NUMBER_OF_GAME_MODE } from "../../utils/gameMode";
import { useLocation } from "react-router";

export interface Model {
  date: MomentInput | null;
  selectedModes: Set<string> | null;
  searchText: string;
  version: number;
}
export interface ModelPlain {
  date: number | null;
  selectedModes: string[] | null;
  searchText: string;
  version: number;
}
export const ModelUtils = Object.freeze({
  toPlain: function(model: Model): ModelPlain {
    return {
      date: model.date ? moment(model.date).valueOf() : null,
      searchText: model.searchText,
      selectedModes: model.selectedModes ? Array.from(model.selectedModes) : null,
      version: model.version
    };
  },
  fromPlain: function(model: ModelPlain): Partial<Model> {
    return {
      date: model.date || null,
      searchText: model.searchText || "",
      selectedModes: model.selectedModes ? new Set(model.selectedModes) : null
    };
  }
});
type ModelUpdate = Partial<Model>;
type DispatchModelUpdate = (props: ModelUpdate) => void;

const DEFAULT_MODEL: Model = { date: null, selectedModes: null, searchText: "", version: 0 };
const ModelContext = React.createContext<[Readonly<Model>, DispatchModelUpdate]>([DEFAULT_MODEL, () => {}]);
export const useModel = () => useContext(ModelContext);

function isSameSet<T>(set: Set<T>, other: Set<T>) {
  if (set.size !== other.size) {
    return false;
  }
  for (const elem of other) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
}

function normalizeUpdate(newProps: ModelUpdate): ModelUpdate {
  if (newProps.date) {
    newProps.date = moment(newProps.date).valueOf();
  }
  if (newProps.selectedModes && newProps.selectedModes.size >= NUMBER_OF_GAME_MODE) {
    newProps.selectedModes = null;
  }
  return newProps;
}
function isChanged(oldModel: Model, newProps: ModelUpdate): boolean {
  if (
    newProps.date !== undefined &&
    newProps.date !== oldModel.date &&
    (!newProps.date || !oldModel.date || !moment(newProps.date).isSame(oldModel.date, "day"))
  ) {
    return true;
  }
  if (newProps.searchText !== undefined && newProps.searchText !== oldModel.searchText) {
    return true;
  }
  let newSelectedModes = newProps.selectedModes;
  if (newSelectedModes && newSelectedModes.size >= NUMBER_OF_GAME_MODE) {
    newSelectedModes = null;
  }
  if (newSelectedModes !== undefined && newSelectedModes !== oldModel.selectedModes) {
    if (!newSelectedModes || !oldModel.selectedModes) {
      return true;
    }
    if (isSameSet(oldModel.selectedModes, newSelectedModes)) {
      return true;
    }
  }
  return false;
}

export function ModelProvider({ children }: { children: ReactChild | ReactChild[] }) {
  const location = useLocation();
  const [model, updateModel] = useReducer(
    (oldModel: Model, newProps: ModelUpdate): Model =>
      isChanged(oldModel, newProps)
        ? { ...oldModel, ...normalizeUpdate(newProps), version: oldModel.version + 1 }
        : oldModel,
    null,
    (): Model => ({ ...DEFAULT_MODEL, ...ModelUtils.fromPlain((location.state || {}).model || {}), version: 0 })
  );
  const value: [Model, DispatchModelUpdate] = useMemo(() => [model, updateModel], [model, updateModel]);
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}
