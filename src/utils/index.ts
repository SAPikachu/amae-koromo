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
export const formatPercent = (x: any) => {
  if (!x) {
    return "";
  }
  if (x < 0.0001) {
    return "<0.01%";
  }
  return `${(x * 100).toFixed(2)}%`;
};

export const formatFixed3 = (x: number) => x.toFixed(3);
export const formatIdentity = (x: number) => x.toString();

type NotFinished = { notFinished: string };
const NOT_FINISHED = { notFinished: "yes" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const __useAsyncCache = {} as { [key: string]: any };

export function useAsync<T>(maybePromise: T | Promise<T>, cacheKey?: string): T | undefined {
  if (cacheKey && __useAsyncCache[cacheKey]) {
    maybePromise = __useAsyncCache[cacheKey];
  }
  const [fulfilledValue, setFulfilledValue] = useState<T | NotFinished>(
    maybePromise instanceof Promise ? NOT_FINISHED : maybePromise
  );
  useEffect(() => {
    let cancelled = false;
    if (maybePromise instanceof Promise) {
      setFulfilledValue(NOT_FINISHED);
      maybePromise.then(result => {
        if (cancelled) {
          return;
        }
        if (cacheKey) {
          __useAsyncCache[cacheKey] = result;
        }
        setFulfilledValue(result);
      });
    } else {
      setFulfilledValue(maybePromise);
    }
    return () => {
      cancelled = true;
    };
  }, [maybePromise, cacheKey]);
  if (fulfilledValue !== NOT_FINISHED) {
    return fulfilledValue as T;
  }
  return undefined;
}
export function useAsyncFactory<T>(
  factory: () => Promise<T>,
  deps: React.DependencyList,
  cacheKey?: string
): T | undefined {
  const promise = useMemo(factory, deps);
  return useAsync(promise, cacheKey ? `${cacheKey}-${deps.join(",")}` : undefined);
}

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
