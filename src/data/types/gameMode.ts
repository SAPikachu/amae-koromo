import i18n from "../../i18n";

const t = i18n.getFixedT(null, "gameModeShort");

export enum GameMode {
  王座 = 16,
  玉 = 12,
  金 = 9,
  三金 = 22,
  三玉 = 24,
  三王座 = 26,
}
export function modeLabel(mode: GameMode) {
  return t(GameMode[mode].replace(/^三/, ""));
}
