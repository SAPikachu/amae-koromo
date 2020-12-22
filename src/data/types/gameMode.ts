import i18n from "../../i18n";

const t = i18n.getFixedT(null, "gameModeShort");

export enum GameMode {
  王座 = 16,
  玉 = 12,
  金 = 9,
  王座东 = 15,
  玉东 = 11,
  金东 = 8,
  三金 = 22,
  三玉 = 24,
  三王座 = 26,
  三金东 = 21,
  三玉东 = 23,
  三王座东 = 25,
}
export function modeLabelNonTranslated(mode: GameMode) {
  if (!mode) {
    return "全部";
  }
  return GameMode[mode].replace(/^三/, "");
}
export function modeLabel(mode: GameMode) {
  return t(modeLabelNonTranslated(mode));
}
export function parseCombinedMode(modeString?: string): GameMode[] {
  return (modeString || "")
    .split(".")
    .map((x) => parseInt(x.trim(), 10) as GameMode)
    .map((x) => (GameMode[x] ? x : (0 as GameMode)))
    .filter((x) => x);
}
