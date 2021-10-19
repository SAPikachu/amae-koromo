import { useMediaQuery, useTheme } from "@mui/material";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { networkError } from "./notify";

export function triggerRelayout() {
  requestAnimationFrame(() => window.dispatchEvent(new UIEvent("resize")));
  setTimeout(function () {
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
    return "0%";
  }
  if (x < 0.0001) {
    return "<0.01%";
  }
  return `${(x * 100).toFixed(2)}%`;
};

export const formatFixed3 = (x: number) => x.toFixed(3);
export const formatIdentity = (x: number) => x.toString();

export function useEventCallback<T extends unknown[]>(fn: (...args: T) => void, dependencies: React.DependencyList) {
  const ref = useRef<(...args: T) => void>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  useEffect(() => {
    ref.current = fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...dependencies]);

  return useCallback(
    (...args) => {
      const fn = ref.current;
      return fn(...(args as T));
    },
    [ref]
  );
}

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
      maybePromise
        .then((result) => {
          if (cancelled) {
            return;
          }
          if (cacheKey) {
            __useAsyncCache[cacheKey] = result;
          }
          setFulfilledValue(result);
        })
        .catch((e) => {
          console.error(e);
          networkError();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const promise = useMemo(factory, deps);
  return useAsync(promise, cacheKey ? `${cacheKey}-${deps.join(",")}` : undefined);
}

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export function useIsMobile() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  return !matches;
}
