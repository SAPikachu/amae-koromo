import React, { useState, useCallback } from "react";
import { FormRow, DatePicker } from "../form";
import Conf from "../../utils/conf";
import Loading from "../misc/loading";
import dayjs from "dayjs";
import { ListingDataLoader } from "../../data/source/records/loader";
import { GameRecord } from "../../data/types";
import { Player } from "../gameRecords/player";

function Result({ game, title }: { game: GameRecord; title: string }) {
  return (
    <div>
      <h5 className="mb-3">
        {title}：{GameRecord.formatFullStartTime(game)}
      </h5>
      {game.players.map((x) => (
        <p key={x.accountId.toString()}>
          <Player player={x} game={game} isActive={false} />
        </p>
      ))}
    </div>
  );
}

export default function MinMax() {
  const [dateStart, setDateStart] = useState(() => dayjs());
  const [dateEnd, setDateEnd] = useState(() => dayjs());
  const [loading, setLoading] = useState(false);
  const [minGame, setMinGame] = useState(null as GameRecord | null);
  const [maxGame, setMaxGame] = useState(null as GameRecord | null);
  const search = useCallback(async () => {
    setLoading(true);
    let cur = dateStart.startOf("day");
    const end = dateEnd.endOf("day");

    let minScore = +Infinity;
    let maxScore = -Infinity;
    let minGame: GameRecord | null = null;
    let maxGame: GameRecord | null = null;
    while (cur.isBefore(end)) {
      const loader = new ListingDataLoader(cur);
      const metadata = await loader.getMetadata();
      for (let i = 0; i < metadata.count; i += 100) {
        const records = await loader.getRecords(i, 100);
        for (const rec of records) {
          let curMax = -Infinity;
          let curMin = +Infinity;
          for (const player of rec.players) {
            if (player.score > curMax) {
              curMax = player.score;
            }
            if (player.score < curMin) {
              curMin = player.score;
            }
          }
          if (curMax > maxScore) {
            maxScore = curMax;
            maxGame = rec;
          }
          if (curMin < minScore) {
            minScore = curMin;
            minGame = rec;
          }
        }
      }
      cur = cur.add(1, "day");
    }
    setMinGame(minGame);
    setMaxGame(maxGame);
    setLoading(false);
  }, [setLoading, dateStart, dateEnd, setMaxGame, setMinGame]);
  return (
    <>
      <FormRow title="开始日期">
        <DatePicker min={Conf.dateMin} date={dateStart} onChange={setDateStart} className="form-control" />
      </FormRow>
      <FormRow title="结束日期">
        <DatePicker min={Conf.dateMin} date={dateEnd} onChange={setDateEnd} className="form-control" />
      </FormRow>
      {loading ? (
        <Loading />
      ) : (
        <>
          <button type="button" className="btn btn-primary mt-3" onClick={search}>
            查询
          </button>
          <div className="row mt-5">
            <div className="col">{minGame && <Result game={minGame} title="最低点" />}</div>
            <div className="col">{maxGame && <Result game={maxGame} title="最高点" />}</div>
          </div>
        </>
      )}
    </>
  );
}
