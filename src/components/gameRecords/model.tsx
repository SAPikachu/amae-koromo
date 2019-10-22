import { MomentInput } from "moment";
import moment from "moment";
import React, { useReducer, useContext, ReactChild } from "react";
import { useMemo } from "react";
import { NUMBER_OF_GAME_MODE } from "../../utils/gameMode";
import { useLocation } from "react-router";

interface WithVersion {
  version: number;
}
export interface ListingModel {
  type?: undefined;
  date: MomentInput | null;
  selectedModes: Set<string> | null;
  searchText: string;
}
export interface PlayerModel {
  type: "player";
  playerId: string;
}
export type Model = (ListingModel | PlayerModel) & WithVersion;
interface ListingModelPlain {
  type?: undefined;
  date: number | null;
  selectedModes: string[] | null;
  searchText: string;
}
export type ModelPlain = (ListingModelPlain | PlayerModel) & WithVersion;
export const ModelUtils = Object.freeze({
  toPlain: function(model: Model): ModelPlain {
    if (model.type === "player") {
      return model;
    }
    return {
      ...model,
      date: model.date ? moment(model.date).valueOf() : null,
      selectedModes: model.selectedModes ? Array.from(model.selectedModes) : null
    };
  },
  fromPlain: function(model: ModelPlain): ListingModel | PlayerModel {
    if (model.type === "player") {
      return model;
    }
    if (model.type === undefined) {
      return {
        date: model.date || null,
        searchText: model.searchText || "",
        selectedModes: model.selectedModes ? new Set(model.selectedModes) : null
      };
    }
    console.warn("Unknown model data from location state:", model);
    return DEFAULT_MODEL;
  }
});
type ModelUpdate = Partial<ListingModel> | PlayerModel;
type DispatchModelUpdate = (props: ModelUpdate) => void;

const DEFAULT_MODEL: ListingModel = { date: null, selectedModes: null, searchText: "" };
const ModelContext = React.createContext<[Readonly<Model>, DispatchModelUpdate]>([{...DEFAULT_MODEL, version: 0}, () => {}]);
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
  if (newProps.type === undefined) {
    if (newProps.date) {
      newProps.date = moment(newProps.date).valueOf();
    }
    if (newProps.selectedModes && newProps.selectedModes.size >= NUMBER_OF_GAME_MODE) {
      newProps.selectedModes = null;
    }
  }
  return newProps;
}
function isChanged(oldModel: Model, newProps: ModelUpdate): boolean {
  if (oldModel.type !== newProps.type) {
    return true;
  }
  if (oldModel.type === undefined && newProps.type === oldModel.type) {
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
  }
  if (oldModel.type === "player" && newProps.type === oldModel.type) {
    if (newProps.playerId !== undefined && newProps.playerId !== oldModel.playerId) {
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
    (): Model => ({
      ...DEFAULT_MODEL,
      ...ModelUtils.fromPlain((location.state || {}).model || {}),
      version: new Date().getTime()
    })
  );
  const value: [Model, DispatchModelUpdate] = useMemo(() => [model, updateModel], [model, updateModel]);
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}
