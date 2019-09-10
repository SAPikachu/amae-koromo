import { PLAYER_RANKS } from "./dataSource";
import { SyntheticEvent } from "react";

export function getLevelTag(levelId: number) {
  const realId = levelId % 10000;
  const majorRank = Math.floor(realId / 100);
  const minorRank = realId % 100;
  const label = PLAYER_RANKS[majorRank - 1];
  if (majorRank === PLAYER_RANKS.length) {
    return label;
  }
  return label + minorRank;
}

interface WithEventTargetReducer<T> {
  _cachedEventTargetReducer?: (_: T) => any;
}
export function eventTargetReducer<TElem extends EventTarget, TEvent extends SyntheticEvent<TElem>>(
  func: NonNullable<(_: TElem) => any>,
): NonNullable<(_: TEvent) => any> {
  const withStore = func as WithEventTargetReducer<TEvent>;
  if (!withStore._cachedEventTargetReducer) {
    withStore._cachedEventTargetReducer = (event: TEvent) => func(event.currentTarget);
  }
  return withStore._cachedEventTargetReducer;
}
