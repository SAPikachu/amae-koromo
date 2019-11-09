export type RankRateBySeat = {
  [modeId: string]: {
    [rankId: number]: [number, number, number, number];
  };
};
