import React from "react";
import { Location } from "history";
import { Link, NavLink } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Conf, { CONFIGURATIONS } from "../../utils/conf";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

const NAV_ITEMS = [
  ["最近役满", "highlight"],
  ["排行榜", "ranking"],
  ["大数据", "statistics"],
]
  .filter(([, path]) => !(path in Conf.features) || Conf.features[path as keyof typeof Conf.features])
  .map(([label, path]) => ({ label, path }));

const SITE_LINKS = [
  ["四麻玉/王座", CONFIGURATIONS.DEFAULT.canonicalDomain],
  ["四麻金", CONFIGURATIONS.ako.canonicalDomain],
  ["三麻", CONFIGURATIONS.ikeda.canonicalDomain],
].map(([label, domain]) => ({ label, domain, active: Conf.canonicalDomain === domain }));

const LANGUAGES = [
  ["中文", "zh-hans"],
  ["日本語", "ja"],
].map(([label, code]) => ({ label, code }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isActive(match: any, location: Location): boolean {
  if (!match) {
    return false;
  }
  return !NAV_ITEMS.some(({ path }) => location.pathname.startsWith("/" + path));
}

export default function Navbar() {
  const { t, i18n } = useTranslation();
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
          {t(Conf.siteTitle)}
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
              {t("主页")}
            </NavLink>
            {NAV_ITEMS.map(({ label, path }) => (
              <NavLink key={path} className="nav-item nav-link" activeClassName="active" to={`/${path}`}>
                {t(label)}
              </NavLink>
            ))}
            <span className="sep"></span>
            {SITE_LINKS.map(({ label, domain, active }) => (
              <a key={domain} className={clsx("nav-item nav-link", active && "active")} href={`https://${domain}/`}>
                {t(label)}
              </a>
            ))}
            <span className="sep"></span>
            {LANGUAGES.map(({ label, code }) => (
              <button
                key={code}
                className={clsx("nav-item nav-link", i18n.language === code && "active")}
                onClick={(e) => {
                  e.preventDefault();
                  i18n.changeLanguage(code);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
