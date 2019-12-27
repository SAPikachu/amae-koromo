import React, { useMemo } from "react";
import Helmet from "react-helmet";
import { DataProvider } from "../../data/source/records/provider";
import { DataAdapterProviderCustom } from "../gameRecords/dataAdapterProvider";
import GameRecordTable, {
  COLUMN_GAMEMODE,
  COLUMN_PLAYERS,
  COLUMN_FULLTIME,
  makeColumn,
  Column
} from "../gameRecords/table";
import { GameRecord, FanStatEntryList } from "../../data/types";
import { TableCellProps } from "react-virtualized/dist/es/Table";
import { sum } from "../../utils";

type Event = {
  type: "役满";
  fan: FanStatEntryList;
  player: number;
};
type GameRecordWithEvent = GameRecord & {
  event: Event;
};

function buildEventInfo({ cellData }: TableCellProps) {
  if (!cellData) {
    return null;
  }
  const event = cellData as Event;
  if (!event.fan[0].役满) {
    return (
      <span>
        {sum(event.fan.map(x => x.count))} 番
        <br />
        累计役满
      </span>
    );
  }
  if (event.fan.length === 1) {
    const label = event.fan[0].label;
    if (label.length > 4) {
      return (
        <span>
          {label.slice(0, 4)}
          <br />
          {label.slice(4)}
        </span>
      );
    }
    return label;
  } else if (event.fan.length === 2) {
    return (
      <span>
        {event.fan[0].label}
        <br />
        {event.fan[1].label}
      </span>
    );
  }
  return <span>{FanStatEntryList.formatFanSummary(event.fan)}</span>;
}

const COLUMN_EVENTINFO = makeColumn(() => (
  <Column dataKey="event" label="类型" cellRenderer={buildEventInfo} width={80} />
))();

function getEventPlayerId(rec: GameRecord) {
  return (rec as GameRecordWithEvent).event.player;
}

export default function RecentHighlight() {
  const provider = useMemo(() => DataProvider.createHightlight(), []);
  return (
    <>
      <Helmet title="最近役满" />
      <DataAdapterProviderCustom provider={provider}>
        <GameRecordTable
          withActivePlayer
          alwaysShowDetailLink
          columns={[COLUMN_GAMEMODE, COLUMN_EVENTINFO, COLUMN_PLAYERS(getEventPlayerId), COLUMN_FULLTIME]}
        />
      </DataAdapterProviderCustom>
    </>
  );
}
