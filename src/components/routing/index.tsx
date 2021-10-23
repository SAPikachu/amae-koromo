import React from "react";
import { useContext } from "react";
import { useRouteMatch, Switch, Route, Redirect, useLocation } from "react-router";
import { Helmet } from "react-helmet";
import { TFunction, useTranslation } from "react-i18next";
import { Stack, StackProps } from "@mui/material";
import NavButton from "../misc/navButton";

type RouteDefProps = {
  path: string;
  exact?: boolean;
  title: string | ((t: TFunction) => string);
  disabled?: boolean;
  children: React.ReactNode;
};
export const RouteDef: React.FunctionComponent<RouteDefProps> = () => {
  throw new Error("Not intended for rendering");
};

type RoutesProps = { children: React.FunctionComponentElement<RouteDefProps>[] };
export const ViewRoutes: React.FunctionComponent<RoutesProps> = () => {
  throw new Error("Not intended for rendering");
};

const Context = React.createContext<RouteDefProps[]>([]);

export function NavButtons({
  replace = false,
  keepState = false,
  withQueryString = false,
  sx = {} as StackProps["sx"],
}) {
  const { t } = useTranslation("navButtons");
  const routes = useContext(Context);
  const match = useRouteMatch() || { url: "" };
  const urlBase = match.url.replace(/\/+$/, "");
  return (
    <Stack direction="row" spacing={0} sx={{ mb: 2, ...sx }} flexWrap="wrap">
      {routes
        .filter((x) => !x.disabled)
        .map((route) => (
          <NavButton
            key={route.path}
            href={(loc) => ({
              pathname: `${urlBase}/${route.path}`,
              state: keepState ? loc.state : undefined,
              ...(withQueryString && loc.search ? { search: loc.search } : {}),
            })}
            replace={replace}
            exact={!!route.exact}
            color="info"
            activeProps={{ variant: "contained" }}
            disableElevation
            sx={{ mr: 1 }}
          >
            {typeof route.title === "string" ? t(route.title) : route.title(t)}
          </NavButton>
        ))}
    </Stack>
  );
}

export function ViewSwitch({
  defaultRenderDirectly = false,
  mutateTitle = true,
  children,
}: {
  defaultRenderDirectly?: boolean;
  mutateTitle?: boolean;
  children?: React.ReactChild | React.ReactChildren;
}) {
  const { t } = useTranslation("navButtons");
  const routes = useContext(Context);
  const match = useRouteMatch() || { url: "" };
  const loc = useLocation();
  const urlBase = match.url.replace(/\/+$/, "");
  return (
    <Switch>
      {routes
        .filter((x) => !x.disabled)
        .map((route) => (
          <Route exact={route.exact} key={route.path} path={`${urlBase}/${route.path}`}>
            {mutateTitle && (
              <Helmet>
                <title>{typeof route.title === "string" ? t(route.title) : route.title(t)}</title>
              </Helmet>
            )}
            {route.children}
          </Route>
        ))}
      <Route>
        {defaultRenderDirectly ? (
          routes.filter((x) => !x.disabled)[0].children
        ) : (
          <Redirect to={{ ...loc, pathname: `${urlBase}/${routes.filter((x) => !x.disabled)[0].path}` }} push={false} />
        )}
      </Route>
      {children}
    </Switch>
  );
}

export function SimpleRoutedSubViews({
  children,
}: {
  children: [React.FunctionComponentElement<RoutesProps>, ...(React.ReactChild | React.ReactChildren)[]];
}) {
  return (
    <Context.Provider value={children[0].props.children.map((x) => x.props)}>{children.slice(1)}</Context.Provider>
  );
}
