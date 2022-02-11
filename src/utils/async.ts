import React, { useState, useEffect, useMemo } from "react";
import { networkError } from "./notify";
import Sentry from "./sentry";

type NotFinished = { notFinished: string };
const NOT_FINISHED = { notFinished: "yes" };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const __useAsyncCache = {} as { [key: string]: any };

export function useAsync<T>(maybePromise: T | Promise<T>, cacheKey?: string): T | undefined {
  const [fulfilledValue, setFulfilledValue] = useState<T | NotFinished>(
    maybePromise instanceof Promise ? NOT_FINISHED : maybePromise
  );
  useEffect(() => {
    let promise = maybePromise;
    if (cacheKey) {
      if (__useAsyncCache[cacheKey]) {
        if (
          promise instanceof Promise &&
          __useAsyncCache[cacheKey] instanceof Promise &&
          promise !== __useAsyncCache[cacheKey]
        ) {
          const e = new Error(`Replacing cached promise with new one (key: ${cacheKey})`);
          console.error(e);
          Sentry.captureException(e);
        }
        promise = __useAsyncCache[cacheKey];
      } else {
        __useAsyncCache[cacheKey] = promise;
      }
    }
    let cancelled = false;
    if (promise instanceof Promise) {
      setFulfilledValue(NOT_FINISHED);
      promise
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
          if (cacheKey && __useAsyncCache[cacheKey] === promise) {
            delete __useAsyncCache[cacheKey];
          }
          networkError();
        });
    } else {
      setFulfilledValue(promise);
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
  const realKey = cacheKey ? `${cacheKey}-${deps.join(",")}` : undefined;
  const promise = useMemo(() => {
    if (realKey && __useAsyncCache[realKey]) {
      return __useAsyncCache[realKey];
    }
    const ret = factory();
    if (realKey) {
      __useAsyncCache[realKey] = ret;
    }
    return ret;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return useAsync(promise, realKey);
}
