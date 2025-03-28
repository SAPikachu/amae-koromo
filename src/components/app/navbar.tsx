import React, { ReactElement, useState } from "react";
import { Location } from "history";
import Conf, { CONFIGURATIONS } from "../../utils/conf";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Button,
  ButtonGroup,
  Container,
  Toolbar,
  MenuItem,
  ButtonProps,
  Box,
  IconButton,
  useScrollTrigger,
  Slide,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  ListItemIcon,
  ListItem,
  ThemeOptions,
} from "@mui/material";
import { ArrowDropDown, Language, GitHub, Twitter, Menu as MenuIcon } from "@mui/icons-material";
import { OverrideTheme } from "./theme";
import clsx from "clsx";
import { NavLink, NavLinkProps } from "react-router-dom";
import NavButton from "../misc/navButton";
import { MenuButton } from "../misc/menuButton";
import StarredPlayerMenu from "../playerDetails/star/starredPlayerMenu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const NAV_ITEMS = [
  ["最近役满", "highlight"],
  ["排行榜", "ranking"],
  ["大数据", "statistics"],
]
  .filter(([, path]) => !(path in Conf.features) || Conf.features[path as keyof typeof Conf.features])
  .map(([label, path]) => ({ label, path }));

const SITE_LINKS = [
  ["四麻", CONFIGURATIONS.DEFAULT.canonicalDomain],
  ["三麻", CONFIGURATIONS.ikeda.canonicalDomain],
].map(([label, domain]) => ({ label, domain, active: Conf.canonicalDomain === domain }));

const LANGUAGES = [
  ["中文", "zh-hans"],
  ["日本語", "ja"],
  ["English", "en"],
  ["한국어", "ko"],
].map(([label, code]) => ({ label, code }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isActive(match: any, location: Location): boolean {
  if (!match) {
    return false;
  }
  return !NAV_ITEMS.some(({ path }) => location.pathname.startsWith("/" + path));
}

function HideOnScroll({ children }: { children: ReactElement }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const MobileNavButton = ({ href, children, ...props }: ButtonProps & Omit<NavLinkProps, "to">) => (
  <ListItem disablePadding>
    <ListItemButton component={NavLink} {...{ to: href, activeClassName: "Mui-selected" }} {...props}>
      <ListItemIcon></ListItemIcon>
      <ListItemText>{children}</ListItemText>
    </ListItemButton>
  </ListItem>
);

function handleSwitchSite(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  if (e.currentTarget.classList.contains("active") || e.currentTarget.classList.contains("Mui-selected")) {
    return;
  }
  const url = new URL(e.currentTarget.href);
  url.pathname = location.pathname;
  window.location.href = url.toString();
}

import { useDarkMode } from "./theme";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
      <Button onClick={toggleDarkMode}>
        {isDarkMode ? "Light" : "Dark"}
      </Button>
  );
}

function DesktopItems() {
  const { t, i18n } = useTranslation();
  return (
    <>
      <ButtonGroup>
        <NavButton href="/" isActive={isActive}>
          {t("主页")}
        </NavButton>
        {NAV_ITEMS.map(({ label, path }) => (
          <NavButton key={path} href={`/${path}`}>
            {t(label)}
          </NavButton>
        ))}
      </ButtonGroup>
      <ButtonGroup>
        {SITE_LINKS.map(({ label, domain, active }) => (
          <Button
            className={clsx(active && "active")}
            key={domain}
            href={`https://${domain}/`}
            onClick={handleSwitchSite}
          >
            {t(label)}
          </Button>
        ))}
      </ButtonGroup>
      <MenuButton
        startIcon={<Language />}
        endIcon={<ArrowDropDown />}
        label={LANGUAGES.find((x) => x.code === i18n.language)?.label}
      >
        {LANGUAGES.map(({ label, code }) => (
          <MenuItem key={code} onClick={() => i18n.changeLanguage(code)} selected={code === i18n.language}>
            {label}
          </MenuItem>
        ))}
      </MenuButton>
      <IconButton href="https://twitter.com/AmaeKoromo_MajS">
        <Twitter />
      </IconButton>
      <IconButton href="https://github.com/SAPikachu/amae-koromo">
        <GitHub />
      </IconButton>
      <DarkModeToggle />
    </>
  );
}

function DarkModeListItem() {
  const { t } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
      <ListItem disablePadding>
        <ListItemButton onClick={toggleDarkMode}>
          <ListItemIcon>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText
              primary={t(isDarkMode ? "亮色模式" : "暗色模式")}
          />
        </ListItemButton>
      </ListItem>
  );
}

function MobileItems() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box width={250} onClick={() => setOpen(false)}>
          <List>
            <MobileNavButton href="/" isActive={isActive}>
              {t("主页")}
            </MobileNavButton>
            {NAV_ITEMS.map(({ label, path }) => (
              <MobileNavButton key={path} href={`/${path}`}>
                {t(label)}
              </MobileNavButton>
            ))}
          </List>
          <Divider />
          <List>
            {SITE_LINKS.map(({ label, domain, active }) => (
              <ListItem disablePadding key={domain}>
                <ListItemButton selected={active} href={`https://${domain}/`} onClick={handleSwitchSite}>
                  <ListItemIcon></ListItemIcon>
                  <ListItemText>{t(label)}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {LANGUAGES.map(({ label, code }) => (
              <ListItem disablePadding key={code}>
                <ListItemButton onClick={() => i18n.changeLanguage(code)} selected={code === i18n.language}>
                  <ListItemIcon></ListItemIcon>
                  <ListItemText>{label}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton href="https://twitter.com/AmaeKoromo_MajS">
                <ListItemIcon>
                  <Twitter />
                </ListItemIcon>
                <ListItemText>{t("Twitter")}</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="https://github.com/SAPikachu/amae-koromo">
                <ListItemIcon>
                  <GitHub />
                </ListItemIcon>
                <ListItemText>{t("GitHub")}</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <DarkModeListItem />
          </List>
        </Box>
      </Drawer>
    </>
  );
}

const NAVBAR_THEME: ThemeOptions = {
  components: {
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiButton: {
      defaultProps: {
        sx: {
          transition: (theme) => theme.transitions.create("opacity"),
        },
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: "text",
        sx: {
          mr: 2,
        },
      },
      styleOverrides: {
        grouped: {
          opacity: 0.5,
          "&:hover, &.active": {
            opacity: 1,
          },
          "&:not(:last-of-type)": {
            borderColor: "transparent",
          },
        },
      },
    },
  },
} as const;
export default function Navbar() {
  const { t } = useTranslation();
  return (
    <OverrideTheme theme={NAVBAR_THEME}>
      <HideOnScroll>
        <AppBar position="fixed">
          <Toolbar variant="dense">
            <Container>
              <Box display="flex" alignItems="center">
                <Button
                  href="/"
                  size="large"
                  variant="text"
                  sx={{
                    padding: 0,
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  disableRipple
                >
                  {t(Conf.siteTitle)}
                </Button>
                <Box flexGrow={1}></Box>
                <Box display={["none", null, "flex"]} alignItems="center">
                  <DesktopItems />
                </Box>
                <StarredPlayerMenu />
                <Box display={["block", null, "none"]}>
                  <MobileItems />
                </Box>
              </Box>
            </Container>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </OverrideTheme>
  );
}
