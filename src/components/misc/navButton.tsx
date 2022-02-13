/* eslint-disable @typescript-eslint/indent */
import { Button, ButtonProps } from "@mui/material";
import { NavLink, NavLinkProps } from "react-router-dom";

const InnerButton = ({
  navigate,
  href,
  activeProps,
  children,
  ...props
}: ButtonProps<"a"> & { navigate: () => void; activeProps?: ButtonProps<"a"> }) => {
  return (
    <Button
      LinkComponent="a"
      href={href || "#"}
      onClick={(e) => {
        e.preventDefault();
        navigate();
      }}
      {...props}
      {...(activeProps && props["aria-current"] ? activeProps : {})}
    >
      {children}
    </Button>
  );
};

const NavButton = ({
  href,
  children,
  ...props
}: Omit<ButtonProps<"a">, "href"> &
  Omit<NavLinkProps, "to" | "href"> & { href: NavLinkProps["to"]; activeProps?: ButtonProps<"a"> }) => (
  <NavLink component={InnerButton} to={href} activeClassName="active" {...props}>
    {children}
  </NavLink>
);

export default NavButton;
