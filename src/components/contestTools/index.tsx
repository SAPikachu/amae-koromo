import React from "react";

import { ModelModeProvider } from "../modeModel";
import { ViewRoutes, SimpleRoutedSubViews, NavButtons, RouteDef } from "../routing";
import { ViewSwitch } from "../routing/index";
import MinMax from "./minMax";

const ROUTES = (
  <ViewRoutes>
    {[
      <RouteDef key="" path="min-max" title="最低/最高点对局">
        <MinMax />
      </RouteDef>,
    ]}
  </ViewRoutes>
);

export default function Routes() {
  return (
    <SimpleRoutedSubViews>
      {ROUTES}
      <ModelModeProvider>
        <NavButtons />
        <ViewSwitch />
      </ModelModeProvider>
    </SimpleRoutedSubViews>
  );
}
