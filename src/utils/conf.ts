import { GameMode } from "../data/types";
import dayjs from "dayjs";

const domain =
  sessionStorage.getItem("overrideDomain") || localStorage.getItem("overrideDomain") || window.location.hostname;

export const CONFIGURATIONS = {
  DEFAULT: {
    apiSuffix: process.env.NODE_ENV === "development" ? "api-test/" : "api/",
    features: {
      ranking: true,
      statistics: true,
      estimatedStableLevel: true,
      statisticsSubPages: {
        rankBySeat: true,
        dataByRank: true,
        fanStats: true,
      },
    },
    table: {
      showGameMode: true,
    },
    availableModes: [GameMode.王座, GameMode.玉],
    dateMin: dayjs("2019-08-23", "YYYY-MM-DD"),
    siteTitle: "雀魂牌谱屋",
    canonicalDomain: "amae-koromo.sapk.ch",
    showTopNotice: true,
    mirrorUrl: "https://saki.sapk.ch/",
    siteSpecificNotice: "记录包含雀魂四人半庄段位战玉之间及王座之间的牌谱。",
    rootClassName: "koromo",
    rankColors: ["#28a745", "#17a2b8", "#6c757d", "#dc3545"],
  },
  ako: {
    apiSuffix: "api/2_9/",
    features: {
      ranking: false,
      statistics: true,
      estimatedStableLevel: false,
      statisticsSubPages: {
        rankBySeat: true,
        dataByRank: false,
        fanStats: true,
      },
    },
    table: {
      showGameMode: false,
    },
    availableModes: [GameMode.金],
    dateMin: dayjs("2019-11-29", "YYYY-MM-DD"),
    siteTitle: "雀魂牌谱屋·金",
    canonicalDomain: "ako.sapk.ch",
    mirrorUrl: "https://kuro.sapk.ch/",
    siteSpecificNotice: "记录包含雀魂四人半庄段位战金之间的牌谱。",
    rootClassName: "achiga",
  },
  ikeda: {
    apiSuffix: "api/12/",
    features: {
      ranking: false,
      statistics: true,
      estimatedStableLevel: true,
      statisticsSubPages: {
        rankBySeat: true,
        dataByRank: true,
        fanStats: true,
      },
    },
    availableModes: [GameMode.三王座, GameMode.三玉, GameMode.三金],
    dateMin: dayjs("2019-11-29", "YYYY-MM-DD"),
    siteTitle: "雀魂牌谱屋·三麻",
    canonicalDomain: "ikeda.sapk.ch",
    mirrorUrl: "https://momoko.sapk.ch/",
    siteSpecificNotice: "记录包含雀魂三人半庄段位战金之间、玉之间及王座之间的牌谱。",
    rankColors: ["#28a745", "#6c757d", "#dc3545"],
    rootClassName: "yuuki",
  },
  contest: {
    apiSuffix: (s: string) => `api/contest/${s}/`,
    features: {
      ranking: false,
      statistics: true,
      estimatedStableLevel: false,
      statisticsSubPages: {
        rankBySeat: true,
        dataByRank: false,
        fanStats: true,
      },
    },
    table: {
      showGameMode: true,
    },
    availableModes: [],
    canonicalDomain: domain,
    showTopNotice: false,
  },
};

type Configuration = typeof CONFIGURATIONS.DEFAULT;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeDeep<T extends { [key: string]: any }>(...objects: Partial<T>[]): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isObject = <T>(obj: T) => obj && typeof obj === "object" && (obj as any).constructor === Object;

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
  if (/^(ako|kuro)\./i.test(domain)) {
    return CONFIGURATIONS.ako;
  }
  if (/^(ikeda|momoko)\./i.test(domain)) {
    return CONFIGURATIONS.ikeda;
  }
  const m = /^([^.]+)\.contest\./i.exec(domain);
  if (m) {
    return { ...CONFIGURATIONS.contest, apiSuffix: CONFIGURATIONS.contest.apiSuffix(m[1]) };
  }
  return CONFIGURATIONS.DEFAULT;
})();

const Conf = mergeDeep<Configuration>(CONFIGURATIONS.DEFAULT, ConfBase);

document.documentElement.className += " " + Conf.rootClassName;

export default Conf;
