import React from "react";
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { useRouteMatch, Switch, Route, Redirect, useLocation } from "react-router";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

type RouteDefProps = {
  path: string;
  exact?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactChild | React.ReactChildren;
};
export const RouteDef: React.FunctionComponent<RouteDefProps> = () => {
  throw new Error("Not intended for rendering");
};

type RoutesProps = { children: React.FunctionComponentElement<RouteDefProps>[] };
export const ViewRoutes: React.FunctionComponent<RoutesProps> = () => {
  throw new Error("Not intended for rendering");
};

const Context = React.createContext<RouteDefProps[]>([]);

export function NavButtons({ className = "", replace = false, keepState = false }) {
  const { t } = useTranslation("navButtons");
  const routes = useContext(Context);
  const match = useRouteMatch() || { url: "" };
  const urlBase = match.url.replace(/\/+$/, "");
  return (
    <nav className={`nav nav-pills mb-3 ${className}`}>
      {routes
        .filter((x) => !x.disabled)
        .map((route) => (
          <NavLink
            key={route.path}
            to={(loc) => ({
              pathname: `${urlBase}/${route.path}`,
              state: keepState ? loc.state : undefined,
            })}
            replace={replace}
            exact={!!route.exact}
            className="nav-link"
            activeClassName="active"
          >
            {t(route.title)}
          </NavLink>
        ))}
    </nav>
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
                <title>{t(route.title)}</title>
              </Helmet>
            )}
            {route.children}
          </Route>
        ))}
      <Route>
        {defaultRenderDirectly ? (
          routes[0].children
        ) : (
          <Redirect to={{ ...loc, pathname: `${urlBase}/${routes[0].path}` }} push={false} />
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
