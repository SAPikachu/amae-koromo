import React from "react";
import { Location } from "history";
import { Link, NavLink } from "react-router-dom";
import { TITLE_PREFIX } from "../../utils/constants";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isActive(match: any, location: Location): boolean {
  if (!match) {
    return false;
  }
  return !location.pathname.startsWith("/ranking") && !location.pathname.startsWith("/statistics");
}

export default function Navbar() {
  const [mobileVisible, setMobileVisible] = useState(false);
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
          onClick={() => setMobileVisible(!mobileVisible)}
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
