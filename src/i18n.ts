import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resources from "./translations.json";
import { triggerRelayout } from "./utils";

const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  sessionStorage.removeItem("__i18nMissingKeys");
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.defaultLanguage || "zh-hans",
    lowerCaseLng: true,
    fallbackLng: false,
    defaultNS: "default",
    debug: DEBUG,

    returnEmptyString: false,
    returnNull: false,

    saveMissing: DEBUG,
    missingKeyHandler: DEBUG
      ? function(lng, ns, key) {
          const missingKeys = JSON.parse(sessionStorage.getItem("__i18nMissingKeys") || "{}") || {};
          for (const l of lng) {
            if (l === "zh-hans") {
              continue;
            }
            missingKeys[l] = missingKeys[l] || {};
            missingKeys[l][ns] = missingKeys[l][ns] || {};
            missingKeys[l][ns][key] = "";
          }
          sessionStorage.setItem("__i18nMissingKeys", JSON.stringify(missingKeys));
        }
      : false,

    nsSeparator: false,
    keySeparator: false,

    interpolation: {
      escapeValue: false
    }
  });

i18n.on("languageChanged", function(lng) {
  localStorage.setItem("defaultLanguage", lng);
  triggerRelayout();
});

export default i18n;
