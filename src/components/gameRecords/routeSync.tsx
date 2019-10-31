import React from "react";
import dayjs from "dayjs";

import { useParams, useLocation, Redirect } from "react-router";
import { useModel, Model, ModelPlain } from "./model";
import { generatePath } from "./routes";
import { useEffect } from "react";
import { scrollToTop, triggerRelayout } from "../../utils/index";

type ListingRouteParams = {
  date?: string;
  mode?: string;
  search?: string;
};

type PlayerRouteParams = {
  id: string;
  startDate?: string;
  endDate?: string;
  mode?: string;
};

type HistoryState = {
  model: ModelPlain;
  pathname: string;
};

function parseOptionalDate<T>(s: string | null | undefined, defaultValue: T): dayjs.Dayjs | T {
  return s ? dayjs(s, "YYYY-MM-DD") : defaultValue;
}

const ModelBuilders = {
  player(params: PlayerRouteParams): Model | string {
    return {
      type: "player",
      playerId: params.id,
      startDate: parseOptionalDate(params.startDate, null),
      endDate: parseOptionalDate(params.endDate, null),
      selectedMode: params.mode || "",
      version: 0
    };
  },
  listing(params: ListingRouteParams): Model | string {
    const date = parseOptionalDate(params.date, null);
    if (date && !date.isValid()) {
      return "/";
    }
    return {
      type: undefined,
      date: date ? date.startOf("day").valueOf() : null,
      selectedMode: params.mode || "",
      searchText: params.search || "",
      version: 0
    };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RouteSync({ view }: { view: keyof typeof ModelBuilders }): React.FunctionComponentElement<any> {
  const params = useParams();
  const [model, updateModel] = useModel();
  const location = useLocation<HistoryState>();
  useEffect(triggerRelayout, [model.type]);
  const state = location.state;
  // console.log(params, model, location, state);
  if (state && state.model.version === model.version) {
    delete (model as Model).pendingRouteUpdate;
    if (location.pathname !== state.pathname) {
      return <Redirect to={{ pathname: state.pathname, state }} />;
    }
    return <></>;
  }
  if (!state) {
    // Navigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelResult = ModelBuilders[view](params as any);
    if (typeof modelResult === "string") {
      return <Redirect to={modelResult} />;
    }
    const newModel: Model = {
      ...modelResult,
      version: model.version
    };
    updateModel(newModel);
    scrollToTop();
    return (
      <Redirect
        to={{ pathname: location.pathname, state: { pathname: location.pathname, model: Model.toPlain(newModel) } }}
      />
    );
  }
  if (model.pendingRouteUpdate) {
    // Model updated
    const newPath = generatePath(model);
    delete (model as Model).pendingRouteUpdate; // Do not trigger update
    return <Redirect to={{ pathname: newPath, state: { pathname: newPath, model: Model.toPlain(model) } }} />;
  } else {
    const restoredModel = Model.fromPlain(state.model);
    updateModel(restoredModel);
    return <></>;
  }
}
