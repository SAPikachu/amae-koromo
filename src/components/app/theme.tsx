import React, { ReactNode } from "react";
import { createTheme, ThemeOptions, ThemeProvider as MaterialThemeProvider } from "@mui/material";
import { Link, LinkProps } from "react-router-dom";
import { deepmerge } from "@mui/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkBehavior = React.forwardRef<any, Omit<LinkProps, "to"> & { href: LinkProps["to"] }>((props, ref) => {
  const { href, ...other } = props;
  if (!href) {
    return <span ref={ref} {...other} />;
  }
  if (typeof href === "string" && /^https?:\/\//i.test(href)) {
    return <a ref={ref} href={href} {...other} />;
  }
  return <Link ref={ref} to={href} {...other} />;
});

const theme = createTheme({
  palette: {
    primary: {
      light: "#ffffff",
      main: "#f8f0ed",
      dark: "#c5bebb",
      contrastText: "#000",
    },
    secondary: {
      light: "#ffffb0",
      main: "#ffcc80",
      dark: "#ca9b52",
      contrastText: "#000",
    },
    action: {
      selectedOpacity: 0.7,
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    MuiListItemButton: {
      defaultProps: {
        component: LinkBehavior,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
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
  },
});

export function OverrideTheme({ theme, children }: { theme: ThemeOptions; children: ReactNode }) {
  return <MaterialThemeProvider theme={(outerTheme) => deepmerge(outerTheme, theme)}>{children}</MaterialThemeProvider>;
}
export default function RootThemeProvider({ children }: { children: ReactNode }) {
  return <MaterialThemeProvider theme={theme}>{children}</MaterialThemeProvider>;
}
