import React, { ReactChild, useContext } from "react";

import { WindowScrollerChildProps } from "react-virtualized";
import { WindowScroller } from "react-virtualized/dist/es/WindowScroller";

const ScrollerContext = React.createContext<WindowScrollerChildProps>({} as any);

export const useScrollerProps = () => useContext(ScrollerContext);

function Scroller({ children }: { children: ReactChild | ReactChild[] }) {
  return (
    <WindowScroller>
      {scrollerProps => <ScrollerContext.Provider value={scrollerProps}>{children}</ScrollerContext.Provider>}
    </WindowScroller>
  );
}
export default Scroller;
