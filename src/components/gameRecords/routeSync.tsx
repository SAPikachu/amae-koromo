import React from "react";
import moment from "moment";

import { useParams, useLocation, Redirect } from "react-router";
import { useModel, Model, ModelPlain } from "./model";
import { generatePath } from "./routes";

type ListingRouteParams = {
  date?: string;
  modes?: string;
  search?: string;
};

type HistoryState = {
  path: string;
  model: ModelPlain;
};

const ModelBuilders = {
  player: function(params: { id: string }): Model | string {
    return {
      type: "player",
      playerId: params.id,
      version: 0
    };
  },
  listing: function(params: ListingRouteParams): Model | string {
    const date = params.date ? moment(params.date, "YYYY-MM-DD") : null;
    if (date && !date.isValid()) {
      return "/";
    }
    const modes = params.modes
      ? new Set(
          params.modes
            .split(".")
            .map(x => x.trim())
            .filter(x => !!x)
        )
      : null;
    return {
      date: date ? date.startOf("day").valueOf() : null,
      selectedModes: modes,
      searchText: params.search || "",
      version: 0
    };
  }
};

export function RouteSync({ view }: { view: keyof typeof ModelBuilders }): React.FunctionComponentElement<any> {
  const params = useParams();
  const [model, updateModel] = useModel();
  const location = useLocation<HistoryState>();
  const state = location.state;
  // console.log(params, model, location, state);
  if (state && state.model.version === model.version) {
    delete (model as Model).pendingRouteUpdate;
    return <></>;
  }
  if (!state) {
    // Navigation
    const modelResult = ModelBuilders[view](params as any);
    if (typeof modelResult === "string") {
      return <Redirect to={modelResult} />;
    }
    const newModel: Model = {
      ...modelResult,
      version: model.version
    };
    updateModel(newModel);
    return (
      <Redirect
        to={{ pathname: location.pathname, state: { path: location.pathname, model: Model.toPlain(newModel) } }}
      />
    );
  }
  const newPath = generatePath(model);
  if (model.pendingRouteUpdate) {
    // Model updated
    delete (model as Model).pendingRouteUpdate; // Do not trigger update
    return <Redirect to={{ pathname: newPath, state: { path: newPath, model: Model.toPlain(model) } }} />;
  } else {
    const restoredModel = Model.fromPlain(state.model);
    updateModel(restoredModel);
    return <></>;
  }
}
