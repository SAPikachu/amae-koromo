/* eslint-disable @typescript-eslint/no-empty-function */
import dayjs from "dayjs";
import React, { useReducer, useContext, ReactChild, useMemo } from "react";
import { useHistory } from "react-router";
import { useEventCallback } from "../../utils";
import { generatePath } from "./routeUtils";
import { GameMode } from "../../data/types";

export interface ListingModel {
  type: undefined;
  date: dayjs.ConfigType | null;
  selectedMode: GameMode | null;
  searchText: string;
}
export interface PlayerModel {
  type: "player";
  playerId: string;
  startDate: dayjs.ConfigType | null;
  endDate: dayjs.ConfigType | null;
  selectedModes: GameMode[];
  searchText: string;
  rank: number | null;
  kontenOnly: boolean;
  limit: number | null;
}
export type Model = ListingModel | PlayerModel;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Model = Object.freeze({
  removeExtraParams(model: Model): Model {
    if (model.type === "player") {
      return {
        type: "player",
        playerId: model.playerId,
        selectedModes: [],
        startDate: null,
        endDate: null,
        searchText: "",
        rank: null,
        kontenOnly: false,
        limit: null,
      };
    }
    return {
      type: undefined,
      searchText: "",
      selectedMode: null,
      date: null,
    };
  },
  hasAdvancedParams(model: Model): boolean {
    return Boolean("rank" in model && (model.searchText || model.rank || model.kontenOnly));
  },
});
type ModelUpdate = Partial<ListingModel> | ({ type: "player" } & Partial<PlayerModel>);
type DispatchModelUpdate = (props: ModelUpdate) => void;

const DEFAULT_MODEL: ListingModel = { type: undefined, date: null, selectedMode: null, searchText: "" };
const ModelContext = React.createContext<[Readonly<Model>, DispatchModelUpdate]>([DEFAULT_MODEL, () => {}]);
export const useModel = () => useContext(ModelContext);

function normalizeUpdate(newProps: ModelUpdate): ModelUpdate {
  if (newProps.type === undefined) {
    if (newProps.date) {
      const isDateOnly = typeof newProps.date === "string" && !/^\d{6,}$/.test(newProps.date);
      newProps.date = isDateOnly ? dayjs(newProps.date).startOf("date").valueOf() : dayjs(newProps.date).valueOf();
    }
  }
  for (const key of Object.keys(newProps)) {
    if (key !== "type" && newProps[key as keyof typeof newProps] === undefined) {
      delete newProps[key as keyof typeof newProps];
    }
  }
  return newProps;
}
function isSameModel(a: Model, b: Model): boolean {
  return generatePath(a) === generatePath(b);
}

const OnRouteModelUpdatedContext = React.createContext((() => {}) as (model: Model) => void);
export const useOnRouteModelUpdated = () => useContext(OnRouteModelUpdatedContext);

export function ModelProvider({ children }: { children: ReactChild | ReactChild[] }) {
  const history = useHistory();
  const [model, setModel] = useReducer(
    (oldModel: Model, newModel: Model): Readonly<Model> => {
      if (isSameModel(oldModel, newModel)) {
        return oldModel;
      }
      return Object.freeze(newModel);
    },
    undefined,
    () => Object.freeze(DEFAULT_MODEL as Model)
  );
  const dispatchModelUpdate = useEventCallback(
    (newProps: ModelUpdate) => {
      const newModel = {
        ...((model.type === newProps.type ? model : {}) as Model),
        ...(normalizeUpdate(newProps) as Model),
      };
      if (newModel.type === "player" && (!newModel.selectedModes || !newModel.selectedModes.length)) {
        if (
          model.type === undefined &&
          model.selectedMode &&
          (!newModel.selectedModes || !newModel.selectedModes.length)
        ) {
          newModel.selectedModes = [model.selectedMode];
        } else {
          newModel.selectedModes = [];
        }
      }
      if (isSameModel(model, newModel)) {
        return;
      }
      history.replace(generatePath(newModel));
    },
    [model, history]
  );
  const value = useMemo(
    () => [model, dispatchModelUpdate] as [Readonly<Model>, DispatchModelUpdate],
    [model, dispatchModelUpdate]
  );
  return (
    <ModelContext.Provider value={value}>
      <OnRouteModelUpdatedContext.Provider value={setModel}>{children}</OnRouteModelUpdatedContext.Provider>
    </ModelContext.Provider>
  );
}
