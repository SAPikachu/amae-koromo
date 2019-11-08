import { API_ROOT } from "./constants";

let onMaintenance: (msg: string) => void = () => {};

export function setMaintenanceHandler(handler: (msg: string) => void) {
  onMaintenance = handler;
}

export async function apiGet<T>(path: string) {
  const resp = await fetch(API_ROOT + path);
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
