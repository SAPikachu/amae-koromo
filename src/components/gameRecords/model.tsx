import dayjs from "dayjs";
import React, { useReducer, useContext, ReactChild } from "react";
import { useMemo } from "react";
import { NUMBER_OF_GAME_MODE } from "../../utils/gameMode";
import { useLocation } from "react-router";

interface WithRuntimeInfo {
  version: number;
  pendingRouteUpdate?: boolean;
}
export interface ListingModel {
  type?: undefined;
  date: dayjs.ConfigType | null;
  selectedModes: Set<string> | null;
  searchText: string;
}
export interface PlayerModel {
  type: "player";
  playerId: string;
  startDate?: dayjs.ConfigType;
  endDate?: dayjs.ConfigType;
}
export type Model = (ListingModel | PlayerModel) & WithRuntimeInfo;
interface ListingModelPlain {
  type?: undefined;
  date: number | null;
  selectedModes: string[] | null;
  searchText: string;
}
export interface PlayerModelPlain {
  type: "player";
  playerId: string;
  startDate?: number;
  endDate?: number;
}
export type ModelPlain = (ListingModelPlain | PlayerModelPlain) & WithRuntimeInfo;
export const Model = Object.freeze({
  toPlain: function(model: Model): ModelPlain {
    if (model.type === "player") {
      return {
        ...model,
        startDate: model.startDate ? dayjs(model.startDate).valueOf() : undefined,
        endDate: model.endDate ? dayjs(model.endDate).valueOf() : undefined,
      };
    }
    return {
      ...model,
      date: model.date ? dayjs(model.date).valueOf() : null,
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
const ModelContext = React.createContext<[Readonly<Model>, DispatchModelUpdate]>([
  { ...DEFAULT_MODEL, version: 0 },
  () => {}
]);
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
      newProps.date = dayjs(newProps.date).valueOf();
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
      (!newProps.date || !oldModel.date || !dayjs(newProps.date).isSame(oldModel.date, "day"))
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
        ? {
            ...((oldModel.type === newProps.type ? oldModel : {}) as Model),
            ...normalizeUpdate(newProps),
            version: oldModel.version + 1,
            pendingRouteUpdate: true
          }
        : oldModel,
    null,
    (): Model => ({
      ...DEFAULT_MODEL,
      ...Model.fromPlain((location.state || {}).model || {}),
      version: new Date().getTime()
    })
  );
  const value: [Model, DispatchModelUpdate] = useMemo(() => [model, updateModel], [model, updateModel]);
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}
