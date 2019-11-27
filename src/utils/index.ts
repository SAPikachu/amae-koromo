import { useState, useEffect, useMemo } from "react";
export function triggerRelayout() {
  requestAnimationFrame(() => window.dispatchEvent(new UIEvent("resize")));
  setTimeout(function() {
    window.dispatchEvent(new UIEvent("resize"));
  }, 200);
}
export function scrollToTop() {
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatPercent = (x: any) => (x > 0 ? `${(x * 100).toFixed(2)}%` : "");

export const formatFixed3 = (x: number) => x.toFixed(3);
export const formatIdentity = (x: number) => x.toString();

type NotFinished = { notFinished: string };
const NOT_FINISHED = { notFinished: "yes" };

export function useAsync<T>(maybePromise: T | Promise<T>): T | undefined {
  const [fulfilledValue, setFulfilledValue] = useState<T | NotFinished>(NOT_FINISHED);
  useEffect(() => {
    let cancelled = false;
    if (maybePromise instanceof Promise) {
      setFulfilledValue(NOT_FINISHED);
      maybePromise.then(result => {
        if (cancelled) {
          return;
        }
        setFulfilledValue(result);
      });
    } else {
      setFulfilledValue(maybePromise);
    }
    return () => {
      cancelled = true;
    };
  }, [maybePromise]);
  if (fulfilledValue !== NOT_FINISHED) {
    return fulfilledValue as T;
  }
  return undefined;
}
export function useAsyncFactory<T>(factory: () => Promise<T>, deps: React.DependencyList): T | undefined {
  const promise = useMemo(factory, deps);
  return useAsync(promise);
}

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
