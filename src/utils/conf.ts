import { GameMode } from "../data/types";
import dayjs from "dayjs";

const domain =
  sessionStorage.getItem("overrideDomain") || localStorage.getItem("overrideDomain") || window.location.hostname;

const DATA_ROOT = "https://ak-data-2.sapk.ch/";

const CONFIGURATIONS = {
  DEFAULT: {
    apiSuffix: process.env.NODE_ENV === "development" ? "api-test/" : "api/",
    features: {
      ranking: true,
      statistics: true,
      estimatedStableLevel: true,
    },
    table: {
      showGameMode: true
    },
    availableModes: [GameMode.王座, GameMode.玉],
    dateMin: dayjs("2019-08-23", "YYYY-MM-DD"),
    siteTitle: "雀魂牌谱屋",
    canonicalDomain: "amae-koromo.sapk.ch"
  },
  ako: {
    apiSuffix: "api/2_9/",
    features: {
      ranking: false,
      statistics: false,
      estimatedStableLevel: false
    },
    table: {
      showGameMode: false
    },
    availableModes: [GameMode.金],
    dateMin: dayjs("2019-11-29", "YYYY-MM-DD"),
    siteTitle: "雀魂牌谱屋·金",
    canonicalDomain: "ako.sapk.ch"
  },
  contest: {
    apiSuffix: (s: string) => `api/contest/${s}/`,
    features: {
      ranking: false,
      statistics: false,
      estimatedStableLevel: false,
    },
    table: {
      showGameMode: true
    },
    availableModes: [],
    canonicalDomain: domain
  }
};

type Configuration = typeof CONFIGURATIONS.DEFAULT & { apiRoot?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeDeep<T extends { [key: string]: any }>(...objects: Partial<T>[]): T {
  const isObject = <T>(obj: T) => obj && typeof obj === "object";

  return objects.reduce((prev: T, obj: Partial<T>) => {
    Object.keys(obj).forEach((key: keyof T) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prev[key] = oVal as any;
      } else if (isObject(pVal) && isObject(oVal)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prev[key] = mergeDeep(pVal, oVal as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prev[key] = oVal as any;
      }
    });

    return prev;
  }, {} as T) as T;
}

const ConfBase: Partial<Configuration> = (() => {
  if (/^ako\./.test(domain)) {
    return CONFIGURATIONS.ako;
  }
  const m = /^([^.]+)\.contest\./.exec(domain);
  if (m) {
    return { ...CONFIGURATIONS.contest, apiSuffix: CONFIGURATIONS.contest.apiSuffix(m[1]) };
  }
  return CONFIGURATIONS.DEFAULT;
})();

const Conf = mergeDeep<Configuration>(CONFIGURATIONS.DEFAULT, ConfBase, {
  apiRoot: DATA_ROOT + ConfBase.apiSuffix
});

export default Conf;
