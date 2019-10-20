import React from "react";
import moment from "moment";

import { useParams, useLocation, Redirect } from "react-router";
import { useModel, Model, ModelPlain, ModelUtils } from './model';
import { generatePath } from "./routes";

type RouteParams = {
  date?: string;
  modes?: string;
  search?: string;
};

type HistoryState = {
  path: string;
  model: ModelPlain;
};

export function RouteSync(): React.FunctionComponentElement<any> {
  const params = useParams<RouteParams>();
  const [model, updateModel] = useModel();
  const location = useLocation<HistoryState>();
  const state = location.state;
  if (state && state.model.version === model.version) {
    return <></>;
  }
  if (!state) {
    const date = params.date ? moment(params.date, "YYYY-MM-DD") : null;
    if (date && !date.isValid()) {
      return <Redirect to="/" />;
    }
    const modes = params.modes
      ? new Set(
          params.modes
            .split(".")
            .map(x => x.trim())
            .filter(x => !!x)
        )
      : null;
    const newModel: Model = {
      date: date ? date.startOf("day").valueOf() : null,
      selectedModes: modes,
      searchText: params.search || "",
      version: model.version
    };
    updateModel(newModel);
    return <Redirect to={{ pathname: location.pathname, state: { path: location.pathname, model: ModelUtils.toPlain(newModel) } }} />;
  }
  const newPath = generatePath(model);
  if (newPath === state.path) {
    return <></>;
  }
  return <Redirect to={{ pathname: newPath, state: { path: newPath, model: ModelUtils.toPlain(model) } }} />;
}
