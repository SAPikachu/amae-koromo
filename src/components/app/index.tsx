import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Loadable from "../misc/customizedLoadable";
import Scroller from "../misc/scroller";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import { MaintenanceHandler } from "./maintenance";
import Navbar from "./navbar";
import CanonicalLink from "../misc/canonicalLink";
import GameRecords from "../gameRecords";
import Tracker, { PageCategory } from "../misc/tracker";
import Conf from "../../utils/conf";
import { useTranslation } from "react-i18next";

import "./theme";
import RootThemeProvider from "./theme";
import { CssBaseline } from "@mui/material";
import AdapterDayJs from "@mui/lab/AdapterDayjs";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { SnackbarProvider } from "notistack";
import { RegisterSnackbarProvider } from "../../utils/notify";
import { FC } from "react";

const Helmet = Loadable({
  loader: () => import("react-helmet"),
  loading: () => <></>,
});
const Ranking = Loadable({
  loader: () => import("../ranking"),
});
const Statistics = Loadable({
  loader: () => import("../statistics"),
});
const RecentHighlight = Loadable({
  loader: () => import("../recentHighlight"),
});
const ContestTools = Loadable({
  loader: () => import("../contestTools"),
});

const LP: FC = ({ children }) => (
  <LocalizationProvider
    dateAdapter={AdapterDayJs}
    dateFormats={{
      month: "MM",
      monthShort: "MM",
      monthAndDate: "MM-DD",
      shortDate: "MM-DD",
      monthAndYear: "YYYY-MM",
      fullDate: "YYYY-MM-DD",
      keyboardDate: "YYYY-MM-DD",
      fullTime: "HH:mm",
    }}
  >
    {children}
  </LocalizationProvider>
);

function App() {
  const { t, i18n } = useTranslation();
  return (
    <RootThemeProvider>
      <SnackbarProvider maxSnack={3}>
        <RegisterSnackbarProvider />
        <CssBaseline />
        <LP>
          <div className={"lang-" + i18n.language}>
            <Router>
              <Helmet defaultTitle={t(Conf.siteTitle)} titleTemplate={`%s | ${t(Conf.siteTitle)}`} />
              <CanonicalLink />
              <Tracker />
              <Navbar />
              <MaintenanceHandler>
                <Scroller>
                  {Conf.showTopNotice ? <AppHeader /> : <></>}
                  <Container>
                    <Switch>
                      <Route path="/ranking">
                        <PageCategory category="Ranking" />
                        <Ranking />
                      </Route>
                      <Route path="/statistics">
                        <PageCategory category="Statistics" />
                        <Statistics />
                      </Route>
                      <Route path="/highlight">
                        <PageCategory category="RecentHighlight" />
                        <RecentHighlight />
                      </Route>
                      {Conf.features.contestTools ? (
                        <Route path="/contest-tools">
                          <ContestTools />
                        </Route>
                      ) : null}
                      <Route path="/">
                        <GameRecords />
                      </Route>
                    </Switch>
                  </Container>
                </Scroller>
              </MaintenanceHandler>
            </Router>
          </div>
        </LP>
      </SnackbarProvider>
    </RootThemeProvider>
  );
}
export default App;
