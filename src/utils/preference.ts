import Conf from "./conf";

export function savePlayerPreference(key: string, id: string, value: unknown) {
  try {
    localStorage.setItem(`${key}${Conf.canonicalDomain}${id}`, JSON.stringify(value));
  } catch (e) {
    // Incognito mode, ignore
  }
}

export function loadPlayerPreference<T>(key: string, id: string, defaultValue: T) {
  try {
    return JSON.parse(localStorage.getItem(`${key}${Conf.canonicalDomain}${id}`) || "") ?? defaultValue;
  } catch (e) {
    return defaultValue;
  }
}
