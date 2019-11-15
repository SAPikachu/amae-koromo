import React from "react";
import { Location } from "history";
import { Link, NavLink } from "react-router-dom";
import { TITLE_PREFIX } from "../../utils/constants";
import { useState, useEffect, useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isActive(match: any, location: Location): boolean {
  if (!match) {
    return false;
  }
  return !location.pathname.startsWith("/ranking") && !location.pathname.startsWith("/statistics");
}

export default function Navbar() {
  const [mobileVisible, setMobileVisible] = useState(false);
  const onToggleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setMobileVisible(!mobileVisible);
    },
    [mobileVisible, setMobileVisible]
  );
  useEffect(() => {
    if (!mobileVisible) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains("navbar-toggler")) {
        return;
      }
      setMobileVisible(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [mobileVisible, setMobileVisible]);
  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          {TITLE_PREFIX}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={onToggleButtonClick}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`collapse navbar-collapse justify-content-end ${mobileVisible ? "" : "d-none"} d-lg-block`}
          id="navbarNavAltMarkup"
        >
          <div className="navbar-nav">
            <NavLink className="nav-item nav-link" activeClassName="active" to="/" isActive={isActive}>
              主页
            </NavLink>
            <NavLink className="nav-item nav-link" activeClassName="active" to="/ranking">
              排行榜
            </NavLink>
            <NavLink className="nav-item nav-link" activeClassName="active" to="/statistics">
              大数据
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
