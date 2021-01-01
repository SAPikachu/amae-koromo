export enum AccountZone {
  China = 1,
  Japan = 2,
  International = 3,
  Unknown = -1,
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

export function getAccountZoneTag(accountId: number): string {
  switch (getAccountZone(accountId)) {
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
