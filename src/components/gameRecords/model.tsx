import dayjs from "dayjs";
import React, { useReducer, useContext, ReactChild } from "react";
import { useMemo } from "react";
import { useLocation } from "react-router";

interface WithRuntimeInfo {
  version: number;
  pendingRouteUpdate?: boolean;
}
export interface ListingModel {
  type?: undefined;
  date: dayjs.ConfigType | null;
  selectedMode: string;
  searchText: string;
}
export interface PlayerModel {
  type: "player";
  playerId: string;
  startDate: dayjs.ConfigType | null;
  endDate: dayjs.ConfigType | null;
}
export type Model = (ListingModel | PlayerModel) & WithRuntimeInfo;
interface ListingModelPlain {
  type: undefined;
  date: number | null;
  selectedMode: string;
  searchText: string;
}
export interface PlayerModelPlain {
  type: "player";
  playerId: string;
  startDate: number | null;
  endDate: number | null;
}
export type ModelPlain = (ListingModelPlain | PlayerModelPlain) & WithRuntimeInfo;
export const Model = Object.freeze({
  toPlain(model: Model): ModelPlain {
    if (model.type === "player") {
      return {
        ...model,
        startDate: model.startDate ? dayjs(model.startDate).valueOf() : null,
        endDate: model.endDate ? dayjs(model.endDate).valueOf() : null
      };
    }
    return {
      ...model,
      type: undefined,
      date: model.date ? dayjs(model.date).valueOf() : null
    };
  },
  fromPlain(model: ModelPlain): ListingModel | PlayerModel {
    if (model.type === "player") {
      return model;
    }
    if (model.type === undefined) {
      return {
        date: model.date || null,
        searchText: model.searchText || "",
        selectedMode: model.selectedMode
      };
    }
    console.warn("Unknown model data from location state:", model);
    // eslint-disable-next-line no-use-before-define, @typescript-eslint/no-use-before-define
    return DEFAULT_MODEL;
  }
});
type ModelUpdate = Partial<ListingModel> | PlayerModel;
type DispatchModelUpdate = (props: ModelUpdate) => void;

const DEFAULT_MODEL: ListingModel = { date: null, selectedMode: "", searchText: "" };
const ModelContext = React.createContext<[Readonly<Model>, DispatchModelUpdate]>([
  { ...DEFAULT_MODEL, version: 0 },
  () => {}
]);
export const useModel = () => useContext(ModelContext);

function normalizeUpdate(newProps: ModelUpdate): ModelUpdate {
  if (newProps.type === undefined) {
    if (newProps.date) {
      newProps.date = dayjs(newProps.date).valueOf();
    }
  }
  return newProps;
}
function isSameDateValue(d1?: dayjs.ConfigType | null, d2?: dayjs.ConfigType | null): boolean {
  if (d1 === d2) {
    return true;
  }
  if (!d1 || !d2) {
    return false;
  }
  return dayjs(d1).isSame(d2, "day");
}
function isChanged(oldModel: Model, newProps: ModelUpdate): boolean {
  if (oldModel.type !== newProps.type) {
    return true;
  }
  if (oldModel.type === undefined && newProps.type === oldModel.type) {
    if (newProps.date !== undefined && !isSameDateValue(newProps.date, oldModel.date)) {
      return true;
    }
    if (newProps.searchText !== undefined && newProps.searchText !== oldModel.searchText) {
      return true;
    }
    if (newProps.selectedMode !== undefined && newProps.selectedMode !== oldModel.selectedMode) {
      return true;
    }
  }
  if (oldModel.type === "player" && newProps.type === oldModel.type) {
    if (newProps.playerId !== undefined && newProps.playerId !== oldModel.playerId) {
      return true;
    }
    if (newProps.startDate !== undefined && !isSameDateValue(oldModel.startDate, newProps.startDate)) {
      return true;
    }
    if (newProps.endDate !== undefined && !isSameDateValue(oldModel.endDate, newProps.endDate)) {
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
