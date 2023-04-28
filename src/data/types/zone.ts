export enum AccountZone {
  China = 1,
  Japan = 2,
  International = 3,
  Unknown = -1,
}

export function getZoneFromLocale(locale: string): AccountZone {
  if (/^ja/i.test(locale)) {
    return AccountZone.Japan;
  }
  if (/^zh/i.test(locale)) {
    return AccountZone.China;
  }
  return AccountZone.International;
}

export function getAccountZone(accountId: number): AccountZone {
  if (!accountId) {
    return AccountZone.Unknown;
  }
  const prefix = accountId >> 23;
  if (prefix >= 0 && prefix <= 6) {
    return AccountZone.China;
  }
  if (prefix >= 7 && prefix <= 12) {
    return AccountZone.Japan;
  }
  if (prefix >= 13 && prefix <= 15) {
    return AccountZone.International;
  }
  return AccountZone.Unknown;
}

export function getZoneTag(zone: AccountZone): string {
  switch (zone) {
    case AccountZone.China:
      return "Ⓒ";
    case AccountZone.Japan:
      return "Ⓙ";
    case AccountZone.International:
      return "Ⓔ";
    default:
      return "";
  }
}

export function getAccountZoneTag(accountId: number): string {
  return getZoneTag(getAccountZone(accountId));
}
