import React from "react";
import dayjs from "dayjs";

import { useParams, useLocation, Redirect } from "react-router";
import { Model, useOnRouteModelUpdated } from "./model";
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
  search?: string;
  rank?: number;
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
      searchText: params.search ? params.search.slice(1) : "",
      rank: params.rank || null
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
      searchText: params.search || ""
    };
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RouteSync({ view }: { view: keyof typeof ModelBuilders }): React.FunctionComponentElement<any> {
  useEffect(() => {
    triggerRelayout();
    scrollToTop();
    return scrollToTop;
  }, []);
  const onRouteModelUpdated = useOnRouteModelUpdated();
  const params = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  Object.assign(params, {
    rank: query.get("rank"),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelResult = ModelBuilders[view](params as any);
  if (typeof modelResult === "string") {
    return <Redirect to={modelResult} />;
  }
  onRouteModelUpdated(modelResult);
  return <></>;
}
