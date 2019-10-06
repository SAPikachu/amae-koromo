import React from "react";

import { WindowScroller } from "react-virtualized";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import { GameRecords } from "./gameRecords";

function App() {
  return (
    <WindowScroller>
      {scrollerProps => (
        <>
          <AppHeader />
          <Container>
            <GameRecords scrollerProps={scrollerProps} />
          </Container>
        </>
      )}
    </WindowScroller>
  );
}
export default App;
