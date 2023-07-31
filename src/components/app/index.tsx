import { BrowserRouter as Router } from "react-router-dom";
import Loadable from "../misc/customizedLoadable";
import Scroller from "../misc/scroller";

import { Container } from "../layout";
import { AppHeader } from "./appHeader";
import { MaintenanceHandler } from "./maintenance";
import Navbar from "./navbar";
import CanonicalLink from "../misc/canonicalLink";
import Tracker from "../misc/tracker";
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
import StarPlayerProvider from "../playerDetails/star/starPlayerProvider";
import { Routes } from "./routes";

const Helmet = Loadable({
  loader: () => import("react-helmet"),
  loading: () => <></>,
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

const Providers: FC = ({ children }) => (
  <RootThemeProvider>
    <SnackbarProvider maxSnack={3}>
      <LP>
        <StarPlayerProvider>{children}</StarPlayerProvider>
      </LP>
    </SnackbarProvider>
  </RootThemeProvider>
);

function App() {
  const { t, i18n } = useTranslation();
  return (
    <Providers>
      <RegisterSnackbarProvider />
      <CssBaseline />
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
                <Routes />
              </Container>
            </Scroller>
          </MaintenanceHandler>
        </Router>
      </div>
    </Providers>
  );
}
export default App;
