export enum GameMode {
  王座 = 16,
  玉 = 12,
  金 = 9,
  三金 = 22,
  三玉 = 24,
  三王座 = 26,
}
export function modeLabel(mode: GameMode) {
  return GameMode[mode].replace(/^三/, "");
}