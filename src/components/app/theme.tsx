import { ReactNode, useMemo } from "react";
import {
  alpha,
  createTheme,
  responsiveFontSizes,
  Theme,
  ThemeOptions,
  ThemeProvider as MaterialThemeProvider,
} from "@mui/material";
import { enUS, jaJP, koKR, Localization, zhCN } from "@mui/material/locale";
import { deepmerge } from "@mui/utils";
import { useTranslation } from "react-i18next";
import { LinkBehavior } from "../misc/linkBehavior";

const LOCALES: { [key: string]: Localization } = {
  en: enUS,
  ja: jaJP,
  ko: koKR,
} as const;
const DEFAULT_LOCALE = zhCN;

const FONTS: { [key: string]: string } = {
  en: '"Roboto", "Meiryo", "Microsoft YaHei", sans-serif',
  ja: '"Roboto", "Meiryo", "Microsoft YaHei", sans-serif',
  ko: '"Roboto", "Malgun Gothic", "Meiryo", "Microsoft YaHei", sans-serif',
};
const DEFAULT_FONT = '"Roboto", "Microsoft YaHei", "Meiryo", sans-serif';

const THEME_BASIC: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      light: "#6a4f4b",
      main: "#3e2723",
      dark: "#1b0000",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ffffff",
      main: "#f8f0ed",
      dark: "#004ba0",
      contrastText: "#000",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Microsoft YaHei", "Meiryo", sans-serif',
    fontSize: 16,
  },
};
const THEME_VALUES = createTheme(THEME_BASIC);

const THEME: ThemeOptions = {
  ...THEME_BASIC,
  components: {
    MuiLink: {
      defaultProps: {
        color: "info.main",
        underline: "hover",
        ...({
          component: LinkBehavior,
        } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    },
    MuiListItemButton: {
      defaultProps: {
        ...({
          component: LinkBehavior,
        } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: "normal",
          textTransform: "none",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          padding: 0,
          "& .MuiButton-root": {
            color: "inherit",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(2n+1) .MuiTableCell-root": {
            boxShadow: `inset 0 0 0 9999px ${alpha(THEME_VALUES.palette.primary.dark, 0.05)};`,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          boxShadow: `inset 0 0 0 9999px ${alpha(THEME_VALUES.palette.primary.dark, 0.075)};`,
          "& .MuiTableCell-root": {
            fontWeight: "bold",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: THEME_VALUES.spacing(1.5),
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          "& .MuiTypography-root": {
            fontSize: "1rem",
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 100,
        leaveTouchDelay: 15000,
      },
    },
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
    ...{
      MuiCalendarPicker: {
        styleOverrides: {
          root: {
            "& > div:first-child > [role=presentation] > .PrivatePickersFadeTransitionGroup-root:nth-child(2)": {
              order: -1,
              display: "flex",
              div: {
                margin: 0,
              },
              "&::after": {
                display: "block",
                content: "'-'",
                marginLeft: "0.5rem",
                marginRight: "0.5rem",
              },
            },
          },
        },
      },
    },
  },
};

export function OverrideTheme({ theme, children }: { theme: ThemeOptions; children: ReactNode }) {
  const themeFunc = useMemo(() => (outerTheme: Theme) => deepmerge(outerTheme, theme), [theme]);
  return <MaterialThemeProvider theme={themeFunc}>{children}</MaterialThemeProvider>;
}
export default function RootThemeProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          {
            ...THEME,
            typography: {
              ...THEME.typography,
              fontFamily: FONTS[i18n.language] || DEFAULT_FONT,
              fontWeightMedium: i18n.language === "en" ? 500 : 700,
            },
          },
          LOCALES[i18n.language] || DEFAULT_LOCALE
        ),
        {
          variants: ["h1", "h2", "h3", "h4", "h5", "h6"],
        }
      ),
    [i18n.language]
  );
  return <MaterialThemeProvider theme={theme}>{children}</MaterialThemeProvider>;
}
