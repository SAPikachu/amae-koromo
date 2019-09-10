import { useState, useEffect, ReactNode } from "react";
import React from "react";

export function SteppingListRenderer({
  batchSize = 50,
  renderInterval = 100,
  children = undefined as ReactNode[] | undefined,
}) {
  const [numItems, setNumItems] = useState(0);
  useEffect(() => {
    let timeoutToken: ReturnType<typeof setTimeout> | null = null;
    if (children && children.length) {
      let numItems = 0;
      const count = children.length;
      const step = () => {
        timeoutToken = null;
        numItems += batchSize;
        numItems = Math.min(count, numItems);
        setNumItems(numItems);
        if (numItems < count) {
          timeoutToken = setTimeout(step, renderInterval);
        }
      };
      step();
    }
    return () => {
      if (timeoutToken) {
        clearTimeout(timeoutToken);
      }
    };
  }, [children, batchSize, renderInterval]);
  if (!children || !children.length) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return <React.Fragment>{children.slice(0, numItems)}</React.Fragment>;
}
