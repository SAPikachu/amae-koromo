import React, { ReactChild, useContext } from "react";

import { WindowScroller, WindowScrollerChildProps } from "react-virtualized";

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
