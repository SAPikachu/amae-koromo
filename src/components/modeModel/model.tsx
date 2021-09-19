import React, { useReducer, useContext, ReactChild } from "react";
import { useMemo } from "react";
import { GameMode } from "../../data/types";

export interface Model {
  selectedModes: GameMode[];
  careerRankingMinGames?: number;
}

type ModelUpdate = Partial<Model>;
type DispatchModelUpdate = (props: ModelUpdate) => void;

const DEFAULT_MODEL: Model = { selectedModes: [] };
// eslint-disable-next-line @typescript-eslint/no-empty-function
const ModelContext = React.createContext<[Readonly<Model>, DispatchModelUpdate]>([{ ...DEFAULT_MODEL }, () => {}]);
export const useModel = () => useContext(ModelContext);

export function ModelModeProvider({ children }: { children: ReactChild | ReactChild[] }) {
  const [model, updateModel] = useReducer(
    (oldModel: Model, newProps: ModelUpdate): Model => ({
      ...oldModel,
      ...newProps,
    }),
    null,
    (): Model => ({
      ...DEFAULT_MODEL,
    })
  );
  const value: [Model, DispatchModelUpdate] = useMemo(() => [model, updateModel], [model, updateModel]);
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}
