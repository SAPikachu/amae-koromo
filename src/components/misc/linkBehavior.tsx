import React from "react";
import { Link, LinkProps } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LinkBehavior = React.forwardRef<any, Omit<LinkProps, "to"> & { href: LinkProps["to"]; }>((props, ref) => {
  const { href, ...other } = props;
  if (!href) {
    return <span ref={ref} {...other} />;
  }
  if (typeof href === "string" && /^https?:\/\//i.test(href)) {
    return <a ref={ref} href={href} {...other} />;
  }
  return <Link ref={ref} to={href} {...other} />;
});
