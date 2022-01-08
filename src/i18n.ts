import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { triggerRelayout } from "./utils";

const DEBUG = process.env.NODE_ENV === "development" && sessionStorage.i18nDebug;

if (DEBUG) {
  sessionStorage.removeItem("__i18nMissingKeys");
}

i18n
  .use({
    type: "backend",
    read(language: string, namespace: string, callback: (errorValue: unknown, translations: null | unknown) => void) {
      if (language === "zh-hans") {
        return callback(null, {});
      }
      import(`./locales/${language}.json`)
        .then((resources) => {
          resources = resources.default;
          callback(null, { ...resources["default"], ...resources[namespace] });
        })
        .catch((error) => {
          callback(error, null);
        });
    },
  })
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lowerCaseLng: true,
    fallbackLng: "zh-hans",
    defaultNS: "default",
    debug: DEBUG,
    whitelist: ["ja", "zh-hans", "en", "ko"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      checkWhitelist: true,
    },

    returnEmptyString: false,
    returnNull: false,

    saveMissing: DEBUG,
    missingKeyHandler: DEBUG
      ? function (lng, ns, key) {
          const missingKeys = JSON.parse(sessionStorage.getItem("__i18nMissingKeys") || "{}") || {};
          const l = i18n.language;
          if (l === "zh-hans") {
            return;
          }
          missingKeys[l] = missingKeys[l] || {};
          missingKeys[l][ns] = missingKeys[l][ns] || {};
          missingKeys[l][ns][key] = "";
          sessionStorage.setItem("__i18nMissingKeys", JSON.stringify(missingKeys));
        }
      : false,

    nsSeparator: false,
    keySeparator: false,

    interpolation: {
      escapeValue: false,
    },
  });

if ("document" in global) {
  // Fix error in node
  i18n.on("languageChanged", function () {
    document.documentElement.lang = i18n.language;
    triggerRelayout();
  });
}

export default i18n;
