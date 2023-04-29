import dayjs from "dayjs";

import { GameMode } from "./gameMode";
import { getRankLabelByIndex } from "./utils";
import Conf from "../../utils/conf";

import i18n from "../../i18n";
import { FanStatEntryList } from "./metadata";
import { getApiPrefix } from "../source/api";
import { getZoneFromLocale } from "./zone";

export interface PlayerRecord {
  accountId: number;
  nickname: string;
  level: number;
  score: number;
  gradingScore?: number;
}
export interface GameRecord {
  _id?: string;
  _masked?: boolean;
  modeId: GameMode;
  uuid: string;
  startTime: number;
  endTime: number;
  players: PlayerRecord[];
}
export type HighlightEvent = {
  type: "役满";
  fan: FanStatEntryList;
  player: number;
};
export type GameRecordWithEvent = GameRecord & {
  event: HighlightEvent;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GameRecord = Object.freeze({
  getRankIndexByPlayer(rec: GameRecord, player: number | string | PlayerRecord): number {
    const playerId = (typeof player === "object" ? player.accountId : player).toString();
    const sortedPlayers = rec.players.map((player, index) => ({ player, index }));
    sortedPlayers.sort((a, b) => 5 - b.index + b.player.score - (5 - a.index + a.player.score));
    for (let i = 0; i < sortedPlayers.length; i++) {
      if (sortedPlayers[i].player.accountId.toString() === playerId) {
        return i;
      }
    }
    return -1;
  },
  getPlayerRankLabel(rec: GameRecord, player: number | string | PlayerRecord): string {
    return getRankLabelByIndex(GameRecord.getRankIndexByPlayer(rec, player)) || "";
  },
  getPlayerRankColor(rec: GameRecord, player: number | string | PlayerRecord): string {
    return Conf.rankColors[GameRecord.getRankIndexByPlayer(rec, player)];
  },
  encodeAccountId: (t: number) => 1358437 + ((7 * t + 1117113) ^ 86216345),
  getStartTime: (rec: GameRecord | number) => (typeof rec === "number" ? rec : rec.startTime) * 1000,
  formatFullStartTime: (rec: GameRecord | number) => dayjs(GameRecord.getStartTime(rec)).format("YYYY/M/D HH:mm"),
  formatStartDate: (rec: GameRecord | number) => dayjs(GameRecord.getStartTime(rec)).format("M/D"),
  getRecordLink(rec: GameRecord | string, player?: PlayerRecord | number | string) {
    const playerId = typeof player === "object" ? player.accountId : player;
    const trailer = playerId
      ? `_a${GameRecord.encodeAccountId(typeof playerId === "number" ? playerId : parseInt(playerId))}`
      : "";
    const uuid = typeof rec === "string" ? rec : rec.uuid;
    return `${i18n.t("https://game.maj-soul.com/1/")}?paipu=${uuid}${trailer}`;
  },
  getMaskedRecordLink(rec: GameRecord, player?: PlayerRecord | number | string) {
    if (!Conf.maskedGameLink) {
      return GameRecord.getRecordLink(rec, player);
    }
    const playerId = typeof player === "object" ? player.accountId : player;
    const trailer = playerId
      ? `/${GameRecord.encodeAccountId(typeof playerId === "number" ? playerId : parseInt(playerId))}`
      : "";
    return `${getApiPrefix()}view_game/${getZoneFromLocale(i18n.language)}/${rec.modeId}/${rec._id}${trailer}`;
  },
});
