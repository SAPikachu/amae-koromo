import i18n from "../../i18n";
import { RANK_LABELS } from "./constants";

const t = i18n.t.bind(i18n);

export function getRankLabelByIndex(index: number): string {
  return t(RANK_LABELS[index]);
}
export function getRankLabelByIndexRaw(index: number): string {
  return RANK_LABELS[index];
}
