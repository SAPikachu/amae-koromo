import React from "react";
import dayjs from "dayjs";

import { useParams, useLocation, Redirect } from "react-router";
import { Model, useOnRouteModelUpdated } from "./model";
import { useEffect } from "react";
import { scrollToTop, triggerRelayout } from "../../utils/index";
import Conf from "../../utils/conf";
import { parseCombinedMode } from "../../data/types";

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
  rank?: string;
  kontenOnly?: string;
  limit?: string;
};

function parseOptionalDate<T>(
  s: string | null | undefined,
  defaultValue: T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postprocess = (d: dayjs.Dayjs, isPrecise: boolean) => d
): dayjs.Dayjs | T {
  if (!s) {
    return defaultValue;
  }
  const isPrecise = /^\d{6,}$/.test(s);
  const ret = isPrecise ? dayjs(parseInt(s, 10)) : dayjs(s);
  if (!ret.isValid()) {
    return defaultValue;
  }
  return postprocess(ret, isPrecise);
}

const ModelBuilders = {
  player(params: PlayerRouteParams): Model | string {
    if (params.rank) {
      const rank = parseInt(params.rank);
      if (!rank || rank < 1 || rank > Conf.rankColors.length) {
        delete params.rank;
      }
    }
    if (params.limit) {
      delete params.startDate;
      delete params.endDate;
    }
    return {
      type: "player",
      playerId: params.id,
      startDate: parseOptionalDate(params.startDate, null),
      endDate: parseOptionalDate(params.endDate, null, (d, isPrecise) => (isPrecise ? d : d.endOf("day"))),
      selectedModes: parseCombinedMode(params.mode || ""),
      searchText: params.search ? params.search.slice(1) : "",
      rank: parseInt(params.rank || "") || null,
      kontenOnly: !!params.kontenOnly,
      limit: parseInt(params.limit || "", 10) || null,
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
      selectedMode: parseCombinedMode(params.mode || "")[0] || null,
      searchText: params.search || "",
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
    kontenOnly: query.get("kontenOnly"),
    limit: query.get("limit"),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelResult = ModelBuilders[view](params as any);
  useEffect(() => {
    if (typeof modelResult !== "string") {
      onRouteModelUpdated(modelResult);
    }
  }, [modelResult, onRouteModelUpdated]);
  if (typeof modelResult === "string") {
    return <Redirect to={modelResult} />;
  }
  return <></>;
}
