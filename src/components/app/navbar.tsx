import React from "react";
import { Location } from "history";
import { Link, NavLink } from "react-router-dom";
import { TITLE_PREFIX } from "../../utils/constants";
import { useState } from "react";

function isActive(match: any, location: Location): boolean {
  if (!match) {
    return false;
  }
  return !location.pathname.startsWith("/ranking");
}

export default function Navbar() {
  const [mobileVisible, setMobileVisible] = useState(false);
  return (
    <nav className="navbar navbar-expand-lg navbar-light">
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
          className={`collapse navbar-collapse justify-content-end ${mobileVisible ? "" : "d-md-none"}`}
          id="navbarNavAltMarkup"
        >
          <div className="navbar-nav">
            <NavLink className="nav-item nav-link" activeClassName="active" to="/" isActive={isActive}>
              主页
            </NavLink>
            <NavLink className="nav-item nav-link" activeClassName="active" to="/ranking">
              排行榜
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
