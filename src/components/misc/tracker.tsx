import { useLocation } from "react-router";
import React, { useEffect, useLayoutEffect } from "react";
import Helmet from "react-helmet";

let currentCategory = "Home";

export function PageCategory({ category }: { category: string }) {
  useLayoutEffect(() => {
    const oldCategory = currentCategory;
    currentCategory = category;
    return () => {
      currentCategory = oldCategory;
    };
  }, [category]);
  return null;
}

function TrackerImpl() {
  const loc = useLocation();
  useEffect(() => {
    let cancelled = false;
    window.requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }
      const helmet = Helmet.peek();
      const title = (helmet.title || document.title).toString();
      window.analytics.page(currentCategory, title, {
        url: `https://${window.location.host}${loc.pathname}`,
        path: loc.pathname,
        title
      });
    });
    return () => {
      cancelled = true;
    };
  }, [loc.pathname]);
  return null;
}

export default function Tracker() {
  if (!window.analytics) {
    return null;
  }
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return <TrackerImpl />;
}
