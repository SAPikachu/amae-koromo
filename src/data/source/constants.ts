export const DATA_ROOT = "https://ak-data-2.sapk.ch/";
const API_ROOT_PROD = `${DATA_ROOT}api/`;
const API_ROOT_TEST = `${DATA_ROOT}api-test/`;

let API_SUFFIX = "";
if (process.env.NODE_ENV === "development") {
  API_SUFFIX = sessionStorage.getItem("apiSuffix") || "";
} else {
  const m = /^([^.]+)\.contest\./.exec(window.location.hostname);
  if (m) {
    API_SUFFIX = `contest/${m[1]}/`;
  }
}
export const CONTEST_MODE = API_SUFFIX.indexOf("contest/") === 0;
export const API_ROOT =
  (process.env.NODE_ENV === "development" && !CONTEST_MODE ? API_ROOT_TEST : API_ROOT_PROD) + API_SUFFIX;
