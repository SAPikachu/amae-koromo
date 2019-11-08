export const DATA_ROOT = "https://ak-data-2.sapk.ch/";
const API_ROOT_PROD = `${DATA_ROOT}api/`;
const API_ROOT_TEST = `${DATA_ROOT}api-test/`;
export const API_ROOT = process.env.NODE_ENV === "development" ? API_ROOT_TEST : API_ROOT_PROD;
