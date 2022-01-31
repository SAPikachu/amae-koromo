import React, { ReactElement, ReactNode } from "react";
import { Button, Menu, MenuItemProps, ButtonProps } from "@mui/material";

export function MenuButton({
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
