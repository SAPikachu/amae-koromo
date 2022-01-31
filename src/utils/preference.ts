import Conf from "./conf";

export function savePlayerPreference(key: string, id: string, value: unknown) {
  try {
    localStorage.setItem(`${key}${Conf.canonicalDomain}${id}`, JSON.stringify(value));
  } catch (e) {
    // Incognito mode, ignore
  }
}

export function loadPlayerPreference<T>(key: string, id: string, defaultValue: T): T {
  try {
    return JSON.parse(localStorage.getItem(`${key}${Conf.canonicalDomain}${id}`) || "") ?? defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function loadPreference<T>(key: string, defaultValue: T): T {
  return loadPlayerPreference(key, "GLOBAL", defaultValue);
}

export function savePreference(key: string, value: unknown) {
  savePlayerPreference(key, "GLOBAL", value);
}
