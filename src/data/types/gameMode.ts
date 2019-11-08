export enum GameMode {
  王座 = 16,
  玉 = 12
}
export const NUMBER_OF_GAME_MODE = Object.keys(GameMode).filter(
  x => typeof GameMode[x as keyof typeof GameMode] === "number"
).length;
