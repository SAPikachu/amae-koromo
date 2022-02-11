import { useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useCallback } from "react";

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
export const formatRound = (x: number) => Math.round(x).toString();
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

export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export function useIsMobile() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  return !matches;
}
