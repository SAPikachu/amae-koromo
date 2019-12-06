import React from "react";

import { ModelProvider } from "./model";
import { DataAdapterProvider } from "./dataAdapterProvider";
import Loadable from "../misc/customizedLoadable";
import Loading from "../misc/loading";

const Routes = Loadable({
  loader: () => import("./routes"),
  loading: () => <Loading />
});

export default function GameRecords() {
  // This makes data load in parallel with subcomponents
  return (
    <ModelProvider>
      <DataAdapterProvider>
        <Routes />
      </DataAdapterProvider>
    </ModelProvider>
  );
}
