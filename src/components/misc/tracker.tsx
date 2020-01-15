import { useLocation } from "react-router";
import React, { useEffect, useLayoutEffect } from "react";
import Helmet from "react-helmet";
import { CANONICAL_DOMAIN } from "../../utils/constants";

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
      window.ga("send", {
        hitType: "pageview",
        path: loc.pathname,
        title: `${currentCategory} ${title}`,
        contentGroup1: currentCategory
      });
    });
    return () => {
      cancelled = true;
    };
  }, [loc.pathname]);
  return null;
}

export default function Tracker() {
  if (!window.ga) {
    return null;
  }
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  if (window.location.host !== CANONICAL_DOMAIN) {
    return null;
  }
  return <TrackerImpl />;
}
