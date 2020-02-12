import Conf from "../../utils/conf";

let onMaintenance: (msg: string) => void = () => {};

export function setMaintenanceHandler(handler: (msg: string) => void) {
  onMaintenance = handler;
}

export async function apiGet<T>(path: string) {
  const resp = await fetch(Conf.apiRoot + path);
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
