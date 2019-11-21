import React from "react";
import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { useRouteMatch, Switch, Route, Redirect } from "react-router";
import { Helmet } from "react-helmet";

type RouteDefProps = { path: string; title: string; children: React.ReactChild | React.ReactChildren };
export const RouteDef: React.FunctionComponent<RouteDefProps> = () => {
  throw new Error("Not intended for rendering");
};

type RoutesProps = { children: React.FunctionComponentElement<RouteDefProps>[] };
export const ViewRoutes: React.FunctionComponent<RoutesProps> = () => {
  throw new Error("Not intended for rendering");
};

const Context = React.createContext<RouteDefProps[]>([]);

export function NavButtons() {
  const routes = useContext(Context);
  const match = useRouteMatch() || { path: "" };
  return (
    <nav className="nav nav-pills mb-3">
      {routes.map(route => (
        <NavLink key={route.path} to={`${match.path}/${route.path}`} className="nav-link" activeClassName="active">
          {route.title}
        </NavLink>
      ))}
    </nav>
  );
}

export function ViewSwitch({
  defaultPath,
  children
}: {
  defaultPath?: string;
  children?: React.ReactChild | React.ReactChildren;
}) {
  const routes = useContext(Context);
  const match = useRouteMatch() || { path: "" };
  return (
    <Switch>
      {routes.map(route => (
        <Route key={route.path} path={`${match.path}/${route.path}`}>
          <Helmet>
            <title>{route.title}</title>
          </Helmet>
          {route.children}
        </Route>
      ))}
      <Route>
        <Redirect to={`${match.path}/${defaultPath || routes[0].path}`} />
      </Route>
      {children}
    </Switch>
  );
}

export function SimpleRoutedSubViews({
  children
}: {
  children: [React.FunctionComponentElement<RoutesProps>, ...(React.ReactChild | React.ReactChildren)[]];
}) {
  return <Context.Provider value={children[0].props.children.map(x => x.props)}>{children.slice(1)}</Context.Provider>;
}
