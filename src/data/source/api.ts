/* eslint-disable @typescript-eslint/no-empty-function */
import Conf from "../../utils/conf";

const DATA_MIRRORS = ["https://ak-data-2.sapk.ch/", "https://ak-data-1.sapk.ch/", "https://ak-data-3.sapk.ch/"];
const PROBE_TIMEOUT = 15000;

let selectedMirror = localStorage.getItem("selectedMirror") || DATA_MIRRORS[0];

let onMaintenance: (msg: string) => void = () => {};

export function setMaintenanceHandler(handler: (msg: string) => void) {
  onMaintenance = handler;
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = 5000): Promise<Response> {
  const abortController = window.AbortController ? new AbortController() : { signal: undefined, abort: () => {} };
  return Promise.race([
    fetch(url, { ...opts, signal: abortController.signal }),
    new Promise((_, reject) =>
      setTimeout(function () {
        abortController.abort();
        reject(new Error("Timeout"));
      }, timeout)
    ),
  ]) as Promise<Response>;
}

async function fetchData(path: string): Promise<Response> {
  try {
    return await fetchWithTimeout(selectedMirror + path);
  } catch (e) {
    console.warn(e);
    console.warn(`Failed to fetch data from mirror ${selectedMirror}, trying other mirror...`);
  }

  let done = false;
  return Promise.race(
    DATA_MIRRORS.map((mirror) =>
      fetchWithTimeout(mirror + path, {}, PROBE_TIMEOUT)
        .then(function (resp) {
          if (done) {
            return resp;
          }
          done = true;
          selectedMirror = mirror;
          localStorage.setItem("selectedMirror", selectedMirror);
          console.log(`Set ${mirror} as preferred`);
          return resp;
        })
        .catch((e) => new Promise((_, reject) => setTimeout(() => reject(e), PROBE_TIMEOUT)))
    )
  ) as Promise<Response>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const resp = await fetchData(Conf.apiSuffix + path);
  if (!resp.ok) {
    throw resp;
  }
  const data = await resp.json();
  if (data.maintenance) {
    onMaintenance(data.maintenance);
    return new Promise(() => {}) as Promise<T>; // Freeze all other components
  }
  return data as T;
}
