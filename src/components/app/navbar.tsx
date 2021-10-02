import React, { ReactElement, ReactNode, useState } from "react";
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
  Menu,
  MenuItemProps,
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
import { ArrowDropDown, Language, Twitter, Menu as MenuIcon } from "@mui/icons-material";
import { OverrideTheme } from "./theme";
import clsx from "clsx";
import { NavLink, NavLinkProps } from "react-router-dom";
import NavButton from "../misc/navButton";

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

function HideOnScroll({ children }: { children: ReactElement | undefined }) {
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

function MenuButton({
  label,
  children,
  ...props
}: {
  label: ReactNode;
  children: ReactElement<MenuItemProps>[];
} & ButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleItemClick = (item: ReactElement<MenuItemProps>) => {
    const onClick = item.props.onClick;
    if (!onClick) {
      return handleClose;
    }
    return (e: React.MouseEvent<HTMLLIElement>) => {
      handleClose();
      onClick(e);
    };
  };
  return (
    <>
      <Button {...props} onClick={handleClick}>
        {label}
      </Button>
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        disableScrollLock
      >
        {React.Children.map(children, (x) => React.cloneElement(x, { onClick: handleItemClick(x) }))}
      </Menu>
    </>
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
          <Button className={clsx(active && "active")} key={domain} href={`https://${domain}/`}>
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
    </>
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
                <ListItemButton selected={active} href={`https://${domain}/`}>
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
                <Button href="/" size="large" variant="text" sx={{ padding: 0 }} disableRipple>
                  {t(Conf.siteTitle)}
                </Button>
                <Box flexGrow={1}></Box>
                <Box display={["none", null, "flex"]} alignItems="center">
                  <DesktopItems />
                </Box>
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
