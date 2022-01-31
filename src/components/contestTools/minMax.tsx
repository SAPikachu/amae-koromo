import { useState, useCallback } from "react";
import { DatePicker } from "../form";
import Conf from "../../utils/conf";
import Loading from "../misc/loading";
import dayjs from "dayjs";
import { ListingDataLoader } from "../../data/source/records/loader";
import { GameRecord, PlayerRecord } from "../../data/types";
import { generatePlayerPathById } from "../gameRecords/routeUtils";

export default function MinMax() {
  const [dateStart, setDateStart] = useState(() => dayjs());
  const [dateEnd, setDateEnd] = useState(() => dayjs());
  const [loading, setLoading] = useState(false);
  const [playerList, setPlayerList] = useState(
    [] as {
      id: string;
      minGame: GameRecord;
      maxGame: GameRecord;
      minGamePlayer: PlayerRecord;
      maxGamePlayer: PlayerRecord;
      numGames: number;
      totalPoints: number;
    }[]
  );
  const search = useCallback(async () => {
    setLoading(true);
    let cur = dateStart.startOf("day");
    const end = dateEnd.endOf("day");
    const players = {} as {
      [key: string]: typeof playerList[0];
    };
    while (cur.isBefore(end)) {
      const loader = new ListingDataLoader(cur, null);
      for (;;) {
        const records = await loader.getNextChunk();
        if (!records.length) {
          break;
        }
        for (const rec of records) {
          for (const player of rec.players) {
            const id = player.accountId.toString();
            if (!(id in players)) {
              players[id] = {
                id,
                minGame: rec,
                maxGame: rec,
                minGamePlayer: player,
                maxGamePlayer: player,
                numGames: 1,
                totalPoints: player.score,
              };
              continue;
            }
            const info = players[id];
            info.numGames++;
            info.totalPoints += player.score;
            if (player.score > info.maxGamePlayer.score) {
              info.maxGame = rec;
              info.maxGamePlayer = player;
            }
            if (player.score < info.minGamePlayer.score) {
              info.minGame = rec;
              info.minGamePlayer = player;
            }
          }
        }
      }
      cur = cur.add(1, "day");
    }
    setPlayerList(Object.values(players));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading, dateStart, dateEnd, setPlayerList, playerList]);
  return (
    <>
      <DatePicker min={Conf.dateMin} date={dateStart} onChange={setDateStart} />
      <DatePicker min={Conf.dateMin} date={dateEnd} onChange={setDateEnd} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <button type="button" className="btn btn-primary mt-3" onClick={search}>
            查询
          </button>
          {playerList && playerList.length ? (
            <table className="table table-responsive-xl table-striped table-hover mt-3">
              <thead>
                <tr>
                  <th>玩家</th>
                  <th>最低分</th>
                  <th>最低分比赛时间</th>
                  <th>最高分</th>
                  <th>最高分比赛时间</th>
                  <th>平均点数</th>
                </tr>
              </thead>
              <tbody>
                {playerList.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <a href={generatePlayerPathById(player.id)}>{player.maxGamePlayer.nickname}</a>
                    </td>
                    <td>
                      <a href={GameRecord.getRecordLink(player.minGame, player.minGamePlayer)}>
                        {player.minGamePlayer.score}
                      </a>
                    </td>
                    <td>{GameRecord.formatFullStartTime(player.minGame)}</td>
                    <td>
                      <a href={GameRecord.getRecordLink(player.maxGame, player.maxGamePlayer)}>
                        {player.maxGamePlayer.score}
                      </a>
                    </td>
                    <td>{GameRecord.formatFullStartTime(player.maxGame)}</td>
                    <td>{Math.round(player.totalPoints / player.numGames)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </>
      )}
    </>
  );
}
