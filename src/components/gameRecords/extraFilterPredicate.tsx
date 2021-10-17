/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useContext, useMemo, useState } from "react";
import { FilterPredicate } from "../../data/source/records/provider";

const Context = React.createContext({
  extraFilterPredicate: null as FilterPredicate,
  setExtraFilterPredicate: (() => {}) as (predicate: FilterPredicate) => void,
});

export const useExtraFilterPredicate = () => useContext(Context).extraFilterPredicate;

export const useSetExtraFilterPredicate = () => useContext(Context).setExtraFilterPredicate;

export function ExtraFilterPredicateProvider({ children }: { children: React.ReactNode }) {
  const [extraFilterPredicate, setExtraFilterPredicate] = useState(() => null as FilterPredicate);
  const value = useMemo(() => ({ extraFilterPredicate, setExtraFilterPredicate }), [extraFilterPredicate]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
