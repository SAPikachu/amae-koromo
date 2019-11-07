import dayjs from "dayjs";

export const DATA_ROOT = "https://ak-data-2.sapk.ch/";
const API_ROOT_PROD = `${DATA_ROOT}api/`;
const API_ROOT_TEST = `${DATA_ROOT}api-test/`;
export const API_ROOT = process.env.NODE_ENV === "development" ? API_ROOT_TEST : API_ROOT_PROD;
export const TITLE_PREFIX = "雀魂牌谱屋";
export const DATE_MIN = dayjs("2019-08-23", "YYYY-MM-DD");
export const CANONICAL_DOMAIN = "amae-koromo.sapk.ch";
