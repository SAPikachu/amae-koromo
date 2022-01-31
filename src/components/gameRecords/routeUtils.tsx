import { generatePath as genPath } from "react-router-dom";
import { Model } from "./model";
import dayjs from "dayjs";

export const PLAYER_PATH = "/player/:id/:mode([0-9.]+)?/:search(-[^/]+)?/:startDate(\\d{4}-\\d{2}-\\d{2}|\\d{6,})?/:endDate(\\d{4}-\\d{2}-\\d{2}|\\d{6,})?";
export const PATH = "/:date(\\d{4}-\\d{2}-\\d{2})/:mode([0-9]+)?/:search?";
function dateToStringSafe(value: dayjs.ConfigType | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const dateObj = dayjs(value);
  if (!dateObj.isValid() || dateObj.year() < 2019 || dateObj.year() > 9999) {
    return undefined;
  }
  if (dateObj.valueOf() - dateObj.startOf("day").valueOf() > 0 &&
    dateObj.endOf("day").valueOf() - dateObj.valueOf() > 60000) {
    return dateObj.valueOf().toString();
  }
  return dateObj.format("YYYY-MM-DD");
}

export function generatePath(model: Model): string {
  if (model.type === "player") {
    if (model.limit) {
      delete model.startDate;
      delete model.endDate;
    }
    let result = genPath(PLAYER_PATH, {
      id: model.playerId,
      startDate: dateToStringSafe(model.startDate),
      endDate: dateToStringSafe(model.endDate),
      mode: model.selectedModes.join(".") || undefined,
      search: model.searchText ? "-" + model.searchText : undefined,
    });
    const params = new URLSearchParams("");
    if (model.rank) {
      params.set("rank", model.rank.toString());
    }
    if (model.kontenOnly) {
      params.set("kontenOnly", "1");
    }
    if (model.limit) {
      params.set("limit", model.limit.toString());
    }
    const paramString = params.toString();
    if (paramString) {
      result += "?" + paramString;
    }
    return result;
  }
  if (!model.selectedMode && !model.searchText && !model.date) {
    return "/";
  }
  const dateString = dateToStringSafe(model.date || dayjs().startOf("day"));
  if (!dateString) {
    return "/";
  }
  return genPath(PATH, {
    date: dateString,
    mode: model.selectedMode || undefined,
    search: model.searchText || undefined,
  });
}
export function generatePlayerPathById(playerId: number | string): string {
  return generatePath({
    type: "player",
    playerId: playerId.toString(),
    startDate: null,
    endDate: null,
    selectedModes: [],
    searchText: "",
    rank: null,
    kontenOnly: false,
    limit: null,
  });
}
